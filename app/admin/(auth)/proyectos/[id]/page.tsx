import { notFound } from 'next/navigation'
import { getProyectoEditable } from '@/lib/db/admin-queries'
import { ProyectoEditor } from '@/components/admin/ProyectoEditor'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detalle = await getProyectoEditable(id)

  if (!detalle) {
    notFound()
  }

  return <ProyectoEditor proyecto={detalle} />
}
