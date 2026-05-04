'use server'

import { revalidatePath } from 'next/cache'
import { getDataClient } from '@/lib/db'
import { componenteSchema } from '@/lib/schemas'
import type { Componente } from '@/types/domain'

export async function updateComponenteAction(
  id: string,
  data: unknown
): Promise<Componente> {
  const parsed = componenteSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  const client = getDataClient()
  const updated = await client.updateComponente(id, parsed.data)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/componentes')
  return updated
}

export async function reorderComponentesAction(
  informeId: string,
  ids: string[]
): Promise<void> {
  const client = getDataClient()
  await client.reorderComponentes(informeId, ids)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/componentes')
}
