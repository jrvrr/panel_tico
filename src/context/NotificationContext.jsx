import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';
import { getCitas, getPagos } from '../services/api';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    // Almacenamiento local persistente
    const [notifs, setNotifs] = useState(() => {
        try {
            const stored = localStorage.getItem('tico_notifs');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing notifications', e);
        }
        return [];
    });

    // Guardar en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('tico_notifs', JSON.stringify(notifs));
    }, [notifs]);

    // Evaluación dinámica de citas y pagos
    useEffect(() => {
        const fetchDynamicData = async () => {
            // Evaluamos solo si hay un token válido presente
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                // Al correr Promises y caer en catch, devolvemos un array vacío para que no rompa la ejecución.
                const [citas, pagos] = await Promise.all([
                    getCitas().catch(() => []),
                    getPagos().catch(() => [])
                ]);

                const dynamicNotifs = [];
                const now = new Date();

                // 1. Evaluar citas para "Próxima Cita" y "Cancelaciones"
                if (citas && Array.isArray(citas)) {
                    citas.forEach(cita => {
                        const fecha = cita.fecha_cita.split('T')[0];
                        const hora = cita.hora_cita || '00:00:00';
                        const fechaCita = new Date(`${fecha}T${hora}`);
                        const diffH = (fechaCita - now) / (1000 * 60 * 60);

                        if (cita.estado_cita === 'Programada' && diffH > 0 && diffH <= 48) {
                            dynamicNotifs.push({
                                id: `cita_${cita.id}_upcoming`,
                                tipo: 'cita',
                                titulo: 'Próxima cita',
                                mensaje: `Cita con el paciente ${cita.paciente_nombre} en menos de 48 horas.`,
                                nivel: 'info',
                                fecha: now.toISOString(),
                                leida: false
                            });
                        } else if (cita.estado_cita === 'Cancelada' && diffH > -48 && diffH <= 24) {
                            dynamicNotifs.push({
                                id: `cita_${cita.id}_cancelled`,
                                tipo: 'cita',
                                titulo: 'Cancelación de cita',
                                mensaje: `La cita de ${cita.paciente_nombre} ha sido cancelada o pospuesta.`,
                                nivel: 'warning',
                                fecha: now.toISOString(),
                                leida: false
                            });
                        }
                    });
                }

                // 2. Evaluar pagos para "Próximo pago" y "Pagos vencidos"
                if (pagos && Array.isArray(pagos)) {
                    pagos.forEach(pago => {
                        if (pago.estado_pago === 'Pendiente') {
                            const fechaPago = new Date(pago.fecha_pago);
                            const diffDays = (fechaPago - now) / (1000 * 60 * 60 * 24);

                            if (diffDays > 0 && diffDays <= 7) {
                                dynamicNotifs.push({
                                    id: `pago_${pago.id}_upcoming`,
                                    tipo: 'pago',
                                    titulo: 'Próximo pago',
                                    mensaje: `El pago de ${pago.paciente_nombre || 'un paciente'} (Monto: $${pago.monto}) vence en ${Math.ceil(diffDays)} días.`,
                                    nivel: 'warning',
                                    fecha: now.toISOString(),
                                    leida: false
                                });
                            } else if (diffDays <= 0 && diffDays > -30) {
                                dynamicNotifs.push({
                                    id: `pago_${pago.id}_overdue`,
                                    tipo: 'pago',
                                    titulo: 'Pago atrasado',
                                    mensaje: `El pago de ${pago.paciente_nombre || 'un paciente'} (Monto: $${pago.monto}) está vencido.`,
                                    nivel: 'error',
                                    fecha: now.toISOString(),
                                    leida: false
                                });
                            }
                        }
                    });
                }

                // Asegurar que no agrueguemos duplicados o que ya fueron eliminados
                setNotifs(prev => {
                    const currentIds = new Set(prev.map(n => n.id));
                    let deletedIds = new Set();
                    try {
                        deletedIds = new Set(JSON.parse(localStorage.getItem('tico_deleted_notifs') || '[]'));
                    } catch (e) {
                        // ignore error
                    }

                    const newToAdd = dynamicNotifs.filter(n => !currentIds.has(n.id) && !deletedIds.has(n.id));

                    if (newToAdd.length > 0) {
                        return [...newToAdd, ...prev];
                    }
                    return prev;
                });
            } catch (error) {
                console.error('Error procesando notificaciones dinámicas:', error);
            }
        };

        // Primera ejecución inmediata
        fetchDynamicData();
        // Recalcular cada 5 minutos
        const interval = setInterval(fetchDynamicData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    // Agregar notificaciones manuales
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

    // Función auxiliar para registrar ID eliminados permanentemente
    const trackDeleted = (id) => {
        try {
            const deletedIds = new Set(JSON.parse(localStorage.getItem('tico_deleted_notifs') || '[]'));
            deletedIds.add(id);
            localStorage.setItem('tico_deleted_notifs', JSON.stringify([...deletedIds]));
        } catch (e) {
            // ignore
        }
    };

    const eliminar = (id) => {
        trackDeleted(id);
        setNotifs(prev => prev.filter(n => n.id !== id));
    };

    const limpiarTodas = () => {
        setNotifs(prev => {
            prev.forEach(n => trackDeleted(n.id));
            return [];
        });
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
