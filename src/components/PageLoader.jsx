import './PageLoader.css';

/**
 * PageLoader — Loader genérico para carga de páginas y transiciones.
 * Úsalo en vez de LoadingScreen para cualquier carga que NO sea el inicio de la app.
 * 
 * Props:
 *   - message (string): Texto opcional debajo del spinner
 *   - fullScreen (boolean): Si ocupa toda la pantalla, default false (solo el contenedor)
 */
const PageLoader = ({ message = 'Cargando...', fullScreen = false }) => {
    return (
        <div className={`page-loader ${fullScreen ? 'page-loader--fullscreen' : ''}`}>
            <div className="page-loader__content">
                <div className="page-loader__spinner">
                    <div className="page-loader__ring" />
                </div>
                <span className="page-loader__text">{message}</span>
            </div>
        </div>
    );
};

export default PageLoader;
