import type {
  InformeConAvance,
  ComponenteConAvance,
  ProyectoConAvance,
  Objetivo,
  Actividad,
  ProyectoRecurso,
  InformeConRelaciones,
  ProyectoDetalle,
  ObjetivoDetalle,
} from '@/types/domain'

const byOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden

/**
 * Arma el árbol del informe a partir de filas planas.
 * Pura. El avance ya viene calculado por las vistas SQL.
 */
export function assembleInforme(
  informe: InformeConAvance,
  componentes: ComponenteConAvance[],
  proyectos: ProyectoConAvance[],
  objetivos: Objetivo[],
  actividades: Actividad[],
  recursos: ProyectoRecurso[]
): InformeConRelaciones {
  const actividadesPorObjetivo = groupBy(actividades, (a) => a.objetivo_id)
  const objetivosPorProyecto = groupBy(objetivos, (o) => o.proyecto_id)
  const recursosPorProyecto = groupBy(recursos, (r) => r.proyecto_id)
  const proyectosPorComponente = groupBy(proyectos, (p) => p.componente_id)

  const buildProyecto = (p: ProyectoConAvance): ProyectoDetalle => {
    const objetivosDetalle: ObjetivoDetalle[] = (objetivosPorProyecto.get(p.id) ?? [])
      .slice()
      .sort(byOrden)
      .map((o) => ({
        ...o,
        actividades: (actividadesPorObjetivo.get(o.id) ?? []).slice().sort(byOrden),
      }))
    return {
      ...p,
      objetivos: objetivosDetalle,
      recursos: (recursosPorProyecto.get(p.id) ?? []).slice().sort(byOrden),
      ejes: [],
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
