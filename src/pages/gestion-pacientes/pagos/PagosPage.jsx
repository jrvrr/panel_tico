import React, { useState, useMemo, useEffect } from 'react';
import '../pacientes/Pacientes.css';
import { ChevronUp, ChevronDown, Eye, CheckCircle, Trash2, X, Plus, DollarSign, Filter, FilterX, Check, ChevronRight, CreditCard, Receipt, MoreVertical, Edit3, Save, RefreshCw, AlertCircle, User, Calendar, Activity, Wallet } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import PageLoader from '../../../components/PageLoader';
import { normalizeDateInput } from '../../../utils/dateHelper';
import TicoDateInput from '../../../components/TicoDateInput';
import './Pagos.css';
import { getPacientes, getPagos, deletePago, createPago, updatePago } from '../../../services/api';

import '../../metricas/Metricas.css';


const EMPTY_PAGO = {
    paciente_id: '',
    monto: '',
    fecha_pago: '',
    metodo_pago: 'Efectivo',
    estado_pago: 'Pendiente',
    num_tarjeta: '',
    nombre_titular: '',
    expira: '',
    cvv: '',
    referencia: '',
};

// ── Algoritmo de Luhn para validación de tarjetas ──
const validateLuhn = (number) => {
    if (!number) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number.charAt(i), 10);
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
};

const PagosPage = () => {
    const { addNotification } = useNotifications();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [modalDetalle, setModalDetalle] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [formStep, setFormStep] = useState(1); // 1: Datos básicos, 2: Detalles Tarjeta
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
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [tempMonto, setTempMonto] = useState('');
    const [pendingChanges, setPendingChanges] = useState({}); // { id: { monto, estado_pago } }

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
            setLoading(true);
            try {
                const response = await getPacientes();
                setPacientesList(response.data || []);
                await fetchPagos();
            } catch (error) {
                console.error("Error fetching initial data:", error);
                setLoading(false); // Bajar loading incluso si falla algo
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
            items = items.filter(p => p.metodo_pago.startsWith(filterMetodo));
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

    // ── Lógica de Precios Automática (Local) ──
    const applyAutoLogic = (pago, newStatus) => {
        let finalMonto = parseFloat(pago.monto);

        if (newStatus === 'Pendiente') {
            finalMonto = finalMonto * 0.5;
        } else if (newStatus === 'Vencido') {
            finalMonto = finalMonto * 1.05;
        }

        setPendingChanges(prev => ({
            ...prev,
            [pago.id]: {
                ...prev[pago.id],
                estado_pago: newStatus,
                monto: finalMonto.toFixed(2)
            }
        }));
        setMenuOpenId(null);
        import('sonner').then(({ toast }) => toast.info(`Ajuste preparado para ${getNombrePaciente(pago.paciente_id)}`));
    };

    const handleLocalMontoChange = (id, value) => {
        setPendingChanges(prev => ({
            ...prev,
            [id]: { ...prev[id], monto: value }
        }));
        setEditingId(null);
    };

    const handleGuardarTodo = async () => {
        const ids = Object.keys(pendingChanges);
        if (ids.length === 0) return;

        try {
            setSaving(true);
            for (const id of ids) {
                await updatePago(id, pendingChanges[id]);
            }
            await fetchPagos();
            setPendingChanges({});
            import('sonner').then(({ toast }) => toast.success(`Se guardaron los cambios en ${ids.length} registro(s)`));
        } catch (err) {
            import('sonner').then(({ toast }) => toast.error("Error al guardar los cambios masivos"));
        } finally {
            setSaving(false);
        }
    };

    const handleBulkAction = (type) => {
        let count = 0;
        const newChanges = { ...pendingChanges };

        pagos.forEach(p => {
            if (type === '50_PENDIENTE' && p.estado_pago === 'Pendiente') {
                newChanges[p.id] = { ...newChanges[p.id], monto: (parseFloat(p.monto) * 0.5).toFixed(2) };
                count++;
            } else if (type === '5_VENCIDO' && p.estado_pago === 'Vencido') {
                newChanges[p.id] = { ...newChanges[p.id], monto: (parseFloat(p.monto) * 1.05).toFixed(2) };
                count++;
            }
        });

        if (count > 0) {
            setPendingChanges(newChanges);
            import('sonner').then(({ toast }) => toast.info(`Se prepararon ${count} ajustes masivos. Haz clic en 'Guardar' para confirmar.`));
        } else {
            import('sonner').then(({ toast }) => toast.warning("No hay registros que coincidan para esta acción masiva"));
        }
        setMenuOpenId(null);
    };

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
            if (value !== '' && !/^\d*\.?\d*$/.test(value)) return;
            if (value.length > 10) return;
        }
        if (field === 'num_tarjeta') {
            const rawValue = value.replace(/\D/g, '').substring(0, 16);
            value = rawValue.replace(/(.{4})/g, '$1 ').trim();
        }
        if (field === 'expira') {
            const raw = value.replace(/\D/g, '').substring(0, 4);
            if (raw.length <= 2) value = raw;
            else value = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }
        if (field === 'cvv') {
            value = value.replace(/\D/g, '').substring(0, 4);
        }
        if (field === 'nombre_titular') {
            value = value.toUpperCase().substring(0, 30);
        }
        if (field === 'referencia') {
            if (value.length > 20) return;
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

        if (field === 'num_tarjeta' && formNuevo.metodo_pago === 'Tarjeta') {
            const raw = value.replace(/\s/g, '');
            if (!raw) return 'El número de tarjeta es obligatorio';
            if (raw.length < 13) return 'Número incompleto';
            if (!validateLuhn(raw)) return 'Número de tarjeta inválido (Luhn fail)';
        }
        if (field === 'nombre_titular' && formNuevo.metodo_pago === 'Tarjeta') {
            if (!value.trim()) return 'Nombre del titular requerido';
        }
        if (field === 'expira' && formNuevo.metodo_pago === 'Tarjeta') {
            if (!/^\d{2}\/\d{2}$/.test(value)) return 'Formato MM/YY requerido';
            const [m, y] = value.split('/').map(Number);
            if (m < 1 || m > 12) return 'Mes inválido';
        }
        if (field === 'cvv' && formNuevo.metodo_pago === 'Tarjeta') {
            if (value.length < 3) return 'CVV incompleto';
        }
        if (field === 'referencia' && formNuevo.metodo_pago === 'Transferencia') {
            if (!value.trim()) return 'La referencia es obligatoria';
        }
        return undefined;
    };

    const validateForm = () => {
        const errors = {};
        let fields = [];
        if (formStep === 1) {
            fields = ['paciente_id', 'monto', 'fecha_pago'];
            if (formNuevo.metodo_pago === 'Transferencia') fields.push('referencia');
        } else {
            fields = ['num_tarjeta', 'nombre_titular', 'expira', 'cvv'];
        }

        fields.forEach(f => {
            const err = getFieldErrorPago(f, formNuevo[f]);
            if (err) errors[f] = err;
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleRegistrarPago = async () => {
        if (!validateForm()) return;

        // Formatear el método de pago con info extra
        let metodoFinal = formNuevo.metodo_pago;
        if (formNuevo.metodo_pago === 'Tarjeta') {
            const raw = formNuevo.num_tarjeta.replace(/\s/g, '');
            const name = formNuevo.nombre_titular ? ` - ${formNuevo.nombre_titular}` : '';
            metodoFinal = `Tarjeta (****${raw.slice(-4)}${name})`;
        } else if (formNuevo.metodo_pago === 'Transferencia') {
            metodoFinal = `Transferencia (Ref: ${formNuevo.referencia})`;
        }

        const nuevo = {
            ...formNuevo,
            monto: parseFloat(formNuevo.monto),
            paciente_id: parseInt(formNuevo.paciente_id),
            metodo_pago: metodoFinal
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
                setFormStep(1);
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
                <div className="pagos-resumen-card pagos-resumen-pendiente" style={{ position: 'relative', overflow: 'visible' }}>
                    <DollarSign size={20} />
                    <div>
                        <span>Pendiente</span>
                        <strong>{formatMonto(totalPendiente)}</strong>
                    </div>
                    <div className="metricas-card-menu">
                        <button className="metricas-menu-btn" onClick={() => setMenuOpenId(menuOpenId === 'bulk_pendiente' ? null : 'bulk_pendiente')}>
                            <MoreVertical size={16} />
                        </button>
                        {menuOpenId === 'bulk_pendiente' && (
                            <div className="pago-card__dropdown" style={{ top: '2.5rem', right: '0' }}>
                                <div className="dropdown-item" onClick={() => handleBulkAction('50_PENDIENTE')}>
                                    <RefreshCw size={14} /> Aplicar 50% a todos
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="pagos-resumen-card pagos-resumen-vencido" style={{ position: 'relative', overflow: 'visible' }}>
                    <DollarSign size={20} />
                    <div>
                        <span>Vencido</span>
                        <strong>{formatMonto(totalVencido)}</strong>
                    </div>
                    <div className="metricas-card-menu">
                        <button className="metricas-menu-btn" onClick={() => setMenuOpenId(menuOpenId === 'bulk_vencido' ? null : 'bulk_vencido')}>
                            <MoreVertical size={16} />
                        </button>
                        {menuOpenId === 'bulk_vencido' && (
                            <div className="pago-card__dropdown" style={{ top: '2.5rem', right: '0' }}>
                                <div className="dropdown-item" onClick={() => handleBulkAction('5_VENCIDO')}>
                                    <AlertCircle size={14} /> Aplicar 5% recargo a todos
                                </div>
                            </div>
                        )}
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

                {Object.keys(pendingChanges).length > 0 && (
                    <button
                        className="tico-btn tico-btn-primary tico-form-anim-in"
                        onClick={handleGuardarTodo}
                        disabled={saving}
                        style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                    >
                        <Save size={16} /> Guardar {Object.keys(pendingChanges).length} cambios
                    </button>
                )}

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

            {/* Grid de Fichas (Reemplaza a la tabla) */}
            {loading ? (
                <div style={{ padding: '4rem 0' }}>
                    <PageLoader message="Cargando fichas de pago..." />
                </div>
            ) : filteredData.length === 0 ? (
                <div className="metricas-empty" style={{ marginTop: '2rem' }}>
                    <p>No se encontraron registros de pago.</p>
                </div>
            ) : (
                <div className="pagos-grid">
                    {filteredData.map((p) => {
                        const localData = pendingChanges[p.id] || {};
                        const displayMonto = localData.monto !== undefined ? localData.monto : p.monto;
                        const displayEstado = localData.estado_pago !== undefined ? localData.estado_pago : p.estado_pago;

                        const isEditing = editingId === p.id;
                        const isSelected = selectedRows.includes(p.id);
                        const isMenuOpen = menuOpenId === p.id;
                        const hasPending = pendingChanges[p.id] !== undefined;

                        return (
                            <div
                                key={p.id}
                                className={`pago-card ${isSelected ? 'pago-card--selected' : ''} ${hasPending ? 'pago-card--pending' : ''}`}
                                onClick={() => toggleRow(p.id)}
                            >
                                <div className="pago-card__header">
                                    <div className="pago-card__paciente-section">
                                        <div className="pago-card__paciente">{getNombrePaciente(p.paciente_id)}</div>
                                        <div className="pago-card__fecha">{formatFecha(p.fecha_pago)}</div>
                                    </div>
                                    <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                                        <button
                                            className="pago-card__menu-btn"
                                            onClick={() => setMenuOpenId(isMenuOpen ? null : p.id)}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {isMenuOpen && (
                                            <div className="pago-card__dropdown">
                                                <div className="dropdown-item" onClick={() => { setEditingId(p.id); setTempMonto(p.monto); setMenuOpenId(null); }}>
                                                    <Edit3 size={14} /> Editar Precio
                                                </div>
                                                <div className="dropdown-item" onClick={() => applyAutoLogic(p, 'Pendiente')}>
                                                    <RefreshCw size={14} /> Aplicar 50% (Pendiente)
                                                </div>
                                                <div className="dropdown-item" onClick={() => applyAutoLogic(p, 'Vencido')}>
                                                    <AlertCircle size={14} /> Aplicar 5% (Vencido)
                                                </div>
                                                <div className="dropdown-item dropdown-item--danger" onClick={() => { setSelectedRows([p.id]); handleEliminar(); setMenuOpenId(null); }}>
                                                    <Trash2 size={14} /> Eliminar
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pago-card__body">
                                    <div className="pago-card__monto-section">
                                        <span className="pago-card__monto-label">Monto del servicio</span>
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                                                <input
                                                    className="pago-card__edit-input"
                                                    type="number"
                                                    value={tempMonto}
                                                    onChange={e => setTempMonto(e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    className="tico-btn tico-btn-primary"
                                                    style={{ padding: '6px' }}
                                                    onClick={() => handleLocalMontoChange(p.id, tempMonto)}
                                                >
                                                    <Check size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="pago-card__monto-value" style={{ color: hasPending ? '#059669' : '' }}>
                                                {formatMonto(displayMonto)}
                                                {hasPending && <span style={{ fontSize: '0.6rem', display: 'block', opacity: 0.7 }}>Modificado</span>}
                                            </span>
                                        )}
                                    </div>
                                    <div className="pago-card__metodo">
                                        <CreditCard size={14} />
                                        <span>{p.metodo_pago}</span>
                                    </div>
                                </div>

                                <div className="pago-card__footer">
                                    <div className="pago-card__status-group">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className={`pago-card__status-dot status--${displayEstado.toLowerCase()}`} />
                                            <span className={badgeClass(displayEstado)}>{displayEstado}</span>
                                        </div>
                                    </div>
                                    <button
                                        className="tico-btn tico-btn-outline"
                                        style={{ padding: '4px 10px', fontSize: '0.7rem' }}
                                        onClick={(e) => { e.stopPropagation(); setModalDetalle(p); }}
                                    >
                                        Detalles <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Modal: Registrar Pago ── */}
            {modalNuevo && (
                <div className="tico-modal-overlay" onClick={() => { setModalNuevo(false); setFormStep(1); }}>
                    <div className="tico-modal tico-payment-modal-width" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="tico-payment-modal-header">
                            <h2 className="tico-payment-modal-title">Registrar Pago</h2>
                            <button className="tico-payment-modal-close" onClick={() => { setModalNuevo(false); setFormStep(1); }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tico-payment-form-container">
                            <div className={`tico-form-step-container ${formStep === 2 ? 'step-2-active' : ''}`}>
                                
                                {formStep === 1 ? (
                                    <div className="tico-form-step step-1">
                                        <span className="tico-payment-form-hint">* Campos obligatorios</span>
                                        <div className="tico-payment-section-banner">DATOS DEL PAGO</div>

                                        <div className="tico-payment-form-stack">
                                            <div className="tico-payment-input-group">
                                                <label>Paciente *</label>
                                                <div className="tico-input-wrapper">
                                                    <select
                                                        className={`tico-edit-input${formErrors.paciente_id ? ' tico-input-error' : ''}`}
                                                        value={formNuevo.paciente_id}
                                                        onChange={(e) => handleFormChange('paciente_id', e.target.value)}
                                                    >
                                                        <option value="">— Seleccionar paciente —</option>
                                                        {pacientesList.map(p => (
                                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                                        ))}
                                                    </select>
                                                    <User size={18} className="tico-input-icon" />
                                                </div>
                                                {formErrors.paciente_id && <span className="tico-field-error">{formErrors.paciente_id}</span>}
                                            </div>

                                            <div className="tico-form-row2">
                                                <div className="tico-payment-input-group">
                                                    <label>Monto ($) *</label>
                                                    <div className="tico-input-wrapper">
                                                        <input
                                                            className={`tico-edit-input${formErrors.monto ? ' tico-input-error' : ''}`}
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="0.00"
                                                            value={formNuevo.monto}
                                                            onChange={(e) => handleFormChange('monto', e.target.value)}
                                                        />
                                                        <DollarSign size={18} className="tico-input-icon" />
                                                    </div>
                                                    {formErrors.monto && <span className="tico-field-error">{formErrors.monto}</span>}
                                                </div>

                                                <div className="tico-payment-input-group">
                                                    <label>Fecha de pago *</label>
                                                    <div className="tico-input-wrapper">
                                                        <TicoDateInput
                                                            className={`tico-edit-input${formErrors.fecha_pago ? ' tico-input-error' : ''}`}
                                                            value={formNuevo.fecha_pago}
                                                            onChange={(val) => handleFormChange('fecha_pago', val)}
                                                        />
                                                        <Calendar size={18} className="tico-input-icon" />
                                                    </div>
                                                    {formErrors.fecha_pago && <span className="tico-field-error">{formErrors.fecha_pago}</span>}
                                                </div>
                                            </div>

                                            <div className="tico-form-row2">
                                                <div className="tico-payment-input-group">
                                                    <label>Método de pago</label>
                                                    <div className="tico-input-wrapper">
                                                        <select className="tico-edit-input" value={formNuevo.metodo_pago}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormNuevo(prev => ({ ...prev, metodo_pago: val, num_tarjeta: '', referencia: '' }));
                                                            }}>
                                                            <option>Efectivo</option>
                                                            <option>Tarjeta</option>
                                                            <option>Transferencia</option>
                                                        </select>
                                                        <Wallet size={18} className="tico-input-icon" />
                                                    </div>
                                                </div>

                                                <div className="tico-payment-input-group">
                                                    <label>Estado</label>
                                                    <div className="tico-input-wrapper">
                                                        <select className="tico-edit-input" value={formNuevo.estado_pago}
                                                            onChange={(e) => handleFormChange('estado_pago', e.target.value)}>
                                                            <option>Pendiente</option>
                                                            <option>Pagado</option>
                                                            <option>Vencido</option>
                                                        </select>
                                                        <Activity size={18} className="tico-input-icon" />
                                                    </div>
                                                </div>
                                            </div>

                                            {formNuevo.metodo_pago === 'Transferencia' && (
                                                <div className="tico-form-anim-in tico-payment-input-group">
                                                    <label>Referencia o Clave de Rastreo *</label>
                                                    <div className="tico-input-wrapper">
                                                        <input
                                                            className={`tico-edit-input${formErrors.referencia ? ' tico-input-error' : ''}`}
                                                            type="text"
                                                            placeholder="Ej: TR-998877"
                                                            value={formNuevo.referencia}
                                                            onChange={(e) => handleFormChange('referencia', e.target.value)}
                                                        />
                                                        <Receipt size={18} className="tico-input-icon" />
                                                    </div>
                                                    {formErrors.referencia && <span className="tico-field-error">{formErrors.referencia}</span>}
                                                </div>
                                            )}
                                        </div>

                                        <div className="tico-payment-modal-actions">
                                            <button className="tico-btn tico-btn-outline tico-btn-pill-compact" onClick={() => setModalNuevo(false)}>Cancelar</button>
                                            {formNuevo.metodo_pago === 'Tarjeta' ? (
                                                <button className="tico-btn tico-btn-primary tico-btn-pill-compact" onClick={() => validateForm() && setFormStep(2)}>
                                                    Continuar <ChevronRight size={14} className="tico-btn-icon-spacer" />
                                                </button>
                                            ) : (
                                                <button className="tico-btn tico-btn-primary tico-btn-pill-compact" disabled={saving} onClick={handleRegistrarPago}>
                                                    {saving ? 'Registrando...' : 'Registrar pago'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="tico-form-step step-2">
                                        <div className="tico-payment-section-banner centered">DETALLES DE TARJETA</div>
                                        
                                        <div className="tico-visual-card">
                                            <div className="tico-card-chip" />
                                            <div className="tico-card-number">{formNuevo.num_tarjeta || '•••• •••• •••• ••••'}</div>
                                            <div className="tico-card-bottom">
                                                <div className="tico-card-holder">
                                                    <span>TITULAR</span>
                                                    <div>{formNuevo.nombre_titular || 'NOMBRE APELLIDO'}</div>
                                                </div>
                                                <div className="tico-card-expiry">
                                                    <span>EXPIRA</span>
                                                    <div>{formNuevo.expira || 'MM/YY'}</div>
                                                </div>
                                            </div>
                                            <div className="tico-card-type">VISA</div>
                                        </div>

                                        <div className="tico-payment-form-stack">
                                            <label>Número de Tarjeta *
                                                <input
                                                    className={`tico-edit-input ${formErrors.num_tarjeta ? 'tico-input-error' : ''}`}
                                                    type="text"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={formNuevo.num_tarjeta}
                                                    onChange={(e) => handleFormChange('num_tarjeta', e.target.value)}
                                                />
                                                {formErrors.num_tarjeta && <span className="tico-field-error">{formErrors.num_tarjeta}</span>}
                                            </label>
                                            <label>Nombre del Titular *
                                                <input
                                                    className={`tico-edit-input ${formErrors.nombre_titular ? 'tico-input-error' : ''}`}
                                                    type="text"
                                                    placeholder="COMO APARECE EN LA TARJETA"
                                                    value={formNuevo.nombre_titular}
                                                    onChange={(e) => handleFormChange('nombre_titular', e.target.value)}
                                                />
                                                {formErrors.nombre_titular && <span className="tico-field-error">{formErrors.nombre_titular}</span>}
                                            </label>
                                            <div className="tico-form-row2">
                                                <label>Vencimiento (MM/YY) *
                                                    <input
                                                        className={`tico-edit-input ${formErrors.expira ? 'tico-input-error' : ''}`}
                                                        type="text"
                                                        placeholder="MM/YY"
                                                        value={formNuevo.expira}
                                                        onChange={(e) => handleFormChange('expira', e.target.value)}
                                                    />
                                                    {formErrors.expira && <span className="tico-field-error">{formErrors.expira}</span>}
                                                </label>
                                                <label>CVV *
                                                    <input
                                                        className={`tico-edit-input ${formErrors.cvv ? 'tico-input-error' : ''}`}
                                                        type="password"
                                                        placeholder="•••"
                                                        value={formNuevo.cvv}
                                                        onChange={(e) => handleFormChange('cvv', e.target.value)}
                                                    />
                                                    {formErrors.cvv && <span className="tico-field-error">{formErrors.cvv}</span>}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="tico-payment-modal-actions">
                                            <button className="tico-btn tico-btn-outline tico-btn-pill-compact" onClick={() => setFormStep(1)}>Atrás</button>
                                            <button className="tico-btn tico-btn-primary tico-btn-pill-compact" disabled={saving} onClick={handleRegistrarPago}>
                                                {saving ? 'Procesando...' : 'Confirmar y Pagar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message={formStep === 2 ? "Validando tarjeta..." : "Registrando pago..."} />
                                ) : (
                                    <div className="tico-save-success">
                                        <div className="tico-save-success__icon"><Check size={32} /></div>
                                        <span>{saveSuccess}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Modal: Ver Detalle ── */}
            {modalDetalle && (
                <div className="tico-modal-overlay" onClick={() => setModalDetalle(null)}>
                    <div className="tico-modal tico-payment-modal-width" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="tico-payment-modal-header">
                            <h2 className="tico-payment-modal-title">Detalle de Pago</h2>
                            <button className="tico-payment-modal-close" onClick={() => setModalDetalle(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tico-payment-form-container">
                            <div className="tico-modal-grid" style={{ marginBottom: '2rem' }}>
                                <div className="tico-modal-field"><span>Paciente</span><strong>{getNombrePaciente(modalDetalle.paciente_id)}</strong></div>
                                <div className="tico-modal-field"><span>Monto</span><strong>{formatMonto(modalDetalle.monto)}</strong></div>
                                <div className="tico-modal-field"><span>Fecha de pago</span><strong>{formatFecha(modalDetalle.fecha_pago)}</strong></div>
                                <div className="tico-modal-field"><span>Método</span><strong>{modalDetalle.metodo_pago}</strong></div>
                                <div className="tico-modal-field" style={{ gridColumn: 'span 2' }}>
                                    <span>Estado</span>
                                    <div className="tico-modal-badge-row">
                                        <span className={badgeClass(modalDetalle.estado_pago)}>{modalDetalle.estado_pago}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="tico-payment-modal-actions">
                                <button className="tico-btn tico-btn-outline tico-btn-pill-compact" onClick={() => setModalDetalle(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PagosPage;
