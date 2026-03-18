import React, { useState, useMemo, useEffect } from 'react';
import '../pacientes/Pacientes.css';
import { ChevronUp, ChevronDown, Eye, CheckCircle, Trash2, X, Plus, DollarSign, Filter, FilterX, Check } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import { getPacientes, getPagos, createPago, updatePago, deletePago } from '../../../services/api';
import PageLoader from '../../../components/PageLoader';


const EMPTY_PAGO = {
    paciente_id: '',
    monto: '',
    fecha_pago: '',
    metodo_pago: 'Efectivo',
    estado_pago: 'Pendiente',
};

const PagosPage = () => {
    const { addNotification } = useNotifications();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [modalDetalle, setModalDetalle] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [formNuevo, setFormNuevo] = useState(EMPTY_PAGO);
    const [formErrors, setFormErrors] = useState({});
    const [searchText, setSearchText] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [filterMetodo, setFilterMetodo] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [nextId, setNextId] = useState(9);

    const [pagos, setPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

    // ── Pacientes Data ──
    const [pacientesList, setPacientesList] = useState([]);

    const fetchPagos = async () => {
        try {
            setLoading(true);
            const response = await getPagos();
            setPagos(response.data || []);
        } catch (error) {
            console.error("Error fetching pagos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await getPacientes();
                setPacientesList(response.data || []);
                await fetchPagos();
            } catch (error) {
                console.error("Error fetching data for payments:", error);
            }
        };
        fetchInitialData();
    }, []);

    // ── Helpers ──
    const getNombrePaciente = (id) =>
        pacientesList.find(p => p.id === parseInt(id))?.nombre || `Paciente #${id}`;

    const formatMonto = (m) =>
        `$${parseFloat(m).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatFecha = (f) => {
        if (!f) return '—';
        const [y, m, d] = f.split('-');
        return `${d}/${m}/${y}`;
    };

    // ── Selección ──
    const toggleRow = (id) =>
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelectedRows(selectedRows.length === filteredData.length ? [] : filteredData.map(p => p.id));

    const selectedSingle = selectedRows.length === 1 ? pagos.find(p => p.id === selectedRows[0]) : null;
    const showToolbar = selectedRows.length > 0;
    const labelSeleccion = selectedRows.length === 1 ? '1 seleccionado' : `${selectedRows.length} seleccionados`;

    // ── Ordenamiento + filtrado ──
    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, fontSize: '0.8em', marginLeft: '4px' }}>⇅</span>;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
    };

    const filteredData = useMemo(() => {
        let items = [...pagos];
        if (searchText.trim())
            items = items.filter(p =>
                getNombrePaciente(p.paciente_id).toLowerCase().includes(searchText.toLowerCase())
            );
        if (filterEstado)
            items = items.filter(p => p.estado_pago === filterEstado);
        if (filterMetodo)
            items = items.filter(p => p.metodo_pago === filterMetodo);
        if (sortConfig.key)
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        return items;
    }, [pagos, sortConfig, searchText, filterEstado, filterMetodo]);

    // ── Totales ──
    const totalPagado = pagos.filter(p => p.estado_pago === 'Pagado').reduce((s, p) => s + parseFloat(p.monto), 0);
    const totalPendiente = pagos.filter(p => p.estado_pago === 'Pendiente').reduce((s, p) => s + parseFloat(p.monto), 0);
    const totalVencido = pagos.filter(p => p.estado_pago === 'Vencido').reduce((s, p) => s + parseFloat(p.monto), 0);

    // ── Acciones ──
    const handleVerDetalle = () => setModalDetalle(selectedSingle);

    const handleMarcarPagado = async () => {
        try {
            setSaving(true);
            const ids = pagos
                .filter(p => selectedRows.includes(p.id) && p.estado_pago !== 'Pagado')
                .map(p => p.id);

            for (const id of ids) {
                await updatePago(id, { estado_pago: 'Pagado' });
            }

            await fetchPagos();
            import('sonner').then(({ toast }) => toast.success(`Se registró el pago de ${ids.length} factura(s)`));
            addNotification({
                tipo: 'pago',
                titulo: 'Pagos completados',
                mensaje: `Se registró el pago de ${ids.length} factura(s) pendiente(s).`,
                nivel: 'success'
            });
            setSelectedRows([]);
        } catch (err) {
            import('sonner').then(({ toast }) => toast.error(err.message || "Error al actualizar pagos"));
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async () => {
        if (!window.confirm(`¿Estás seguro de eliminar ${selectedRows.length} registro(s)?`)) return;
        try {
            setSaving(true);
            for (const id of selectedRows) {
                await deletePago(id);
            }
            await fetchPagos();
            import('sonner').then(({ toast }) => toast.info(`Se eliminaron ${selectedRows.length} registro(s) de pago`));
            addNotification({
                tipo: 'pago',
                titulo: 'Registros eliminados',
                mensaje: `Se eliminaron ${selectedRows.length} registro(s) de pago del historial.`,
                nivel: 'info'
            });
            setSelectedRows([]);
        } catch (err) {
            import('sonner').then(({ toast }) => toast.error(err.message || "Error al eliminar pagos"));
        } finally {
            setSaving(false);
        }
    };

    // ── Form nuevo pago ──
    const handleFormChange = (field, value) => {
        if (field === 'monto') {
            // Solo permitir números y un punto decimal
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
            if (value.length > 10) return;
        }
        setFormNuevo(prev => ({ ...prev, [field]: value }));
        const error = getFieldErrorPago(field, value);
        setFormErrors(prev => ({ ...prev, [field]: error }));
    };

    const getFieldErrorPago = (field, value) => {
        if (field === 'paciente_id' && !value) return 'Selecciona un paciente';
        if (field === 'monto') {
            if (!value) return 'El monto es obligatorio';
            if (parseFloat(value) <= 0) return 'Monto debe ser mayor a 0';
        }
        if (field === 'fecha_pago' && !value) return 'La fecha es obligatoria';
        return undefined;
    };

    const validateForm = () => {
        const errors = {};
        if (!formNuevo.paciente_id) errors.paciente_id = 'Selecciona un paciente';
        if (!formNuevo.monto || parseFloat(formNuevo.monto) <= 0) errors.monto = 'Ingresa un monto válido';
        if (!formNuevo.fecha_pago) errors.fecha_pago = 'La fecha es obligatoria';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegistrarPago = async () => {
        if (!validateForm()) return;
        const nuevo = {
            ...formNuevo,
            monto: parseFloat(formNuevo.monto),
            paciente_id: parseInt(formNuevo.paciente_id)
        };

        try {
            setSaving(true);
            await createPago(nuevo);
            await fetchPagos();

            import('sonner').then(({ toast }) => toast.success(`Nuevo pago registrado`));
            addNotification({
                tipo: 'pago',
                titulo: 'Nuevo pago registrado',
                mensaje: `Se emitió un recibo por $${nuevo.monto} MXN.`,
                nivel: 'success'
            });

            setSaving(false);
            setSaveSuccess('Pago registrado correctamente');
            setTimeout(() => {
                setSaveSuccess('');
                setFormNuevo(EMPTY_PAGO);
                setFormErrors({});
                setModalNuevo(false);
            }, 1200);
        } catch (err) {
            setSaving(false);
            import('sonner').then(({ toast }) => toast.error(err.message || "Error al registrar pago"));
        }
    };

    // ── Badge ──
    const badgeClass = (estado) => {
        if (estado === 'Pagado') return 'tico-badge tico-badge-bajo';
        if (estado === 'Pendiente') return 'tico-badge tico-badge-medio';
        if (estado === 'Vencido') return 'tico-badge tico-badge-cancelada';
        return 'tico-badge';
    };

    const hayMarcables = pagos.filter(p => selectedRows.includes(p.id)).some(p => p.estado_pago !== 'Pagado');

    // ── Render ──
    return (
        <div className="tico-container">

            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Historial de Pagos</h1>
                    <p className="tico-subtitle">Registro de transacciones y facturación</p>
                </div>
                <button className="tico-btn-nuevo" onClick={() => { setFormNuevo(EMPTY_PAGO); setFormErrors({}); setModalNuevo(true); }}>
                    <Plus size={16} /> Registrar Pago
                </button>
            </header>

            {/* Panel de resumen */}
            <div className="pagos-resumen">
                <div className="pagos-resumen-card pagos-resumen-pagado">
                    <DollarSign size={20} />
                    <div>
                        <span>Total cobrado</span>
                        <strong>{formatMonto(totalPagado)}</strong>
                    </div>
                </div>
                <div className="pagos-resumen-card pagos-resumen-pendiente">
                    <DollarSign size={20} />
                    <div>
                        <span>Pendiente</span>
                        <strong>{formatMonto(totalPendiente)}</strong>
                    </div>
                </div>
                <div className="pagos-resumen-card pagos-resumen-vencido">
                    <DollarSign size={20} />
                    <div>
                        <span>Vencido</span>
                        <strong>{formatMonto(totalVencido)}</strong>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="tico-toolbar">
                <input
                    className="tico-search"
                    placeholder="Buscar paciente..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                {/* Botón de filtros unificado */}
                <div style={{ position: 'relative' }}>
                    <button
                        className={`tico-btn tico-btn-outline tico-btn-filter ${showFilterMenu ? 'active' : ''}`}
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                    >
                        <Filter size={14} />
                        Filtros
                        {(filterEstado || filterMetodo) && <span className="tico-filter-dot" />}
                    </button>

                    {showFilterMenu && (
                        <div className="tico-filter-menu">
                            <div className="tico-filter-menu-header">
                                <span>Filtros avanzados</span>
                                <button className="tico-btn-limpiar" onClick={() => { setFilterEstado(''); setFilterMetodo(''); }}>
                                    <FilterX size={13} />
                                    Limpiar
                                </button>
                            </div>
                            <div className="tico-filter-group">
                                <label>Estado</label>
                                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="Pagado">Pagado</option>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="Vencido">Vencido</option>
                                </select>
                            </div>
                            <div className="tico-filter-group">
                                <label>Método de pago</label>
                                <select value={filterMetodo} onChange={(e) => setFilterMetodo(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                    <option value="Transferencia">Transferencia</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {showToolbar && (
                    <div className="tico-toolbar-actions">
                        <span className="tico-selection-label">{labelSeleccion}</span>

                        {selectedSingle && (
                            <button className="tico-btn tico-btn-action tico-btn-ver" onClick={handleVerDetalle}>
                                <Eye size={14} /> Ver detalle
                            </button>
                        )}

                        {hayMarcables && (
                            <button className="tico-btn tico-btn-action tico-btn-reactivar" onClick={handleMarcarPagado}>
                                <CheckCircle size={14} /> Marcar pagado
                            </button>
                        )}

                        <button className="tico-btn tico-btn-action tico-btn-inhabilitar" onClick={handleEliminar}>
                            <Trash2 size={14} /> Eliminar
                        </button>
                    </div>
                )}
            </div>

            {/* Tabla */}
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
                        <th>PACIENTE</th>
                        <th className="sortable" onClick={() => handleSort('monto')}>
                            MONTO {getSortIcon('monto')}
                        </th>
                        <th className="sortable" onClick={() => handleSort('fecha_pago')}>
                            FECHA {getSortIcon('fecha_pago')}
                        </th>
                        <th>MÉTODO</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                <PageLoader message="Cargando historial de pagos..." />
                            </td>
                        </tr>
                    ) : (
                        <>
                            {filteredData.map((p) => (
                                <tr
                                    key={p.id}
                                    className={selectedRows.includes(p.id) ? 'selected' : ''}
                                    onClick={() => toggleRow(p.id)}
                                >
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="checkbox"
                                            className="tico-checkbox"
                                            checked={selectedRows.includes(p.id)}
                                            onChange={() => toggleRow(p.id)}
                                        />
                                    </td>
                                    <td><strong>{getNombrePaciente(p.paciente_id)}</strong></td>
                                    <td style={{ fontWeight: 700, color: '#1f2937' }}>{formatMonto(p.monto)}</td>
                                    <td>{formatFecha(p.fecha_pago)}</td>
                                    <td>
                                        <span className="pagos-metodo-badge">{p.metodo_pago}</span>
                                    </td>
                                    <td>
                                        <span className={badgeClass(p.estado_pago)}>{p.estado_pago}</span>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                        No se encontraron pagos.
                                    </td>
                                </tr>
                            )}
                        </>
                    )}
                </tbody>
            </table>

            {/* ── Modal: Registrar Pago ── */}
            {modalNuevo && (
                <div className="tico-modal-overlay" onClick={() => setModalNuevo(false)}>
                    <div className="tico-modal" onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px, 95vw)', position: 'relative' }}>
                        <button className="tico-modal-close" onClick={() => setModalNuevo(false)}>
                            <X size={18} />
                        </button>
                        <div className="tico-modal-avatar">💳</div>
                        <h2 className="tico-modal-title">Registrar Pago</h2>
                        <p className="tico-form-hint" style={{ textAlign: 'left' }}>* Campos obligatorios</p>

                        <p className="tico-form-section-label">Datos del Pago</p>
                        <div className="tico-form-stack">
                            <label>Paciente *
                                <select
                                    className={`tico-edit-input${formErrors.paciente_id ? ' tico-input-error' : ''}`}
                                    value={formNuevo.paciente_id}
                                    onChange={(e) => handleFormChange('paciente_id', e.target.value)}
                                    onBlur={(e) => handleFormChange('paciente_id', e.target.value)}
                                >
                                    <option value="">— Seleccionar paciente —</option>
                                    {pacientesList.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </select>
                                {formErrors.paciente_id && <span className="tico-field-error">{formErrors.paciente_id}</span>}
                            </label>

                            <div className="tico-form-row2">
                                <label>Monto ($) *
                                    <input
                                        className={`tico-edit-input${formErrors.monto ? ' tico-input-error' : ''}`}
                                        type="text"
                                        inputMode="decimal"
                                        placeholder="0.00"
                                        value={formNuevo.monto}
                                        onChange={(e) => handleFormChange('monto', e.target.value)}
                                        onBlur={(e) => handleFormChange('monto', e.target.value)}
                                    />
                                    {formErrors.monto && <span className="tico-field-error">{formErrors.monto}</span>}
                                </label>
                                <label>Fecha de pago *
                                    <input
                                        className={`tico-edit-input${formErrors.fecha_pago ? ' tico-input-error' : ''}`}
                                        type="date"
                                        value={formNuevo.fecha_pago}
                                        onChange={(e) => handleFormChange('fecha_pago', e.target.value)}
                                        onBlur={(e) => handleFormChange('fecha_pago', e.target.value)}
                                    />
                                    {formErrors.fecha_pago && <span className="tico-field-error">{formErrors.fecha_pago}</span>}
                                </label>
                            </div>

                            <div className="tico-form-row2">
                                <label>Método de pago
                                    <select className="tico-edit-input" value={formNuevo.metodo_pago}
                                        onChange={(e) => handleFormChange('metodo_pago', e.target.value)}>
                                        <option>Efectivo</option>
                                        <option>Tarjeta</option>
                                        <option>Transferencia</option>
                                    </select>
                                </label>
                                <label>Estado
                                    <select className="tico-edit-input" value={formNuevo.estado_pago}
                                        onChange={(e) => handleFormChange('estado_pago', e.target.value)}>
                                        <option>Pendiente</option>
                                        <option>Pagado</option>
                                        <option>Vencido</option>
                                    </select>
                                </label>
                            </div>
                        </div>

                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message="Registrando pago..." />
                                ) : (
                                    <div className="tico-save-success">
                                        <div className="tico-save-success__icon"><Check size={32} /></div>
                                        <span>{saveSuccess}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="tico-edit-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="tico-btn tico-btn-outline" disabled={saving} onClick={() => { setModalNuevo(false); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" disabled={saving} onClick={handleRegistrarPago}>
                                {saving ? 'Registrando...' : 'Registrar pago'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Ver Detalle ── */}
            {modalDetalle && (
                <div className="tico-modal-overlay" onClick={() => setModalDetalle(null)}>
                    <div className="tico-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setModalDetalle(null)}>
                            <X size={18} />
                        </button>
                        <div className="tico-modal-avatar">🧾</div>
                        <h2 className="tico-modal-title">{getNombrePaciente(modalDetalle.paciente_id)}</h2>
                        <div className="tico-modal-grid">
                            <div className="tico-modal-field"><span>Monto</span><strong>{formatMonto(modalDetalle.monto)}</strong></div>
                            <div className="tico-modal-field"><span>Fecha de pago</span><strong>{formatFecha(modalDetalle.fecha_pago)}</strong></div>
                            <div className="tico-modal-field"><span>Método</span><strong>{modalDetalle.metodo_pago}</strong></div>
                            <div className="tico-modal-field">
                                <span>Estado</span>
                                <strong>
                                    <span className={badgeClass(modalDetalle.estado_pago)}>{modalDetalle.estado_pago}</span>
                                </strong>
                            </div>
                        </div>
                        <div className="tico-edit-actions">
                            <button className="tico-btn tico-btn-outline" onClick={() => setModalDetalle(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PagosPage;
