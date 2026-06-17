'use client'

import { useState } from 'react'
import { ProyectoCard } from './ProyectoCard'
import { ProgressBar } from './ProgressBar'
import { avancePlazo, PLAZO_ORDER } from '@/lib/objetivos'
import type { PlazoEnum, ProyectoDetalle } from '@/types/domain'

const PLAZO_CONFIG: Record<PlazoEnum, { label: string; sublabel: string; icon: string }> = {
  corto: { label: 'Corto Plazo', sublabel: 'Q1–Q2 2025', icon: '⚡' },
  mediano: { label: 'Mediano Plazo', sublabel: 'Q3–Q4 2025', icon: '🎯' },
  largo: { label: 'Largo Plazo', sublabel: '2026+', icon: '🔭' },
}

function avancePorPlazo(pr: ProyectoDetalle, plazo: PlazoEnum): number {
  return avancePlazo(pr.objetivos, plazo)
}

interface PlazoTabsProps {
  proyectos: ProyectoDetalle[]
  componente: { slug: string; color_hex: string }
}

export function PlazoTabs({ proyectos, componente }: PlazoTabsProps) {
  // Un proyecto aparece en un tab si tiene ese plazo definido
  const porPlazo = PLAZO_ORDER.reduce<Record<PlazoEnum, ProyectoDetalle[]>>(
    (acc, p) => {
      acc[p] = proyectos.filter((pr) => pr.objetivos.some((o) => o.plazo === p))
      return acc
    },
    { corto: [], mediano: [], largo: [] }
  )

  // Default al primer plazo que tenga proyectos, o 'corto' si ninguno
  const defaultTab =
    (PLAZO_ORDER.find((p) => porPlazo[p].length > 0) as PlazoEnum | undefined) ?? 'corto'

  const [active, setActive] = useState<PlazoEnum>(defaultTab)

  const items = porPlazo[active]
  const avance =
    items.length > 0
      ? items.reduce((s, p) => s + avancePorPlazo(p, active), 0) / items.length
      : 0
  const completados = items.filter((p) => p.estado === 'completado').length
  const enProgreso = items.filter((p) => p.estado === 'en_progreso').length

  return (
    <div>
      {/* Tab bar — siempre 3 botones */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 5,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-surface-border)',
          marginBottom: 16,
        }}
      >
        {PLAZO_ORDER.map((plazo) => {
          const count = porPlazo[plazo].length
          const cfg = PLAZO_CONFIG[plazo]
          const isActive = active === plazo
          const isEmpty = count === 0
          const avgGrupo =
            count > 0
              ? porPlazo[plazo].reduce((s, p) => s + avancePorPlazo(p, plazo), 0) / count
              : 0

          return (
            <button
              key={plazo}
              onClick={() => setActive(plazo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 20px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? componente.color_hex
                  : isEmpty
                  ? 'rgba(100,116,139,0.4)'
                  : 'var(--color-text-muted)',
                background: isActive ? `${componente.color_hex}20` : 'transparent',
                border: isActive
                  ? `1.5px solid ${componente.color_hex}60`
                  : '1.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flex: 1,
                justifyContent: 'center',
                opacity: isEmpty && !isActive ? 0.55 : 1,
              }}
            >
              <span
                style={{
                  fontSize: isActive ? 17 : 16,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? '#ffffff' : 'var(--color-text-primary)',
                  letterSpacing: '0.01em',
                }}
              >
                {cfg.label}
              </span>

              {!isEmpty && (
                <span
                  style={{
                    fontSize: isActive ? 13 : 12,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: isActive
                      ? `${componente.color_hex}25`
                      : 'rgba(255,255,255,0.08)',
                    color: isActive ? '#ffffff' : 'var(--color-text-muted)',
                    fontWeight: 700,
                    border: isActive
                      ? `1px solid ${componente.color_hex}40`
                      : '1px solid transparent',
                  }}
                >
                  {count}
                </span>
              )}

              {/* Círculo de porcentaje */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isActive
                    ? `${componente.color_hex}18`
                    : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? `2px solid ${componente.color_hex}70`
                    : '2px solid rgba(255,255,255,0.08)',
                  fontSize: isActive ? 14 : 13,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: isActive ? '#ffffff' : 'rgba(100,116,139,0.6)',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {isEmpty ? '—' : `${Math.round(avgGrupo)}%`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel resumen (solo cuando hay items) */}
      {items.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            padding: '16px 20px',
            borderRadius: 12,
            background: `${componente.color_hex}0a`,
            border: `1px solid ${componente.color_hex}25`,
            marginBottom: 24,
          }}
        >
          <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 70 }}>
            <p
              style={{
                fontSize: 40,
                fontWeight: 800,
                color: componente.color_hex,
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(avance)}%
            </p>
            <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>
              avance
            </p>
          </div>

          <div
            style={{
              width: 1,
              height: 40,
              background: `${componente.color_hex}30`,
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ProgressBar value={avance} color={componente.color_hex} />
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--color-estado-completado)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {completados}
                </span>
                <span style={{ marginLeft: 4 }}>completadas</span>
              </span>
              {enProgreso > 0 && (
                <span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: 'var(--color-estado-en-progreso)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {enProgreso}
                  </span>
                  <span style={{ marginLeft: 4 }}>en progreso</span>
                </span>
              )}
              <span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: 'var(--color-text-secondary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {items.length}
                </span>
                <span style={{ marginLeft: 4 }}>total</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid de cards o estado vacío */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((proyecto, i) => (
            <ProyectoCard
              key={`${proyecto.id}-${active}`}
              proyecto={proyecto}
              componente={componente}
              index={i}
              avanceOverride={avancePorPlazo(proyecto, active)}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '48px 24px',
            borderRadius: 12,
            border: '1px dashed var(--color-surface-border)',
          }}
        >
          <span style={{ fontSize: 32, opacity: 0.3 }}>{PLAZO_CONFIG[active].icon}</span>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Sin actividades en {PLAZO_CONFIG[active].label}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', opacity: 0.6 }}>
            {PLAZO_CONFIG[active].sublabel}
          </p>
        </div>
      )}
    </div>
  )
}
