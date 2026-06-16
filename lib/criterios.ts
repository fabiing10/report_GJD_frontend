import type { Criterio, PlazoDetalle, PlazoEnum } from '@/types/domain'

/** Un criterio cumplido se muestra como "Logro alcanzado". */
export function esLogro(c: Criterio): boolean {
  return c.estado === 'cumplido'
}

export function logros(criterios: Criterio[]): Criterio[] {
  return criterios.filter(esLogro)
}

/** Pendiente o en progreso → "Próximo paso". */
export function proximosPasos(criterios: Criterio[]): Criterio[] {
  return criterios.filter((c) => !esLogro(c))
}

/** Todos los criterios del proyecto, aplanando sus plazos (en orden de plazo). */
export function criteriosDeProyecto(plazos: PlazoDetalle[]): Criterio[] {
  return plazos.flatMap((p) => p.criterios)
}

/** Criterios de un plazo específico del proyecto. */
export function criteriosPorPlazo(
  plazos: PlazoDetalle[],
  plazo: PlazoEnum
): Criterio[] {
  return plazos.filter((p) => p.plazo === plazo).flatMap((p) => p.criterios)
}
