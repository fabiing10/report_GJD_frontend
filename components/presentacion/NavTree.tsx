'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, GitBranch, ChevronRight } from 'lucide-react'
import type { ComponenteConProyectos } from '@/types/domain'

interface NavTreeProps {
  componentes: ComponenteConProyectos[]
}

const ESTADO_DOT: Record<string, string> = {
  completado: 'var(--color-estado-completado)',
  en_progreso: 'var(--color-estado-en-progreso)',
  no_iniciado: 'var(--color-estado-no-iniciado)',
  refinamiento: 'var(--color-estado-refinamiento)',
  bloqueado: 'var(--color-estado-bloqueado)',
}

export function NavTree({ componentes }: NavTreeProps) {
  const pathname = usePathname() ?? '/'

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
        label="Línea de Tiempo"
        accent="#93c5fd"
      />

      <div className="my-2.5 h-px bg-[var(--color-surface-border)]" />

      <ul className="space-y-0.5">
        {componentes.map((c) => (
          <ComponenteNode key={c.id} componente={c} pathname={pathname} />
        ))}
      </ul>
    </nav>
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

function ComponenteNode({
  componente,
  pathname,
}: {
  componente: ComponenteConProyectos
  pathname: string
}) {
  const base = `/${componente.slug}`
  const inPath = pathname === base || pathname.startsWith(base + '/')
  const [open, setOpen] = useState(inPath)
  const color = componente.color_hex

  return (
    <li>
      <div
        className="flex items-center gap-1 rounded-lg pr-1.5"
        style={{
          background: pathname === base ? `${color}18` : 'transparent',
          borderLeft: inPath ? `3px solid ${color}` : '3px solid transparent',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? `Colapsar ${componente.nombre}` : `Expandir ${componente.nombre}`}
          className="shrink-0 p-1 text-[var(--color-text-muted)]"
        >
          <ChevronRight
            size={13}
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
          />
        </button>
        <Link href={base} className="flex min-w-0 flex-1 items-center gap-2 py-2 text-[11px]">
          <span className="shrink-0 text-base leading-none" aria-hidden>
            {componente.icono}
          </span>
          <span
            className="min-w-0 flex-1 truncate"
            style={{
              color: inPath ? color : 'var(--color-text-secondary)',
              fontWeight: inPath ? 600 : 400,
            }}
          >
            {componente.nombre}
          </span>
          <span
            className="shrink-0 text-[10px] font-semibold tabular-nums"
            style={{ color, opacity: inPath ? 1 : 0.7 }}
          >
            {Math.round(componente.avance_calculado)}%
          </span>
        </Link>
      </div>

      {open && (
        <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-[var(--color-surface-border)] pl-1.5">
          {componente.proyectos.map((p) => (
            <ProyectoNode
              key={p.id}
              componenteSlug={componente.slug}
              proyecto={p}
              color={color}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function ProyectoNode({
  componenteSlug,
  proyecto,
  color,
  pathname,
}: {
  componenteSlug: string
  proyecto: ComponenteConProyectos['proyectos'][number]
  color: string
  pathname: string
}) {
  const base = `/${componenteSlug}/${proyecto.slug}`
  const current = pathname === base
  const [open, setOpen] = useState(current)

  return (
    <li>
      <div
        className="flex items-center gap-1 rounded-md pr-1.5"
        style={{ background: current ? `${color}14` : 'transparent' }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? `Colapsar ${proyecto.nombre}` : `Expandir ${proyecto.nombre}`}
          className="shrink-0 p-1 text-[var(--color-text-muted)]"
        >
          <ChevronRight
            size={11}
            style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}
          />
        </button>
        <Link href={base} className="flex min-w-0 flex-1 items-center gap-2 py-1.5">
          <span
            className="min-w-0 flex-1 truncate text-[11px]"
            style={{
              color: current ? color : 'var(--color-text-secondary)',
              fontWeight: current ? 600 : 400,
            }}
          >
            {proyecto.codigo ?? proyecto.nombre}
          </span>
          <span
            className="shrink-0 text-[10px] tabular-nums text-[var(--color-text-muted)]"
          >
            {Math.round(proyecto.avance_calculado)}%
          </span>
        </Link>
      </div>

      {open && proyecto.objetivos.length > 0 && (
        <ul className="ml-3.5 mt-0.5 space-y-px border-l border-[var(--color-surface-border)] pl-2">
          {proyecto.objetivos.map((o) => (
            <li key={o.id}>
              <Link
                href={`${base}?obj=${o.id}`}
                className="flex items-center gap-1.5 rounded py-1 pr-1 text-[10.5px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ background: ESTADO_DOT[o.estado] ?? 'var(--color-text-muted)' }}
                />
                <span className="min-w-0 flex-1 truncate">{o.titulo}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}
