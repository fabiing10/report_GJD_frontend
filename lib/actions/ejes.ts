'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ejeSchema, type EjeFormValues } from '@/lib/schemas'

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

export async function crearEje(input: EjeFormValues) {
  const data = ejeSchema.parse(input)
  const supabase = await createClient()
  const { data: last } = await supabase
    .from('ejes_transversales')
    .select('orden')
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const orden = ((last as { orden?: number } | null)?.orden ?? -1) + 1
  const { error } = await supabase.from('ejes_transversales').insert({ ...data, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarEje(id: string, input: EjeFormValues) {
  const data = ejeSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('ejes_transversales').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function eliminarEje(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('ejes_transversales').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function asignarEjeProyecto(proyectoId: string, ejeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_ejes')
    .insert({ proyecto_id: proyectoId, eje_id: ejeId })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function quitarEjeProyecto(proyectoId: string, ejeId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('proyecto_ejes')
    .delete()
    .eq('proyecto_id', proyectoId)
    .eq('eje_id', ejeId)
  if (error) throw new Error(error.message)
  revalidate()
}
