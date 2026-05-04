'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { ComponenteConAvance } from '@/types/domain'

interface HeaderTabsProps {
  componentes: ComponenteConAvance[]
}

export function HeaderTabs({ componentes }: HeaderTabsProps) {
  const pathname = usePathname()

  return (
    <header
      className="relative z-20 flex items-center gap-0 px-4 pt-4 pb-0 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      <Link href="/" className="shrink-0 mr-4">
        <Image
          src="/logo-gjd.svg"
          alt="GJD"
          width={36}
          height={36}
          className="opacity-80 hover:opacity-100 transition-opacity"
        />
      </Link>
      <nav className="flex gap-1">
        {componentes.map((c) => {
          const isActive = pathname.startsWith(`/${c.slug}`)
          return (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
              style={
                isActive
                  ? {
                      backgroundColor: `${c.color_hex}22`,
                      color: c.color_hex,
                      borderBottom: `2px solid ${c.color_hex}`,
                      boxShadow: `0 0 12px ${c.color_hex}22`,
                    }
                  : {
                      color: 'var(--color-text-muted)',
                      borderBottom: '2px solid transparent',
                    }
              }
            >
              <span aria-hidden="true">{c.icono}</span>
              <span className="hidden sm:inline">{c.nombre}</span>
            </Link>
          )
        })}
        <Link
          href="/linea-tiempo"
          className="flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-medium transition-all duration-150 whitespace-nowrap"
          style={
            pathname.startsWith('/linea-tiempo')
              ? {
                  backgroundColor: 'rgba(249,115,22,0.13)',
                  color: 'var(--color-alcaldia-naranja)',
                  borderBottom: '2px solid var(--color-alcaldia-naranja)',
                }
              : {
                  color: 'var(--color-text-muted)',
                  borderBottom: '2px solid transparent',
                }
          }
        >
          <span aria-hidden="true">🗓️</span>
          <span className="hidden sm:inline">Línea de tiempo</span>
        </Link>
      </nav>
    </header>
  )
}
