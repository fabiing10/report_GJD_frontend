'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProgressBar } from './ProgressBar'
import type { PlazoEnum, ProyectoDetalle } from '@/types/domain'

const PLAZO_CONFIG: Record<PlazoEnum, { label: string; sublabel: string; icon: string }> = {
  corto: { label: 'Corto Plazo', sublabel: 'Q1–Q2 2025', icon: '⚡' },
  mediano: { label: 'Mediano Plazo', sublabel: 'Q3–Q4 2025', icon: '🎯' },
  largo: { label: 'Largo Plazo', sublabel: '2026+', icon: '🔭' },
}

const PLAZO_ORDER: PlazoEnum[] = ['corto', 'mediano', 'largo']

interface PlazoTabsDetalleProps {
  proyectos: ProyectoDetalle[]
  currentSlug: string
  componenteSlug: string
  colorHex: string
}

export function PlazoTabsDetalle({
  proyectos,
  currentSlug,
  componenteSlug,
  colorHex,
}: PlazoTabsDetalleProps) {
  const porPlazo = PLAZO_ORDER.reduce<Record<PlazoEnum, ProyectoDetalle[]>>(
    (acc, p) => {
      acc[p] = proyectos.filter((pr) => pr.plazo === p)
      return acc
    },
    { corto: [], mediano: [], largo: [] }
  )

  const currentProyecto = proyectos.find((p) => p.slug === currentSlug)
  const defaultTab = currentProyecto?.plazo ?? 'corto'
  const [active, setActive] = useState<PlazoEnum>(defaultTab)

  const items = porPlazo[active]
  const avance = items.length > 0 ? items.reduce((s, p) => s + p.avance, 0) / items.length : 0
  const completados = items.filter((p) => p.estado === 'completado').length
  const CIRCUMFERENCE = 2 * Math.PI * 10

  return (
    <div style={{ marginTop: 32 }}>
      {/* Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 4,
            height: 24,
            borderRadius: 2,
            background: colorHex,
            flexShrink: 0,
          }}
        />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          Actividades por Horizonte Temporal
        </h2>
      </div>

      {/* Tabs — siempre 3 botones */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: 5,
          borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--color-surface-border)',
        }}
      >
        {PLAZO_ORDER.map((plazo) => {
          const count = porPlazo[plazo].length
          const isEmpty = count === 0
          const cfg = PLAZO_CONFIG[plazo]
          const isActive = active === plazo
          const hasCurrentInTab = porPlazo[plazo].some((p) => p.slug === currentSlug)
          const avgGrupo =
            count > 0 ? porPlazo[plazo].reduce((s, p) => s + p.avance, 0) / count : 0

          return (
            <button
              key={plazo}
              onClick={() => setActive(plazo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: isActive ? 700 : 500,
                color: isActive
                  ? colorHex
                  : isEmpty
                  ? 'rgba(100,116,139,0.4)'
                  : 'var(--color-text-muted)',
                background: isActive ? `${colorHex}20` : 'transparent',
                border: isActive ? `1.5px solid ${colorHex}60` : '1.5px solid transparent',
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
                  fontSize: 16,
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? colorHex : 'var(--color-text-primary)',
                  letterSpacing: '0.01em',
                }}
              >
                {cfg.label}
              </span>

              {hasCurrentInTab && !isActive && (
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: colorHex,
                    flexShrink: 0,
                    opacity: 0.8,
                  }}
                />
              )}

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: isActive ? `${colorHex}18` : 'rgba(255,255,255,0.04)',
                  border: isActive
                    ? `2px solid ${colorHex}70`
                    : '2px solid rgba(255,255,255,0.08)',
                  fontSize: 13,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: isActive ? colorHex : 'rgba(100,116,139,0.5)',
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

      {/* Panel: summary + lista */}
      <div
        style={{
          borderLeft: `1px solid ${colorHex}22`,
          borderRight: `1px solid ${colorHex}22`,
          borderBottom: `1px solid ${colorHex}22`,
          borderRadius: '0 0 12px 12px',
          background: `${colorHex}06`,
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '24px',
              color: 'var(--color-text-muted)',
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 20, opacity: 0.4 }}>{PLAZO_CONFIG[active].icon}</span>
            <span>
              Sin actividades en {PLAZO_CONFIG[active].label} — {PLAZO_CONFIG[active].sublabel}
            </span>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderBottom: `1px solid ${colorHex}15`,
              }}
            >
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 56 }}>
                <p
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: colorHex,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Math.round(avance)}%
                </p>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>avance</p>
              </div>

              <div style={{ width: 1, height: 32, background: `${colorHex}25`, flexShrink: 0 }} />

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <ProgressBar value={avance} color={colorHex} />
                <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: 'var(--color-estado-completado)',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {completados}
                    </span>
                    <span style={{ marginLeft: 4 }}>completadas</span>
                  </span>
                  <span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
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

            {/* Activity list */}
            <ul style={{ padding: '8px 0' }}>
              {items.map((p) => {
                const isCurrent = p.slug === currentSlug

                return (
                  <li key={p.id}>
                    <Link
                      href={`/${componenteSlug}/${p.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '7px 16px',
                        textDecoration: 'none',
                        background: isCurrent ? `${colorHex}14` : 'transparent',
                        borderLeft: isCurrent ? `3px solid ${colorHex}` : '3px solid transparent',
                        transition: 'background 0.12s',
                      }}
                    >
                      {/* Mini ring */}
                      <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                        <svg width={28} height={28} style={{ transform: 'rotate(-90deg)' }}>
                          <circle
                            cx={14} cy={14} r={10}
                            fill="none" stroke={colorHex} strokeWidth={2.5} opacity={0.12}
                          />
                          <circle
                            cx={14} cy={14} r={10}
                            fill="none" stroke={colorHex} strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={CIRCUMFERENCE * (1 - p.avance / 100)}
                            opacity={isCurrent ? 1 : 0.5}
                          />
                        </svg>
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 8,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            color: colorHex,
                            opacity: isCurrent ? 1 : 0.6,
                          }}
                        >
                          {Math.round(p.avance)}
                        </span>
                      </div>

                      {/* Nombre */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: isCurrent ? 600 : 400,
                            color: isCurrent ? colorHex : 'var(--color-text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            lineHeight: 1.3,
                          }}
                        >
                          {p.codigo ? `${p.codigo} ` : ''}
                          {p.nombre}
                        </p>
                      </div>

                      {/* Estado dot */}
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          flexShrink: 0,
                          background:
                            p.estado === 'completado'
                              ? 'var(--color-estado-completado)'
                              : p.estado === 'en_progreso'
                              ? 'var(--color-estado-en-progreso)'
                              : p.estado === 'bloqueado'
                              ? 'var(--color-estado-bloqueado)'
                              : 'var(--color-text-muted)',
                          opacity: isCurrent ? 1 : 0.6,
                        }}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  )
}
