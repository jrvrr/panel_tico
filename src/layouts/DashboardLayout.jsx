import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Activity,
    Bell,
    LogOut,
    ChevronDown,
    ChevronUp,
    Menu,
    Star,
    UserCircle2,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

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
                clsx(
                    "flex items-center justify-between transition-all duration-300 rounded-xl mb-1 group relative",
                    isActive
                        ? 'text-white shadow-md scale-[1.02] z-10'
                        : 'text-gray-600 hover:bg-slate-50 hover:text-[#3971b8] hover:scale-[1.02] active:scale-95',
                    isCollapsed ? "justify-center p-3" : "px-3 py-2"
                )
            }
            style={({ isActive }) =>
                isActive ? { background: 'linear-gradient(135deg, #3971b8 0%, #5c93c9 100%)' } : {}
            }
        >
            <div className="flex items-center gap-2 overflow-visible">
                <Icon size={20} className={clsx("shrink-0 transition-transform duration-300 group-hover:scale-110", badges.length > 0 && "group-hover:text-red-500")} />
                {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap overflow-hidden tracking-wide">{label}</span>}
            </div>

            {/* Badges para el modo expandido */}
            {!isCollapsed && badges.length > 0 && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    {badges.map((badge, idx) => (
                        badge.count > 0 && (
                            <span
                                key={idx}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ${badge.colorClass}`}
                                title={badge.title}
                            >
                                {badge.count > 99 ? '99+' : badge.count}
                            </span>
                        )
                    ))}
                </div>
            )}

            {/* Tooltip y Badges para el modo colapsado */}
            {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none flex items-center gap-2">
                    <span>{label}</span>
                    {badges.some(b => b.count > 0) && (
                        <div className="flex gap-1 border-l border-gray-600 pl-2 ml-1">
                            {badges.map((badge, idx) => (
                                badge.count > 0 && (
                                    <span key={idx} className={`text-[9px] font-bold px-1 py-0 rounded text-white ${badge.colorClass}`}>
                                        {badge.count}
                                    </span>
                                )
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Indicador sutil sobre el ícono cuando está colapsado y hay notificaciones */}
            {isCollapsed && badges.some(b => b.count > 0) && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></div>
            )}
        </NavLink>
    );
};

// ── SidebarSubmenu ───────────────────────────────────────────────────────────
const SidebarSubmenu = ({ icon: Icon, label, isCollapsed, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isActiveParent = location.pathname.startsWith('/pacientes') || location.pathname.startsWith('/citas') || location.pathname.startsWith('/pagos');

    useEffect(() => {
        if (isActiveParent) setIsOpen(true);
    }, [isActiveParent]);

    const toggleOpen = () => {
        if (!isCollapsed) setIsOpen(!isOpen);
    };

    return (
        <div className="mb-0.5">
            <button
                onClick={toggleOpen}
                className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 transition-all duration-300 rounded-xl group relative",
                    isActiveParent
                        ? 'text-indigo-700 bg-indigo-50 shadow-sm border border-indigo-100 scale-[1.02] z-10'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-[1.03] active:scale-95',
                    isCollapsed && "justify-center"
                )}
            >
                <div className="flex items-center gap-2">
                    <Icon size={18} className="shrink-0 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
                    {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap overflow-hidden tracking-wide">{label}</span>}
                </div>
                {!isCollapsed && (isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}

                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                        {label}
                    </div>
                )}
            </button>

            <div className={clsx(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isOpen && !isCollapsed ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}>
                <div className="pl-4 border-l-2 border-gray-100 ml-5 space-y-0.5">
                    {children}
                </div>
            </div>
        </div>
    );
};

// ── DashboardLayout ───────────────────────────────────────────────────────────
const DashboardLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout, isSuperAdmin } = useAuth();
    const { notifs = [] } = useNotifications();
    const navigate = useNavigate();

    // Calcular notificaciones no leídas por categoría
    const CAT_MAP = {
        cita: 'gestion',
        pago: 'gestion',
        paciente: 'gestion',
        sistema: 'sistema',
        seguridad: 'sistema',
    };

    const unreadGestion = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'gestion').length;
    const unreadSistema = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'sistema').length;

    const notificationBadges = [
        { count: unreadSistema, colorClass: 'bg-blue-500', title: 'Notificaciones del Sistema' },
        { count: unreadGestion, colorClass: 'bg-orange-500', title: 'Notificaciones de Gestión' }
    ];

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside
                className={clsx(
                    "bg-white border-r border-gray-200 flex flex-col shrink-0 transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-56"
                )}
            >
                {/* Header con hamburguesa */}
                <div className={clsx(
                    "flex items-center border-b border-gray-100 h-[60px] px-3 gap-3",
                    isCollapsed ? "justify-center" : ""
                )}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors focus:outline-none shrink-0"
                        aria-label="Toggle Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    {!isCollapsed && (
                        <span className="text-lg font-bold text-gray-900 whitespace-nowrap tracking-tight">
                            TICO
                        </span>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 overflow-y-auto p-3 overflow-x-hidden">
                    <div className="mb-4">
                        <SidebarItem to="/" icon={LayoutDashboard} label="Inicio" isCollapsed={isCollapsed} />
                    </div>

                    <div className="mb-4">
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 animate-fade-in">
                                Canalización
                            </p>
                        )}

                        <SidebarSubmenu icon={Users} label="Gestión pacientes" isCollapsed={isCollapsed}>
                            <NavLink to="/pacientes" className={({ isActive }) => clsx("block px-3 py-1.5 text-xs rounded-md transition-colors", isActive ? "text-primary font-semibold bg-blue-50" : "text-gray-500 hover:text-gray-900")}>
                                Pacientes
                            </NavLink>
                            <NavLink to="/citas" className={({ isActive }) => clsx("block px-3 py-1.5 text-xs rounded-md transition-colors", isActive ? "text-primary font-semibold bg-blue-50" : "text-gray-500 hover:text-gray-900")}>
                                Citas
                            </NavLink>
                            <NavLink to="/pagos" className={({ isActive }) => clsx("block px-3 py-1.5 text-xs rounded-md transition-colors", isActive ? "text-primary font-semibold bg-blue-50" : "text-gray-500 hover:text-gray-900")}>
                                Pagos
                            </NavLink>
                        </SidebarSubmenu>

                        <SidebarItem to="/especialistas" icon={Users} label="Especialistas" isCollapsed={isCollapsed} />
                        <SidebarItem to="/metricas" icon={Activity} label="Métricas" isCollapsed={isCollapsed} />
                    </div>

                    <div>
                        {!isCollapsed && (
                            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 animate-fade-in">
                                General
                            </p>
                        )}
                        <SidebarItem
                            to="/notificaciones"
                            icon={Bell}
                            label="Notificaciones"
                            isCollapsed={isCollapsed}
                            badges={notificationBadges}
                        />
                    </div>
                </nav>

                {/* Footer — perfil del usuario */}
                <div className="p-3 border-t border-gray-100">
                    {/* Perfil compacto */}
                    {!isCollapsed && user && (
                        <div className="flex items-center gap-2 px-2 py-2 mb-1 rounded-lg bg-gray-50">
                            {/* Avatar */}
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[0.65rem] font-bold shrink-0"
                                style={{
                                    background: isSuperAdmin
                                        ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                                        : 'linear-gradient(135deg,#3b82f6,#6d28d9)'
                                }}
                            >
                                {getInitials(user.nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate leading-none mb-0.5">
                                    {user?.nombre?.split(' ').slice(0, 2).join(' ') ?? '—'}
                                </p>
                                <p className="text-[10px] text-gray-400 leading-none flex items-center gap-1">
                                    {isSuperAdmin && <Star size={9} className="text-amber-500" />}
                                    {isSuperAdmin ? 'Super Admin' : 'Especialista'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Botón cerrar sesión */}
                    <button
                        onClick={handleLogout}
                        className={clsx(
                            "flex items-center gap-2 w-full px-3 py-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group relative text-sm",
                            isCollapsed && "justify-center"
                        )}
                    >
                        <LogOut size={17} className="shrink-0" />
                        {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                                Cerrar Sesión
                            </div>
                        )}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
