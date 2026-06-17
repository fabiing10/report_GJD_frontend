import { getInformeActivo } from '@/lib/db/queries'
import { OverviewEstrategico } from '@/components/presentacion/OverviewEstrategico'

export default async function HomePage() {
  const informe = await getInformeActivo()
  if (!informe) return null

  return <OverviewEstrategico informe={informe} />
}
