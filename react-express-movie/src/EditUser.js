import { useState, useEffect } from "react";
import { getOneUser, editUser } from './api';
import { useParams, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditUser() {
    const navigate = useNavigate();
    const params = useParams();
    const [user, setUser] = useState({
        email: "",
        password: "",
        username: "",
        role: "user"
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            const { success, data, message } = await getOneUser(params.userId);
            if (success) {
                setUser(data);
            } else {
                toast.error(message || "Ошибка загрузки пользователя");
            }
            setLoading(false);
        };
        loadUser();
    }, [params.userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUser({
            ...user,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const { success, message } = await editUser(user);
        if (success) {
            toast.success("Пользователь успешно отредактирован");
            setTimeout(() => navigate('/admin/users'), 2000);
        } else {
            toast.error(message || "Ошибка редактирования пользователя");
        }
        setSubmitting(false);
    };

    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка данных...</p>
        </div>;
        }

    return (
        <div className="container">
            <h2>Редактирование пользователя</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email"
                        className="form-control" 
                        value={user.email || ""} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Пароль:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        className="form-control" 
                        value={user.password || ""} 
                        onChange={handleInputChange} 
                        placeholder="Введите новый пароль или оставьте пустым" 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Имя пользователя:</label>
                    <input 
                        type="text" 
                        id="username" 
                        name="username"
                        className="form-control" 
                        value={user.username || ""} 
                        onChange={handleInputChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="role" className="form-label">Роль:</label>
                    <select 
                        id="role" 
                        name="role"
                        className="form-control" 
                        value={user.role || "user"} 
                        onChange={handleInputChange}
                    >
                        <option value="user">Пользователь</option>
                        <option value="admin">Администратор</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                >
                    {submitting ? 'Сохранение...' : 'Сохранить'}
                </button>
            </form>
        </div>
    );
}

export default EditUser;
