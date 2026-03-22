/**
 * Normaliza el valor de un input de tipo date para:
 * 1. Truncar el año a máximo 4 dígitos.
 * 2. Interpretar años de 2 dígitos (ej: 0090 como 1990) si es menor a 1000.
 */
export const normalizeDateInput = (value) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;

    let [year, month, day] = parts;

    // Truncar año a 4 dígitos para evitar cosas como 22222
    if (year.length > 4) {
        year = year.substring(0, 4);
    }

    // Interpretar años cortos (ej: typed 90 -> browser sends 0090)
    // Solo si el año es menor a 1000 y mayor a 0 (ej: 0090)
    if (year.length === 4 && year.startsWith('00') && year !== '0000') {
        const y2 = parseInt(year, 10);
        if (y2 < 100) {
            const currentYear = new Date().getFullYear();
            // Umbral: si es mayor que el año actual + 10, asumimos siglo anterior (1900)
            const threshold = (currentYear % 100) + 10;
            const century = y2 > threshold ? 1900 : 2000;
            year = (century + y2).toString();
        }
    }

    return `${year}-${month}-${day}`;
};

/**
 * Convierte YYYY-MM-DD (estado) a DD/MM/YYYY (visual)
 */
export const formatToDisplay = (value) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Convierte DD/MM/YYYY (visual) a YYYY-MM-DD (estado)
 */
export const formatFromDisplay = (value) => {
    if (!value) return '';
    // Eliminar caracteres no numéricos
    const clean = value.replace(/\D/g, '');
    if (clean.length < 8) return value;

    // Suponiendo DDMMYYYY
    const d = clean.substring(0, 2);
    const m = clean.substring(2, 4);
    const y = clean.substring(4, 8);

    return `${y}-${m}-${d}`;
};

/**
 * Aplica máscara mientras se escribe (DD/MM/YYYY)
 */
export const applyDateMask = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 8);
    if (v.length <= 2) return v;
    if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;
    return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
};

