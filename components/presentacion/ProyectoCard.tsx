'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProgressRing } from './ProgressRing'
import { EstadoBadge } from './EstadoBadge'
import type { ProyectoDetalle, ComponenteConAvance } from '@/types/domain'

interface ProyectoCardProps {
  proyecto: ProyectoDetalle
  componente: Pick<ComponenteConAvance, 'slug' | 'color_hex'>
  index?: number
  avanceOverride?: number
  /** Modo selección: si se provee, la card actúa como botón (no navega). */
  onSelect?: () => void
  active?: boolean
}

export function ProyectoCard({
  proyecto,
  componente,
  index = 0,
  avanceOverride,
  onSelect,
  active = false,
}: ProyectoCardProps) {
  const avance = avanceOverride ?? proyecto.avance_calculado

  const card = (
    <div
      className="rounded-xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--card-accent)] h-full"
      style={{
        background: active ? `${componente.color_hex}1f` : 'var(--color-surface-card)',
        borderColor: active ? `${componente.color_hex}aa` : 'var(--color-surface-border)',
        backdropFilter: 'blur(12px)',
        boxShadow: active ? `0 0 0 1px ${componente.color_hex}55` : 'none',
        ['--card-accent' as string]: `${componente.color_hex}55`,
      }}
    >
      <CardContenido proyecto={proyecto} componente={componente} avance={avance} />
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={active}
          className="block w-full text-left group"
        >
          {card}
        </button>
      ) : (
        <Link href={`/${componente.slug}/${proyecto.slug}`} className="block group">
          {card}
        </Link>
      )}
    </motion.div>
  )
}

function CardContenido({
  proyecto,
  componente,
  avance,
}: {
  proyecto: ProyectoDetalle
  componente: Pick<ComponenteConAvance, 'slug' | 'color_hex'>
  avance: number
}) {
  return (
    <>
          <div className="flex gap-2.5">
            <ProgressRing
              value={avance}
              color={componente.color_hex}
              size="sm"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              {proyecto.codigo && (
                <p className="text-[11px] font-mono text-[var(--color-text-muted)] mb-0.5">
                  {proyecto.codigo}
                </p>
              )}
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2">
                {proyecto.nombre}
              </h4>
              {proyecto.descripcion_corta && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                  {proyecto.descripcion_corta}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <EstadoBadge estado={proyecto.estado} />
          </div>
    </>
  )
}
