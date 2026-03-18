import React, { useState, useMemo, useEffect } from 'react';
import './Pacientes.css';
import { ChevronUp, ChevronDown, Eye, Pencil, UserX, UserCheck, X, Plus, Filter, FilterX, Check } from 'lucide-react';
import { useNotifications } from '../../../context/NotificationContext';
import { createPaciente, getPacientes, updatePaciente, createCita } from '../../../services/api';
import PageLoader from '../../../components/PageLoader';

const EMPTY_NUEVO = {
    nombre: '',
    fecha_nacimiento: '',
    genero: 'Masculino',
    peso_kg: '',
    altura_cm: '',
    imc: '',
    alergias: '',
    monto_mensual: '',
    observacion: 'Bajo',
    estado: 'Estable',
    tutor_nombre: '',
    tutor_parentesco: '',
    tutor_email: '',
    tutor_telefono: '',
    tutor_password: '',
    fecha_cita: '',
    hora_cita: '',
};

const PacientesPage = () => {
    const { addNotification } = useNotifications();
    const [selectedRows, setSelectedRows] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [modalPaciente, setModalPaciente] = useState(null);
    const [editPaciente, setEditPaciente] = useState(null);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [formNuevo, setFormNuevo] = useState(EMPTY_NUEVO);
    const [formErrors, setFormErrors] = useState({});
    const [searchText, setSearchText] = useState('');
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [filterEstado, setFilterEstado] = useState('');
    const [filterObservacion, setFilterObservacion] = useState('');
    const [filterGenero, setFilterGenero] = useState('');
    const [nextId, setNextId] = useState(9);

    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);   // loader durante guardar/crear
    const [saveSuccess, setSaveSuccess] = useState(''); // mensaje de éxito temporal

    // Normalizar fecha ISO a YYYY-MM-DD para inputs de tipo date
    const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        // Si ya es YYYY-MM-DD, devolver tal cual
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // Convertir ISO (2006-03-17T00:00:00.000Z) a YYYY-MM-DD
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    };

    const calcEdad = (fechaNac) => {
        if (!fechaNac) return '';
        const hoy = new Date();
        const nac = new Date(fechaNac);
        const años = hoy.getFullYear() - nac.getFullYear();
        const m = hoy.getMonth() - nac.getMonth();
        const edad = (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) ? años - 1 : años;
        return `${edad} años`;
    };

    // ── Data Fetching ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                setLoading(true);
                const response = await getPacientes();
                const fetchedPacientes = response.data || [];

                const mappedPacientes = fetchedPacientes.map(p => ({
                    id: p.id,
                    paciente: p.nombre,
                    tutor: p.tutor_nombre || 'N/D',
                    edad: calcEdad(p.fecha_nacimiento),
                    cita: '', // TODO: Fetch next appointment
                    observacion: p.observaciones || 'Bajo',
                    estado: p.estado_clinico || 'Estable',
                    active: p.estado_activo ?? true,
                    // Keep original data for editing
                    ...p,
                    fecha_nacimiento: formatDateForInput(p.fecha_nacimiento)
                }));

                setPacientes(mappedPacientes);
            } catch (error) {
                console.error("Error fetching pacientes:", error);
                import('sonner').then(({ toast }) => toast.error('Error al cargar pacientes'));
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, []);

    // ── Selección ────────────────────────────────────────────────────────────
    const toggleRow = (id) =>
        setSelectedRows(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);

    const toggleAll = () =>
        setSelectedRows(selectedRows.length === filteredData.length ? [] : filteredData.map(p => p.id));

    // ── Datos derivados de selección ─────────────────────────────────────────
    const selectedSingle = selectedRows.length === 1 ? pacientes.find(p => p.id === selectedRows[0]) : null;
    const selectedMulti = selectedRows.length > 1;
    const selectedPacientes = pacientes.filter(p => selectedRows.includes(p.id));
    const hayActivos = selectedPacientes.some(p => p.active);
    const hayInactivos = selectedPacientes.some(p => !p.active);
    const showToolbar = selectedRows.length > 0;

    // ── Ordenamiento + filtrado ───────────────────────────────────────────────
    const handleSort = (key) =>
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, fontSize: '0.8em', marginLeft: '4px' }}>⇅</span>;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
    };

    const filteredData = useMemo(() => {
        let items = [...pacientes];

        // Búsqueda por texto
        if (searchText.trim())
            items = items.filter(p =>
                p.paciente.toLowerCase().includes(searchText.toLowerCase()) ||
                p.tutor.toLowerCase().includes(searchText.toLowerCase())
            );

        // Filtro por Estado
        if (filterEstado)
            items = items.filter(p => p.estado === filterEstado);

        // Filtro por Observación
        if (filterObservacion)
            items = items.filter(p => p.observacion === filterObservacion);

        // Filtro por Género
        if (filterGenero)
            items = items.filter(p => p.genero === filterGenero);

        // Ordenamiento
        if (sortConfig.key)
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        return items;
    }, [pacientes, sortConfig, searchText, filterEstado, filterObservacion, filterGenero]);

    // ── Acciones ─────────────────────────────────────────────────────────────
    const handleVerPerfil = () => setModalPaciente(selectedSingle);
    const handleEditar = () => setEditPaciente({
        ...selectedSingle,
        fecha_nacimiento: formatDateForInput(selectedSingle.fecha_nacimiento)
    });

    // Inhabilitar uno o varios
    const handleInhabilitar = () => {
        setPacientes(prev =>
            prev.map(p => selectedRows.includes(p.id) && p.active
                ? { ...p, active: false, estado: 'Inhabilitado' } : p)
        );
        import('sonner').then(({ toast }) => toast.warning(`Se inhabilitaron ${selectedRows.length} paciente(s)`));
        addNotification({
            tipo: 'paciente',
            titulo: 'Pacientes inhabilitados',
            mensaje: `Se inhabilitaron ${selectedRows.length} paciente(s) del sistema.`,
            nivel: 'warning'
        });
        setSelectedRows([]);
    };

    // Reactivar uno o varios
    const handleReactivar = () => {
        setPacientes(prev =>
            prev.map(p => selectedRows.includes(p.id) && !p.active
                ? { ...p, active: true, estado: 'Estable' } : p)
        );
        import('sonner').then(({ toast }) => toast.success(`Se reactivaron ${selectedRows.length} paciente(s)`));
        addNotification({
            tipo: 'paciente',
            titulo: 'Pacientes reactivados',
            mensaje: `Se reactivaron ${selectedRows.length} paciente(s) en el sistema.`,
            nivel: 'success'
        });
        setSelectedRows([]);
    };

    const handleGuardarEdicion = async () => {
        try {
            setSaving(true);
            // Preparar el mismo payload que espera el backend
            const payload = {
                nombre: editPaciente.paciente || editPaciente.nombre,
                fecha_nacimiento: editPaciente.fecha_nacimiento,
                genero: editPaciente.genero,
                peso_kg: editPaciente.peso_kg || null,
                altura_cm: editPaciente.altura_cm || null,
                alergias: editPaciente.alergias,
                observacion: editPaciente.observacion,
                estado: editPaciente.estado,
                tutor_nombre: editPaciente.tutor || editPaciente.tutor_nombre,
                tutor_parentesco: editPaciente.tutor_parentesco,
                tutor_telefono: editPaciente.tutor_telefono,
                tutor_email: editPaciente.tutor_email,
                monto_mensual: editPaciente.monto_mensual || null,
                estado_activo: editPaciente.active
            };

            await updatePaciente(editPaciente.id, payload);

            // Refrescar datos completos desde el API para no perder información
            const response = await getPacientes();
            const fetchedPacientes = response.data || [];
            const mappedPacientes = fetchedPacientes.map(p => ({
                id: p.id,
                paciente: p.nombre,
                tutor: p.tutor_nombre || 'N/D',
                edad: calcEdad(p.fecha_nacimiento),
                cita: '',
                observacion: p.observaciones || 'Bajo',
                estado: p.estado_clinico || 'Estable',
                active: p.estado_activo ?? true,
                ...p
            }));
            setPacientes(mappedPacientes);

            import('sonner').then(({ toast }) => toast.success(`Paciente actualizado`));
            addNotification({
                tipo: 'paciente',
                titulo: 'Perfil de paciente actualizado',
                mensaje: `Se modificó la información de ${payload.nombre}.`,
                nivel: 'info'
            });
            // Mostrar éxito brevemente antes de cerrar
            setSaving(false);
            setSaveSuccess('Paciente actualizado correctamente');
            setTimeout(() => {
                setSaveSuccess('');
                setEditPaciente(null);
                setSelectedRows([]);
            }, 1200);
        } catch (error) {
            setSaving(false);
            import('sonner').then(({ toast }) => toast.error(error.message || 'Error al actualizar paciente'));
        }
    };

    const handleClearFilters = () => {
        setFilterEstado('');
        setFilterObservacion('');
        setFilterGenero('');
        setSearchText('');
    };

    // Calcular IMC automáticamente
    const calcIMC = (peso, altura) => {
        const p = parseFloat(peso);
        const h = parseFloat(altura) / 100;
        if (!p || !h || h === 0) return '';
        return (p / (h * h)).toFixed(2);
    };

    // ── Restricciones por campo ──────────────────────────────────────────────
    const FIELD_RULES = {
        nombre:          { maxLen: 30, onlyLetters: true, label: 'nombre' },
        tutor_nombre:    { maxLen: 30, onlyLetters: true, label: 'nombre del tutor' },
        alergias:        { maxLen: 120 },
        tutor_telefono:  { maxLen: 10, onlyPhone: true },
        tutor_email:     { maxLen: 80 },
        tutor_password:  { maxLen: 40 },
        monto_mensual:   { maxVal: 99999 },
        peso_kg:         { maxVal: 300 },
        altura_cm:       { maxVal: 250 },
    };

    // Validar un campo en tiempo real y devolver el error (o undefined)
    const getFieldError = (field, value) => {
        const rule = FIELD_RULES[field];

        // ── Campos obligatorios ──
        if (field === 'nombre' && !value.trim()) return 'El nombre es obligatorio';
        if (field === 'tutor_nombre' && !value.trim()) return 'El nombre del tutor es obligatorio';
        if (field === 'fecha_nacimiento' && !value) return 'La fecha de nacimiento es obligatoria';
        if (field === 'tutor_password' && !value.trim()) return 'La contraseña es obligatoria';

        // ── Longitud máxima ──
        if (rule?.maxLen && value.length > rule.maxLen)
            return `Máximo ${rule.maxLen} caracteres`;

        // ── Solo letras + espacios + acentos ──
        if (rule?.onlyLetters && value.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]+$/.test(value))
            return 'Solo se permiten letras y espacios';

        // ── Nombre: mínimo 3 caracteres ──
        if ((field === 'nombre' || field === 'tutor_nombre') && value.trim().length > 0 && value.trim().length < 3)
            return 'Mínimo 3 caracteres';

        // ── Teléfono ──
        if (field === 'tutor_telefono' && value.length > 0) {
            const soloDigitos = value.replace(/\D/g, '');
            if (soloDigitos.length > 0 && soloDigitos.length < 7) return 'Mínimo 7 dígitos';
            if (soloDigitos.length > 15) return 'Máximo 15 dígitos';
        }

        // ── Correo ──
        if (field === 'tutor_email' && value.length > 0) {
            if (value.includes(' ')) return 'El correo no puede tener espacios';
            if ((value.match(/@/g) || []).length > 1) return 'Solo se permite un @';
            if (value.length > 3 && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) && value.includes('@'))
                return 'Formato inválido (ej: correo@dominio.com)';
            if (value.length > 5 && !value.includes('@')) return 'Debe incluir @';
            // Email único
            const emailExiste = pacientes.some(
                p => p.tutor_email && p.tutor_email.toLowerCase() === value.toLowerCase()
            );
            if (emailExiste) return 'Este correo ya está registrado';
        }

        // ── Contraseña ──
        if (field === 'tutor_password' && value.length > 0 && value.length < 6)
            return `Mínimo 6 caracteres (faltan ${6 - value.length})`;

        // ── Peso / Altura / Monto: valor máximo ──
        if (rule?.maxVal && parseFloat(value) > rule.maxVal)
            return `Máximo permitido: ${rule.maxVal}`;
        if ((field === 'peso_kg' || field === 'altura_cm' || field === 'monto_mensual') && parseFloat(value) < 0)
            return 'No puede ser negativo';

        return undefined;
    };

    const handleFormNuevoChange = (field, value) => {
        const rule = FIELD_RULES[field];

        // ── Filtrar caracteres no permitidos antes de actualizar ──
        // Teléfono: solo números, espacios, +, - y paréntesis
        if (rule?.onlyPhone && !/^[\d\s+()\-]*$/.test(value)) return;
        // Nombres: bloquear números y caracteres especiales
        if (rule?.onlyLetters && value.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]*$/.test(value)) return;
        // Max length: bloquear entrada silenciosamente
        if (rule?.maxLen && value.length > rule.maxLen) return;
        // Email: sin espacios
        if (field === 'tutor_email' && value.includes(' ')) return;

        setFormNuevo(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'peso_kg' || field === 'altura_cm') {
                updated.imc = calcIMC(
                    field === 'peso_kg' ? value : prev.peso_kg,
                    field === 'altura_cm' ? value : prev.altura_cm
                );
            }
            return updated;
        });

        // ── Validación en tiempo real mientras escribe ──
        const error = getFieldError(field, value);
        setFormErrors(prev => ({ ...prev, [field]: error }));
    };

    // Validación al perder foco (complementa la de tiempo real)
    const handleBlur = (field) => {
        const value = formNuevo[field] || '';
        const error = getFieldError(field, value);
        setFormErrors(prev => ({ ...prev, [field]: error }));
    };

    // Validación completa del formulario (al enviar)
    const validateForm = () => {
        const errors = {};
        // Recorrer todos los campos y validar
        const fieldsToCheck = [
            'nombre', 'fecha_nacimiento', 'tutor_nombre', 'tutor_password',
            'tutor_email', 'tutor_telefono', 'peso_kg', 'altura_cm', 'monto_mensual', 'alergias'
        ];
        fieldsToCheck.forEach(field => {
            const val = formNuevo[field] || '';
            const err = getFieldError(field, val);
            if (err) errors[field] = err;
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Edad a partir de fecha_nacimiento is already defined above

    // Agregar nuevo paciente
    const handleAgregarPaciente = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);
            // Guardar en backend
            const payload = {
                nombre: formNuevo.nombre,
                tutor_nombre: formNuevo.tutor_nombre,
                fecha_nacimiento: formNuevo.fecha_nacimiento,
                genero: formNuevo.genero,
                peso_kg: formNuevo.peso_kg || null,
                altura_cm: formNuevo.altura_cm || null,
                alergias: formNuevo.alergias,
                observaciones: formNuevo.observacion,
                estado_clinico: formNuevo.estado,
                tutor_parentesco: formNuevo.tutor_parentesco,
                tutor_telefono: formNuevo.tutor_telefono,
                tutor_email: formNuevo.tutor_email,
                tutor_password: formNuevo.tutor_password,
                monto_mensual: formNuevo.monto_mensual || null,
                estado_activo: true
            };

            const res = await createPaciente(payload);
            const pacienteCreado = res.data || res;

            // Programando la cita inicial si especificaron fecha/hora
            if (formNuevo.fecha_cita && formNuevo.hora_cita) {
                try {
                    await createCita({
                        paciente_id: pacienteCreado.id,
                        fecha_cita: formNuevo.fecha_cita,
                        hora_cita: formNuevo.hora_cita,
                        estado_cita: 'Programada',
                        observacion_clinica: 'Primera consulta (Agendada en registro)'
                    });
                } catch (citaErr) {
                    console.error("Error al agendar primera cita:", citaErr);
                    import('sonner').then(({ toast }) => toast.warning(`Paciente registrado, pero no se pudo agendar la cita`));
                }
            }

            // Refrescar datos completos desde el API
            const fetchResponse = await getPacientes();
            const fetchedPacientes = fetchResponse.data || [];
            const mappedPacientes = fetchedPacientes.map(p => ({
                id: p.id,
                paciente: p.nombre,
                tutor: p.tutor_nombre || 'N/D',
                edad: calcEdad(p.fecha_nacimiento),
                cita: '',
                observacion: p.observaciones || 'Bajo',
                estado: p.estado_clinico || 'Estable',
                active: p.estado_activo ?? true,
                ...p
            }));
            setPacientes(mappedPacientes);

            import('sonner').then(({ toast }) => toast.success(`Paciente registrado`));
            addNotification({
                tipo: 'sistema',
                titulo: 'Nuevo paciente registrado',
                mensaje: `Se registró al paciente ${nuevo.paciente} en el sistema.`,
                nivel: 'success'
            });
            setFormNuevo(EMPTY_NUEVO);
            setFormErrors({});
            setModalNuevo(false);

        } catch (error) {
            import('sonner').then(({ toast }) => toast.error(error.message || 'Error al guardar paciente'));
            setFormErrors({ general: error.message });
        }
    };


    const labelSeleccion = selectedRows.length === 1
        ? '1 seleccionado'
        : `${selectedRows.length} seleccionados`;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="tico-container">

            {/* ── Header ── */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Listado de Pacientes</h1>
                    <p className="tico-subtitle">Administra la información de los pacientes</p>
                </div>
                <button className="tico-btn-nuevo" onClick={() => { setFormNuevo(EMPTY_NUEVO); setModalNuevo(true); }}>
                    <Plus size={16} />
                    Nuevo paciente
                </button>
            </header>

            {/* ── Toolbar unificado ── */}
            <div className="tico-toolbar">
                <div className="tico-toolbar-left">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="tico-search"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <div style={{ position: 'relative' }}>
                        <button
                            className={`tico-btn tico-btn-outline tico-btn-filter ${showFilterMenu ? 'active' : ''}`}
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                        >
                            <Filter size={14} />
                            Filtro
                            {(filterEstado || filterObservacion || filterGenero) && (
                                <span className="tico-filter-dot" />
                            )}
                        </button>

                        {showFilterMenu && (
                            <div className="tico-filter-menu">
                                <div className="tico-filter-menu-header">
                                    <span>Filtros avanzados</span>
                                    <button className="tico-btn-limpiar" onClick={handleClearFilters}>
                                        <FilterX size={13} />
                                        Limpiar
                                    </button>
                                </div>
                                <div className="tico-filter-group">
                                    <label>Estado</label>
                                    <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
                                        <option value="">Todos</option>
                                        <option value="Estable">Estable</option>
                                        <option value="Inestable">Inestable</option>
                                        <option value="Inhabilitado">Inhabilitado</option>
                                    </select>
                                </div>
                                <div className="tico-filter-group">
                                    <label>Observación</label>
                                    <select value={filterObservacion} onChange={(e) => setFilterObservacion(e.target.value)}>
                                        <option value="">Todas</option>
                                        <option value="Bajo">Bajo</option>
                                        <option value="Medio">Medio</option>
                                        <option value="Alto">Alto</option>
                                    </select>
                                </div>
                                <div className="tico-filter-group">
                                    <label>Género</label>
                                    <select value={filterGenero} onChange={(e) => setFilterGenero(e.target.value)}>
                                        <option value="">Cualquiera</option>
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
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

                        {/* Ver perfil y Editar → solo con 1 seleccionado */}
                        {selectedSingle && (
                            <>
                                <button className="tico-btn tico-btn-action tico-btn-ver" onClick={handleVerPerfil}>
                                    <Eye size={14} /> Ver perfil
                                </button>
                                <button className="tico-btn tico-btn-action tico-btn-edit" onClick={handleEditar}>
                                    <Pencil size={14} /> Editar
                                </button>
                            </>
                        )}

                        {/* Inhabilitar → si hay al menos 1 activo en la selección */}
                        {hayActivos && (
                            <button className="tico-btn tico-btn-action tico-btn-inhabilitar" onClick={handleInhabilitar}>
                                <UserX size={14} />
                                {selectedMulti ? `Inhabilitar (${selectedPacientes.filter(p => p.active).length})` : 'Inhabilitar'}
                            </button>
                        )}

                        {/* Reactivar → si hay al menos 1 inactivo en la selección */}
                        {hayInactivos && (
                            <button className="tico-btn tico-btn-action tico-btn-reactivar" onClick={handleReactivar}>
                                <UserCheck size={14} />
                                {selectedMulti ? `Reactivar (${selectedPacientes.filter(p => !p.active).length})` : 'Reactivar'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Tabla ── */}
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
                        <th>EDAD</th>
                        <th className="sortable" onClick={() => handleSort('cita')}>
                            FECHA {getSortIcon('cita')}
                        </th>
                        <th>OBSERVACION</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((p) => (
                        <tr
                            key={p.id}
                            className={[
                                selectedRows.includes(p.id) ? 'selected' : '',
                                !p.active ? 'inhabilitado' : '',
                            ].join(' ').trim()}
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
                            <td>{p.paciente}</td>
                            <td>{p.tutor}</td>
                            <td>{p.edad}</td>
                            <td>{p.cita}</td>
                            <td>
                                <span className={`tico-badge tico-badge-${p.observacion.toLowerCase()}`}>
                                    {p.observacion}
                                </span>
                            </td>
                            <td>{p.estado}</td>
                        </tr>
                    ))}
                    {loading ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                Cargando pacientes...
                            </td>
                        </tr>
                    ) : filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                No se encontraron pacientes.
                            </td>
                        </tr>
                    ) : null}
                </tbody>
            </table>

            {/* ── Modal: Nuevo Paciente ── */}
            {modalNuevo && (
                <div className="tico-modal-overlay" onClick={() => setModalNuevo(false)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setModalNuevo(false)}>
                            <X size={18} />
                        </button>

                        <h2 className="tico-modal-title" style={{ marginBottom: '0.5rem' }}>Nuevo Paciente</h2>
                        <p className="tico-form-hint" style={{ textAlign: 'left', marginBottom: '1rem' }}>* Campos obligatorios</p>

                        {/* ── Dos columnas: Paciente | Tutor ── */}
                        <div className="tico-form-two-cols">

                            {/* Columna izquierda: Paciente */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Paciente</p>
                                <div className="tico-form-stack">
                                    <label>Nombre completo *
                                        <input className={`tico-edit-input${formErrors.nombre ? ' tico-input-error' : ''}`} placeholder="Nombre completo"
                                            maxLength={30}
                                            value={formNuevo.nombre}
                                            onChange={(e) => handleFormNuevoChange('nombre', e.target.value)}
                                            onBlur={() => handleBlur('nombre')} />
                                        {formErrors.nombre && <span className="tico-field-error">{formErrors.nombre}</span>}
                                    </label>
                                    <label>Fecha de nacimiento *
                                        <input className={`tico-edit-input${formErrors.fecha_nacimiento ? ' tico-input-error' : ''}`} type="date"
                                            value={formNuevo.fecha_nacimiento}
                                            onChange={(e) => handleFormNuevoChange('fecha_nacimiento', e.target.value)}
                                            onBlur={() => handleBlur('fecha_nacimiento')} />
                                        {formErrors.fecha_nacimiento && <span className="tico-field-error">{formErrors.fecha_nacimiento}</span>}
                                    </label>
                                    <label>Género
                                        <select className="tico-edit-input" value={formNuevo.genero}
                                            onChange={(e) => handleFormNuevoChange('genero', e.target.value)}>
                                            <option>Masculino</option>
                                            <option>Femenino</option>
                                        </select>
                                    </label>
                                    <div className="tico-form-row2">
                                        <label>Peso (kg)
                                            <input className={`tico-edit-input${formErrors.peso_kg ? ' tico-input-error' : ''}`} type="number" placeholder="peso en kg" min="0" max="300"
                                                value={formNuevo.peso_kg}
                                                onChange={(e) => handleFormNuevoChange('peso_kg', e.target.value)}
                                                onBlur={() => handleBlur('peso_kg')} />
                                            {formErrors.peso_kg && <span className="tico-field-error">{formErrors.peso_kg}</span>}
                                        </label>
                                        <label>Altura (cm)
                                            <input className={`tico-edit-input${formErrors.altura_cm ? ' tico-input-error' : ''}`} type="number" placeholder="altura en cm" min="0" max="250"
                                                value={formNuevo.altura_cm}
                                                onChange={(e) => handleFormNuevoChange('altura_cm', e.target.value)}
                                                onBlur={() => handleBlur('altura_cm')} />
                                            {formErrors.altura_cm && <span className="tico-field-error">{formErrors.altura_cm}</span>}
                                        </label>
                                    </div>
                                    <label>IMC (auto-calculado)
                                        <input className="tico-edit-input tico-input-readonly" readOnly
                                            value={formNuevo.imc ? `${formNuevo.imc} kg/m²` : '—'} />
                                    </label>
                                    <label>Alergias
                                        <input className={`tico-edit-input${formErrors.alergias ? ' tico-input-error' : ''}`} placeholder="(vacío si ninguna)"
                                            maxLength={120}
                                            value={formNuevo.alergias}
                                            onChange={(e) => handleFormNuevoChange('alergias', e.target.value)}
                                            onBlur={() => handleBlur('alergias')} />
                                        {formErrors.alergias && <span className="tico-field-error">{formErrors.alergias}</span>}
                                    </label>
                                    <div className="tico-form-row2">
                                        <label>Observación
                                            <select className="tico-edit-input" value={formNuevo.observacion}
                                                onChange={(e) => handleFormNuevoChange('observacion', e.target.value)}>
                                                <option>Bajo</option>
                                                <option>Medio</option>
                                                <option>Alto</option>
                                            </select>
                                        </label>
                                        <label>Estado
                                            <select className="tico-edit-input" value={formNuevo.estado}
                                                onChange={(e) => handleFormNuevoChange('estado', e.target.value)}>
                                                <option>Estable</option>
                                                <option>Inestable</option>
                                            </select>
                                        </label>
                                    </div>
                                    <label>Monto mensual ($)
                                        <input className={`tico-edit-input${formErrors.monto_mensual ? ' tico-input-error' : ''}`} type="number" placeholder="500.00" min="0" max="99999"
                                            value={formNuevo.monto_mensual}
                                            onChange={(e) => handleFormNuevoChange('monto_mensual', e.target.value)}
                                            onBlur={() => handleBlur('monto_mensual')} />
                                        {formErrors.monto_mensual && <span className="tico-field-error">{formErrors.monto_mensual}</span>}
                                    </label>
                                </div>
                            </div>

                            {/* Divisor vertical */}
                            <div className="tico-form-divider" />

                            {/* Columna derecha: Tutor */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Tutor</p>
                                <div className="tico-form-stack">
                                    <label>Nombre del tutor *
                                        <input className={`tico-edit-input${formErrors.tutor_nombre ? ' tico-input-error' : ''}`} placeholder="Nombre del tutor"
                                            maxLength={30}
                                            value={formNuevo.tutor_nombre}
                                            onChange={(e) => handleFormNuevoChange('tutor_nombre', e.target.value)}
                                            onBlur={() => handleBlur('tutor_nombre')} />
                                        {formErrors.tutor_nombre && <span className="tico-field-error">{formErrors.tutor_nombre}</span>}
                                    </label>
                                    <label>Parentesco
                                        <select className="tico-edit-input" value={formNuevo.tutor_parentesco}
                                            onChange={(e) => handleFormNuevoChange('tutor_parentesco', e.target.value)}>
                                            <option value="">— Seleccionar —</option>
                                            <option>Padre</option>
                                            <option>Madre</option>
                                            <option>Abuelo/a</option>
                                            <option>Tío/a</option>
                                            <option>Hermano/a</option>
                                            <option>Tutor legal</option>
                                            <option>Otro</option>
                                        </select>
                                    </label>
                                    <label>Teléfono
                                        <input
                                            className={`tico-edit-input${formErrors.tutor_telefono ? ' tico-input-error' : ''}`}
                                            placeholder="Ej. 555-1234"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={formNuevo.tutor_telefono}
                                            onChange={(e) => handleFormNuevoChange('tutor_telefono', e.target.value)}
                                            onBlur={() => handleBlur('tutor_telefono')} />
                                        {formErrors.tutor_telefono && <span className="tico-field-error">{formErrors.tutor_telefono}</span>}
                                    </label>
                                    <label>Correo electrónico
                                        <input
                                            className={`tico-edit-input${formErrors.tutor_email ? ' tico-input-error' : ''}`}
                                            type="email"
                                            placeholder="tutor@correo.com"
                                            maxLength={80}
                                            value={formNuevo.tutor_email}
                                            onChange={(e) => handleFormNuevoChange('tutor_email', e.target.value)}
                                            onBlur={() => handleBlur('tutor_email')} />
                                        {formErrors.tutor_email && <span className="tico-field-error">{formErrors.tutor_email}</span>}
                                    </label>
                                    <label>Contraseña *
                                        <input
                                            className={`tico-edit-input${formErrors.tutor_password ? ' tico-input-error' : ''}`}
                                            type="password"
                                            placeholder="Contraseña del tutor"
                                            maxLength={40}
                                            value={formNuevo.tutor_password}
                                            onChange={(e) => handleFormNuevoChange('tutor_password', e.target.value)}
                                            onBlur={() => handleBlur('tutor_password')} />
                                        {formErrors.tutor_password && <span className="tico-field-error">{formErrors.tutor_password}</span>}
                                    </label>

                                    <div className="tico-form-divider" style={{ margin: '1rem 0' }} />
                                    <p className="tico-form-section-label">Primera Cita (Opcional)</p>
                                    <div className="tico-form-row2">
                                        <label>Fecha sugerida
                                            <input
                                                className="tico-edit-input"
                                                type="date"
                                                value={formNuevo.fecha_cita || ''}
                                                onChange={(e) => handleFormNuevoChange('fecha_cita', e.target.value)} />
                                        </label>
                                        <label>Hora
                                            <input
                                                className="tico-edit-input"
                                                type="time"
                                                value={formNuevo.hora_cita || ''}
                                                onChange={(e) => handleFormNuevoChange('hora_cita', e.target.value)} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                        </div>{/* fin tico-form-two-cols */}

                        {/* Overlay de carga / éxito */}
                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message="Registrando paciente..." />
                                ) : (
                                    <div className="tico-save-success">
                                        <div className="tico-save-success__icon"><Check size={32} /></div>
                                        <span>{saveSuccess}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" disabled={saving} onClick={() => { setModalNuevo(false); setFormErrors({}); }}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" disabled={saving} onClick={handleAgregarPaciente}>
                                {saving ? 'Guardando...' : 'Agregar paciente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Ver Perfil ── */}
            {modalPaciente && (
                <div className="tico-modal-overlay" onClick={() => setModalPaciente(null)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setModalPaciente(null)}>
                            <X size={18} />
                        </button>
                        <div className="tico-modal-avatar">🧒</div>
                        <h2 className="tico-modal-title">{modalPaciente.paciente}</h2>

                        <div className="tico-form-two-cols" style={{ marginTop: '1rem' }}>
                            {/* Columna izquierda: Paciente */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Paciente</p>
                                <div className="tico-modal-grid">
                                    <div className="tico-modal-field"><span>Fecha de nacimiento</span><strong>{modalPaciente.fecha_nacimiento || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Edad</span><strong>{modalPaciente.edad || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Género</span><strong>{modalPaciente.genero || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Peso</span><strong>{modalPaciente.peso_kg ? `${modalPaciente.peso_kg} kg` : '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Altura</span><strong>{modalPaciente.altura_cm ? `${modalPaciente.altura_cm} cm` : '—'}</strong></div>
                                    <div className="tico-modal-field"><span>IMC</span><strong>{modalPaciente.imc ? `${modalPaciente.imc} kg/m²` : '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Alergias</span><strong>{modalPaciente.alergias || 'Ninguna'}</strong></div>
                                    <div className="tico-modal-field"><span>Observación</span><strong>{modalPaciente.observacion || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Estado clínico</span><strong>{modalPaciente.estado || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Monto mensual</span><strong>{modalPaciente.monto_mensual ? `$${modalPaciente.monto_mensual}` : '—'}</strong></div>
                                    <div className="tico-modal-field">
                                        <span>Activo</span>
                                        <strong>{modalPaciente.active ? '✅ Activo' : '❌ Inhabilitado'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="tico-form-divider" />

                            {/* Columna derecha: Tutor */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Tutor</p>
                                <div className="tico-modal-grid">
                                    <div className="tico-modal-field"><span>Nombre</span><strong>{modalPaciente.tutor || modalPaciente.tutor_nombre || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Parentesco</span><strong>{modalPaciente.tutor_parentesco || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Teléfono</span><strong>{modalPaciente.tutor_telefono || '—'}</strong></div>
                                    <div className="tico-modal-field"><span>Correo</span><strong>{modalPaciente.tutor_email || '—'}</strong></div>
                                </div>

                                <p className="tico-form-section-label" style={{ marginTop: '1.5rem' }}>Próxima Cita</p>
                                <div className="tico-modal-grid">
                                    <div className="tico-modal-field"><span>Fecha</span><strong>{modalPaciente.cita || '—'}</strong></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Editar ── */}
            {editPaciente && (
                <div className="tico-modal-overlay" onClick={() => setEditPaciente(null)}>
                    <div className="tico-modal tico-modal-wide" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setEditPaciente(null)}>
                            <X size={18} />
                        </button>

                        <h2 className="tico-modal-title" style={{ marginBottom: '0.5rem' }}>Editar Paciente</h2>
                        <p className="tico-form-hint" style={{ textAlign: 'left', marginBottom: '1rem' }}>Modifica los datos del paciente</p>

                        <div className="tico-form-two-cols">

                            {/* Columna izquierda: Paciente */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Paciente</p>
                                <div className="tico-form-stack">
                                    <label>Nombre completo
                                        <input className="tico-edit-input" placeholder="Nombre completo"
                                            maxLength={30}
                                            value={editPaciente.paciente || ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]*$/.test(v)) return;
                                                setEditPaciente({ ...editPaciente, paciente: v });
                                            }} />
                                    </label>
                                    <label>Fecha de nacimiento
                                        <input className="tico-edit-input" type="date"
                                            value={editPaciente.fecha_nacimiento || ''}
                                            onChange={(e) => setEditPaciente({ ...editPaciente, fecha_nacimiento: e.target.value })} />
                                    </label>
                                    <label>Género
                                        <select className="tico-edit-input" value={editPaciente.genero || 'Masculino'}
                                            onChange={(e) => setEditPaciente({ ...editPaciente, genero: e.target.value })}>
                                            <option>Masculino</option>
                                            <option>Femenino</option>
                                        </select>
                                    </label>
                                    <div className="tico-form-row2">
                                        <label>Peso (kg)
                                            <input className="tico-edit-input" type="number" placeholder="peso en kg" min="0" max="300"
                                                value={editPaciente.peso_kg || ''}
                                                onChange={(e) => {
                                                    const peso = e.target.value;
                                                    if (parseFloat(peso) > 300) return;
                                                    const h = parseFloat(editPaciente.altura_cm) / 100;
                                                    const imc = peso && h ? (parseFloat(peso) / (h * h)).toFixed(2) : '';
                                                    setEditPaciente({ ...editPaciente, peso_kg: peso, imc });
                                                }} />
                                        </label>
                                        <label>Altura (cm)
                                            <input className="tico-edit-input" type="number" placeholder="altura en cm" min="0" max="250"
                                                value={editPaciente.altura_cm || ''}
                                                onChange={(e) => {
                                                    const altura = e.target.value;
                                                    if (parseFloat(altura) > 250) return;
                                                    const h = parseFloat(altura) / 100;
                                                    const imc = editPaciente.peso_kg && h ? (parseFloat(editPaciente.peso_kg) / (h * h)).toFixed(2) : '';
                                                    setEditPaciente({ ...editPaciente, altura_cm: altura, imc });
                                                }} />
                                        </label>
                                    </div>
                                    <label>IMC (auto-calculado)
                                        <input className="tico-edit-input tico-input-readonly" readOnly
                                            value={editPaciente.imc ? `${editPaciente.imc} kg/m²` : '—'} />
                                    </label>
                                    <label>Alergias
                                        <input className="tico-edit-input" placeholder="(vacío si ninguna)"
                                            maxLength={120}
                                            value={editPaciente.alergias || ''}
                                            onChange={(e) => setEditPaciente({ ...editPaciente, alergias: e.target.value })} />
                                    </label>
                                    <div className="tico-form-row2">
                                        <label>Observación
                                            <select className="tico-edit-input" value={editPaciente.observacion || 'Bajo'}
                                                onChange={(e) => setEditPaciente({ ...editPaciente, observacion: e.target.value })}>
                                                <option>Bajo</option>
                                                <option>Medio</option>
                                                <option>Alto</option>
                                            </select>
                                        </label>
                                        <label>Estado
                                            <select className="tico-edit-input" value={editPaciente.estado || 'Estable'}
                                                onChange={(e) => setEditPaciente({ ...editPaciente, estado: e.target.value })}>
                                                <option>Estable</option>
                                                <option>Inestable</option>
                                            </select>
                                        </label>
                                    </div>
                                    <label>Monto mensual ($)
                                        <input className="tico-edit-input" type="number" placeholder="500.00" min="0" max="99999"
                                            value={editPaciente.monto_mensual || ''}
                                            onChange={(e) => {
                                                if (parseFloat(e.target.value) > 99999) return;
                                                setEditPaciente({ ...editPaciente, monto_mensual: e.target.value });
                                            }} />
                                    </label>
                                </div>
                            </div>

                            {/* Divisor vertical */}
                            <div className="tico-form-divider" />

                            {/* Columna derecha: Tutor */}
                            <div className="tico-form-col">
                                <p className="tico-form-section-label">Datos del Tutor</p>
                                <div className="tico-form-stack">
                                    <label>Nombre del tutor
                                        <input className="tico-edit-input" placeholder="Nombre del tutor"
                                            maxLength={30}
                                            value={editPaciente.tutor || editPaciente.tutor_nombre || ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v.length > 0 && !/^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s.'-]*$/.test(v)) return;
                                                setEditPaciente({ ...editPaciente, tutor: v, tutor_nombre: v });
                                            }} />
                                    </label>
                                    <label>Parentesco
                                        <select className="tico-edit-input" value={editPaciente.tutor_parentesco || ''}
                                            onChange={(e) => setEditPaciente({ ...editPaciente, tutor_parentesco: e.target.value })}>
                                            <option value="">— Seleccionar —</option>
                                            <option>Padre</option>
                                            <option>Madre</option>
                                            <option>Abuelo/a</option>
                                            <option>Tío/a</option>
                                            <option>Hermano/a</option>
                                            <option>Tutor legal</option>
                                            <option>Otro</option>
                                        </select>
                                    </label>
                                    <label>Teléfono
                                        <input
                                            className="tico-edit-input"
                                            placeholder="Ej. 555-1234"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={editPaciente.tutor_telefono || ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (!/^[\d\s+()\-]*$/.test(v)) return;
                                                setEditPaciente({ ...editPaciente, tutor_telefono: v });
                                            }} />
                                    </label>
                                    <label>Correo electrónico
                                        <input
                                            className="tico-edit-input"
                                            type="email"
                                            placeholder="tutor@correo.com"
                                            maxLength={80}
                                            value={editPaciente.tutor_email || ''}
                                            onChange={(e) => {
                                                const v = e.target.value;
                                                if (v.includes(' ')) return;
                                                setEditPaciente({ ...editPaciente, tutor_email: v });
                                            }} />
                                    </label>
                                </div>
                            </div>

                        </div>{/* fin tico-form-two-cols */}

                        {/* Overlay de carga / éxito */}
                        {(saving || saveSuccess) && (
                            <div className="tico-save-overlay">
                                {saving ? (
                                    <PageLoader message="Actualizando paciente..." />
                                ) : (
                                    <div className="tico-save-success">
                                        <div className="tico-save-success__icon"><Check size={32} /></div>
                                        <span>{saveSuccess}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="tico-edit-actions" style={{ marginTop: '1.25rem' }}>
                            <button className="tico-btn tico-btn-outline" disabled={saving} onClick={() => setEditPaciente(null)}>Cancelar</button>
                            <button className="tico-btn tico-btn-primary" disabled={saving} onClick={handleGuardarEdicion}>
                                {saving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PacientesPage;
