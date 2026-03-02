import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Bell, BellOff, CheckCircle2, AlertTriangle, Info,
    Trash2, CheckCheck, Filter, X, Users, Activity
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
    const [activeTab, setActiveTab] = useState('gestion'); // 'gestion' o 'sistema'

    /* Categorización */
    const CAT_MAP = {
        cita: 'gestion',
        pago: 'gestion',
        paciente: 'gestion',
        sistema: 'sistema',
        seguridad: 'sistema',
    };

    /* Disparar un toast de prueba */
    const toastDemo = (nivel) => {
        const msg = {
            success: () => toast.success('Operación completada correctamente.'),
            warning: () => toast.warning('Hay una advertencia que requiere atención.'),
            error: () => toast.error('Ocurrió un error. Revisa los detalles.'),
            info: () => toast.info('Nueva información disponible en el sistema.'),
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

    // Primero filtramos por la pestaña activa
    const porTab = notifs.filter(n => CAT_MAP[n.tipo] === activeTab);

    // Luego aplicamos el filtro secundario
    const filtradas = porTab.filter(n => {
        if (filtro === 'Todas') return true;
        if (filtro === 'No leídas') return !n.leida;
        return n.nivel === NIVEL_MAP[filtro];
    });

    const noLeidasTotal = notifs.filter(n => !n.leida).length;
    const noLeidasGestion = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'gestion').length;
    const noLeidasSistema = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'sistema').length;

    return (
        <div className="w-full h-full flex flex-col">

            {/* Header y Acciones Globales */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <Bell size={24} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Centro de Notificaciones</h1>
                        <p className="text-sm text-gray-400 font-medium">Gestiona los avisos del sistema y pacientes</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-100 shadow-sm self-start md:self-center">
                    <button
                        onClick={marcarTodasLeidas}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-blue-50 rounded-lg transition-all"
                    >
                        <CheckCheck size={14} /> Marcar todas leídas
                    </button>
                    <div className="w-px h-4 bg-gray-200 self-center" />
                    <button
                        onClick={limpiarTodas}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                        <Trash2 size={14} /> Vaciar bandeja
                    </button>
                </div>
            </div>

            {/* Layout Principal: Tabs Izquierda + Lista Derecha */}
            <div className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">

                {/* Tabs de Categoría */}
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    <button
                        onClick={() => { setActiveTab('gestion'); setFiltro('Todas'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${activeTab === 'gestion'
                            ? 'text-primary'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Users size={18} />
                        Gestión de Pacientes
                        {noLeidasGestion > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">
                                {noLeidasGestion}
                            </span>
                        )}
                        {activeTab === 'gestion' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                    <button
                        onClick={() => { setActiveTab('sistema'); setFiltro('Todas'); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${activeTab === 'sistema'
                            ? 'text-primary'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <Activity size={18} />
                        Notificaciones del Sistema
                        {noLeidasSistema > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px]">
                                {noLeidasSistema}
                            </span>
                        )}
                        {activeTab === 'sistema' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    {/* Barra de Filtros Secundarios */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                            {FILTROS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltro(f)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filtro === f
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-gray-400">
                            <span className="flex items-center gap-1.5 border-r border-gray-200 pr-4">
                                Mostrando <b>{filtradas.length}</b> de <b>{porTab.length}</b> avisos
                            </span>
                            <span>
                                Categoría: <b className="text-gray-600 capitalize">{activeTab}</b>
                            </span>
                        </div>
                    </div>

                    {/* Lista de Notificaciones Estilizada */}
                    {filtradas.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-100">
                            <div className="p-5 bg-white rounded-full shadow-sm mb-4">
                                <BellOff size={48} className="opacity-20 text-primary" />
                            </div>
                            <p className="text-lg font-bold text-gray-900">No hay notificaciones aquí</p>
                            <p className="text-sm mt-1">Todo está al día en esta categoría</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filtradas.map(n => {
                                const cfg = NIVEL_CONFIG[n.nivel];
                                return (
                                    <div
                                        key={n.id}
                                        className={`group relative flex gap-5 p-5 rounded-2xl border transition-all duration-300 ${n.leida
                                            ? 'bg-gray-50/50 border-gray-100'
                                            : `bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-primary/20`
                                            }`}
                                    >
                                        {/* Indicador lateral de estado */}
                                        {!n.leida && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-lg" />
                                        )}

                                        {/* Icono Principal con fondo suave */}
                                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${n.leida ? 'bg-gray-100 text-gray-400' : `${cfg.colorBg} ${cfg.colorIcon}`}`}>
                                            {cfg.icon}
                                        </div>

                                        {/* Contenido principal */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`text-sm font-bold truncate ${n.leida ? 'text-gray-500' : 'text-gray-900'}`}>
                                                        {n.titulo}
                                                    </h3>
                                                    {n.tipo === 'pago' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500 text-white">Urgente</span>
                                                    )}
                                                </div>
                                                <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">
                                                    {formatFecha(n.fecha)}
                                                </span>
                                            </div>
                                            <p className={`text-xs leading-relaxed ${n.leida ? 'text-gray-400' : 'text-gray-500 font-medium'}`}>
                                                {n.mensaje}
                                            </p>
                                        </div>

                                        {/* Acciones flotantes o lateral */}
                                        <div className="flex flex-row md:flex-col items-center gap-2 shrink-0 self-center">
                                            {!n.leida && (
                                                <button
                                                    onClick={() => marcarLeida(n.id)}
                                                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                                    title="Marcar leída"
                                                >
                                                    <CheckCheck size={18} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => eliminar(n.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer del Panel (Mini Demo/Tip) */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Atención en tiempo real</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-400">Probar:</span>
                        <div className="flex gap-1.5">
                            {['success', 'warning', 'error', 'info'].map(n => (
                                <button
                                    key={n}
                                    onClick={() => toastDemo(n)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center border bg-white shadow-sm hover:scale-110 transition-transform ${NIVEL_CONFIG[n].colorIcon}`}
                                >
                                    {NIVEL_CONFIG[n].icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificacionesPage;
