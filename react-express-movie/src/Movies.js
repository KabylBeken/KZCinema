import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllMovies } from "./api";
import { getMoviePoster } from "./tmdbApi";
import emptyPoster from "./images/null.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Movies() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
      const loadMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const { success, data, message } = await getAllMovies();
        if (success && Array.isArray(data)) {
          try {
         const moviesWithPosters = await Promise.all(
            data.map(async (movie) => {
                try {
               const posterUrl = await getMoviePoster(movie.title);
               return { ...movie, posterUrl: posterUrl || emptyPoster };
                } catch (posterErr) {
                  console.error(`Error fetching poster for ${movie.title}:`, posterErr);
                  return { ...movie, posterUrl: emptyPoster };
                }
            })
         );
         setMovies(moviesWithPosters);
          } catch (posterErr) {
            console.error('Error processing posters:', posterErr);
            setMovies(data.map(movie => ({ ...movie, posterUrl: emptyPoster })));
          }
         } else {
          setError(message || "Ошибка загрузки фильмов");
          toast.error(message || "Ошибка загрузки фильмов");
        }
      } catch (err) {
        setError("Произошла ошибка при загрузке фильмов");
        toast.error("Произошла ошибка при загрузке фильмов");
      } finally {
        setLoading(false);
         }
      };
    
      loadMovies();
   }, [navigate]);

   const handleSearchChange = (event) => {
      setSearchTerm(event.target.value);
   };

   const filteredMovies = movies.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
   );

  if (loading) {
    return <div className="container my-5 text-center">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Загрузка...</span>
      </div>
      <p className="mt-2">Загрузка фильмов...</p>
    </div>;
  }

  if (error) {
    return <div className="container my-5 text-center alert alert-danger">
      {error}
    </div>;
  }

   return (
      <div className="container mb-5 pb-5 pt-3">
         <div className="mb-3">
            <input
               type="text"
               className="form-control"
          placeholder="Поиск фильмов..."
               value={searchTerm}
               onChange={handleSearchChange}
            />
         </div>
      {filteredMovies.length === 0 ? (
        <div className="alert alert-info">
          Фильмы не найдены. Попробуйте изменить поисковый запрос.
        </div>
      ) : (
         <div className="row row-cols-1 row-cols-sm-5 g-4">
            {filteredMovies.map((movie) => (
            <div className="col" key={movie._id}>
                  <div className="card h-100 shadow" style={{ width: "100%", maxWidth: "200px" }}>
                     <img src={movie.posterUrl} className="card-img-top" alt={movie.title} style={{ width: "100%", height: "auto" }}/>
                     <div className="card-body" style={{ padding: "0.5rem" }}>
                        <h5 className="card-title" style={{ fontSize: "1rem" }}>
                           {movie.title}
                        </h5>
                        <p className="card-text" style={{ fontSize: "0.875rem" }}>
                    Цена: {movie.price}
                        </p>
                        <div className="mt-auto">
                    <Link className="btn btn-primary btn-sm" to={"/movies/" + movie._id}>
                      Подробнее
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}
         <div>
            <Outlet />
         </div>
      <ToastContainer position="top-right" autoClose={3000} />
      </div>
   );
}
