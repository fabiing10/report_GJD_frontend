import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { ProgressBar } from '@/components/presentacion/ProgressBar'
import { EstadoBadge, PlazoBadge } from '@/components/presentacion/EstadoBadge'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'
import { Breadcrumbs } from '@/components/presentacion/Breadcrumbs'

const COLORS = ['#3B82F6', '#8B5CF6', '#06B6D4', '#A855F7', '#94A3B8', '#F43F5E']

export default function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] p-12 space-y-12">
      <h1 className="text-2xl font-display font-semibold text-[var(--color-text-primary)]">
        Component Showcase — GJD
      </h1>

      <section>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          ProgressRing
        </h2>
        <div className="flex flex-wrap gap-8 items-center">
          {COLORS.map((color, i) => (
            <div key={color} className="flex flex-col items-center gap-2">
              <ProgressRing value={(i + 1) * 14} color={color} size="sm" />
              <ProgressRing value={(i + 1) * 14} color={color} size="md" />
            </div>
          ))}
          <ProgressRing value={72} color="#3B82F6" size="lg" label="Global" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          ProgressBar
        </h2>
        <div className="space-y-3 max-w-sm">
          {COLORS.map((color, i) => (
            <ProgressBar key={color} value={(i + 1) * 14} color={color} showLabel />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Badges
        </h2>
        <div className="flex flex-wrap gap-3">
          <EstadoBadge estado="completado" />
          <EstadoBadge estado="en_progreso" />
          <EstadoBadge estado="no_iniciado" />
          <EstadoBadge estado="refinamiento" />
          <EstadoBadge estado="bloqueado" />
          <PlazoBadge plazo="corto" />
          <PlazoBadge plazo="mediano" />
          <PlazoBadge plazo="largo" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          PaginadorPuntos
        </h2>
        <div className="flex flex-col gap-3">
          <PaginadorPuntos total={5} current={0} />
          <PaginadorPuntos total={5} current={2} color="#F97316" />
          <PaginadorPuntos total={5} current={4} color="#22C55E" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">
          Breadcrumbs
        </h2>
        <Breadcrumbs
          items={[
            { label: 'Inicio', href: '/' },
            { label: 'Gestión de Notificaciones', href: '/gestion-notificaciones' },
            { label: 'HU-1 Gestión de Notificaciones' },
          ]}
        />
      </section>
    </div>
  )
}
