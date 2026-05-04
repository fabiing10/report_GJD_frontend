'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { EstrellasFondo } from './EstrellasFondo'
import { HeaderTabs } from './HeaderTabs'
import { Footer } from './Footer'
import { ModoPresentacionBar } from './ModoPresentacionBar'
import { useModoPresentacion } from './ModoPresentacionProvider'
import type { InformeConRelaciones } from '@/types/domain'

interface PresentacionShellProps {
  informe: InformeConRelaciones
  children: React.ReactNode
}

export function PresentacionShell({
  informe,
  children,
}: PresentacionShellProps) {
  const pathname = usePathname()
  const { isActive, activar, setSlides, setCurrentSlideIndex } =
    useModoPresentacion()

  useEffect(() => {
    const slides = [
      { href: '/', title: 'Inicio' },
      ...informe.componentes.flatMap((c) => [
        { href: `/${c.slug}`, title: c.nombre },
        ...c.proyectos.map((p) => ({
          href: `/${c.slug}/${p.slug}`,
          title: p.nombre,
        })),
      ]),
      { href: '/linea-tiempo', title: 'Línea de Tiempo' },
    ]
    setSlides(slides)
  }, [informe, setSlides])

  // Sincroniza el index actual con la ruta visitada
  useEffect(() => {
    if (!pathname) return
    const slides = [
      { href: '/', title: 'Inicio' },
      ...informe.componentes.flatMap((c) => [
        { href: `/${c.slug}`, title: c.nombre },
        ...c.proyectos.map((p) => ({
          href: `/${c.slug}/${p.slug}`,
          title: p.nombre,
        })),
      ]),
      { href: '/linea-tiempo', title: 'Línea de Tiempo' },
    ]
    const idx = slides.findIndex((s) => s.href === pathname)
    if (idx !== -1) setCurrentSlideIndex(idx)
  }, [pathname, informe, setCurrentSlideIndex])

  return (
    <div className="relative min-h-screen">
      <EstrellasFondo />
      {!isActive && <HeaderTabs componentes={informe.componentes} />}
      <main className="relative z-10 pb-24 transition-transform origin-top">
        {children}
      </main>
      {isActive ? (
        <ModoPresentacionBar informe={informe} />
      ) : (
        <Footer fechaCorte={informe.fecha_corte} onPresentar={activar} />
      )}
    </div>
  )
}
