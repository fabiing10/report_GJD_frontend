'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number
  color: string
  className?: string
  showLabel?: boolean
}

export function ProgressBar({
  value,
  color,
  className,
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full ${className ?? ''}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[var(--color-text-muted)]">Avance</span>
          <span
            className="text-xs font-semibold tabular-nums"
            style={{ color }}
          >
            {Math.round(clamped)}%
          </span>
        </div>
      )}
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
