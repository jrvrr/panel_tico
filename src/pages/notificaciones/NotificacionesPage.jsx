import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Bell, BellOff, CheckCircle2, AlertTriangle, Info,
    Trash2, CheckCheck, Filter, X, Users, Activity
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './Notificaciones.css';

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
    const { notifs, marcarLeida, marcarTodasLeidas, eliminar, limpiarTodas, addNotification } = useNotifications();
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
        addNotification({
            tipo: 'sistema',
            titulo: 'Alerta de prueba',
            mensaje: 'Esta es una notificación generada para probar el sistema.',
            nivel
        });
        const msg = {
            success: () => toast.success('Operación completada.'),
            warning: () => toast.warning('Atención requerida.'),
            error: () => toast.error('Error del sistema.'),
            info: () => toast.info('Nueva información.'),
        };
        msg[nivel]?.();
    };

    /* Marcar una como leída */
    const handleMarcarLeida = (id) => {
        marcarLeida(id);
        toast.success('Marcada como leída');
    };

    /* Marcar todas como leídas */
    const handleMarcarTodasLeidas = () => {
        marcarTodasLeidas();
        toast.success('Todas leídas');
    };

    /* Eliminar */
    const handleEliminar = (id) => {
        eliminar(id);
        toast.info('Eliminada');
    };

    /* Limpiar todas */
    const handleLimpiarTodas = () => {
        limpiarTodas();
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
                    <button onClick={handleMarcarTodasLeidas} className="notif-btn-action primary">
                        <CheckCheck size={16} /> Marcar como leído
                    </button>
                    <div className="notif-divider-v" />
                    <button onClick={handleLimpiarTodas} className="notif-btn-action danger">
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
                                                <button onClick={() => handleMarcarLeida(n.id)} className="notif-action-btn success" title="Leída">
                                                    <CheckCheck size={20} />
                                                </button>
                                            )}
                                            <button onClick={() => handleEliminar(n.id)} className="notif-action-btn danger" title="Eliminar">
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
