import { Link } from "react-router-dom";
import Monkey from "./images/youtube-down-monkey.png";

export default function Page404(){

    return(
        <div className="container">
            <div className="row justify-content-center align-items-center min-vh-100">
                <div className="col-md-6 text-center">
                    <h1 className="display-1">404</h1>
                    <h2 className="display-4 mb-4">Oops! Page not found</h2>
                    <p className="lead">The page you are looking for may have been removed, had its name changed, or is temporarily unavailable.</p>
                    <Link to="/" className="btn btn-primary btn-lg">Go to Home</Link>
                </div>
                <div className="col-md-6 text-center">
                    <img src={Monkey} alt="404 Error" className="img-fluid" />
                </div>
            </div>
        </div>
    );
}