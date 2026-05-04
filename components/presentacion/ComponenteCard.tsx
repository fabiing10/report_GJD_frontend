'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProgressBar } from './ProgressBar'
import type { ComponenteConAvance } from '@/types/domain'

interface ComponenteCardProps {
  componente: ComponenteConAvance
  index?: number
}

export function ComponenteCard({ componente, index = 0 }: ComponenteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/${componente.slug}`} className="block group">
        <div
          className="rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.02] hover:bg-[var(--color-surface-card-hover)]"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-surface-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="text-3xl leading-none shrink-0"
                style={{
                  filter: `drop-shadow(0 0 16px ${componente.color_hex}66)`,
                }}
                aria-hidden="true"
              >
                {componente.icono}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight line-clamp-2">
                  {componente.nombre}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {componente.total_actividades} actividades
                </p>
              </div>
            </div>
            <span
              className="text-xl font-display font-semibold tabular-nums shrink-0 ml-2"
              style={{ color: componente.color_hex }}
            >
              {Math.round(componente.avance_calculado)}%
            </span>
          </div>
          <ProgressBar
            value={componente.avance_calculado}
            color={componente.color_hex}
          />
        </div>
      </Link>
    </motion.div>
  )
}
