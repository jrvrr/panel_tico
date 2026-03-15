import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, EyeOff, Eye, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { login, verify2FACode } from '../../services/api';
import './Login.css';

const LoginPage = () => {
    const { complete2FA } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();
    const recaptchaRef = useRef(null);

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);

    // 2FA & ReCAPTCHA
    const [captchaValido, setCaptchaValido] = useState(false);
    const [code2fa, setCode2fa] = useState('');
    // Eliminado tempData temporal, ahora usaremos el email confirmado

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCaptchaChange = (value) => {
        setCaptchaValido(!!value);
        if (value) setError('');
    };

    const handleBack = () => {
        setStep(1);
        setCode2fa('');
        setError('');
        setCaptchaValido(false);
        if (recaptchaRef.current) recaptchaRef.current.reset();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (step === 1) {
            if (!email.trim() || !password) {
                setError('Completa todos los campos');
                return;
            }
            if (!captchaValido) {
                setError('Por favor, completa el ReCAPTCHA verificando que no eres un robot');
                return;
            }

            setLoading(true);
            setError('');
            try {
                // Paso 1: Llamar al backend para validar credenciales y enviar correo
                const data = await login(email.trim(), password);
                if (data.require2FA) {
                    setStep(2); // Avanzar a 2FA si las credenciales son válidas
                } else {
                    // Fallback por si la API en un futuro no requiere 2FA
                    complete2FA(data);
                    // navigate('/', { replace: true });
                }
            } catch (err) {
                const msg = err.message || 'Credenciales inválidas';
                setError(msg);
                addNotification({
                    titulo: 'Error de inicio de sesión',
                    mensaje: msg,
                    nivel: 'error'
                });
                setCaptchaValido(false);
                if (recaptchaRef.current) recaptchaRef.current.reset();
            } finally {
                setLoading(false);
            }
        } else {
            // Paso 2: Autenticación de doble factor
            if (!code2fa || code2fa.length < 6) {
                setError('Ingresa el código de 6 dígitos');
                return;
            }

            setLoading(true);
            setError('');
            try {
                // Verificar código real en el backend
                const data = await verify2FACode(email.trim(), code2fa);

                // Finalizar inicio de sesión en el frontend guardando estado
                complete2FA(data);
                // navigate('/', { replace: true });
            } catch (err) {
                const msg = err.message || 'Error al verificar código';
                setError(msg);
                addNotification({
                    titulo: 'Error de verificación',
                    mensaje: msg,
                    nivel: 'error'
                });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-root">
            <div className="login-bg">
                <div className="login-blob login-blob-yellow" />
                <div className="login-blob login-blob-purple" />
                <div className="login-blob login-blob-pink" />
            </div>

            <div className="login-glass-container">
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

                <div className="login-right">
                    <div className="login-form-area">
                        <div className="login-card-header">
                            <h2 className="login-card-title">{step === 1 ? 'Iniciar sesión' : 'Doble factor'}</h2>
                            <p className="login-card-subtitle">
                                {step === 1 ? 'Centro Terapéutico' : 'Paso adicional de seguridad'}
                            </p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit} noValidate>
                            {step === 1 ? (
                                <>
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

                                    {/* Opciones */}
                                    <div className="login-options-row">
                                        <label className="remember-me">
                                            <input type="checkbox" defaultChecked />
                                            <span>Recordar</span>
                                        </label>
                                    </div>

                                    {/* ReCAPTCHA */}
                                    <div className="recaptcha-wrapper-block">
                                        <ReCAPTCHA
                                            ref={recaptchaRef}
                                            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                            onChange={handleCaptchaChange}
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="login-2fa-info">
                                        <KeyRound size={42} className="login-2fa-icon" />
                                        <p>Se ha enviado un código de 6 dígitos a tu correo. Por favor, ingrésalo para continuar.</p>
                                    </div>
                                    <div className="login-field">
                                        <label className="login-label" htmlFor="login-2fa">Código de seguridad</label>
                                        <div className="login-input-wrap">
                                            <input
                                                id="login-2fa"
                                                type="text"
                                                maxLength={6}
                                                className={`login-input login-2fa-input ${error ? ' error' : ''}`}
                                                placeholder="000000"
                                                value={code2fa}
                                                onChange={e => { setCode2fa(e.target.value.replace(/\D/g, '')); setError(''); }}
                                                autoFocus
                                                autoComplete="one-time-code"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" className="login-back-btn" onClick={handleBack}>
                                        <ArrowLeft size={16} /> Volver a credenciales
                                    </button>
                                </>
                            )}

                            {error && (
                                <div className="login-error-msg">
                                    <AlertCircle size={14} />
                                    {error}
                                </div>
                            )}

                            <button type="submit" className="login-submit" disabled={loading || (step === 1 && !captchaValido)}>
                                {loading
                                    ? <><div className="login-spinner" /> Verificando…</>
                                    : (step === 1 ? 'Iniciar sesión' : 'Verificar código')
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
