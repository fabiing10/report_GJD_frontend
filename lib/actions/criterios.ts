'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { criterioSchema, type CriterioFormValues } from '@/lib/schemas'

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

async function nextOrden(plazoId: string): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('criterios')
    .select('orden')
    .eq('proyecto_plazo_id', plazoId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const max = (data as { orden: number } | null)?.orden
  return typeof max === 'number' ? max + 1 : 0
}

export async function crearCriterio(input: CriterioFormValues) {
  const parsed = criterioSchema.parse(input)
  const orden = await nextOrden(parsed.proyecto_plazo_id)
  const supabase = await createClient()
  const { error } = await supabase.from('criterios').insert({ ...parsed, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarCriterio(id: string, input: CriterioFormValues) {
  const parsed = criterioSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('criterios').update(parsed).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarCriterio(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('criterios').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function reordenarCriterios(_plazoId: string, ids: string[]) {
  const supabase = await createClient()
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('criterios')
      .update({ orden: i })
      .eq('id', ids[i])
    if (error) throw new Error(error.message)
  }
  revalidate()
}
