import { getDataClient } from '@/lib/db'
import { InformesClient } from './InformesClient'

export default async function AdminInformesPage() {
  const client = getDataClient()
  const informes = await client.getAllInformes()

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">Informes</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Gestiona los informes de avance. Solo uno puede estar activo a la vez.
        </p>
      </div>
      <InformesClient informes={informes} />
    </div>
  )
}
