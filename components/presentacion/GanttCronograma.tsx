'use client'

import { useRouter } from 'next/navigation'
import type { ComponenteConProyectos, PlazoEnum } from '@/types/domain'
import {
  buildMeses,
  mesAbbr,
  proyectoSpan,
  plazosDelProyecto,
  PLAZO_RANGE,
  TOTAL_MESES,
} from '@/lib/cronograma'

const LABEL_W = 240
const MONTH_W = 40
const ROW_H = 36

const PLAZO_LABEL: Record<PlazoEnum, string> = {
  corto: 'Corto',
  mediano: 'Mediano',
  largo: 'Largo',
}

export function GanttCronograma({
  componentes,
}: {
  componentes: ComponenteConProyectos[]
}) {
  const router = useRouter()
  const meses = buildMeses()
  const gridW = MONTH_W * TOTAL_MESES
  const totalW = LABEL_W + gridW

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
                {PLAZO_LABEL[pl]}
              </div>
            )
          })}
        </div>

        {/* Cabecera: años + meses */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
          <div style={{ width: LABEL_W }} className="shrink-0 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Proyecto
          </div>
          <div className="relative">
            {/* fila de años */}
            <div className="flex">
              <div style={{ width: 12 * MONTH_W }} className="shrink-0 border-l py-1 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]">
                2026
              </div>
              <div style={{ width: 12 * MONTH_W }} className="shrink-0 border-l py-1 text-center text-[11px] font-semibold text-[var(--color-text-secondary)]">
                2027
              </div>
            </div>
            {/* fila de meses */}
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

        {/* Cuerpo: componentes y proyectos */}
        {componentes.map((c) => (
          <div key={c.id}>
            <div
              className="flex items-center gap-2 border-b px-4 py-1.5"
              style={{ borderColor: 'var(--color-surface-border)', background: `${c.color_hex}10` }}
            >
              <span className="text-sm" aria-hidden>{c.icono}</span>
              <span className="text-xs font-semibold" style={{ color: c.color_hex }}>
                {c.nombre}
              </span>
              <span className="text-[10px] tabular-nums text-[var(--color-text-muted)]">
                {Math.round(c.avance_calculado)}%
              </span>
            </div>

            {c.proyectos.map((p) => {
              const span = proyectoSpan(p)
              const plazos = plazosDelProyecto(p)
              return (
                <div
                  key={p.id}
                  className="flex border-b"
                  style={{ borderColor: 'var(--color-surface-border)', height: ROW_H }}
                >
                  <div
                    style={{ width: LABEL_W }}
                    className="flex shrink-0 items-center gap-2 px-4 text-[11px]"
                  >
                    <span className="min-w-0 flex-1 truncate text-[var(--color-text-secondary)]">
                      {p.codigo ? `${p.codigo} · ` : ''}{p.nombre}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--color-text-muted)]">
                      {Math.round(p.avance_calculado)}%
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

                    {/* barra del proyecto */}
                    {span && (
                      <button
                        type="button"
                        onClick={() => router.push(`/${c.slug}/${p.slug}`)}
                        title={`${p.nombre} · ${plazos.map((pl) => PLAZO_LABEL[pl]).join(', ') || 'sin plazo'} · ${p.objetivos.length} objetivos`}
                        aria-label={`${p.codigo ?? p.nombre} — ${Math.round(p.avance_calculado)}%`}
                        className="relative my-1.5 self-center overflow-hidden rounded-md transition-transform hover:scale-[1.01]"
                        style={{
                          gridColumn: `${span.start + 1} / ${span.end + 2}`,
                          background: `${c.color_hex}33`,
                          border: `1px solid ${c.color_hex}66`,
                          height: ROW_H - 14,
                        }}
                      >
                        <span
                          className="absolute inset-y-0 left-0 rounded-md"
                          style={{ width: `${p.avance_calculado}%`, background: c.color_hex, opacity: 0.85 }}
                        />
                        <span className="relative z-10 block truncate px-2 text-[9px] font-medium leading-[22px] text-white">
                          {p.codigo ?? p.nombre}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
