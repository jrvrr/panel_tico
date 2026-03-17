import { useState, useEffect, useMemo } from 'react';
import { X, Activity, Clock, Zap, AlertTriangle, Search, User, ChevronRight, BarChart3 } from 'lucide-react';
import { getMetricasIA, getMetricasByPaciente } from '../../services/api';
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
    if (ms == null) return '—';
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms}ms`;
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
    const [selectedPacienteId, setSelectedPacienteId] = useState(null);
    const [detailMetricas, setDetailMetricas] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

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
            const intentos = p.intentos;
            const totalIntentos = intentos.length;
            const avgFrustracion = totalIntentos > 0
                ? (intentos.reduce((s, i) => s + (i.frustracion || 0), 0) / totalIntentos)
                : 0;
            const avgTiempoReaccion = totalIntentos > 0
                ? Math.round(intentos.reduce((s, i) => s + (i.tiempo_reaccion_ms || 0), 0) / totalIntentos)
                : 0;
            const avgLatencia = totalIntentos > 0
                ? Math.round(intentos.reduce((s, i) => s + (i.latencia_ms || 0), 0) / totalIntentos)
                : 0;
            const ultimoIntento = intentos.length > 0
                ? intentos.reduce((a, b) => new Date(a.fecha_registro) > new Date(b.fecha_registro) ? a : b)
                : null;

            return {
                ...p,
                totalIntentos,
                avgFrustracion: Math.round(avgFrustracion * 10) / 10,
                avgTiempoReaccion,
                avgLatencia,
                ultimoIntento,
            };
        });
    }, [metricas]);

    // Filtrado
    const filteredPacientes = useMemo(() => {
        if (!searchText.trim()) return pacientesAgrupados;
        const q = searchText.toLowerCase();
        return pacientesAgrupados.filter(p => p.nombre.toLowerCase().includes(q));
    }, [pacientesAgrupados, searchText]);

    // Cards de resumen global
    const totalIntentos = metricas.length;
    const avgFrustGlobal = totalIntentos > 0
        ? Math.round((metricas.reduce((s, m) => s + (m.frustracion || 0), 0) / totalIntentos) * 10) / 10
        : 0;
    const avgReaccionGlobal = totalIntentos > 0
        ? Math.round(metricas.reduce((s, m) => s + (m.tiempo_reaccion_ms || 0), 0) / totalIntentos)
        : 0;

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
        <div className="tico-container">

            {/* Header */}
            <header className="tico-header">
                <div>
                    <h1 className="tico-title">Métricas de Intentos</h1>
                    <p className="tico-subtitle">Registro de intentos del paciente durante las sesiones terapéuticas</p>
                </div>
            </header>

            {/* Cards de resumen */}
            <div className="metricas-cards">
                <div className="metricas-card metricas-card--azul">
                    <div className="metricas-card__icon metricas-card__icon--azul">
                        <BarChart3 size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{totalIntentos}</span>
                        <span className="metricas-card__label">Total de intentos</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--amarillo">
                    <div className="metricas-card__icon metricas-card__icon--amarillo">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{avgFrustGlobal}</span>
                        <span className="metricas-card__label">Frustración promedio</span>
                    </div>
                </div>

                <div className="metricas-card metricas-card--rojo">
                    <div className="metricas-card__icon metricas-card__icon--rojo">
                        <Clock size={22} />
                    </div>
                    <div className="metricas-card__info">
                        <span className="metricas-card__value">{formatMs(avgReaccionGlobal)}</span>
                        <span className="metricas-card__label">Tiempo de reacción prom.</span>
                    </div>
                </div>
            </div>

            {/* Buscador */}
            <div className="tico-toolbar" style={{ marginBottom: '1rem' }}>
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

            {/* Lista de pacientes como tarjetas */}
            {filteredPacientes.length === 0 ? (
                <div className="metricas-empty">
                    <Activity size={40} strokeWidth={1.5} />
                    <p>No se encontraron pacientes con métricas registradas.</p>
                </div>
            ) : (
                <div className="metricas-pacientes-grid">
                    {filteredPacientes.map(p => (
                        <div
                            key={p.id}
                            className="metricas-paciente-card"
                            onClick={() => openDetail(p.id)}
                        >
                            <div className="metricas-paciente-card__header">
                                <div className="metricas-paciente-card__avatar">
                                    {getInitials(p.nombre)}
                                </div>
                                <div className="metricas-paciente-card__name-section">
                                    <span className="metricas-paciente-card__name">{p.nombre}</span>
                                    <span className="metricas-paciente-card__subtitle">
                                        {p.totalIntentos} intento{p.totalIntentos !== 1 ? 's' : ''} registrado{p.totalIntentos !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ChevronRight size={18} className="metricas-paciente-card__chevron" />
                            </div>

                            <div className="metricas-paciente-card__stats">
                                <div className="metricas-paciente-card__stat">
                                    <span className="metricas-paciente-card__stat-label">Frustración</span>
                                    <div className="metricas-paciente-card__stat-bar-wrap">
                                        <div
                                            className="metricas-paciente-card__stat-bar"
                                            style={{
                                                width: `${Math.min((p.avgFrustracion / 5) * 100, 100)}%`,
                                                backgroundColor: getFrustColor(p.avgFrustracion),
                                            }}
                                        />
                                    </div>
                                    <span className="metricas-paciente-card__stat-value" style={{ color: getFrustColor(p.avgFrustracion) }}>
                                        {p.avgFrustracion} — {getFrustLabel(p.avgFrustracion)}
                                    </span>
                                </div>

                                <div className="metricas-paciente-card__stat-row">
                                    <div className="metricas-paciente-card__stat-chip">
                                        <Clock size={13} />
                                        <span>Reacción: <strong>{formatMs(p.avgTiempoReaccion)}</strong></span>
                                    </div>
                                    <div className="metricas-paciente-card__stat-chip">
                                        <Zap size={13} />
                                        <span>Latencia: <strong>{formatMs(p.avgLatencia)}</strong></span>
                                    </div>
                                </div>

                                {p.ultimoIntento && (
                                    <div className="metricas-paciente-card__last">
                                        Último: {formatDate(p.ultimoIntento.fecha_registro)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ══ Modal de Detalle del Paciente ══ */}
            {selectedPacienteId && (
                <div className="tico-modal-overlay" onClick={() => setSelectedPacienteId(null)}>
                    <div className="desglose-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="tico-modal-close" onClick={() => setSelectedPacienteId(null)}>
                            <X size={18} />
                        </button>

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
                                {/* Mini gráfica de evolución */}
                                <div className="detail-section-title">Evolución de Intentos</div>
                                <div className="detail-chart-wrapper">
                                    <div className="detail-chart">
                                        {chartData.map((m, i) => (
                                            <div key={m.id} className="detail-chart__bar-group">
                                                <div className="detail-chart__bars">
                                                    <div
                                                        className="detail-chart__bar detail-chart__bar--reaccion"
                                                        style={{ height: `${m.reaccionPct}%` }}
                                                        title={`Reacción: ${formatMs(m.tiempo_reaccion_ms)}`}
                                                    />
                                                    <div
                                                        className="detail-chart__bar detail-chart__bar--frust"
                                                        style={{ height: `${m.frustPct}%` }}
                                                        title={`Frustración: ${m.frustracion}`}
                                                    />
                                                </div>
                                                <span className="detail-chart__label">#{i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="detail-chart__legend">
                                        <div className="detail-chart__legend-item">
                                            <span className="detail-chart__legend-dot" style={{ backgroundColor: '#3b82f6' }} />
                                            Tiempo reacción
                                        </div>
                                        <div className="detail-chart__legend-item">
                                            <span className="detail-chart__legend-dot" style={{ backgroundColor: '#f97316' }} />
                                            Frustración
                                        </div>
                                    </div>
                                </div>

                                {/* Tabla de intentos */}
                                <div className="detail-section-title">Historial de Intentos</div>
                                <div className="detail-table-container">
                                    <table className="detail-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Fecha</th>
                                                <th>Frustración</th>
                                                <th>Latencia</th>
                                                <th>Presión</th>
                                                <th>T. Reacción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detailMetricas.map((m, i) => (
                                                <tr key={m.id}>
                                                    <td className="detail-table__num">{i + 1}</td>
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
                                                    <td>{formatMs(m.latencia_ms)}</td>
                                                    <td>{m.presion_toque != null ? Number(m.presion_toque).toFixed(2) : '—'}</td>
                                                    <td>
                                                        <span className="detail-reaccion-value">
                                                            {formatMs(m.tiempo_reaccion_ms)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MetricasPage;
