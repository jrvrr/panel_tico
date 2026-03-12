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
import './Perfil.css';

const PerfilPage = () => {
    const { user, updateUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        preferencia_modo_oscuro: false,
        preferencia_idioma: 'es',
        horario_atencion: '',
        especialidad_principal: '',
        cedula_profesional: '',
        biografia: '',
        fecha_nacimiento: '',
        foto_url: '',
        firma_url: ''
    });

    const [activeTab, setActiveTab] = useState('perfil');

    // Referencias ocultas para los inputs de archivo
    const fotoInputRef = useRef(null);
    const firmaInputRef = useRef(null);
    const [uploadingField, setUploadingField] = useState(null);

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                email: user.email || '',
                telefono: user.telefono || '',
                preferencia_modo_oscuro: user.preferencia_modo_oscuro || false,
                preferencia_idioma: user.preferencia_idioma || 'es',
                horario_atencion: user.horario_atencion || '',
                especialidad_principal: user.especialidad_principal || '',
                cedula_profesional: user.cedula_profesional || '',
                biografia: user.biografia || '',
                fecha_nacimiento: user.fecha_nacimiento ? user.fecha_nacimiento.split('T')[0] : '',
                foto_url: user.foto_url || '',
                firma_url: user.firma_url || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !user.id) return;

        setLoading(true);
        try {
            const result = await updateEspecialista(user.id, formData);
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
                    <button type="button" onClick={() => setActiveTab('preferencias')} className={`perfil-nav-btn ${activeTab === 'preferencias' ? 'active' : ''}`}>
                        <Settings size={16} /> Preferencias
                    </button>
                    <button type="button" onClick={() => setActiveTab('disponibilidad')} className={`perfil-nav-btn ${activeTab === 'disponibilidad' ? 'active' : ''}`}>
                        <Clock size={16} /> Disponibilidad
                    </button>
                    <button type="button" onClick={() => setActiveTab('credenciales')} className={`perfil-nav-btn ${activeTab === 'credenciales' ? 'active' : ''}`}>
                        <Award size={16} /> Especialidad y Registro
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
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Nombre Completo</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        placeholder="Ej. Dr. Juan Pérez"
                                        required
                                    />
                                </div>
                                <div className="perfil-form-group">
                                    <label className="perfil-label">Fecha de Nacimiento</label>
                                    <input
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
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
                                        placeholder="Escribe un breve resumen sobre tu experiencia, enfoque profesional o certificaciones destacadas..."
                                    />
                                </div>
                            </div>
                        </section>
                    )}

                    {/* 2. Preferencias de Interfaz */}
                    {activeTab === 'preferencias' && (
                        <section className="perfil-section">
                            <div className="perfil-section-header">
                                <div className="perfil-section-icon"><Settings size={20} /></div>
                                <div>
                                    <h2 className="perfil-section-title">Preferencias de Interfaz</h2>
                                    <p className="perfil-section-desc">Ajusta cómo visualizas la plataforma TICO.</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <div className="perfil-toggle">
                                        <div className="perfil-toggle-info">
                                            <strong>Modo Oscuro</strong>
                                            <span>Reduce la fatiga visual en ambientes con poca luz.</span>
                                        </div>
                                        <label className="tico-switch">
                                            <input
                                                type="checkbox"
                                                name="preferencia_modo_oscuro"
                                                checked={formData.preferencia_modo_oscuro}
                                                onChange={handleChange}
                                            />
                                            <span className="tico-slider"></span>
                                        </label>
                                    </div>
                                </div>

                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Idioma Preferido</label>
                                    <select
                                        name="preferencia_idioma"
                                        value={formData.preferencia_idioma}
                                        onChange={handleChange}
                                        className="perfil-input"
                                    >
                                        <option value="es">Español (México)</option>
                                        <option value="en">English (US)</option>
                                    </select>
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
                                    <h2 className="perfil-section-title">Disponibilidad Personal</h2>
                                    <p className="perfil-section-desc">Indica tus días y horarios habituales de atención.</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Descripción de Horarios</label>
                                    <textarea
                                        name="horario_atencion"
                                        value={formData.horario_atencion}
                                        onChange={handleChange}
                                        className="perfil-input"
                                        style={{ minHeight: '100px', resize: 'vertical' }}
                                        placeholder="Ej. Lunes a Viernes de 09:00 a 14:00 y de 16:00 a 19:00 hrs. Sábados de 10:00 a 14:00 hrs."
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
                                    <h2 className="perfil-section-title">Especialidad y Registro</h2>
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
                                    <h2 className="perfil-section-title">Foto de Perfil y Firma</h2>
                                    <p className="perfil-section-desc">Sube tus imágenes desde tu computadora (máx. 5MB, solo imágenes).</p>
                                </div>
                            </div>

                            <div className="perfil-form-grid">
                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Foto de Perfil</label>
                                    <div className="perfil-file-preview flex-col items-start gap-3">
                                        <div className="flex items-center gap-4 w-full">
                                            <img
                                                src={formData.foto_url || 'https://ui-avatars.com/api/?name=Usuario&background=e2e8f0'}
                                                alt="Preview Avatar"
                                                className="perfil-avatar-preview"
                                                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Error&background=fee2e2&color=ef4444' }}
                                            />
                                            <div className="flex flex-col gap-1 w-full relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={fotoInputRef}
                                                    onChange={(e) => handleFileUpload(e, 'foto')}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => fotoInputRef.current?.click()}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg self-start transition-colors flex justify-center items-center h-10 min-w-[140px]"
                                                    disabled={uploadingField === 'foto'}
                                                >
                                                    {uploadingField === 'foto' ? <Loader2 size={16} className="animate-spin" /> : 'Subir Foto'}
                                                </button>
                                                {formData.foto_url && (
                                                    <span className="text-xs text-gray-400 break-all">{formData.foto_url}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="perfil-form-group perfil-form-grid-full">
                                    <label className="perfil-label">Firma Digital Escaneada</label>
                                    <div className="perfil-file-preview flex-col items-start gap-3">
                                        <div className="flex items-center gap-4 w-full">
                                            {formData.firma_url ? (
                                                <img
                                                    src={formData.firma_url}
                                                    alt="Firma Preview"
                                                    className="perfil-firma-preview"
                                                />
                                            ) : (
                                                <div className="perfil-firma-preview flex items-center justify-center bg-slate-50 text-slate-400 text-xs w-[150px]">
                                                    Sin firma
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-1 w-full relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={firmaInputRef}
                                                    onChange={(e) => handleFileUpload(e, 'firma')}
                                                    className="hidden"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => firmaInputRef.current?.click()}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg self-start transition-colors flex justify-center items-center h-10 min-w-[140px]"
                                                    disabled={uploadingField === 'firma'}
                                                >
                                                    {uploadingField === 'firma' ? <Loader2 size={16} className="animate-spin" /> : 'Subir Firma (PNG)'}
                                                </button>
                                                {formData.firma_url && (
                                                    <span className="text-xs text-gray-400 break-all">{formData.firma_url}</span>
                                                )}
                                            </div>
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
                    <button type="submit" className="perfil-btn-save" disabled={loading}>
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Guardando...' : 'Guardar Todos los Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PerfilPage;
