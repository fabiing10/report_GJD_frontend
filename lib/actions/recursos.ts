'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { recursoSchema, type RecursoFormValues } from '@/lib/schemas'

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

async function nextOrden(proyectoId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proyecto_recursos')
    .select('orden')
    .eq('proyecto_id', proyectoId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const max = (data as { orden: number } | null)?.orden
  return typeof max === 'number' ? max + 1 : 0
}

export async function crearRecurso(input: RecursoFormValues) {
  const parsed = recursoSchema.parse(input)
  const orden = await nextOrden(parsed.proyecto_id)
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_recursos')
    .insert({ ...parsed, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarRecurso(id: string, input: RecursoFormValues) {
  const parsed = recursoSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_recursos')
    .update(parsed)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarRecurso(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('proyecto_recursos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}
