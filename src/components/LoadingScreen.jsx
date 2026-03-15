import React, { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

/* ─────────────────────────────────────────────
   ETAPAS (solo para la cara y el color del texto %)
───────────────────────────────────────────── */
const STAGES = [
    { max: 18, bulb: '#5BADE0', face: 'happy' },
    { max: 38, bulb: '#4CC94C', face: 'bigSmile' },
    { max: 58, bulb: '#FFBF00', face: 'determined' },
    { max: 78, bulb: '#FF2D91', face: 'happy' },
    { max: 100, bulb: '#A50026', face: 'fierce' },
];
function getStage(p) {
    return STAGES.find(s => p <= s.max) ?? STAGES[STAGES.length - 1];
}

/* ─────────────────────────────────────────────
   CARA KAWAII – expresiones con transición suave
───────────────────────────────────────────── */
function KawaiFace({ type, cx: ox, cy: oy }) {
    const tr = (active) => ({ opacity: active ? 1 : 0, transition: 'opacity 0.55s ease' });
    const S = 2;
    const ex = (dx) => ox + dx * S;
    const ey = (dy) => oy + dy * S;

    return (
        <g>
            {/* ojos normales */}
            <g style={tr(type !== 'determined' && type !== 'fierce')}>
                <circle cx={ex(-9)} cy={ey(-5)} r={3.8 * S} fill="rgba(0,0,0,.82)" />
                <circle cx={ex(+9)} cy={ey(-5)} r={3.8 * S} fill="rgba(0,0,0,.82)" />
                <circle cx={ex(-7)} cy={ey(-7)} r={1.4 * S} fill="white" />
                <circle cx={ex(+11)} cy={ey(-7)} r={1.4 * S} fill="white" />
            </g>
            {/* ojos entrecerrados */}
            <g style={tr(type === 'determined')}>
                <path d={`M${ex(-12)} ${ey(-4)} Q${ex(-9)} ${ey(-8)} ${ex(-5)} ${ey(-4)}`}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} fill="none" strokeLinecap="round" />
                <path d={`M${ex(+5)} ${ey(-4)} Q${ex(+9)} ${ey(-8)} ${ex(+12)} ${ey(-4)}`}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} fill="none" strokeLinecap="round" />
            </g>
            {/* ojos furiosos */}
            <g style={tr(type === 'fierce')}>
                <line x1={ex(-12)} y1={ey(-11)} x2={ex(-5)} y2={ey(-7)}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} strokeLinecap="round" />
                <line x1={ex(+5)} y1={ey(-7)} x2={ex(+12)} y2={ey(-11)}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} strokeLinecap="round" />
                <circle cx={ex(-8)} cy={ey(-2)} r={3.5 * S} fill="rgba(0,0,0,.82)" />
                <circle cx={ex(+8)} cy={ey(-2)} r={3.5 * S} fill="rgba(0,0,0,.82)" />
            </g>
            {/* boca sonrisa */}
            <g style={tr(type === 'happy')}>
                <path d={`M${ex(-8)} ${ey(+6)} Q${ex(0)} ${ey(+13)} ${ex(+8)} ${ey(+6)}`}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} fill="none" strokeLinecap="round" />
            </g>
            {/* boca gran sonrisa + mejillas */}
            <g style={tr(type === 'bigSmile')}>
                <path d={`M${ex(-10)} ${ey(+5)} Q${ex(0)} ${ey(+15)} ${ex(+10)} ${ey(+5)}`}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} fill="none" strokeLinecap="round" />
                <ellipse cx={ex(-15)} cy={ey(+5)} rx={5 * S} ry={3 * S} fill="rgba(255,100,100,.4)" />
                <ellipse cx={ex(+15)} cy={ey(+5)} rx={5 * S} ry={3 * S} fill="rgba(255,100,100,.4)" />
            </g>
            {/* boca recta */}
            <g style={tr(type === 'determined')}>
                <line x1={ex(-7)} y1={ey(+8)} x2={ex(+7)} y2={ey(+8)}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} strokeLinecap="round" />
            </g>
            {/* boca apretada furiosa */}
            <g style={tr(type === 'fierce')}>
                <path d={`M${ex(-7)} ${ey(+10)} Q${ex(0)} ${ey(+6)} ${ex(+7)} ${ey(+10)}`}
                    stroke="rgba(0,0,0,.82)" strokeWidth={2.2 * S} fill="none" strokeLinecap="round" />
                <line x1={ex(-18)} y1={ey(0)} x2={ex(-13)} y2={ey(+5)}
                    stroke="rgba(0,0,0,.6)" strokeWidth={1.4 * S} strokeLinecap="round" />
                <line x1={ex(+13)} y1={ey(0)} x2={ex(+18)} y2={ey(+5)}
                    stroke="rgba(0,0,0,.6)" strokeWidth={1.4 * S} strokeLinecap="round" />
            </g>
        </g>
    );
}

/* ─────────────────────────────────────────────
   TERMÓMETRO SVG – forma unificada (tubo + bulbo = un solo path)
   ✓ Sin juntura negra
   ✓ Gradiente que sube progresivamente
   ✓ Cara integrada en el bulbo
───────────────────────────────────────────── */
function ThermoSVG({ progress }) {
    const stage = getStage(progress);

    /* Dimensiones */
    const CX = 120;   // centro X
    const OTW = 27;    // outer tube half-width
    const TT = 60;    // y donde la pared lateral del tubo comienza
    const BC = 315;   // y centro del bulbo
    const BR = 57;    // radio exterior del bulbo
    // Punto de conexión: donde la pared del tubo es tangente al círculo del bulbo
    const TC = Math.round(BC - Math.sqrt(BR * BR - OTW * OTW)); // ≈ 258

    /* Interior (fillable) */
    const ITW = 13;    // inner tube half-width
    const IBR = 44;    // inner bulbo radius
    const ITC = Math.round(BC - Math.sqrt(IBR * IBR - ITW * ITW)); // ≈ 272
    const ITT = TT + 1;

    /* Relleno */
    const FILL_BOT = BC + IBR;            // base del bulbo interior
    const FILL_TOP_Y = ITT - ITW;           // tope del tubo interior
    const FILL_TOTAL = FILL_BOT - FILL_TOP_Y;
    const fillH = (progress / 100) * FILL_TOTAL;
    const fillY = FILL_BOT - fillH;

    /* Path exterior (UNA sola forma: pill + arco grande del bulbo) */
    const op = `M ${CX - OTW} ${TT} A ${OTW} ${OTW} 0 0 1 ${CX + OTW} ${TT} L ${CX + OTW} ${TC} A ${BR} ${BR} 0 1 1 ${CX - OTW} ${TC} Z`;

    /* Path interior (mismo shape más pequeño, para clipPath del relleno) */
    const ip = `M ${CX - ITW} ${ITT} A ${ITW} ${ITW} 0 0 1 ${CX + ITW} ${ITT} L ${CX + ITW} ${ITC} A ${IBR} ${IBR} 0 1 1 ${CX - ITW} ${ITC} Z`;

    return (
        <svg width="260" height="395" viewBox="0 0 260 395"
            style={{ overflow: 'visible' }}>
            <defs>
                {/* Gradiente fijo en el espacio absoluto: teal (abajo) → rojo (arriba) */}
                <linearGradient id="tg"
                    x1="0" y1={FILL_BOT}
                    x2="0" y2={FILL_TOP_Y}
                    gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#00ACC1" />
                    <stop offset="22%" stopColor="#66BB6A" />
                    <stop offset="48%" stopColor="#FFF176" />
                    <stop offset="74%" stopColor="#FFA726" />
                    <stop offset="100%" stopColor="#EF5350" />
                </linearGradient>
                {/* Clip = forma interior */}
                <clipPath id="ic">
                    <path d={ip} />
                </clipPath>
            </defs>

            {/* 1) Cuerpo blanco exterior */}
            <path d={op} fill="white" />

            {/* 2) Fondo interior gris claro */}
            <path d={ip} fill="#ededed" />

            {/* 3) Relleno gradiente sube desde abajo – ancho = bulbo completo */}
            <rect
                x={CX - IBR - 2}
                y={fillY}
                width={IBR * 2 + 4}
                height={fillH + 6}
                fill="url(#tg)"
                clipPath="url(#ic)"
                style={{ transition: 'y .4s ease, height .4s ease' }}
            />


            {/* 4) Brillo lateral del tubo */}
            <rect
                x={CX - ITW + 1} y={ITT + 2}
                width={6} height={ITC - ITT - 12}
                rx="3"
                fill="rgba(255,255,255,.55)"
                clipPath="url(#ic)"
            />
            {/* highlight tapa superior */}
            <ellipse cx={CX} cy={ITT - ITW + 5} rx={8} ry={5}
                fill="rgba(200,200,200,.55)" />

            {/* 5) Brillo 3D del bulbo */}
            <ellipse cx={CX - 15} cy={BC - 22} rx={11} ry={8}
                fill="rgba(255,255,255,.55)" />

            {/* 6) Borde negro exterior – UNA sola path, sin juntura */}
            <path d={op}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="10"
                strokeLinejoin="round" />

            {/* 7) Marcas de escala a la izquierda (alternando largo/corto) */}
            {Array.from({ length: 11 }, (_, i) => {
                const ty = ITC - (i / 10) * (ITC - ITT);
                const len = i % 2 === 0 ? 22 : 13;
                return (
                    <line key={i}
                        x1={CX - OTW - 10 - len} y1={ty}
                        x2={CX - OTW - 10} y2={ty}
                        stroke="#222"
                        strokeWidth={i % 2 === 0 ? 4.5 : 3}
                        strokeLinecap="round" />
                );
            })}

            {/* 8) Cara kawaii en el bulbo */}
            <KawaiFace type={stage.face} cx={CX} cy={BC + 4} />
        </svg>
    );
}

/* ─────────────────────────────────────────────
   FASE 2 – Personajes kawaii
───────────────────────────────────────────── */
function Phase2SVG() {
    return (
        <svg
            width="700" height="380" viewBox="0 0 700 380"
            style={{ overflow: 'visible' }}>


            {/* ROSA – Animado (estiramiento desde el suelo) */}
            <g transform="translate(50, 0)">
                <rect className="pink-body-anim" x="-120" y="175" width="185" height="205" rx="10" fill="#f990b3" />

                {/* Ojos - escalan un poquito */}
                <g className="pink-eyes-anim">
                    <circle cx="-100" cy="340" r="5" fill="#222" />
                    <circle cx="-49" cy="340" r="5" fill="#222" />
                </g>

                {/* Boca y Pelo - siguen el movimiento hacia arriba */}
                <g className="pink-mouth-anim">
                    <circle cx="-79" cy="355" r="10" stroke="#222" strokeWidth="3.5" fill="none" />
                    {/* Pelo extraído de 1.svg (NUEVO DISEÑO) */}
                    <g transform="translate(-145, 230) scale(0.70)" >
                        <path fill="#222" stroke="#222" strokeWidth="2.5" strokeLinejoin="round" 
                            d="M599.1,408.05a69.63,69.63,0,0,1-15.06.75,59.44,59.44,0,0,1-17.85-3.51c-7.27-2.81-12.85-8.38-17.25-14.69a121.57,121.57,0,0,1-10-18c-3.14-6.72-6.33-14.22-6.57-21.73-.08-2.7.26-5.75,2.2-7.81,2.32-2.47,6-2.71,9.15-2.43a43.27,43.27,0,0,1,13,3.7A82.19,82.19,0,0,1,569,350.91c5.82,3.74,11.71,8.38,15.4,14.31,2.2,3.54,3.38,7.77,1.44,11.71a3.28,3.28,0,0,0-.34.6c-.1.42-.52.08.17.14.52,0,.34.15.07-.25a10.45,10.45,0,0,1-1.25-3.19,23.74,23.74,0,0,1-.79-7.26,26.65,26.65,0,0,1,3.78-12.57c2-3.2,5.26-5.9,9.21-4.49,4.47,1.59,7.63,6.56,9.35,10.72a21.88,21.88,0,0,1,.45,15.39,25.29,25.29,0,0,1-1.69,3.93c-.92,1.7,1.67,3.21,2.59,1.51a27,27,0,0,0,3.31-13.2A26.58,26.58,0,0,0,604.19,352c-3.06-3.62-7.9-6.77-12.79-5-4.41,1.64-7.06,6.05-8.69,10.23A29.18,29.18,0,0,0,581,372.39c.38,2.38,1,5.35,2.61,7.23s3.79.79,4.78-1.17c4.68-9.31-3.26-18.5-10-24.22a80,80,0,0,0-21.85-13.13c-7.1-2.89-19.21-6.77-24.87.79-2.07,2.76-2.51,6.4-2.3,9.76a46.36,46.36,0,0,0,2.73,12.28,129.48,129.48,0,0,0,9.64,20.76c4.44,7.89,9.86,15.71,17.68,20.59a40.52,40.52,0,0,0,13.63,5.06,75.81,75.81,0,0,0,19.42,1.44c2.47-.15,4.94-.44,7.39-.83,1.9-.31,1.09-3.2-.8-2.9Z" 
                            transform="translate(-529.36 -337.49)" />
                    </g>
                </g>
            </g>

            {/* ROJO – Encima del rosa, pero debajo del resto */}
            <g className="red-spin" transform="translate(300 200) rotate(0) translate(-300 -200)">
                <g fill="#fd312d">
                    <g transform="translate(-50, -175) scale(11.5)">
                        <path transform="translate(-568.24, -179.44)" d="M592.24,209.45c-7.81-.35-7.79-11.65,0-12,11.54-.52,11.61-18.52,0-18-13.09.58-23.87,10.52-24,24s11.09,23.42,24,24c11.59.52,11.56-17.48,0-18Z" />
                        <rect x="21" y="0.25" width="11.55" height="17.50" rx="3.57" stroke="#fd312d" strokeWidth="0.5" />
                        <rect x="21" y="30.29" width="11.55" height="17.50" rx="3.57" stroke="#fd312d" strokeWidth="0.5" />
                    </g>
                </g>

                {/* Cara kawaii */}
                <g transform="translate(180, 100)">
                    {/* Ojos */}
                    <circle cx="23" cy="-220" r="5" fill="#222" />
                    <circle cx="90" cy="-220" r="5" fill="#222" />

                    {/* Boca */}
                    <g transform="translate(56, -205)">
                        <path
                            d="M -15 -10 Q 0 10 15 -10"
                            stroke="#222"
                            strokeWidth="4.5"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </g>

                    {/* Pelo */}
                    <g transform="translate(-32, -85) scale(1.20)">
                        <path
                            fill="#222"
                            stroke="#222"
                            strokeWidth="0.09"
                            strokeLinejoin="round"
                            d="M693.19,314.69c-7.61,2.41-17.36,4-24.68-.18a11.7,11.7,0,0,1-5.33-6.27,5,5,0,0,1,.28-4.5,7.16,7.16,0,0,1,2.91-2.25,24.31,24.31,0,0,1,9.82-1.9,44.68,44.68,0,0,1,11,1,41.65,41.65,0,0,1,6.73,2.1,18.07,18.07,0,0,1,2.34,1.14c.24.14.46.31.69.45.44.25.12.34.3-.43s.26-.47,0-.48a4.19,4.19,0,0,0-.76.18,16,16,0,0,1-2.48.2,38.3,38.3,0,0,1-4.91-.15c-7.65-.74-15.13-4.57-21-9.38a34.09,34.09,0,0,1-6.92-7.27c-1.24-1.84-2.56-4.15-2.34-6.44.2-2.06,2.39-3.49,4.28-4.28a28,28,0,0,1,10.29-1.77,36.69,36.69,0,0,1,21.92,6.36c8.39,6,13.93,15.76,16.56,25.58.1.38.2.76.29,1.15.44,1.88,3.33,1.08,2.89-.8-2.41-10.37-8.24-20.75-16.67-27.35a39.26,39.26,0,0,0-24.45-7.95,31.54,31.54,0,0,0-11.75,1.94c-2.68,1.09-5.49,2.93-6.19,5.94-.64,2.78.48,5.67,1.88,8a34,34,0,0,0,7.31,8.34c6.61,5.63,14.86,9.92,23.58,10.87a38.23,38.23,0,0,0,5.56.17c1.52-.06,3.46-.07,4.78-.94a2.17,2.17,0,0,0,.14-3.52A15.26,15.26,0,0,0,694,299.5c-7.9-3-17.5-4.07-25.74-1.85-3,.81-6.4,2.34-7.81,5.33-1.59,3.39-.11,7.33,2,10.14,5.32,7.07,15.51,7.58,23.52,6.37a51.28,51.28,0,0,0,8-1.91c1.83-.58,1-3.47-.8-2.89Z"
                            transform="translate(-620.79 -455.44)"
                        />
                    </g>
                </g>
            </g>

            {/* BOLA AZUL – que rueda sobre el verde */}
            <g className="blue-roll">
                <g>
                    <circle cx="0" cy="0" r="40" fill="#009ce0" />
                    <g transform="translate(-85, -58) scale(1.8, 1.8)">
                        <g transform="translate(-570.83, -191.84)">
                            {/* Visera - Ajustable con translate */}
                            <g transform="translate(0, 0)">
                                <line x1="569" y1="217" x2="640" y2="217" stroke="#222" strokeWidth="1.8" strokeLinecap="round" />
                            </g>
                            {/* Corona (Crown) - Ajustable con translate */}
                            <g transform="translate(1, 0)">
                                <path d="M594.3,217 L594.3,206 A 22.7,12 0 0 1 639.7,206 L639.7,217" fill="none" stroke="#222" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            {/* Botón superior - Ajustable con translate */}
                            <g transform="translate(0, -2)">
                                <circle cx="619" cy="194.5" r="1.5" stroke="#222" strokeWidth="1.4" fill="none" />
                            </g>
                        </g>
                    </g>
                    <circle cx="-30" cy="5" r="4" fill="#222" />
                    <circle cx="6" cy="5" r="4" fill="#222" />
                    <ellipse cx="-12" cy="8" rx="10" ry="4" stroke="#222" strokeWidth="3" fill="none" />
                </g>
            </g>

            {/* VERDE – acercado */}
            <g transform="translate(-20, 0)">
                <g style={{ transformOrigin: '282px 230px' }}>
                    <rect x="186" y="145" width="350" height="235" rx="24" fill="#99bc3d" />
                    <g transform="translate(65, 0)">
                        {[272, 288, 304, 320, 336, 352].map((cx, i) => (
                            <line
                                key={i}
                                className={`green-hair-strand green-hair-${i + 1}`}
                                x1={cx} y1="162" x2={cx} y2="130"
                                stroke="#222" strokeWidth="4" strokeLinecap="round"
                            />
                        ))}
                    </g>
                    <circle className="green-eye-left" cx="352" cy="218" r="5" fill="#222" />
                    <circle className="green-eye-right" cx="412" cy="218" r="5" fill="#222" />
                    <g transform="translate(382, 225)">
                        <path d="M -15 0 Q 0 15 15 0" stroke="#222" strokeWidth="4" fill="none" strokeLinecap="round" />
                    </g>
                </g>
            </g>

            {/* AMARILLO – Rediseñado */}
            {(() => {
                const AX = 295, AY = 490;
                return (
                    <g transform={`translate(${AX - 315}, ${AY - 392}) scale(0.66)`}>
                        <g style={{ transformOrigin: '315px 392px' }}>
                            <path d="M315 214 L426 298 L386 416 L244 416 L204 298 Z" fill="#324fa0" stroke="#324fa0" strokeWidth="20" strokeLinejoin="round" transform="translate(-15, 0)" />
                            <path d="M315 214 L426 298 L386 416 L244 416 L204 298 Z" fill="#ffc605" stroke="#ffc605" strokeWidth="20" strokeLinejoin="round" />
                            <circle cx="285" cy="300" r="6" fill="#222" />
                            <circle cx="345" cy="300" r="6" fill="#222" />
                            <ellipse cx="315" cy="305" rx="10" ry="5" stroke="#222" strokeWidth="5" fill="none" />
                            <g transform="translate(295, 215) scale(1.6)">
                                <path strokeWidth="3" fill="#222" d="M3.0,14.55 a13.78,13.78,0,0,1,2.07-6.3,10.79,10.79,0,0,1,3.8-3.46c.82-.46,2.7-1.61,3.69-1.08-.08,0,.07.14.13.48a6.33,6.33,0,0,1,0,1.22,16.24,16.24,0,0,1-.88,3.49,24.75,24.75,0,0,1-1.27,3c-.19.38-.4.75-.61,1.12-.05.08-.1.16-.16.24s-.09.14,0,0l-.12.13a1.25,1.25,0,0,1,.84-.32l1.06.44c.55.54.28.91.32.14,0-.25,0-.51.08-.77,0,.15.1-.45.15-.61a5.42,5.42,0,0,1,1-1.71,15,15,0,0,1,4.15-3.35,30.65,30.65,0,0,1,11.1-4,8.9,8.9,0,0,1,3.69.06c.12,0,.28.19.23.12.16.25-.06-.25,0-.13,0,.36,0,.05,0,0a.71.71,0,0,1,0,.29c-.08.33.13-.4,0,.07,0,.19-.34,1-.19.66a15.45,15.45,0,0,1-1.73,2.86c-3.35,4.59-7.7,8.54-11.85,12.38-1.42,1.32.7,3.43,2.12,2.12A115.51,115.51,0,0,0,31.19,10.83a19.54,19.54,0,0,0,3.76-5.84,3.51,3.51,0,0,0-.58-3.69c-1.82-1.82-5.27-1.25-7.51-.84a34.71,34.71,0,0,0-10.34,3.72c-2.82,1.55-5.88,3.69-7.11,6.79-.49,1.23-1.05,3.6,0,4.65,1.26,1.26,2.53-.12,3.17-1.18a20.28,20.28,0,0,0,3.12-9.64c0-1.8-.72-3.62-2.65-4-2.41-.53-5.19,1-7.07,2.35a15.25,15.25,0,0,0-6,11.47c-.14,1.93,2.86,1.92,3,0Z" />
                            </g>
                        </g>
                    </g>);
            })()}

            {/* BANDEJA + bolas – acercada */}
            <g transform="translate(-20, 0)">
                <g style={{ transformOrigin: '282px 336px' }}>
                    <rect x="150" y="316" width="340" height="55" rx="8" fill="white" />
                    <rect x="156" y="322" width="328" height="43" rx="5" fill="none" stroke="#222" strokeWidth="4" />
                    {[230, 320, 410].map((cx, i) => (
                        <g key={i}>
                            <circle
                                className="tray-ball-shadow"
                                cx={cx + 3} cy="361" r="11"
                                fill="rgba(0,0,0,0.15)"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                            <circle
                                className="tray-ball"
                                cx={cx} cy="354" r="11"
                                fill="#3050A0"
                                style={{ animationDelay: `${i * 0.2}s` }}
                            />
                        </g>
                    ))}
                    <g transform="translate(105, 0)">
                        <path d="M 175 315 C 195 305, 205 320, 192 334" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                    </g>
                    <g transform="translate(25, 0)">
                        <path d="M 155 372 Q 180 370, 192 350" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                    </g>
                    <g transform="translate(37, 0)">
                        <path d="M 500 250 C 580 250, 560 340, 453 339" fill="none" stroke="#222" strokeWidth="4" strokeLinecap="round" />
                    </g>
                </g>
            </g>

        </svg>
    );
}

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────── */
export default function LoadingScreen({ onDone }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(1);
    const [exploding, setExploding] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        // En lugar de incrementar poco a poco, saltamos al 100% casi de inmediato
        timer.current = setTimeout(() => {
            setProgress(100);
        }, 100);
        return () => clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        if (progress >= 100 && phase === 1) {
            // Tiempos originales
            // setTimeout(() => setExploding(true), 250);
            // setTimeout(() => { setPhase(2); setExploding(false); }, 1350);
            // setTimeout(() => setFadeOut(true), 4500); 
            // setTimeout(() => onDone?.(), 5000); 

            // Fase 1 extendida a 2.5 minutos
            setTimeout(() => setExploding(true), 50); // Casi al final de los 2.5 minutos
            setTimeout(() => { setPhase(2); setExploding(false); }, 250); // 2.5 minutos

            // Fase 2 dura otros 2.5 minutos (total = 300,000 ms = 5 min)
            setTimeout(() => setFadeOut(true), 299000);
            setTimeout(() => onDone?.(), 300000);
        }
    }, [progress, phase, onDone]);

    const stage = getStage(progress);

    return (
        <div className={`ls-overlay${fadeOut ? ' ls-fadeout' : ''}`}>
            {phase === 1 && (
                <div className={`ls-phase1${exploding ? ' ls-explode' : ''}`}>
                    <ThermoSVG progress={progress} />
                    <div className="ls-percent" style={{ color: stage.bulb }}>
                        {Math.round(progress)}%
                    </div>
                    <div className="ls-cargando">cargando</div>
                </div>
            )}
            {phase === 2 && (
                <div className="ls-phase2">
                    <Phase2SVG />
                    <div className="ls-phase2-label">
                        Preparando tu panel&nbsp;
                        <span className="ls-dots">
                            <span>.</span><span>.</span><span>.</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
