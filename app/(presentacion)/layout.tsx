import { getInformeActivo } from '@/lib/db/queries'
import { isCurrentUserAdmin } from '@/lib/auth'
import { PresentacionShell } from '@/components/presentacion/PresentacionShell'

export default async function PresentacionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const informe = await getInformeActivo()
  if (!informe) {
    return (
      <div className="p-8 text-red-400">
        No hay informe activo. Ejecuta <code>pnpm seed</code>.
      </div>
    )
  }

  // El rol se resuelve por petición (el reporte ya está detrás de login).
  const isAdmin = await isCurrentUserAdmin()

  return (
    <PresentacionShell informe={informe} isAdmin={isAdmin}>
      {children}
    </PresentacionShell>
  )
}
