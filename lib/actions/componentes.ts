'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { componenteSchema, type ComponenteFormValues } from '@/lib/schemas'

function revalidar() {
  revalidatePath('/', 'layout')
  revalidatePath('/admin/componentes')
}

export async function crearComponente(input: ComponenteFormValues) {
  const data = componenteSchema.parse(input)
  const supabase = await createClient()

  const { data: ultimo, error: selectError } = await supabase
    .from('componentes')
    .select('orden')
    .eq('informe_id', data.informe_id)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (selectError) throw new Error(selectError.message)

  const orden = ultimo ? ultimo.orden + 1 : 0

  const { error } = await supabase.from('componentes').insert({ ...data, orden })
  if (error) throw new Error(error.message)

  revalidar()
}

export async function actualizarComponente(id: string, input: ComponenteFormValues) {
  const data = componenteSchema.parse(input)
  const supabase = await createClient()

  const { error } = await supabase.from('componentes').update(data).eq('id', id)
  if (error) throw new Error(error.message)

  revalidar()
}

export async function eliminarComponente(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('componentes').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidar()
}

export async function reordenarComponentes(ids: string[]) {
  const supabase = await createClient()

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from('componentes')
      .update({ orden: i })
      .eq('id', ids[i]!)
    if (error) throw new Error(error.message)
  }

  revalidar()
}
