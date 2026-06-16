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
}

export function ProyectoCard({
  proyecto,
  componente,
  index = 0,
  avanceOverride,
}: ProyectoCardProps) {
  const avance = avanceOverride ?? proyecto.avance_calculado

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Link
        href={`/${componente.slug}/${proyecto.slug}`}
        className="block group"
      >
        <div
          className="rounded-2xl p-4 border transition-all duration-200 hover:scale-[1.01] h-full"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-surface-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex gap-3">
            <ProgressRing
              value={avance}
              color={componente.color_hex}
              size="sm"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              {proyecto.codigo && (
                <p className="text-xs font-mono text-[var(--color-text-muted)] mb-0.5">
                  {proyecto.codigo}
                </p>
              )}
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2">
                {proyecto.nombre}
              </h4>
              {proyecto.descripcion_corta && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1.5 line-clamp-2">
                  {proyecto.descripcion_corta}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <EstadoBadge estado={proyecto.estado} />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
