'use client'

import { useState, useEffect } from 'react'
import { Maximize, Minus, Plus } from 'lucide-react'
import { formatFecha } from '@/lib/utils'

interface FooterProps {
  fechaCorte: string
  onPresentar: () => void
}

export function Footer({ fechaCorte, onPresentar }: FooterProps) {
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const saved = localStorage.getItem('gjd-zoom')
    if (saved) setZoom(Number(saved))
  }, [])

  useEffect(() => {
    const main = document.querySelector('main')
    if (main) (main as HTMLElement).style.transform = `scale(${zoom / 100})`
  }, [zoom])

  const setZoomValue = (v: number) => {
    const clamped = Math.min(150, Math.max(60, v))
    setZoom(clamped)
    localStorage.setItem('gjd-zoom', String(clamped))
  }

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(10,18,40,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-surface-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => setZoomValue(zoom - 10)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Zoom out"
        >
          <Minus size={14} className="text-[var(--color-text-muted)]" />
        </button>
        <span className="text-xs tabular-nums text-[var(--color-text-muted)] w-10 text-center">
          {zoom}%
        </span>
        <button
          onClick={() => setZoomValue(zoom + 10)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Zoom in"
        >
          <Plus size={14} className="text-[var(--color-text-muted)]" />
        </button>
      </div>

      <button
        onClick={onPresentar}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
        style={{
          color: 'var(--color-alcaldia-naranja)',
          border: '1px solid rgba(249,115,22,0.3)',
        }}
      >
        <Maximize size={14} />
        Presentar
      </button>

      <p className="text-xs text-[var(--color-text-muted)]">
        Corte: {formatFecha(fechaCorte)}
      </p>
    </footer>
  )
}
