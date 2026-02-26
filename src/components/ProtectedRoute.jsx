import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protege las rutas del dashboard.
 * Si el usuario no está autenticado → redirige a /login.
 */
const ProtectedRoute = () => {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
