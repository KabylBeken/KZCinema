function Footer() { 
    return (
        <footer className="footer mt-5 py-5 bg-dark text-light"> 
            <div className="container"> 
                <div className="row"> 
                    <div className="col-md-3 col-sm-6"> 
                        <h5 className="text-uppercase">About Us</h5> 
                        <ul className="list-unstyled"> 
                            <li> 
                                <a href="/about" className="text-decoration-none text-light small"> Our Story </a> 
                            </li> 
                            <li> 
                                <a href="/team" className="text-decoration-none text-light small"> Team </a> 
                            </li> 
                            <li> 
                                <a href="/contacts" className="text-decoration-none text-light small"> Contacts </a> 
                            </li> 
                        </ul> 
                    </div> 
                    <div className="col-md-3 col-sm-6"> 
                        <h5 className="text-uppercase">Help & Support</h5> 
                        <ul className="list-unstyled"> 
                            <li> 
                                <a href="/faq" className="text-decoration-none text-light small"> FAQ </a> 
                            </li> 
                            <li> 
                                <a href="/terms" className="text-decoration-none text-light small"> Terms of Use </a> 
                            </li> 
                            <li> 
                                <a href="/privacy" className="text-decoration-none text-light small"> Privacy Policy </a> 
                            </li> 
                        </ul> 
                    </div> 
                    <div className="col-md-3 col-sm-6"> 
                        <h5 className="text-uppercase">Follow Us</h5> 
                        <ul className="list-unstyled"> 
                            <li> 
                                <a href="https://facebook.com" className="text-decoration-none text-light small" target="_blank" rel="noopener noreferrer"> 
                                    <i className="fab fa-facebook-f me-2"></i> Facebook 
                                </a> 
                            </li> 
                            <li> 
                                <a href="https://twitter.com" className="text-decoration-none text-light small" target="_blank" rel="noopener noreferrer"> 
                                    <i className="fab fa-twitter me-2"></i> Twitter 
                                </a> 
                            </li> 
                            <li> 
                                <a href="https://instagram.com" className="text-decoration-none text-light small" target="_blank" rel="noopener noreferrer"> 
                                    <i className="fab fa-instagram me-2"></i> Instagram 
                                </a> 
                            </li> 
                        </ul> 
                    </div> 
                    <div className="col-md-3 col-sm-6"> 
                        <h5 className="text-uppercase">Subscribe to our newsletter</h5> 
                        <form> 
                            <div className="input-group mb-3"> 
                                <input type="email" className="form-control" placeholder="Enter your email" /> 
                                <button className="btn btn-primary" type="button"> Subscribe </button> 
                            </div> 
                        </form> 
                    </div> 
                </div> 
                <hr className="my-4" /> 
                <p className="mb-0 text-light"> © 2003 — 2025, KinoPoisk. All rights reserved. </p> 
            </div> 
        </footer> 
    ); 
}

export default Footer;