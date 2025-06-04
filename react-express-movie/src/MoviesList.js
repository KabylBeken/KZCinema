import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getAllMovies, deleteMovie } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emptyPoster from "./images/null.jpg";

function MoviesList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState('title');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        const loadMovies = async () => {
            setLoading(true);
            setError(null);
            
            try {
            const { success, data } = await getAllMovies();
                if (success && Array.isArray(data)) {
                setMovies(data);
            } else {
                    setError("Ошибка загрузки фильмов");
                    toast.error("Ошибка загрузки фильмов");
                }
            } catch (err) {
                setError("Ошибка загрузки фильмов");
                toast.error("Произошла ошибка при загрузке фильмов");
                console.error("Ошибка загрузки фильмов:", err);
            } finally {
                setLoading(false);
            }
        };
        loadMovies();
    }, []);

    const handleDelete = async (id) => {
        setDeleting(id);
        try {
            const { success, data, message } = await deleteMovie(id);
        if (success) {
                toast.success(data?.message || "Фильм успешно удален");
                setMovies(movies.filter(movie => movie._id !== id));
            } else {
                toast.error(message || "Ошибка удаления фильма");
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            console.error("Ошибка удаления фильма:", err);
        } finally {
            setDeleting(null);
        }
    };

    // Используем useMemo для оптимизации фильтрации и сортировки фильмов
    const filteredAndSortedMovies = useMemo(() => {
        console.log('Вычисление отфильтрованных и отсортированных фильмов');
        
        // Сначала фильтруем по поисковому запросу
        const filtered = searchQuery
            ? movies.filter(movie =>
                movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (movie.category?.name && movie.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            : movies;
        
        // Затем сортируем по выбранному полю и порядку
        return [...filtered].sort((a, b) => {
            let valueA, valueB;
            
            // Определяем значения для сортировки в зависимости от выбранного поля
            if (sortField === 'title') {
                valueA = a.title;
                valueB = b.title;
            } else if (sortField === 'price') {
                valueA = parseFloat(a.price) || 0;
                valueB = parseFloat(b.price) || 0;
            } else if (sortField === 'category') {
                valueA = a.category?.name || '';
                valueB = b.category?.name || '';
            } else {
                // По умолчанию сортируем по названию
                valueA = a.title;
                valueB = b.title;
            }
            
            // Сравниваем значения в зависимости от порядка сортировки
            if (sortOrder === 'asc') {
                return typeof valueA === 'string' 
                    ? valueA.localeCompare(valueB) 
                    : valueA - valueB;
            } else {
                return typeof valueA === 'string' 
                    ? valueB.localeCompare(valueA) 
                    : valueB - valueA;
            }
        });
    }, [movies, searchQuery, sortField, sortOrder]);

    // Функция для переключения порядка сортировки
    const toggleSortOrder = (field) => {
        if (sortField === field) {
            // Если уже сортируем по этому полю, просто меняем порядок
            setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Если сортируем по новому полю, устанавливаем это поле и порядок по возрастанию
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Вспомогательная функция для отображения иконки сортировки
    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка фильмов...</p>
        </div>;
        }

    if (error) {
        return <div className="container my-5 text-center alert alert-danger">
            {error}
        </div>;
    }

    return (
        <div className="container my-5">
            <div className="card">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">Список фильмов</h2>
                    <Link to="/movies/create" className="btn btn-success">Добавить фильм</Link>
                </div>
                <div className="card-body">
                    <div className="mb-4">
                        <div className="input-group">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Поиск по названию или категории..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setSearchQuery('')}
                                disabled={!searchQuery}
                            >
                                Очистить
                            </button>
                        </div>
                    </div>
                    
                    {filteredAndSortedMovies.length === 0 ? (
                        <div className="alert alert-info">
                            {searchQuery ? 'По вашему запросу ничего не найдено' : 'Фильмов пока нет'}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                    <tr>
                                        <th>Постер</th>
                                        <th className="sortable" onClick={() => toggleSortOrder('title')}>
                                            Название {getSortIcon('title')}
                                        </th>
                                        <th className="sortable" onClick={() => toggleSortOrder('price')}>
                                            Цена {getSortIcon('price')}
                                        </th>
                                        <th className="sortable" onClick={() => toggleSortOrder('category')}>
                                            Категория {getSortIcon('category')}
                                        </th>
                                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                                    {filteredAndSortedMovies.map(movie => (
                                        <tr key={movie._id}>
                                            <td style={{width: '80px'}}>
                                                <img 
                                                    src={movie.photo ? `http://localhost:3005${movie.photo}` : emptyPoster} 
                                                    alt={movie.title}
                                                    className="img-fluid"
                                                    style={{maxWidth: '60px', maxHeight: '80px'}}
                                                />
                                            </td>
                            <td>{movie.title}</td>
                            <td>{movie.price}</td>
                                            <td>{movie.category?.name || 'Нет категории'}</td>
                            <td>
                                                <Link to={`/movies/${movie._id}/edit`} className="btn btn-warning btn-sm me-2">Редактировать</Link>
                                                <button 
                                                    onClick={() => handleDelete(movie._id)} 
                                                    className="btn btn-danger btn-sm"
                                                    disabled={deleting === movie._id}
                                                >
                                                    {deleting === movie._id ? 'Удаление...' : 'Удалить'}
                                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
            
            <style jsx>{`
                .sortable {
                    cursor: pointer;
                    user-select: none;
                }
                .sortable:hover {
                    background-color: #f8f9fa;
                }
            `}</style>
        </div>
    );
}

export default MoviesList;
