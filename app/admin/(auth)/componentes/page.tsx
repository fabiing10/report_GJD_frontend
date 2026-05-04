import { getDataClient } from '@/lib/db'
import { ComponenteSortableList } from '@/components/admin/ComponenteSortableList'

export default async function AdminComponentesPage() {
  const client = getDataClient()
  const informe = await client.getInformeActivo()

  if (!informe) {
    return <p className="text-sm text-red-400">Sin informe activo.</p>
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">Componentes</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Arrastra para reordenar. Haz clic en el icono para editar.
        </p>
      </div>
      <ComponenteSortableList componentes={informe.componentes} informeId={informe.id} />
    </div>
  )
}
