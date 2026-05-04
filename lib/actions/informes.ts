'use server'

import { revalidatePath } from 'next/cache'
import { getDataClient } from '@/lib/db'
import { informeSchema } from '@/lib/schemas'
import type { Informe } from '@/types/domain'

export async function updateInformeAction(id: string, data: unknown): Promise<Informe> {
  const parsed = informeSchema.safeParse(data)
  if (!parsed.success) throw new Error(parsed.error.message)
  const client = getDataClient()
  const updated = await client.updateInforme(id, parsed.data)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/informes')
  return updated
}

export async function setInformeActivoAction(id: string): Promise<void> {
  const client = getDataClient()
  await client.setInformeActivo(id)
  revalidatePath('/', 'layout')
  revalidatePath('/admin/informes')
}

export async function duplicarInformeAction(id: string): Promise<Informe> {
  const client = getDataClient()
  const nuevo = await client.duplicarInforme(id)
  revalidatePath('/admin/informes')
  return nuevo
}

export async function deleteInformeAction(id: string): Promise<void> {
  const client = getDataClient()
  await client.deleteInforme(id)
  revalidatePath('/admin/informes')
}
