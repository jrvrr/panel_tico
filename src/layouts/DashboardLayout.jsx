import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    Bell,
    BellOff,
    ListChecks,
    LogOut,
    ChevronDown,
    ChevronUp,
    Menu,
    Star,
    Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import LoadingScreen from '../components/LoadingScreen';
import './DashboardLayout.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (nombre = '') => {
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── SidebarItem ──────────────────────────────────────────────────────────────
const SidebarItem = ({ to, icon: Icon, label, isCollapsed, badges = [] }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `dl-nav-item${isActive ? ' active' : ''}${isCollapsed ? ' collapsed-item' : ''}`
            }
        >
            <div className="dl-nav-icon-wrap">
                <Icon size={20} style={{ flexShrink: 0, transition: 'transform .3s' }} />
                {!isCollapsed && <span>{label}</span>}
            </div>

            {/* Badges modo expandido */}
            {!isCollapsed && badges.length > 0 && (
                <div className="dl-nav-badges">
                    {badges.map((badge, idx) =>
                        badge.count > 0 && (
                            <span
                                key={idx}
                                className={`dl-badge dl-badge-${badge.colorClass === 'bg-orange-500' ? 'orange' : 'blue'}`}
                                title={badge.title}
                            >
                                {badge.count > 99 ? '99+' : badge.count}
                            </span>
                        )
                    )}
                </div>
            )}

            {/* Tooltip modo colapsado */}
            {isCollapsed && (
                <div className="dl-tooltip">
                    <span>{label}</span>
                    {badges.some(b => b.count > 0) && (
                        <div style={{ display: 'flex', gap: 4, borderLeft: '1px solid #4b5563', paddingLeft: 8, marginLeft: 4 }}>
                            {badges.map((badge, idx) =>
                                badge.count > 0 && (
                                    <span key={idx} className={`dl-badge dl-badge-${badge.colorClass === 'bg-orange-500' ? 'orange' : 'blue'}`}>
                                        {badge.count}
                                    </span>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Dot en ícono (colapsado + con notifs) */}
            {isCollapsed && badges.some(b => b.count > 0) && (
                <div className="dl-icon-dot" style={{ background: '#ef4444' }} />
            )}
        </NavLink>
    );
};

// ── SidebarSubmenu ───────────────────────────────────────────────────────────
const SidebarSubmenu = ({ icon: Icon, label, isCollapsed, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActiveParent =
        location.pathname.startsWith('/pacientes') ||
        location.pathname.startsWith('/citas') ||
        location.pathname.startsWith('/pagos');

    useEffect(() => {
        if (isActiveParent) setIsOpen(true);
    }, [isActiveParent]);

    const toggleOpen = () => {
        if (!isCollapsed) setIsOpen(!isOpen);
    };

    return (
        <div style={{ marginBottom: 2 }}>
            <button
                onClick={toggleOpen}
                className={`dl-submenu-btn${isActiveParent ? ' active' : ''}${isCollapsed ? ' collapsed-btn' : ''}`}
            >
                <div className="dl-nav-icon-wrap">
                    <Icon size={18} style={{ flexShrink: 0, transition: 'transform .3s' }} />
                    {!isCollapsed && <span>{label}</span>}
                </div>
                {!isCollapsed && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}

                {isCollapsed && (
                    <div className="dl-tooltip">{label}</div>
                )}
            </button>

            <div className={`dl-submenu-children${isOpen && !isCollapsed ? ' open' : ''}`}>
                {children}
            </div>
        </div>
    );
};

// ── DashboardLayout ───────────────────────────────────────────────────────────
const DashboardLayout = () => {
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout, isSuperAdmin } = useAuth();
    const { notifs = [] } = useNotifications();
    const navigate = useNavigate();

    const CAT_MAP = {
        cita: 'gestion', pago: 'gestion', paciente: 'gestion',
        sistema: 'sistema', seguridad: 'sistema',
    };

    const unreadGestion = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'gestion').length;
    const unreadSistema = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'sistema').length;

    let dotColor = null;
    if (unreadSistema > 0) dotColor = 'orange';
    else if (unreadGestion > 0) dotColor = 'blue';

    const notificationBadges = [
        { count: unreadSistema, colorClass: 'bg-orange-500', title: 'Notificaciones del Sistema' },
        { count: unreadGestion, colorClass: 'bg-blue-500', title: 'Notificaciones de Gestión' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    if (isAppLoading) {
        return <LoadingScreen onDone={() => setIsAppLoading(false)} />;
    }

    return (
        <div className="dl-root">
            {/* ── Sidebar ── */}
            <aside className={`dl-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>

                {/* Header */}
                <div className={`dl-sidebar-header${isCollapsed ? ' collapsed' : ''}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="dl-hamburger"
                        aria-label="Toggle Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    {!isCollapsed && <span className="dl-brand">TICO</span>}
                </div>

                {/* Nav */}
                <nav className="dl-nav">
                    <div className="dl-nav-section">
                        <SidebarItem to="/" icon={LayoutDashboard} label="Inicio" isCollapsed={isCollapsed} />
                    </div>

                    <div className="dl-nav-section">
                        {!isCollapsed && <span className="dl-nav-label">Canalización</span>}

                        <SidebarSubmenu icon={Users} label="Gestión pacientes" isCollapsed={isCollapsed}>
                            <NavLink to="/pacientes" className={({ isActive }) => `dl-submenu-link${isActive ? ' active' : ''}`}>Pacientes</NavLink>
                            <NavLink to="/citas" className={({ isActive }) => `dl-submenu-link${isActive ? ' active' : ''}`}>Citas</NavLink>
                            <NavLink to="/pagos" className={({ isActive }) => `dl-submenu-link${isActive ? ' active' : ''}`}>Pagos</NavLink>
                        </SidebarSubmenu>

                        <SidebarItem to="/especialistas" icon={Users} label="Especialistas" isCollapsed={isCollapsed} />
                    </div>

                    <div className="dl-nav-section">
                        {!isCollapsed && <span className="dl-nav-label">Analíticas</span>}
                        <SidebarItem to="/metricas" icon={Activity} label="Métricas" isCollapsed={isCollapsed} />
                    </div>

                    <div className="dl-nav-section">
                        {!isCollapsed && <span className="dl-nav-label">General</span>}
                        <SidebarItem to="/configuracion" icon={Settings} label="Configuración" isCollapsed={isCollapsed} />
                    </div>
                </nav>

                {/* Footer */}
                <div className="dl-sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className={`dl-logout-btn${isCollapsed ? ' collapsed-btn' : ''}`}
                    >
                        <LogOut size={17} style={{ flexShrink: 0 }} />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                        {isCollapsed && <div className="dl-tooltip">Cerrar Sesión</div>}
                    </button>
                </div>
            </aside>

            {/* ── Main area ── */}
            <div className="dl-main-area">

                {/* Topbar */}
                <header className="dl-topbar">
                    <div className="dl-topbar-actions">

                        {/* Campana */}
                        <div className="dl-bell-wrapper">
                            <button
                                onClick={() => navigate('/notificaciones')}
                                className="dl-bell-btn"
                                title="Ver notificaciones"
                            >
                                <Bell size={20} />
                                {dotColor && <span className={`dl-bell-dot ${dotColor}`} />}
                            </button>

                            <div className="dl-notif-dropdown">
                                <div onClick={() => navigate('/notificaciones')} className="dl-notif-panel">
                                    <div className="dl-notif-header">
                                        <span className="dl-notif-title">
                                            {(unreadSistema + unreadGestion) > 0
                                                ? `(${unreadGestion}) PACIENTES Y (${unreadSistema}) SISTEMA`
                                                : 'SIN NOTIFICACIONES NUEVAS'}
                                        </span>
                                        <div className="dl-notif-actions" onClick={e => e.stopPropagation()}>
                                            <button title="Marcar todas como leídas"><ListChecks size={15} /></button>
                                            <button title="Silenciar notificaciones"><BellOff size={14} /></button>
                                            <button><ChevronDown size={14} /></button>
                                        </div>
                                    </div>
                                    <div className="dl-notif-footer">
                                        <button className="dl-notif-see-all" onClick={() => navigate('/notificaciones')}>
                                            Ver todas
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="dl-topbar-divider" />

                        {/* Perfil */}
                        {user && (
                            <div onClick={() => navigate('/perfil')} className="dl-profile-chip">
                                <div className="dl-profile-text">
                                    <p className="dl-profile-name">
                                        {user?.nombre?.split(' ').slice(0, 2).join(' ') ?? '—'}
                                    </p>
                                    <p className="dl-profile-role">
                                        {isSuperAdmin && <Star size={10} className="dl-profile-star" />}
                                        {isSuperAdmin ? 'Super Admin' : 'Especialista'}
                                    </p>
                                </div>

                                {user?.foto_url ? (
                                    <img
                                        src={user.foto_url}
                                        alt="Avatar"
                                        className="dl-avatar"
                                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}

                                <div
                                    className="dl-avatar-fallback"
                                    style={{
                                        background: isSuperAdmin
                                            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                                            : 'linear-gradient(135deg,#3b82f6,#6d28d9)',
                                        display: user?.foto_url ? 'none' : 'flex',
                                    }}
                                >
                                    {getInitials(user.nombre)}
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <main className="dl-page-content">
                    <div className="dl-page-inner">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
