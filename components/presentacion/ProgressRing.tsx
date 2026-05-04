'use client'

import { motion } from 'framer-motion'

type Size = 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<
  Size,
  { px: number; stroke: number; fontSize: string }
> = {
  sm: { px: 48, stroke: 4, fontSize: 'text-xs' },
  md: { px: 96, stroke: 6, fontSize: 'text-lg' },
  lg: { px: 200, stroke: 10, fontSize: 'text-3xl' },
}

interface ProgressRingProps {
  value: number
  color: string
  size?: Size
  label?: string
  className?: string
}

export function ProgressRing({
  value,
  color,
  size = 'md',
  label,
  className,
}: ProgressRingProps) {
  const { px, stroke, fontSize } = SIZE_MAP[size]
  const radius = (px - stroke * 2) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value))
  const offset = circumference - (clamped / 100) * circumference
  const center = px / 2

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{ width: px, height: px }}
      role="img"
      aria-label={`Progreso: ${Math.round(clamped)}%`}
    >
      <svg width={px} height={px} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          opacity={0.1}
        />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className={`font-display font-semibold tabular-nums ${fontSize}`}
          style={{ color }}
        >
          {Math.round(clamped)}%
        </span>
        {label && (
          <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
