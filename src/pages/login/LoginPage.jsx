import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

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

    return (
        <div className="login-root">
            {/* Burbujas animadas — réplica exacta de la imagen de referencia */}
            <div className="login-bg">
                <div className="login-blob login-blob-yellow" />
                <div className="login-blob login-blob-purple" />
                <div className="login-blob login-blob-pink" />
            </div>

            {/* Contenedor principal dividido */}
            <div className="login-glass-container">

                {/* Panel izquierdo — branding */}
                <div className="login-left">
                    <div className="login-brand">
                        <span className="login-brand-name">Centro TICO</span>
                    </div>

                    <h1 className="login-headline">
                        Gestión clínica<br />
                        <span>inteligente y segura</span>
                    </h1>

                    <p className="login-desc">
                        Plataforma integral para el seguimiento de pacientes,
                        citas, pagos y especialistas del Centro Terapéutico.
                    </p>

                </div>

                {/* Panel derecho — formulario glass */}
                <div className="login-right">
                    <div className="login-form-area">

                        <div className="login-card-header">
                            <h2 className="login-card-title">Iniciar sesión</h2>
                            <p className="login-card-subtitle">Centro Terapéutico</p>
                        </div>

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

                            {/* Options row */}
                            <div className="login-options-row">
                                <label className="remember-me">
                                    <input type="checkbox" defaultChecked />
                                    <span>Recordar</span>
                                </label>
                                <a href="#" className="forgot-password">Olvidé contraseña?</a>
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
        </div>
    );
};

export default LoginPage;
