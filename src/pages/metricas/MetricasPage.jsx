import { useState, useMemo } from 'react';
import { X, AlertTriangle, TrendingDown, Activity, ChevronUp, ChevronDown, Search } from 'lucide-react';
import { pacientesMetrics } from '../../data/mockMetricsData';
import { procesarPacientes } from '../../utils/metricsEngine';
import './Metricas.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (nombre = '') => {
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const gaugeColorMap = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' };
const badgeBgMap = { green: 'riesgo-badge--green', yellow: 'riesgo-badge--yellow', red: 'riesgo-badge--red' };
const dotMap = { green: 'riesgo-badge__dot--green', yellow: 'riesgo-badge__dot--yellow', red: 'riesgo-badge__dot--red' };

// Colores para factores de desglose (8 factores ahora)
const factorColors = ['#ef4444', '#f97316', '#8b5cf6', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#6b7280'];

// ── Componente principal ─────────────────────────────────────────────────────
const MetricasPage = () => {
    const [searchText, setSearchText] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'riesgoScore', direction: 'desc' });
    const [selectedPaciente, setSelectedPaciente] = useState(null);

    // Procesar datos con el motor de métricas
    const pacientesProcesados = useMemo(() => procesarPacientes(pacientesMetrics), []);

    // Filtrado y ordenamiento
    const filteredData = useMemo(() => {
        let items = [...pacientesProcesados];

        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            items = items.filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                p.tutor.toLowerCase().includes(q)
            );
        }

        items.sort((a, b) => {
            let aVal, bVal;
            if (sortConfig.key === 'riesgoScore') {
                aVal = a.riesgo.score;
                bVal = b.riesgo.score;
            } else if (sortConfig.key === 'nombre') {
                aVal = a.nombre;
                bVal = b.nombre;
            } else if (sortConfig.key === 'estadoTerapeutico') {
                aVal = a.estadoTerapeutico.cambio;
                bVal = b.estadoTerapeutico.cambio;
            } else if (sortConfig.key === 'adherencia') {
                const lastA = a.semanas[a.semanas.length - 1];
                const lastB = b.semanas[b.semanas.length - 1];
                aVal = lastA.frecuenciaSemanal;
                bVal = lastB.frecuenciaSemanal;
            } else {
                return 0;
            }
            if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return items;
    }, [pacientesProcesados, searchText, sortConfig]);

    // Cards de resumen
    const altoRiesgo = pacientesProcesados.filter(p => p.riesgo.nivel === 'Alto').length;
    const inestables = pacientesProcesados.filter(p => p.estadoTerapeutico.estado === 'Inestable').length;
    const scorePromedio = Math.round(
        pacientesProcesados.reduce((s, p) => s + p.riesgo.score, 0) / pacientesProcesados.length
    );

    // Sort
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <span style={{ opacity: 0.3, fontSize: '0.8em', marginLeft: '4px' }}>⇅</span>;
        return sortConfig.direction === 'asc'
            ? <ChevronUp size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            : <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />;
    };

    // Adherencia helpers
    const getAdherencia = (p) => {
        const last = p.semanas[p.semanas.length - 1];
        const pct = (last.frecuenciaSemanal / 5) * 100;
        return { sesiones: last.frecuenciaSemanal, pct };
    };

    const getBarClass = (pct) => {
        if (pct >= 80) return 'adherencia-bar__fill--high';
        if (pct >= 50) return 'adherencia-bar__fill--mid';
        return 'adherencia-bar__fill--low';
    };

    const getFactorBarColor = (valor, maximo) => {
        const pct = (valor / maximo) * 100;
        if (pct <= 30) return '#22c55e';
        if (pct <= 60) return '#f59e0b';
        return '#ef4444';
    };

    const getTendenciaClass = (tendencia) => {
        if (tendencia.startsWith('↑')) return 'desglose-factor__tendencia--up';
        if (tendencia.startsWith('↓')) return 'desglose-factor__tendencia--down';
        return 'desglose-factor__tendencia--stable';
    };

    // Indica si la tendencia ↑ es buena o mala según el factor
    const getTendenciaColorClass = (factor, tendencia) => {
        // Para precisión ↑ es bueno (verde), para rabietas/abandonos/errores ↑ es malo (rojo)
        const invertidos = ['Rabietas (Burbujas)', 'Abandonos (Laberinto)', 'Intentos fallidos (Laberinto)', 'Errores de Color (Globos)', 'Cancelaciones'];
        const esInvertido = invertidos.includes(factor);

        if (tendencia.startsWith('↑')) return esInvertido ? 'desglose-factor__tendencia--up' : 'desglose-factor__tendencia--down';
        if (tendencia.startsWith('↓')) return esInvertido ? 'desglose-factor__tendencia--down' : 'desglose-factor__tendencia--up';
        return 'desglose-factor__tendencia--stable';
    };

    // Helper para obtener resumen de rendimiento por juego en la tabla
    const getJuegoDestacado = (p) => {
        const last = p.semanas[p.semanas.length - 1];
        const juegos = [
            { nombre: '🫧', precision: last.burbujas.precision },
            { nombre: '🧩', precision: last.laberinto.nivelesCompletados * 20 },
            { nombre: '🎈', precision: last.globosColores.precisionColor },
        ];
        const mejor = juegos.reduce((a, b) => a.precision > b.precision ? a : b);
        const peor = juegos.reduce((a, b) => a.precision < b.precision ? a : b);
        return { mejor, peor };
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="tico-container">

            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Métricas IA</h1>
                    <p className="tico-subtitle">Evaluación conductual — Burbujas, Laberinto y Globos por Colores</p>
                </div>
            </header>

            {/* Cards de resumen */}
            <div className="metricas-cards">
                <div className="metricas-card metricas-card--rojo">
                    <div className="metricas-card__icon metricas-card__icon--rojo">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{altoRiesgo}</span>
                        <span className="metricas-card__label">Pacientes alto riesgo</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--amarillo">
                    <div className="metricas-card__icon metricas-card__icon--amarillo">
                        <TrendingDown size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{inestables}</span>
                        <span className="metricas-card__label">Pacientes inestables</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--azul">
                    <div className="metricas-card__icon metricas-card__icon--azul">
                        <Activity size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{scorePromedio}</span>
                        <span className="metricas-card__label">Score promedio general</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="tico-toolbar" style={{ marginBottom: '0.75rem' }}>
                <div className="tico-toolbar-left">
                    <div style={{ position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            className="tico-search"
                            style={{ paddingLeft: '34px' }}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="metricas-table-container">
                <table className="metricas-table">
                    <thead>
                        <tr>
                            <th className="sortable" onClick={() => handleSort('nombre')}>
                                Paciente {getSortIcon('nombre')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('riesgoScore')}>
                                Riesgo IA {getSortIcon('riesgoScore')}
                            </th>
                            <th className="sortable" onClick={() => handleSort('estadoTerapeutico')}>
                                Estado Terapéutico {getSortIcon('estadoTerapeutico')}
                            </th>
                            <th>Rendimiento</th>
                            <th>Última Sesión</th>
                            <th className="sortable" onClick={() => handleSort('adherencia')}>
                                Adherencia {getSortIcon('adherencia')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((p) => {
                            const adh = getAdherencia(p);
                            const juego = getJuegoDestacado(p);
                            return (
                                <tr key={p.id} onClick={() => setSelectedPaciente(p)}>
                                    <td>
                                        <div className="paciente-info">
                                            <span className="paciente-info__nombre">{p.nombre}</span>
                                            <span className="paciente-info__edad">{p.edad} · {p.tutor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`riesgo-badge ${badgeBgMap[p.riesgo.color]}`}>
                                            <span className={`riesgo-badge__dot ${dotMap[p.riesgo.color]}`} />
                                            {p.riesgo.nivel} ({p.riesgo.score})
                                        </span>
                                    </td>
                                    <td>
                                        <div className="estado-terapeutico">
                                            <span className={`estado-terapeutico__icono estado-terapeutico__icono--${p.estadoTerapeutico.icono === '↑' ? 'up' : p.estadoTerapeutico.icono === '→' ? 'stable' : 'down'}`}>
                                                {p.estadoTerapeutico.icono}
                                            </span>
                                            <span>{p.estadoTerapeutico.estado}</span>
                                            <span className="estado-terapeutico__cambio">
                                                ({p.estadoTerapeutico.cambio > 0 ? '+' : ''}{p.estadoTerapeutico.cambio}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="rendimiento-juegos">
                                            <span className="rendimiento-juegos__item rendimiento-juegos__item--mejor" title="Mejor juego">
                                                {juego.mejor.nombre} {Math.round(juego.mejor.precision)}%
                                            </span>
                                            <span className="rendimiento-juegos__item rendimiento-juegos__item--peor" title="Juego a mejorar">
                                                {juego.peor.nombre} {Math.round(juego.peor.precision)}%
                                            </span>
                                        </div>
                                    </td>
                                    <td>{p.ultimaSesion}</td>
                                    <td>
                                        <div className="adherencia-visual">
                                            <div className="adherencia-bar">
                                                <div
                                                    className={`adherencia-bar__fill ${getBarClass(adh.pct)}`}
                                                    style={{ width: `${adh.pct}%` }}
                                                />
                                            </div>
                                            <span className="adherencia-label">{adh.sesiones}/5</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: '2rem' }}>
                                    No se encontraron pacientes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ══ Modal de Desglose (Transparencia IA) ══ */}
            {selectedPaciente && (
                <div className="tico-modal-overlay" onClick={() => setSelectedPaciente(null)}>
                    <div className="desglose-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setSelectedPaciente(null)}>
                            <X size={18} />
                        </button>

                        {/* Header del modal */}
                        <div className="desglose-header">
                            <div className="desglose-avatar">
                                {getInitials(selectedPaciente.nombre)}
                            </div>
                            <div className="desglose-patient-info">
                                <h2>{selectedPaciente.nombre}</h2>
                                <span>{selectedPaciente.edad} · Tutor: {selectedPaciente.tutor}</span>
                            </div>
                        </div>

                        {/* Gauge de riesgo */}
                        <div className="desglose-gauge-section">
                            <div
                                className="gauge-circle"
                                style={{
                                    '--gauge-pct': selectedPaciente.riesgo.score,
                                    '--gauge-color': gaugeColorMap[selectedPaciente.riesgo.color],
                                }}
                            >
                                <div className="gauge-circle__bg" />
                                <div className="gauge-circle__inner">
                                    <div className="gauge-circle__score" style={{ color: gaugeColorMap[selectedPaciente.riesgo.color] }}>
                                        {selectedPaciente.riesgo.score}
                                    </div>
                                    <div className="gauge-circle__label">de 100</div>
                                </div>
                            </div>
                            <div className="gauge-info">
                                <div
                                    className={`gauge-info__level ${badgeBgMap[selectedPaciente.riesgo.color]}`}
                                    style={{ borderRadius: '9999px' }}
                                >
                                    <span className={`riesgo-badge__dot ${dotMap[selectedPaciente.riesgo.color]}`} />
                                    Riesgo {selectedPaciente.riesgo.nivel}
                                </div>
                                <p className="gauge-info__desc">
                                    Score compuesto basado en rendimiento de 🫧 Burbujas, 🧩 Laberinto,
                                    🎈 Globos por Colores y adherencia de las últimas 4 semanas.
                                </p>
                            </div>
                        </div>

                        {/* Desglose por factores */}
                        <div className="desglose-section-title">¿Por qué esta clasificación?</div>
                        <div className="desglose-factors">
                            {selectedPaciente.desglose.map((factor, i) => {
                                const pct = (factor.valor / factor.maximo) * 100;
                                const barColor = getFactorBarColor(factor.valor, factor.maximo);
                                return (
                                    <div
                                        key={factor.factor}
                                        className="desglose-factor"
                                        style={{ borderLeftColor: factorColors[i] }}
                                    >
                                        <div className="desglose-factor__info">
                                            <div className="desglose-factor__header">
                                                <span className="desglose-factor__name">
                                                    {factor.emoji} {factor.factor}
                                                </span>
                                                <span className="desglose-factor__weight">Peso: {factor.peso}</span>
                                            </div>
                                            <div className="desglose-factor__bar">
                                                <div
                                                    className="desglose-factor__bar-fill"
                                                    style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
                                                />
                                            </div>
                                            <div className="desglose-factor__detail">
                                                <span>{factor.descripcion}</span>
                                                <span className={`desglose-factor__tendencia ${getTendenciaColorClass(factor.factor, factor.tendencia)}`}>
                                                    {factor.tendencia}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mini chart de tendencia por juego */}
                        <div className="desglose-section-title">Tendencia semanal por juego (8 semanas)</div>
                        <div className="tendencia-chart-wrapper">
                            <div className="tendencia-chart">
                                {selectedPaciente.tendencia.map((s, i) => (
                                    <div key={s.semana} className="tendencia-bar-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="tendencia-bars" style={{ height: '100%' }}>
                                            <div
                                                className="tendencia-bar tendencia-bar--burbujas"
                                                style={{ height: `${s.burbujas}%` }}
                                                title={`Burbujas: ${s.burbujas}%`}
                                            />
                                            <div
                                                className="tendencia-bar tendencia-bar--laberinto"
                                                style={{ height: `${s.laberinto}%` }}
                                                title={`Laberinto: ${s.laberinto}%`}
                                            />
                                            <div
                                                className="tendencia-bar tendencia-bar--globos"
                                                style={{ height: `${s.globos}%` }}
                                                title={`Globos: ${s.globos}%`}
                                            />
                                        </div>
                                        <span className="tendencia-bar-label">S{s.semana}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="tendencia-legend">
                                <div className="tendencia-legend__item">
                                    <span className="tendencia-legend__dot" style={{ backgroundColor: '#3b82f6' }} />
                                    🫧 Burbujas
                                </div>
                                <div className="tendencia-legend__item">
                                    <span className="tendencia-legend__dot" style={{ backgroundColor: '#8b5cf6' }} />
                                    🧩 Laberinto
                                </div>
                                <div className="tendencia-legend__item">
                                    <span className="tendencia-legend__dot" style={{ backgroundColor: '#f97316' }} />
                                    🎈 Globos
                                </div>
                            </div>
                        </div>

                        {/* Estado terapéutico detallado */}
                        <div className="desglose-section-title">
                            Estado Terapéutico: {selectedPaciente.estadoTerapeutico.icono} {selectedPaciente.estadoTerapeutico.estado}
                        </div>
                        <div className="desglose-estado-section">
                            <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
                                Comparación de las últimas 4 semanas vs las 4 anteriores por juego
                            </p>
                            <div className="desglose-estado-grid">
                                {Object.entries(selectedPaciente.estadoTerapeutico.detalle).map(([key, val]) => {
                                    const labels = {
                                        precisionBurbujas: '🫧 Precisión Burbujas',
                                        nivelesLaberinto: '🧩 Niveles Laberinto',
                                        precisionGlobos: '🎈 Precisión Globos',
                                        adherencia: '📋 Adherencia (ses/sem)',
                                        rabietasBurbujas: '🫧 Rabietas',
                                        abandonosLaberinto: '🧩 Abandonos',
                                    };
                                    const unidades = {
                                        precisionBurbujas: '%',
                                        nivelesLaberinto: '',
                                        precisionGlobos: '%',
                                        adherencia: '',
                                        rabietasBurbujas: '',
                                        abandonosLaberinto: '',
                                    };
                                    // Para precisiones y adherencia: subir es bueno
                                    // Para rabietas y abandonos: bajar es bueno
                                    const invertidos = ['rabietasBurbujas', 'abandonosLaberinto'];
                                    let changeClass;
                                    if (invertidos.includes(key)) {
                                        changeClass = val.cambio < 0 ? 'good' : val.cambio > 0 ? 'bad' : 'flat';
                                    } else {
                                        changeClass = val.cambio > 0 ? 'good' : val.cambio < 0 ? 'bad' : 'flat';
                                    }
                                    return (
                                        <div key={key} className="desglose-estado-item">
                                            <span className="desglose-estado-item__label">{labels[key]}</span>
                                            <div className="desglose-estado-item__values">
                                                <span className="desglose-estado-item__prev">{val.anterior}{unidades[key]}</span>
                                                <span className="desglose-estado-item__arrow">→</span>
                                                <span className="desglose-estado-item__curr">{val.actual}{unidades[key]}</span>
                                                <span className={`desglose-estado-item__change desglose-estado-item__change--${changeClass}`}>
                                                    {val.cambio > 0 ? '+' : ''}{val.cambio}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricasPage;
