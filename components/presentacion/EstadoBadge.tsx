import type { EstadoEnum, PlazoEnum } from '@/types/domain'

const ESTADO_CONFIG: Record<
  EstadoEnum,
  { label: string; color: string; bg: string }
> = {
  completado: {
    label: 'Completado',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
  },
  en_progreso: {
    label: 'En progreso',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
  },
  no_iniciado: {
    label: 'No iniciado',
    color: '#64748B',
    bg: 'rgba(100,116,139,0.15)',
  },
  refinamiento: {
    label: 'Refinamiento',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.15)',
  },
  bloqueado: {
    label: 'Bloqueado',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.15)',
  },
}

const PLAZO_CONFIG: Record<PlazoEnum, { label: string }> = {
  corto: { label: 'Corto plazo' },
  mediano: { label: 'Mediano plazo' },
  largo: { label: 'Largo plazo' },
}

interface EstadoBadgeProps {
  estado: EstadoEnum
  className?: string
}

interface PlazoBadgeProps {
  plazo: PlazoEnum
  className?: string
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const { label, color, bg } = ESTADO_CONFIG[estado]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className ?? ''}`}
      style={{ color, backgroundColor: bg }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

export function PlazoBadge({ plazo, className }: PlazoBadgeProps) {
  const { label } = PLAZO_CONFIG[plazo]
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-[var(--color-text-secondary)] border border-white/10 ${className ?? ''}`}
    >
      {label}
    </span>
  )
}
