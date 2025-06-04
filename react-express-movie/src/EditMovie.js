import { useState, useEffect } from "react";
import { editMovie, getOneMovie, getAllCategories } from './api';
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditMovie(){
    const navigate = useNavigate();
    const params = useParams();
    const [movie, setMovie] = useState({
        title: "",
        year: "",
        format: "",
        categoryId: "",
        price: "",
        content: "",
        photo: null
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    useEffect(() => {
        // Проверка авторизации
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.token) {
            navigate("/login", { state: { message: "Необходимо войти в систему для редактирования фильма" } });
            return;
        }
        
        const loadData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Загрузка категорий
                const categoriesResult = await getAllCategories();
                if (categoriesResult) {
                    setCategories(categoriesResult);
                } else {
                    toast.error("Ошибка загрузки категорий");
                }
                
                // Загрузка данных фильма
                const movieResult = await getOneMovie(params.movieId);
                if (movieResult.success && movieResult.data) {
                    const movieData = movieResult.data;
                    setMovie({
                        ...movieData,
                        categoryId: movieData.category ? movieData.category._id : ""
                    });
                    
                    // Если есть фото - устанавливаем превью
                    if (movieData.photo) {
                        setPhotoPreview(`http://localhost:3005${movieData.photo}`);
                    }
                } else {
                    setError(movieResult.message || "Ошибка загрузки фильма");
                    toast.error(movieResult.message || "Ошибка загрузки фильма");
                    setTimeout(() => navigate("/admin/movies"), 2000);
                }
            } catch (err) {
                setError("Произошла ошибка при загрузке данных");
                toast.error("Произошла ошибка при загрузке данных");
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [params.movieId, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMovie({
            ...movie,
            [name]: value
        });
    };
    
    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMovie({
                ...movie,
                photo: file
            });
            
            // Создаем превью для фото
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Валидация
        if (!movie.title.trim()) {
            toast.error("Название фильма не может быть пустым");
            return;
        }
        
        setSubmitting(true);
        
        try {
            const { success, message } = await editMovie({
                ...movie,
                _id: params.movieId
            });
            
            if (success) {
                toast.success("Фильм успешно обновлен!");
                setTimeout(() => navigate("/admin/movies"), 2000);
            } else {
                toast.error(message || "Ошибка при обновлении фильма");
                setSubmitting(false);
            }
        } catch (err) {
            toast.error("Произошла неожиданная ошибка");
            setSubmitting(false);
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

    if (error) {
        return <div className="container my-5 text-center alert alert-danger">
            {error}
        </div>;
    }

    return(
        <div className="container my-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h2 className="mb-0">Редактирование фильма</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Название</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                id="title" 
                                name="title" 
                                value={movie.title} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">Цена</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="price" 
                                name="price" 
                                value={movie.price} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="content" className="form-label">Описание</label>
                            <textarea 
                                className="form-control" 
                                id="content" 
                                name="content" 
                                value={movie.content || ""} 
                                onChange={handleInputChange}
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="year" className="form-label">Год</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                id="year" 
                                name="year" 
                                value={movie.year} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="format" className="form-label">Формат</label>
                            <select 
                                className="form-control" 
                                id="format" 
                                name="format" 
                                value={movie.format} 
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Выберите формат</option>
                                <option value="VHS">VHS</option>
                                <option value="DVD">DVD</option>
                                <option value="Blu-Ray">Blu-Ray</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="categoryId" className="form-label">Категория</label>
                            <select 
                                className="form-control" 
                                id="categoryId" 
                                name="categoryId" 
                                value={movie.categoryId} 
                                onChange={handleInputChange}
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category._id} value={category._id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="photo" className="form-label">Постер фильма</label>
                            <input 
                                type="file" 
                                className="form-control" 
                                id="photo" 
                                name="photo" 
                                accept="image/*"
                                onChange={handlePhotoChange}
                            />
                            {photoPreview && (
                                <div className="mt-2">
                                    <img 
                                        src={photoPreview} 
                                        alt="Предпросмотр" 
                                        className="img-thumbnail" 
                                        style={{ maxHeight: '200px' }} 
                                    />
                                </div>
                            )}
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
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default EditMovie; 