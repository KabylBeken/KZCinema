import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { getAllCategories } from "./api";
import Logo from "./images/kinopoisk.svg";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ThemeToggle from './components/ThemeToggle';

export default function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [hasToken, setHasToken] = useState(false);
    const [categories, setCategories] = useState([]);
    const [role, setRole] = useState('');

    useEffect(() => {
        const loadCat = async () => {
            const categories = await getAllCategories();
            setCategories(categories);
        }
        loadCat();
    }, []);

    useEffect(() => {
        // Проверяем, есть ли сообщение в state
        if (location.state && location.state.message) {
            // Отложенный вызов toast, чтобы избежать проблем с конкуренцией
            setTimeout(() => {
                toast.success(location.state.message, {
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: false,
                    draggable: false,
                    theme: "colored",
                    className: 'custom-toast',
                    icon: <i className="fas fa-check-circle" />
                });
            }, 100);
            
            // Очищаем state через history API, чтобы избежать повторных уведомлений
            window.history.replaceState({}, document.title);
        }

        // Проверяем авторизацию
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
            setHasToken(true);
            setRole(user.role);
        } else {
            setHasToken(false);
            setRole('');
        }
    }, [location]);

    const logout = () => {
        // Удаляем пользователя из localStorage
        localStorage.removeItem("user");
        
        // Деактивируем статус авторизации
        setHasToken(false);
        setRole('');
        
        // Перенаправляем на страницу входа
        navigate("/login");
        
        // Отложенный вызов toast после перенаправления
        setTimeout(() => {
            toast.success("Вы успешно вышли из системы", {
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: false,
                theme: "colored",
            });
        }, 100);
    };

    return (
        <>
            <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={false}
                pauseOnHover={false}
                theme="colored"
                limit={1}
                className="custom-toast"
                closeButton={<button className="toast-close-button"><i className="fas fa-times"></i></button>}
            />
            <div className="container-0">
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-5 d-flex">
                    <Link className="navbar-brand px-5" to="/">
                        <img src={Logo} alt="Logo" width="200" height="50" />
                    </Link>
                    <div className="collapse navbar-collapse px-3">
                        <ul className="navbar-nav me-auto mb-3 mb-lg-0">
                            {categories.map((cat) => (
                                <li className="nav-item mx-3" key={cat._id}>
                                    <Link className="nav-link" to={'/movies/category/' + cat._id}>{cat.name}</Link>
                                </li>
                            ))}
                            {
                                hasToken ? (
                                    <div className="d-flex">
                                        {role === 'user' && (
                                            <li className="nav-item mx-3">
                                                <Link to="/favoriteMovies" className="btn btn-primary">
                                                    <i className="fas fa-heart me-1"></i> Избранное
                                                </Link>
                                            </li>
                                        )}
                                        {role === 'admin' && (
                                            <>
                                                <li className="nav-item mx-2">
                                                    <Link to="/admin/users" className="btn btn-warning">
                                                        <i className="fas fa-users me-1"></i> Пользователи
                                                    </Link>
                                                </li>
                                                <li className="nav-item mx-2">
                                                    <Link to="/admin/movies" className="btn btn-warning">
                                                        <i className="fas fa-film me-1"></i> Фильмы
                                                    </Link>
                                                </li>
                                                <li className="nav-item mx-2">
                                                    <Link to="/admin/categories" className="btn btn-warning">
                                                        <i className="fas fa-list me-1"></i> Категории
                                                    </Link>
                                                </li>
                                            </>
                                        )}
                                        <li className="nav-item mx-3">
                                            <Link to="/profile" className="btn btn-primary">
                                                <i className="fas fa-user me-1"></i> <b>Профиль</b>
                                            </Link>
                                        </li>
                                        
                                        <li className="nav-item active">
                                            <button onClick={logout} className="btn btn-danger">
                                                <i className="fas fa-sign-out-alt me-1"></i> <b>Выход</b>
                                            </button>
                                        </li>
                                    </div>
                                ) : (
                                    <div className="d-flex">
                                        <li className="nav-item active mx-3">
                                            <button onClick={() => { navigate("/login") }} className="btn btn-primary">
                                                <i className="fas fa-sign-in-alt me-1"></i> <b>Вход</b>
                                            </button>
                                        </li>
                                        <li className="nav-item active">
                                            <button onClick={() => { navigate("/register") }} className="btn btn-primary">
                                                <i className="fas fa-user-plus me-1"></i> <b>Регистрация</b>
                                            </button>
                                        </li>
                                    </div>
                                )
                            }
                        </ul>
                        <div className="ms-auto me-3">
                            <ThemeToggle />
                        </div>
                    </div>
                </nav>
            </div><br />
            <Outlet />
        </>
    );
}

