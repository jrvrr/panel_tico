import React, { useState, useMemo, useRef, useEffect } from 'react';
import '../gestion-pacientes/pacientes/Pacientes.css';
import './Especialistas.css';
import { getEspecialistas, createEspecialista, updateEspecialista, deleteEspecialista } from '../../services/api';
import {
    ChevronUp, ChevronDown, Eye, Pencil, UserX, UserCheck,
    X, Plus, SlidersHorizontal, FilterX, ShieldCheck,
    BadgeCheck, Camera, EyeOff, Loader2, Star, Check,
    Mail, Phone, Calendar, Hash, FileText, Save
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/PageLoader';

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
    apellido_paterno: '',
    apellido_materno: '',
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
const getInitials = (esp) => {
    if (!esp) return '?';
    const n = esp.nombre?.[0] || '';
    const p = esp.apellido_paterno?.[0] || '';
    if (!n && !p) return '?';
    return (n + p).toUpperCase();
};

const formatFecha = (f) => {
    if (!f) return '—';
    try {
        // Si viene en formato ISO (con T) tomamos solo la fecha
        const datePart = f.includes('T') ? f.split('T')[0] : f;
        const [y, m, d] = datePart.split('-');
        if (!y || !m || !d) return f;
        return `${d}/${m}/${y}`;
    } catch (e) {
        return f;
    }
};

const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
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
    return <div className={clsInitials}>{getInitials(esp)}</div>;
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
    handleBlur,
    fileInputRef,
    handleFotoChange,
    showPassword,
    setShowPassword,
    cedulaStatus,
    cedulaMensaje,
    handleVerificarCedula,
}) => (
    <div className="tico-form-stack esp-single-col-compact">
        <p className="esp-form-section" style={{ marginTop: '0' }}>
            <ShieldCheck size={14} /> DATOS DEL ESPECIALISTA
        </p>

        {/* Foto centrada arriba */}
        <div className="esp-foto-centered-wrap">
            <div className="esp-foto-preview-wrap-xxs">
                {formData.foto_url
                    ? <img src={formData.foto_url} alt="preview" className="esp-foto-preview-xxs" />
                    : <div className="esp-foto-initials-xxs">{getInitials(formData.nombre) || '?'}</div>
                }
                <label className="esp-foto-camera-btn-xxs" onClick={() => fileInputRef.current?.click()}>
                    <Camera size={8} />
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFotoChange}
                />
            </div>
        </div>

        <label className="esp-label-compact">Nombre(s) *
            <input
                className={`tico-edit-input${formErrors.nombre ? ' tico-input-error' : ''}`}
                placeholder="Nombre"
                value={formData.nombre}
                maxLength={15}
                onChange={e => handleFormChange('nombre', e.target.value)}
                onBlur={() => handleBlur && handleBlur('nombre')}
            />
        </label>
        {formErrors.nombre && <span className="tico-field-error" style={{ marginTop: '-4px' }}>{formErrors.nombre}</span>}

        <div className="esp-form-row">
            <label className="esp-label-compact">A. Paterno *
                <input
                    className={`tico-edit-input${formErrors.apellido_paterno ? ' tico-input-error' : ''}`}
                    placeholder="Apellido"
                    value={formData.apellido_paterno}
                    maxLength={15}
                    onChange={e => handleFormChange('apellido_paterno', e.target.value)}
                    onBlur={() => handleBlur && handleBlur('apellido_paterno')}
                />
            </label>
            <label className="esp-label-compact">A. Materno
                <input
                    className={`tico-edit-input${formErrors.apellido_materno ? ' tico-input-error' : ''}`}
                    placeholder="Apellido"
                    value={formData.apellido_materno}
                    maxLength={15}
                    onChange={e => handleFormChange('apellido_materno', e.target.value)}
                    onBlur={() => handleBlur && handleBlur('apellido_materno')}
                />
            </label>
        </div>
        <div className="esp-form-row" style={{ marginTop: '-4px' }}>
            {formErrors.apellido_paterno && <span className="tico-field-error" style={{ width: '50%' }}>{formErrors.apellido_paterno}</span>}
            {formErrors.apellido_materno && <span className="tico-field-error" style={{ width: '50%', textAlign: 'right' }}>{formErrors.apellido_materno}</span>}
        </div>

        {/* Los demás campos en una sola columna real */}
        <label className="esp-label-compact">Email *
            <input
                className={`tico-edit-input${formErrors.email ? ' tico-input-error' : ''}`}
                type="email"
                placeholder="email@tico.mx"
                value={formData.email}
                onChange={e => handleFormChange('email', e.target.value)}
            />
        </label>
        {formErrors.email && <span className="tico-field-error" style={{ marginTop: '-4px' }}>{formErrors.email}</span>}

        <div className="esp-form-row">
            <label className="esp-label-compact">Teléfono
                <input
                    className="tico-edit-input"
                    placeholder="+52 555 123 4567"
                    maxLength={20}
                    value={formData.telefono}
                    onChange={e => handleFormChange('telefono', e.target.value)}
                />
            </label>

            <label className="esp-label-compact">Fecha de Nacimiento
                <input
                    className="tico-edit-input"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={e => handleFormChange('fecha_nacimiento', e.target.value)}
                />
            </label>
        </div>

        {!isEdit ? (
            <label className="esp-label-compact">Contraseña *
                <div className="esp-password-wrap-sm">
                    <input
                        className={`tico-edit-input${formErrors.password ? ' tico-input-error' : ''}`}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8+ carac."
                        value={formData.password}
                        onChange={e => handleFormChange('password', e.target.value)}
                    />
                    <button type="button" className="esp-password-toggle-sm" onClick={() => setShowPassword(s => !s)}>
                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                </div>
                {formErrors.password && <span className="tico-field-error">{formErrors.password}</span>}
            </label>
        ) : null}

        <label className="esp-label-compact">Especialidad
            <select
                className="tico-edit-input"
                value={formData.especialidad_principal}
                onChange={e => handleFormChange('especialidad_principal', e.target.value)}
            >
                {ESPECIALIDADES.map(esp => <option key={esp}>{esp}</option>)}
            </select>
        </label>

        <label className="esp-label-compact">Biografía Profesional
            <textarea
                className="tico-edit-input"
                rows={4}
                placeholder="Describe brevemente la trayectoria, especialidad y enfoque del especialista..."
                style={{ resize: 'vertical' }}
                maxLength={300}
                value={formData.biografia}
                onChange={e => handleFormChange('biografia', e.target.value)}
            />
        </label>

        <label className="esp-label-compact">Cédula profesional
            <div className="esp-cedula-row-sm">
                <input
                    className="tico-edit-input"
                    placeholder="Cédula"
                    value={formData.cedula_profesional}
                    onChange={e => handleFormChange('cedula_profesional', e.target.value.replace(/\D/g, ''))}
                />
                <button type="button" className="esp-btn-verificar-compact" onClick={handleVerificarCedula}>
                    {cedulaStatus === 'checking' ? <Loader2 size={10} className="spin" /> : 'Verificar'}
                </button>
                {cedulaStatus === 'ok' && <span className="esp-badge-xs ok"><BadgeCheck size={10} /></span>}
            </div>
            {cedulaMensaje && <span className={`esp-cedula-msg ${cedulaStatus === 'ok' ? 'ok' : 'error'}`}>{cedulaMensaje}</span>}
        </label>
    </div>
);

// ════════════════════════════════════════════════════════════════════════════
const EspecialistasPage = () => {
    const { addNotification } = useNotifications();
    const { user, updateUser } = useAuth();
    // ── Estado principal ──
    const [especialistas, setEspecialistas] = useState(INITIAL_DATA);
    const [nextId, setNextId] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState('');

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
            .catch(err => {
                setError(err.message);
                addNotification({
                    tipo: 'sistema',
                    titulo: 'Error de API (Especialistas)',
                    mensaje: `Fallo al obtener datos: ${err.message}`,
                    nivel: 'error'
                });
            })
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
            items = items.filter(e => {
                const fullStr = `${e.nombre} ${e.apellido_paterno || ''} ${e.apellido_materno || ''} ${e.email}`.toLowerCase();
                return fullStr.includes(searchText.toLowerCase());
            });
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
    const handleInhabilitar = async () => {
        const ids = especialistas.filter(e => selectedRows.includes(e.id) && e.rol_id !== 1 && e.estado_activo).map(e => e.id);
        try {
            // Eliminar secuencialmente, se puede optimizar en el futuro con un endpoint masivo
            for (const id of ids) {
                await deleteEspecialista(id);
            }
            setEspecialistas(prev =>
                prev.map(e => ids.includes(e.id) ? { ...e, estado_activo: false } : e)
            );
            setSelectedRows([]);
            import('sonner').then(({ toast }) => toast.success(`Especialistas inhabilitados.`));
        } catch (err) {
            import('sonner').then(({ toast }) => toast.error(err.message || 'Error al inhabilitar especialistas'));
        }
    };

    const handleReactivar = async () => {
        const ids = especialistas.filter(e => selectedRows.includes(e.id) && e.rol_id !== 1 && !e.estado_activo).map(e => e.id);
        try {
            for (const id of ids) {
                await updateEspecialista(id, { estado_activo: true });
            }
            setEspecialistas(prev =>
                prev.map(e => ids.includes(e.id) ? { ...e, estado_activo: true } : e)
            );
            setSelectedRows([]);
            import('sonner').then(({ toast }) => toast.success(`Especialistas reactivados.`));
        } catch (err) {
            import('sonner').then(({ toast }) => toast.error(err.message || 'Error al reactivar especialistas'));
        }
    };

    // ── Form helpers ─────────────────────────────────────────────────────
    const resetCedula = () => {
        setCedulaStatus(null);
        setCedulaMensaje('');
    };

    const handleFormChange = (field, value) => {
        // Nombre y apellidos: solo letras, espacios, acentos (máx 15)
        if (['nombre', 'apellido_paterno', 'apellido_materno'].includes(field)) {
            if (value.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]*$/.test(value)) return;
            if (value.length > 15) return;
        }
        // Email: sin espacios
        if (field === 'email' && value.includes(' ')) return;
        if (field === 'email' && value.length > 80) return;
        // Teléfono: solo números y formato
        if (field === 'telefono') {
            if (!/^[\d\s+()\-]*$/.test(value)) return;
            if (value.replace(/\D/g, '').length > 15) return;
        }
        // Contraseña: máx 40
        if (field === 'password' && value.length > 40) return;
        // Biografía: máx 300
        if (field === 'biografia' && value.length > 300) return;

        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === 'cedula_profesional') resetCedula();

        // ── Validación en tiempo real ──
        const fieldError = getFieldErrorEsp(field, value);
        setFormErrors(prev => ({ ...prev, [field]: fieldError }));
    };

    // ── Validación en tiempo real por campo ──
    const getFieldErrorEsp = (field, value) => {
        if (['nombre', 'apellido_paterno'].includes(field)) {
            if (!value.trim()) return 'Obligatorio';
            if (value.trim().length > 0 && value.trim().length < 2) return 'Muy corto';
            if (value.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]+$/.test(value)) return 'Solo letras';
        }
        if (field === 'email') {
            if (!value.trim()) return 'El email es obligatorio';
            if (value.includes(' ')) return 'No puede tener espacios';
            if ((value.match(/@/g) || []).length > 1) return 'Solo un @';
            if (value.length > 3 && value.includes('@') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value))
                return 'Formato inválido (ej: correo@dominio.com)';
            if (value.length > 5 && !value.includes('@')) return 'Debe incluir @';
        }
        if (field === 'password' && value.length > 0 && value.length < 8)
            return `Mínimo 8 caracteres (faltan ${8 - value.length})`;
        if (field === 'telefono' && value.length > 0) {
            const soloDigitos = value.replace(/\D/g, '');
            if (soloDigitos.length > 0 && soloDigitos.length < 7) return 'Mínimo 7 dígitos';
        }
        if (field === 'biografia' && value.length > 300) return 'Máximo 300 caracteres';
        return undefined;
    };

    const handleBlur = (field) => {
        const value = formData[field] || '';
        const err = getFieldErrorEsp(field, value);
        setFormErrors(prev => ({ ...prev, [field]: err }));
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
        if (!formData.nombre.trim()) errors.nombre = 'Obligatorio';
        if (!formData.apellido_paterno.trim()) errors.apellido_paterno = 'Obligatorio';
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
    const handleGuardarNuevo = async () => {
        if (!validateForm(false)) return;
        const nuevo = {
            ...formData,
            cedula_verificada: cedulaStatus === 'ok',
        };
        try {
            setSaving(true);
            const res = await createEspecialista(nuevo);
            const especialistaCreado = res.data;

            // Refrescar datos desde la API
            const freshData = await getEspecialistas();
            const list = Array.isArray(freshData) ? freshData : (freshData.data ?? []);
            setEspecialistas(list);

            import('sonner').then(({ toast }) => toast.success(`Especialista ${especialistaCreado.nombre} registrado.`));
            addNotification({
                tipo: 'sistema',
                titulo: 'Nuevo especialista registrado',
                mensaje: `El especialista ${especialistaCreado.nombre} (${especialistaCreado.especialidad_principal}) se registró exitosamente.`,
                nivel: 'success'
            });
            setSaving(false);
            setSaveSuccess('Especialista registrado correctamente');
            setTimeout(() => {
                setSaveSuccess('');
                setModalNuevo(false);
                setFormData(EMPTY_FORM);
                setFormErrors({});
                resetCedula();
            }, 1200);
        } catch (err) {
            setSaving(false);
            import('sonner').then(({ toast }) => toast.error(err.message || 'Error al crear especialista'));
            setFormErrors({ ...formErrors, general: err.message });
        }
    };

    // ── Abrir editar ─────────────────────────────────────────────────────
    const handleAbrirEditar = () => {
        if (!selectedSingle || selectedSingle.rol_id === 1) return;
        setFormData({
            nombre: selectedSingle.nombre,
            apellido_paterno: selectedSingle.apellido_paterno || '',
            apellido_materno: selectedSingle.apellido_materno || '',
            email: selectedSingle.email,
            password: '',
            especialidad_principal: selectedSingle.especialidad_principal || 'Psiquiatría',
            fecha_nacimiento: formatDateForInput(selectedSingle.fecha_nacimiento),
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
    const handleGuardarEdicion = async () => {
        if (!validateForm(true)) return;
        const cambios = {
            ...formData,
            cedula_verificada: cedulaStatus === 'ok'
        };
        try {
            setSaving(true);
            const res = await updateEspecialista(modalEditar.id, cambios);
            const especialistaActualizado = res.data;

            // Refrescar datos desde la API
            const freshData = await getEspecialistas();
            const list = Array.isArray(freshData) ? freshData : (freshData.data ?? []);
            setEspecialistas(list);

            // Si el especialista actualizado es el usuario logueado, actualizar el contexto global
            if (user && user.id === modalEditar.id) {
                updateUser(especialistaActualizado);
            }

            import('sonner').then(({ toast }) => toast.success(`Especialista modificado.`));
            addNotification({
                tipo: 'sistema',
                titulo: 'Perfil actualizado',
                mensaje: `Se actualizaron los datos del especialista ${especialistaActualizado.nombre}.`,
                nivel: 'info'
            });
            setSaving(false);
            setSaveSuccess('Especialista actualizado correctamente');
            setTimeout(() => {
                setSaveSuccess('');
                setModalEditar(null);
                setFormData(EMPTY_FORM);
                setFormErrors({});
                resetCedula();
                setSelectedRows([]);
            }, 1200);
        } catch (err) {
            setSaving(false);
            import('sonner').then(({ toast }) => toast.error(err.message || 'Error al actualizar especialista'));
            setFormErrors({ ...formErrors, general: err.message });
        }
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
        handleBlur,
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
                                        <span className="esp-avatar-cell-name">
                                            {e.nombre} {e.apellido_paterno || ''} {e.apellido_materno || ''}
                                        </span>
                                        <span className="esp-avatar-cell-email">{e.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td><RolBadge rolId={e.rol_id} /></td>
                            <td style={{ fontSize: '0.8rem' }}>{e.especialidad_principal || '—'}</td>
                            <td><CedulaBadge verificada={e.cedula_verificada} /></td>
                            <td>
                                {!e.estado_activo
                                    ? <span className="esp-estado-inactivo">Inhabilitado</span>
                                    : e.en_linea
                                        ? <span className="esp-estado-enlinea">En línea</span>
                                        : <span className="esp-estado-desconectado">Desconectado</span>
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

            {/* ── Modal: Ver Perfil Premium ── */}
            {modalPerfil && (
                <div className="tico-modal-overlay" onClick={() => setModalPerfil(null)}>
                    <div className="esp-profile-card" onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 95vw)' }}>
                        <button className="esp-modal-close-v2" onClick={() => setModalPerfil(null)}>
                            <X size={20} />
                        </button>

                        <div className="esp-profile-hero">
                            <Avatar esp={modalPerfil} size="lg" />
                            <div className="esp-profile-hero-info">
                                <h2 className="esp-profile-hero-name">
                                    {modalPerfil.nombre} {modalPerfil.apellido_paterno || ''} {modalPerfil.apellido_materno || ''}
                                </h2>
                                <p className="esp-profile-hero-specialty">{modalPerfil.especialidad_principal || 'Especialista'}</p>
                                <div className="esp-profile-status-pill">
                                    <RolBadge rolId={modalPerfil.rol_id} />
                                </div>
                            </div>
                        </div>

                        <div className="esp-profile-grid-v2">
                            <div className="esp-field-box">
                                <span className="esp-field-box-label"><Mail size={12} /> Email</span>
                                <span className="esp-field-box-value">{modalPerfil.email}</span>
                            </div>
                            <div className="esp-field-box">
                                <span className="esp-field-box-label"><Phone size={12} /> Teléfono</span>
                                <span className="esp-field-box-value">{modalPerfil.telefono || '—'}</span>
                            </div>
                            <div className="esp-field-box">
                                <span className="esp-field-box-label"><Calendar size={12} /> Nacimiento</span>
                                <span className="esp-field-box-value">{formatFecha(modalPerfil.fecha_nacimiento)}</span>
                            </div>
                            <div className="esp-field-box">
                                <span className="esp-field-box-label"><ShieldCheck size={12} /> Estado</span>
                                <div className="esp-field-box-value">
                                    {!modalPerfil.estado_activo
                                        ? <span className="esp-estado-inactivo">Inhabilitado</span>
                                        : modalPerfil.en_linea
                                            ? <span className="esp-estado-enlinea">En línea</span>
                                            : <span className="esp-estado-desconectado">Desconectado</span>
                                    }
                                </div>
                            </div>
                            <div className="esp-field-box full-width">
                                <span className="esp-field-box-label"><Hash size={12} /> Cédula profesional</span>
                                <div className="esp-field-box-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {modalPerfil.cedula_profesional || '—'}
                                    {modalPerfil.cedula_profesional && (
                                        <CedulaBadge verificada={modalPerfil.cedula_verificada} />
                                    )}
                                </div>
                            </div>
                            {modalPerfil.biografia && (
                                <div className="esp-field-box full-width">
                                    <span className="esp-field-box-label"><FileText size={12} /> Biografía</span>
                                    <span className="esp-field-box-value bio">{modalPerfil.biografia}</span>
                                </div>
                            )}
                        </div>

                        {modalPerfil.rol_id === 1 && (
                            <div className="esp-admin-notice">
                                <ShieldCheck size={18} />
                                <span>Este especialista es el <span className="esp-admin-notice-bold">Super Admin</span> con acceso total.</span>
                            </div>
                        )}

                        <div className="esp-profile-footer-v2">
                            <button className="tico-btn tico-btn-outline" onClick={() => setModalPerfil(null)} style={{ borderRadius: '12px', padding: '0.6rem 2rem' }}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}

            {modalNuevo && (
                <div className="tico-modal-overlay" onClick={() => setModalNuevo(false)}>
                    <div className="tico-modal tico-modal-scrollable" onClick={e => e.stopPropagation()} style={{ width: 'min(540px, 96vw)' }}>
                        <div className="tico-modal-header">
                            <h2 className="tico-modal-title">Nuevo Especialista</h2>
                            <button className="tico-modal-close" onClick={() => setModalNuevo(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="tico-modal-body">
                            <p className="tico-form-hint">* Campos obligatorios</p>
                            <FormBody isEdit={false} {...formBodyProps} />
                        </div>

                        <div className="tico-modal-footer">
                            <div className="tico-edit-actions">
                                <button className="tico-btn tico-btn-outline" disabled={saving} onClick={() => { setModalNuevo(false); setFormErrors({}); }}>Cancelar</button>
                                <button className="tico-btn tico-btn-primary" disabled={saving} onClick={handleGuardarNuevo}>
                                    {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                    {saving ? 'Guardando...' : 'Registrar especialista'}
                                </button>
                            </div>
                        </div>

                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message="Registrando especialista..." />
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

            {/* ── Modal: Editar Especialista ── */}
            {modalEditar && (
                <div className="tico-modal-overlay" onClick={() => setModalEditar(null)}>
                    <div className="tico-modal tico-modal-scrollable" onClick={e => e.stopPropagation()} style={{ width: 'min(540px, 96vw)' }}>
                        <div className="tico-modal-header">
                            <h2 className="tico-modal-title">Editar Especialista</h2>
                            <button className="tico-modal-close" onClick={() => setModalEditar(null)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div className="tico-modal-body">
                            <FormBody isEdit={true} {...formBodyProps} />
                        </div>

                        <div className="tico-modal-footer">
                            <div className="tico-edit-actions">
                                <button className="tico-btn tico-btn-outline" disabled={saving} onClick={() => { setModalEditar(null); setFormErrors({}); }}>Cancelar</button>
                                <button className="tico-btn tico-btn-primary" disabled={saving} onClick={handleGuardarEdicion}>
                                    {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                    {saving ? 'Guardando...' : 'Guardar cambios'}
                                </button>
                            </div>
                        </div>

                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message="Actualizando especialista..." />
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

        </div>
    );
};

export default EspecialistasPage;
