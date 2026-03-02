import { Link } from "react-router-dom";
import error404Img from "../assets/error404.png";
import "./NotFound.css";

const NotFoundPage = () => {
    return (
        <div className="nf-root">
            {/* Left side — illustration */}
            <div className="nf-left">
                {/* Blob grande detrás del robot */}
                <div className="nf-blob-main" aria-hidden="true" />
                {/* Blob pequeño flotando cerca */}
                <div className="nf-blob-small" aria-hidden="true" />
                <img
                    src={error404Img}
                    alt="Robot 404"
                    className="nf-robot-img"
                />
            </div>

            {/* Right side — text */}
            <div className="nf-right">
                <h1 className="nf-title">404 ERROR</h1>
                <h2 className="nf-whoops">¡Vaya!</h2>
                <p className="nf-desc">
                    No pudimos encontrar la página que buscabas :(
                </p>
                <Link to="/" className="nf-btn" id="nf-go-home-btn">
                    Ir al inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
