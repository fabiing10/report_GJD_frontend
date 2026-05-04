import { getDataClient } from '@/lib/db'
import { ProyectoDataTable } from '@/components/admin/ProyectoDataTable'
import type { ComponenteConProyectos, ProyectoDetalle } from '@/types/domain'

type ProyectoRow = ProyectoDetalle & { componente: ComponenteConProyectos }

export default async function AdminProyectosPage() {
  const client = getDataClient()
  const informe = await client.getInformeActivo()

  if (!informe) {
    return <p className="text-sm text-red-400">Sin informe activo. Corre pnpm seed.</p>
  }

  const proyectosFlat: ProyectoRow[] = informe.componentes.flatMap(c =>
    c.proyectos.map(p => ({ ...p, componente: c }))
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">Proyectos</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Edita estado y avance inline. Haz clic en el icono de edición para el formulario completo.
        </p>
      </div>
      <ProyectoDataTable proyectos={proyectosFlat} componentes={informe.componentes} />
    </div>
  )
}
