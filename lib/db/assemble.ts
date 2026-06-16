import type {
  InformeConAvance,
  ComponenteConAvance,
  ProyectoConAvance,
  PlazoConAvance,
  Criterio,
  ProyectoRecurso,
  Actividad,
  InformeConRelaciones,
  ProyectoDetalle,
  PlazoDetalle,
} from '@/types/domain'

const byOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden

/**
 * Arma el árbol anidado del informe a partir de filas planas de cada tabla/vista.
 * Pura: no toca red. El avance ya viene calculado por las vistas SQL.
 */
export function assembleInforme(
  informe: InformeConAvance,
  componentes: ComponenteConAvance[],
  proyectos: ProyectoConAvance[],
  plazos: PlazoConAvance[],
  criterios: Criterio[],
  recursos: ProyectoRecurso[],
  actividades: Actividad[]
): InformeConRelaciones {
  const criteriosPorPlazo = groupBy(criterios, (c) => c.proyecto_plazo_id)
  const plazosPorProyecto = groupBy(plazos, (p) => p.proyecto_id)
  const recursosPorProyecto = groupBy(recursos, (r) => r.proyecto_id)
  const actividadesPorProyecto = groupBy(actividades, (a) => a.proyecto_id)
  const proyectosPorComponente = groupBy(proyectos, (p) => p.componente_id)

  const buildProyecto = (p: ProyectoConAvance): ProyectoDetalle => {
    const plazosDetalle: PlazoDetalle[] = (plazosPorProyecto.get(p.id) ?? [])
      .slice()
      .sort(byOrden)
      .map((pl) => ({
        ...pl,
        criterios: (criteriosPorPlazo.get(pl.id) ?? []).slice().sort(byOrden),
      }))
    return {
      ...p,
      plazos: plazosDetalle,
      recursos: (recursosPorProyecto.get(p.id) ?? []).slice().sort(byOrden),
      actividades: (actividadesPorProyecto.get(p.id) ?? []).slice().sort(byOrden),
    }
  }

  return {
    ...informe,
    componentes: componentes
      .slice()
      .sort(byOrden)
      .map((c) => ({
        ...c,
        proyectos: (proyectosPorComponente.get(c.id) ?? [])
          .slice()
          .sort(byOrden)
          .map(buildProyecto),
      })),
  }
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const arr = map.get(k)
    if (arr) arr.push(item)
    else map.set(k, [item])
  }
  return map
}
