'use client'

import { useRouter } from 'next/navigation'
import type { ComponenteConProyectos } from '@/types/domain'

const PLAZO_COLUMNS: Record<string, number> = {
  corto: 0,
  mediano: 1,
  largo: 2,
}
const PLAZO_LABELS = [
  'Corto Plazo (Q1-Q2 2026)',
  'Mediano Plazo (Q3-Q4 2026)',
  'Largo Plazo (2027+)',
]
const COL_WIDTH = 280
const ROW_HEIGHT = 64
const LEFT_MARGIN = 220
const TOP_MARGIN = 80

interface TimelineSVGProps {
  componentes: ComponenteConProyectos[]
  fechaCorte: string
}

export function TimelineSVG({ componentes }: TimelineSVGProps) {
  const router = useRouter()
  const totalWidth = LEFT_MARGIN + COL_WIDTH * 3 + 60
  const totalHeight =
    TOP_MARGIN + ROW_HEIGHT * Math.max(componentes.length, 1) + 40

  return (
    <div
      className="overflow-x-auto rounded-2xl border"
      style={{ borderColor: 'var(--color-surface-border)' }}
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="min-w-full"
        style={{ background: 'var(--color-surface-card)' }}
      >
        {PLAZO_LABELS.map((label, i) => (
          <g key={label}>
            <rect
              x={LEFT_MARGIN + i * COL_WIDTH}
              y={0}
              width={COL_WIDTH}
              height={TOP_MARGIN}
              fill={`rgba(255,255,255,${i % 2 === 0 ? 0.02 : 0.01})`}
            />
            <text
              x={LEFT_MARGIN + i * COL_WIDTH + COL_WIDTH / 2}
              y={TOP_MARGIN / 2 + 4}
              textAnchor="middle"
              fill="rgba(148,163,184,0.85)"
              fontSize="11"
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          </g>
        ))}

        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1={LEFT_MARGIN + i * COL_WIDTH}
            y1={TOP_MARGIN}
            x2={LEFT_MARGIN + i * COL_WIDTH}
            y2={totalHeight}
            stroke="rgba(99,130,200,0.15)"
            strokeWidth="1"
          />
        ))}

        {componentes.map((componente, rowIndex) => {
          const y = TOP_MARGIN + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2

          return (
            <g key={componente.id}>
              <text
                x={LEFT_MARGIN - 12}
                y={y + 4}
                textAnchor="end"
                fill={componente.color_hex}
                fontSize="11"
                fontWeight="600"
                fontFamily="Inter, sans-serif"
              >
                {componente.icono}{' '}
                {componente.nombre.split(' ').slice(0, 2).join(' ')}
              </text>

              <line
                x1={LEFT_MARGIN}
                y1={y}
                x2={LEFT_MARGIN + COL_WIDTH * 3}
                y2={y}
                stroke={`${componente.color_hex}33`}
                strokeWidth="1.5"
                strokeDasharray="4,4"
              />

              {componente.proyectos.map((proyecto) => {
                const col = PLAZO_COLUMNS[proyecto.plazo] ?? 0
                const xBase = LEFT_MARGIN + col * COL_WIDTH + COL_WIDTH / 2
                const radius = 4 + (proyecto.avance / 100) * 10
                const filled =
                  proyecto.estado === 'completado'
                    ? componente.color_hex
                    : 'transparent'

                return (
                  <g
                    key={proyecto.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      router.push(`/${componente.slug}/${proyecto.slug}`)
                    }
                  >
                    <circle
                      cx={xBase}
                      cy={y}
                      r={radius + 4}
                      fill="transparent"
                    />
                    <circle
                      cx={xBase}
                      cy={y}
                      r={radius}
                      fill={filled}
                      stroke={componente.color_hex}
                      strokeWidth="2"
                      opacity={proyecto.estado === 'no_iniciado' ? 0.4 : 1}
                    />
                    <title>
                      {proyecto.nombre} — {Math.round(proyecto.avance)}%
                    </title>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
