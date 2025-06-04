const connectDB = require('../config/db');
const { users, categories, movies, favoriteMovies } = require('../db');

// Модели
const User = require('../models/User');
const Category = require('../models/Category');
const Movie = require('../models/Movie');
const FavoriteMovie = require('../models/FavoriteMovie');

const importData = async () => {
    try {
        await connectDB();

        // Удаляем существующие данные
        await User.deleteMany();
        await Category.deleteMany();
        await Movie.deleteMany();
        await FavoriteMovie.deleteMany();

        console.log('БД очищена...');

        // Импортируем пользователей
        const createdUsers = await User.insertMany(users);
        console.log(`${createdUsers.length} пользователей импортировано`);

        // Создаем маппинг старых ID к новым объектам MongoDB
        const userMap = {};
        createdUsers.forEach(user => {
            const oldUser = users.find(u => u.email === user.email);
            userMap[oldUser.id] = user._id;
        });

        // Импортируем категории
        const createdCategories = await Category.insertMany(categories);
        console.log(`${createdCategories.length} категорий импортировано`);

        // Создаем маппинг старых ID к новым объектам MongoDB
        const categoryMap = {};
        createdCategories.forEach(category => {
            const oldCategory = categories.find(c => c.name === category.name);
            categoryMap[oldCategory.id] = category._id;
        });

        // Подготовка и импорт фильмов
        const moviesToImport = movies.map(movie => ({
            title: movie.title,
            price: movie.price,
            content: movie.content,
            photo: movie.photo,
            year: movie.year,
            duration: movie.duration,
            country: movie.country,
            director: movie.director,
            user: userMap[movie.userId],
            category: categoryMap[movie.categoryId]
        }));

        const createdMovies = await Movie.insertMany(moviesToImport);
        console.log(`${createdMovies.length} фильмов импортировано`);

        // Создаем маппинг старых ID к новым объектам MongoDB
        const movieMap = {};
        createdMovies.forEach((movie, index) => {
            movieMap[movies[index].id] = movie._id;
        });

        // Подготовка и импорт избранных фильмов
        const favoritesToImport = favoriteMovies.map(fav => ({
            user: userMap[fav.userId],
            movie: movieMap[fav.movieId]
        }));

        const createdFavorites = await FavoriteMovie.insertMany(favoritesToImport);
        console.log(`${createdFavorites.length} записей избранного импортировано`);

        console.log('Импорт данных завершен!');
        process.exit();
    } catch (error) {
        console.error(`Ошибка: ${error.message}`);
        process.exit(1);
    }
};

// Запуск импорта
importData(); 