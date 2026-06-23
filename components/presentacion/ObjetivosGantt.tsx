'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { ObjetivoDetalle, PlazoEnum, ObjetivoEstadoEnum } from '@/types/domain'
import {
  buildMeses,
  mesAbbr,
  objetivoSpan,
  dateToIndex,
  PLAZO_RANGE,
  TOTAL_MESES,
} from '@/lib/cronograma'

const LABEL_W = 240
const MONTH_W = 40
const ROW_H = 38

const PLAZO_LABEL: Record<PlazoEnum, string> = {
  corto: 'Corto',
  mediano: 'Mediano',
  largo: 'Largo',
}
const PLAZO_ORDEN: Record<PlazoEnum, number> = { corto: 0, mediano: 1, largo: 2 }

const ESTADO: Record<ObjetivoEstadoEnum, { label: string; color: string; fill: number }> = {
  pendiente: { label: 'Pendiente', color: 'var(--color-estado-no-iniciado)', fill: 0 },
  en_progreso: { label: 'En progreso', color: 'var(--color-estado-en-progreso)', fill: 50 },
  cumplido: { label: 'Cumplido', color: 'var(--color-estado-completado)', fill: 100 },
}
const TIPO_LABEL = { hu: 'HU', funcionalidad: 'Func.' } as const

export function ObjetivosGantt({
  objetivos,
  colorHex,
}: {
  objetivos: ObjetivoDetalle[]
  colorHex: string
}) {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const meses = buildMeses()
  const gridW = MONTH_W * TOTAL_MESES
  const totalW = LABEL_W + gridW

  const filas = [...objetivos].sort(
    (a, b) => PLAZO_ORDEN[a.plazo] - PLAZO_ORDEN[b.plazo] || a.orden - b.orden
  )

  if (filas.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center text-sm text-[var(--color-text-muted)]"
        style={{ borderColor: 'var(--color-surface-border)', background: 'var(--color-surface-card)' }}
      >
        Este proyecto aún no tiene productos para trazar en la línea de tiempo.
      </div>
    )
  }

  return (
    <div
      className="overflow-x-auto rounded-2xl border"
      style={{ borderColor: 'var(--color-surface-border)', background: 'var(--color-surface-card)' }}
    >
      <div style={{ minWidth: totalW }}>
        {/* Banda de plazos */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
          <div style={{ width: LABEL_W }} className="shrink-0" />
          {(['corto', 'mediano', 'largo'] as PlazoEnum[]).map((pl) => {
            const r = PLAZO_RANGE[pl]
            const w = (r.end - r.start + 1) * MONTH_W
            return (
              <div
                key={pl}
                style={{ width: w }}
                className="shrink-0 border-l py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
              >
                {PLAZO_LABEL[pl]} plazo
              </div>
            )
          })}
        </div>

        {/* Cabecera: años + meses */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
          <div
            style={{ width: LABEL_W }}
            className="shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]"
          >
            Producto
          </div>
          <div>
            <div className="flex">
              <div
                style={{ width: 12 * MONTH_W }}
                className="shrink-0 border-l py-1 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]"
              >
                2026
              </div>
              <div
                style={{ width: 12 * MONTH_W }}
                className="shrink-0 border-l py-1 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]"
              >
                2027
              </div>
            </div>
            <div className="flex">
              {meses.map((m) => (
                <div
                  key={m.index}
                  style={{ width: MONTH_W }}
                  className="shrink-0 border-l py-1 text-center text-[9px] tabular-nums text-[var(--color-text-muted)]"
                >
                  {mesAbbr(m.month)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cuerpo: una fila por objetivo */}
        {filas.map((o) => {
          const span = objetivoSpan(o)
          const est = ESTADO[o.estado]
          const marker = o.fecha_limite ? dateToIndex(o.fecha_limite) : null
          return (
            <div
              key={o.id}
              className="flex border-b last:border-b-0"
              style={{ borderColor: 'var(--color-surface-border)', height: ROW_H }}
            >
              <div
                style={{ width: LABEL_W }}
                className="flex shrink-0 items-center gap-2 px-4 text-[11px]"
              >
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: est.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">
                  {o.titulo}
                </span>
                <span className="shrink-0 rounded bg-white/[0.06] px-1 py-0.5 text-[9px] text-[var(--color-text-muted)]">
                  {TIPO_LABEL[o.tipo]}
                </span>
              </div>

              <div
                className="relative shrink-0"
                style={{
                  width: gridW,
                  display: 'grid',
                  gridTemplateColumns: `repeat(${TOTAL_MESES}, ${MONTH_W}px)`,
                }}
              >
                {/* gridlines */}
                {meses.map((m) => (
                  <div
                    key={m.index}
                    className="border-l"
                    style={{
                      borderColor:
                        m.index === 6 || m.index === 12
                          ? 'var(--color-surface-border)'
                          : 'rgba(255,255,255,0.04)',
                      background: m.year === 2027 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    }}
                  />
                ))}

                {/* barra del objetivo */}
                <button
                  type="button"
                  onClick={() => router.push(`${pathname}?obj=${o.id}`, { scroll: false })}
                  title={`${o.titulo} · ${PLAZO_LABEL[o.plazo]} plazo · ${est.label}${o.fecha_limite ? ` · meta ${o.fecha_limite}` : ''}`}
                  aria-label={`${o.titulo} — ${est.label}`}
                  className="relative my-1.5 self-center overflow-hidden rounded-md transition-transform hover:scale-[1.01]"
                  style={{
                    gridColumn: `${span.start + 1} / ${span.end + 2}`,
                    background: `${est.color}29`,
                    border: `1px solid ${est.color}66`,
                    height: ROW_H - 16,
                  }}
                >
                  {est.fill > 0 && (
                    <span
                      className="absolute inset-y-0 left-0 rounded-md"
                      style={{ width: `${est.fill}%`, background: est.color, opacity: 0.8 }}
                    />
                  )}
                  <span className="relative z-10 block px-2 text-center text-[10px] font-semibold leading-[22px] tabular-nums text-white">
                    {est.fill}%
                  </span>
                </button>

                {/* marcador de fecha límite */}
                {marker !== null && (
                  <span
                    aria-hidden
                    className="pointer-events-none self-center"
                    title={`Fecha límite: ${o.fecha_limite}`}
                    style={{
                      gridColumn: `${marker + 1} / ${marker + 2}`,
                      justifySelf: 'center',
                      width: 8,
                      height: 8,
                      transform: 'rotate(45deg)',
                      background: colorHex,
                      border: '1px solid rgba(255,255,255,0.6)',
                      zIndex: 20,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
