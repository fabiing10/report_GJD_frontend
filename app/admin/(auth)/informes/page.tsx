import { getAllInformes } from '@/lib/db/admin-queries'
import { InformesClient } from '@/components/admin/InformesClient'
import type { InformeConAvance } from '@/types/domain'

export default async function InformesPage() {
  // getAllInformes() lee la vista v_informes_con_avance, que incluye
  // avance_global_calculado además de los campos base de Informe.
  const informes = (await getAllInformes()) as InformeConAvance[]

  return <InformesClient informes={informes} />
}
