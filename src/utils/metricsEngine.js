/**
 * Motor de cálculo de métricas IA para el panel terapéutico TDO.
 * Funciones puras — sin efectos secundarios, sin API.
 *
 * Juegos terapéuticos:
 *   🫧 Reventar Burbujas   → regulación emocional, velocidad, precisión
 *   🧩 Laberinto            → planificación, paciencia, tolerancia a frustración
 *   🎈 Globos por Colores   → atención selectiva, discriminación, control de impulsos
 *
 * Modelo heurístico (Fase 1 / MVP):
 *   Riesgo = Burbujas(25%) + Laberinto(25%) + Globos(25%) + General(25%)
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Promedia un array numérico */
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / (arr.length || 1);

/** Clamp entre 0 y 100 */
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

/** Separa las últimas 4 semanas (actuales) y las 4 anteriores */
const splitSemanas = (semanas) => {
    const prev = semanas.slice(0, 4);
    const curr = semanas.slice(4, 8);
    return { prev, curr };
};

// ── Riesgo IA ────────────────────────────────────────────────────────────────

/**
 * Calcula el score compuesto de riesgo IA (0-100).
 * Usa las 4 semanas más recientes del paciente.
 *
 * Fórmula por juego:
 *   Burbujas:  (100 - precisión) × 0.15 + rabietas_norm × 0.10
 *   Laberinto: abandonos_norm × 0.15 + intentosFallidos_norm × 0.10
 *   Globos:    (100 - precisionColor) × 0.15 + erroresColor_norm × 0.10
 *   General:   bajaAdherencia × 0.15 + cancelaciones_norm × 0.10
 *
 * @param {Array} semanas - 8 semanas de datos del paciente
 * @returns {{ score: number, nivel: string, color: string }}
 */
export const calcularRiesgoIA = (semanas) => {
    const { curr } = splitSemanas(semanas);

    // 🫧 Burbujas
    const precBurbujas = avg(curr.map(s => s.burbujas.precision));
    const rabietasProm = avg(curr.map(s => s.burbujas.rabietas));
    const rabietasNorm = clamp((rabietasProm / 6) * 100); // 6 rabietas = 100%
    const scoreBurbujas = (100 - precBurbujas) * 0.15 + rabietasNorm * 0.10;

    // 🧩 Laberinto
    const abandonosProm = avg(curr.map(s => s.laberinto.abandonos));
    const abandonosNorm = clamp((abandonosProm / 5) * 100); // 5 abandonos = 100%
    const intentosFallidosProm = avg(curr.map(s => s.laberinto.intentosFallidos));
    const intentosNorm = clamp((intentosFallidosProm / 14) * 100); // 14 intentos = 100%
    const scoreLaberinto = abandonosNorm * 0.15 + intentosNorm * 0.10;

    // 🎈 Globos por Colores
    const precGlobos = avg(curr.map(s => s.globosColores.precisionColor));
    const erroresColorProm = avg(curr.map(s => s.globosColores.erroresColor));
    const erroresNorm = clamp((erroresColorProm / 28) * 100); // 28 errores = 100%
    const scoreGlobos = (100 - precGlobos) * 0.15 + erroresNorm * 0.10;

    // 📋 General (adherencia + cancelaciones)
    const adherProm = avg(curr.map(s => s.frecuenciaSemanal));
    const bajaAdherencia = clamp((1 - adherProm / 5) * 100);
    const cancelProm = avg(curr.map(s => s.cancelaciones));
    const cancelNorm = clamp((cancelProm / 3) * 100);
    const scoreGeneral = bajaAdherencia * 0.15 + cancelNorm * 0.10;

    // Score compuesto final
    const score = clamp(scoreBurbujas + scoreLaberinto + scoreGlobos + scoreGeneral);

    // Clasificación
    let nivel, color;
    if (score <= 30) {
        nivel = 'Bajo';
        color = 'green';
    } else if (score <= 60) {
        nivel = 'Medio';
        color = 'yellow';
    } else {
        nivel = 'Alto';
        color = 'red';
    }

    return { score, nivel, color };
};

// ── Estado Terapéutico ───────────────────────────────────────────────────────

/**
 * Calcula el estado terapéutico longitudinal.
 * Compara las últimas 4 semanas vs las 4 anteriores por juego.
 *
 * @param {Array} semanas - 8 semanas de datos
 * @returns {{ estado: string, icono: string, cambio: number, detalle: object }}
 */
export const calcularEstadoTerapeutico = (semanas) => {
    const { prev, curr } = splitSemanas(semanas);

    // Burbujas — precisión (mayor es mejor)
    const prevPrecBurb = avg(prev.map(s => s.burbujas.precision));
    const currPrecBurb = avg(curr.map(s => s.burbujas.precision));

    // Laberinto — niveles completados (mayor es mejor)
    const prevNivelesLab = avg(prev.map(s => s.laberinto.nivelesCompletados));
    const currNivelesLab = avg(curr.map(s => s.laberinto.nivelesCompletados));

    // Globos — precisión de color (mayor es mejor)
    const prevPrecGlob = avg(prev.map(s => s.globosColores.precisionColor));
    const currPrecGlob = avg(curr.map(s => s.globosColores.precisionColor));

    // Adherencia (mayor es mejor)
    const prevAdher = avg(prev.map(s => s.frecuenciaSemanal));
    const currAdher = avg(curr.map(s => s.frecuenciaSemanal));

    // Rabietas burbujas (menor es mejor)
    const prevRabietas = avg(prev.map(s => s.burbujas.rabietas));
    const currRabietas = avg(curr.map(s => s.burbujas.rabietas));

    // Abandonos laberinto (menor es mejor)
    const prevAbandonos = avg(prev.map(s => s.laberinto.abandonos));
    const currAbandonos = avg(curr.map(s => s.laberinto.abandonos));

    // Calcular cambios porcentuales
    const cambioPrecBurb = prevPrecBurb ? ((currPrecBurb - prevPrecBurb) / prevPrecBurb) * 100 : 0;
    const cambioNivelesLab = prevNivelesLab ? ((currNivelesLab - prevNivelesLab) / prevNivelesLab) * 100 : 0;
    const cambioPrecGlob = prevPrecGlob ? ((currPrecGlob - prevPrecGlob) / prevPrecGlob) * 100 : 0;
    const cambioAdher = prevAdher ? ((currAdher - prevAdher) / prevAdher) * 100 : 0;
    const cambioRabietas = prevRabietas ? ((currRabietas - prevRabietas) / prevRabietas) * 100 : 0;
    const cambioAbandonos = prevAbandonos ? ((currAbandonos - prevAbandonos) / prevAbandonos) * 100 : 0;

    // Score de mejora compuesto:
    // Positivo = mejora (precisiones ↑ es bueno, rabietas/abandonos ↓ es bueno)
    const mejora =
        (cambioPrecBurb * 0.20) +
        (cambioNivelesLab * 0.15) +
        (cambioPrecGlob * 0.20) +
        (cambioAdher * 0.15) +
        (-cambioRabietas * 0.15) +
        (-cambioAbandonos * 0.15);

    const detalle = {
        precisionBurbujas: { anterior: Math.round(prevPrecBurb), actual: Math.round(currPrecBurb), cambio: Math.round(cambioPrecBurb) },
        nivelesLaberinto: { anterior: +prevNivelesLab.toFixed(1), actual: +currNivelesLab.toFixed(1), cambio: Math.round(cambioNivelesLab) },
        precisionGlobos: { anterior: Math.round(prevPrecGlob), actual: Math.round(currPrecGlob), cambio: Math.round(cambioPrecGlob) },
        adherencia: { anterior: +prevAdher.toFixed(1), actual: +currAdher.toFixed(1), cambio: Math.round(cambioAdher) },
        rabietasBurbujas: { anterior: +prevRabietas.toFixed(1), actual: +currRabietas.toFixed(1), cambio: Math.round(cambioRabietas) },
        abandonosLaberinto: { anterior: +prevAbandonos.toFixed(1), actual: +currAbandonos.toFixed(1), cambio: Math.round(cambioAbandonos) },
    };

    let estado, icono;
    if (mejora > 10) {
        estado = 'En progreso';
        icono = '↑';
    } else if (mejora >= -5) {
        estado = 'Estable';
        icono = '→';
    } else {
        estado = 'Inestable';
        icono = '↓';
    }

    return { estado, icono, cambio: Math.round(mejora), detalle };
};

// ── Desglose (Transparencia) ─────────────────────────────────────────────────

/**
 * Genera el desglose detallado de por qué la IA clasificó un nivel de riesgo.
 * Ahora organizado por juego terapéutico.
 *
 * @param {Array} semanas - 8 semanas de datos
 * @returns {Array<{ factor: string, emoji: string, valor: number, maximo: number, peso: string, descripcion: string, tendencia: string, contribucion: number }>}
 */
export const obtenerDesglose = (semanas) => {
    const { prev, curr } = splitSemanas(semanas);

    const tendencia = (currVal, prevVal, invertir = false) => {
        const diff = ((currVal - prevVal) / (prevVal || 1)) * 100;
        const dirDiff = invertir ? -diff : diff;
        if (dirDiff > 5) return `↑ ${Math.round(Math.abs(diff))}%`;
        if (dirDiff < -5) return `↓ ${Math.round(Math.abs(diff))}%`;
        return `→ estable`;
    };

    // 🫧 Burbujas — Precisión
    const precBurb = avg(curr.map(s => s.burbujas.precision));
    const prevPrecBurb = avg(prev.map(s => s.burbujas.precision));
    const riesgoBurb = 100 - precBurb;

    // 🫧 Burbujas — Rabietas
    const rabietasProm = avg(curr.map(s => s.burbujas.rabietas));
    const prevRabietas = avg(prev.map(s => s.burbujas.rabietas));
    const rabietasNorm = clamp((rabietasProm / 6) * 100);

    // 🧩 Laberinto — Abandonos
    const abandonosProm = avg(curr.map(s => s.laberinto.abandonos));
    const prevAbandonos = avg(prev.map(s => s.laberinto.abandonos));
    const abandonosNorm = clamp((abandonosProm / 5) * 100);

    // 🧩 Laberinto — Intentos fallidos
    const intentosProm = avg(curr.map(s => s.laberinto.intentosFallidos));
    const prevIntentos = avg(prev.map(s => s.laberinto.intentosFallidos));
    const intentosNorm = clamp((intentosProm / 14) * 100);

    // 🎈 Globos — Precisión de color
    const precGlob = avg(curr.map(s => s.globosColores.precisionColor));
    const prevPrecGlob = avg(prev.map(s => s.globosColores.precisionColor));
    const riesgoGlob = 100 - precGlob;

    // 🎈 Globos — Errores de color
    const erroresProm = avg(curr.map(s => s.globosColores.erroresColor));
    const prevErrores = avg(prev.map(s => s.globosColores.erroresColor));
    const erroresNorm = clamp((erroresProm / 28) * 100);

    // 📋 Adherencia
    const adherProm = avg(curr.map(s => s.frecuenciaSemanal));
    const prevAdher = avg(prev.map(s => s.frecuenciaSemanal));
    const bajaAdherencia = clamp((1 - adherProm / 5) * 100);

    // 📋 Cancelaciones
    const cancelProm = avg(curr.map(s => s.cancelaciones));
    const prevCancel = avg(prev.map(s => s.cancelaciones));
    const cancelNorm = clamp((cancelProm / 3) * 100);

    return [
        {
            factor: 'Precisión Burbujas',
            emoji: '🫧',
            valor: Math.round(riesgoBurb),
            maximo: 100,
            peso: '15%',
            descripcion: `Precisión promedio: ${Math.round(precBurb)}% (a mayor precisión, menor riesgo)`,
            tendencia: tendencia(precBurb, prevPrecBurb),
            contribucion: clamp(riesgoBurb * 0.15),
        },
        {
            factor: 'Rabietas (Burbujas)',
            emoji: '🫧',
            valor: Math.round(rabietasNorm),
            maximo: 100,
            peso: '10%',
            descripcion: `${rabietasProm.toFixed(1)} rabietas/semana promedio`,
            tendencia: tendencia(rabietasProm, prevRabietas, true),
            contribucion: clamp(rabietasNorm * 0.10),
        },
        {
            factor: 'Abandonos (Laberinto)',
            emoji: '🧩',
            valor: Math.round(abandonosNorm),
            maximo: 100,
            peso: '15%',
            descripcion: `${abandonosProm.toFixed(1)} abandonos/semana promedio`,
            tendencia: tendencia(abandonosProm, prevAbandonos, true),
            contribucion: clamp(abandonosNorm * 0.15),
        },
        {
            factor: 'Intentos fallidos (Laberinto)',
            emoji: '🧩',
            valor: Math.round(intentosNorm),
            maximo: 100,
            peso: '10%',
            descripcion: `${intentosProm.toFixed(1)} choques/errores por semana`,
            tendencia: tendencia(intentosProm, prevIntentos, true),
            contribucion: clamp(intentosNorm * 0.10),
        },
        {
            factor: 'Precisión Color (Globos)',
            emoji: '🎈',
            valor: Math.round(riesgoGlob),
            maximo: 100,
            peso: '15%',
            descripcion: `Precisión de color: ${Math.round(precGlob)}% (a mayor precisión, menor riesgo)`,
            tendencia: tendencia(precGlob, prevPrecGlob),
            contribucion: clamp(riesgoGlob * 0.15),
        },
        {
            factor: 'Errores de Color (Globos)',
            emoji: '🎈',
            valor: Math.round(erroresNorm),
            maximo: 100,
            peso: '10%',
            descripcion: `${erroresProm.toFixed(1)} errores de color promedio/semana`,
            tendencia: tendencia(erroresProm, prevErrores, true),
            contribucion: clamp(erroresNorm * 0.10),
        },
        {
            factor: 'Baja Adherencia',
            emoji: '📋',
            valor: Math.round(bajaAdherencia),
            maximo: 100,
            peso: '15%',
            descripcion: `${adherProm.toFixed(1)} sesiones/semana de 5 posibles`,
            tendencia: tendencia(adherProm, prevAdher),
            contribucion: clamp(bajaAdherencia * 0.15),
        },
        {
            factor: 'Cancelaciones',
            emoji: '📋',
            valor: +cancelProm.toFixed(1),
            maximo: 3,
            peso: '10%',
            descripcion: `${cancelProm.toFixed(1)} cancelaciones promedio/semana`,
            tendencia: tendencia(cancelProm, prevCancel, true),
            contribucion: clamp(cancelNorm * 0.10),
        },
    ];
};

// ── Datos de tendencia semanal ──────────────────────────────────────────────

/**
 * Prepara datos para el mini chart de tendencia semanal.
 * Ahora muestra precisión por juego en cada semana.
 *
 * @param {Array} semanas
 * @returns {Array<{ semana: number, burbujas: number, laberinto: number, globos: number, adherencia: number }>}
 */
export const obtenerTendenciaSemanal = (semanas) => {
    return semanas.map(s => ({
        semana: s.semana,
        burbujas: s.burbujas.precision,
        laberinto: clamp(s.laberinto.nivelesCompletados * 20), // escala 0-6 → 0-100
        globos: s.globosColores.precisionColor,
        adherencia: s.frecuenciaSemanal,
    }));
};

// ── Procesar todos los pacientes ────────────────────────────────────────────

/**
 * Procesa la lista de pacientes y genera todos los scores y estados.
 * @param {Array} pacientes - Array de pacientesMetrics
 * @returns {Array} pacientes enriquecidos con riesgo, estado y desglose
 */
export const procesarPacientes = (pacientes) => {
    return pacientes.map(p => {
        const riesgo = calcularRiesgoIA(p.semanas);
        const estadoTerapeutico = calcularEstadoTerapeutico(p.semanas);
        const desglose = obtenerDesglose(p.semanas);
        const tendencia = obtenerTendenciaSemanal(p.semanas);

        return {
            ...p,
            riesgo,
            estadoTerapeutico,
            desglose,
            tendencia,
        };
    });
};
