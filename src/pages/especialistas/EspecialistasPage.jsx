import React, { useState, useMemo, useRef, useEffect } from 'react';
import '../gestion-pacientes/pacientes/Pacientes.css';
import './Especialistas.css';
import { getEspecialistas } from '../../services/api';
import {
    ChevronUp, ChevronDown, Eye, Pencil, UserX, UserCheck,
    X, Plus, SlidersHorizontal, FilterX, ShieldCheck,
    BadgeCheck, Camera, EyeOff, Loader2, Star
} from 'lucide-react';

// ── Roles (espejo de la BD) ──────────────────────────────────────────────────
const ESPECIALIDADES = [
    'Psiquiatría',
    'Psicología Clínica',
    'Terapia Ocupacional',
    'Trabajo Social',
    'Neuropsicología',
    'Psicoterapia',
    'Otro',
];

const EMPTY_FORM = {
    nombre: '',
    email: '',
    password: '',
    especialidad_principal: 'Psiquiatría',
    fecha_nacimiento: '',
    telefono: '',
    biografia: '',
    foto_url: '',
    cedula_profesional: '',
    estado_activo: true,
    rol_id: 2,
};

// ── Datos de muestra ─────────────────────────────────────────────────────────
const INITIAL_DATA = [
    {
        id: 1, rol_id: 1,
        nombre: 'Dr. Ricardo Montoya Vega',
        email: 'r.montoya@tico.mx',
        especialidad_principal: 'Psiquiatría',
        fecha_nacimiento: '1975-04-12',
        telefono: '55 1234-5678',
        biografia: 'Director del Centro TICO. Más de 20 años de experiencia en psiquiatría infantil y adolescente.',
        foto_url: '',
        cedula_profesional: '3214567',
        cedula_verificada: true,
        estado_activo: true,
    },
    {
        id: 2, rol_id: 2,
        nombre: 'Dra. Sofía Herrera Luna',
        email: 's.herrera@tico.mx',
        especialidad_principal: 'Psicología Clínica',
        fecha_nacimiento: '1988-09-23',
        telefono: '55 9876-5432',
        biografia: 'Especialista en terapia cognitivo-conductual para niños y adolescentes.',
        foto_url: '',
        cedula_profesional: '8876234',
        cedula_verificada: true,
        estado_activo: true,
    },
    {
        id: 3, rol_id: 2,
        nombre: 'Lic. Andrés Fuentes Rojas',
        email: 'a.fuentes@tico.mx',
        especialidad_principal: 'Terapia Ocupacional',
        fecha_nacimiento: '1993-02-08',
        telefono: '55 4455-6677',
        biografia: '',
        foto_url: '',
        cedula_profesional: '',
        cedula_verificada: false,
        estado_activo: true,
    },
    {
        id: 4, rol_id: 2,
        nombre: 'Lic. Mariana Campos Díaz',
        email: 'm.campos@tico.mx',
        especialidad_principal: 'Trabajo Social',
        fecha_nacimiento: '1990-11-30',
        telefono: '',
        biografia: 'Enfocada en la vinculación entre familias y el centro.',
        foto_url: '',
        cedula_profesional: '5543210',
        cedula_verificada: true,
        estado_activo: false,
    },
    {
        id: 5, rol_id: 2,
        nombre: 'Dr. Emilio Vargas Cruz',
        email: 'e.vargas@tico.mx',
        especialidad_principal: 'Neuropsicología',
        fecha_nacimiento: '1985-06-15',
        telefono: '55 3322-1100',
        biografia: 'Especialización en evaluación neuropsicológica pediátrica.',
        foto_url: '',
        cedula_profesional: '9923456',
        cedula_verificada: false,
        estado_activo: true,
    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (nombre = '') => {
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatFecha = (f) => {
    if (!f) return '—';
    const [y, m, d] = f.split('-');
    return `${d}/${m}/${y}`;
};

// ── Cédulas conocidas para simulación ────────────────────────────────────────
const CEDULAS_CONOCIDAS = ['3214567', '8876234', '5543210', '1234567', '9876543', '7654321'];
const verificarCedula = (cedula) =>
    new Promise((resolve) => {
        setTimeout(() => {
            const digits = cedula.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 10) {
                resolve({ ok: false, mensaje: 'Formato inválido (7–10 dígitos)' });
            } else if (CEDULAS_CONOCIDAS.includes(digits)) {
                resolve({ ok: true, mensaje: 'Cédula verificada ✓' });
            } else {
                resolve({ ok: false, mensaje: 'No encontrada en el registro SEP' });
            }
        }, 900);
    });

// ════════════════════════════════════════════════════════════════════════════
// Sub-componentes FUERA del componente principal para evitar re-montaje
// ════════════════════════════════════════════════════════════════════════════

const Avatar = ({ esp, size = 'sm' }) => {
    const cls = size === 'lg' ? 'esp-foto-preview' : 'esp-avatar';
    const clsInitials = size === 'lg' ? 'esp-foto-initials-lg' : 'esp-avatar-initials';
    if (esp.foto_url)
        return <img src={esp.foto_url} alt={esp.nombre} className={cls} />;
    return <div className={clsInitials}>{getInitials(esp.nombre)}</div>;
};

const RolBadge = ({ rolId }) => {
    if (rolId === 1)
        return (
            <span className="esp-role-badge esp-role-super-admin">
                <Star size={10} /> SUPER ADMIN
            </span>
        );
    return <span className="esp-role-badge esp-role-especialista">ESPECIALISTA</span>;
};

const CedulaBadge = ({ verificada }) =>
    verificada
        ? <span className="esp-cedula-badge esp-cedula-verificada"><BadgeCheck size={11} /> Verificada</span>
        : <span className="esp-cedula-badge esp-cedula-no-verificada">Sin verificar</span>;

// FormBody recibe TODO lo que necesita por props → sin closures sobre estado del padre
const FormBody = ({
    isEdit,
    formData,
    formErrors,
    handleFormChange,
    fileInputRef,
    handleFotoChange,
    showPassword,
    setShowPassword,
    cedulaStatus,
    cedulaMensaje,
    handleVerificarCedula,
}) => (
    <div className="tico-form-stack">

        {/* Foto */}
        <div className="esp-foto-preview-wrap">
            {formData.foto_url
                ? <img src={formData.foto_url} alt="preview" className="esp-foto-preview" />
                : <div className="esp-foto-initials-lg">{getInitials(formData.nombre) || '?'}</div>
            }
            <label className="esp-foto-label" onClick={() => fileInputRef.current?.click()}>
                <Camera size={12} style={{ display: 'inline', marginRight: '4px' }} />
                {formData.foto_url ? 'Cambiar foto' : 'Subir foto de perfil'}
            </label>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFotoChange}
            />
        </div>

        {/* Datos personales */}
        <p className="esp-form-section"><ShieldCheck size={13} /> Datos personales</p>

        <label>Nombre completo *
            <input
                className={`tico-edit-input${formErrors.nombre ? ' tico-input-error' : ''}`}
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={e => handleFormChange('nombre', e.target.value)}
            />
            {formErrors.nombre && <span className="tico-field-error">{formErrors.nombre}</span>}
        </label>

        <div className="tico-form-row2">
            <label>Email *
                <input
                    className={`tico-edit-input${formErrors.email ? ' tico-input-error' : ''}`}
                    type="email"
                    placeholder="ejemplo@tico.mx"
                    value={formData.email}
                    onChange={e => handleFormChange('email', e.target.value)}
                />
                {formErrors.email && <span className="tico-field-error">{formErrors.email}</span>}
            </label>
            <label>Teléfono
                <input
                    className="tico-edit-input"
                    placeholder="55 0000-0000"
                    value={formData.telefono}
                    onChange={e => {
                        if (!/^[\d\s+()\-]*$/.test(e.target.value)) return;
                        handleFormChange('telefono', e.target.value);
                    }}
                />
            </label>
        </div>

        {!isEdit && (
            <label>Contraseña *
                <div className="esp-password-wrap">
                    <input
                        className={`tico-edit-input${formErrors.password ? ' tico-input-error' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={e => handleFormChange('password', e.target.value)}
                    />
                    <button
                        type="button"
                        className="esp-password-toggle"
                        onClick={() => setShowPassword(s => !s)}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                </div>
                {formErrors.password && <span className="tico-field-error">{formErrors.password}</span>}
            </label>
        )}

        <div className="tico-form-row2">
            <label>Especialidad principal
                <select
                    className="tico-edit-input"
                    value={formData.especialidad_principal}
                    onChange={e => handleFormChange('especialidad_principal', e.target.value)}
                >
                    {ESPECIALIDADES.map(esp => (
                        <option key={esp}>{esp}</option>
                    ))}
                </select>
            </label>
            <label>Fecha de nacimiento
                <input
                    className="tico-edit-input"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={e => handleFormChange('fecha_nacimiento', e.target.value)}
                />
            </label>
        </div>

        <label>Biografía
            <textarea
                className="tico-edit-input"
                rows={3}
                placeholder="Breve descripción profesional..."
                style={{ resize: 'vertical', minHeight: '64px' }}
                value={formData.biografia}
                onChange={e => handleFormChange('biografia', e.target.value)}
            />
        </label>

        {/* Cédula profesional */}
        <p className="esp-form-section"><BadgeCheck size={13} /> Cédula profesional</p>

        <label>Número de cédula
            <div className="esp-cedula-row">
                <input
                    className="tico-edit-input"
                    placeholder="Ej. 3214567 (7–10 dígitos)"
                    value={formData.cedula_profesional}
                    onChange={e => handleFormChange('cedula_profesional', e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                />
                <button
                    type="button"
                    className="esp-btn-verificar"
                    onClick={handleVerificarCedula}
                    disabled={!formData.cedula_profesional || cedulaStatus === 'checking'}
                >
                    {cedulaStatus === 'checking'
                        ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Verificando…</>
                        : 'Verificar'}
                </button>
            </div>
            {cedulaStatus === 'ok' && (
                <div className="esp-cedula-result">
                    <span className="esp-cedula-badge esp-cedula-verificada"><BadgeCheck size={11} /> {cedulaMensaje}</span>
                </div>
            )}
            {cedulaStatus === 'error' && (
                <div className="esp-cedula-result">
                    <span className="esp-cedula-badge esp-cedula-error">✕ {cedulaMensaje}</span>
                </div>
            )}
        </label>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
const EspecialistasPage = () => {
    // ── Estado principal ──
    const [especialistas, setEspecialistas] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ── Cargar desde API ──
    useEffect(() => {
        getEspecialistas()
            .then(data => {
                // La API devuelve { data: [...] }
                const list = Array.isArray(data) ? data : (data.data ?? []);
                setEspecialistas(list);
                const maxId = list.reduce((acc, e) => Math.max(acc, e.id), 0);
                setNextId(maxId + 1);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // ── Selección ──
    const [selectedRows, setSelectedRows] = useState([]);

    // ── Ordenamiento ──
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // ── Búsqueda y filtros ──
    const [searchText, setSearchText] = useState('');
    const [filterRol, setFilterRol] = useState('');
    const [filterEstado, setFilterEstado] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);

    // ── Modales ──
    const [modalPerfil, setModalPerfil] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [modalEditar, setModalEditar] = useState(null);

    // ── Formulario ──
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // ── Cédula ──
    const [cedulaStatus, setCedulaStatus] = useState(null);
    const [cedulaMensaje, setCedulaMensaje] = useState('');
    const fileInputRef = useRef(null);

    // ── Filtrado + ordenamiento ───────────────────────────────────────────
    const filteredData = useMemo(() => {
        let items = [...especialistas];
        if (searchText.trim())
            items = items.filter(e =>
                e.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
                e.email.toLowerCase().includes(searchText.toLowerCase())
            );
        if (filterRol)
            items = items.filter(e => String(e.rol_id) === filterRol);
        if (filterEstado !== '')
            items = items.filter(e =>
                filterEstado === 'activo' ? e.estado_activo : !e.estado_activo
            );
        if (sortConfig.key)
            items.sort((a, b) => {
                const av = a[sortConfig.key] ?? '';
                const bv = b[sortConfig.key] ?? '';
                if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
                if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        return items;
    }, [especialistas, sortConfig, searchText, filterRol, filterEstado]);

    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, fontSize: '0.8em', marginLeft: '4px' }}>⇅</span>;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
    };

    // ── Selección ────────────────────────────────────────────────────────
    const toggleRow = (id) =>
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelectedRows(selectedRows.length === filteredData.length ? [] : filteredData.map(e => e.id));

    const selectedSingle = selectedRows.length === 1
        ? especialistas.find(e => e.id === selectedRows[0])
        : null;

    const showToolbar = selectedRows.length > 0;
    const labelSeleccion = selectedRows.length === 1 ? '1 seleccionado' : `${selectedRows.length} seleccionados`;

    const seleccionTieneSuperAdmin = especialistas
        .filter(e => selectedRows.includes(e.id))
        .some(e => e.rol_id === 1);

    const hayActivos = especialistas
        .filter(e => selectedRows.includes(e.id))
        .some(e => e.estado_activo);

    const hayInactivos = especialistas
        .filter(e => selectedRows.includes(e.id))
        .some(e => !e.estado_activo);

    // ── Acciones ─────────────────────────────────────────────────────────
    const handleInhabilitar = () => {
        setEspecialistas(prev =>
            prev.map(e => selectedRows.includes(e.id) && e.rol_id !== 1 && e.estado_activo
                ? { ...e, estado_activo: false } : e)
        );
        setSelectedRows([]);
    };

    const handleReactivar = () => {
        setEspecialistas(prev =>
            prev.map(e => selectedRows.includes(e.id) && e.rol_id !== 1 && !e.estado_activo
                ? { ...e, estado_activo: true } : e)
        );
        setSelectedRows([]);
    };

    // ── Form helpers ─────────────────────────────────────────────────────
    const resetCedula = () => {
        setCedulaStatus(null);
        setCedulaMensaje('');
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setFormErrors(prev => ({ ...prev, [field]: undefined }));
        if (field === 'cedula_profesional') resetCedula();
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setFormData(prev => ({ ...prev, foto_url: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const handleVerificarCedula = async () => {
        const cedula = formData.cedula_profesional.trim();
        if (!cedula) return;
        setCedulaStatus('checking');
        const result = await verificarCedula(cedula);
        setCedulaStatus(result.ok ? 'ok' : 'error');
        setCedulaMensaje(result.mensaje);
    };

    // ── Validación ───────────────────────────────────────────────────────
    const validateForm = (isEdit = false) => {
        const errors = {};
        if (!formData.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
        if (!formData.email.trim()) errors.email = 'El email es obligatorio';
        else if (!/^[^@]+@[^@]+\.[^@]+$/.test(formData.email))
            errors.email = 'Ingresa un email válido';
        else {
            const emailExiste = especialistas.some(e =>
                e.email.toLowerCase() === formData.email.toLowerCase() &&
                (isEdit ? e.id !== modalEditar?.id : true)
            );
            if (emailExiste) errors.email = 'Este email ya está registrado';
        }
        if (!isEdit && formData.password.length < 8)
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ── Guardar nuevo ────────────────────────────────────────────────────
    const handleGuardarNuevo = () => {
        if (!validateForm(false)) return;
        const nuevo = {
            id: nextId,
            ...formData,
            cedula_verificada: cedulaStatus === 'ok',
        };
        setEspecialistas(prev => [...prev, nuevo]);
        setNextId(id => id + 1);
        setModalNuevo(false);
        setFormData(EMPTY_FORM);
        setFormErrors({});
        resetCedula();
    };

    // ── Abrir editar ─────────────────────────────────────────────────────
    const handleAbrirEditar = () => {
        if (!selectedSingle || selectedSingle.rol_id === 1) return;
        setFormData({
            nombre: selectedSingle.nombre,
            email: selectedSingle.email,
            password: '',
            especialidad_principal: selectedSingle.especialidad_principal || 'Psiquiatría',
            fecha_nacimiento: selectedSingle.fecha_nacimiento || '',
            telefono: selectedSingle.telefono || '',
            biografia: selectedSingle.biografia || '',
            foto_url: selectedSingle.foto_url || '',
            cedula_profesional: selectedSingle.cedula_profesional || '',
            estado_activo: selectedSingle.estado_activo,
            rol_id: selectedSingle.rol_id,
        });
        setCedulaStatus(selectedSingle.cedula_verificada ? 'ok' : null);
        setCedulaMensaje(selectedSingle.cedula_verificada ? 'Cédula verificada ✓' : '');
        setModalEditar(selectedSingle);
        setFormErrors({});
    };

    // ── Guardar edición ──────────────────────────────────────────────────
    const handleGuardarEdicion = () => {
        if (!validateForm(true)) return;
        setEspecialistas(prev =>
            prev.map(e => e.id === modalEditar.id
                ? { ...e, ...formData, cedula_verificada: cedulaStatus === 'ok' }
                : e)
        );
        setModalEditar(null);
        setFormData(EMPTY_FORM);
        setFormErrors({});
        resetCedula();
        setSelectedRows([]);
    };

    const hayFiltrosActivos = filterRol || filterEstado;
    const handleLimpiarFiltros = () => {
        setFilterRol('');
        setFilterEstado('');
        setSearchText('');
    };

    // Props comunes para FormBody
    const formBodyProps = {
        formData,
        formErrors,
        handleFormChange,
        fileInputRef,
        handleFotoChange,
        showPassword,
        setShowPassword,
        cedulaStatus,
        cedulaMensaje,
        handleVerificarCedula,
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="tico-container">

            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Especialistas</h1>
                    <p className="tico-subtitle">Directorio y gestión de especialistas del centro</p>
                </div>
                <button
                    className="tico-btn-nuevo"
                    onClick={() => {
                        setFormData(EMPTY_FORM);
                        setFormErrors({});
                        resetCedula();
                        setShowPassword(false);
                        setModalNuevo(true);
                    }}
                >
                    <Plus size={16} /> Nuevo especialista
                </button>
            </header>

            {/* Toolbar */}
            <div className="tico-toolbar">
                <div className="tico-toolbar-left">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="tico-search"
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                    />

                    <div style={{ position: 'relative' }}>
                        <button
                            className={`tico-btn tico-btn-outline tico-btn-filter ${showFilterMenu ? 'active' : ''}`}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <SlidersHorizontal size={14} />
                            Filtros
                            {hayFiltrosActivos && <span className="tico-filter-dot" />}
                        </button>

                        {showFilterMenu && (
                            <div className="tico-filter-menu">
                                <div className="tico-filter-menu-header">
                                    <span>Filtros avanzados</span>
                                    <button className="tico-btn-limpiar" onClick={handleLimpiarFiltros}>
                                        <FilterX size={13} /> Limpiar
                                    </button>
                                </div>
                                <div className="tico-filter-group">
                                    <label>Rol</label>
                                    <select value={filterRol} onChange={e => setFilterRol(e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="1">Super Admin</option>
                                        <option value="2">Especialista</option>
                                    </select>
                                </div>
                                <div className="tico-filter-group">
                                    <label>Estado</label>
                                    <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="activo">Activo</option>
                                        <option value="inactivo">Inhabilitado</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Acciones contextuales */}
                {showToolbar && (
                    <div className="tico-toolbar-actions">
                        <span className="tico-selection-label">{labelSeleccion}</span>

                        {selectedSingle && (
                            <button
                                className="tico-btn tico-btn-action tico-btn-ver"
                                onClick={() => setModalPerfil(selectedSingle)}
                            >
                                <Eye size={14} /> Ver perfil
                            </button>
                        )}

                        {selectedSingle && selectedSingle.rol_id !== 1 && (
                            <button
                                className="tico-btn tico-btn-action tico-btn-edit"
                                onClick={handleAbrirEditar}
                            >
                                <Pencil size={14} /> Editar
                            </button>
                        )}

                        {!seleccionTieneSuperAdmin && hayActivos && (
                            <button
                                className="tico-btn tico-btn-action tico-btn-inhabilitar"
                                onClick={handleInhabilitar}
                            >
                                <UserX size={14} /> Inhabilitar
                            </button>
                        )}

                        {!seleccionTieneSuperAdmin && hayInactivos && (
                            <button
                                className="tico-btn tico-btn-action tico-btn-reactivar"
                                onClick={handleReactivar}
                            >
                                <UserCheck size={14} /> Reactivar
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
                        <th className="sortable" onClick={() => handleSort('nombre')}>
                            ESPECIALISTA {getSortIcon('nombre')}
                        </th>
                        <th>ROL</th>
                        <th className="sortable" onClick={() => handleSort('especialidad_principal')}>
                            ESPECIALIDAD {getSortIcon('especialidad_principal')}
                        </th>
                        <th>CÉDULA</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', display: 'inline', marginRight: '8px' }} />
                                Cargando especialistas…
                            </td>
                        </tr>
                    )}
                    {!loading && error && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
                                Error: {error}
                            </td>
                        </tr>
                    )}
                    {!loading && !error && filteredData.map(e => (
                        <tr
                            key={e.id}
                            className={[
                                selectedRows.includes(e.id) ? 'selected' : '',
                                !e.estado_activo ? 'inhabilitado' : '',
                                e.rol_id === 1 ? 'super-admin-row' : '',
                            ].join(' ').trim()}
                            onClick={() => toggleRow(e.id)}
                        >
                            <td onClick={ev => ev.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="tico-checkbox"
                                    checked={selectedRows.includes(e.id)}
                                    onChange={() => toggleRow(e.id)}
                                />
                            </td>
                            <td>
                                <div className="esp-avatar-cell">
                                    <Avatar esp={e} />
                                    <div className="esp-avatar-cell-info">
                                        <span className="esp-avatar-cell-name">{e.nombre}</span>
                                        <span className="esp-avatar-cell-email">{e.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td><RolBadge rolId={e.rol_id} /></td>
                            <td style={{ fontSize: '0.88rem' }}>{e.especialidad_principal || '—'}</td>
                            <td><CedulaBadge verificada={e.cedula_verificada} /></td>
                            <td>
                                {e.estado_activo
                                    ? <span className="esp-estado-activo">Activo</span>
                                    : <span className="esp-estado-inactivo">Inhabilitado</span>
                                }
                            </td>
                        </tr>
                    ))}
                    {!loading && !error && filteredData.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                No se encontraron especialistas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ── Modal: Ver Perfil ── */}
            {modalPerfil && (
                <div className="tico-modal-overlay" onClick={() => setModalPerfil(null)}>
                    <div className="tico-modal" onClick={e => e.stopPropagation()} style={{ width: 'min(480px, 95vw)' }}>
                        <button className="tico-modal-close" onClick={() => setModalPerfil(null)}>
                            <X size={18} />
                        </button>

                        <div className="esp-profile-header">
                            <Avatar esp={modalPerfil} size="lg" />
                            <div className="esp-profile-info">
                                <p className="esp-profile-name">{modalPerfil.nombre}</p>
                                <p className="esp-profile-specialty">{modalPerfil.especialidad_principal || '—'}</p>
                                <div style={{ marginTop: '4px' }}>
                                    <RolBadge rolId={modalPerfil.rol_id} />
                                </div>
                            </div>
                        </div>

                        <div className="tico-modal-grid">
                            <div className="tico-modal-field">
                                <span>Email</span>
                                <strong>{modalPerfil.email}</strong>
                            </div>
                            <div className="tico-modal-field">
                                <span>Teléfono</span>
                                <strong>{modalPerfil.telefono || '—'}</strong>
                            </div>
                            <div className="tico-modal-field">
                                <span>Fecha de nacimiento</span>
                                <strong>{formatFecha(modalPerfil.fecha_nacimiento)}</strong>
                            </div>
                            <div className="tico-modal-field">
                                <span>Estado</span>
                                <strong>
                                    {modalPerfil.estado_activo
                                        ? <span className="esp-estado-activo">Activo</span>
                                        : <span className="esp-estado-inactivo">Inhabilitado</span>
                                    }
                                </strong>
                            </div>
                            <div className="tico-modal-field" style={{ gridColumn: '1 / -1' }}>
                                <span>Cédula profesional</span>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {modalPerfil.cedula_profesional || '—'}
                                    {modalPerfil.cedula_profesional && (
                                        <CedulaBadge verificada={modalPerfil.cedula_verificada} />
                                    )}
                                </strong>
                            </div>
                            {modalPerfil.biografia && (
                                <div className="tico-modal-field" style={{ gridColumn: '1 / -1' }}>
                                    <span>Biografía</span>
                                    <strong style={{ fontWeight: 400, lineHeight: 1.5 }}>{modalPerfil.biografia}</strong>
                                </div>
                            )}
                        </div>

                        {modalPerfil.rol_id === 1 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.6rem 1rem',
                                background: 'rgba(251,243,199,0.6)',
                                borderRadius: '8px',
                                border: '1px solid #f59e0b44',
                                fontSize: '0.75rem',
                                color: '#92400e',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                                <ShieldCheck size={14} />
                                Este especialista es el <strong>Super Admin</strong> del sistema y tiene acceso total protegido.
                            </div>
                        )}

                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => setModalPerfil(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Nuevo Especialista ── */}
            {modalNuevo && (
                <div className="tico-modal-overlay" onClick={() => setModalNuevo(false)}>
                    <div className="tico-modal" onClick={e => e.stopPropagation()} style={{ width: 'min(540px, 96vw)', maxHeight: '92vh', overflowY: 'auto' }}>
                        <button className="tico-modal-close" onClick={() => setModalNuevo(false)}>
                            <X size={18} />
                        </button>
                        <h2 className="tico-modal-title">Nuevo Especialista</h2>
                        <p className="tico-form-hint" style={{ textAlign: 'left' }}>* Campos obligatorios</p>
                        <FormBody isEdit={false} {...formBodyProps} />
                        <div className="tico-edit-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => { setModalNuevo(false); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" onClick={handleGuardarNuevo}>Registrar especialista</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Editar Especialista ── */}
            {modalEditar && (
                <div className="tico-modal-overlay" onClick={() => setModalEditar(null)}>
                    <div className="tico-modal" onClick={e => e.stopPropagation()} style={{ width: 'min(540px, 96vw)', maxHeight: '92vh', overflowY: 'auto' }}>
                        <button className="tico-modal-close" onClick={() => setModalEditar(null)}>
                            <X size={18} />
                        </button>
                        <h2 className="tico-modal-title">Editar Especialista</h2>
                        <FormBody isEdit={true} {...formBodyProps} />
                        <div className="tico-edit-actions" style={{ marginTop: '1.5rem' }}>
                            <button className="tico-btn tico-btn-outline" onClick={() => { setModalEditar(null); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" onClick={handleGuardarEdicion}>Guardar cambios</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default EspecialistasPage;
