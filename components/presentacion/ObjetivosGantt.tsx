'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { ObjetivoDetalle, PlazoEnum, ObjetivoEstadoEnum } from '@/types/domain'
import {
  buildMeses,
  mesAbbr,
  dateToIndex,
  PLAZO_RANGE,
  TOTAL_MESES,
} from '@/lib/cronograma'

const LABEL_W = 360
const MONTH_W = 40
const ROW_H = 52
const BAR_H = 28

const PLAZO_LABEL: Record<PlazoEnum, string> = {
  corto: 'Corto',
  mediano: 'Mediano',
  largo: 'Largo',
}
const PLAZO_ORDEN: Record<PlazoEnum, number> = { corto: 0, mediano: 1, largo: 2 }

// Fondo sutil por plazo (misma gama; solo una leve diferenciación de columna).
const PLAZO_BG: Record<PlazoEnum, string> = {
  corto: 'rgba(255,255,255,0.018)',
  mediano: 'rgba(255,255,255,0.05)',
  largo: 'rgba(255,255,255,0.018)',
}
function bgDeMes(idx: number): string {
  if (idx <= 5) return PLAZO_BG.corto
  if (idx <= 11) return PLAZO_BG.mediano
  return PLAZO_BG.largo
}

// Colores hex (no CSS vars) para poder componer alpha sobre la barra.
const ESTADO: Record<ObjetivoEstadoEnum, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: '#64748B' },
  en_progreso: { label: 'En progreso', color: '#3B82F6' },
  cumplido: { label: 'Cumplido', color: '#22C55E' },
}
const TIPO_LABEL = { hu: 'HU', funcionalidad: 'Func.' } as const

export function ObjetivosGantt({ objetivos }: { objetivos: ObjetivoDetalle[] }) {
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
                style={{ width: w, background: PLAZO_BG[pl] }}
                className="shrink-0 border-l py-2 text-center text-[12px] font-semibold uppercase tracking-wide text-[var(--color-text-primary)]"
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
          const est = ESTADO[o.estado]
          // Span proyectado desde fechas: inicio = fecha_inicio (o inicio del plazo);
          // fin = fecha_limite (o fin del plazo). El relleno = % de avance del producto.
          const plazoR = PLAZO_RANGE[o.plazo]
          const fi = o.fecha_inicio ? dateToIndex(o.fecha_inicio) : null
          const fl = o.fecha_limite ? dateToIndex(o.fecha_limite) : null
          const start = fi !== null ? fi : plazoR.start
          const end = Math.max(fl !== null ? fl : plazoR.end, start)
          return (
            <div
              key={o.id}
              className="flex border-b last:border-b-0"
              style={{ borderColor: 'var(--color-surface-border)', height: ROW_H }}
            >
              <div
                style={{ width: LABEL_W }}
                className="flex shrink-0 items-center gap-2.5 px-4 text-[13px]"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: est.color }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 line-clamp-2 font-medium leading-snug text-[var(--color-text-secondary)]">
                  {o.titulo}
                </span>
                <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
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
                      background: bgDeMes(m.index),
                    }}
                  />
                ))}

                {/* barra del objetivo: track siempre sombreado + relleno de avance */}
                <button
                  type="button"
                  onClick={() => router.push(`${pathname}?obj=${o.id}`, { scroll: false })}
                  title={`${o.titulo} · ${PLAZO_LABEL[o.plazo]} plazo · ${est.label} · ${o.avance}%${o.fecha_inicio ? ` · inicio ${o.fecha_inicio}` : ''}${o.fecha_limite ? ` · meta ${o.fecha_limite}` : ''}`}
                  aria-label={`${o.titulo} — ${est.label} — ${o.avance}%`}
                  className="relative my-1.5 self-center overflow-hidden rounded-lg transition-transform hover:scale-[1.01]"
                  style={{
                    gridColumn: `${start + 1} / ${end + 2}`,
                    background: `${est.color}40`,
                    border: `1px solid ${est.color}80`,
                    height: BAR_H,
                  }}
                >
                  {o.avance > 0 && (
                    <span
                      className="absolute inset-y-0 left-0"
                      style={{ width: `${o.avance}%`, background: est.color, opacity: 0.95 }}
                    />
                  )}
                  <span
                    className="relative z-10 block px-2 text-center text-[11px] font-semibold tabular-nums text-white"
                    style={{ lineHeight: `${BAR_H - 2}px` }}
                  >
                    {o.avance}%
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
