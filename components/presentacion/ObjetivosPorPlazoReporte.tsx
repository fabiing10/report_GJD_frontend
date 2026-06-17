'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import {
  PLAZO_ORDER,
  PLAZO_LABEL,
  objetivosPorPlazo,
  avancePlazo,
} from '@/lib/objetivos'
import type { ObjetivoDetalle } from '@/types/domain'

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

  if (plazosConObjetivos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Este proyecto aún no tiene objetivos registrados.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {plazosConObjetivos.map((plz) => {
        const items = objetivosPorPlazo(objetivos, plz)
        const avance = avancePlazo(objetivos, plz)
        return (
          <section key={plz}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {PLAZO_LABEL[plz]}
              </h3>
              <span className="text-xs font-semibold tabular-nums" style={{ color: colorHex }}>
                {Math.round(avance)}%
              </span>
            </div>
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
          </section>
        )
      })}
    </div>
  )
}
