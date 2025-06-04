import { useState, useEffect } from "react";
import { editMovie, getAllCategories, getOneMovie } from './api';
import { useNavigate, useParams } from "react-router-dom";
import { toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditForm(){

    const navigate = useNavigate();
    const params = useParams();
    const [movie, setMovie] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPhoto, setCurrentPhoto] = useState('');

    useEffect(() => {
        const loadData = async () => {
            const {success, data } = await getOneMovie(params.movieId);
            if(success){
                setMovie(data);
                if (data.photo) {
                    setCurrentPhoto(`http://localhost:3005${data.photo}`);
                }
            } else {
                navigate("/login", {state: { message: data }});
            }

            const categoriesData = await getAllCategories();
            setCategories(categoriesData);
        }
        loadData();
    },[params.movieId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {success} = await editMovie(movie);
        if(success){
            toast('Movie changed!');
            navigate('/admin/movies');
        }
    };

    const hundleTitle = (ev) => {
        setMovie({...movie,title: ev.target.value})
    }
    const hundlePrice = (ev) => {
        setMovie({...movie,price: parseInt(ev.target.value)})
    }
    const hundleContent = (ev) => {
        setMovie({...movie,content: ev.target.value})
    }
    const hundleCategory = (ev) => {
        setMovie({...movie,categoryId: ev.target.value})
    }
    const handlePhoto = (ev) => {
        setMovie({...movie, photo: ev.target.files[0]})
    }

    return(
        <div className="container">
            <h2>Edit movie</h2>
            <form>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title:</label>
                    <input type="text" id="title" value={movie.title} className="form-control" onChange={hundleTitle} />
                </div>
                <div className="mb-3">
                    <label htmlFor="price" className="form-label">Price:</label>
                    <input type="text" id="price" value={movie.price} className="form-control" onChange={hundlePrice} />
                </div>
                <div className="mb-3">
                    <label htmlFor="content" className="form-label">Content:</label>
                    <input type="text" id="content" value={movie.content} className="form-control" onChange={hundleContent} />
                </div>
                <div className="mb-3">
                    <label htmlFor="category" className="form-label">Category:</label>
                    <select id="category" onChange={hundleCategory} className="form-control" value={movie.categoryId}>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="photo" className="form-label">Photo:</label>
                    {currentPhoto && (
                        <div className="mb-2">
                            <img src={currentPhoto} alt={movie.title} style={{ maxWidth: '200px' }} className="img-thumbnail" />
                        </div>
                    )}
                    <input type="file" id="photo" className="form-control" onChange={handlePhoto} />
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Edit</button>
            </form>
        </div>
    );
}

export default EditForm;
