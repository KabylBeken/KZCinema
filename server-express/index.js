const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const NodeCache = require('node-cache');
const connectDB = require('./config/db');
const fs = require('fs');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// Генерация уникального ID сервера для отслеживания в логах
const serverId = `Backend-${Math.floor(Math.random() * 1000)}`;
console.log(`Starting server with ID: ${serverId}`);

// Создаем экземпляр кэша с настройками
// stdTTL: время жизни кэша в секундах (по умолчанию 0 - без истечения срока)
// checkperiod: как часто проверять истекшие ключи (в секундах)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Подключение к MongoDB
connectDB();

// Импорт моделей
const User = require('./models/User');
const Category = require('./models/Category');
const Movie = require('./models/Movie');
const FavoriteMovie = require('./models/FavoriteMovie');

const app = express();
const secretKey = "Frontend-final-Project";

// Создаем директорию для загрузок, если она не существует
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Middleware для логирования запросов с ID сервера
app.use((req, res, next) => {
  console.log(`[${serverId}] ${req.method} ${req.path}`);
  next();
});

// Middleware для кэширования
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Для GET-запросов используем кэширование
        if (req.method !== 'GET') {
            return next();
        }

        // Создаем ключ кэша на основе URL и параметров запроса
        const cacheKey = `__express__${req.originalUrl || req.url}`;
        
        // Проверяем, есть ли данные в кэше
        const cachedBody = cache.get(cacheKey);
        
        if (cachedBody) {
            console.log(`[${serverId}] Cache HIT for ${cacheKey}`);
            // Устанавливаем заголовок, указывающий, что ответ из кэша
            res.setHeader('X-Cache', 'HIT');
            return res.send(cachedBody);
        } else {
            console.log(`[${serverId}] Cache MISS for ${cacheKey}`);
            res.setHeader('X-Cache', 'MISS');
            
            // Сохраняем оригинальный метод send
            const originalSend = res.send;
            
            // Переопределяем метод send
            res.send = function(body) {
                // Кэшируем ответ перед отправкой клиенту
                cache.set(cacheKey, body, duration);
                
                // Вызываем оригинальный метод send
                return originalSend.call(this, body);
            };
            
            next();
        }
    };
};

// Функция для сброса кэша при изменении данных
const clearCache = (pattern) => {
    const keys = cache.keys();
    const matchingKeys = pattern 
        ? keys.filter(key => key.includes(pattern))
        : keys;
    
    if (matchingKeys.length > 0) {
        console.log(`[${serverId}] Clearing cache keys: ${matchingKeys.join(', ')}`);
        matchingKeys.forEach(key => cache.del(key));
    }
};

// Получение всех категорий с кэшированием на 5 минут (300 секунд)
app.get('/categories', cacheMiddleware(300), async (req, res) => {
    try {
        const categories = await Category.find({});
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение всех пользователей с кэшированием на 5 минут
app.get('/users', cacheMiddleware(300), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение всех фильмов с кэшированием на 2 минуты
app.get('/movies', cacheMiddleware(120), async (req, res) => {
    try {
        const movies = await Movie.find({}).populate('user', 'username').populate('category', 'name');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Регистрация пользователя
app.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Enter your username!" });
    }
    if (!email) {
        return res.status(400).json({ message: "Enter your email!" });
    }
    if (!password) {
        return res.status(400).json({ message: "Enter your password!" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long!" });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: "A user with this email address is already registered!" });
        }

        const newUser = await User.create({
            email,
            password,
            username,
            role: 'user'
        });

        // Сбрасываем кэш пользователей при создании нового пользователя
        clearCache('/users');

        return res.status(201).json({ 
            message: `User ${username} has been registered`, 
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Авторизация пользователя
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Enter your email!" });
    }
    if (!password) {
        return res.status(400).json({ message: "Enter your password!" });
    }

    try {
        const user = await User.findOne({ email, password });

        if (user) {
            const token = jwt.sign({ userId: user._id, role: user.role }, secretKey, { expiresIn: 60 * 10 });
            res.json({
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                token: token
            });
        } else {
            res.status(401).json({ message: 'Wrong email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Проверка авторизации
const checkToken = async (req, res, next) => {
    const authValue = req.headers["authorization"];
    const token = authValue && authValue.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Token not found " });
        return;
    }

    jwt.verify(token, secretKey, (err, value) => {
        if (err) {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        else {
            req.userId = value.userId;
            req.userRole = value.role;
            next();
        }
    });
};

// Получение фильмов пользователя
app.get('/privateMovies', checkToken, async (req, res) => {
    try {
        const userId = req.userId;
        const movies = await Movie.find({ user: userId })
            .populate('user', 'username')
            .populate('category', 'name');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создание фильма
app.post('/movies/create', checkToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.userId;
        const { title, price, content, categoryId } = req.body;
        const photo = req.file ? `/uploads/${req.file.filename}` : null;
        
        const newMovie = await Movie.create({
            title,
            price,
            content,
            photo,
            user: userId,
            category: categoryId
        });
        
        // Сбрасываем кэш фильмов при создании нового фильма
        clearCache('/movies');
        
        res.json({ message: `Movie ${title} was created...`, movie: newMovie });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение фильма по ID с кэшированием на 5 минут
app.get('/movies/:movieId', cacheMiddleware(300), async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const movie = await Movie.findById(movieId)
            .populate('user', 'username')
            .populate('category', 'name');
            
        if (movie) {
            res.json(movie);
        } else {
            res.status(404).json({ error: `Movie with id = ${movieId} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удаление фильма
app.delete('/movies/delete/:movieId', checkToken, async (req, res) => {
    try {
        const userId = req.userId;
        const movieId = req.params.movieId;

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({ error: `Movie with id = ${movieId} not found` });
        }

        // Проверка прав на удаление
        if (movie.user.toString() !== userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: `You can not delete this movie` });
        }

        const movieTitle = movie.title;
        
        // Удаление файла изображения если он существует
        if (movie.photo) {
            const photoPath = path.join(__dirname, 'public', movie.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        
        await Movie.findByIdAndDelete(movieId);
        
        // Сбрасываем кэш фильмов и фильма с конкретным ID при удалении
        clearCache('/movies');
        clearCache(`/movies/${movieId}`);
        
        res.json({ message: `Movie ${movieTitle} was removed` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Редактирование фильма
app.put('/movies/:movieId/edit', checkToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.userId;
        const movieId = req.params.movieId;
        const { title, price, content, categoryId } = req.body;
        
        const movie = await Movie.findById(movieId);
        
        if (!movie) {
            return res.status(404).json({ error: `Movie not found` });
        }
        
        // Проверка прав на редактирование
        if (movie.user.toString() !== userId && req.userRole !== 'admin') {
            return res.status(403).json({ error: `You can not update this movie` });
        }
        
        let photoPath = movie.photo;
        
        // Если загружается новое изображение
        if (req.file) {
            // Удаление старого изображения
            if (movie.photo) {
                const oldPhotoPath = path.join(__dirname, 'public', movie.photo);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
            photoPath = `/uploads/${req.file.filename}`;
        }
        
        const updatedMovie = await Movie.findByIdAndUpdate(
            movieId,
            {
                title,
                price,
                content,
                category: categoryId,
                photo: photoPath
            },
            { new: true }
        );
        
        // Сбрасываем кэш фильмов и конкретного фильма при редактировании
        clearCache('/movies');
        clearCache(`/movies/${movieId}`);
        
        res.json({ message: `Movie ${title} was edited`, movie: updatedMovie });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение фильмов по категории с кэшированием на 2 минуты
app.get('/movies/category/:categoryId', cacheMiddleware(120), async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const movies = await Movie.find({ category: categoryId })
            .populate('user', 'username')
            .populate('category', 'name');
        res.json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Создание категории
app.post('/categories/create', checkToken, async (req, res) => {
    try {
        const { name } = req.body;
        
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: "Only admins can create categories" });
        }
        
        const newCategory = await Category.create({ name });
        
        // Сбрасываем кэш категорий при создании новой категории
        clearCache('/categories');
        
        res.json({ message: `Category ${name} was created...`, category: newCategory });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удаление категории
app.delete('/categories/delete/:categoryId', checkToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: "Only admins can delete categories" });
        }
        
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        
        if (!category) {
            return res.status(404).json({ error: `Category with id = ${categoryId} not found` });
        }
        
        const categoryName = category.name;
        await Category.findByIdAndDelete(categoryId);
        
        // Сбрасываем кэш категорий при удалении категории
        clearCache('/categories');
        
        res.json({ message: `Category ${categoryName} was removed` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение категории по ID с кэшированием на 5 минут
app.get('/categories/:categoryId', cacheMiddleware(300), async (req, res) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId);
        
        if (category) {
            res.json(category);
        } else {
            res.status(404).json({ error: `Category with id = ${categoryId} not found` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Редактирование категории
app.put('/categories/:categoryId/edit', checkToken, async (req, res) => {
    try {
        if (req.userRole !== 'admin') {
            return res.status(403).json({ error: "Only admins can edit categories" });
        }
        
        const categoryId = req.params.categoryId;
        const { name } = req.body;
        
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { name },
            { new: true }
        );
        
        if (updatedCategory) {
            // Сбрасываем кэш категорий при редактировании категории
            clearCache('/categories');
            res.json({ message: `Category ${name} was edited`, category: updatedCategory });
        } else {
            res.status(404).json({ error: `Category not found` });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// АДМИН
// Получение всех пользователей (админ)
app.get('/admin/users', checkToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            const users = await User.find({}).select('-password');
            res.json(users);
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Редактирование пользователя (админ)
app.put('/admin/users/:userId/edit', checkToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            const userId = req.params.userId;
            const { email, password, username, role } = req.body;
            
            const updateData = { email, username, role };
            
            // Если пароль указан
            if (password && password.trim() !== '') {
                // Временно убираем хеширование пароля
                updateData.password = password;
                
                /* Закомментируем код с bcrypt
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updateData.password = hashedPassword;
                */
            }
            
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true }
            ).select('-password');
            
            if (updatedUser) {
                // Сбрасываем кэш пользователей при редактировании пользователя
                clearCache('/users');
                res.json({ message: `User ${username} was edited`, user: updatedUser });
            } else {
                res.status(404).json({ error: `User not found` });
            }
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удаление пользователя (админ)
app.delete('/admin/users/:userId/delete', checkToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ error: `User not found` });
            }
            
            const username = user.username;
            await User.findByIdAndDelete(userId);
            
            // Сбрасываем кэш пользователей при удалении пользователя
            clearCache('/users');
            
            res.json({ message: `User ${username} was removed` });
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение пользователя по ID (админ)
app.get('/admin/users/:userId', checkToken, async (req, res) => {
    try {
        if (req.userRole === 'admin') {
            const userId = req.params.userId;
            const user = await User.findById(userId);
            
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ error: `User with id = ${userId} not found` });
            }
        } else {
            res.status(403).json({ error: "Forbidden" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ИЗБРАННЫЕ ФИЛЬМЫ
// Получение избранных фильмов пользователя
app.get('/favoriteMovies', checkToken, async (req, res) => {
    try {
        if (req.userRole !== 'user') {
            return res.status(403).json({ error: "Forbidden: Only users with the role 'user' can access favorite movies" });
        }
        
        const userId = req.userId;
        const favorites = await FavoriteMovie.find({ user: userId }).populate({
            path: 'movie',
            populate: [
                { path: 'user', select: 'username' },
                { path: 'category', select: 'name' }
            ]
        });
        
        const favoriteMovies = favorites.map(fav => fav.movie);
        res.json(favoriteMovies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Добавление фильма в избранное
app.post('/favoriteMovies', checkToken, async (req, res) => {
    try {
        if (req.userRole !== 'user') {
            return res.status(403).json({ error: "Forbidden: Only users with the role 'user' can add favorite movies" });
        }
        
        const userId = req.userId;
        const { movieId } = req.body;
        
        const existingFavorite = await FavoriteMovie.findOne({ user: userId, movie: movieId });
        
        if (existingFavorite) {
            return res.status(400).json({ message: "Movie is already in favorites" });
        }
        
        await FavoriteMovie.create({ user: userId, movie: movieId });
        res.json({ message: "Movie added to favorites" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Удаление фильма из избранного
app.delete('/favoriteMovies/:movieId', checkToken, async (req, res) => {
    try {
        if (req.userRole !== 'user') {
            return res.status(403).json({ error: "Forbidden: Only users with the role 'user' can remove favorite movies" });
        }
        
        const userId = req.userId;
        const movieId = req.params.movieId;
        
        const result = await FavoriteMovie.findOneAndDelete({ user: userId, movie: movieId });
        
        if (result) {
            res.json({ message: "Movie removed from favorites" });
        } else {
            res.status(404).json({ error: "Movie not found in favorites" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для проверки балансировки нагрузки
app.get('/server-info', (req, res) => {
  res.json({
    serverId: serverId,
    timestamp: new Date().toISOString(),
    hostname: require('os').hostname()
  })
})

// Маршрут для статистики кэширования
app.get('/cache-stats', async (req, res) => {
    if (req.query.secret !== 'admin123') {
        return res.status(403).json({ error: "Unauthorized" });
    }
    
    const stats = cache.getStats();
    const keys = cache.keys();
    const items = {};
    
    keys.forEach(key => {
        items[key] = {
            value: cache.get(key),
            ttl: cache.getTtl(key)
        };
    });
    
    res.json({
        stats,
        keys,
        items
    });
});

// Маршрут для ручной очистки кэша
app.post('/clear-cache', async (req, res) => {
    if (req.query.secret !== 'admin123') {
        return res.status(403).json({ error: "Unauthorized" });
    }
    
    const pattern = req.body.pattern;
    clearCache(pattern);
    
    res.json({
        success: true,
        message: pattern ? `Cache cleared for pattern: ${pattern}` : 'Entire cache cleared'
    });
});

// API для получения агрегированной статистики для обычных пользователей
app.get('/user-stats', checkToken, async (req, res) => {
    try {
        const userId = req.userId;
        
        // Получаем статистику избранных фильмов пользователя через агрегацию
        const favoriteStats = await FavoriteMovie.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
            { $lookup: { from: 'movies', localField: 'movie', foreignField: '_id', as: 'movieDetails' } },
            { $unwind: '$movieDetails' },
            { 
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    avgPrice: { $avg: '$movieDetails.price' },
                    categories: { $addToSet: '$movieDetails.category' },
                    latestAdded: { $max: '$createdAt' }
                }
            },
            {
                $project: {
                    _id: 0,
                    count: 1,
                    avgPrice: 1,
                    categoryCount: { $size: '$categories' },
                    latestAdded: 1
                }
            }
        ]);

        // Получаем активность пользователя (недельную статистику)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const dailyStats = await FavoriteMovie.aggregate([
            { $match: { 
                user: mongoose.Types.ObjectId(userId),
                createdAt: { $gte: weekAgo } 
            }},
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Заполняем массив дней недели (1-7, где 1=воскресенье)
        const weekActivity = [0, 0, 0, 0, 0, 0, 0];
        dailyStats.forEach(day => {
            weekActivity[day._id - 1] = day.count;
        });

        // Получаем информацию о пользователе
        const user = await User.findById(userId);
        
        res.json({
            favorites: favoriteStats[0] || { count: 0, avgPrice: 0, categoryCount: 0, latestAdded: null },
            weekActivity,
            accountCreated: user.createdAt
        });
        
    } catch (error) {
        console.error('Ошибка при получении статистики пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
});

// API для получения агрегированной статистики для администраторов
app.get('/admin-stats', checkToken, async (req, res) => {
    try {
        // Проверяем, является ли пользователь администратором
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Доступ запрещен. Только для администраторов.' });
        }
        
        // Статистика по пользователям (общее количество, новые за неделю)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const userStats = await User.aggregate([
            {
                $facet: {
                    'total': [
                        { $count: 'count' }
                    ],
                    'newUsers': [
                        { $match: { createdAt: { $gte: weekAgo } } },
                        { $count: 'count' }
                    ],
                    'byRole': [
                        { $group: { _id: '$role', count: { $sum: 1 } } }
                    ]
                }
            }
        ]);
        
        // Статистика по фильмам
        const movieStats = await Movie.aggregate([
            {
                $facet: {
                    'total': [
                        { $count: 'count' }
                    ],
                    'avgPrice': [
                        { $group: { _id: null, avg: { $avg: '$price' } } }
                    ],
                    'byCategory': [
                        { $group: { _id: '$category', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
                        { $unwind: '$category' },
                        { $project: { _id: 0, name: '$category.name', count: 1 } }
                    ]
                }
            }
        ]);
        
        // Статистика по избранным фильмам (общая активность)
        const favoriteStats = await FavoriteMovie.aggregate([
            {
                $facet: {
                    'total': [
                        { $count: 'count' }
                    ],
                    'lastWeekActivity': [
                        { $match: { createdAt: { $gte: weekAgo } } },
                        { $count: 'count' }
                    ],
                    'topUsers': [
                        { $group: { _id: '$user', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
                        { $unwind: '$user' },
                        { $project: { _id: 0, username: '$user.username', count: 1 } }
                    ],
                    'topMovies': [
                        { $group: { _id: '$movie', count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 },
                        { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
                        { $unwind: '$movie' },
                        { $project: { _id: 0, title: '$movie.title', count: 1 } }
                    ]
                }
            }
        ]);
        
        res.json({
            users: {
                total: userStats[0].total[0]?.count || 0,
                newLastWeek: userStats[0].newUsers[0]?.count || 0,
                byRole: userStats[0].byRole
            },
            movies: {
                total: movieStats[0].total[0]?.count || 0,
                avgPrice: movieStats[0].avgPrice[0]?.avg || 0,
                topCategories: movieStats[0].byCategory
            },
            favorites: {
                total: favoriteStats[0].total[0]?.count || 0,
                lastWeekActivity: favoriteStats[0].lastWeekActivity[0]?.count || 0,
                topUsers: favoriteStats[0].topUsers,
                topMovies: favoriteStats[0].topMovies
            }
        });
        
    } catch (error) {
        console.error('Ошибка при получении админ-статистики:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении статистики' });
    }
});

// Настройка порта для запуска сервера
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});