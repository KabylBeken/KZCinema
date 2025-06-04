import { Link, Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCategoryMovies } from "./api";
import { getMoviePoster } from "./tmdbApi";
import emptyPoster from "./images/null.jpg";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CategoryMovies() {

    const navigate = useNavigate();
    const params = useParams();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const loadMovies = async () => {
            const { success, data } = await getCategoryMovies(params.catId);
            if (success) {
                const moviesWithPosters = await Promise.all(data.map(async (movie) => {
                    const posterUrl = await getMoviePoster(movie.title);
                    return { ...movie, posterUrl: posterUrl || emptyPoster };
                }));
                setMovies(moviesWithPosters);
            } else {
                navigate("/login");
            }
        };
        loadMovies();
    }, [params, navigate]);

    return (
        <div className="container mb-5 pb-5 pt-3">
            <div className="row row-cols-1 row-cols-sm-5 g-4">
                {
                    movies.map((movie) => {
                        return (
                            <div className="col" key={movie.id}>
                                <div className="card h-100 shadow-sm" style={{ width: '100%', maxWidth: '200px' }}>
                                    <img src={movie.posterUrl} className="card-img-top" alt={movie.title} style={{ width: '100%', height: 'auto' }} />
                                    <div className="card-body" style={{ padding: "0.5rem" }}>
                                        <h5 className="card-title" style={{ fontSize: "1rem" }}>
                                            {movie.title}
                                        </h5>
                                        <p className="card-text" style={{ fontSize: "0.875rem" }}>
                                            Budget: ${movie.price}k
                                        </p>
                                        <div className="mt-auto">
                                            <Link className="btn btn-primary btn-sm" to={"/movies/" + movie.id}>
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    );
}
