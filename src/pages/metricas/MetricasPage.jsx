import { useState, useEffect, useMemo } from 'react';
import { X, Activity, Clock, Zap, AlertTriangle, Search, User, ChevronRight, BarChart3, TrendingUp, TrendingDown, Minus, Target, Info, BookOpen } from 'lucide-react';
import { getMetricasIA, getMetricasByPaciente } from '../../services/api';
import { calculateStdDev, calculateTrend, classifyPatientState, detectFatigue, generateInsights } from '../../utils/metricsCalculations';
import './Metricas.css';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (nombre = '') => {
    const parts = nombre.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatMs = (ms) => {
    if (ms == null || isNaN(ms)) return '—';
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
};

// ── Mini Sparkline Component ──────────────────────────────────────────
const Sparkline = ({ data = [], color = '#3b82f6' }) => {
    if (data.length < 2) return <div className="sparkline-empty">Sin datos</div>;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const points = data.map((v, i) => ({
        x: (i / (data.length - 1)) * width,
        y: height - ((v - min) / range) * height
    }));
    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    return (
        <svg width={width} height={height} className="sparkline-svg">
            <path d={pathData} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const getFrustColor = (nivel) => {
    if (nivel <= 1) return '#22c55e';
    if (nivel <= 2) return '#84cc16';
    if (nivel <= 3) return '#f59e0b';
    return '#ef4444';
};

const getFrustLabel = (nivel) => {
    if (nivel <= 1) return 'Bajo';
    if (nivel <= 2) return 'Moderado';
    if (nivel <= 3) return 'Alto';
    return 'Muy alto';
};

// ── Componente principal ─────────────────────────────────────────────────────
const MetricasPage = () => {
    const [metricas, setMetricas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('risk'); // 'risk', 'name', 'date', 'attempts'
    const [selectedPacienteId, setSelectedPacienteId] = useState(null);
    const [detailMetricas, setDetailMetricas] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showGuiaModal, setShowGuiaModal] = useState(false);

    // Cargar todas las métricas
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getMetricasIA();
                setMetricas(res.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Agrupar métricas por paciente
    const pacientesAgrupados = useMemo(() => {
        const map = {};
        metricas.forEach(m => {
            const pid = m.paciente_id;
            if (!map[pid]) {
                map[pid] = {
                    id: pid,
                    nombre: m.paciente_nombre || `Paciente #${pid}`,
                    intentos: [],
                };
            }
            map[pid].intentos.push(m);
        });

        // Calcular resúmenes por paciente
        return Object.values(map).map(p => {
            const intentos = [...p.intentos].sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro)); // Orden cronológico
            const totalIntentos = intentos.length;
            
            // Averages
            const avgFrustracion = totalIntentos > 0
                ? (intentos.reduce((s, i) => s + (i.frustracion || 0), 0) / totalIntentos)
                : 0;
            const avgTiempoReaccion = totalIntentos > 0
                ? Math.round(intentos.reduce((s, i) => s + (i.tiempo_reaccion_ms || 0), 0) / totalIntentos)
                : 0;
            const avgLatencia = totalIntentos > 0
                ? Math.round(intentos.reduce((s, i) => s + (i.latencia_ms || 0), 0) / totalIntentos)
                : 0;
            const avgPresion = totalIntentos > 0
                ? (intentos.reduce((s, i) => s + Number(i.presion_toque || 0), 0) / totalIntentos)
                : 0;

            // Consistency & Trends
            const reaccionTimes = intentos.map(i => i.tiempo_reaccion_ms || 0);
            const consistencia = calculateStdDev(reaccionTimes);
            
            // Trend (Last attempt vs historical average)
            let trendReaccion = 0;
            let trendFrustracion = 0;
            if (totalIntentos > 1) {
                const ultimo = intentos[totalIntentos - 1];
                const anteriores = intentos.slice(0, -1);
                const avgAnteriorReaccion = anteriores.reduce((s, i) => s + (i.tiempo_reaccion_ms || 0), 0) / anteriores.length;
                const avgAnteriorFrust = anteriores.reduce((s, i) => s + (i.frustracion || 0), 0) / anteriores.length;
                
                trendReaccion = calculateTrend(ultimo.tiempo_reaccion_ms, avgAnteriorReaccion);
                trendFrustracion = calculateTrend(ultimo.frustracion, avgAnteriorFrust);
            }

            const estado = classifyPatientState(avgFrustracion, avgTiempoReaccion, consistencia);
            const fatigue = detectFatigue(intentos);
            const ultimoIntento = intentos[totalIntentos - 1];

            const summary = {
                ...p,
                totalIntentos,
                avgFrustracion: Math.round(avgFrustracion * 10) / 10,
                avgTiempoReaccion,
                avgLatencia,
                avgPresion: Math.round(avgPresion * 100) / 100,
                consistencia: Math.round(consistencia),
                trendReaccion: Math.round(trendReaccion),
                trendFrustracion: Math.round(trendFrustracion),
                estado,
                fatigue,
                ultimoIntento,
            };

            return {
                ...summary,
                insights: generateInsights(summary)
            };
        });
    }, [metricas]);

    // Filtrado y Ordenamiento Inteligente
    const processedPacientes = useMemo(() => {
        let list = [...pacientesAgrupados];
        
        // Filtro
        if (searchText.trim()) {
            const q = searchText.toLowerCase();
            list = list.filter(p => p.nombre.toLowerCase().includes(q));
        }

        // Orden
        list.sort((a, b) => {
            if (sortOrder === 'risk') return (b.estado.level || 0) - (a.estado.level || 0);
            if (sortOrder === 'name') return a.nombre.localeCompare(b.nombre);
            if (sortOrder === 'attempts') return b.totalIntentos - a.totalIntentos;
            if (sortOrder === 'date') return new Date(b.ultimoIntento?.fecha_registro) - new Date(a.ultimoIntento?.fecha_registro);
            return 0;
        });

        return list;
    }, [pacientesAgrupados, searchText, sortOrder]);

    const totalPacientes = pacientesAgrupados.length;
    
    // Identify the "Worst Record" (Highest Risk)
    const worstRecordPaciente = useMemo(() => {
        if (pacientesAgrupados.length === 0) return null;
        // Sort by risk (level) and take the first one
        const sorted = [...pacientesAgrupados].sort((a, b) => (b.estado.level || 0) - (a.estado.level || 0));
        return sorted[0].estado.level > 0 ? sorted[0] : null;
    }, [pacientesAgrupados]);

    // Cards de resumen global
    const totalIntentos = metricas.length;
    
    const pacientesEnRiesgo = useMemo(() => {
        return pacientesAgrupados.filter(p => p.estado && p.estado.level > 0).length;
    }, [pacientesAgrupados]);

    const altaFrustracion = useMemo(() => {
        return pacientesAgrupados.filter(p => {
            const ultimo = p.ultimoIntento;
            return ultimo && (ultimo.frustracion >= 4);
        }).length;
    }, [pacientesAgrupados]);

    // Abrir detalle de un paciente
    const openDetail = async (pacienteId) => {
        setSelectedPacienteId(pacienteId);
        setDetailLoading(true);
        try {
            const res = await getMetricasByPaciente(pacienteId);
            setDetailMetricas(res.data || []);
        } catch (err) {
            setDetailMetricas([]);
        } finally {
            setDetailLoading(false);
        }
    };

    const selectedPaciente = pacientesAgrupados.find(p => p.id === selectedPacienteId);

    // Datos para la mini gráfica de barras del modal
    const chartData = useMemo(() => {
        if (!detailMetricas.length) return [];
        // Tomar hasta los últimos 12 intentos
        const slice = detailMetricas.slice(-12);
        const maxReaccion = Math.max(...slice.map(m => m.tiempo_reaccion_ms || 0), 1);
        return slice.map(m => ({
            ...m,
            reaccionPct: ((m.tiempo_reaccion_ms || 0) / maxReaccion) * 100,
            frustPct: ((m.frustracion || 0) / 5) * 100,
        }));
    }, [detailMetricas]);

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="tico-container">
                <div className="metricas-loading">
                    <div className="metricas-loading__spinner" />
                    <p>Cargando métricas...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="tico-container">
                <div className="metricas-error">
                    <AlertTriangle size={32} />
                    <p>Error al cargar métricas: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tico-container metricas-layout">

            {/* ── Sección fija (header + cards + alerta + toolbar) ── */}
            <div className="metricas-top-section">
            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Métricas de Intentos</h1>
                    <p className="tico-subtitle">Registro de intentos del paciente durante las sesiones terapéuticas</p>
                </div>
                <button 
                    className="tico-btn tico-btn-outline"
                    onClick={() => setShowGuiaModal(true)}
                >
                    <BookOpen size={16} /> Guía Clínica
                </button>
            </header>

            {/* Cards de resumen */}
            <div className="metricas-cards">
                <div className="metricas-card metricas-card--morado">
                    <div className="metricas-card__icon">
                        <User size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{totalPacientes}</span>
                        <span className="metricas-card__label">Pacientes registrados</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--rojo">
                    <div className="metricas-card__icon">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{pacientesEnRiesgo}</span>
                        <span className="metricas-card__label">Pacientes en atención</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--amarillo">
                    <div className="metricas-card__icon">
                        <Zap size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{altaFrustracion}</span>
                        <span className="metricas-card__label">Alta frustración (último intento)</span>
                    </div>
                </div>
            </div>

            {/* Alerta de Peor Récord */}
            {worstRecordPaciente && (
                <div className="metricas-worst-record-alert" onClick={() => openDetail(worstRecordPaciente.id)}>
                    <div className="worst-record-content">
                        <div className="worst-record-icon">
                            <Zap size={20} fill="#ef4444" color="#ef4444" />
                        </div>
                        <div className="worst-record-text">
                            <span className="worst-record-title">Atención Prioritaria</span>
                            <span className="worst-record-desc">
                                <strong>{worstRecordPaciente.nombre}</strong> presenta el nivel más alto de riesgo clínico actualmente.
                            </span>
                        </div>
                    </div>
                    <button className="worst-record-action">
                        Revisar <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Buscador y Filtros */}
            <div className="tico-toolbar" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre de paciente..."
                        className="tico-search"
                        style={{ paddingLeft: '34px', width: '100%', borderRadius: '12px' }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                
                <div className="sort-controls" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>Ordenar por:</span>
                    <button 
                        className={`sort-btn ${sortOrder === 'risk' ? 'active' : ''}`} 
                        onClick={() => setSortOrder('risk')}
                    >Riesgo</button>
                    <button 
                        className={`sort-btn ${sortOrder === 'date' ? 'active' : ''}`} 
                        onClick={() => setSortOrder('date')}
                    >Reciente</button>
                    <button 
                        className={`sort-btn ${sortOrder === 'attempts' ? 'active' : ''}`} 
                        onClick={() => setSortOrder('attempts')}
                    >Intentos</button>
                </div>
            </div>
            </div> {/* /metricas-top-section */}

            {/* ── Área de scroll: lista de pacientes ── */}
            <div className="metricas-scroll-area">

            {processedPacientes.length === 0 ? (
                <div className="metricas-empty">
                    <Activity size={40} strokeWidth={1.5} />
                    <p>No se encontraron pacientes registrados.</p>
                </div>
            ) : (
                <div className="metricas-pacientes-grid">
                    {processedPacientes.map(p => {
                        const criticalInsight = p.insights.find(i => i.type === 'danger' || i.type === 'warning');
                        const reaccionData = p.intentos.map(i => i.tiempo_reaccion_ms || 0).slice(-10);
                        
                        return (
                            <div
                                key={p.id}
                                className={`metricas-paciente-card metricas-paciente-card--state-${p.estado.label.toLowerCase()}`}
                                onClick={() => openDetail(p.id)}
                            >
                                <div className="metricas-paciente-card__state-marker" style={{ backgroundColor: p.estado.color }} />
                                
                                <div className="metricas-paciente-card__header">
                                    <div className="metricas-paciente-card__avatar">
                                        {getInitials(p.nombre)}
                                    </div>
                                    <div className="metricas-paciente-card__name-section">
                                        <div className="metricas-paciente-card__name">{p.nombre}</div>
                                        <div className="metricas-paciente-card__info-row">
                                            <span className="info-chip">{p.totalIntentos} Int.</span>
                                            <span className="info-chip" style={{ color: p.estado.color, fontWeight: '800' }}>{p.estado.label}</span>
                                        </div>
                                    </div>
                                    <div className="card-sparkline">
                                        <Sparkline data={reaccionData} color={p.estado.color} />
                                    </div>
                                </div>

                                <div className="metricas-paciente-card__grid">
                                    <div className="metric-item">
                                        <span className="metric-item__label">
                                            Prom. Reacción
                                            <span className="tico-tooltip" data-tooltip="Tiempo promedio en milisegundos que tarda el paciente en responder.">
                                                <Info size={11} />
                                            </span>
                                        </span>
                                        <div className="metric-item__value-row">
                                            <span className="metric-item__value">{formatMs(p.avgTiempoReaccion)}</span>
                                            {p.trendReaccion !== 0 && (
                                                <span className={`metric-item__trend ${p.trendReaccion > 0 ? 'bad' : 'good'}`}>
                                                    {p.trendReaccion > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-item__label">
                                            Frustración
                                            <span className="tico-tooltip" data-tooltip="Nivel del 1 al 5 basado en precisión y presión de toque.">
                                                <Info size={11} />
                                            </span>
                                        </span>
                                        <div className="metric-item__value-row">
                                            <span className="metric-item__value">{p.avgFrustracion}</span>
                                            {p.trendFrustracion !== 0 && (
                                                <span className={`metric-item__trend ${p.trendFrustracion > 0 ? 'bad' : 'good'}`}>
                                                    {p.trendFrustracion > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {criticalInsight && (
                                    <div className={`card-insight-bar insight--${criticalInsight.type}`}>
                                        <AlertTriangle size={12} />
                                        <span>{criticalInsight.text}</span>
                                    </div>
                                )}

                                <div className="metricas-paciente-card__footer">
                                    <span>Último: {formatDate(p.ultimoIntento?.fecha_registro).split(',')[0]}</span>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div> {/* /metricas-scroll-area */}


            {selectedPacienteId && (
                <div className="tico-modal-overlay" onClick={() => setSelectedPacienteId(null)}>
                    <div className="desglose-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setSelectedPacienteId(null)}>
                            <X size={18} />
                        </button>

                        <div className="desglose-modal-content">
                            {/* Header */}
                            <div className="desglose-header">
                                <div className="desglose-avatar">
                                    {selectedPaciente ? getInitials(selectedPaciente.nombre) : '?'}
                                </div>
                                <div className="desglose-patient-info">
                                    <h2>{selectedPaciente?.nombre || 'Paciente'}</h2>
                                    <span>{selectedPaciente?.totalIntentos || 0} intentos registrados</span>
                                </div>
                            </div>

                            {detailLoading ? (
                                <div className="metricas-loading" style={{ padding: '3rem 0' }}>
                                    <div className="metricas-loading__spinner" />
                                    <p>Cargando intentos...</p>
                                </div>
                            ) : detailMetricas.length === 0 ? (
                                <div className="metricas-empty" style={{ padding: '2rem 0' }}>
                                    <p>No hay intentos registrados para este paciente.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Resumen de KPIs */}
                                    <div className="desglose-kpis">
                                        <div className="desglose-kpi">
                                            <span className="desglose-kpi__label">
                                                Prom. Reacción
                                                <span className="tico-tooltip" data-tooltip="Tiempo promedio en responder al estímulo visual.">
                                                    <Info size={11} />
                                                </span>
                                            </span>
                                            <span className="desglose-kpi__value">{formatMs(selectedPaciente?.avgTiempoReaccion)}</span>
                                        </div>
                                        <div className="desglose-kpi">
                                            <span className="desglose-kpi__label">
                                                Consistencia
                                                <span className="tico-tooltip" data-tooltip="Estabilidad de reacción. Baja consistencia sugiere fatiga o inatención.">
                                                    <Info size={11} />
                                                </span>
                                            </span>
                                            <span className="desglose-kpi__value" style={{ color: selectedPaciente?.consistencia > 500 ? '#f59e0b' : '#22c55e' }}>
                                                {selectedPaciente?.consistencia > 500 ? 'Baja' : 'Alta'}
                                            </span>
                                        </div>
                                        <div className="desglose-kpi">
                                            <span className="desglose-kpi__label">
                                                Frustración
                                                <span className="tico-tooltip" data-tooltip="Nivel IA del 1 al 5 en base a tiempo, errores y presión.">
                                                    <Info size={11} />
                                                </span>
                                            </span>
                                            <span className="desglose-kpi__value">{selectedPaciente?.avgFrustracion} / 5</span>
                                        </div>
                                        <div className="desglose-kpi">
                                            <span className="desglose-kpi__label">Estado Actual</span>
                                            <span className="desglose-kpi__badge" style={{ backgroundColor: selectedPaciente?.estado.color }}>
                                                {selectedPaciente?.estado.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Recomendaciones / Insights */}
                                    {selectedPaciente?.insights.length > 0 && (
                                        <div className="desglose-insights">
                                            {selectedPaciente.insights.map((insight, idx) => (
                                                <div key={idx} className={`desglose-insight desglose-insight--${insight.type}`}>
                                                    {insight.type === 'success' ? <Activity size={14} /> : <AlertTriangle size={14} />}
                                                    <span>{insight.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Gráficas Separadas */}
                                    <div className="desglose-charts-grid">
                                        <div className="desglose-chart-container">
                                            <div className="detail-section-title">Tiempo de Reacción (ms)</div>
                                            <div className="detail-chart-wrapper">
                                                <div className="detail-chart detail-chart--reaccion">
                                                    {chartData.map((m, i) => (
                                                        <div key={m.id} className="detail-chart__bar-group">
                                                            <div
                                                                className="detail-chart__bar detail-chart__bar--reaccion"
                                                                style={{ height: `${m.reaccionPct}%` }}
                                                                title={`Reacción: ${formatMs(m.tiempo_reaccion_ms)}`}
                                                            />
                                                            <span className="detail-chart__label">#{i + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="desglose-chart-container">
                                            <div className="detail-section-title">Nivel de Frustración</div>
                                            <div className="detail-chart-wrapper">
                                                <div className="detail-chart detail-chart--frust">
                                                    {chartData.map((m, i) => (
                                                        <div key={m.id} className="detail-chart__bar-group">
                                                            <div
                                                                className="detail-chart__bar detail-chart__bar--frust"
                                                                style={{ height: `${m.frustPct}%`, backgroundColor: getFrustColor(m.frustracion) }}
                                                                title={`Frustración: ${m.frustracion}`}
                                                            />
                                                            <span className="detail-chart__label">#{i + 1}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tabla de intentos */}
                                    <div className="detail-section-title">Historial Detallado</div>
                                    <div className="detail-table-container">
                                        <table className="detail-table">
                                            <thead>
                                                <tr>
                                                    <th>Intento</th>
                                                    <th>Fecha / Hora</th>
                                                    <th>Frust.</th>
                                                    <th>Presión</th>
                                                    <th>T. Reacción</th>
                                                    <th>Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailMetricas.map((m, i) => {
                                                    const isCritical = m.frustracion >= 4 || (m.tiempo_reaccion_ms > 2000);
                                                    return (
                                                        <tr key={m.id} className={isCritical ? 'row-critical' : ''}>
                                                            <td className="detail-table__num">#{i + 1}</td>
                                                            <td>{formatDate(m.fecha_registro)}</td>
                                                            <td>
                                                                <span
                                                                    className="detail-frust-badge"
                                                                    style={{
                                                                        backgroundColor: getFrustColor(m.frustracion) + '20',
                                                                        color: getFrustColor(m.frustracion),
                                                                    }}
                                                                >
                                                                    {m.frustracion}
                                                                </span>
                                                            </td>
                                                            <td>{m.presion_toque != null ? Number(m.presion_toque).toFixed(2) : '—'}</td>
                                                            <td className="detail-reaccion-value">{formatMs(m.tiempo_reaccion_ms)}</td>
                                                            <td>
                                                                {isCritical ? (
                                                                    <span className="critico-badge">Atención</span>
                                                                ) : (
                                                                    <span className="normal-badge">Normal</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══ Modal de Guía Clínica ══ */}
            {showGuiaModal && (
                <div className="tico-modal-overlay" onClick={() => setShowGuiaModal(false)}>
                    <div className="desglose-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', padding: 0 }}>
                        <button className="tico-modal-close" onClick={() => setShowGuiaModal(false)}>
                            <X size={18} />
                        </button>
                        <div className="desglose-modal-content" style={{ padding: '2.5rem 2.5rem 2rem' }}>
                            <h2 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.4rem' }}>Guía de Análisis Clínico</h2>
                            <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                Esta pantalla te ayuda a monitorear el desempeño de los pacientes para identificar mejoras o señales de alerta durante sus sesiones con TICO.
                            </p>

                            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Clock size={16} /> Promedio de Reacción
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                                    Es el tiempo (en milisegundos o segundos) que toma el paciente en interactuar con el estímulo desde que aparece. Una <strong>disminución</strong> indica agilidad y mejor procesamiento cognitivo.
                                </p>
                            </div>

                            <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Target size={16} /> Consistencia
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                                    Analiza qué tan estables son los tiempos de respuesta. Una consistencia <strong>alta</strong> es ideal. Una consistencia <strong>baja</strong> (gran variación entre tiempos) alerta sobre episodios de fatiga o episodios de inatención.
                                </p>
                            </div>

                            <div style={{ marginBottom: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                                <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Zap size={16} /> Nivel de Frustración
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                                    Índice estimado (1 al 5). La IA lo calcula sumando los tiempos prolongados inesperados, cantidad de equivocaciones y la <strong>presión del toque</strong>. Ante niveles de 4 o 5, considera pausar la sesión.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricasPage;
