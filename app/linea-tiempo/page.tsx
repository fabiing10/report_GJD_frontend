import { getDataClient } from '@/lib/db'
import { TimelineSVG } from '@/components/presentacion/TimelineSVG'
import { PresentacionShell } from '@/components/presentacion/PresentacionShell'

export const revalidate = 60

export default async function LineaTiempoPage() {
  const client = getDataClient()
  const informe = await client.getInformeActivo()
  if (!informe) {
    return (
      <div className="p-8 text-red-400">
        No hay informe activo. Ejecuta <code>pnpm seed</code>.
      </div>
    )
  }

  return (
    <PresentacionShell informe={informe}>
      <div className="px-4 pt-6 pb-24 max-w-6xl mx-auto">
        <h1 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-2">
          Línea de Tiempo
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mb-8">
          Distribución de proyectos por horizonte temporal. El radio de cada
          punto representa el avance.
        </p>
        <TimelineSVG
          componentes={informe.componentes}
          fechaCorte={informe.fecha_corte}
        />
      </div>
    </PresentacionShell>
  )
}
