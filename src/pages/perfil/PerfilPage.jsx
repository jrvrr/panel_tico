import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateEspecialista, uploadFile } from '../../services/api';
import { toast } from 'sonner';
import {
    User,
    Settings,
    Clock,
    Award,
    Image as ImageIcon,
    Save,
    Loader2
} from 'lucide-react';
import TicoDateInput from '../../components/TicoDateInput';
import HorarioEditor, { parseHorario, serializeHorario } from '../../components/HorarioEditor';
import TicoConfirmModal from '../../components/TicoConfirmModal';
import './Perfil.css';



const PerfilPage = () => {
    const { user, updateUser } = useAuth();


    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        email: '',
        telefono: '',
        rol_id: null,
        estado_activo: true,
        horario_atencion: '',
        especialidad_principal: '',
        cedula_profesional: '',
        biografia: '',
        fecha_nacimiento: '',
        foto_url: '',
        firma_url: ''
    });

    // Estado separado para el horario estructurado (objeto)
    const [horarioObj, setHorarioObj] = useState(() => parseHorario(null));

    const [activeTab, setActiveTab] = useState('perfil');

    // Referencias ocultas para los inputs de archivo
    const fotoInputRef = useRef(null);
    const firmaInputRef = useRef(null);
    const [uploadingField, setUploadingField] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false });

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                apellido_paterno: user.apellido_paterno || '',
                apellido_materno: user.apellido_materno || '',
                email: user.email || '',
                telefono: user.telefono || '',
                rol_id: user.rol_id,
                estado_activo: user.estado_activo ?? true,
                horario_atencion: user.horario_atencion || '',
                especialidad_principal: user.especialidad_principal || '',
                cedula_profesional: user.cedula_profesional || '',
                biografia: user.biografia || '',
                fecha_nacimiento: user.fecha_nacimiento ? (user.fecha_nacimiento.includes('T') ? user.fecha_nacimiento.split('T')[0] : new Date(user.fecha_nacimiento).toISOString().split('T')[0]).split('T')[0] : '',
                foto_url: user.foto_url || '',
                firma_url: user.firma_url || ''
            });
            // Parsear el horario estructurado desde el JSON guardado
            setHorarioObj(parseHorario(user.horario_atencion || null));
        }
    }, [user]);

    const handleChange = (e) => {
        let { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSaveClick = (e) => {
        e.preventDefault();
        
        // Si estamos en la pestaña de disponibilidad, pedimos confirmación
        if (activeTab === 'disponibilidad') {
            setConfirmModal({
                isOpen: true,
                title: '¿Guardar disponibilidad?',
                message: 'Se actualizarán tus horarios de atención semanal en el sistema.',
                confirmText: 'Sí, guardar cambios',
                onConfirm: () => {
                    setConfirmModal({ isOpen: false });
                    handleSubmit(e);
                }
            });
        } else {
            // En otras pestañas guardamos directo (o podrías pedir confirmación también)
            handleSubmit(e);
        }
    };

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!user || !user.id) return;

        setLoading(true);
        try {
            // Serializar el horario estructurado a JSON antes de enviar
            const dataToSend = {
                ...formData,
                horario_atencion: serializeHorario(horarioObj),
            };
            const result = await updateEspecialista(user.id, dataToSend);
            if (result && result.data) {
                updateUser(result.data);
                toast.success('Perfil actualizado correctamente', {
                    description: 'Tus modificaciones han sido guardadas.',
                });
            }
        } catch (error) {
            toast.error('Error al guardar', { description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingField(field); // 'foto' o 'firma'
        try {
            const data = await uploadFile(file);
            setFormData(prev => ({
                ...prev,
                [field === 'foto' ? 'foto_url' : 'firma_url']: data.url
            }));
            toast.success('Archivo subido correctamente');
        } catch (error) {
            toast.error('Error al subir archivo', { description: error.message });
        } finally {
            setUploadingField(null);
            e.target.value = ''; // Resetear el input
        }
    };

    return (
        <div className="perfil-page-container">
            <header className="perfil-header">
                <h1 className="perfil-title">Mi Perfil Profesional</h1>
                <p className="perfil-subtitle">Gestiona tu información pública, credenciales y preferencias de plataforma.</p>
            </header>

            <form onSubmit={handleSubmit}>

                {/* Top Navigation ("Carpetas") */}
                <nav className="perfil-nav">
                    <button type="button" onClick={() => setActiveTab('perfil')} className={`perfil-nav-btn ${activeTab === 'perfil' ? 'active' : ''}`}>
                        <User size={16} /> Datos Personales
                    </button>
                    <button type="button" onClick={() => setActiveTab('disponibilidad')} className={`perfil-nav-btn ${activeTab === 'disponibilidad' ? 'active' : ''}`}>
                        <Clock size={16} /> Disponibilidad
                    </button>
                    <button type="button" onClick={() => setActiveTab('credenciales')} className={`perfil-nav-btn ${activeTab === 'credenciales' ? 'active' : ''}`}>
                        <Award size={16} /> Especialidad e Registro
                    </button>
                    <button type="button" onClick={() => setActiveTab('multimedia')} className={`perfil-nav-btn ${activeTab === 'multimedia' ? 'active' : ''}`}>
                        <ImageIcon size={16} /> Multimedia
                    </button>
                </nav>

                {/* Form Wrapper Box */}
                <div className="perfil-content">

                    {/* 1. Datos Personales */}
                    {activeTab === 'perfil' && (
                        <section className="perfil-section">
                            <div className="perfil-section-header">
                                <div className="perfil-section-icon"><User size={20} /></div>
                                <div>
                                    <h2 className="perfil-section-title">Datos Personales</h2>
                                    <p className="perfil-section-desc">Esta información se usará para contacto interno y mostrarte a tus pacientes.</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Nombre(s) *</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Ej. Juan"
                                        required
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Apellido Paterno *</label>
                                    <input
                                        type="text"
                                        name="apellido_paterno"
                                        value={formData.apellido_paterno}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Ej. Pérez"
                                        required
                                    />
                                </div>
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Apellido Materno</label>
                                    <input
                                        type="text"
                                        name="apellido_materno"
                                        value={formData.apellido_materno}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Ej. García"
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Fecha de Nacimiento</label>
                                    <TicoDateInput
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={(val) => setFormData(prev => ({ ...prev, fecha_nacimiento: val }))}
                                        className="perfil-input"
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="correo@ejemplo.com"
                                        required
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Teléfono de Contacto</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="+52 555 123 4567"
                                    />
                                </div>
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Biografía Profesional</label>
                                    <textarea
                                        name="biografia"
                                        value={formData.biografia}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                        placeholder="Escribe un breve resumen sobre tu experiencia..."
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 3. Disponibilidad */}
                    {activeTab === 'disponibilidad' && (
                        <section className="perfil-section">
                            <div className="perfil-section-header">
                                <div className="perfil-section-icon"><Clock size={20} /></div>
                                <div>
                                    <h2 className="perfil-section-title">Disponibilidad</h2>
                                    <p className="perfil-section-desc">Indica tus días y horarios habituales de atención.</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Horario de Atención Semanal</label>
                                    <p className="perfil-section-desc" style={{ marginBottom: '0.6rem' }}>
                                        Define tus días y horarios de atención. Puedes agregar hasta 2 turnos por día.
                                    </p>
                                    <HorarioEditor
                                        value={horarioObj}
                                        onChange={setHorarioObj}
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 4. Especialidad y Registro */}
                    {activeTab === 'credenciales' && (
                        <section className="perfil-section">
                            <div className="perfil-section-header">
                                <div className="perfil-section-icon"><Award size={20} /></div>
                                <div>
                                    <h2 className="perfil-section-title">Especialidad e Registro</h2>
                                    <p className="perfil-section-desc">Datos oficiales de tu carrera médica.</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Especialidad Principal</label>
                                    <input
                                        type="text"
                                        name="especialidad_principal"
                                        value={formData.especialidad_principal}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Odontología General, Ortodoncia, etc."
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Cédula Profesional</label>
                                    <input
                                        type="text"
                                        name="cedula_profesional"
                                        value={formData.cedula_profesional}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Ej. 12345678"
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 5. Multimedia */}
                    {activeTab === 'multimedia' && (
                        <section className="perfil-section">
                            <div className="perfil-section-header">
                                <div className="perfil-section-icon"><ImageIcon size={20} /></div>
                                <div>
                                    <h2 className="perfil-section-title">Multimedia</h2>
                                    <p className="perfil-section-desc">Sube tus imágenes desde tu computadora (máx. 5MB, solo imágenes).</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Foto de Perfil</label>
                                    <div className="perfil-file-preview">
                                        <img
                                            src={formData.foto_url || 'https://ui-avatars.com/api/?name=Usuario&background=e2e8f0'}
                                            alt="Preview Avatar"
                                            className="perfil-avatar-preview"
                                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Error&background=fee2e2&color=ef4444' }}
                                        />
                                        <div className="perfil-upload-info">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fotoInputRef}
                                                onChange={(e) => handleFileUpload(e, 'foto')}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fotoInputRef.current?.click()}
                                                className="perfil-btn-upload"
                                                disabled={uploadingField === 'foto'}
                                            >
                                                {uploadingField === 'foto' ? <Loader2 size={16} className="animate-spin" /> : <><ImageIcon size={16} /> Subir Foto de Perfil</>}
                                            </button>
                                            {formData.foto_url && (
                                                <span className="perfil-upload-url">{formData.foto_url}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Firma Digital Escaneada</label>
                                    <div className="perfil-file-preview">
                                        {formData.firma_url ? (
                                            <img
                                                src={formData.firma_url}
                                                alt="Firma Preview"
                                                className="perfil-firma-preview"
                                            />
                                        ) : (
                                            <div className="perfil-firma-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', background: '#f8fafc' }}>
                                                Sin firma
                                            </div>
                                        )}
                                        <div className="perfil-upload-info">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={firmaInputRef}
                                                onChange={(e) => handleFileUpload(e, 'firma')}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => firmaInputRef.current?.click()}
                                                className="perfil-btn-upload"
                                                disabled={uploadingField === 'firma'}
                                            >
                                                {uploadingField === 'firma' ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Subir Firma (PNG)</>}
                                            </button>
                                            {formData.firma_url && (
                                                <span className="perfil-upload-url">{formData.firma_url}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                </div>

                {/* Submit Bar Flotante (sigue abajo independiente de la pestaña) */}
                <div className="perfil-actions-bar">
                    <span className="text-sm text-gray-500 font-medium">Puedes navegar entre pestañas; los datos no se perderán.</span>
                    <button type="button" onClick={handleSaveClick} className="perfil-btn-save" disabled={loading}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? "Guardando..." : "Guardar Todos los Cambios"}
                    </button>
                </div>
            </form>

            <TicoConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ isOpen: false })}
                type="info"
            />
        </div>
    );
};

export default PerfilPage;
