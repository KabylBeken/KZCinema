import { useEffect, useState } from "react";
import { deleteUser, getOneUser } from "./api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function DeleteUser() {
    const navigate = useNavigate();
    const params = useParams();
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            setLoading(true);
            const { success, data, message } = await getOneUser(params.userId);
            if (success) {
                setUser(data);
            } else {
                toast.error(message || "Ошибка загрузки пользователя");
                setTimeout(() => navigate('/admin/users'), 2000);
            }
            setLoading(false);
        };
        loadUser();
    }, [params.userId, navigate]);

    const handleDelete = async () => {
        setDeleting(true);
        const { success, message } = await deleteUser(params.userId);
        if (success) {
            toast.success("Пользователь успешно удален");
            setTimeout(() => navigate('/admin/users'), 2000);
        } else {
            toast.error(message || "Ошибка удаления пользователя");
            setDeleting(false);
        }
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
            <div className="card my-5">
                <div className="card-header bg-danger text-white">
                    <h2 className="mb-0">Удаление пользователя</h2>
                </div>
                <div className="card-body">
                    <p className="alert alert-warning">Вы уверены, что хотите удалить пользователя <strong>{user.username}</strong>?</p>
                    <p>Эта операция не может быть отменена.</p>
                    <div className="d-flex mt-4">
                        <button 
                            onClick={handleDelete} 
                            className="btn btn-danger me-2"
                            disabled={deleting}
                        >
                            {deleting ? 'Удаление...' : 'Удалить'}
                        </button>
                        <button 
                            onClick={() => navigate('/admin/users')} 
                            className="btn btn-secondary"
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteUser;
