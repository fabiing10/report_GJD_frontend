import { getInformeActivo } from '@/lib/db/queries'
import { isCurrentUserAdmin } from '@/lib/auth'
import { GanttCronograma } from '@/components/presentacion/GanttCronograma'
import { PresentacionShell } from '@/components/presentacion/PresentacionShell'

export default async function CronogramaPage() {
  const informe = await getInformeActivo()
  if (!informe) {
    return (
      <div className="p-8 text-red-400">
        No hay informe activo. Ejecuta <code>pnpm seed</code>.
      </div>
    )
  }

  const isAdmin = await isCurrentUserAdmin()

  return (
    <PresentacionShell informe={informe} isAdmin={isAdmin}>
      <div className="px-4 pt-6 pb-24">
        <h1 className="mb-2 font-display text-2xl font-bold text-[var(--color-text-primary)]">
          Cronograma
        </h1>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          Proyectos por componente proyectados de Enero 2026 a Diciembre 2027. Cada barra
          va según las fechas del proyecto o el rango de plazos de sus objetivos; el relleno
          indica el avance. Toca una barra para abrir el proyecto.
        </p>
        <GanttCronograma componentes={informe.componentes} />
      </div>
    </PresentacionShell>
  )
}
