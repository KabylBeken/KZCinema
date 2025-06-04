import React, { useState } from "react";
import { doLogin } from './api';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

function LoginForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Показываем сообщения из state при перенаправлении
    React.useEffect(() => {
        if (location.state && location.state.message) {
            toast(location.state.message);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            toast("Пожалуйста, введите email и пароль");
            return;
        }
        
        try {
        const { success, data } = await doLogin(email, password);
            if (success) {
                const user = JSON.parse(localStorage.getItem("user"));
                if (user && user.role === 'admin') {
                    toast.success("Вход выполнен с правами администратора");
                }
                navigate('/profile', { state: { message: "Вы успешно вошли в систему" } });
            } else {
                if (data.response && data.response.data) {
                    toast.error(data.response.data.message);
        } else {
                    toast.error("Ошибка входа. Проверьте ваши данные.");
                }
            }
        } catch (error) {
            toast.error("Произошла ошибка при входе");
            console.error("Ошибка входа:", error);
        }
    };

    return (
        <div className="container">
            <div className="mx-5 px-5">
                <div className="mx-5 px-5">
                    <h2>Вход в систему</h2>
                    <form onSubmit={handleSubmit}>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="email" id="form2Example1" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                        </div>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="password" id="form2Example2" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль" required />
                        </div>
                        <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-block mb-4">Войти</button>
                        <div className="text-center">
                            <b>Еще нет аккаунта? - </b>
                            <Link to={'/register'}>
                                <Button variant="outline-secondary" size="sm">
                                    Зарегистрироваться
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default LoginForm;
