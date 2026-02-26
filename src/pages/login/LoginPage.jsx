import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

// Iniciales de un nombre
const initials = (nombre = '') => {
    const p = nombre.trim().split(' ');
    return p.length === 1 ? p[0][0]?.toUpperCase() || '?' : (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

// Colores para avatares rápidos
const AVATAR_COLORS = [
    'linear-gradient(135deg,#f59e0b,#d97706)',  // dorado → Super Admin
    'linear-gradient(135deg,#3b82f6,#6d28d9)',
    'linear-gradient(135deg,#10b981,#0e7490)',
    'linear-gradient(135deg,#ec4899,#7c3aed)',
];

// Usuarios reales de la BD — credenciales para acceso rápido (desarrollo)
const QUICK_USERS = [
    { nombre: 'Jerry Admin', email: 'jerry@tico.com', password: 'jerry123', rol: 'SUPER_ADMIN' },
    { nombre: 'Dr. Fernando', email: 'fer@tico.com', password: 'fernando123', rol: 'ESPECIALISTA' },
];

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            setError('Completa todos los campos');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await login(email.trim(), password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickLogin = async (u) => {
        setEmail(u.email);
        setPassword(u.password);
        setError('');
        setLoading(true);
        try {
            await login(u.email, u.password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-root">
            {/* Blobs de fondo */}
            <div className="login-bg">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />
                <div className="login-blob login-blob-3" />
            </div>

            {/* Panel izquierdo — branding */}
            <div className="login-left">
                <div className="login-brand">
                    <div className="login-brand-logo">T</div>
                    <span className="login-brand-name">Centro TICO</span>
                </div>

                <h1 className="login-headline">
                    Gestión clínica<br />
                    <span>inteligente y segura</span>
                </h1>

                <p className="login-desc">
                    Plataforma integral para el seguimiento de pacientes,
                    citas, pagos y especialistas del Centro Terapéutico TICO.
                </p>

                <div className="login-features">
                    {[
                        'Control de pacientes y expedientes',
                        'Agenda de citas en tiempo real',
                        'Seguimiento de pagos y métricas',
                        'Gestión de especialistas con roles',
                    ].map(f => (
                        <div key={f} className="login-feature">
                            <div className="login-feature-dot" />
                            {f}
                        </div>
                    ))}
                </div>
            </div>

            {/* Panel derecho — card de login */}
            <div className="login-right">
                <div className="login-card">

                    {/* Ícono y título */}
                    <div className="login-card-header">
                        <div className="login-card-icon">T</div>
                        <h2 className="login-card-title">Iniciar sesión</h2>
                        <p className="login-card-subtitle">Centro Terapéutico TICO</p>
                    </div>

                    {/* Acceso rápido */}
                    <p className="login-quick-title">Acceso rápido como</p>
                    <div className="login-quick-list">
                        {QUICK_USERS.map((u, i) => (
                            <button
                                key={u.email}
                                className={`login-quick-btn${u.rol === 'SUPER_ADMIN' ? ' super-admin' : ''}`}
                                onClick={() => handleQuickLogin(u)}
                                disabled={loading}
                                title={u.email}
                            >
                                <div
                                    className="login-quick-avatar"
                                    style={{ background: AVATAR_COLORS[i] }}
                                >
                                    {initials(u.nombre)}
                                </div>
                                <span className="login-quick-name">
                                    {u.nombre.split(' ').slice(0, 2).join(' ')}
                                </span>
                                <span className="login-quick-role">
                                    {u.rol === 'SUPER_ADMIN' ? '⭐ Admin' : 'Especialista'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Divisor */}
                    <div className="login-divider">
                        <div className="login-divider-line" />
                        <span className="login-divider-text">o ingresa tus credenciales</span>
                        <div className="login-divider-line" />
                    </div>

                    {/* Formulario */}
                    <form className="login-form" onSubmit={handleSubmit} noValidate>

                        {/* Email */}
                        <div className="login-field">
                            <label className="login-label" htmlFor="login-email">Correo electrónico</label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon"><Mail size={15} /></span>
                                <input
                                    id="login-email"
                                    type="email"
                                    className={`login-input${error ? ' error' : ''}`}
                                    placeholder="ejemplo@tico.mx"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); setError(''); }}
                                    autoComplete="email"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="login-field">
                            <label className="login-label" htmlFor="login-password">Contraseña</label>
                            <div className="login-input-wrap">
                                <span className="login-input-icon"><Lock size={15} /></span>
                                <input
                                    id="login-password"
                                    type={showPwd ? 'text' : 'password'}
                                    className={`login-input${error ? ' error' : ''}`}
                                    placeholder="Tu contraseña"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="login-eye-btn"
                                    onClick={() => setShowPwd(s => !s)}
                                    tabIndex={-1}
                                >
                                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error-msg">
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading
                                ? <><div className="login-spinner" /> Verificando…</>
                                : 'Entrar al sistema'
                            }
                        </button>
                    </form>

                    <p className="login-footer">
                        © 2025 Centro Terapéutico TICO · Todos los derechos reservados
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
