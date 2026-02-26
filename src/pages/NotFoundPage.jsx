import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-2">404</h1>
                <h2 className="text-xl font-semibold mb-4">Página no encontrada</h2>
                <p className="text-gray-600 mb-6">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <Link
                    to="/"
                    className="inline-block bg-primary hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
                >
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
