import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllUsersAdmin } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            const { success, data, message } = await getAllUsersAdmin();
            if (success) {
                setUsers(data);
            } else {
                toast.error(message || "Ошибка загрузки пользователей");
            }
            setLoading(false);
        };
        loadUsers();
    }, []);

    if (loading) {
        return <div className="container my-5 text-center">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Загрузка...</span>
            </div>
            <p className="mt-2">Загрузка пользователей...</p>
        </div>;
        }

    return (
        <div className="container my-5">
            <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="mb-0">Список пользователей</h2>
                    <Link to="/admin/users/add" className="btn btn-light">Добавить пользователя</Link>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Email</th>
                                    <th>Имя пользователя</th>
                                    <th>Роль</th>
                                    <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user._id}</td>
                            <td>{user.email}</td>
                            <td>{user.username}</td>
                                            <td>
                                                <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                                </span>
                                            </td>
                            <td>
                                                <Link to={`/admin/users/${user._id}/edit`} className="btn btn-warning btn-sm me-2">
                                                    Редактировать
                                                </Link>
                                                <Link to={`/admin/users/${user._id}/delete`} className="btn btn-danger btn-sm">
                                                    Удалить
                                                </Link>
                            </td>
                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Пользователей не найдено</td>
                                    </tr>
                                )}
                </tbody>
            </table>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default UsersList;
