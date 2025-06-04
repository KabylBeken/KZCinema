import { useState } from "react";
import { doRegister } from './api';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Button } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';

function RegisterForm(){

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {success, data} = await doRegister(email, password, username);
        if(success){
            navigate('/login', {state: {message: data}});
        }
        else{
            toast(data.response.data.message);
        }
    };

    return(
        <div className="container">
            <div className="mx-5 px-5">
                <div className="mx-5 px-5">
                    <h2>Register Form</h2>
                    <form onSubmit={handleSubmit}>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="text" id="form2Example1" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
                        </div>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="email" id="form2Example1" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"/>
                        </div>
                        <div data-mdb-input-init className="form-outline mb-4">
                            <input type="password" id="form2Example2" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                        </div>
                        <button type="submit" data-mdb-button-init data-mdb-ripple-init className="btn btn-primary btn-block mb-4">Кіру</button>
                        <div className="text-center">
                            <b>If you have an account - </b>
                            <Link to={'/login'}>
                                <Button variant="outline-secondary" size="sm">
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterForm;