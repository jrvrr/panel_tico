import React, { useState, useEffect } from 'react';
import { applyDateMask, formatToDisplay, formatFromDisplay, normalizeDateInput } from '../utils/dateHelper';

/**
 * TicoDateInput - Un componente que fuerza el formato DD/MM/YYYY visualmente
 * pero mantiene YYYY-MM-DD internamente para compatibilidad.
 */
const TicoDateInput = ({ value, onChange, className, placeholder = "DD/MM/YYYY", ...props }) => {
    const [displayValue, setDisplayValue] = useState('');

    // Sincronizar displayValue cuando el value (YYYY-MM-DD) cambia externamente
    useEffect(() => {
        if (value) {
            setDisplayValue(formatToDisplay(value));
        } else {
            setDisplayValue('');
        }
    }, [value]);

    const handleChange = (e) => {
        const rawValue = e.target.value;
        const masked = applyDateMask(rawValue);
        setDisplayValue(masked);

        // Si tenemos los 10 caracteres (DD/MM/YYYY), enviamos el cambio al padre en YYYY-MM-DD
        if (masked.length === 10) {
            const isoDate = formatFromDisplay(masked);
            // Aplicar también la normalización de 2 dígitos por si acaso
            const normalized = normalizeDateInput(isoDate);
            onChange(normalized);
        } else if (masked === '') {
            onChange('');
        }
    };

    // Al perder el foco, si está incompleto, podríamos limpiarlo o dejarlo
    const handleBlur = () => {
        if (displayValue.length > 0 && displayValue.length < 10) {
            // Opcional: limpiar si está incompleto
            // setDisplayValue('');
            // onChange('');
        }
    };

    return (
        <input
            {...props}
            type="text"
            className={className}
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={10}
        />
    );
};

export default TicoDateInput;
