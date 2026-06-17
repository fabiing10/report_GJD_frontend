import type { Objetivo, PlazoEnum } from '@/types/domain'

export const PLAZO_ORDER: PlazoEnum[] = ['corto', 'mediano', 'largo']

export const PLAZO_LABEL: Record<PlazoEnum, string> = {
  corto: 'Corto Plazo',
  mediano: 'Mediano Plazo',
  largo: 'Largo Plazo',
}

/** Un objetivo cumplido se muestra como "Logro alcanzado". */
export function esLogro(o: Objetivo): boolean {
  return o.estado === 'cumplido'
}

export function logros<T extends Objetivo>(objetivos: T[]): T[] {
  return objetivos.filter(esLogro)
}

/** Pendiente o en progreso → "Próximo paso". */
export function proximosPasos<T extends Objetivo>(objetivos: T[]): T[] {
  return objetivos.filter((o) => !esLogro(o))
}

export function objetivosPorPlazo<T extends Objetivo>(
  objetivos: T[],
  plazo: PlazoEnum
): T[] {
  return objetivos.filter((o) => o.plazo === plazo)
}

/** Avance ponderado de un plazo: Σ peso[cumplido] / Σ peso × 100. */
export function avancePlazo(objetivos: Objetivo[], plazo: PlazoEnum): number {
  const items = objetivosPorPlazo(objetivos, plazo)
  const total = items.reduce((s, o) => s + o.peso, 0)
  if (total === 0) return 0
  const cumplido = items
    .filter(esLogro)
    .reduce((s, o) => s + o.peso, 0)
  return (cumplido / total) * 100
}
