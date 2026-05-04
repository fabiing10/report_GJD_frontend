'use server'

import { revalidatePath } from 'next/cache'
import { getDataClient } from '@/lib/db'
import { slugify } from '@/lib/utils'
import type { Proyecto, LogroInput, PasoInput } from '@/types/domain'

export async function updateProyectoInlineAction(
  id: string,
  patch: { avance?: number; estado?: string }
): Promise<Proyecto> {
  const client = getDataClient()
  const updated = await client.updateProyecto(id, patch as Parameters<typeof client.updateProyecto>[1])
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
  return updated
}

export interface SaveProyectoPayload {
  id?: string
  componente_id: string
  codigo: string | null
  nombre: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  plazo: 'corto' | 'mediano' | 'largo'
  estado: 'completado' | 'en_progreso' | 'no_iniciado' | 'refinamiento' | 'bloqueado'
  avance: number
  avance_corto: number | null
  avance_mediano: number | null
  avance_largo: number | null
  responsable: string | null
  fecha_entrega_texto: string | null
  logros: LogroInput[]
  proximos_pasos: PasoInput[]
}

export async function saveProyectoAction(payload: SaveProyectoPayload): Promise<Proyecto> {
  const client = getDataClient()
  const informe = await client.getInformeActivo()
  const componente = informe?.componentes.find((c) => c.id === payload.componente_id)

  let proyecto: Proyecto

  if (payload.id) {
    proyecto = await client.updateProyecto(payload.id, {
      codigo: payload.codigo,
      nombre: payload.nombre,
      descripcion_corta: payload.descripcion_corta,
      descripcion_larga: payload.descripcion_larga,
      plazo: payload.plazo,
      estado: payload.estado,
      avance: payload.avance,
      avance_corto: payload.avance_corto,
      avance_mediano: payload.avance_mediano,
      avance_largo: payload.avance_largo,
      responsable: payload.responsable,
      fecha_entrega_texto: payload.fecha_entrega_texto,
    })
  } else {
    const maxOrden = componente?.proyectos.reduce((m, p) => Math.max(m, p.orden), -1) ?? -1
    proyecto = await client.createProyecto({
      componente_id: payload.componente_id,
      slug: slugify(payload.nombre),
      codigo: payload.codigo,
      nombre: payload.nombre,
      descripcion_corta: payload.descripcion_corta,
      descripcion_larga: payload.descripcion_larga,
      plazo: payload.plazo,
      estado: payload.estado,
      avance: payload.avance,
      avance_corto: payload.avance_corto,
      avance_mediano: payload.avance_mediano,
      avance_largo: payload.avance_largo,
      responsable: payload.responsable,
      fecha_entrega: null,
      fecha_entrega_texto: payload.fecha_entrega_texto,
      orden: maxOrden + 1,
    })
  }

  await client.upsertLogros(proyecto.id, payload.logros)
  await client.upsertProximosPasos(proyecto.id, payload.proximos_pasos)

  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
  return proyecto
}

export async function deleteProyectoAction(id: string): Promise<void> {
  const client = getDataClient()
  await client.deleteProyecto(id)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

export async function upsertRecursosAction(
  proyectoId: string,
  recursos: Array<{ tipo: string; titulo: string | null; url: string; thumbnail_url?: string | null; orden: number }>
): Promise<void> {
  const client = getDataClient()
  await client.upsertRecursos(proyectoId, recursos)
  revalidatePath('/', 'layout')
}
