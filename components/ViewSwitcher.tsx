import Link from 'next/link'
import { LayoutDashboard, FileBarChart2 } from 'lucide-react'

type Vista = 'reporte' | 'dashboard'

/**
 * Alterna entre el Reporte (frontoffice) y el Dashboard (backoffice).
 * Solo para admins; marca la vista actual. Consistente en ambas zonas.
 */
export function ViewSwitcher({ current }: { current: Vista }) {
  return (
    <div
      className="inline-flex items-center gap-0.5 rounded-lg border p-0.5"
      role="group"
      aria-label="Cambiar de vista"
      style={{ borderColor: 'var(--color-surface-border)', background: 'rgba(255,255,255,0.03)' }}
    >
      <Segmento href="/" label="Reporte" icon={<FileBarChart2 size={13} />} active={current === 'reporte'} />
      <Segmento href="/admin" label="Dashboard" icon={<LayoutDashboard size={13} />} active={current === 'dashboard'} />
    </div>
  )
}

function Segmento({
  href,
  label,
  icon,
  active,
}: {
  href: string
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors"
      style={
        active
          ? { background: 'rgba(249,115,22,0.16)', color: 'var(--color-alcaldia-naranja)' }
          : { color: 'var(--color-text-muted)' }
      }
    >
      {icon}
      {label}
    </Link>
  )
}
