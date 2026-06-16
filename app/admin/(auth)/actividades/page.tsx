import { getAllActividades } from '@/lib/db/admin-queries'
import { getInformeActivo } from '@/lib/db/queries'
import { ActividadesClient } from '@/components/admin/ActividadesClient'

export default async function ActividadesPage() {
  const [actividades, informe] = await Promise.all([
    getAllActividades(),
    getInformeActivo(),
  ])

  const proyectos = (informe?.componentes ?? []).flatMap((c) =>
    c.proyectos.map((p) => ({ id: p.id, nombre: p.nombre }))
  )

  return <ActividadesClient actividades={actividades} proyectos={proyectos} />
}
