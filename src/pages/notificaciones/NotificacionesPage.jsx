import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Bell, BellOff, CheckCircle2, AlertTriangle, Info,
    Trash2, CheckCheck, Filter, X
} from 'lucide-react';

/* ─── Datos de ejemplo ─────────────────────────────────────────────────── */
const SAMPLE = [
    {
        id: 1,
        tipo: 'cita',
        titulo: 'Cita confirmada',
        mensaje: 'La cita de María García para el 28/02 a las 10:00 fue confirmada.',
        fecha: '2025-02-27T10:00:00',
        leida: false,
        nivel: 'success',
    },
    {
        id: 2,
        tipo: 'pago',
        titulo: 'Pago pendiente',
        mensaje: 'El paciente Carlos López tiene un pago vencido de $1,200 MXN.',
        fecha: '2025-02-26T15:30:00',
        leida: false,
        nivel: 'warning',
    },
    {
        id: 3,
        tipo: 'sistema',
        titulo: 'Actualización del sistema',
        mensaje: 'Se aplicó una actualización de seguridad. Los datos están protegidos.',
        fecha: '2025-02-25T08:00:00',
        leida: true,
        nivel: 'info',
    },
    {
        id: 4,
        tipo: 'cita',
        titulo: 'Cita cancelada',
        mensaje: 'Pedro Ramírez canceló su cita del 01/03 a las 16:00.',
        fecha: '2025-02-25T12:00:00',
        leida: true,
        nivel: 'error',
    },
    {
        id: 5,
        tipo: 'paciente',
        titulo: 'Nuevo paciente registrado',
        mensaje: 'Ana Martínez fue registrada como nueva paciente en el sistema.',
        fecha: '2025-02-24T09:00:00',
        leida: false,
        nivel: 'success',
    },
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const NIVEL_CONFIG = {
    success: {
        icon: <CheckCircle2 size={18} />,
        colorBg: 'bg-emerald-50',
        colorBorder: 'border-emerald-200',
        colorIcon: 'text-emerald-500',
        colorDot: 'bg-emerald-500',
        label: 'Éxito',
    },
    warning: {
        icon: <AlertTriangle size={18} />,
        colorBg: 'bg-amber-50',
        colorBorder: 'border-amber-200',
        colorIcon: 'text-amber-500',
        colorDot: 'bg-amber-500',
        label: 'Advertencia',
    },
    error: {
        icon: <X size={18} />,
        colorBg: 'bg-red-50',
        colorBorder: 'border-red-200',
        colorIcon: 'text-red-500',
        colorDot: 'bg-red-500',
        label: 'Error',
    },
    info: {
        icon: <Info size={18} />,
        colorBg: 'bg-blue-50',
        colorBorder: 'border-blue-200',
        colorIcon: 'text-blue-500',
        colorDot: 'bg-blue-500',
        label: 'Info',
    },
};

const formatFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
        + ' · '
        + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const FILTROS = ['Todas', 'No leídas', 'Éxito', 'Advertencia', 'Error', 'Info'];

/* ─── Componente principal ─────────────────────────────────────────────── */
const NotificacionesPage = () => {
    const [notifs, setNotifs] = useState(SAMPLE);
    const [filtro, setFiltro] = useState('Todas');

    /* Disparar un toast de prueba */
    const toastDemo = (nivel) => {
        const msg = {
            success: () => toast.success(' Operación completada correctamente.'),
            warning: () => toast.warning(' Hay una advertencia que requiere atención.'),
            error: () => toast.error(' Ocurrió un error. Revisa los detalles.'),
            info: () => toast.info(' Nueva información disponible en el sistema.'),
        };
        msg[nivel]?.();
    };

    /* Marcar una como leída */
    const marcarLeida = (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        toast.success('Notificación marcada como leída');
    };

    /* Marcar todas como leídas */
    const marcarTodasLeidas = () => {
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
        toast.success('Todas las notificaciones marcadas como leídas');
    };

    /* Eliminar */
    const eliminar = (id) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
        toast.info('Notificación eliminada');
    };

    /* Limpiar todas */
    const limpiarTodas = () => {
        setNotifs([]);
        toast.info('Bandeja de notificaciones vacía');
    };

    /* Filtrado */
    const NIVEL_MAP = { 'Éxito': 'success', 'Advertencia': 'warning', 'Error': 'error', 'Info': 'info' };
    const filtradas = notifs.filter(n => {
        if (filtro === 'Todas') return true;
        if (filtro === 'No leídas') return !n.leida;
        return n.nivel === NIVEL_MAP[filtro];
    });

    const noLeidas = notifs.filter(n => !n.leida).length;

    return (
        <div className="max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Bell size={22} className="text-gray-700" />
                        {noLeidas > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                                {noLeidas}
                            </span>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-none">Notificaciones</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{noLeidas} sin leer · {notifs.length} en total</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {noLeidas > 0 && (
                        <button
                            onClick={marcarTodasLeidas}
                            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                            <CheckCheck size={14} /> Marcar todas leídas
                        </button>
                    )}
                    {notifs.length > 0 && (
                        <button
                            onClick={limpiarTodas}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={13} /> Vaciar
                        </button>
                    )}
                </div>
            </div>

            {/* Prueba de Toast Demo */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                    <Filter size={13} /> Probar notificaciones toast (Sonner)
                </p>
                <div className="flex flex-wrap gap-2">
                    {['success', 'warning', 'error', 'info'].map(n => {
                        const cfg = NIVEL_CONFIG[n];
                        return (
                            <button
                                key={n}
                                onClick={() => toastDemo(n)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${cfg.colorBg} ${cfg.colorBorder} ${cfg.colorIcon} hover:opacity-80 transition-opacity`}
                            >
                                {cfg.icon} {cfg.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-wrap mb-4">
                {FILTROS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${filtro === f
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {filtradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <BellOff size={40} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">Sin notificaciones</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {filtradas.map(n => {
                        const cfg = NIVEL_CONFIG[n.nivel];
                        return (
                            <div
                                key={n.id}
                                className={`flex gap-4 p-4 rounded-xl border transition-all ${n.leida
                                        ? 'bg-white border-gray-100 opacity-70'
                                        : `${cfg.colorBg} ${cfg.colorBorder}`
                                    }`}
                            >
                                {/* Icono */}
                                <div className={`mt-0.5 shrink-0 ${n.leida ? 'text-gray-300' : cfg.colorIcon}`}>
                                    {cfg.icon}
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {!n.leida && (
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.colorDot}`} />
                                            )}
                                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                                                {n.titulo}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                                            {formatFecha(n.fecha)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.mensaje}</p>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col gap-1 shrink-0">
                                    {!n.leida && (
                                        <button
                                            onClick={() => marcarLeida(n.id)}
                                            title="Marcar como leída"
                                            className="p-1 text-gray-400 hover:text-primary transition-colors"
                                        >
                                            <CheckCheck size={15} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => eliminar(n.id)}
                                        title="Eliminar"
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default NotificacionesPage;
