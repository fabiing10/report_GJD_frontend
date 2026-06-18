import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

interface PanelGestionLinkProps {
  /** Solo los administradores ven el acceso al backoffice. */
  isAdmin: boolean
}

/** Acceso al panel de gestión desde el reporte, visible solo para admins. */
export function PanelGestionLink({ isAdmin }: PanelGestionLinkProps) {
  if (!isAdmin) return null

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
