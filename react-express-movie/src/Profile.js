import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { getAdminStats } from './api';
import 'react-toastify/dist/ReactToastify.css';
import 'animate.css';

function Profile() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [adminStats, setAdminStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
            setUser(storedUser);
            loadStatistics(storedUser.role);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const loadStatistics = async (role) => {
        setLoading(true);
        try {
            // Если пользователь админ, загружаем административную статистику
            if (role === 'admin') {
                const adminResult = await getAdminStats();
                if (adminResult.success && adminResult.data) {
                    setAdminStats(adminResult.data);
                } else {
                    toast.error(adminResult.message || "Ошибка загрузки административной статистики");
                }
            }
        } catch (err) {
            toast.error("Произошла ошибка при загрузке данных");
            console.error("Ошибка загрузки статистики:", err);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Удаляем пользователя из localStorage
        localStorage.removeItem("user");
        
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
        <div className="container my-5 py-5 animate__animated animate__fadeIn">
            {user && (
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <div className="neomorphic-card">
                            <div className="neomorphic-header">
                                <h1 className="display-4 text-white animate__animated animate__fadeInDown" style={{ fontFamily: 'Pacifico, cursive' }}>
                                    <span className="floating-icon me-3">
                                        <i className="fas fa-crown"></i>
                                    </span>
                                    Привет, {user.username}!
                                </h1>
                                <p className="lead text-white-50 animate__animated animate__fadeIn animate__delay-1s">
                                    Добро пожаловать в личный кабинет
                                </p>
                                
                                <div className="mt-4 mb-2">
                                    <div className="btn-group" role="group">
                                        <button 
                                            type="button" 
                                            className={`btn ${activeTab === 'profile' ? 'btn-light' : 'btn-outline-light'}`}
                                            onClick={() => setActiveTab('profile')}
                                        >
                                            <i className="fas fa-user me-2"></i> Профиль
                                        </button>
                                        {user.role === 'admin' && (
                                            <button 
                                                type="button" 
                                                className={`btn ${activeTab === 'admin-stats' ? 'btn-light' : 'btn-outline-light'}`}
                                                onClick={() => setActiveTab('admin-stats')}
                                            >
                                                <i className="fas fa-chart-pie me-2"></i> Админ статистика
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {activeTab === 'profile' ? (
                                <div className="card-body p-5">
                                    <div className="row">
                                        <div className="col-md-6 animate__animated animate__fadeInLeft">
                                            <div className="mb-5">
                                                <h3 className="fw-bold mb-4 border-bottom pb-3 text-primary">
                                                    <i className="fas fa-id-card me-2"></i> 
                                                    Информация профиля
                                                </h3>
                                                
                                                <div className="d-flex align-items-center mb-4 mt-5">
                                                    <div className="profile-icon-box">
                                                        <i className="fas fa-user-astronaut fa-2x"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted mb-0">Имя пользователя</p>
                                                        <h5 className="mb-0 fw-bold">{user.username}</h5>
                                                    </div>
                                                </div>
                                                
                                                <div className="d-flex align-items-center mb-4 mt-5">
                                                    <div className="profile-icon-box">
                                                        <i className="fas fa-envelope-open-text fa-2x"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted mb-0">Email адрес</p>
                                                        <h5 className="mb-0 fw-bold">{user.email}</h5>
                                                    </div>
                                                </div>
                                                
                                                <div className="d-flex align-items-center mb-4 mt-5">
                                                    <div className="profile-icon-box">
                                                        <i className="fas fa-user-shield fa-2x"></i>
                                                    </div>
                                                    <div>
                                                        <p className="text-muted mb-0">Статус аккаунта</p>
                                                        <h5 className="mb-0">
                                                            <span className={`badge-glow ${user.role === 'admin' ? 'badge-glow-admin' : 'badge-glow-user'}`}>
                                                                {user.role === 'admin' ? 
                                                                    <>
                                                                        <i className="fas fa-jedi me-2"></i> Администратор
                                                                    </> : 
                                                                    <>
                                                                        <i className="fas fa-user-ninja me-2"></i> Пользователь
                                                                    </>
                                                                }
                                                            </span>
                                                        </h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 animate__animated animate__fadeInRight">
                                            {user.role === 'admin' ? (
                                                <div className="mb-5">
                                                    <h3 className="fw-bold mb-4 border-bottom pb-3 text-warning">
                                                        <i className="fas fa-dragon me-2"></i>
                                                        Панель администратора
                                                    </h3>
                                                    <p className="text-muted mb-4">Управляйте вашим порталом с помощью следующих инструментов:</p>
                                                    <div className="d-grid gap-4">
                                                        <Link to="/admin/users" className="neon-btn neon-btn-purple">
                                                            <i className="fas fa-users-cog me-2"></i> Управление пользователями
                                                        </Link>
                                                        <Link to="/admin/movies" className="neon-btn neon-btn-green">
                                                            <i className="fas fa-photo-video me-2"></i> Управление фильмами
                                                        </Link>
                                                        <Link to="/admin/categories" className="neon-btn neon-btn-purple">
                                                            <i className="fas fa-layer-group me-2"></i> Управление категориями
                                                        </Link>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mb-5">
                                                    <h3 className="fw-bold mb-4 border-bottom pb-3 text-primary">
                                                        <i className="fas fa-wand-magic-sparkles me-2"></i>
                                                        Мои возможности
                                                    </h3>
                                                    <p className="text-muted mb-4">Доступные вам функции и действия:</p>
                                                    <div className="d-grid gap-4">
                                                        <Link to="/favoriteMovies" className="neon-btn neon-btn-purple">
                                                            <i className="fas fa-heart me-2"></i> Избранные фильмы
                                                        </Link>
                                                        <Link to="/movies" className="neon-btn neon-btn-green">
                                                            <i className="fas fa-film me-2"></i> Каталог фильмов
                                                        </Link>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-5 text-center">
                                        <button 
                                            onClick={logout} 
                                            className="neon-btn neon-btn-red"
                                        >
                                            <i className="fas fa-door-open me-2"></i> Выйти из системы
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Административная статистика
                                <div className="card-body p-5 animate__animated animate__fadeIn">
                                    {loading ? (
                                        <div className="text-center p-5">
                                            <div className="spinner-border text-warning" role="status">
                                                <span className="visually-hidden">Загрузка...</span>
                                            </div>
                                            <p className="mt-2">Загружаем административную статистику...</p>
                                        </div>
                                    ) : adminStats ? (
                                        <div>
                                            <h3 className="fw-bold mb-4 text-warning text-center">
                                                <i className="fas fa-database me-2"></i> 
                                                Статистика MongoDB с использованием Aggregation Framework
                                            </h3>
                                            
                                            <div className="row mt-4">
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-warning h-100">
                                                        <div className="card-header bg-warning text-dark">
                                                            <h4 className="mb-0"><i className="fas fa-users me-2"></i> Пользователи</h4>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Всего пользователей:</strong>
                                                                <span className="badge bg-primary">{adminStats.users.total}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Новых за неделю:</strong>
                                                                <span className="badge bg-success">{adminStats.users.newLastWeek}</span>
                                                            </div>
                                                            <h5 className="mt-4 mb-3">Распределение по ролям:</h5>
                                                            <ul className="list-group">
                                                                {adminStats.users.byRole.map(role => (
                                                                    <li key={role._id} className="list-group-item d-flex justify-content-between align-items-center">
                                                                        {role._id === 'admin' ? 'Администраторы' : 'Пользователи'}
                                                                        <span className="badge bg-info rounded-pill">{role.count}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-info h-100">
                                                        <div className="card-header bg-info text-white">
                                                            <h4 className="mb-0"><i className="fas fa-film me-2"></i> Фильмы</h4>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Всего фильмов:</strong>
                                                                <span className="badge bg-primary">{adminStats.movies.total}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Средняя цена:</strong>
                                                                <span className="badge bg-success">
                                                                    {Math.round(adminStats.movies.avgPrice)} тенге.
                                                                </span>
                                                            </div>
                                                            
                                                            <h5 className="mt-4 mb-3">Популярные категории:</h5>
                                                            <ul className="list-group">
                                                                {adminStats.movies.topCategories.length > 0 ? 
                                                                    adminStats.movies.topCategories.map(cat => (
                                                                        <li key={cat.name} className="list-group-item d-flex justify-content-between align-items-center">
                                                                            {cat.name}
                                                                            <span className="badge bg-info rounded-pill">{cat.count}</span>
                                                                        </li>
                                                                    )) : 
                                                                    <li className="list-group-item text-center text-muted">Нет данных</li>
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-success h-100">
                                                        <div className="card-header bg-success text-white">
                                                            <h4 className="mb-0"><i className="fas fa-heart me-2"></i> Избранное</h4>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Всего добавлений:</strong>
                                                                <span className="badge bg-primary">{adminStats.favorites.total}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between mb-3">
                                                                <strong>Активность за неделю:</strong>
                                                                <span className="badge bg-success">{adminStats.favorites.lastWeekActivity}</span>
                                                            </div>
                                                            
                                                            <h5 className="mt-4 mb-3">Самые активные пользователи:</h5>
                                                            <ul className="list-group mb-4">
                                                                {adminStats.favorites.topUsers.length > 0 ? 
                                                                    adminStats.favorites.topUsers.map(user => (
                                                                        <li key={user.username} className="list-group-item d-flex justify-content-between align-items-center">
                                                                            {user.username}
                                                                            <span className="badge bg-info rounded-pill">{user.count}</span>
                                                                        </li>
                                                                    )) : 
                                                                    <li className="list-group-item text-center text-muted">Нет данных</li>
                                                                }
                                                            </ul>
                                                            
                                                            <h5 className="mt-4 mb-3">Популярные фильмы:</h5>
                                                            <ul className="list-group">
                                                                {adminStats.favorites.topMovies.length > 0 ? 
                                                                    adminStats.favorites.topMovies.map(movie => (
                                                                        <li key={movie.title} className="list-group-item d-flex justify-content-between align-items-center">
                                                                            {movie.title}
                                                                            <span className="badge bg-info rounded-pill">{movie.count}</span>
                                                                        </li>
                                                                    )) : 
                                                                    <li className="list-group-item text-center text-muted">Нет данных</li>
                                                                }
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            Не удалось загрузить административную статистику. Убедитесь, что у вас есть необходимые права доступа.
                                        </div>
                                    )}
                                    
                                    <div className="mt-5 text-center">
                                        <button 
                                            onClick={() => setActiveTab('profile')} 
                                            className="neon-btn neon-btn-purple"
                                        >
                                            <i className="fas fa-arrow-left me-2"></i> Вернуться к профилю
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            <div className="card-footer bg-light p-4">
                                <div className="d-flex justify-content-between">
                                    <p className="mb-0 text-muted">
                                        <i className="fas fa-clock me-2"></i>
                                        Последняя активность: {new Date().toLocaleString('ru-RU')}
                                    </p>
                                    
                                    <div>
                                        <span className="badge bg-success me-2">
                                            <i className="fas fa-check me-1"></i> Онлайн
                                        </span>
                                        <span className="badge bg-dark">
                                            <i className="fas fa-code me-1"></i> v1.0.4
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        </div>
    );
}

export default Profile;
