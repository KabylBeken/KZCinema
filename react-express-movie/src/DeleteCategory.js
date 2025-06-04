import { useState, useEffect } from "react";
import { deleteCategory, getOneCategory } from './api';
import { useNavigate, useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DeleteCategory() {

    const navigate = useNavigate();
    const params = useParams();
    const [category, setCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверка авторизации и роли администратора
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
            navigate("/login", { state: { message: "Необходимо войти в систему для удаления категории" } });
            return;
        }
        
        if (user.role !== 'admin') {
            navigate("/login", { state: { message: "Только администратор может удалять категории" } });
            return;
        }

        const loadCategory = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const { success, data, message } = await getOneCategory(params.categoryId);
                if (success && data) {
                setCategory(data);
            } else {
                    setError(message || "Ошибка загрузки категории");
                    toast.error(message || "Ошибка загрузки категории");
                    setTimeout(() => navigate("/categories"), 2000);
            }
            } catch (err) {
                setError("Произошла ошибка при загрузке категории");
                toast.error("Произошла ошибка при загрузке категории");
                setTimeout(() => navigate("/categories"), 2000);
            } finally {
                setLoading(false);
            }
        };
        loadCategory();
    }, [params.categoryId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { success, message, data } = await deleteCategory(params.categoryId);
        if (success) {
                toast.success(data?.message || "Категория успешно удалена!");
                setTimeout(() => navigate('/categories'), 2000);
        } else {
                toast.error(message || "Ошибка удаления категории. Требуются права администратора.");
                setLoading(false);
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            setLoading(false);
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
                    <h2 className="mb-0">Удаление категории</h2>
                </div>
                <div className="card-body">
                    <h4 className="card-title">Вы уверены, что хотите удалить категорию "{category.name}"?</h4>
                    <button type="submit" className="btn btn-success mr-2 m-2" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Удаление...' : 'Да'}
                    </button>
                    <Link to="/categories" className="btn btn-secondary">Нет</Link>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default DeleteCategory;
