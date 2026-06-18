'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { EstrellasFondo } from './EstrellasFondo'
import { NavTree } from './NavTree'
import { PanelGestionLink } from './PanelGestionLink'
import { Footer } from './Footer'
import { ModoPresentacionBar } from './ModoPresentacionBar'
import { useModoPresentacion } from './ModoPresentacionProvider'
import type { InformeConRelaciones } from '@/types/domain'

const SIDEBAR_WIDTH = 264

interface PresentacionShellProps {
  informe: InformeConRelaciones
  isAdmin: boolean
  children: React.ReactNode
}

export function PresentacionShell({ informe, isAdmin, children }: PresentacionShellProps) {
  const pathname = usePathname()
  const { isActive, activar, setSlides, setCurrentSlideIndex } = useModoPresentacion()

  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gjd-sidebar-hidden')
    if (saved === 'true') setHidden(true)
  }, [])

  const toggleSidebar = () => {
    setHidden((prev) => {
      const next = !prev
      localStorage.setItem('gjd-sidebar-hidden', String(next))
      return next
    })
  }

  const sidebarWidth = hidden ? 0 : SIDEBAR_WIDTH

  useEffect(() => {
    const slides = [
      { href: '/', title: 'Inicio' },
      ...informe.componentes.flatMap((c) => [
        { href: `/${c.slug}`, title: c.nombre },
        ...c.proyectos.map((p) => ({ href: `/${c.slug}/${p.slug}`, title: p.nombre })),
      ]),
      { href: '/linea-tiempo', title: 'Línea de Tiempo' },
    ]
    setSlides(slides)
  }, [informe, setSlides])

  useEffect(() => {
    if (!pathname) return
    const slides = [
      { href: '/', title: 'Inicio' },
      ...informe.componentes.flatMap((c) => [
        { href: `/${c.slug}`, title: c.nombre },
        ...c.proyectos.map((p) => ({ href: `/${c.slug}/${p.slug}`, title: p.nombre })),
      ]),
      { href: '/linea-tiempo', title: 'Línea de Tiempo' },
    ]
    const idx = slides.findIndex((s) => s.href === pathname)
    if (idx !== -1) setCurrentSlideIndex(idx)
  }, [pathname, informe, setCurrentSlideIndex])

  return (
    <div className="relative min-h-screen">
      <EstrellasFondo />

      {!isActive && !hidden && (
        <aside
          className="fixed inset-y-0 left-0 z-30 flex flex-col"
          style={{
            width: SIDEBAR_WIDTH,
            background: 'rgba(8,14,30,0.97)',
            borderRight: '1px solid var(--color-surface-border)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-surface-border)] px-4 py-3.5">
            <div>
              <p className="text-[13px] font-bold leading-none tracking-wide text-[var(--color-alcaldia-naranja)]">
                GJD
              </p>
              <p className="mt-1 text-[10px] leading-tight text-[var(--color-text-muted)]">
                Gestión Jurídica Digital
              </p>
            </div>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Ocultar menú"
              title="Ocultar menú"
              className="rounded-md p-1.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>
          <PanelGestionLink isAdmin={isAdmin} />
          <NavTree componentes={informe.componentes} />
        </aside>
      )}

      {!isActive && hidden && (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Mostrar menú"
          title="Mostrar menú"
          className="fixed left-3 top-3 z-40 rounded-md border border-[var(--color-surface-border)] bg-[rgba(8,14,30,0.9)] p-2 text-[var(--color-text-muted)] backdrop-blur transition-colors hover:text-[var(--color-text-secondary)]"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      <main
        className="relative z-10 pb-24 transition-all duration-200"
        style={{ paddingLeft: isActive ? 0 : sidebarWidth }}
      >
        {children}
      </main>

      {isActive ? (
        <ModoPresentacionBar informe={informe} />
      ) : (
        <Footer
          fechaCorte={informe.fecha_corte}
          onPresentar={activar}
          sidebarWidth={sidebarWidth}
        />
      )}
    </div>
  )
}
