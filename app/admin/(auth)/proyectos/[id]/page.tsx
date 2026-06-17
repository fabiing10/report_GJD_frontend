import { notFound } from 'next/navigation'
import { getProyectoEditable, getAllEjes } from '@/lib/db/admin-queries'
import { ProyectoEditor } from '@/components/admin/ProyectoEditor'

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [detalle, ejes] = await Promise.all([getProyectoEditable(id), getAllEjes()])

  if (!detalle) {
    notFound()
  }

  return <ProyectoEditor proyecto={detalle} ejesDisponibles={ejes} />
}
