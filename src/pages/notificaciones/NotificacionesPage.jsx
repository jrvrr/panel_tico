import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Bell, BellOff, CheckCircle2, AlertTriangle, Info,
    Trash2, CheckCheck, Filter, X, Users, Activity
} from 'lucide-react';
import './Notificaciones.css';

/* ─── Datos de ejemplo ─────────────────────────────────────────────────── */
const SAMPLE = [
    {
        id: 1,
        tipo: 'cita',
        titulo: 'Próxima cita agendada',
        mensaje: 'Recordatorio: Mañana 03/03 a las 09:00 - Consulta de valoración para Ricardo Arjona.',
        fecha: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        leida: false,
        nivel: 'info',
    },
    {
        id: 2,
        tipo: 'pago',
        titulo: 'Atraso de pago detectado',
        mensaje: 'El paciente Carlos López tiene una factura pendiente desde hace 5 días ($2,500 MXN).',
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        leida: false,
        nivel: 'error',
    },
    {
        id: 3,
        tipo: 'sistema',
        titulo: 'Error de sincronización',
        mensaje: 'Se detectó un problema técnico: Los perfiles de especialistas no cargaron correctamente en el módulo de búsqueda.',
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        leida: false,
        nivel: 'error',
    },
    {
        id: 4,
        tipo: 'cita',
        titulo: 'Cancelación de Cita',
        mensaje: 'Lucía Méndez ha cancelado su cita del viernes 05/03 a las 11:30 por motivos personales.',
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        leida: true,
        nivel: 'warning',
    },
    {
        id: 5,
        tipo: 'paciente',
        titulo: 'Nueva ficha clínica',
        mensaje: 'Se ha generado exitosamente el expediente para la paciente nueva Sofía Reyes.',
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        leida: true,
        nivel: 'success',
    },
    {
        id: 6,
        tipo: 'sistema',
        titulo: 'Mantenimiento programado',
        mensaje: 'El sistema entrará en mantenimiento el domingo a las 02:00 AM. Duración estimada: 1 hora.',
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        leida: true,
        nivel: 'info',
    }
];

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const NIVEL_CONFIG = {
    success: {
        icon: <CheckCircle2 />,
        colorIcon: '#10b981',
        colorBg: '#ecfdf5',
        label: 'Éxito',
    },
    warning: {
        icon: <AlertTriangle />,
        colorIcon: '#f59e0b',
        colorBg: '#fffbeb',
        label: 'Aviso',
    },
    error: {
        icon: <X />,
        colorIcon: '#ef4444',
        colorBg: '#fef2f2',
        label: 'Error',
    },
    info: {
        icon: <Info />,
        colorIcon: '#3b82f6',
        colorBg: '#eff6ff',
        label: 'Info',
    },
};

const formatFecha = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
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
            success: () => toast.success('Operación completada.'),
            warning: () => toast.warning('Atención requerida.'),
            error: () => toast.error('Error del sistema.'),
            info: () => toast.info('Nueva información.'),
        };
        msg[nivel]?.();
    };

    /* Marcar una como leída */
    const marcarLeida = (id) => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
        toast.success('Marcada como leída');
    };

    /* Marcar todas como leídas */
    const marcarTodasLeidas = () => {
        setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
        toast.success('Todas leídas');
    };

    /* Eliminar */
    const eliminar = (id) => {
        setNotifs(prev => prev.filter(n => n.id !== id));
        toast.info('Eliminada');
    };

    /* Limpiar todas */
    const limpiarTodas = () => {
        setNotifs([]);
        toast.info('Bandeja vacía');
    };

    /* Filtrado */
    const NIVEL_MAP = { 'Éxito': 'success', 'Advertencia': 'warning', 'Error': 'error', 'Info': 'info' };
    const porTab = notifs.filter(n => CAT_MAP[n.tipo] === activeTab);
    const filtradas = porTab.filter(n => {
        if (filtro === 'Todas') return true;
        if (filtro === 'No leídas') return !n.leida;
        return n.nivel === NIVEL_MAP[filtro];
    });

    const noLeidasGestion = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'gestion').length;
    const noLeidasSistema = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'sistema').length;

    return (
        <div className="notif-page">

            <header className="notif-page-header">
                <div className="notif-header-info">
                    <div className="notif-bell-box">
                        <Bell size={28} />
                    </div>
                    <div>
                        <h1 className="notif-title">Centro de Notificaciones</h1>
                        <p className="notif-subtitle">Gestiona avisos de pacientes y alertas técnicas</p>
                    </div>
                </div>

                <div className="notif-global-actions">
                    <button onClick={marcarTodasLeidas} className="notif-btn-action primary">
                        <CheckCheck size={16} /> Mark All
                    </button>
                    <div className="notif-divider-v" />
                    <button onClick={limpiarTodas} className="notif-btn-action danger">
                        <Trash2 size={16} /> Vaciar
                    </button>
                </div>
            </header>

            <div className="notif-panel">
                <nav className="notif-tabs">
                    <button
                        onClick={() => { setActiveTab('gestion'); setFiltro('Todas'); }}
                        className={`notif-tab-btn ${activeTab === 'gestion' ? 'active' : ''}`}
                    >
                        <Users size={20} />
                        Gestión de Pacientes
                        {noLeidasGestion > 0 && <span className="notif-tab-count">{noLeidasGestion}</span>}
                    </button>
                    <button
                        onClick={() => { setActiveTab('sistema'); setFiltro('Todas'); }}
                        className={`notif-tab-btn ${activeTab === 'sistema' ? 'active' : ''}`}
                    >
                        <Activity size={20} />
                        Sistema
                        {noLeidasSistema > 0 && <span className="notif-tab-count">{noLeidasSistema}</span>}
                    </button>
                </nav>

                <main className="notif-body">
                    <div className="notif-filters">
                        <div className="notif-filter-group">
                            {FILTROS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltro(f)}
                                    className={`notif-filter-btn ${filtro === f ? 'active' : ''}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className="notif-stats">
                            Mostrando <b>{filtradas.length}</b> avisos
                        </div>
                    </div>

                    {filtradas.length === 0 ? (
                        <div className="notif-empty">
                            <div className="notif-empty-icon">
                                <BellOff size={56} />
                            </div>
                            <h2 className="notif-empty-title">Sin notificaciones</h2>
                            <p className="notif-empty-desc">Todo está en orden por ahora.</p>
                        </div>
                    ) : (
                        <div className="notif-list">
                            {filtradas.map(n => {
                                const cfg = NIVEL_CONFIG[n.nivel];
                                return (
                                    <div key={n.id} className={`notif-card ${n.leida ? 'read' : 'unread'}`}>
                                        {!n.leida && <div className="notif-card-indicator" />}

                                        <div className="notif-icon-wrapper" style={{ background: cfg.colorBg, color: cfg.colorIcon }}>
                                            {React.cloneElement(cfg.icon, { size: 28 })}
                                        </div>

                                        <div className="notif-content">
                                            <div className="notif-content-header">
                                                <div className="notif-card-title-row">
                                                    <h3 className="notif-card-title">{n.titulo}</h3>
                                                    {n.nivel === 'error' && !n.leida && <span className="notif-badge-high">Prioridad</span>}
                                                </div>
                                                <span className="notif-timestamp">{formatFecha(n.fecha)}</span>
                                            </div>
                                            <p className="notif-card-msg">{n.mensaje}</p>
                                        </div>

                                        <div className="notif-card-actions">
                                            {!n.leida && (
                                                <button onClick={() => marcarLeida(n.id)} className="notif-action-btn success" title="Leída">
                                                    <CheckCheck size={20} />
                                                </button>
                                            )}
                                            <button onClick={() => eliminar(n.id)} className="notif-action-btn danger" title="Eliminar">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>

                <footer className="notif-footer">
                    <div className="notif-live-badge">
                        <div className="notif-live-dot" />
                        <span className="notif-live-text">Live Feedback</span>
                    </div>
                    <div className="notif-demo-tools">
                        <span className="notif-demo-label">Probar alertas:</span>
                        <div className="notif-demo-btns">
                            {['success', 'warning', 'error', 'info'].map(n => (
                                <button key={n} onClick={() => toastDemo(n)} className="notif-demo-dot" title={n} style={{ color: NIVEL_CONFIG[n].colorIcon }}>
                                    {React.cloneElement(NIVEL_CONFIG[n].icon, { size: 18 })}
                                </button>
                            ))}
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default NotificacionesPage;
