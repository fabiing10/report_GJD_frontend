import { getAllInformes, getComponentes, getProyectos } from '@/lib/db/admin-queries'
import { ProyectosClient, type ProyectoGrupo } from '@/components/admin/ProyectosClient'

export default async function ProyectosPage() {
  const informes = await getAllInformes()
  const informeActivo = informes.find((i) => i.is_active) ?? informes[0]

  if (!informeActivo) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
          Proyectos
        </h1>
        <div
          className="rounded-xl p-6 border"
          style={{ background: 'var(--color-surface-card)', borderColor: 'rgba(239,68,68,0.3)' }}
        >
          <p className="text-sm text-red-400 mb-3">
            No hay informe activo. Activa o crea un informe para gestionar sus proyectos.
          </p>
          <code className="text-xs text-[var(--color-text-muted)]">pnpm seed</code>
        </div>
      </div>
    )
  }

  const componentes = await getComponentes(informeActivo.id)
  const grupos: ProyectoGrupo[] = await Promise.all(
    componentes.map(async (componente) => ({
      componente,
      proyectos: await getProyectos(componente.id),
    }))
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
          Proyectos
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">{informeActivo.titulo}</p>
      </div>

      <ProyectosClient grupos={grupos} />
    </div>
  )
}
