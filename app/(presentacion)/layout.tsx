import { getDataClient } from '@/lib/db'
import { PresentacionShell } from '@/components/presentacion/PresentacionShell'

export const revalidate = 60

export default async function PresentacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = getDataClient()
  const informe = await client.getInformeActivo()
  if (!informe) {
    return (
      <div className="p-8 text-red-400">
        No hay informe activo. Ejecuta <code>pnpm seed</code>.
      </div>
    )
  }

  return <PresentacionShell informe={informe}>{children}</PresentacionShell>
}
