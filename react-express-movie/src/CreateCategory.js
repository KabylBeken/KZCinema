import { useState, useEffect } from "react";
import { setCategory } from './api';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateCategory() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Проверка авторизации и роли администратора
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
            navigate("/login", { state: { message: "Необходимо войти в систему для создания категории" } });
            return;
        }
        
        if (user.role !== 'admin') {
            navigate("/login", { state: { message: "Только администратор может создавать категории" } });
            return;
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) {
            toast.error("Название категории не может быть пустым");
            return;
        }
        
        setSubmitting(true);
        
        try {
            const { success, message, data } = await setCategory(name);
        if (success) {
                toast.success(data?.message || "Категория успешно добавлена!");
                setTimeout(() => navigate('/categories'), 2000);
        } else {
                toast.error(message || "Ошибка добавления категории. Требуются права администратора.");
                setSubmitting(false);
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-5">
            <div className="card">
                <div className="card-header bg-success text-white">
                    <h2 className="mb-0">Создание категории</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Название:</label>
                            <input 
                                type="text" 
                                id="name" 
                                className="form-control" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                disabled={submitting}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-success" 
                            disabled={submitting}
                        >
                            {submitting ? 'Создание...' : 'Создать'}
                        </button>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default CreateCategory;
