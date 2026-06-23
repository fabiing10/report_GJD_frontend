'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { objetivoSchema } from '@/lib/schemas'
import type { ObjetivoFormValues } from '@/lib/schemas'
import type { PlazoEnum } from '@/types/domain'

const PLAZO_VALUES = z.enum(['corto', 'mediano', 'largo'])

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

export async function crearObjetivo(input: ObjetivoFormValues) {
  const data = objetivoSchema.parse(input)
  const supabase = await createClient()
  const { data: last } = await supabase
    .from('objetivos')
    .select('orden')
    .eq('proyecto_id', data.proyecto_id)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const orden = ((last as { orden?: number } | null)?.orden ?? -1) + 1
  const { error } = await supabase.from('objetivos').insert({ ...data, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarObjetivo(id: string, input: ObjetivoFormValues) {
  const data = objetivoSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('objetivos').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarObjetivo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('objetivos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

/**
 * Mueve un objetivo a otro plazo (drag entre columnas del Kanban).
 * Solo persiste para admins (RLS: write = is_admin()).
 */
export async function cambiarPlazoObjetivo(id: string, plazo: PlazoEnum) {
  const plz = PLAZO_VALUES.parse(plazo)
  const supabase = await createClient()
  const { error } = await supabase.from('objetivos').update({ plazo: plz }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function reordenarObjetivos(_proyectoId: string, ids: string[]) {
  const supabase = await createClient()
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase.from('objetivos').update({ orden: i }).eq('id', ids[i]!)
    if (error) throw new Error(error.message)
  }
  revalidate()
}
