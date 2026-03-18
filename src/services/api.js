const BASE_URL = 'http://localhost:3000/api';

// ── Headers ─────────────────────────────────────────────────────────────────
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const publicHeaders = { 'Content-Type': 'application/json' };

// ── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Inicia el proceso de login, retornando { message, require2FA, email }
 * si las credenciales son correctas.
 */
export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        // No enviamos Content-Type, el navegador lo añade automáticamente como multipart/form-data
        // Pero si necesitamos autorización, la enviamos:
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al subir archivo');
    return data; // { url, message, status }
};

/**
 * Inicia el proceso de login, retornando { message, require2FA, email }
 * si las credenciales son correctas.
 */
export const login = async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: publicHeaders,
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Credenciales inválidas');
    return data;
};

/**
 * Verifica el código 2FA enviado por correo.
 * Si es exitoso, guarda el token y la sesión.
 */
export const verify2FACode = async (email, code) => {
    const res = await fetch(`${BASE_URL}/verify-2fa`, {
        method: 'POST',
        headers: publicHeaders,
        body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Código de verificación inválido');

    // Guardar token y sesión
    localStorage.setItem('token', data.token);
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

export const updatePaciente = async (id, paciente) => {
    const res = await fetch(`${BASE_URL}/pacientes/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(paciente),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar paciente');
    return data;
};

// ── CITAS ────────────────────────────────────────────────────────────────────

export const getCitas = async () => {
    const res = await fetch(`${BASE_URL}/citas`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener citas');
    return data;
};

export const createCita = async (cita) => {
    const res = await fetch(`${BASE_URL}/citas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(cita),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear cita');
    return data;
};

export const updateCita = async (id, cita) => {
    const res = await fetch(`${BASE_URL}/citas/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(cita),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar cita');
    return data;
};

// ── PAGOS ────────────────────────────────────────────────────────────────────

export const getPagos = async () => {
    const res = await fetch(`${BASE_URL}/pagos`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener pagos');
    return data;
};

export const createPago = async (pago) => {
    const res = await fetch(`${BASE_URL}/pagos`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(pago),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar pago');
    return data;
};

export const updatePago = async (id, pago) => {
    const res = await fetch(`${BASE_URL}/pagos/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(pago),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar pago');
    return data;
};

export const deletePago = async (id) => {
    const res = await fetch(`${BASE_URL}/pagos/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar pago');
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

export const createEspecialista = async (especialista) => {
    const res = await fetch(`${BASE_URL}/especialistas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(especialista),
    });
    const data = await res.json();
    if (!res.ok) {
        if (data.errors && data.errors.length > 0) {
            throw new Error(data.errors[0].msg || 'Error de validación');
        }
        throw new Error(data.message || 'Error al crear especialista');
    }
    return data;
};

export const updateEspecialista = async (id, especialista) => {
    const res = await fetch(`${BASE_URL}/especialistas/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(especialista),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar especialista');
    return data;
};

export const deleteEspecialista = async (id) => {
    const res = await fetch(`${BASE_URL}/especialistas/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar especialista');
    return data;
};

// ── MÉTRICAS IA ─────────────────────────────────────────────────────────────

export const getMetricasIA = async () => {
    const res = await fetch(`${BASE_URL}/metricas-ia`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener métricas');
    return data;
};

export const getMetricasByPaciente = async (pacienteId) => {
    const res = await fetch(`${BASE_URL}/metricas-ia/paciente/${pacienteId}`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al obtener métricas del paciente');
    return data;
};

