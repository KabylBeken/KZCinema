import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getOneMovie, addFavoriteMovie, removeFavoriteMovie, getFavoriteMovies } from "./api";
import { getMoviePoster } from "./tmdbApi";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';

export default function MovieItem() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [movie, setMovie] = useState({});
    const [hasToken, setHasToken] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [posterUrl, setPosterUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const userRole = user ? user.role : "";

    useEffect(() => {
        if (location.state) {
            toast(location.state.message);
            location.state = null;
        }

        const user = JSON.parse(localStorage.getItem("user"));
        if (user)
            setHasToken(true);
    }, [location]);

    useEffect(() => {
        const loadMovie = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const { success, data, message } = await getOneMovie(params.movieId);
                if (success && data) {
                setMovie(data);
                    if (data.photo) {
                        setPosterUrl(`http://localhost:3005${data.photo}`);
                    } else {
                        try {
                const posterUrl = await getMoviePoster(data.title);
                setPosterUrl(posterUrl || './images/null.jpg');
                        } catch (posterErr) {
                            console.error('Error fetching poster:', posterErr);
                            setPosterUrl('./images/null.jpg');
                        }
                    }
            } else {
                    setError(message || "Ошибка загрузки фильма");
                    toast.error(message || "Ошибка загрузки фильма");
                    setTimeout(() => navigate("/movies"), 2000);
                }
            } catch (err) {
                setError("Произошла ошибка при загрузке фильма");
                toast.error("Произошла ошибка при загрузке фильма");
            } finally {
                setLoading(false);
            }
        };
        
        loadMovie();
    }, [params.movieId, navigate]);

    useEffect(() => {
        const checkFavorite = async () => {
            if (!movie._id || !hasToken) return;
            
            try {
            const { success, data } = await getFavoriteMovies();
                if (success && Array.isArray(data)) {
                    setIsFavorite(data.some(favMovie => favMovie._id === movie._id));
            }
            } catch (err) {
                console.error('Error checking favorites:', err);
        }
        };
        
        checkFavorite();
    }, [movie._id, hasToken]);

    const handleAddFavorite = async () => {
        if (processing) return;
        setProcessing(true);
        
        try {
            const { success, message } = await addFavoriteMovie(movie._id);
        if (success) {
                toast.success(message || "Добавлено в избранное!");
            setIsFavorite(true);
        } else {
                toast.error(message || "Ошибка при добавлении в избранное");
            }
        } catch (err) {
            toast.error("Произошла ошибка при добавлении в избранное");
        } finally {
            setProcessing(false);
        }
    };

    const handleRemoveFavorite = async () => {
        if (processing) return;
        setProcessing(true);
        
        try {
            const { success, message } = await removeFavoriteMovie(movie._id);
        if (success) {
                toast.success(message || "Удалено из избранного!");
            setIsFavorite(false);
        } else {
                toast.error(message || "Ошибка при удалении из избранного");
            }
        } catch (err) {
            toast.error("Произошла ошибка при удалении из избранного");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка данных фильма...</p>
        </div>;
    }

    if (error) {
        return <div className="container my-5 text-center alert alert-danger">
            {error}
        </div>;
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-4 text-center">
                    <img src={posterUrl} alt={movie.title} className="img-fluid rounded" style={{ maxWidth: '350px' }} />
                </div>
                <div className="col-md-8">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="card-title">{movie.title}</h2>
                            <p className="card-text"><strong>Описание:</strong> {movie.content}</p>
                            <p className="card-text"><strong>Цена:</strong> {movie.price}</p>
                            <p className="card-text"><strong>Год:</strong> {movie.year}</p>
                            <p className="card-text"><strong>Формат:</strong> {movie.format}</p>
                            <p className="card-text"><strong>Категория:</strong> {movie.category?.name}</p>
                            {hasToken && userRole === "user" && (
                                isFavorite ? (
                                    <button 
                                        onClick={handleRemoveFavorite} 
                                        className="btn btn-danger mr-2"
                                        disabled={processing}
                                    >
                                        {processing ? 'Обработка...' : 'Удалить из избранного'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={handleAddFavorite} 
                                        className="btn btn-success mr-2"
                                        disabled={processing}
                                    >
                                        {processing ? 'Обработка...' : 'Добавить в избранное'}
                                    </button>
                                )
                            )}
                            {hasToken && userRole === "admin" && (
                                <>
                                    <Link className="btn btn-primary m-1" to={`/admin/movies/${movie._id}/edit`}>Редактировать</Link>
                                    <Link className="btn btn-danger m-1" to={`/admin/movies/${movie._id}/delete`}>Удалить</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
