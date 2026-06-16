import { createClient } from '@/lib/supabase/server'
import { assembleInforme } from './assemble'
import type {
  InformeConRelaciones,
  ComponenteConProyectos,
  ProyectoDetalle,
  InformeConAvance,
  ComponenteConAvance,
  ProyectoConAvance,
  PlazoConAvance,
  Criterio,
  ProyectoRecurso,
  Actividad,
} from '@/types/domain'

/** Informe activo con todo su árbol (componentes→proyectos→plazos→criterios). */
export async function getInformeActivo(): Promise<InformeConRelaciones | null> {
  const supabase = await createClient()

  const { data: informe } = await supabase
    .from('v_informes_con_avance')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()
  if (!informe) return null

  const { data: componentes } = await supabase
    .from('v_componentes_con_avance')
    .select('*')
    .eq('informe_id', (informe as InformeConAvance).id)
  const comps = (componentes ?? []) as ComponenteConAvance[]
  const compIds = comps.map((c) => c.id)

  const { data: proyectos } = await supabase
    .from('v_proyectos_con_avance')
    .select('*')
    .in('componente_id', compIds)
  const proys = (proyectos ?? []) as ProyectoConAvance[]
  const proyIds = proys.map((p) => p.id)

  const { data: plazos } = await supabase
    .from('v_plazos_con_avance')
    .select('*')
    .in('proyecto_id', proyIds)
  const plzs = (plazos ?? []) as PlazoConAvance[]
  const plazoIds = plzs.map((p) => p.id)

  const [{ data: criterios }, { data: recursos }, { data: actividades }] =
    await Promise.all([
      supabase.from('criterios').select('*').in('proyecto_plazo_id', plazoIds),
      supabase.from('proyecto_recursos').select('*').in('proyecto_id', proyIds),
      supabase.from('actividades').select('*').in('proyecto_id', proyIds),
    ])

  return assembleInforme(
    informe as InformeConAvance,
    comps,
    proys,
    plzs,
    (criterios ?? []) as Criterio[],
    (recursos ?? []) as ProyectoRecurso[],
    (actividades ?? []) as Actividad[]
  )
}

export async function getComponente(
  slug: string
): Promise<ComponenteConProyectos | null> {
  const informe = await getInformeActivo()
  return informe?.componentes.find((c) => c.slug === slug) ?? null
}

export async function getProyecto(
  componenteSlug: string,
  proyectoSlug: string
): Promise<ProyectoDetalle | null> {
  const componente = await getComponente(componenteSlug)
  return componente?.proyectos.find((p) => p.slug === proyectoSlug) ?? null
}
