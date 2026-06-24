'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Layers, FolderKanban, Target, ClipboardList, Users } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/informes', label: 'Informes', icon: FileText, exact: false },
  { href: '/admin/componentes', label: 'Componentes', icon: Layers, exact: false },
  { href: '/admin/proyectos', label: 'Proyectos', icon: FolderKanban, exact: false },
  { href: '/admin/objetivos', label: 'Productos / Objetivos', icon: Target, exact: false },
  { href: '/admin/actividades', label: 'Actividades', icon: ClipboardList, exact: false },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 shrink-0 border-r flex flex-col"
      style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-surface-border)', minHeight: '100vh' }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
        <p className="text-xs font-bold text-[var(--color-alcaldia-naranja)]">GJD Admin</p>
        <p className="text-[10px] text-[var(--color-text-muted)]">Gestión Jurídica Digital</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors"
              style={
                isActive
                  ? { background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }
                  : { color: 'var(--color-text-muted)' }
              }
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-surface-border)' }}>
        <Link
          href="/"
          className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          Ver reporte →
        </Link>
      </div>
    </aside>
  )
}
