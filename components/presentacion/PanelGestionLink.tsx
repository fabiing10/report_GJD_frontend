import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { ViewSwitcher } from '@/components/ViewSwitcher'

interface PanelGestionLinkProps {
  /** Solo los administradores ven el acceso al backoffice. */
  isAdmin: boolean
  collapsed?: boolean
}

/**
 * Acceso al backoffice desde el reporte, solo para admins.
 * Expandido: switcher Reporte ↔ Dashboard. Colapsado (icon-rail): solo el ícono.
 */
export function PanelGestionLink({ isAdmin, collapsed = false }: PanelGestionLinkProps) {
  if (!isAdmin) return null

  if (collapsed) {
    return (
      <Link
        href="/admin"
        title="Ir al Dashboard"
        aria-label="Ir al Dashboard"
        className="flex items-center justify-center py-2.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-alcaldia-naranja)]"
      >
        <LayoutDashboard size={16} />
      </Link>
    )
  }

  return (
    <div className="px-3 py-2.5">
      <ViewSwitcher current="reporte" />
    </div>
  )
}
