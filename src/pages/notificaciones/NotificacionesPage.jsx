import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
    CheckCircle2, AlertTriangle, Info, Trash2, CheckCheck,
    X, Users, Activity, Bell, CheckCircle, BellOff
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
// Estilos globales de tablas
import '../gestion-pacientes/pacientes/Pacientes.css';
// Estilos locales de notificaciones
import './Notificaciones.css';

/* ─── Helpers ──────────────────────────────────────────────────────────── */
const formatFecha = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
        + ' · '
        + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const FILTROS_GESTION = ['Todas', 'No leídas', 'Éxito', 'Advertencia', 'Error', 'Info'];
const FILTROS_SISTEMA = ['Todas', 'No leídas', 'Error'];

const NIVEL_MAP = { 'Éxito': 'success', 'Advertencia': 'warning', 'Error': 'error', 'Info': 'info' };

/* ─── Componente principal ─────────────────────────────────────────────── */
const NotificacionesPage = () => {
    const { notifs, marcarLeida, marcarTodasLeidas, eliminar, limpiarTodas } = useNotifications();

    // ── Estado ──
    const [activeTab, setActiveTab] = useState('gestion'); // 'gestion' o 'sistema'
    const [filtroNivel, setFiltroNivel] = useState('Todas');
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    /* Categorización */
    const CAT_MAP = {
        cita: 'gestion',
        pago: 'gestion',
        paciente: 'gestion',
        sistema: 'sistema',
        seguridad: 'sistema',
    };

    // ── Seleccion ──
    const toggleRow = (id) =>
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    // ── Filtrado ──
    const filtrosActuales = activeTab === 'gestion' ? FILTROS_GESTION : FILTROS_SISTEMA;
    const noLeidasGestion = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'gestion').length;
    const noLeidasSistema = notifs.filter(n => !n.leida && CAT_MAP[n.tipo] === 'sistema').length;

    const filteredData = useMemo(() => {
        let items = notifs.filter(n => CAT_MAP[n.tipo] === activeTab);

        if (searchText.trim()) {
            const lowerSearch = searchText.toLowerCase();
            items = items.filter(n =>
                n.titulo.toLowerCase().includes(lowerSearch) ||
                n.mensaje.toLowerCase().includes(lowerSearch)
            );
        }

        if (filtroNivel !== 'Todas') {
            if (filtroNivel === 'No leídas') {
                items = items.filter(n => !n.leida);
            } else {
                items = items.filter(n => n.nivel === NIVEL_MAP[filtroNivel]);
            }
        }

        // Ordenar por fecha descendente (más recientes primero)
        items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return items;
    }, [notifs, activeTab, searchText, filtroNivel]);

    const toggleAll = () =>
        setSelectedRows(selectedRows.length === filteredData.length && filteredData.length > 0 ? [] : filteredData.map(c => c.id));

    // ── Acciones Globales ──
    const handleMarcarTodasLeidas = () => {
        marcarTodasLeidas();
        toast.success('Todas marcadas como leídas');
    };

    const handleLimpiarTodas = () => {
        if (window.confirm('¿Estás seguro de vaciar todas las notificaciones?')) {
            limpiarTodas();
            toast.info('Bandeja vacía');
            setSelectedRows([]);
        }
    };

    // ── Acciones Lote ──
    const handleMarcarLoteLeidas = () => {
        selectedRows.forEach(id => marcarLeida(id));
        toast.success(`Se marcaron ${selectedRows.length} como leídas`);
        setSelectedRows([]);
    };

    const handleEliminarLote = () => {
        if (window.confirm(`¿Eliminar ${selectedRows.length} notificaciones?`)) {
            selectedRows.forEach(id => eliminar(id));
            toast.info('Notificaciones eliminadas');
            setSelectedRows([]);
        }
    };

    const showToolbarActions = selectedRows.length > 0;
    const labelSeleccion = selectedRows.length === 1 ? '1 seleccionado' : `${selectedRows.length} seleccionados`;

    // ── Badges según nivel ──
    const badgeClass = (nivel) => {
        if (nivel === 'success') return 'tico-badge tico-badge-completada';
        if (nivel === 'warning') return 'tico-badge tico-badge-alto';
        if (nivel === 'error') return 'tico-badge tico-badge-cancelada';
        return 'tico-badge tico-badge-bajo'; // info
    };

    const badgeLabel = (nivel) => {
        if (nivel === 'success') return 'Éxito';
        if (nivel === 'warning') return 'Aviso';
        if (nivel === 'error') return 'Error';
        return 'Info';
    };

    // ── Render ──
    return (
        <div className="tico-container notif-page-container">

            {/* Header */}
            <header className="tico-header" style={{ paddingBottom: '1rem', borderBottom: 'none' }}>
                <div>
                    <h1 className="tico-title">Centro de Notificaciones</h1>
                    <p className="tico-subtitle">Gestiona avisos de pacientes y alertas técnicas</p>
                </div>
            </header>

            {/* Tabs Anchos */}
            <div className="notif-tabs-container">
                <button
                    className={`notif-tab-full ${activeTab === 'gestion' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('gestion'); setFiltroNivel('Todas'); setSelectedRows([]); }}
                >
                    <Users size={18} />
                    Gestión
                    {noLeidasGestion > 0 && <span className="notif-count-badge">{noLeidasGestion}</span>}
                </button>
                <button
                    className={`notif-tab-full ${activeTab === 'sistema' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('sistema'); setFiltroNivel('Todas'); setSelectedRows([]); }}
                >
                    <Activity size={18} />
                    Sistema
                    {noLeidasSistema > 0 && <span className="notif-count-badge">{noLeidasSistema}</span>}
                </button>
            </div>

            {/* Toolbar */}
            <div className="tico-toolbar" style={{ marginBottom: '1rem' }}>
                <input
                    className="tico-search"
                    placeholder="Buscar en título o mensaje…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                {filtrosActuales.map(f => (
                    <button
                        key={f}
                        className={`tico-btn tico-btn-outline tico-btn-filter ${filtroNivel === f ? 'active' : ''}`}
                        onClick={() => setFiltroNivel(f)}
                    >
                        {f}
                        {filtroNivel === f && <div className="tico-filter-dot" />}
                    </button>
                ))}

                <div className="tico-toolbar-actions notif-toolbar-actions">
                    {!showToolbarActions ? (
                        <>
                            <button className="tico-btn tico-btn-outline" onClick={handleMarcarTodasLeidas}>
                                <CheckCheck size={14} /> Marcar todas leídas
                            </button>
                            <button className="tico-btn tico-btn-outline notif-btn-danger-outline" onClick={handleLimpiarTodas}>
                                <Trash2 size={14} /> Vaciar bandeja
                            </button>
                        </>
                    ) : (
                        <>
                            <span className="tico-selection-label">{labelSeleccion}</span>
                            <button className="tico-btn tico-btn-action tico-btn-ver" onClick={handleMarcarLoteLeidas}>
                                <CheckCircle size={14} /> Marcar leídas
                            </button>
                            <button className="tico-btn tico-btn-action tico-btn-inhabilitar" onClick={handleEliminarLote}>
                                <Trash2 size={14} /> Eliminar seleccionadas
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Contenido Principal (Tabla) Scrolleable */}
            <div className="notif-table-wrapper">
                <table className="tico-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input
                                    type="checkbox"
                                    className="tico-checkbox"
                                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                    onChange={toggleAll}
                                />
                            </th>
                            <th>NIVEL</th>
                            <th>TÍTULO</th>
                            <th style={{ width: '40%' }}>MENSAJE</th>
                            <th>FECHA</th>
                            <th className="notif-cell-center">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((n) => (
                            <tr
                                key={n.id}
                                className={[
                                    'notif-row-clickable',
                                    selectedRows.includes(n.id) ? 'selected' : '',
                                    n.leida ? 'inhabilitado' : '', // Opacidad para leídas
                                ].join(' ').trim()}
                                onClick={() => toggleRow(n.id)}
                            >
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="tico-checkbox"
                                        checked={selectedRows.includes(n.id)}
                                        onChange={() => toggleRow(n.id)}
                                    />
                                </td>
                                <td>
                                    <span className={badgeClass(n.nivel)}>
                                        {!n.leida && <span className="notif-unread-dot" />}
                                        {badgeLabel(n.nivel)}
                                    </span>
                                </td>
                                <td className={n.leida ? 'notif-cell-title' : 'notif-cell-title-unread'}>
                                    {n.titulo}
                                </td>
                                <td className="notif-cell-msg">
                                    {n.mensaje}
                                </td>
                                <td className="notif-cell-date">
                                    {formatFecha(n.fecha)}
                                </td>
                                <td className="notif-cell-center" onClick={(e) => e.stopPropagation()}>
                                    <div className="notif-action-group">
                                        {!n.leida && (
                                            <button
                                                className="notif-btn-read"
                                                onClick={() => { marcarLeida(n.id); toast.success('Leída'); }}
                                                title="Marcar como leída"
                                            >
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                        <button
                                            className="notif-btn-delete"
                                            onClick={() => { eliminar(n.id); toast.info('Eliminada'); }}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} className="notif-cell-center" style={{ padding: '2rem', color: '#9ca3af' }}>
                                    <BellOff size={32} className="notif-empty-icon" />
                                    No se encontraron notificaciones en esta sección.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NotificacionesPage;
