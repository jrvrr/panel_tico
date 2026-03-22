import React, { useState, useMemo, useEffect } from 'react';
import '../pacientes/Pacientes.css';
import {
    ChevronUp, ChevronDown, Eye, Pencil, X, Plus, XCircle, CheckCircle, Calendar, List,
    Clock, Activity, FileText, User, ShieldCheck, Mail, Phone
} from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import { getPacientes, getCitas, createCita, updateCita } from '../../../services/api';
import CalendarioCitas from './CalendarioCitas';
import { normalizeDateInput } from '../../../utils/dateHelper';
import TicoDateInput from '../../../components/TicoDateInput';

const EMPTY_CITA = {
    paciente_nombre: '',
    tutor: '',
    fecha_cita: '',
    hora_cita: '',
    observacion_clinica: '',
    estado_cita: 'Programada',
    progreso_terapia_pct: 0,
};

const CitasPage = () => {
    const { addNotification } = useNotifications();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [modalCita, setModalCita] = useState(null);
    const [editCita, setEditCita] = useState(null);
    const [modalNueva, setModalNueva] = useState(false);
    const [formNueva, setFormNueva] = useState(EMPTY_CITA);
    const [formErrors, setFormErrors] = useState({});
    const [searchText, setSearchText] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [nextId, setNextId] = useState(9);

    const [citas, setCitas] = useState([]);

    const [viewMode, setViewMode] = useState('list'); // 'list' o 'calendar'

    const [pacientesList, setPacientesList] = useState([]);

    const loadCitas = async () => {
        try {
            const response = await getCitas();
            setCitas(response.data || []);
        } catch (error) {
            console.error("Error cargando citas:", error);
        }
    };

    useEffect(() => {
        loadCitas();
        const fetchPacientes = async () => {
            try {
                const response = await getPacientes();
                setPacientesList(response.data || []);
            } catch (error) {
                console.error("Error fetching pacientes for appointments:", error);
            }
        };
        fetchPacientes();
    }, []);

    // ── Selección ──
    const toggleRow = (id) =>
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelectedRows(selectedRows.length === filteredData.length ? [] : filteredData.map(c => c.id));

    // ── Datos derivados ──
    const selectedSingle = selectedRows.length === 1 ? citas.find(c => c.id === selectedRows[0]) : null;
    const selectedMulti = selectedRows.length > 1;
    const selectedCitas = citas.filter(c => selectedRows.includes(c.id));
    const hayCancelables = selectedCitas.some(c => c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada');
    const hayConfirmables = selectedCitas.some(c => c.estado_cita === 'Programada');
    const showToolbar = selectedRows.length > 0;

    // ── Ordenamiento + filtrado ──
    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, fontSize: '0.8em', marginLeft: '4px' }}>⇅</span>;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
    };

    const formatFecha = (f) => {
        if (!f) return '—';
        if (f.includes('-')) {
            const [y, m, d] = f.split('-');
            return `${d}/${m}/${y}`;
        }
        return f;
    };

    const filteredData = useMemo(() => {
        let items = [...citas];
        if (searchText.trim())
            items = items.filter(c =>
                c.paciente_nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                c.tutor.toLowerCase().includes(searchText.toLowerCase())
            );
        if (filterEstado)
            items = items.filter(c => c.estado_cita === filterEstado);
        if (sortConfig.key)
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        return items;
    }, [citas, sortConfig, searchText, filterEstado]);

    // ── Acciones ──
    const handleVerDetalle = () => setModalCita(selectedSingle);

    const handleNuevaCitaFecha = (fecha) => {
        setFormNueva({ ...EMPTY_CITA, fecha_cita: fecha });
        setFormErrors({});
        setModalNueva(true);
    };
    const handleEditar = () => setEditCita({ ...selectedSingle });

    const handleCancelar = async () => {
        try {
            const activas = selectedCitas.filter(c => c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada');
            await Promise.all(activas.map(c => updateCita(c.id, { ...c, estado_cita: 'Cancelada' })));
            await loadCitas();
            import('sonner').then(({ toast }) => toast.warning(`Se cancelaron ${activas.length} cita(s)`));
            addNotification({
                tipo: 'cita',
                titulo: 'Citas canceladas',
                mensaje: `Se cancelaron ${activas.length} cita(s) en el sistema.`,
                nivel: 'warning'
            });
            setSelectedRows([]);
        } catch (error) {
            import('sonner').then(({ toast }) => toast.error(`Error al cancelar: ${error.message}`));
        }
    };

    const handleConfirmar = async () => {
        try {
            const programadas = selectedCitas.filter(c => c.estado_cita === 'Programada');
            await Promise.all(programadas.map(c => updateCita(c.id, { ...c, estado_cita: 'Confirmada' })));
            await loadCitas();
            import('sonner').then(({ toast }) => toast.success(`Se confirmaron ${programadas.length} cita(s)`));
            addNotification({
                tipo: 'cita',
                titulo: 'Citas confirmadas',
                mensaje: `Se confirmaron ${programadas.length} cita(s) en el sistema.`,
                nivel: 'success'
            });
            setSelectedRows([]);
        } catch (error) {
            import('sonner').then(({ toast }) => toast.error(`Error al confirmar: ${error.message}`));
        }
    };

    const handleGuardarEdicion = async () => {
        try {
            await updateCita(editCita.id, editCita);
            await loadCitas();
            import('sonner').then(({ toast }) => toast.success(`Cita actualizada exitosamente`));
            addNotification({
                tipo: 'cita',
                titulo: 'Cita actualizada',
                mensaje: `Se modificó la cita del paciente ${editCita.paciente_nombre}.`,
                nivel: 'info'
            });
            setEditCita(null);
            setSelectedRows([]);
        } catch (error) {
            import('sonner').then(({ toast }) => toast.error(`Error al actualizar cita: ${error.message}`));
        }
    };

    // ── Form nueva cita ──
    const handleFormChange = (field, value) => {
        if (field === 'progreso_terapia_pct') {
            const n = parseInt(value, 10);
            if (isNaN(n)) value = 0;
            else value = Math.max(0, Math.min(100, n));
        }

        setFormNueva(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-fill tutor y paciente_id when patient changes
            if (field === 'paciente_nombre') {
                const selectedPatient = pacientesList.find(p => p.nombre === value || p.paciente === value);
                if (selectedPatient) {
                    updated.tutor = selectedPatient.tutor_nombre || selectedPatient.tutor || 'N/D';
                    updated.paciente_id = selectedPatient.id;
                } else {
                    updated.tutor = '';
                    updated.paciente_id = null;
                }
            }
            return updated;
        });

        setFormErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formNueva.paciente_nombre.trim())
            errors.paciente_nombre = 'El nombre del paciente es obligatorio';
        if (!formNueva.tutor.trim())
            errors.tutor = 'El nombre del tutor es obligatorio';
        if (!formNueva.fecha_cita)
            errors.fecha_cita = 'La fecha es obligatoria';
        if (!formNueva.hora_cita)
            errors.hora_cita = 'La hora es obligatoria';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAgregarCita = async () => {
        if (!validateForm()) return;
        try {
            await createCita(formNueva);
            await loadCitas();
            import('sonner').then(({ toast }) => toast.success(`Cita agendada para ${formNueva.paciente_nombre}`));
            addNotification({
                tipo: 'cita',
                titulo: 'Nueva cita agendada',
                mensaje: `Se programó una cita para ${formNueva.paciente_nombre} a las ${formNueva.hora_cita}.`,
                nivel: 'success'
            });
            setFormNueva(EMPTY_CITA);
            setFormErrors({});
            setModalNueva(false);
        } catch (error) {
            import('sonner').then(({ toast }) => toast.error(`Error al crear cita: ${error.message}`));
        }
    };

    const labelSeleccion = selectedRows.length === 1
        ? '1 seleccionado'
        : `${selectedRows.length} seleccionados`;

    const badgeClass = (estado) => {
        if (estado === 'Confirmada') return 'tico-badge tico-badge-bajo';
        if (estado === 'Programada') return 'tico-badge tico-badge-alto';
        if (estado === 'Cancelada') return 'tico-badge tico-badge-cancelada';
        if (estado === 'Completada') return 'tico-badge tico-badge-completada';
        return 'tico-badge';
    };

    const badgeLabel = (estado) => {
        if (estado === 'Confirmada') return 'Confirmado';
        if (estado === 'Programada') return 'Sin confirmar';
        return estado;
    };

    // ── Render ──
    return (
        <div className="tico-container">

            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Listado de Citas</h1>
                    <p className="tico-subtitle">Administra la programación y seguimiento de citas</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="tico-view-toggle">
                        <button
                            className={`tico-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} /> Lista
                        </button>
                        <button
                            className={`tico-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            <Calendar size={16} /> Calendario
                        </button>
                    </div>
                    <button className="tico-btn-nuevo" onClick={() => { setFormNueva(EMPTY_CITA); setFormErrors({}); setModalNueva(true); }}>
                        <Plus size={15} /> Nueva Cita
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <div className="tico-toolbar">
                <input
                    className="tico-search"
                    placeholder="Buscar paciente o tutor…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <select className="tico-filter-select" value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                    <option value="">Todos los estados</option>
                    <option value="Programada">Programada</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Completada">Completada</option>
                </select>

                {showToolbar && (
                    <div className="tico-toolbar-actions">
                        <span className="tico-selection-label">{labelSeleccion}</span>

                        {selectedSingle && (
                            <>
                                <button className="tico-btn tico-btn-action tico-btn-ver" onClick={handleVerDetalle}>
                                    <Eye size={14} /> Ver detalle
                                </button>
                                <button className="tico-btn tico-btn-action tico-btn-edit" onClick={handleEditar}>
                                    <Pencil size={14} /> Editar
                                </button>
                            </>
                        )}

                        {hayConfirmables && (
                            <button className="tico-btn tico-btn-action tico-btn-reactivar" onClick={handleConfirmar}>
                                <CheckCircle size={14} />
                                {selectedMulti ? `Confirmar (${selectedCitas.filter(c => c.estado_cita === 'Programada').length})` : 'Confirmar'}
                            </button>
                        )}

                        {hayCancelables && (
                            <button className="tico-btn tico-btn-action tico-btn-inhabilitar" onClick={handleCancelar}>
                                <XCircle size={14} />
                                {selectedMulti ? `Cancelar (${selectedCitas.filter(c => c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada').length})` : 'Cancelar'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Contenido Principal */}
            {viewMode === 'calendar' ? (
                <CalendarioCitas
                    citas={filteredData}
                    onVerDetalle={(cita) => setModalCita(cita)}
                    onNuevaCitaFecha={handleNuevaCitaFecha}
                />
            ) : (
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
                            <th>TUTOR</th>
                            <th className="sortable" onClick={() => handleSort('fecha_cita')}>
                                FECHA {getSortIcon('fecha_cita')}
                            </th>
                            <th>HORA</th>
                            <th>NOTIFICACIÓN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((c) => (
                            <tr
                                key={c.id}
                                className={[
                                    selectedRows.includes(c.id) ? 'selected' : '',
                                    c.estado_cita === 'Cancelada' ? 'inhabilitado' : '',
                                ].join(' ').trim()}
                                onClick={() => toggleRow(c.id)}
                            >
                                <td onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        className="tico-checkbox"
                                        checked={selectedRows.includes(c.id)}
                                        onChange={() => toggleRow(c.id)}
                                    />
                                </td>
                                <td>{c.paciente_nombre}</td>
                                <td>{c.tutor}</td>
                                <td>{formatFecha(c.fecha_cita)}</td>
                                <td>{c.hora_cita}</td>
                                <td>
                                    <span className={badgeClass(c.estado_cita)}>
                                        {badgeLabel(c.estado_cita)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                    No se encontraron citas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}

            {/* ── Modal: Nueva Cita ── */}
            {modalNueva && (
                <div className="tico-modal-overlay" onClick={() => setModalNueva(false)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 95vw)' }}>
                        <div className="tico-modal-header">
                            <h2 className="tico-modal-title">Nueva Cita</h2>
                            <button className="tico-modal-close" onClick={() => setModalNueva(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tico-modal-content">
                            <p className="tico-form-hint" style={{ textAlign: 'left' }}>* Campos obligatorios</p>

                            <p className="tico-form-section-label">Datos de la Cita</p>
                            <div className="tico-form-stack">
                                <label>Paciente *
                                    <select
                                        className={`tico-edit-input${formErrors.paciente_nombre ? ' tico-input-error' : ''}`}
                                        value={formNueva.paciente_nombre}
                                        onChange={(e) => handleFormChange('paciente_nombre', e.target.value)}
                                    >
                                        <option value="">— Seleccionar paciente —</option>
                                        {pacientesList.map(p => (
                                            <option key={p.id} value={p.nombre}>{p.nombre}</option>
                                        ))}
                                    </select>
                                    {formErrors.paciente_nombre && <span className="tico-field-error">{formErrors.paciente_nombre}</span>}
                                </label>
                                <label>Tutor *
                                    <input
                                        className={`tico-edit-input${formErrors.tutor ? ' tico-input-error' : ''}`}
                                        placeholder="Nombre del tutor"
                                        value={formNueva.tutor}
                                        onChange={(e) => handleFormChange('tutor', e.target.value)} />
                                    {formErrors.tutor && <span className="tico-field-error">{formErrors.tutor}</span>}
                                </label>
                                <div className="tico-form-row2">
                                    <label>Fecha de cita *
                                        <TicoDateInput
                                            className={`tico-edit-input${formErrors.fecha_cita ? ' tico-input-error' : ''}`}
                                            value={formNueva.fecha_cita}
                                            onChange={(val) => handleFormChange('fecha_cita', val)} />
                                        {formErrors.fecha_cita && <span className="tico-field-error">{formErrors.fecha_cita}</span>}
                                    </label>
                                    <label>Hora *
                                        <input
                                            className={`tico-edit-input${formErrors.hora_cita ? ' tico-input-error' : ''}`}
                                            type="time"
                                            value={formNueva.hora_cita}
                                            onChange={(e) => handleFormChange('hora_cita', e.target.value)} />
                                        {formErrors.hora_cita && <span className="tico-field-error">{formErrors.hora_cita}</span>}
                                    </label>
                                </div>
                                <label>Observación clínica
                                    <textarea
                                        className="tico-edit-input"
                                        rows={3}
                                        placeholder="Notas sobre la cita (opcional)"
                                        value={formNueva.observacion_clinica}
                                        onChange={(e) => handleFormChange('observacion_clinica', e.target.value)}
                                        style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                                </label>
                                <div className="tico-form-row2">
                                    <label>Estado
                                        <select className="tico-edit-input" value={formNueva.estado_cita}
                                            onChange={(e) => handleFormChange('estado_cita', e.target.value)}>
                                            <option>Programada</option>
                                            <option>Confirmada</option>
                                        </select>
                                    </label>
                                    <label>Progreso terapia (%)
                                        <input className="tico-edit-input" type="number" min="0" max="100" placeholder="0"
                                            value={formNueva.progreso_terapia_pct}
                                            onChange={(e) => handleFormChange('progreso_terapia_pct', e.target.value)} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => { setModalNueva(false); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" onClick={handleAgregarCita}>
                                Agregar cita
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Ver Detalle Premium ── */}
            {modalCita && (
                <div className="tico-modal-overlay" onClick={() => setModalCita(null)}>
                    <div className="tico-profile-card" onClick={(e) => e.stopPropagation()} style={{ width: 'min(550px, 95vw)' }}>
                        <button className="tico-modal-close-v2" onClick={() => setModalCita(null)}>
                            <X size={20} />
                        </button>

                        <div className="tico-profile-hero">
                            <div className="esp-foto-initials-lg" style={{ background: 'linear-gradient(135deg, #4c7bc7 0%, #7da0d9 100%)' }}>
                                <Calendar size={32} color="white" />
                            </div>
                            <div className="tico-profile-hero-info">
                                <h2 className="tico-profile-hero-name">{modalCita.paciente_nombre}</h2>
                                <p className="tico-profile-hero-subtitle">Detalles de la Cita</p>
                            </div>
                        </div>

                        <div className="tico-profile-grid">
                            <div className="tico-field-box">
                                <span className="tico-field-box-label"><Calendar size={12} /> Fecha</span>
                                <span className="tico-field-box-value">{formatFecha(modalCita.fecha_cita)}</span>
                            </div>
                            <div className="tico-field-box">
                                <span className="tico-field-box-label"><Clock size={12} /> Hora</span>
                                <span className="tico-field-box-value">{modalCita.hora_cita}</span>
                            </div>

                            <div className="tico-field-box">
                                <span className="tico-field-box-label"><Activity size={12} /> Estado</span>
                                <div className="tico-field-box-value">
                                    <span className={badgeClass(modalCita.estado_cita)}>
                                        {badgeLabel(modalCita.estado_cita)}
                                    </span>
                                </div>
                            </div>
                            <div className="tico-field-box">
                                <span className="tico-field-box-label"><Activity size={12} /> Progreso</span>
                                <div className="tico-field-box-value">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${modalCita.progreso_terapia_pct}%`,
                                                background: 'var(--tico-primary)',
                                                borderRadius: '100px',
                                                transition: 'width 0.4s ease'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--tico-primary)', minWidth: '35px' }}>
                                            {modalCita.progreso_terapia_pct}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="tico-field-box full-width" style={{ background: 'rgba(76, 123, 199, 0.05)', border: '1px solid rgba(76, 123, 199, 0.1)' }}>
                                <span className="tico-field-box-label"><User size={12} /> Información de Contacto</span>
                                <div className="tico-field-box-value" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Tutor</div>
                                        <div>{modalCita.tutor || '—'}</div>
                                    </div>
                                    {modalCita.telefono && (
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Teléfono</div>
                                            <div>{modalCita.telefono}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="tico-field-box full-width">
                                <span className="tico-field-box-label"><FileText size={12} /> Observación Clínica</span>
                                <span className="tico-field-box-value text-small">
                                    {modalCita.observacion_clinica || 'Sin observaciones para esta cita.'}
                                </span>
                            </div>
                        </div>

                        <div className="tico-profile-footer-v2">
                            <button className="tico-btn tico-btn-outline" onClick={() => setModalCita(null)} style={{ borderRadius: '12px', padding: '0.6rem 2.5rem' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Editar Cita ── */}
            {editCita && (
                <div className="tico-modal-overlay" onClick={() => setEditCita(null)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 95vw)' }}>
                        <div className="tico-modal-header">
                            <h2 className="tico-modal-title">Editar Cita</h2>
                            <button className="tico-modal-close" onClick={() => setEditCita(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="tico-modal-content">
                            <p className="tico-form-section-label">Datos de la Cita</p>
                            <div className="tico-form-stack">
                                <label>Paciente
                                    <input className="tico-edit-input" value={editCita.paciente_nombre}
                                        onChange={(e) => setEditCita({ ...editCita, paciente_nombre: e.target.value })} />
                                </label>
                                <label>Tutor
                                    <input className="tico-edit-input" value={editCita.tutor}
                                        onChange={(e) => setEditCita({ ...editCita, tutor: e.target.value })} />
                                </label>
                                <div className="tico-form-row2">
                                    <label>Fecha
                                        <TicoDateInput className="tico-edit-input"
                                            value={editCita.fecha_cita}
                                            onChange={(val) => setEditCita({ ...editCita, fecha_cita: val })} />
                                    </label>
                                    <label>Hora
                                        <input className="tico-edit-input" type="time" value={editCita.hora_cita}
                                            onChange={(e) => setEditCita({ ...editCita, hora_cita: e.target.value })} />
                                    </label>
                                </div>
                                <label>Observación clínica
                                    <textarea className="tico-edit-input" rows={3} value={editCita.observacion_clinica}
                                        onChange={(e) => setEditCita({ ...editCita, observacion_clinica: e.target.value })}
                                        style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                                </label>
                                <div className="tico-form-row2">
                                    <label>Estado
                                        <select className="tico-edit-input" value={editCita.estado_cita}
                                            onChange={(e) => setEditCita({ ...editCita, estado_cita: e.target.value })}>
                                            <option>Programada</option>
                                            <option>Confirmada</option>
                                            <option>Cancelada</option>
                                            <option>Completada</option>
                                        </select>
                                    </label>
                                    <label>Progreso (%)
                                        <input className="tico-edit-input" type="number" min="0" max="100"
                                            value={editCita.progreso_terapia_pct}
                                            onChange={(e) => setEditCita({ ...editCita, progreso_terapia_pct: Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0)) })} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => setEditCita(null)}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" onClick={handleGuardarEdicion}>
                                Guardar cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CitasPage;
