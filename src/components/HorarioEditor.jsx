import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import './HorarioEditor.css';

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

const HORARIO_VACIO = () =>
    DIAS.reduce((acc, dia) => {
        acc[dia] = { activo: false, turnos: [{ inicio: '09:00', fin: '18:00' }] };
        return acc;
    }, {});

/**
 * Parsea el valor de horario_atencion (string JSON o string libre) y retorna
 * un objeto estructurado con los 5 días de la semana.
 */
export const parseHorario = (raw) => {
    const base = HORARIO_VACIO();
    if (!raw) return base;

    try {
        let parsed = raw;
        
        // Si es un string, intentamos parsearlo
        if (typeof raw === 'string') {
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                // Si no es JSON válido (texto libre), devolvemos el base
                return base;
            }
        }

        // Si no es un objeto válido tras el parseo, devolvemos el base
        if (!parsed || typeof parsed !== 'object') return base;

        // Integrar solo las claves que reconocemos
        DIAS.forEach((dia) => {
            if (parsed[dia]) {
                base[dia] = {
                    activo: !!parsed[dia].activo,
                    turnos: Array.isArray(parsed[dia].turnos) && parsed[dia].turnos.length > 0
                        ? parsed[dia].turnos
                        : [{ inicio: '09:00', fin: '18:00' }],
                };
            }
        });
        return base;
    } catch (e) {
        console.error("Error parsing horario:", e);
        return base;
    }
};

/**
 * Serializa el objeto de horario a JSON string para guardar en la BD.
 */
export const serializeHorario = (horario) => JSON.stringify(horario);

// ─────────────────────────────────────────────────────────────────────────────

const HorarioEditor = ({ value, onChange }) => {
    const labels = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes' };

    const horario = value || HORARIO_VACIO();

    const toggleDia = (dia) => {
        onChange({
            ...horario,
            [dia]: { ...horario[dia], activo: !horario[dia].activo },
        });
    };

    const updateTurno = (dia, idx, field, val) => {
        const nuevosTurnos = horario[dia].turnos.map((t, i) =>
            i === idx ? { ...t, [field]: val } : t
        );
        onChange({ ...horario, [dia]: { ...horario[dia], turnos: nuevosTurnos } });
    };

    const addTurno = (dia) => {
        if (horario[dia].turnos.length >= 3) return;
        const last = horario[dia].turnos[horario[dia].turnos.length - 1];
        const nuevosTurnos = [...horario[dia].turnos, { inicio: last?.fin || '14:00', fin: '18:00' }];
        onChange({ ...horario, [dia]: { ...horario[dia], turnos: nuevosTurnos } });
    };

    const removeTurno = (dia, idx) => {
        if (horario[dia].turnos.length <= 1) return;
        const nuevosTurnos = horario[dia].turnos.filter((_, i) => i !== idx);
        onChange({ ...horario, [dia]: { ...horario[dia], turnos: nuevosTurnos } });
    };

    return (
        <div className="horario-editor">
            {DIAS.map((dia) => {
                const data = horario[dia];
                return (
                    <div
                        key={dia}
                        className={`horario-dia-row ${data.activo ? 'horario-dia-activo' : 'horario-dia-cerrado'}`}
                    >
                        {/* Toggle + Nombre del día */}
                        <div className="horario-dia-header">
                            <label className="tico-switch horario-switch">
                                <input
                                    type="checkbox"
                                    checked={data.activo}
                                    onChange={() => toggleDia(dia)}
                                />
                                <span className="tico-slider" />
                            </label>
                            <span className={`horario-dia-nombre ${data.activo ? '' : 'horario-dia-nombre-off'}`}>
                                {labels[dia]}
                            </span>
                            {!data.activo && (
                                <span className="horario-cerrado-badge">
                                    Cerrado
                                </span>
                            )}
                        </div>

                        {/* Turnos del día (solo si activo) */}
                        {data.activo && (
                            <div className="horario-turnos">
                                {data.turnos.map((turno, idx) => (
                                    <div key={idx} className="horario-turno-fila">
                                        <div className="horario-time-group">
                                            <label className="horario-time-label">
                                                Desde
                                            </label>
                                            <input
                                                type="time"
                                                className="horario-time-input"
                                                value={turno.inicio}
                                                onChange={(e) => updateTurno(dia, idx, 'inicio', e.target.value)}
                                            />
                                        </div>
                                        <span className="horario-separator">—</span>
                                        <div className="horario-time-group">
                                            <label className="horario-time-label">
                                                Hasta
                                            </label>
                                            <input
                                                type="time"
                                                className="horario-time-input"
                                                value={turno.fin}
                                                onChange={(e) => updateTurno(dia, idx, 'fin', e.target.value)}
                                            />
                                        </div>
                                        {data.turnos.length > 1 && (
                                            <button
                                                type="button"
                                                className="horario-btn-remove"
                                                onClick={() => removeTurno(dia, idx)}
                                                title="Eliminar turno"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {data.turnos.length < 3 && (
                                    <button
                                        type="button"
                                        className="horario-btn-add"
                                        onClick={() => addTurno(dia)}
                                    >
                                        <Plus size={13} />
                                        Agregar turno
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default HorarioEditor;
