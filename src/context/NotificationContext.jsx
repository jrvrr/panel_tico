import React, { createContext, useState, useContext } from 'react';
import { toast } from 'sonner';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notifs, setNotifs] = useState([]);

    const addNotification = (notif) => {
        const newNotif = {
            id: Date.now() + Math.random(),
            fecha: new Date().toISOString(),
            leida: false,
            ...notif
        };
        setNotifs(prev => [newNotif, ...prev]);

        // Mostrar toast automáticamente
        if (notif.nivel === 'success') {
            toast.success(notif.titulo, { description: notif.mensaje });
        } else if (notif.nivel === 'error') {
            toast.error(notif.titulo, { description: notif.mensaje });
        } else if (notif.nivel === 'warning') {
            toast.warning(notif.titulo, { description: notif.mensaje });
        } else {
            toast.info(notif.titulo, { description: notif.mensaje });
        }
    };

    const marcarLeida = (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    };

    const marcarTodasLeidas = () => {
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
    };

    const eliminar = (id) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
    };

    const limpiarTodas = () => {
        setNotifs([]);
    };

    return (
        <NotificationContext.Provider value={{
            notifs,
            addNotification,
            marcarLeida,
            marcarTodasLeidas,
            eliminar,
            limpiarTodas
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
