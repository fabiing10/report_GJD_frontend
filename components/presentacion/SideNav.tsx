'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, GitBranch, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ComponenteConAvance } from '@/types/domain'

interface SideNavProps {
  componentes: ComponenteConAvance[]
  collapsed: boolean
  onToggle: () => void
}

export function SideNav({ componentes, collapsed, onToggle }: SideNavProps) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isTimeline = pathname === '/linea-tiempo'

  const w = collapsed ? 60 : 240

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: w,
        zIndex: 30,
        background: 'rgba(8,14,30,0.97)',
        borderRight: '1px solid var(--color-surface-border)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: collapsed ? '18px 0' : '20px 16px 14px',
          borderBottom: '1px solid var(--color-surface-border)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {collapsed ? (
          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-alcaldia-naranja)' }}>
            G
          </span>
        ) : (
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-alcaldia-naranja)', letterSpacing: '0.04em', lineHeight: 1 }}>
              GJD
            </p>
            <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, lineHeight: 1.3 }}>
              Gestión Jurídica Digital
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '10px 4px' : '10px 8px' }}>
        {/* Inicio */}
        <Link
          href="/"
          title={collapsed ? 'Inicio' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            padding: collapsed ? '10px 0' : '8px 10px',
            borderRadius: 8,
            marginBottom: 2,
            background: isHome ? 'rgba(249,115,22,0.15)' : 'transparent',
            color: isHome ? 'var(--color-alcaldia-naranja)' : 'var(--color-text-muted)',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <Home size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>Inicio</span>}
        </Link>

        {/* Línea de Tiempo */}
        <Link
          href="/linea-tiempo"
          title={collapsed ? 'Línea de Tiempo' : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 10,
            padding: collapsed ? '10px 0' : '8px 10px',
            borderRadius: 8,
            marginBottom: 10,
            background: isTimeline ? 'rgba(99,130,200,0.15)' : 'transparent',
            color: isTimeline ? '#93c5fd' : 'var(--color-text-muted)',
            textDecoration: 'none',
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <GitBranch size={14} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 12, fontWeight: 500 }}>Línea de Tiempo</span>}
        </Link>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-surface-border)', margin: collapsed ? '0 8px 10px' : '0 4px 10px' }} />

        {/* Componentes */}
        {componentes.map((c) => {
          const isActive = pathname.startsWith(`/${c.slug}`)
          return (
            <Link
              key={c.id}
              href={`/${c.slug}`}
              title={collapsed ? c.nombre : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 9,
                padding: collapsed ? '10px 0' : '8px 10px',
                borderRadius: 8,
                marginBottom: 3,
                background: isActive ? `${c.color_hex}18` : 'transparent',
                borderLeft: !collapsed && isActive ? `3px solid ${c.color_hex}` : '3px solid transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: collapsed ? 20 : 18, lineHeight: 1, flexShrink: 0 }}>
                {c.icono}
              </span>

              {!collapsed && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? c.color_hex : 'var(--color-text-secondary)',
                      lineHeight: 1.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.nombre}
                  </p>
                  {/* Mini progress bar */}
                  <div
                    style={{
                      height: 3,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.08)',
                      marginTop: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${c.avance_calculado}%`,
                        background: c.color_hex,
                        borderRadius: 2,
                        opacity: isActive ? 1 : 0.6,
                      }}
                    />
                  </div>
                </div>
              )}

              {!collapsed && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: c.color_hex,
                    opacity: isActive ? 1 : 0.7,
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(c.avance_calculado)}%
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Toggle collapse */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          padding: '12px',
          margin: '8px',
          borderRadius: 8,
          background: 'transparent',
          border: '1px solid var(--color-surface-border)',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          fontSize: 11,
          transition: 'background 0.15s, color 0.15s',
          flexShrink: 0,
        }}
        aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
        title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed ? (
          <ChevronRight size={14} />
        ) : (
          <>
            <ChevronLeft size={14} />
            <span>Colapsar</span>
          </>
        )}
      </button>
    </aside>
  )
}
