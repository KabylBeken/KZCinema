import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { getFavoriteMovies, removeFavoriteMovie } from './api';
import { getMoviePoster } from "./tmdbApi";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

export default function FavoriteMovies() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadFavoriteMovies = async () => {
            setLoading(true);
            const { success, data } = await getFavoriteMovies();
            if (success) {
                try {
                const moviesWithPosters = await Promise.all(data.map(async (movie) => {
                    const posterUrl = await getMoviePoster(movie.title);
                    return { ...movie, posterUrl: posterUrl || './images/null.jpg' };
                }));
                setMovies(moviesWithPosters);
                } catch (error) {
                    console.error('Ошибка при загрузке постеров:', error);
                    setMovies(data);
                }
            } else {
                toast.error(data || 'Ошибка загрузки избранных фильмов');
            }
            setLoading(false);
        };
        loadFavoriteMovies();
    }, []);

    const handleRemoveFavorite = async (movieId) => {
        try {
        const { success, data } = await removeFavoriteMovie(movieId);
        if (success) {
                toast.success(data || "Фильм удален из избранного");
            // Удаляем фильм из списка избранных
                setMovies(movies.filter(movie => movie._id !== movieId));
        } else {
                toast.error(data || "Ошибка удаления из избранного");
        }
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);
            toast.error("Произошла неожиданная ошибка");
        }
    };

    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
                <p className="mt-2">Загрузка избранных фильмов...</p>
            </div>
        );
    }

    if (movies.length === 0) {
        return (
            <div className="container my-5">
                <div className="alert alert-info">
                    <h4>Нет избранных фильмов</h4>
                    <p>Вы еще не добавили фильмы в избранное. Перейдите к фильмам, чтобы добавить их.</p>
                    <Link to="/movies" className="btn btn-primary">Перейти к фильмам</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            <h2 className="mb-4">Избранные фильмы</h2>
            <div className="row row-cols-1 row-cols-md-3 row-cols-lg-5 g-4">
                {movies.map((movie) => (
                    <div className="col" key={movie._id}>
                        <div className="card h-100 shadow">
                            <img src={movie.posterUrl || movie.photo || './images/null.jpg'} 
                                className="card-img-top" 
                                alt={movie.title} 
                                style={{ width: '100%', height: 'auto', maxHeight: '300px', objectFit: 'cover' }} 
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{movie.title}</h5>
                                <p className="card-text">Цена: {movie.price} ₽</p>
                                <div className="mt-auto d-flex flex-column">
                                    <Link className="btn btn-primary btn-sm mb-2" to={`/movies/${movie._id}`}>
                                        Подробнее
                                    </Link>
                                    <button 
                                        onClick={() => handleRemoveFavorite(movie._id)} 
                                        className="btn btn-danger btn-sm"
                                    >
                                        Удалить из избранного
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
