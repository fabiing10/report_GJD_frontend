'use client'

import { X } from 'lucide-react'
import { useModoPresentacion } from './ModoPresentacionProvider'
import { PaginadorPuntos } from './PaginadorPuntos'
import type { InformeConRelaciones } from '@/types/domain'

interface ModoPresentacionBarProps {
  informe: InformeConRelaciones
}

export function ModoPresentacionBar({ informe }: ModoPresentacionBarProps) {
  const { slides, currentSlideIndex, desactivar } = useModoPresentacion()

  const totalChips = informe.componentes.length + 2 // home + componentes + linea-tiempo
  const chipCurrent = Math.min(currentSlideIndex, totalChips - 1)

  return (
    <div
      className="fixed top-4 right-4 z-50 flex items-center gap-3 px-3 py-2 rounded-xl text-xs"
      style={{
        background: 'rgba(10,18,40,0.8)',
        backdropFilter: 'blur(16px)',
        border: '1px solid var(--color-surface-border)',
      }}
    >
      <span className="text-[var(--color-text-muted)] tabular-nums">
        {currentSlideIndex + 1} / {Math.max(slides.length, 1)}
      </span>
      <PaginadorPuntos
        total={Math.max(totalChips, 1)}
        current={chipCurrent}
        color="#F97316"
      />
      <button
        onClick={desactivar}
        className="p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Salir de presentación"
      >
        <X size={14} className="text-[var(--color-text-muted)]" />
      </button>
    </div>
  )
}
