import { useState, useEffect } from "react";
import { deleteMovie, getOneMovie } from './api';
import { Link, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeleteMovie() {
    const navigate = useNavigate();
    const params = useParams();
    const [movie, setMovie] = useState({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверка авторизации
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
            navigate("/login", { state: { message: "Необходимо войти в систему для удаления фильма" } });
            return;
        }

        const loadMovie = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const { success, data, message } = await getOneMovie(params.movieId);
                if (success && data) {
                setMovie(data);
                } else {
                    setError(message || "Ошибка загрузки фильма");
                    toast.error(message || "Ошибка загрузки фильма");
                    setTimeout(() => navigate("/admin/movies"), 2000);
            }
            } catch (err) {
                setError("Произошла ошибка при загрузке фильма");
                toast.error("Произошла ошибка при загрузке фильма");
                setTimeout(() => navigate("/admin/movies"), 2000);
            } finally {
                setLoading(false);
            }
        };
        
        loadMovie();
    }, [params.movieId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDeleting(true);
        
        try {
            const { success, message, data } = await deleteMovie(params.movieId);
            if (success) {
                toast.success(data?.message || "Фильм успешно удален!");
                setTimeout(() => navigate('/admin/movies'), 2000);
            } else {
                toast.error(message || "Ошибка удаления фильма");
                setDeleting(false);
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            setDeleting(false);
        }
    };

    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка...</p>
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
                <div className="card-header bg-danger text-white">
                    <h2 className="mb-0">Удаление фильма</h2>
                </div>
                <div className="card-body">
                    <h4 className="card-title">Вы уверены, что хотите удалить фильм "{movie.title}"?</h4>
                    <button 
                        type="submit" 
                        className="btn btn-success mr-2 m-2" 
                        onClick={handleSubmit}
                        disabled={deleting}
                    >
                        {deleting ? 'Удаление...' : 'Да'}
                    </button>
                    <Link to="/admin/movies" className="btn btn-secondary">Нет</Link>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default DeleteMovie;