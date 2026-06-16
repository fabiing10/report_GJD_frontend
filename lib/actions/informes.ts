'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { informeSchema, type InformeFormValues } from '@/lib/schemas'

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/informes')
}

export async function crearInforme(input: InformeFormValues) {
  const values = informeSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('informes').insert(values)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarInforme(id: string, input: InformeFormValues) {
  const values = informeSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('informes').update(values).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarInforme(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('informes').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function activarInforme(id: string) {
  const supabase = await createClient()
  // Índice único parcial: solo un informe activo. Desactivar el actual primero.
  const { error: offError } = await supabase
    .from('informes')
    .update({ is_active: false })
    .eq('is_active', true)
  if (offError) throw new Error(offError.message)

  const { error: onError } = await supabase
    .from('informes')
    .update({ is_active: true })
    .eq('id', id)
  if (onError) throw new Error(onError.message)
  revalidate()
}

export async function duplicarInforme(id: string) {
  const supabase = await createClient()

  // ── 1. Leer la jerarquía completa del informe origen ──────────
  const { data: origen, error: origenError } = await supabase
    .from('informes')
    .select('*')
    .eq('id', id)
    .single()
  if (origenError) throw new Error(origenError.message)
  if (!origen) throw new Error('Informe no encontrado')

  const { data: componentes, error: compError } = await supabase
    .from('componentes')
    .select('*')
    .eq('informe_id', id)
    .order('orden')
  if (compError) throw new Error(compError.message)
  const comps = componentes ?? []
  const compIds = comps.map((c) => c.id)

  const { data: proyectos, error: proyError } = await supabase
    .from('proyectos')
    .select('*')
    .in('componente_id', compIds.length ? compIds : ['__none__'])
    .order('orden')
  if (proyError) throw new Error(proyError.message)
  const proys = proyectos ?? []
  const proyIds = proys.map((p) => p.id)

  const { data: plazos, error: plazoError } = await supabase
    .from('proyecto_plazos')
    .select('*')
    .in('proyecto_id', proyIds.length ? proyIds : ['__none__'])
    .order('orden')
  if (plazoError) throw new Error(plazoError.message)
  const plzs = plazos ?? []
  const plazoIds = plzs.map((pl) => pl.id)

  const { data: criterios, error: critError } = await supabase
    .from('criterios')
    .select('*')
    .in('proyecto_plazo_id', plazoIds.length ? plazoIds : ['__none__'])
    .order('orden')
  if (critError) throw new Error(critError.message)
  const crits = criterios ?? []

  const { data: recursos, error: recError } = await supabase
    .from('proyecto_recursos')
    .select('*')
    .in('proyecto_id', proyIds.length ? proyIds : ['__none__'])
    .order('orden')
  if (recError) throw new Error(recError.message)
  const recs = recursos ?? []

  // ── 2. Insertar el informe copia (inactivo) ───────────────────
  const { data: nuevoInforme, error: insInfError } = await supabase
    .from('informes')
    .insert({
      titulo: `${origen.titulo} (copia)`,
      subtitulo: origen.subtitulo,
      fecha_corte: origen.fecha_corte,
      avance_global_override: origen.avance_global_override,
      is_active: false,
    })
    .select()
    .single()
  if (insInfError) throw new Error(insInfError.message)
  const nuevoInformeId = nuevoInforme.id as string

  // ── 3. Re-insertar la jerarquía mapeando ids viejos→nuevos ────
  const compIdMap = new Map<string, string>()
  if (comps.length) {
    const payload = comps.map((c) => ({
      informe_id: nuevoInformeId,
      slug: c.slug,
      nombre: c.nombre,
      descripcion: c.descripcion,
      icono: c.icono,
      color_hex: c.color_hex,
      color_token: c.color_token,
      orden: c.orden,
      avance_override: c.avance_override,
    }))
    const { data: inserted, error } = await supabase
      .from('componentes')
      .insert(payload)
      .select()
    if (error) throw new Error(error.message)
    ;(inserted ?? []).forEach((row, idx) => {
      const oldId = comps[idx]?.id
      if (oldId) compIdMap.set(oldId, row.id as string)
    })
  }

  const proyIdMap = new Map<string, string>()
  if (proys.length) {
    const payload = proys.map((p) => ({
      componente_id: compIdMap.get(p.componente_id) ?? p.componente_id,
      slug: p.slug,
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion_corta: p.descripcion_corta,
      descripcion_larga: p.descripcion_larga,
      estado: p.estado,
      avance_override: p.avance_override,
      responsable: p.responsable,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      orden: p.orden,
    }))
    const { data: inserted, error } = await supabase
      .from('proyectos')
      .insert(payload)
      .select()
    if (error) throw new Error(error.message)
    ;(inserted ?? []).forEach((row, idx) => {
      const oldId = proys[idx]?.id
      if (oldId) proyIdMap.set(oldId, row.id as string)
    })
  }

  const plazoIdMap = new Map<string, string>()
  if (plzs.length) {
    const payload = plzs.map((pl) => ({
      proyecto_id: proyIdMap.get(pl.proyecto_id) ?? pl.proyecto_id,
      plazo: pl.plazo,
      fecha_inicio: pl.fecha_inicio,
      fecha_fin: pl.fecha_fin,
      avance_override: pl.avance_override,
      orden: pl.orden,
    }))
    const { data: inserted, error } = await supabase
      .from('proyecto_plazos')
      .insert(payload)
      .select()
    if (error) throw new Error(error.message)
    ;(inserted ?? []).forEach((row, idx) => {
      const oldId = plzs[idx]?.id
      if (oldId) plazoIdMap.set(oldId, row.id as string)
    })
  }

  if (crits.length) {
    const payload = crits.map((c) => ({
      proyecto_plazo_id: plazoIdMap.get(c.proyecto_plazo_id) ?? c.proyecto_plazo_id,
      texto: c.texto,
      descripcion: c.descripcion,
      peso: c.peso,
      estado: c.estado,
      orden: c.orden,
    }))
    const { error } = await supabase.from('criterios').insert(payload)
    if (error) throw new Error(error.message)
  }

  if (recs.length) {
    const payload = recs.map((r) => ({
      proyecto_id: proyIdMap.get(r.proyecto_id) ?? r.proyecto_id,
      tipo: r.tipo,
      titulo: r.titulo,
      url: r.url,
      thumbnail_url: r.thumbnail_url,
      duracion_segundos: r.duracion_segundos,
      orden: r.orden,
    }))
    const { error } = await supabase.from('proyecto_recursos').insert(payload)
    if (error) throw new Error(error.message)
  }

  revalidate()
}
