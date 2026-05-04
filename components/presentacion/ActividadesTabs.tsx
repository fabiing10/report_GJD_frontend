'use client'

import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import type { PlazoEnum, ProyectoLogro, ProyectoProximoPaso } from '@/types/domain'

const PLAZO_CONFIG: Record<PlazoEnum, { label: string; sublabel: string }> = {
  corto: { label: 'Corto Plazo', sublabel: 'Q1–Q2 2025' },
  mediano: { label: 'Mediano Plazo', sublabel: 'Q3–Q4 2025' },
  largo: { label: 'Largo Plazo', sublabel: '2026+' },
}

const PLAZO_ORDER: PlazoEnum[] = ['corto', 'mediano', 'largo']

interface ActividadesTabsProps {
  logros: ProyectoLogro[]
  proximos_pasos: ProyectoProximoPaso[]
  avance_corto: number | null
  avance_mediano: number | null
  avance_largo: number | null
  colorHex: string
}

export function ActividadesTabs({
  logros,
  proximos_pasos,
  avance_corto,
  avance_mediano,
  avance_largo,
  colorHex,
}: ActividadesTabsProps) {
  const avancePorPlazo: Record<PlazoEnum, number> = {
    corto: avance_corto ?? 0,
    mediano: avance_mediano ?? 0,
    largo: avance_largo ?? 0,
  }

  const logrosPorPlazo: Record<PlazoEnum, ProyectoLogro[]> = {
    corto: logros.filter((l) => l.plazo === 'corto'),
    mediano: logros.filter((l) => l.plazo === 'mediano'),
    largo: logros.filter((l) => l.plazo === 'largo'),
  }

  const pasosPorPlazo: Record<PlazoEnum, ProyectoProximoPaso[]> = {
    corto: proximos_pasos.filter((p) => p.plazo === 'corto'),
    mediano: proximos_pasos.filter((p) => p.plazo === 'mediano'),
    largo: proximos_pasos.filter((p) => p.plazo === 'largo'),
  }

  const [active, setActive] = useState<PlazoEnum>('corto')

  const tabLogros = logrosPorPlazo[active]
  const tabPasos = pasosPorPlazo[active]
  const tabAvance = avancePorPlazo[active]
  const isEmpty = tabLogros.length === 0 && tabPasos.length === 0

  return (
    <div style={{ marginTop: 32 }}>
      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 4, height: 24, borderRadius: 2, background: colorHex, flexShrink: 0 }} />
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
          Actividades del Proyecto
        </h2>
      </div>

      {/* Tabs */}
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
          const cfg = PLAZO_CONFIG[plazo]
          const isActive = active === plazo
          const count = logrosPorPlazo[plazo].length + pasosPorPlazo[plazo].length
          const isEmptyTab = count === 0
          const pct = avancePorPlazo[plazo]

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
                fontWeight: isActive ? 700 : 600,
                color: isActive ? colorHex : 'var(--color-text-primary)',
                background: isActive ? `${colorHex}20` : 'transparent',
                border: isActive ? `1.5px solid ${colorHex}60` : '1.5px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flex: 1,
                justifyContent: 'center',
                opacity: isEmptyTab && !isActive ? 0.5 : 1,
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

              {!isEmptyTab && (
                <span
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 99,
                    background: isActive ? `${colorHex}25` : 'rgba(255,255,255,0.08)',
                    color: isActive ? colorHex : 'var(--color-text-muted)',
                    fontWeight: 700,
                    border: isActive ? `1px solid ${colorHex}40` : '1px solid transparent',
                  }}
                >
                  {count}
                </span>
              )}

              {/* Círculo de % */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: isActive ? `${colorHex}18` : 'rgba(255,255,255,0.04)',
                  border: isActive ? `2px solid ${colorHex}70` : '2px solid rgba(255,255,255,0.08)',
                  fontSize: 13,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                  color: isActive ? colorHex : 'rgba(100,116,139,0.5)',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {isEmptyTab ? '—' : `${Math.round(pct)}%`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Panel */}
      <div
        style={{
          borderLeft: `1px solid ${colorHex}22`,
          borderRight: `1px solid ${colorHex}22`,
          borderBottom: `1px solid ${colorHex}22`,
          borderRadius: '0 0 14px 14px',
          background: `${colorHex}06`,
        }}
      >
        {isEmpty ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '32px 24px',
              color: 'var(--color-text-muted)',
            }}
          >
            <p style={{ fontSize: 13, margin: 0 }}>
              Sin actividades en {PLAZO_CONFIG[active].label}
            </p>
            <p style={{ fontSize: 11, margin: 0, opacity: 0.6 }}>{PLAZO_CONFIG[active].sublabel}</p>
          </div>
        ) : (
          <>
            {/* Resumen de avance */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '14px 20px',
                borderBottom: `1px solid ${colorHex}15`,
              }}
            >
              <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                <p
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: colorHex,
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    margin: 0,
                  }}
                >
                  {Math.round(tabAvance)}%
                </p>
                <p style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, marginBottom: 0 }}>
                  avance
                </p>
              </div>

              <div style={{ width: 1, height: 36, background: `${colorHex}25`, flexShrink: 0 }} />

              <div style={{ flex: 1 }}>
                <ProgressBar value={tabAvance} color={colorHex} />
                <div style={{ display: 'flex', gap: 18, fontSize: 12, color: 'var(--color-text-muted)', marginTop: 7 }}>
                  {tabLogros.length > 0 && (
                    <span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-estado-completado)', fontVariantNumeric: 'tabular-nums' }}>
                        {tabLogros.length}
                      </span>
                      <span style={{ marginLeft: 4 }}>logros</span>
                    </span>
                  )}
                  {tabPasos.length > 0 && (
                    <span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-estado-en-progreso)', fontVariantNumeric: 'tabular-nums' }}>
                        {tabPasos.length}
                      </span>
                      <span style={{ marginLeft: 4 }}>próximos pasos</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logros */}
            {tabLogros.length > 0 && (
              <div style={{ padding: '12px 20px 4px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-estado-completado)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  Logros alcanzados
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tabLogros.map((logro) => (
                    <li key={logro.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Check size={13} style={{ color: 'var(--color-estado-completado)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {logro.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Próximos pasos */}
            {tabPasos.length > 0 && (
              <div style={{ padding: tabLogros.length > 0 ? '10px 20px 14px' : '12px 20px 14px' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-estado-en-progreso)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  Próximos pasos
                </p>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {tabPasos.map((paso) => (
                    <li key={paso.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <ArrowRight size={13} style={{ color: 'var(--color-estado-en-progreso)', flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                        {paso.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
