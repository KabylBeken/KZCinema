import { useState, useEffect } from "react";
import { editCategory, getOneCategory } from './api';
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditCategory() {
    const navigate = useNavigate();
    const params = useParams();
    const [category, setCategory] = useState({ name: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Проверка авторизации и роли администратора
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
            navigate("/login", { state: { message: "Необходимо войти в систему для редактирования категории" } });
            return;
        }
        
        if (user.role !== 'admin') {
            navigate("/login", { state: { message: "Только администратор может редактировать категории" } });
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
        
        if (!category.name.trim()) {
            toast.error("Название категории не может быть пустым");
            return;
        }
        
        setSubmitting(true);
        
        try {
            const { success, message, data } = await editCategory(category);
        if (success) {
                toast.success(data?.message || "Категория успешно обновлена!");
                setTimeout(() => navigate('/categories'), 2000);
        } else {
                toast.error(message || "Ошибка обновления категории. Требуются права администратора.");
                setSubmitting(false);
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            setSubmitting(false);
        }
    };

    const handleName = (ev) => {
        setCategory({ ...category, name: ev.target.value });
    }

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
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">Редактирование категории</h2>
                </div>
                <div className="card-body">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                            <label htmlFor="name" className="form-label">Название:</label>
                            <input 
                                type="text" 
                                id="name" 
                                value={category.name || ''} 
                                className="form-control" 
                                onChange={handleName} 
                                required 
                                disabled={submitting}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={submitting}
                        >
                            {submitting ? 'Сохранение...' : 'Обновить'}
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default EditCategory;
