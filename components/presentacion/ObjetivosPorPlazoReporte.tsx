'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  PLAZO_ORDER,
  PLAZO_LABEL,
  objetivosPorPlazo,
  avancePlazo,
} from '@/lib/objetivos'
import type { ObjetivoDetalle, PlazoEnum } from '@/types/domain'

const ESTADO_DOT: Record<string, string> = {
  cumplido: 'var(--color-estado-completado)',
  en_progreso: 'var(--color-estado-en-progreso)',
  pendiente: 'var(--color-estado-no-iniciado)',
}
const TIPO_LABEL = { hu: 'HU', funcionalidad: 'Func.' } as const

export function ObjetivosPorPlazoReporte({
  objetivos,
  colorHex,
}: {
  objetivos: ObjetivoDetalle[]
  colorHex: string
}) {
  const searchParams = useSearchParams()
  const activeId = searchParams.get('obj')

  const plazosConObjetivos = PLAZO_ORDER.filter(
    (plz) => objetivosPorPlazo(objetivos, plz).length > 0
  )
  const [tab, setTab] = useState<PlazoEnum>(plazosConObjetivos[0] ?? 'corto')

  if (plazosConObjetivos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Este proyecto aún no tiene objetivos registrados.
      </p>
    )
  }

  const items = objetivosPorPlazo(objetivos, tab)

  return (
    <div>
      {/* Tabs por plazo */}
      <div
        className="mb-4 flex gap-1.5 rounded-xl border p-1"
        style={{ borderColor: 'var(--color-surface-border)', background: 'rgba(255,255,255,0.03)' }}
      >
        {PLAZO_ORDER.map((plz) => {
          const n = objetivosPorPlazo(objetivos, plz).length
          const empty = n === 0
          const isActive = tab === plz
          return (
            <button
              key={plz}
              type="button"
              disabled={empty}
              onClick={() => setTab(plz)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
              style={{
                background: isActive ? `${colorHex}20` : 'transparent',
                color: isActive
                  ? colorHex
                  : empty
                    ? 'var(--color-text-muted)'
                    : 'var(--color-text-secondary)',
                border: isActive ? `1px solid ${colorHex}55` : '1px solid transparent',
                opacity: empty ? 0.45 : 1,
                cursor: empty ? 'default' : 'pointer',
              }}
            >
              <span>{PLAZO_LABEL[plz]}</span>
              {!empty && (
                <>
                  <span className="rounded-full bg-white/[0.08] px-1.5 text-[10px] tabular-nums">
                    {n}
                  </span>
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: isActive ? colorHex : 'var(--color-text-muted)' }}>
                    {Math.round(avancePlazo(objetivos, plz))}%
                  </span>
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Objetivos del plazo activo */}
      <ul className="space-y-1.5">
        {items.map((o) => {
          const active = o.id === activeId
          return (
            <li key={o.id}>
              <Link
                href={`?obj=${o.id}`}
                scroll={false}
                className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-colors"
                style={{
                  borderColor: active ? `${colorHex}66` : 'var(--color-surface-border)',
                  background: active ? `${colorHex}12` : 'var(--color-surface-card)',
                }}
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: ESTADO_DOT[o.estado] ?? 'var(--color-text-muted)' }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-primary)]">
                  {o.titulo}
                </span>
                <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                  {TIPO_LABEL[o.tipo]}
                </span>
                <ChevronRight size={14} className="shrink-0 text-[var(--color-text-muted)]" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
