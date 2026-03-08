import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import './CalendarioCitas.css';

const CalendarioCitas = ({ citas, onVerDetalle, onNuevaCitaFecha }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Lunes = 0... Domingo = 6
    };

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToday = () => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    // Map citas by date string "YYYY-MM-DD"
    const citasPorDia = {};
    citas.forEach(c => {
        if (!c.fecha_cita) return;
        const dateStr = c.fecha_cita;
        if (!citasPorDia[dateStr]) citasPorDia[dateStr] = [];
        citasPorDia[dateStr].push(c);
    });

    const renderCells = () => {
        const cells = [];

        // Huecos vacíos antes del día 1
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
        }

        // Días del mes
        for (let d = 1; d <= daysInMonth; d++) {
            const year = currentDate.getFullYear();
            const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
            const dayStr = String(d).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;

            let citasDelDia = citasPorDia[dateStr] || [];
            // Sort por hora
            citasDelDia.sort((a, b) => a.hora_cita.localeCompare(b.hora_cita));

            const citasActivas = citasDelDia.filter(c => c.estado_cita !== 'Cancelada' && c.estado_cita !== 'Completada').length;

            // Asumimos 8 turnos máximo por día (ej. 8am a 4pm o similar)
            const maxTurnosDia = 8;
            const turnosDisponibles = maxTurnosDia - citasActivas;

            const isToday = today.getFullYear() === year && today.getMonth() === currentDate.getMonth() && today.getDate() === d;

            // Ver si superó el día de hoy
            const dateOfCell = new Date(year, currentDate.getMonth(), d);
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isPast = dateOfCell < todayStart;

            cells.push(
                <div key={d} className={`calendar-cell ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}`}>
                    <div className="calendar-cell-header">
                        <span className="calendar-day">{d}</span>
                        {!isPast && (
                            <button
                                className="calendar-add-btn"
                                title="Agendar cita aquí"
                                onClick={(e) => { e.stopPropagation(); onNuevaCitaFecha(dateStr); }}
                            >
                                <Plus size={14} />
                            </button>
                        )}
                    </div>

                    <div className="calendar-cell-content">
                        {citasDelDia.map(c => (
                            <div key={c.id}
                                className={`calendar-cita-badge estado-${c.estado_cita.toLowerCase()}`}
                                onClick={(e) => { e.stopPropagation(); onVerDetalle(c); }}
                                title={`${c.hora_cita} - ${c.paciente_nombre} (${c.estado_cita})`}>
                                <span className="cita-time">{c.hora_cita}</span>
                                <span className="cita-name">{c.paciente_nombre}</span>
                            </div>
                        ))}
                    </div>

                    {!isPast && (
                        <div className="calendar-cell-footer">
                            {turnosDisponibles > 0 ? (
                                <span className="availability-text available">{turnosDisponibles} disp.</span>
                            ) : (
                                <span className="availability-text full">Sin turnos</span>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return cells;
    };

    return (
        <div className="tico-calendar-container">
            <div className="tico-calendar-header">
                <h2 className="calendar-title">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="tico-calendar-nav">
                    <button onClick={prevMonth} className="calendar-nav-btn"><ChevronLeft size={18} /></button>
                    <button onClick={goToday} className="calendar-nav-btn-text">Hoy</button>
                    <button onClick={nextMonth} className="calendar-nav-btn"><ChevronRight size={18} /></button>
                </div>
            </div>

            <div className="tico-calendar-legend">
                <div className="legend-item"><span className="legend-color estado-confirmada"></span> Confirmada</div>
                <div className="legend-item"><span className="legend-color estado-programada"></span> Por confirmar</div>
                <div className="legend-item"><span className="legend-color estado-completada"></span> Completada</div>
                <div className="legend-item"><span className="legend-color estado-cancelada"></span> Cancelada</div>
            </div>

            <div className="tico-calendar-grid-wrapper">
                <div className="tico-calendar-weekdays">
                    <div className="weekday">Lun</div>
                    <div className="weekday">Mar</div>
                    <div className="weekday">Mié</div>
                    <div className="weekday">Jue</div>
                    <div className="weekday">Vie</div>
                    <div className="weekday">Sáb</div>
                    <div className="weekday">Dom</div>
                </div>
                <div className="tico-calendar-grid">
                    {renderCells()}
                </div>
            </div>
        </div>
    );
};

export default CalendarioCitas;
