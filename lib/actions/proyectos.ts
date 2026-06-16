'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { proyectoSchema, type ProyectoFormValues } from '@/lib/schemas'

async function nextOrden(
  table: string,
  filterCol: string,
  filterVal: string
): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase
    .from(table)
    .select('orden')
    .eq(filterCol, filterVal)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const max = (data as { orden: number } | null)?.orden
  return typeof max === 'number' ? max + 1 : 0
}

function revalidate() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/proyectos')
}

export async function crearProyecto(input: ProyectoFormValues) {
  const parsed = proyectoSchema.parse(input)
  const orden = await nextOrden('proyectos', 'componente_id', parsed.componente_id)
  const supabase = await createClient()
  const { error } = await supabase.from('proyectos').insert({ ...parsed, orden })
  if (error) throw new Error(error.message)
  revalidate()
}

export async function actualizarProyecto(id: string, input: ProyectoFormValues) {
  const parsed = proyectoSchema.parse(input)
  const supabase = await createClient()
  const { error } = await supabase.from('proyectos').update(parsed).eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
  revalidatePath(`/admin/proyectos/${id}`)
}

export async function eliminarProyecto(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('proyectos').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidate()
}

export async function reordenarProyectos(_componenteId: string, ids: string[]) {
  const supabase = await createClient()
  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('proyectos')
      .update({ orden: i })
      .eq('id', ids[i])
    if (error) throw new Error(error.message)
  }
  revalidate()
}
