/**
 * Utility functions for calculating clinical metrics and insights
 * from raw patient session data.
 */

/**
 * Calculates the standard deviation of a numeric array.
 * Higher value = Lower consistency.
 */
export const calculateStdDev = (data) => {
    if (!data || data.length < 2) return 0;
    const n = data.length;
    const mean = data.reduce((a, b) => a + b) / n;
    const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return Math.sqrt(variance);
};

/**
 * Calculates the trend percentage between two values.
 * ((Current - Previous) / Previous) * 100
 */
export const calculateTrend = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Classifies patient state based on clinical rules.
 */
export const classifyPatientState = (avgFrust, avgReaccion, stdDevReaccion) => {
    // Thresholds (can be adjusted)
    // High frustration: > 3
    // High reaction time: > 2000ms
    // High variability (consistency): stdDev > 500ms
    
    if (avgFrust > 3 && avgReaccion > 1800) {
        return { label: 'Riesgo', color: '#ef4444', level: 3 };
    }
    
    if (stdDevReaccion > 500 || avgFrust > 2.5) {
        return { label: 'Atención', color: '#f59e0b', level: 2 };
    }
    
    return { label: 'Estable', color: '#22c55e', level: 1 };
};

/**
 * Detects if the patient is showing signs of fatigue.
 * Fatigue is defined as reaction time increasing over the last 3-5 attempts
 * accompanied by maintained or increasing frustration.
 */
export const detectFatigue = (intentos) => {
    if (intentos.length < 4) return false;
    
    const last3 = intentos.slice(-3);
    const prev3 = intentos.slice(-6, -3);
    
    if (prev3.length === 0) return false;
    
    const avgLast3 = last3.reduce((s, i) => s + (i.tiempo_reaccion_ms || 0), 0) / 3;
    const avgPrev3 = prev3.reduce((s, i) => s + (i.tiempo_reaccion_ms || 0), 0) / prev3.length;
    
    // If reaction time increased by more than 20%
    return calculateTrend(avgLast3, avgPrev3) > 20;
};

/**
 * Generates clinical insights based on patient metrics.
 */
export const generateInsights = (summary) => {
    const insights = [];
    
    if (summary.trendReaccion < -10) {
        insights.push({ type: 'success', text: 'Mejora significativa en la velocidad de respuesta.' });
    } else if (summary.trendReaccion > 10) {
        insights.push({ type: 'warning', text: 'Aumento en el tiempo de reacción detectado.' });
    }
    
    if (summary.avgFrustracion > 3) {
        insights.push({ type: 'danger', text: 'Nivel de frustración elevado. Revisar dificultad.' });
    }
    
    if (summary.fatigue) {
        insights.push({ type: 'warning', text: 'Se detectan signos de fatiga en la sesión.' });
    }
    
    if (summary.consistencia < 200 && summary.totalIntentos > 5) {
        insights.push({ type: 'success', text: 'Alta consistencia en el desempeño.' });
    } else if (summary.consistencia > 600) {
        insights.push({ type: 'warning', text: 'Alta variabilidad en las respuestas.' });
    }

    return insights;
};
