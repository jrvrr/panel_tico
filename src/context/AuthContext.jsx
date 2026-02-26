import React, { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Restaurar sesión desde localStorage al recargar la página
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('tico_user');
        return saved ? JSON.parse(saved) : null;
    });

    /**
     * Inicia sesión contra la API real.
     * Lanza un Error si las credenciales son incorrectas.
     */
    const login = useCallback(async (email, password) => {
        const data = await apiLogin(email, password);
        // La API devuelve { token, user } — guardamos el usuario en el estado
        const userData = data.user ?? data.especialista ?? data;
        setUser(userData);
        localStorage.setItem('tico_user', JSON.stringify(userData));
        return userData;
    }, []);

    /**
     * Cierra sesión: invalida el token en el servidor y limpia el estado.
     */
    const logout = useCallback(async () => {
        await apiLogout();
        setUser(null);
    }, []);

    const isSuperAdmin = user?.rol_id === 1 || user?.rol === 'SUPER_ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, isSuperAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
    return ctx;
};
