'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, GitBranch } from 'lucide-react'
import type { ComponenteConProyectos } from '@/types/domain'

interface NavTreeProps {
  componentes: ComponenteConProyectos[]
  collapsed?: boolean
}

export function NavTree({ componentes, collapsed = false }: NavTreeProps) {
  const pathname = usePathname() ?? '/'

  if (collapsed) {
    return (
      <nav className="flex-1 overflow-y-auto px-2 py-2.5">
        <IconLink href="/" active={pathname === '/'} title="Inicio" accent="var(--color-alcaldia-naranja)">
          <Home size={16} />
        </IconLink>
        <IconLink href="/linea-tiempo" active={pathname === '/linea-tiempo'} title="Cronograma" accent="#93c5fd">
          <GitBranch size={16} />
        </IconLink>
        <div className="my-2 h-px bg-[var(--color-surface-border)]" />
        <ul className="space-y-1">
          {componentes.map((c) => {
            const base = `/${c.slug}`
            const active = pathname === base || pathname.startsWith(base + '/')
            return (
              <li key={c.id}>
                <Link
                  href={base}
                  title={`${c.nombre} · ${Math.round(c.avance_calculado)}%`}
                  aria-label={c.nombre}
                  className="flex items-center justify-center rounded-lg py-2 text-lg"
                  style={{ background: active ? `${c.color_hex}22` : 'transparent' }}
                >
                  <span aria-hidden>{c.icono}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )
  }

  return (
    <nav className="flex-1 overflow-y-auto px-2 py-2.5 text-[var(--color-text-secondary)]">
      <NavLink
        href="/"
        active={pathname === '/'}
        icon={<Home size={14} />}
        label="Inicio"
        accent="var(--color-alcaldia-naranja)"
      />
      <NavLink
        href="/linea-tiempo"
        active={pathname === '/linea-tiempo'}
        icon={<GitBranch size={14} />}
        label="Cronograma"
        accent="#93c5fd"
      />

      <div className="my-2.5 h-px bg-[var(--color-surface-border)]" />

      <ul className="space-y-1">
        {componentes.map((c) => {
          const base = `/${c.slug}`
          const active = pathname === base || pathname.startsWith(base + '/')
          return (
            <li key={c.id}>
              <Link
                href={base}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
                style={{
                  background: active ? `${c.color_hex}18` : 'transparent',
                  borderLeft: active
                    ? `3px solid ${c.color_hex}`
                    : '3px solid transparent',
                }}
              >
                <span className="shrink-0 text-base leading-none" aria-hidden>
                  {c.icono}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[11px]"
                    style={{
                      color: active ? c.color_hex : 'var(--color-text-secondary)',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {c.nombre}
                  </p>
                  <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${c.avance_calculado}%`,
                        background: c.color_hex,
                        opacity: active ? 1 : 0.6,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="shrink-0 text-[10px] font-semibold tabular-nums"
                  style={{ color: c.color_hex, opacity: active ? 1 : 0.7 }}
                >
                  {Math.round(c.avance_calculado)}%
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function IconLink({
  href,
  active,
  title,
  accent,
  children,
}: {
  href: string
  active: boolean
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      title={title}
      aria-label={title}
      className="mb-1 flex items-center justify-center rounded-lg py-2 transition-colors"
      style={{
        background: active ? `${accent}22` : 'transparent',
        color: active ? accent : 'var(--color-text-muted)',
      }}
    >
      {children}
    </Link>
  )
}

function NavLink({
  href,
  active,
  icon,
  label,
  accent,
}: {
  href: string
  active: boolean
  icon: React.ReactNode
  label: string
  accent: string
}) {
  return (
    <Link
      href={href}
      className="mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors"
      style={{
        background: active ? `${accent}1f` : 'transparent',
        color: active ? accent : 'var(--color-text-muted)',
      }}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}
