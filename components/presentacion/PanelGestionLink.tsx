import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

interface PanelGestionLinkProps {
  /** Solo los administradores ven el acceso al backoffice. */
  isAdmin: boolean
  collapsed?: boolean
}

/** Acceso al panel de gestión desde el reporte, visible solo para admins. */
export function PanelGestionLink({ isAdmin, collapsed = false }: PanelGestionLinkProps) {
  if (!isAdmin) return null

  if (collapsed) {
    return (
      <Link
        href="/admin"
        title="Panel de gestión"
        aria-label="Panel de gestión"
        className="flex items-center justify-center py-2.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-alcaldia-naranja)]"
      >
        <LayoutDashboard size={16} />
      </Link>
    )
  }

  return (
    <Link
      href="/admin"
      className="flex items-center gap-2 px-4 py-2.5 text-[11px] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-alcaldia-naranja)]"
    >
      <LayoutDashboard size={13} />
      Panel de gestión
    </Link>
  )
}
