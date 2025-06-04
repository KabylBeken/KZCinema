import { useState } from "react";
import { doRegister } from './api';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddUser() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        role: 'user'
    });
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Очищаем ошибку при вводе
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email обязателен';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Некорректный формат email';
        }
        
        if (!formData.password.trim()) {
            newErrors.password = 'Пароль обязателен';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Пароль должен содержать минимум 6 символов';
        }
        
        if (!formData.username.trim()) {
            newErrors.username = 'Имя пользователя обязательно';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setSubmitting(true);
        
        const { success, data } = await doRegister(
            formData.email, 
            formData.password, 
            formData.username
        );
        
        if (success) {
            toast.success("Пользователь успешно добавлен!");
            setTimeout(() => navigate('/admin/users'), 2000);
        } else {
            toast.error(data?.message || "Ошибка добавления пользователя");
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">Добавление пользователя</h2>
                </div>
                <div className="card-body">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email:</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                value={formData.email} 
                                onChange={handleInputChange} 
                                required 
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className="mb-3">
                            <label htmlFor="password" className="form-label">Пароль:</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password"
                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                value={formData.password} 
                                onChange={handleInputChange} 
                                required 
                            />
                            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>
                <div className="mb-3">
                            <label htmlFor="username" className="form-label">Имя пользователя:</label>
                            <input 
                                type="text" 
                                id="username" 
                                name="username"
                                className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                value={formData.username} 
                                onChange={handleInputChange} 
                                required 
                            />
                            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>
                <div className="mb-3">
                            <label htmlFor="role" className="form-label">Роль:</label>
                            <select 
                                id="role" 
                                name="role"
                                className="form-control" 
                                value={formData.role} 
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
                            {submitting ? 'Добавление...' : 'Добавить'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddUser;
