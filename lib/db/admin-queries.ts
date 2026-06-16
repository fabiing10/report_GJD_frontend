import { createClient } from '@/lib/supabase/server'
import type {
  Informe,
  Componente,
  ProyectoConAvance,
  PlazoConAvance,
  Criterio,
  ProyectoRecurso,
  Actividad,
  ProyectoDetalle,
  Profile,
  PlazoDetalle,
} from '@/types/domain'

const byOrden = <T extends { orden: number }>(a: T, b: T) => a.orden - b.orden

export async function getAllInformes(): Promise<Informe[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('v_informes_con_avance')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Informe[]
}

export async function getComponentes(informeId: string): Promise<Componente[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('v_componentes_con_avance')
    .select('*')
    .eq('informe_id', informeId)
    .order('orden')
  return (data ?? []) as Componente[]
}

export async function getProyectos(componenteId: string): Promise<ProyectoConAvance[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('v_proyectos_con_avance')
    .select('*')
    .eq('componente_id', componenteId)
    .order('orden')
  return (data ?? []) as ProyectoConAvance[]
}

export async function getProyectoEditable(id: string): Promise<ProyectoDetalle | null> {
  const supabase = await createClient()
  const { data: proyecto } = await supabase
    .from('v_proyectos_con_avance')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (!proyecto) return null

  const { data: plazos } = await supabase
    .from('v_plazos_con_avance')
    .select('*')
    .eq('proyecto_id', id)
  const plzs = (plazos ?? []) as PlazoConAvance[]
  const plazoIds = plzs.map((p) => p.id)

  const [{ data: criterios }, { data: recursos }, { data: actividades }] =
    await Promise.all([
      supabase.from('criterios').select('*').in('proyecto_plazo_id', plazoIds),
      supabase.from('proyecto_recursos').select('*').eq('proyecto_id', id),
      supabase.from('actividades').select('*').eq('proyecto_id', id),
    ])

  const crits = (criterios ?? []) as Criterio[]
  const plazosDetalle: PlazoDetalle[] = plzs
    .slice()
    .sort(byOrden)
    .map((pl) => ({
      ...pl,
      criterios: crits.filter((c) => c.proyecto_plazo_id === pl.id).sort(byOrden),
    }))

  return {
    ...(proyecto as ProyectoConAvance),
    plazos: plazosDetalle,
    recursos: ((recursos ?? []) as ProyectoRecurso[]).slice().sort(byOrden),
    actividades: ((actividades ?? []) as Actividad[]).slice().sort(byOrden),
  }
}

export async function getAllActividades(): Promise<
  Array<Actividad & { proyecto_nombre: string }>
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('actividades')
    .select('*, proyectos(nombre)')
    .order('fecha', { ascending: false })
  return ((data ?? []) as Array<Actividad & { proyectos: { nombre: string } | null }>).map(
    (a) => ({ ...a, proyecto_nombre: a.proyectos?.nombre ?? '' })
  )
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  return (data ?? []) as Profile[]
}
