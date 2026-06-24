import { createClient } from '@/lib/supabase/server'
import type {
  Informe,
  Componente,
  ProyectoConAvance,
  Objetivo,
  Actividad,
  ProyectoRecurso,
  ProyectoDetalle,
  Profile,
  ObjetivoDetalle,
  EjeTransversal,
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

  const { data: objetivos } = await supabase
    .from('objetivos')
    .select('*')
    .eq('proyecto_id', id)
  const objs = (objetivos ?? []) as Objetivo[]
  const objIds = objs.map((o) => o.id)

  const [{ data: actividades }, { data: recursos }, { data: ejesLink }] =
    await Promise.all([
      supabase.from('actividades').select('*').in('objetivo_id', objIds),
      supabase.from('proyecto_recursos').select('*').eq('proyecto_id', id),
      supabase.from('proyecto_ejes').select('ejes_transversales(*)').eq('proyecto_id', id),
    ])

  const acts = (actividades ?? []) as Actividad[]
  const objetivosDetalle: ObjetivoDetalle[] = objs
    .slice()
    .sort(byOrden)
    .map((o) => ({
      ...o,
      actividades: acts.filter((a) => a.objetivo_id === o.id).sort(byOrden),
    }))

  const ejes = (
    (ejesLink ?? []) as unknown as Array<{
      ejes_transversales: EjeTransversal | EjeTransversal[] | null
    }>
  ).flatMap((e) => {
    const v = e.ejes_transversales
    return Array.isArray(v) ? v : v ? [v] : []
  })

  return {
    ...(proyecto as ProyectoConAvance),
    objetivos: objetivosDetalle,
    recursos: ((recursos ?? []) as ProyectoRecurso[]).slice().sort(byOrden),
    ejes,
  }
}

export async function getAllActividades(): Promise<
  Array<Actividad & { objetivo_titulo: string; proyecto_nombre: string }>
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('actividades')
    .select('*, objetivos(titulo, proyectos(nombre))')
    .order('fecha', { ascending: false })
  type Row = Actividad & {
    objetivos: { titulo: string; proyectos: { nombre: string } | null } | null
  }
  return ((data ?? []) as Row[]).map((a) => ({
    ...a,
    objetivo_titulo: a.objetivos?.titulo ?? '',
    proyecto_nombre: a.objetivos?.proyectos?.nombre ?? '',
  }))
}

export async function getAllObjetivos(): Promise<
  Array<Objetivo & { proyecto_nombre: string; componente_nombre: string }>
> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('objetivos')
    .select('*, proyectos(nombre, orden, componentes(nombre, orden))')
    .order('orden')
  type Row = Objetivo & {
    proyectos:
      | { nombre: string; orden: number; componentes: { nombre: string; orden: number } | null }
      | null
  }
  return ((data ?? []) as Row[])
    .slice()
    .sort((a, b) => {
      const ca = a.proyectos?.componentes?.orden ?? 0
      const cb = b.proyectos?.componentes?.orden ?? 0
      const pa = a.proyectos?.orden ?? 0
      const pb = b.proyectos?.orden ?? 0
      return ca - cb || pa - pb || a.orden - b.orden
    })
    .map((o) => ({
      ...o,
      proyecto_nombre: o.proyectos?.nombre ?? '',
      componente_nombre: o.proyectos?.componentes?.nombre ?? '',
    }))
}

export async function getAllEjes(): Promise<EjeTransversal[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('ejes_transversales')
    .select('*')
    .order('orden')
  return (data ?? []) as EjeTransversal[]
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
  return (data ?? []) as Profile[]
}
