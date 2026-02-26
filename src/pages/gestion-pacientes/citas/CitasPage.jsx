import React, { useState, useMemo } from 'react';
import '../pacientes/Pacientes.css';
import { ChevronUp, ChevronDown, Eye, Pencil, X, Plus, XCircle, CheckCircle } from 'lucide-react';

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

    const [citas, setCitas] = useState([
        { id: 1, paciente_nombre: 'Cristhian', tutor: 'Jane Cooper', fecha_cita: '2/19/21', hora_cita: '12:00', observacion_clinica: 'Control mensual', estado_cita: 'Confirmada', progreso_terapia_pct: 75 },
        { id: 2, paciente_nombre: 'Mario', tutor: 'Wade Warren', fecha_cita: '5/7/16', hora_cita: '16:00', observacion_clinica: 'Primera consulta', estado_cita: 'Confirmada', progreso_terapia_pct: 30 },
        { id: 3, paciente_nombre: 'Julio', tutor: 'Esther Howard', fecha_cita: '9/18/16', hora_cita: '18:00', observacion_clinica: 'Revisión terapia', estado_cita: 'Programada', progreso_terapia_pct: 50 },
        { id: 4, paciente_nombre: 'Marcos', tutor: 'Cameron Williamson', fecha_cita: '2/11/12', hora_cita: '11:00', observacion_clinica: 'Seguimiento', estado_cita: 'Confirmada', progreso_terapia_pct: 90 },
        { id: 5, paciente_nombre: 'Ignacio', tutor: 'Brooklyn Simmons', fecha_cita: '9/18/16', hora_cita: '16:00', observacion_clinica: 'Evaluación inicial', estado_cita: 'Programada', progreso_terapia_pct: 10 },
        { id: 6, paciente_nombre: 'Octavio', tutor: 'Leslie Alexander', fecha_cita: '1/28/17', hora_cita: '17:00', observacion_clinica: 'Control peso', estado_cita: 'Programada', progreso_terapia_pct: 60 },
        { id: 7, paciente_nombre: 'Franco', tutor: 'Jenny Wilson', fecha_cita: '5/27/15', hora_cita: '15:00', observacion_clinica: '', estado_cita: 'Completada', progreso_terapia_pct: 100 },
        { id: 8, paciente_nombre: 'Lazario', tutor: 'Guy Hawkins', fecha_cita: '8/2/19', hora_cita: '19:00', observacion_clinica: 'Urgencia', estado_cita: 'Confirmada', progreso_terapia_pct: 45 },
    ]);

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
    const handleEditar = () => setEditCita({ ...selectedSingle });

    const handleCancelar = () => {
        setCitas(prev =>
            prev.map(c => selectedRows.includes(c.id) && c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada'
                ? { ...c, estado_cita: 'Cancelada' } : c)
        );
        setSelectedRows([]);
    };

    const handleConfirmar = () => {
        setCitas(prev =>
            prev.map(c => selectedRows.includes(c.id) && c.estado_cita === 'Programada'
                ? { ...c, estado_cita: 'Confirmada' } : c)
        );
        setSelectedRows([]);
    };

    const handleGuardarEdicion = () => {
        setCitas(prev => prev.map(c => c.id === editCita.id ? { ...editCita } : c));
        setEditCita(null);
        setSelectedRows([]);
    };

    // ── Form nueva cita ──
    const handleFormChange = (field, value) => {
        if (field === 'progreso_terapia_pct') {
            const n = parseInt(value, 10);
            if (isNaN(n)) value = 0;
            else value = Math.max(0, Math.min(100, n));
        }
        setFormNueva(prev => ({ ...prev, [field]: value }));
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

    const handleAgregarCita = () => {
        if (!validateForm()) return;
        const nueva = { id: nextId, ...formNueva };
        setCitas(prev => [...prev, nueva]);
        setNextId(id => id + 1);
        setFormNueva(EMPTY_CITA);
        setFormErrors({});
        setModalNueva(false);
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
                <button className="tico-btn-nuevo" onClick={() => { setFormNueva(EMPTY_CITA); setFormErrors({}); setModalNueva(true); }}>
                    <Plus size={15} /> Nueva Cita
                </button>
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
                        <th>TUTOR</th>
                        <th className="sortable" onClick={() => handleSort('fecha_cita')}>
                            CITA {getSortIcon('fecha_cita')}
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
                            <td>{c.fecha_cita}</td>
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

            {/* ── Modal: Nueva Cita ── */}
            {modalNueva && (
                <div className="tico-modal-overlay" onClick={() => setModalNueva(false)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 95vw)' }}>
                        <button className="tico-modal-close" onClick={() => setModalNueva(false)}>
                            <X size={18} />
                        </button>

                        <h2 className="tico-modal-title">Nueva Cita</h2>
                        <p className="tico-form-hint" style={{ textAlign: 'left' }}>* Campos obligatorios</p>

                        <p className="tico-form-section-label">Datos de la Cita</p>
                        <div className="tico-form-stack">
                            <label>Paciente *
                                <input
                                    className={`tico-edit-input${formErrors.paciente_nombre ? ' tico-input-error' : ''}`}
                                    placeholder="Nombre del paciente"
                                    value={formNueva.paciente_nombre}
                                    onChange={(e) => handleFormChange('paciente_nombre', e.target.value)} />
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
                                    <input
                                        className={`tico-edit-input${formErrors.fecha_cita ? ' tico-input-error' : ''}`}
                                        type="date"
                                        value={formNueva.fecha_cita}
                                        onChange={(e) => handleFormChange('fecha_cita', e.target.value)} />
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

                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => { setModalNueva(false); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" onClick={handleAgregarCita}>
                                Agregar cita
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Ver Detalle ── */}
            {modalCita && (
                <div className="tico-modal-overlay" onClick={() => setModalCita(null)}>
                    <div className="tico-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setModalCita(null)}>
                            <X size={18} />
                        </button>
                        <div className="tico-modal-avatar">📋</div>
                        <h2 className="tico-modal-title">{modalCita.paciente_nombre}</h2>
                        <div className="tico-modal-grid">
                            <div className="tico-modal-field"><span>Tutor</span><strong>{modalCita.tutor}</strong></div>
                            <div className="tico-modal-field"><span>Fecha</span><strong>{modalCita.fecha_cita}</strong></div>
                            <div className="tico-modal-field"><span>Hora</span><strong>{modalCita.hora_cita}</strong></div>
                            <div className="tico-modal-field"><span>Estado</span><strong>{modalCita.estado_cita}</strong></div>
                            <div className="tico-modal-field">
                                <span>Progreso terapia</span>
                                <strong>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                        <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '100px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${modalCita.progreso_terapia_pct}%`, background: 'var(--tico-primary)', borderRadius: '100px', transition: 'width 0.3s' }} />
                                        </div>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--tico-primary)', minWidth: '32px', textAlign: 'right' }}>{modalCita.progreso_terapia_pct}%</span>
                                    </div>
                                </strong>
                            </div>
                            <div className="tico-modal-field">
                                <span>Observación</span>
                                <strong>{modalCita.observacion_clinica || '—'}</strong>
                            </div>
                        </div>
                        <div className="tico-edit-actions">
                            <button className="tico-btn tico-btn-outline" onClick={() => setModalCita(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Editar Cita ── */}
            {editCita && (
                <div className="tico-modal-overlay" onClick={() => setEditCita(null)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()} style={{ width: 'min(560px, 95vw)' }}>
                        <button className="tico-modal-close" onClick={() => setEditCita(null)}>
                            <X size={18} />
                        </button>
                        <h2 className="tico-modal-title">Editar Cita</h2>

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
                                    <input className="tico-edit-input" value={editCita.fecha_cita}
                                        onChange={(e) => setEditCita({ ...editCita, fecha_cita: e.target.value })} />
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
