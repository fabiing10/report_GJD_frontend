import { getInformeActivo } from '@/lib/db/queries'

export default async function AdminDashboard() {
  const informe = await getInformeActivo()

  if (!informe) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <div className="rounded-xl p-6 border" style={{ background: 'var(--color-surface-card)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <p className="text-sm text-red-400 mb-3">No hay informe activo. Corre el seed.</p>
          <code className="text-xs text-[var(--color-text-muted)]">pnpm seed</code>
        </div>
      </div>
    )
  }

  const totalProyectos = informe.componentes.reduce((acc, c) => acc + c.proyectos.length, 0)
  const completados = informe.componentes.reduce((acc, c) => acc + c.proyectos.filter(p => p.estado === 'completado').length, 0)
  const enProgreso = informe.componentes.reduce((acc, c) => acc + c.proyectos.filter(p => p.estado === 'en_progreso').length, 0)
  const bloqueados = informe.componentes.reduce((acc, c) => acc + c.proyectos.filter(p => p.estado === 'bloqueado').length, 0)

  const stats = [
    { label: 'Avance global', value: `${Math.round(informe.avance_global_calculado)}%`, color: 'var(--color-alcaldia-naranja)' },
    { label: 'Total proyectos', value: String(totalProyectos), color: 'var(--color-text-primary)' },
    { label: 'Completados', value: String(completados), color: 'var(--color-estado-completado)' },
    { label: 'En progreso', value: String(enProgreso), color: 'var(--color-estado-en-progreso)' },
    { label: 'Bloqueados', value: String(bloqueados), color: 'var(--color-estado-bloqueado)' },
    { label: 'Componentes', value: String(informe.componentes.length), color: '#8B5CF6' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          {informe.titulo} — Corte {informe.fecha_corte}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4 border"
            style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
          >
            <p className="text-[10px] text-[var(--color-text-muted)] mb-1">{label}</p>
            <p className="text-2xl font-display font-bold tabular-nums" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5 border" style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Avance por componente</h2>
        <div className="space-y-3">
          {informe.componentes.map(c => (
            <div key={c.id} className="flex items-center gap-3">
              <span className="text-lg w-6">{c.icono}</span>
              <span className="text-xs text-[var(--color-text-secondary)] w-48 truncate">{c.nombre}</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${c.avance_calculado}%`, backgroundColor: c.color_hex }}
                />
              </div>
              <span className="text-xs tabular-nums font-semibold w-10 text-right" style={{ color: c.color_hex }}>
                {Math.round(c.avance_calculado)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl p-4 border text-xs text-[var(--color-text-muted)]"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        La gestión y edición de informes, componentes, proyectos y criterios
        llegará en el backoffice. Por ahora los datos se administran vía seed o
        el panel de Supabase.
      </div>
    </div>
  )
}
