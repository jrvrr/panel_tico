const BASE_URL = 'http://localhost:3000/api';

// ── Headers ─────────────────────────────────────────────────────────────────
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const publicHeaders = { 'Content-Type': 'application/json' };

// ── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Inicia sesión con email y password.
 * Guarda el token JWT y los datos del usuario en localStorage.
 * @returns {{ token: string, user: object }}
 */
export const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: publicHeaders,
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    localStorage.setItem('token', data.token);
    // Guardar datos del usuario para restaurar sesión al recargar
    if (data.user) localStorage.setItem('tico_user', JSON.stringify(data.user));
    return data;
};

/**
 * Cierra sesión: invalida el token en el servidor y borra localStorage.
 */
export const logout = async () => {
    try {
        await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: authHeaders(),
        });
    } catch (_) {
        // Si el servidor falla al cerrar sesión, limpiar de todas formas
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('tico_user');
    }
};

// ── PACIENTES ────────────────────────────────────────────────────────────────

export const getPacientes = async () => {
    const res = await fetch(`${BASE_URL}/pacientes`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener pacientes');
    return data;
};

export const createPaciente = async (paciente) => {
    const res = await fetch(`${BASE_URL}/pacientes`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(paciente),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear paciente');
    return data;
};

// ── CITAS ────────────────────────────────────────────────────────────────────

export const getCitas = async () => {
    const res = await fetch(`${BASE_URL}/citas`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener citas');
    return data;
};

// ── PAGOS ────────────────────────────────────────────────────────────────────

export const getPagos = async () => {
    const res = await fetch(`${BASE_URL}/pagos`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener pagos');
    return data;
};

// ── TUTORES ──────────────────────────────────────────────────────────────────

export const getTutores = async () => {
    const res = await fetch(`${BASE_URL}/tutores`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener tutores');
    return data;
};

// ── ESPECIALISTAS ────────────────────────────────────────────────────────────

export const getEspecialistas = async () => {
    const res = await fetch(`${BASE_URL}/especialistas`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener especialistas');
    return data;
};
