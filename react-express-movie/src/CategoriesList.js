import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllCategories, deleteCategory } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CategoriesList() {
    const [categories, setCategories] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadCategories = async () => {
            setLoading(true);
            setError(null);
            
            try {
            const data = await getAllCategories();
                if (Array.isArray(data)) {
            setCategories(data);
                } else {
                    setError("Ошибка формата данных категорий");
                }
            } catch (err) {
                setError("Ошибка загрузки категорий");
                console.error("Ошибка загрузки категорий:", err);
            } finally {
                setLoading(false);
            }
        };
        
        loadCategories();

        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.token) {
            setIsAuthenticated(true);
            setUserRole(user.role);
        }
    }, []);

    const handleDelete = async (id) => {
        if (userRole !== 'admin') {
            toast.error("Только администратор может удалять категории");
            return;
        }

        setDeleting(id);
        
        try {
            const { success, message, data } = await deleteCategory(id);
        if (success) {
                toast.success(data?.message || "Категория успешно удалена");
                setCategories(categories.filter(category => category._id !== id));
        } else {
                toast.error(message || "Ошибка удаления категории. Требуются права администратора.");
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
        } finally {
            setDeleting(null);
        }
    };

    const handleEdit = (id) => {
        if (userRole !== 'admin') {
            toast.error("Только администратор может редактировать категории");
            return;
        }
        navigate(`/categories/${id}/edit`);
    }
    
    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка категорий...</p>
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
                    <h2 className="mb-0">Список категорий</h2>
                    {isAuthenticated && userRole === 'admin' && (
                        <Link to="/categories/create" className="btn btn-success">Добавить категорию</Link>
                    )}
                </div>
                <div className="card-body">
                    {categories.length === 0 ? (
                        <div className="alert alert-info">Категорий пока нет</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover">
                                <thead className="table-light">
                    <tr>
                        <th>ID</th>
                                        <th>Название</th>
                                        {isAuthenticated && userRole === 'admin' && <th>Действия</th>}
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                                        <tr key={category._id}>
                                            <td style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{category._id}</td>
                            <td>{category.name}</td>
                                            {isAuthenticated && userRole === 'admin' && (
                            <td>
                                                    <button 
                                                        onClick={() => handleEdit(category._id)} 
                                                        className="btn btn-warning btn-sm me-2"
                                                    >
                                                        Редактировать
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(category._id)} 
                                                        className="btn btn-danger btn-sm"
                                                        disabled={deleting === category._id}
                                                    >
                                                        {deleting === category._id ? 'Удаление...' : 'Удалить'}
                                                    </button>
                            </td>
                                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
                        </div>
                    )}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default CategoriesList;
