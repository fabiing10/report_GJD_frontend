'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { EstrellasFondo } from './EstrellasFondo'
import { SideNav } from './SideNav'
import { Footer } from './Footer'
import { ModoPresentacionBar } from './ModoPresentacionBar'
import { useModoPresentacion } from './ModoPresentacionProvider'
import type { InformeConRelaciones } from '@/types/domain'

const SIDEBAR_EXPANDED = 240
const SIDEBAR_COLLAPSED = 60

interface PresentacionShellProps {
  informe: InformeConRelaciones
  children: React.ReactNode
}

export function PresentacionShell({ informe, children }: PresentacionShellProps) {
  const pathname = usePathname()
  const { isActive, activar, setSlides, setCurrentSlideIndex } = useModoPresentacion()

  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('gjd-sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('gjd-sidebar-collapsed', String(next))
      return next
    })
  }

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED

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

      {!isActive && (
        <SideNav
          componentes={informe.componentes}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
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
