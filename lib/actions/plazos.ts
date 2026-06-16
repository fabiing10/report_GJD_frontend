'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { plazoSchema, type PlazoFormValues } from '@/lib/schemas'

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

async function nextOrden(proyectoId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proyecto_plazos')
    .select('orden')
    .eq('proyecto_id', proyectoId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const max = (data as { orden: number } | null)?.orden
  return typeof max === 'number' ? max + 1 : 0
}

export async function crearPlazo(input: PlazoFormValues) {
  const parsed = plazoSchema.parse(input)
  const orden = await nextOrden(parsed.proyecto_id)
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_plazos')
    .insert({ ...parsed, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarPlazo(id: string, input: PlazoFormValues) {
  const parsed = plazoSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_plazos')
    .update(parsed)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarPlazo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('proyecto_plazos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}
