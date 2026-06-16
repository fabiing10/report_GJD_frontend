'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { actividadSchema, type ActividadFormValues } from '@/lib/schemas'

const RUTA = '/admin/actividades'

export async function crearActividad(input: ActividadFormValues): Promise<void> {
  const data = actividadSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase
    .from('actividades')
    .insert({ ...data, orden: 0 })
  if (error) throw new Error(error.message)
  revalidatePath(RUTA)
}

export async function actualizarActividad(
  id: string,
  input: ActividadFormValues
): Promise<void> {
  const data = actividadSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase
    .from('actividades')
    .update(data)
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(RUTA)
}

export async function eliminarActividad(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('actividades').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath(RUTA)
}
