import { getAllObjetivos } from '@/lib/db/admin-queries'
import { getInformeActivo } from '@/lib/db/queries'
import { ObjetivosClient } from '@/components/admin/ObjetivosClient'

export default async function ObjetivosPage() {
  const [objetivos, informe] = await Promise.all([getAllObjetivos(), getInformeActivo()])

  const proyectos = (informe?.componentes ?? []).flatMap((c) =>
    c.proyectos.map((p) => ({ id: p.id, label: `${c.nombre} — ${p.nombre}` }))
  )

  return <ObjetivosClient objetivos={objetivos} proyectos={proyectos} />
}
