import React, { useState, useEffect, useRef } from 'react';
import './LoadingScreen.css';

/* ─────────────────────────────────────────────
   ETAPAS (Colores para el Círculo Zen)
   Basado en la imagen: Rojo, Naranja, Amarillo, Púrpura oscuro
───────────────────────────────────────────── */
const ZEN_COLORS = {
    celeste: '#6FBBB9',
    blue: '#648688',
    green: '#B9D2B1',
    yellow: '#FFEA00',
    orange: '#FFB74D',
    pink: '#E7AFB5',
    red: '#FF1744',
    purple: '#4A148C'
};

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

function ZenCircleSVG({ progress }) {
    const size = 300;
    const center = 15.795; // Half of 31.59
    const middle = 16.68;  // Half of 33.36
    const radius = 13.5;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const brushStartAngle = -64; // Empezar justo arriba para asegurar que sea "lo más atrás" posible
    const conicGradient = `conic-gradient(
        from ${brushStartAngle + 90}deg,
        ${ZEN_COLORS.celeste} 0%,
        ${ZEN_COLORS.blue} 15%,
        ${ZEN_COLORS.green} 30%,
        ${ZEN_COLORS.yellow} 45%,
        ${ZEN_COLORS.orange} 60%,
        ${ZEN_COLORS.pink} 75%,
        ${ZEN_COLORS.red} 90%
    )`;

    return (
        <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg viewBox="0 0 31.59 33.36" className="zen-svg" style={{ width: '100%', height: '100%' }}>
                <defs>
                    <mask id="brushRevealMask">
                        <circle
                            cx={center}
                            cy={middle}
                            r={radius}
                            fill="none"
                            stroke="white"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={offset}
                            transform={`rotate(${brushStartAngle}, ${center}, ${middle})`}
                            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                        />
                    </mask>

                    {/* Mask for the brush itself */}
                    <mask id="brushShapeMask">
                        <g transform="translate(-544.59 -370.38)">
                            <path fill="white" d="M568.46,374.77l.09.06.07,0Z" />
                            <path fill="white" d="M569.16,375.21c.13.07.27.16.2.1l-.29-.17-.17-.1-.22-.13.49.3S569.17,375.21,569.16,375.21Z" />
                            <path fill="white" d="M575.51,385v0Z" />
                            <path fill="white" d="M574.81,392.19c0-.06,0-.08,0-.09S574.8,392.19,574.81,392.19Z" />
                            <path fill="white" d="M574.18,393.27l0-.06A.08.08,0,0,0,574.18,393.27Z" />
                            <path fill="white" d="M575.51,385v.2S575.52,385.06,575.51,385Z" />
                            <path fill="white" d="M570.53,376.15l-.09-.06.08.06Z" />
                            <polygon fill="white" points="29.98 11.47 29.96 11.42 29.91 11.39 29.98 11.47" />
                            <path fill="white" d="M573.42,379.65a.13.13,0,0,0,.11,0,.19.19,0,0,1-.1-.08A.06.06,0,0,0,573.42,379.65Z" />
                            <path fill="white" d="M570.92,376.57l-.06-.05Z" />
                            <path fill="white" d="M575.12,383.55l0,0Z" />
                            <path fill="white" d="M557.78,370.64l0,.1C557.8,370.68,557.8,370.64,557.78,370.64Z" />
                            <polygon fill="white" points="16.59 2.61 16.55 2.65 16.55 2.96 16.59 2.61" />
                            <path fill="white" d="M572.9,395.1h0S572.9,395.07,572.9,395.1Z" />
                            <path fill="white" d="M555.28,399.66c.08.34-.49.14-.31.56C555,400.1,555.45,399.94,555.28,399.66Z" />
                            <path fill="white" d="M570.58,376.19l.08.06Z" />
                            <path fill="white" d="M555,400.22h0l0,0Z" />
                            <path fill="white" d="M569.4,398.73a.12.12,0,0,0,.09,0Z" />
                            <path fill="white" d="M572.38,396.34l-.08.06Z" />
                            <path fill="white" d="M567.86,400c-.05,0-.08,0-.13,0l0,0S567.8,400,567.86,400Z" />
                            <path fill="white" d="M566,400.79s0,0,0,0l0,0Z" />
                            <path fill="white" d="M551.08,374.14a2,2,0,0,1,.36.29C551.19,374.17,551.41,373.84,551.08,374.14Z" />
                            <path fill="white" d="M570.53,376.16l.05,0-.06,0Z" />
                            <path fill="white" d="M568.56,401.49l-.34.14A2.23,2.23,0,0,0,568.56,401.49Z" />
                            <path fill="white" d="M545,389.64l-.06-.08S545,389.62,545,389.64Z" />
                            <path fill="white" d="M567.26,402.15a.61.61,0,0,0-.25-.06.14.14,0,0,0,0,.07Z" />
                            <path fill="white" d="M551.44,374.43Z" />
                            <path fill="white" d="M553,372c-.36.17.15.67.27,1.05-.28.4-.42-.32-.72-.54-.16.31,0,.95-.2,1-.07-.08-.13-.1-.16-.24,0,.59-.71.52-.59,1.27a.69.69,0,0,1-.13-.11,4.75,4.75,0,0,1,.58.7c-.12.1,0,.5-.28.19.08,0,0-.18-.07-.32v.25c-.5-.4.05-.31-.23-.67-.14.37-.13,1-.41,1-.43-.42.32-.53-.28-.73l.45-.06c-.82-.56.24-.1-.61-.72-.54.2-.27.63-.77.86.13.33.35.34.49.66-.11.92-1.47-.67-1.28.31.18.38.69.92.15.94l-.4-.54c-.38.35.52.83-.15.95-.15-.24.09-.44,0-.43-.62-.07.12.42,0,.62l-.48-.31c-.24.52-.29,1.21-.48,1.78-.13-.12-.22-.31-.44-.28a2.15,2.15,0,0,1-.56,1.05,9,9,0,0,1-.86.89l.31.44c0,.06-.24,0-.3-.07-.27.2.27.13.39.33s-.32.1-.42,0c.22.64.31,1.6-.25,2l-.1-.13c-.28.36.79.68.3.93l-.07-.09a3.85,3.85,0,0,0-.26,1.29,1.9,1.9,0,0,1-.51,1.13c.62.16-.3.87.56.94-.44.49-.57.35-.81,1.07,0,.2.55.26.65.48l-.44,0,.48.27-.49.22.15.21a.32.32,0,0,1,.29-.21c.25.31-.16.86-.38.91.18.25.33.49.52.73-.17,0-.27-.1-.39-.19.52.34-.43.17.07.48.08-.08.25,0,.34,0-.2.25-.07.69.12,1l-.29,0a10.58,10.58,0,0,0,.83,1.79c0-.27.49-.4.62-.25l-.36.24c.3,0,.06-.24.47-.14.06.23-.37.35-.56.27l.27.21c-.11.07-.2,0-.36.09.3,0-.13.66.36.62l-.1.08a9.75,9.75,0,0,0,1,1.24c.31-.19.36,0,.68,0a3.54,3.54,0,0,0,.52,1.25c.35.16.29-.11.54-.12-.23.22.13.55-.21.51a3.93,3.93,0,0,0,1.24.83c0-.14,0-.23.11-.27s.13.28,0,.37h0c.46.1.64.57.87,1s.51.8,1,.74h0c.24,0,.49.07.74.1.24.19-.28.08-.17.34.87,0,1,.65,1.65.61,0,.45.42.62.85.73s.88.15,1.1.49l0-.19c.21-.12.15.17.25.23,0-.13-.12-.2,0-.26,1.36.12,2.68.86,4.12,1,.52,0,.3-.81.93-.46l-.17.31a4.61,4.61,0,0,1,1.54-.29,5,5,0,0,0,1.49-.39c-.05.07,0,.15-.13.17.25.17.76-.2.72-.35.16,0,.07.13.19.19s.44-.39.6-.24,0,.08-.07.11c.11-.12.61-.19.42-.36.38,0,.63-.35,1-.34.09-.28.62-.16.54-.49.12.33.7-.05.83-.3,0,.13.23,0,.21.17.24-.14.41-.34.29-.45.61.06.66-.79,1.15-.54.53-.63,1-1.16,1.48-1.71.18.24-.54.56-.32.78a7,7,0,0,1,1-1.43c.14-.11,0,.15,0,.23.35-.59.88-1,1.09-1.54,0,0,0,.09,0,.15.06-.1.18-.2.08-.26l0,.11c-.25,0,0-.59-.09-.65.17.35.41-.41.58.08,0-.08,0-.19,0-.22s.13-.09.14.06c.16-.4,0-.33.17-.66,0,0,0,.11.07.18a1,1,0,0,1,.2-.69s.08,0,0,.1c.25-.48.15-.95.5-1.44.13.25.15-.15.33-.11l.06-.32-.13.08c.09-.26.05-.54.19-.74v.22l.14-.51-.16.26c0-.29-.23-.05-.06-.37,0,.07.09-.26.21-.38h0a.76.76,0,0,1,0-.48c.07,0,.17.09.22.06-.11-.16.12-.64,0-.84,0,.07.11.09.13.07l-.1-.13c.06-.12.08-.14.14-.1.07-.38-.22.08-.07-.36a.41.41,0,0,1,0,.1,12.17,12.17,0,0,0,.13-1.3c.15-.11,0,.38.15.25,0-.6-.07-1.28-.11-1.86v.11c-.19-.08.08-.44,0-.73,0,.07.11.08.09.07a6.79,6.79,0,0,0-.29-1.41l.06.07a5.43,5.43,0,0,0-.14-.87c0-.07-.08-.21-.12-.11a2.35,2.35,0,0,0-.26-1.1,4.84,4.84,0,0,1-.35-1c0,.08.1.18.07.11l-.25-.54c0,.07,0,.09,0,.22a1.73,1.73,0,0,1-.21-.33c.15.22.08,0,0-.16s0,0,0,0c-.06-.32-.12,0-.24-.41h0a3.89,3.89,0,0,1-.25-.4c0-.08.1.14.14.13a3.12,3.12,0,0,1-.37-.58l.19.29a1.45,1.45,0,0,0-.17-.41v0c-.06-.13-.13-.24-.2-.36l.05.1c-.28-.19-.34-.51-.65-.79.29.28.07,0,.13,0s-.14-.23-.1-.2c-.15-.13-.17-.27-.38-.45,0,0-.13-.16-.08-.14-.17-.19,0,.05,0,.05a11.15,11.15,0,0,0-1-1.07c-.34-.33-.43-.35-.76-.64-.1-.11.11.06.11.06a3.21,3.21,0,0,0-.49-.42s0,0,0-.06a1.85,1.85,0,0,1-.29-.21l.15.1c-.17-.13-.33-.26-.52-.38,0,0,.12.07.18.11l-.6-.4.13.1c-.07,0,0,0,0,0a2.34,2.34,0,0,1,.26.19l-.13-.09.75.57-.11-.06.26.18c.05.05.08.09,0,0a2.81,2.81,0,0,1,.3.26s0,0,0,0l.17.14s0,0-.09,0c.27.28.49.41.57.54l0,0c.39.39.06,0,.37.29l.13.26h.06c0,.05.11.14.09.13.15.14,0,0,.08,0s.5.56.48.66-.14-.23.06,0c0,.11.21.27.32.49-.07,0-.19-.24-.08,0s.27.4.38.58c.05,0,.28.36.46.66,0,0,.29.59.39.91h0c.09,0,.22.34.34.56-.05,0-.09,0-.16-.14l.09.21a.57.57,0,0,1,.15.24l-.08,0a5,5,0,0,1,.37.94c.07,0,.07-.36.24,0,0,0-.08,0-.13-.05a.68.68,0,0,1,.08.19l-.11-.14c0,.18.07.08.11.21s0,.12,0,.11,0-.13,0-.17a1.17,1.17,0,0,1,0,.42s.06,0,.1.09c.08.3,0,.12,0,.3s0,.26.14.25,0,.11,0,.15.14.72.2.53v0h0a7.73,7.73,0,0,1,.18,1.58h0a6.29,6.29,0,0,0,.13.89c0,.1-.06.22-.11.18a1.13,1.13,0,0,1,0,.6c0-.24-.06.08,0-.24a1.23,1.23,0,0,0,0,.69c-.09-.11-.14.22-.12.36l.09-.2a1.56,1.56,0,0,1-.05.44l-.12-.09c-.28.57.12,1.15-.29,1.54.06.18.16-.3.24-.14-.09.28-.38.51-.4.59-.19.35.11.41-.05.78.06,0,.23,0,.17.27s-.35.25-.33.07,0-.09.07-.08,0-.21-.06-.13l0,.06c-.11.11-.25.47-.3.35,0,.22,0,.12.14,0-.22.31-.2.53-.41.85.06,0,.15-.06.12,0-.31.46,0,.26-.14.61-.18.14-.17-.17-.27.2-.16.17-.17,0-.17-.14,0,.36-.37.51-.5.66l0-.18a.73.73,0,0,1-.13.25l.17,0c-.08.08-.12.15-.17.12,0,.13.23,0,.22.28-.13.08-.17.4-.34.35.28-.34-.18-.06,0-.38a.46.46,0,0,1-.15.21s0,0,0-.06c-.36.26.07.28-.2.61-.05-.1-.22,0-.25,0,.11-.13.19,0,.16.21-.24.17-.14.28-.23.39l.13-.11c0,.11,0,.21-.14.39-.08,0,.06-.18,0-.15,0,.3-.47.25-.58.55-.15.05-.16-.13-.28-.08-.13.34-.36.16-.52.48.18,0,.18,0,.09.28a3.82,3.82,0,0,0,.33-.49l-.09.43c.12-.13.18-.34.27-.4,0,.22,0,.18.1.2-.32,0-.23.45-.55.52l-.26-.28c-.43.13-.41.65-.91.89l.19,0c0,.16-.26.21-.36.36-.07-.12-.19-.09-.3-.12.07.08-.32.22-.2.48l-.31,0c-.41.15-.21.59-.6.76,0-.19-.19-.19,0-.42-.12.07-.24.1-.19.19-.12,0-.24.37-.43.3,0,.08,0,.22-.12.28a.09.09,0,0,1,0-.07c0,.07-.18.2,0,.29a.94.94,0,0,0-.84.16c-.27.12-.54.24-.78.1a3.75,3.75,0,0,1-.87.4c0-.05,0-.08,0-.08-.41-.05-.11.51-.58.45-.28-.2.19-.19,0-.26-.18-.52-.49.22-.84-.07l.06,0c-.25-.16-.5.28-.87.29a.24.24,0,0,0,0-.09,1.69,1.69,0,0,1-1,.55c.1-.24.16-.13.08-.36-.16,0,.07.37-.25.45-.11-.12-.35-.22-.38-.47l.29,0c-.15-.32-.37,0-.53,0l0-.14c-.44,0-.46.38-.95.32l0,.11c-.3.35-.21-.22-.5,0l0-.38a4.27,4.27,0,0,1-1,.28,2.84,2.84,0,0,1,.85-.46c-.16,0-.57-.07-.69.1.07,0,.17-.1.23,0a1,1,0,0,1-.91.29c.22-.72-.84-.43-.91-1.07-.65.07-1.07-.51-1.68-.78-.05.69-.19-.07-.43.53-.16,0-.22-.07-.21-.12l-.27-.57c0-.22.21-.06.26-.2-.28-.2,0-.31-.1-.58-.07.23-.26.23-.38,0l.08.42c-.6,0-.06-.71-.65-.67l.24-.1c-.29,0-.7-.55-1.24-.25,0-.09.09-.28.2-.25a3,3,0,0,0-.85-.45c-.3-.14-.6-.28-.63-.58l.15-.09c-.1,0-.36.09-.32-.14.06-.05.16-.09.13-.14s-.42,0-.44-.19l.23,0c-.2-.58-.93-.37-1.34-.71a1,1,0,0,0,.29-1l.07,0c-.25-.61-1-.73-1.41-1.22.37-.61-.24-1.34-.09-2a.47.47,0,0,1-.53,0c.09-.17-.49-.29,0-.41v.06c.49-.25.29-.49.26-.72l-.72.12a.84.84,0,0,0,.16-1.13c-.17-.34-.31-.67.19-.87-.19-.13-.2-.31-.39-.45h.41a2.68,2.68,0,0,0,.1-1.08l.29.11c.06-.26-1.17-.41-1.18-.69l.63,0c.06-.5.72-.87.23-1.45.1,0,.27.08.28.16.07-.22.68-.72-.22-.87.58.15.17-.47,0-.8l.4.17c-.44-.38-.58-.44-.61-.8.08-.06.35.06.21.11.31-.15-.32-.33,0-.54l.22.21c.13-.23,0-.26-.25-.53s.33-.41.71-.26c-.21-.14-.44-.42-.26-.51a.43.43,0,0,1,.23.2c.45-.25-.13-.83.41-.87a.56.56,0,0,0,.26.1c-.19.28-.36.51-.38.47.37.2.58,0,1,.47-.16-.32-.55-1-.24-1.11l.14,0,0,.05c.07,0,.06-.1,0-.18a.67.67,0,0,0,.24-.1c.31.17.34-.13.44-.22-.39-.27-.21-.37-.63-.47,0,0,0,.05,0,.14s0,.05,0,.07l0,0c0,.08-.11.18-.18.29-.13-.22-.22-.43.08-.4-.2-.23-.4-.49-.49-.61.65.23,1.16.17,1.5.39.08-.47.53-.79.06-1.64,0-.17.29.09.43.16s-.06.16,0,.28c0-.33.46-.53.08-1.05.42,0,.26.56.51.2l.09.19c.63.11.63-.36.69-.88s.18-1,1-.68a.42.42,0,0,1-.22-.15,1.34,1.34,0,0,0,.78-.25,5.81,5.81,0,0,0,.69-.45,1.48,1.48,0,0,1,1.61-.26c.33.1.22-.33.31-.7l.22.54.13-.71c.34-.6,1,1.2,1.4.23l-.14-.38c.21,0,.61-.33.63.13,0-.07,0-.42.12-.22l0,.3c.14-.2.29-.37.45-.56.4.22,0,1.24.56,1.29a1.92,1.92,0,0,0,.47-1.14c-.08,0-.21-.19-.23-.51l.2-.17c0-.93.23-1.9-.36-2.51l-.38.59-.15-.44.34-.05c-.21-.41-.32,0-.44.24a.86.86,0,0,0-.2-.48l-.31.91c-.08-.36.11-.73-.18-.9-.14.42.25.78,0,1.08-.23-.38-.22-.73-.39-.34a.58.58,0,0,1,0-.5c-.16.31-.51.21-.53.7-.28-.46-.63.25-.77-.59,0,.2-.21.74-.37.82.09-1.08-.67.12-.86-.94a.72.72,0,0,1-.42.74c-.22.14-.47.24-.59.55,0-.07,0-.23,0-.2-.25,0-.41-.2-.62-.3.23.7-.06,1-.07,1.48-.54-.51-.17-.87-.51-1.45.23.54-.25.79.05,1.18-.39-.29-.26-.1-.63-.59.36.84-.13.24-.05.82-.49-.24-.46-.71-.66-.29C552.82,372.4,553,372,553,372Zm-5.23,7h0l.06-.17Zm-.35.61a1.3,1.3,0,0,0,.17-.26c.15.07.28.17.23.23S547.56,379.58,547.39,379.61Zm3.43.62c0,.11-.1.08-.18,0a1,1,0,0,0,.05-.16l0,0Z" />
                            <path fill="white" d="M550.42,379.75a.43.43,0,0,0,0-.05l-.12,0,.1.11Z" />
                            <path fill="white" d="M575.51,384.87h0v0Z" />
                            <polygon fill="white" points="0.12 18.49 0.22 18.48 0.12 18.42 0.12 18.49" />
                            <path fill="white" d="M574.68,381.43s0,0,0,0Z" />
                            <path fill="white" d="M574,380.07a1.14,1.14,0,0,0-.1-.19Z" />
                            <path fill="white" d="M573.34,379.07h0Z" />
                            <path fill="white" d="M573.31,397l0,0C573.25,397.11,573.28,397.05,573.31,397Z" />
                            <path fill="white" d="M575.49,391.7a1.36,1.36,0,0,1,0,.2C575.54,391.8,575.56,391.73,575.49,391.7Z" />
                            <polygon fill="white" points="24.01 31.09 24.01 31.09 23.97 31.1 24.01 31.09" />
                            <path fill="white" d="M575.43,392.15a.43.43,0,0,0,.08-.25A2.41,2.41,0,0,0,575.43,392.15Z" />
                            <polygon fill="white" points="25.1 5.15 25.05 5.11 25.05 5.11 25.1 5.15" />
                            <path fill="white" d="M569.63,375.49l0,0Z" />
                            <path fill="white" d="M569.47,375.39l.11.07Z" />
                            <path fill="white" d="M570.92,376.47h0Z" />
                            <path fill="white" d="M571.28,376.79c-.08-.08-.2-.2-.32-.3h0C571,376.52,571.19,376.73,571.28,376.79Z" />
                            <path fill="white" d="M572.53,378.31l-.24-.31c0,.06.08.14,0,0C572.54,378.42,572.21,377.91,572.53,378.31Z" />
                            <path fill="white" d="M573.24,379.31c-.13-.17,0,0,0,0S573.31,379.45,573.24,379.31Z" />
                            <path fill="white" d="M575.66,387.6l-.1,0C575.57,387.74,575.6,387.58,575.66,387.6Z" />
                            <polygon fill="white" points="31.47 18.94 31.56 18.78 31.47 18.7 31.47 18.94" />
                            <polygon fill="white" points="30.56 19.81 30.56 19.73 30.55 20 30.56 19.81" />
                            <path fill="white" d="M566.23,400.49l.14.22C566.45,400.63,566.37,400.37,566.23,400.49Z" />
                            <path fill="white" d="M560.27,401.55c0-.15-.21-.26-.33-.12C560.07,401.46,560.2,401.58,560.27,401.55Z" />
                            <polygon fill="white" points="3.86 19.7 4.01 19.78 3.87 19.59 3.86 19.7" />
                        </g>
                    </mask>

                    <filter id="brushBloom" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Background "Ghost" Circle */}
                <g opacity="0.05" transform="translate(-544.59 -370.38)">
                    {/* Render the same paths but in light gray to give a "ghost" effect of the final shape */}
                    <g fill="#000">
                        {/* We can re-use the same paths here if we wanted, but keeping it light for now */}
                    </g>
                </g>

                {/* The actual animated brush stroke */}
                <foreignObject
                    mask="url(#brushShapeMask)"
                    x="0" y="0" width="31.59" height="33.36"
                >
                    <div style={{
                        width: '100%',
                        height: '100%',
                        background: conicGradient,
                        mask: 'url(#brushRevealMask)',
                        WebkitMask: 'url(#brushRevealMask)',
                        borderRadius: '50%'
                    }} />
                </foreignObject>
            </svg>

            {/* Texto de porcentaje Mejorado - HTML para evitar distorsión de SVG */}
            <div style={{
                position: 'absolute',
                top: '49%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pointerEvents: 'none'
            }}>
                <span style={{
                    fontSize: '2.8rem',
                    fontWeight: '700',
                    fontFamily: 'Outfit, sans-serif',
                    color: (() => {
                        const p = progress;
                        if (p < 15) return ZEN_COLORS.celeste;
                        if (p < 30) return ZEN_COLORS.blue;
                        if (p < 45) return ZEN_COLORS.green;
                        if (p < 60) return ZEN_COLORS.yellow;
                        if (p < 75) return ZEN_COLORS.orange;
                        if (p < 90) return ZEN_COLORS.pink;
                        return ZEN_COLORS.red;
                    })(),
                    transition: 'color 0.4s ease',
                    letterSpacing: '-2px',
                    lineHeight: '1'
                }}>
                    {Math.round(progress)}%
                </span>
            </div>
        </div>
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
            <g transform="translate(60, 0)">
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
            {/* ROJO – órbita tipo planeta */}
            <g transform="" className="orbit-spin relative rounded-2xl overflow-hidden">

                {/* Distancia desde el centro → radio de la órbita */}
                <g transform="translate(0 0)" className='red-spin'>

                    {/* <g fill="#fd312d">
                        <g transform="translate(-50, -175) scale(11.5)">
                            <path transform="translate(-568.24, -179.44)" d="M592.24,209.45c-7.81-.35-7.79-11.65,0-12,11.54-.52,11.61-18.52,0-18-13.09.58-23.87,10.52-24,24s11.09,23.42,24,24c11.59.52,11.56-17.48,0-18Z" />
                            <rect x="21" y="0.25" width="11.55" height="17.50" rx="3.57" stroke="#fd312d" strokeWidth="0.5" />
                            <rect x="21" y="30.29" width="11.55" height="17.50" rx="3.57" stroke="#fd312d" strokeWidth="0.5" />
                        </g>
                    </g> */}

                    <g transform="translate(0,0)" className=''>
                        <path className=''
                            d="M -150 0 A 150 150 0 0 1 150 0"
                            fill="none"
                            stroke="#fd312d"
                            strokeWidth="200"
                        />

                        {/* <circle cx="75" cy="0" r="25" fill="#fd312d" />
                        <circle cx="225" cy="0" r="25" fill="#fd312d" /> */}
                        <rect
                            x="50"
                            y="-25"
                            width="200"
                            height="50"
                            rx="20"
                            ry="20"
                            fill="#fd312d"
                        />

                        <rect
                            x="-250"
                            y="-25"
                            width="200"
                            height="50"
                            rx="20"
                            ry="20"
                            fill="#fd312d"
                        />


                    </g>

                    {/* Cara kawaii */}
                    <g transform="translate(-100, 100)" className='face-rotating rotate-90'>
                        <circle cx="23" cy="-220" r="5" fill="#222" />
                        <circle cx="90" cy="-220" r="5" fill="#222" />

                        <g transform="translate(56, -205) ">
                            <path
                                d="M -15 -10 Q 0 10 15 -10"
                                stroke="#222"
                                strokeWidth="4.5"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </g>

                        <g transform="translate(-32, -85) scale(1.20) ">
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
                        <path d="M315 214 L426 298 L386 416 L244 416 L204 298 Z" fill="#324fa0" stroke="#324fa0" strokeWidth="20" strokeLinejoin="round" transform="translate(-15, 0)" />
                        <path d="M315 214 L426 298 L386 416 L244 416 L204 298 Z" fill="#ffc605" stroke="#ffc605" strokeWidth="20" strokeLinejoin="round" />

                        {/* Rostro Animado (Ojos, Boca, Pelo) */}
                        <g className="poli-anim" style={{ transformOrigin: '315px 300px' }}>
                            {/* Ojos */}
                            <circle cx="285" cy="300" r="6" fill="#222" />
                            <circle cx="345" cy="300" r="6" fill="#222" />

                            {/* Boca */}
                            <path className="poli-mouth-anim"
                                d="M 300 305 Q 315 315 330 305"
                                stroke="#222" strokeWidth="5" fill="none" strokeLinecap="round" />

                            {/* Pelo */}
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

export default function LoadingScreen({ onDone }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(1);
    const [exploding, setExploding] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const timer = useRef(null);

    useEffect(() => {
        // Fase de Carga Única: Progreso hasta 100% en 5 segundos
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "auto"
        });

        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }

        const start = Date.now();
        const duration = 6000;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - start;
            const p = Math.min(100, (elapsed / duration) * 100);

            setProgress(p);

            if (p < 100) {
                timer.current = requestAnimationFrame(animate);
            }
        };

        timer.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(timer.current);
    }, []);

    useEffect(() => {
        if (progress >= 100 && phase === 1) {
            // Transición a Fase 2
            setTimeout(() => setExploding(true), 150);
            setTimeout(() => {
                setPhase(2);
                setExploding(false);
            }, 850);

            // Fase 2 dura 4.5 segundos reales (total ~10s)

            setTimeout(() => setFadeOut(true), 4500);
            setTimeout(() => onDone?.(), 5200);
            setTimeout(() => {
                document.body.style.overflow = "inherit";
                window.scrollTo(0, 0);

                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto"
                });

                if ("scrollRestoration" in history) {
                    history.scrollRestoration = "manual";
                }
            }, 4500);
        }
    }, [progress, phase, onDone]);

    return (
        <div className={`ls-overlay${fadeOut ? ' ls-fadeout' : ''}`}>
            {phase === 1 && (
                <div className={`ls-phase1${exploding ? ' ls-explode' : ''}`}>
                    <ZenCircleSVG progress={progress} />
                    <div className="ls-cargando lg:text-3xl!">Conectando con tu espacio</div>
                </div>
            )}
            {phase === 2 && (
                <div className="ls-phase2">
                    <div className='relative top-16 flex flex-wrap justify-center items-start w-full gap-8'>
                        <div className='w-full flex flex-wrap justify-center'>
                            <div className='relative *:relative *:left-30 scale-50 lg:scale-none'>
                                <Phase2SVG />
                                <div className="ls-phase2-label left-0! w-full text-center visible  mt-10">
                                    <span className='opacity-70 text-3xl'>Preparando todo</span>&nbsp;
                                    <span className="ls-dots">
                                        <span>.</span><span>.</span><span>.</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
