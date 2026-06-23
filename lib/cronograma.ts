import type { ProyectoDetalle, PlazoEnum, Objetivo } from '@/types/domain'

// Ventana del cronograma: Enero 2026 → Diciembre 2027 (24 meses).
export const START_YEAR = 2026
export const END_YEAR = 2027
export const TOTAL_MESES = (END_YEAR - START_YEAR + 1) * 12 // 24

export interface Mes {
  index: number
  year: number
  month: number // 1-12
}

const MES_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function mesAbbr(month: number): string {
  return MES_ABBR[month - 1] ?? ''
}

export function buildMeses(): Mes[] {
  const out: Mes[] = []
  for (let i = 0; i < TOTAL_MESES; i++) {
    out.push({ index: i, year: START_YEAR + Math.floor(i / 12), month: (i % 12) + 1 })
  }
  return out
}

// Rango (índices de mes) de cada plazo dentro de la ventana.
export const PLAZO_RANGE: Record<PlazoEnum, { start: number; end: number }> = {
  corto: { start: 0, end: 5 }, // H1 2026
  mediano: { start: 6, end: 11 }, // H2 2026
  largo: { start: 12, end: 23 }, // 2027
}

/** Convierte 'YYYY-MM-DD' a índice de mes en la ventana, o null si está fuera. */
export function dateToIndex(date: string): number | null {
  const m = /^(\d{4})-(\d{2})/.exec(date)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const idx = (year - START_YEAR) * 12 + (month - 1)
  if (idx < 0) return 0
  if (idx > TOTAL_MESES - 1) return TOTAL_MESES - 1
  return idx
}

/**
 * Span del proyecto en el cronograma:
 * usa fecha_inicio/fecha_fin si existen; si no, deriva del rango de plazos de
 * sus objetivos. Null si no hay ni fechas ni objetivos.
 */
export function proyectoSpan(p: ProyectoDetalle): { start: number; end: number } | null {
  if (p.fecha_inicio && p.fecha_fin) {
    const s = dateToIndex(p.fecha_inicio)
    const e = dateToIndex(p.fecha_fin)
    if (s !== null && e !== null) return { start: Math.min(s, e), end: Math.max(s, e) }
  }
  const plazos = Array.from(new Set(p.objetivos.map((o) => o.plazo)))
  if (plazos.length === 0) return null
  const start = Math.min(...plazos.map((pl) => PLAZO_RANGE[pl].start))
  const end = Math.max(...plazos.map((pl) => PLAZO_RANGE[pl].end))
  return { start, end }
}

/** Plazos presentes en el proyecto (para segmentar la barra). */
export function plazosDelProyecto(p: ProyectoDetalle): PlazoEnum[] {
  const set = new Set(p.objetivos.map((o) => o.plazo))
  return (['corto', 'mediano', 'largo'] as PlazoEnum[]).filter((pl) => set.has(pl))
}

/**
 * Span de un objetivo en el cronograma: ocupa todo el rango de meses de su
 * plazo. Cada objetivo es trazable en la línea de tiempo según su plazo definido.
 */
export function objetivoSpan(o: Pick<Objetivo, 'plazo'>): { start: number; end: number } {
  return PLAZO_RANGE[o.plazo]
}
