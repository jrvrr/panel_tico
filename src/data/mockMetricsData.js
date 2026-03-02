/**
 * Datos mock de métricas del videojuego terapéutico TDO.
 * Cada paciente tiene 8 semanas de datos (4 anteriores + 4 actuales)
 * con métricas específicas por juego:
 *
 * 🫧 Reventar Burbujas:
 *   - tiempoReaccion (ms)       → promedio para reventar cada burbuja
 *   - precision (0-100)         → % burbujas reventadas correctamente
 *   - burbujasReventadas        → total reventadas en la semana
 *   - nivelAlcanzado            → nivel máximo alcanzado
 *   - rabietas                  → veces que abandonó por frustración
 *
 * 🧩 Laberinto:
 *   - tiempoCompletado (seg)    → segundos promedio para completar
 *   - intentosFallidos          → veces que chocó / se perdió
 *   - nivelesCompletados        → laberintos completados en la semana
 *   - retrocesos                → veces que retrocedió en el camino
 *   - abandonos                 → veces que abandonó el laberinto
 *
 * 🎈 Reventar Globos por Colores:
 *   - aciertos                  → globos del color correcto reventados
 *   - erroresColor              → globos del color incorrecto reventados
 *   - tiempoReaccion (ms)       → promedio para reventar
 *   - precisionColor (0-100)    → % aciertos vs total intentos
 *   - rachaMaxima               → máxima racha de aciertos consecutivos
 */

export const pacientesMetrics = [
    {
        id: 1,
        nombre: 'Cristhian',
        edad: '12 años',
        tutor: 'Jane Cooper',
        ultimaSesion: '2026-02-28',
        semanas: [
            // ── 4 semanas anteriores ──
            { semana: 1, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 820, precision: 70, burbujasReventadas: 40, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 6, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 28, erroresColor: 14, tiempoReaccion: 980, precisionColor: 67, rachaMaxima: 4 } },
            { semana: 2, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 790, precision: 73, burbujasReventadas: 44, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 190, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 30, erroresColor: 12, tiempoReaccion: 960, precisionColor: 71, rachaMaxima: 5 } },
            { semana: 3, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 760, precision: 76, burbujasReventadas: 48, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 175, intentosFallidos: 4, nivelesCompletados: 3, retrocesos: 7, abandonos: 0 }, globosColores: { aciertos: 33, erroresColor: 10, tiempoReaccion: 930, precisionColor: 77, rachaMaxima: 6 } },
            { semana: 4, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 740, precision: 78, burbujasReventadas: 50, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 165, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 6, abandonos: 0 }, globosColores: { aciertos: 35, erroresColor: 9, tiempoReaccion: 900, precisionColor: 80, rachaMaxima: 7 } },
            // ── 4 semanas actuales ──
            { semana: 5, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 710, precision: 82, burbujasReventadas: 55, nivelAlcanzado: 5, rabietas: 0 }, laberinto: { tiempoCompletado: 150, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 5, abandonos: 0 }, globosColores: { aciertos: 38, erroresColor: 7, tiempoReaccion: 870, precisionColor: 84, rachaMaxima: 8 } },
            { semana: 6, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 690, precision: 85, burbujasReventadas: 58, nivelAlcanzado: 5, rabietas: 0 }, laberinto: { tiempoCompletado: 140, intentosFallidos: 2, nivelesCompletados: 4, retrocesos: 4, abandonos: 0 }, globosColores: { aciertos: 40, erroresColor: 6, tiempoReaccion: 840, precisionColor: 87, rachaMaxima: 9 } },
            { semana: 7, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 670, precision: 88, burbujasReventadas: 62, nivelAlcanzado: 6, rabietas: 0 }, laberinto: { tiempoCompletado: 130, intentosFallidos: 2, nivelesCompletados: 4, retrocesos: 3, abandonos: 0 }, globosColores: { aciertos: 42, erroresColor: 5, tiempoReaccion: 810, precisionColor: 89, rachaMaxima: 10 } },
            { semana: 8, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 650, precision: 90, burbujasReventadas: 65, nivelAlcanzado: 6, rabietas: 0 }, laberinto: { tiempoCompletado: 120, intentosFallidos: 1, nivelesCompletados: 5, retrocesos: 2, abandonos: 0 }, globosColores: { aciertos: 44, erroresColor: 4, tiempoReaccion: 780, precisionColor: 92, rachaMaxima: 12 } },
        ],
    },
    {
        id: 2,
        nombre: 'Mario',
        edad: '10 años',
        tutor: 'Wade Warren',
        ultimaSesion: '2026-02-27',
        semanas: [
            { semana: 1, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 920, precision: 58, burbujasReventadas: 30, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 260, intentosFallidos: 8, nivelesCompletados: 1, retrocesos: 14, abandonos: 2 }, globosColores: { aciertos: 20, erroresColor: 18, tiempoReaccion: 1100, precisionColor: 53, rachaMaxima: 3 } },
            { semana: 2, frecuenciaSemanal: 3, cancelaciones: 0, burbujas: { tiempoReaccion: 900, precision: 60, burbujasReventadas: 32, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 250, intentosFallidos: 7, nivelesCompletados: 1, retrocesos: 13, abandonos: 2 }, globosColores: { aciertos: 22, erroresColor: 16, tiempoReaccion: 1080, precisionColor: 58, rachaMaxima: 3 } },
            { semana: 3, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 880, precision: 63, burbujasReventadas: 35, nivelAlcanzado: 2, rabietas: 2 }, laberinto: { tiempoCompletado: 235, intentosFallidos: 6, nivelesCompletados: 2, retrocesos: 11, abandonos: 1 }, globosColores: { aciertos: 24, erroresColor: 14, tiempoReaccion: 1050, precisionColor: 63, rachaMaxima: 4 } },
            { semana: 4, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 860, precision: 65, burbujasReventadas: 37, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 220, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 26, erroresColor: 13, tiempoReaccion: 1020, precisionColor: 67, rachaMaxima: 4 } },
            { semana: 5, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 840, precision: 68, burbujasReventadas: 40, nivelAlcanzado: 3, rabietas: 1 }, laberinto: { tiempoCompletado: 210, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 28, erroresColor: 11, tiempoReaccion: 990, precisionColor: 72, rachaMaxima: 5 } },
            { semana: 6, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 820, precision: 70, burbujasReventadas: 42, nivelAlcanzado: 3, rabietas: 1 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 4, nivelesCompletados: 2, retrocesos: 8, abandonos: 1 }, globosColores: { aciertos: 30, erroresColor: 10, tiempoReaccion: 960, precisionColor: 75, rachaMaxima: 5 } },
            { semana: 7, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 800, precision: 72, burbujasReventadas: 44, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 190, intentosFallidos: 4, nivelesCompletados: 3, retrocesos: 7, abandonos: 0 }, globosColores: { aciertos: 32, erroresColor: 9, tiempoReaccion: 940, precisionColor: 78, rachaMaxima: 6 } },
            { semana: 8, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 780, precision: 75, burbujasReventadas: 46, nivelAlcanzado: 4, rabietas: 0 }, laberinto: { tiempoCompletado: 180, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 6, abandonos: 0 }, globosColores: { aciertos: 34, erroresColor: 8, tiempoReaccion: 910, precisionColor: 81, rachaMaxima: 7 } },
        ],
    },
    {
        id: 3,
        nombre: 'Julio',
        edad: '15 años',
        tutor: 'Esther Howard',
        ultimaSesion: '2026-02-25',
        semanas: [
            // Paciente que empeora — empezó bien y fue bajando
            { semana: 1, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 650, precision: 85, burbujasReventadas: 60, nivelAlcanzado: 5, rabietas: 0 }, laberinto: { tiempoCompletado: 130, intentosFallidos: 2, nivelesCompletados: 4, retrocesos: 3, abandonos: 0 }, globosColores: { aciertos: 40, erroresColor: 5, tiempoReaccion: 800, precisionColor: 89, rachaMaxima: 10 } },
            { semana: 2, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 680, precision: 80, burbujasReventadas: 55, nivelAlcanzado: 5, rabietas: 1 }, laberinto: { tiempoCompletado: 145, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 5, abandonos: 0 }, globosColores: { aciertos: 36, erroresColor: 8, tiempoReaccion: 850, precisionColor: 82, rachaMaxima: 8 } },
            { semana: 3, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 740, precision: 72, burbujasReventadas: 45, nivelAlcanzado: 4, rabietas: 2 }, laberinto: { tiempoCompletado: 170, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 8, abandonos: 1 }, globosColores: { aciertos: 30, erroresColor: 12, tiempoReaccion: 940, precisionColor: 71, rachaMaxima: 5 } },
            { semana: 4, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 800, precision: 65, burbujasReventadas: 38, nivelAlcanzado: 3, rabietas: 3 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 7, nivelesCompletados: 1, retrocesos: 12, abandonos: 2 }, globosColores: { aciertos: 25, erroresColor: 16, tiempoReaccion: 1020, precisionColor: 61, rachaMaxima: 4 } },
            { semana: 5, frecuenciaSemanal: 2, cancelaciones: 2, burbujas: { tiempoReaccion: 860, precision: 58, burbujasReventadas: 30, nivelAlcanzado: 3, rabietas: 4 }, laberinto: { tiempoCompletado: 240, intentosFallidos: 9, nivelesCompletados: 1, retrocesos: 15, abandonos: 3 }, globosColores: { aciertos: 20, erroresColor: 20, tiempoReaccion: 1100, precisionColor: 50, rachaMaxima: 3 } },
            { semana: 6, frecuenciaSemanal: 2, cancelaciones: 1, burbujas: { tiempoReaccion: 900, precision: 52, burbujasReventadas: 25, nivelAlcanzado: 2, rabietas: 5 }, laberinto: { tiempoCompletado: 270, intentosFallidos: 10, nivelesCompletados: 1, retrocesos: 18, abandonos: 3 }, globosColores: { aciertos: 18, erroresColor: 22, tiempoReaccion: 1150, precisionColor: 45, rachaMaxima: 2 } },
            { semana: 7, frecuenciaSemanal: 1, cancelaciones: 2, burbujas: { tiempoReaccion: 950, precision: 48, burbujasReventadas: 20, nivelAlcanzado: 2, rabietas: 5 }, laberinto: { tiempoCompletado: 300, intentosFallidos: 12, nivelesCompletados: 0, retrocesos: 20, abandonos: 4 }, globosColores: { aciertos: 15, erroresColor: 25, tiempoReaccion: 1200, precisionColor: 38, rachaMaxima: 2 } },
            { semana: 8, frecuenciaSemanal: 1, cancelaciones: 2, burbujas: { tiempoReaccion: 980, precision: 45, burbujasReventadas: 18, nivelAlcanzado: 2, rabietas: 6 }, laberinto: { tiempoCompletado: 320, intentosFallidos: 14, nivelesCompletados: 0, retrocesos: 22, abandonos: 5 }, globosColores: { aciertos: 12, erroresColor: 28, tiempoReaccion: 1250, precisionColor: 30, rachaMaxima: 1 } },
        ],
    },
    {
        id: 4,
        nombre: 'Marcos',
        edad: '8 años',
        tutor: 'Cameron Williamson',
        ultimaSesion: '2026-03-01',
        semanas: [
            // Paciente que mejora gradualmente
            { semana: 1, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 980, precision: 50, burbujasReventadas: 25, nivelAlcanzado: 1, rabietas: 4 }, laberinto: { tiempoCompletado: 280, intentosFallidos: 10, nivelesCompletados: 1, retrocesos: 16, abandonos: 3 }, globosColores: { aciertos: 18, erroresColor: 20, tiempoReaccion: 1150, precisionColor: 47, rachaMaxima: 2 } },
            { semana: 2, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 950, precision: 53, burbujasReventadas: 28, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 265, intentosFallidos: 9, nivelesCompletados: 1, retrocesos: 14, abandonos: 2 }, globosColores: { aciertos: 20, erroresColor: 18, tiempoReaccion: 1120, precisionColor: 53, rachaMaxima: 3 } },
            { semana: 3, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 920, precision: 57, burbujasReventadas: 32, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 245, intentosFallidos: 8, nivelesCompletados: 1, retrocesos: 12, abandonos: 2 }, globosColores: { aciertos: 22, erroresColor: 16, tiempoReaccion: 1080, precisionColor: 58, rachaMaxima: 3 } },
            { semana: 4, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 890, precision: 60, burbujasReventadas: 35, nivelAlcanzado: 2, rabietas: 2 }, laberinto: { tiempoCompletado: 230, intentosFallidos: 7, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 24, erroresColor: 14, tiempoReaccion: 1050, precisionColor: 63, rachaMaxima: 4 } },
            { semana: 5, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 860, precision: 64, burbujasReventadas: 38, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 210, intentosFallidos: 6, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 27, erroresColor: 12, tiempoReaccion: 1010, precisionColor: 69, rachaMaxima: 5 } },
            { semana: 6, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 830, precision: 68, burbujasReventadas: 42, nivelAlcanzado: 3, rabietas: 1 }, laberinto: { tiempoCompletado: 195, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 7, abandonos: 1 }, globosColores: { aciertos: 30, erroresColor: 10, tiempoReaccion: 970, precisionColor: 75, rachaMaxima: 6 } },
            { semana: 7, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 800, precision: 72, burbujasReventadas: 46, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 175, intentosFallidos: 4, nivelesCompletados: 3, retrocesos: 5, abandonos: 0 }, globosColores: { aciertos: 33, erroresColor: 8, tiempoReaccion: 930, precisionColor: 80, rachaMaxima: 7 } },
            { semana: 8, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 770, precision: 76, burbujasReventadas: 50, nivelAlcanzado: 4, rabietas: 0 }, laberinto: { tiempoCompletado: 160, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 4, abandonos: 0 }, globosColores: { aciertos: 36, erroresColor: 6, tiempoReaccion: 890, precisionColor: 86, rachaMaxima: 9 } },
        ],
    },
    {
        id: 5,
        nombre: 'Ignacio',
        edad: '11 años',
        tutor: 'Brooklyn Simmons',
        ultimaSesion: '2026-02-26',
        semanas: [
            // Paciente que empeora — empezó medio y fue bajando
            { semana: 1, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 720, precision: 75, burbujasReventadas: 45, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 160, intentosFallidos: 4, nivelesCompletados: 3, retrocesos: 6, abandonos: 0 }, globosColores: { aciertos: 32, erroresColor: 10, tiempoReaccion: 900, precisionColor: 76, rachaMaxima: 7 } },
            { semana: 2, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 750, precision: 72, burbujasReventadas: 42, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 175, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 8, abandonos: 1 }, globosColores: { aciertos: 28, erroresColor: 13, tiempoReaccion: 950, precisionColor: 68, rachaMaxima: 5 } },
            { semana: 3, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 790, precision: 68, burbujasReventadas: 38, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 195, intentosFallidos: 6, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 25, erroresColor: 15, tiempoReaccion: 1000, precisionColor: 63, rachaMaxima: 4 } },
            { semana: 4, frecuenciaSemanal: 2, cancelaciones: 2, burbujas: { tiempoReaccion: 830, precision: 62, burbujasReventadas: 32, nivelAlcanzado: 3, rabietas: 3 }, laberinto: { tiempoCompletado: 220, intentosFallidos: 8, nivelesCompletados: 1, retrocesos: 13, abandonos: 2 }, globosColores: { aciertos: 22, erroresColor: 18, tiempoReaccion: 1060, precisionColor: 55, rachaMaxima: 3 } },
            { semana: 5, frecuenciaSemanal: 2, cancelaciones: 1, burbujas: { tiempoReaccion: 870, precision: 56, burbujasReventadas: 28, nivelAlcanzado: 2, rabietas: 4 }, laberinto: { tiempoCompletado: 250, intentosFallidos: 9, nivelesCompletados: 1, retrocesos: 15, abandonos: 3 }, globosColores: { aciertos: 19, erroresColor: 21, tiempoReaccion: 1120, precisionColor: 48, rachaMaxima: 2 } },
            { semana: 6, frecuenciaSemanal: 2, cancelaciones: 2, burbujas: { tiempoReaccion: 910, precision: 52, burbujasReventadas: 24, nivelAlcanzado: 2, rabietas: 4 }, laberinto: { tiempoCompletado: 270, intentosFallidos: 10, nivelesCompletados: 1, retrocesos: 17, abandonos: 3 }, globosColores: { aciertos: 16, erroresColor: 24, tiempoReaccion: 1180, precisionColor: 40, rachaMaxima: 2 } },
            { semana: 7, frecuenciaSemanal: 1, cancelaciones: 2, burbujas: { tiempoReaccion: 940, precision: 48, burbujasReventadas: 20, nivelAlcanzado: 2, rabietas: 5 }, laberinto: { tiempoCompletado: 290, intentosFallidos: 12, nivelesCompletados: 0, retrocesos: 19, abandonos: 4 }, globosColores: { aciertos: 14, erroresColor: 26, tiempoReaccion: 1220, precisionColor: 35, rachaMaxima: 1 } },
            { semana: 8, frecuenciaSemanal: 1, cancelaciones: 3, burbujas: { tiempoReaccion: 970, precision: 44, burbujasReventadas: 18, nivelAlcanzado: 1, rabietas: 6 }, laberinto: { tiempoCompletado: 310, intentosFallidos: 14, nivelesCompletados: 0, retrocesos: 21, abandonos: 5 }, globosColores: { aciertos: 12, erroresColor: 28, tiempoReaccion: 1260, precisionColor: 30, rachaMaxima: 1 } },
        ],
    },
    {
        id: 6,
        nombre: 'Octavio',
        edad: '9 años',
        tutor: 'Leslie Alexander',
        ultimaSesion: '2026-02-24',
        semanas: [
            // Paciente estable — se mantiene en valores medios
            { semana: 1, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 810, precision: 65, burbujasReventadas: 36, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 26, erroresColor: 12, tiempoReaccion: 970, precisionColor: 68, rachaMaxima: 5 } },
            { semana: 2, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 820, precision: 64, burbujasReventadas: 35, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 205, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 25, erroresColor: 13, tiempoReaccion: 980, precisionColor: 66, rachaMaxima: 4 } },
            { semana: 3, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 800, precision: 66, burbujasReventadas: 37, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 198, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 27, erroresColor: 12, tiempoReaccion: 960, precisionColor: 69, rachaMaxima: 5 } },
            { semana: 4, frecuenciaSemanal: 3, cancelaciones: 0, burbujas: { tiempoReaccion: 815, precision: 65, burbujasReventadas: 36, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 202, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 26, erroresColor: 12, tiempoReaccion: 975, precisionColor: 68, rachaMaxima: 5 } },
            { semana: 5, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 808, precision: 65, burbujasReventadas: 36, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 26, erroresColor: 12, tiempoReaccion: 968, precisionColor: 68, rachaMaxima: 5 } },
            { semana: 6, frecuenciaSemanal: 3, cancelaciones: 0, burbujas: { tiempoReaccion: 795, precision: 67, burbujasReventadas: 38, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 195, intentosFallidos: 4, nivelesCompletados: 2, retrocesos: 8, abandonos: 1 }, globosColores: { aciertos: 27, erroresColor: 11, tiempoReaccion: 960, precisionColor: 71, rachaMaxima: 5 } },
            { semana: 7, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 810, precision: 66, burbujasReventadas: 37, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 26, erroresColor: 12, tiempoReaccion: 970, precisionColor: 68, rachaMaxima: 5 } },
            { semana: 8, frecuenciaSemanal: 3, cancelaciones: 0, burbujas: { tiempoReaccion: 805, precision: 66, burbujasReventadas: 37, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 198, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 27, erroresColor: 11, tiempoReaccion: 965, precisionColor: 71, rachaMaxima: 5 } },
        ],
    },
    {
        id: 7,
        nombre: 'Franco',
        edad: '13 años',
        tutor: 'Jenny Wilson',
        ultimaSesion: '2026-03-01',
        semanas: [
            // Paciente que mejora rápido — buen progreso
            { semana: 1, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 760, precision: 72, burbujasReventadas: 42, nivelAlcanzado: 3, rabietas: 1 }, laberinto: { tiempoCompletado: 175, intentosFallidos: 4, nivelesCompletados: 3, retrocesos: 7, abandonos: 0 }, globosColores: { aciertos: 30, erroresColor: 10, tiempoReaccion: 920, precisionColor: 75, rachaMaxima: 6 } },
            { semana: 2, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 730, precision: 76, burbujasReventadas: 46, nivelAlcanzado: 4, rabietas: 1 }, laberinto: { tiempoCompletado: 160, intentosFallidos: 3, nivelesCompletados: 3, retrocesos: 5, abandonos: 0 }, globosColores: { aciertos: 33, erroresColor: 8, tiempoReaccion: 890, precisionColor: 80, rachaMaxima: 7 } },
            { semana: 3, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 700, precision: 80, burbujasReventadas: 50, nivelAlcanzado: 4, rabietas: 0 }, laberinto: { tiempoCompletado: 145, intentosFallidos: 2, nivelesCompletados: 4, retrocesos: 4, abandonos: 0 }, globosColores: { aciertos: 36, erroresColor: 6, tiempoReaccion: 860, precisionColor: 86, rachaMaxima: 9 } },
            { semana: 4, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 680, precision: 84, burbujasReventadas: 54, nivelAlcanzado: 5, rabietas: 0 }, laberinto: { tiempoCompletado: 130, intentosFallidos: 2, nivelesCompletados: 4, retrocesos: 3, abandonos: 0 }, globosColores: { aciertos: 38, erroresColor: 5, tiempoReaccion: 830, precisionColor: 88, rachaMaxima: 10 } },
            { semana: 5, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 660, precision: 87, burbujasReventadas: 58, nivelAlcanzado: 5, rabietas: 0 }, laberinto: { tiempoCompletado: 120, intentosFallidos: 1, nivelesCompletados: 5, retrocesos: 2, abandonos: 0 }, globosColores: { aciertos: 40, erroresColor: 4, tiempoReaccion: 800, precisionColor: 91, rachaMaxima: 11 } },
            { semana: 6, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 640, precision: 90, burbujasReventadas: 62, nivelAlcanzado: 6, rabietas: 0 }, laberinto: { tiempoCompletado: 110, intentosFallidos: 1, nivelesCompletados: 5, retrocesos: 2, abandonos: 0 }, globosColores: { aciertos: 42, erroresColor: 3, tiempoReaccion: 780, precisionColor: 93, rachaMaxima: 13 } },
            { semana: 7, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 620, precision: 92, burbujasReventadas: 66, nivelAlcanzado: 6, rabietas: 0 }, laberinto: { tiempoCompletado: 100, intentosFallidos: 1, nivelesCompletados: 5, retrocesos: 1, abandonos: 0 }, globosColores: { aciertos: 44, erroresColor: 2, tiempoReaccion: 760, precisionColor: 96, rachaMaxima: 15 } },
            { semana: 8, frecuenciaSemanal: 5, cancelaciones: 0, burbujas: { tiempoReaccion: 600, precision: 94, burbujasReventadas: 70, nivelAlcanzado: 7, rabietas: 0 }, laberinto: { tiempoCompletado: 95, intentosFallidos: 0, nivelesCompletados: 6, retrocesos: 1, abandonos: 0 }, globosColores: { aciertos: 46, erroresColor: 1, tiempoReaccion: 740, precisionColor: 98, rachaMaxima: 18 } },
        ],
    },
    {
        id: 8,
        nombre: 'Lazario',
        edad: '7 años',
        tutor: 'Guy Hawkins',
        ultimaSesion: '2026-02-20',
        semanas: [
            // Paciente con mejora lenta — empieza muy bajo
            { semana: 1, frecuenciaSemanal: 2, cancelaciones: 2, burbujas: { tiempoReaccion: 1050, precision: 40, burbujasReventadas: 15, nivelAlcanzado: 1, rabietas: 5 }, laberinto: { tiempoCompletado: 320, intentosFallidos: 14, nivelesCompletados: 0, retrocesos: 22, abandonos: 4 }, globosColores: { aciertos: 10, erroresColor: 25, tiempoReaccion: 1300, precisionColor: 29, rachaMaxima: 1 } },
            { semana: 2, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 1020, precision: 43, burbujasReventadas: 18, nivelAlcanzado: 1, rabietas: 4 }, laberinto: { tiempoCompletado: 300, intentosFallidos: 12, nivelesCompletados: 0, retrocesos: 20, abandonos: 3 }, globosColores: { aciertos: 12, erroresColor: 22, tiempoReaccion: 1260, precisionColor: 35, rachaMaxima: 2 } },
            { semana: 3, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 990, precision: 46, burbujasReventadas: 20, nivelAlcanzado: 1, rabietas: 4 }, laberinto: { tiempoCompletado: 280, intentosFallidos: 10, nivelesCompletados: 1, retrocesos: 18, abandonos: 3 }, globosColores: { aciertos: 14, erroresColor: 20, tiempoReaccion: 1220, precisionColor: 41, rachaMaxima: 2 } },
            { semana: 4, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 960, precision: 49, burbujasReventadas: 22, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 260, intentosFallidos: 9, nivelesCompletados: 1, retrocesos: 16, abandonos: 2 }, globosColores: { aciertos: 16, erroresColor: 18, tiempoReaccion: 1180, precisionColor: 47, rachaMaxima: 3 } },
            { semana: 5, frecuenciaSemanal: 3, cancelaciones: 1, burbujas: { tiempoReaccion: 930, precision: 52, burbujasReventadas: 25, nivelAlcanzado: 2, rabietas: 3 }, laberinto: { tiempoCompletado: 245, intentosFallidos: 8, nivelesCompletados: 1, retrocesos: 14, abandonos: 2 }, globosColores: { aciertos: 18, erroresColor: 16, tiempoReaccion: 1140, precisionColor: 53, rachaMaxima: 3 } },
            { semana: 6, frecuenciaSemanal: 3, cancelaciones: 0, burbujas: { tiempoReaccion: 900, precision: 55, burbujasReventadas: 28, nivelAlcanzado: 2, rabietas: 2 }, laberinto: { tiempoCompletado: 230, intentosFallidos: 7, nivelesCompletados: 1, retrocesos: 12, abandonos: 2 }, globosColores: { aciertos: 20, erroresColor: 15, tiempoReaccion: 1100, precisionColor: 57, rachaMaxima: 4 } },
            { semana: 7, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 870, precision: 58, burbujasReventadas: 30, nivelAlcanzado: 2, rabietas: 2 }, laberinto: { tiempoCompletado: 215, intentosFallidos: 6, nivelesCompletados: 2, retrocesos: 10, abandonos: 1 }, globosColores: { aciertos: 22, erroresColor: 13, tiempoReaccion: 1060, precisionColor: 63, rachaMaxima: 4 } },
            { semana: 8, frecuenciaSemanal: 4, cancelaciones: 0, burbujas: { tiempoReaccion: 850, precision: 60, burbujasReventadas: 33, nivelAlcanzado: 3, rabietas: 2 }, laberinto: { tiempoCompletado: 200, intentosFallidos: 5, nivelesCompletados: 2, retrocesos: 9, abandonos: 1 }, globosColores: { aciertos: 24, erroresColor: 11, tiempoReaccion: 1020, precisionColor: 69, rachaMaxima: 5 } },
        ],
    },
];
