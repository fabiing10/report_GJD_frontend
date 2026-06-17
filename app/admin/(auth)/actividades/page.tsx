import { getAllActividades } from '@/lib/db/admin-queries'
import { getInformeActivo } from '@/lib/db/queries'
import { ActividadesClient } from '@/components/admin/ActividadesClient'

export default async function ActividadesPage() {
  const [actividades, informe] = await Promise.all([
    getAllActividades(),
    getInformeActivo(),
  ])

  const objetivos = (informe?.componentes ?? []).flatMap((c) =>
    c.proyectos.flatMap((p) =>
      p.objetivos.map((o) => ({
        id: o.id,
        label: `${p.nombre} — ${o.titulo}`,
      }))
    )
  )

  return <ActividadesClient actividades={actividades} objetivos={objetivos} />
}
