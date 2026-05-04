'use client'

import { useState, useEffect } from 'react'
import { Maximize, Minus, Plus, RotateCcw } from 'lucide-react'
import { formatFecha } from '@/lib/utils'

interface FooterProps {
  fechaCorte: string
  onPresentar: () => void
  sidebarWidth?: number
}

function getDefaultZoom(): number {
  const saved = localStorage.getItem('gjd-zoom')
  if (saved) return Number(saved)
  const w = window.innerWidth
  if (w >= 1920) return 110
  if (w >= 1440) return 100
  if (w >= 1280) return 90
  return 80
}

function applyZoom(value: number) {
  document.documentElement.style.zoom = `${value}%`
  localStorage.setItem('gjd-zoom', String(value))
}

export function Footer({ fechaCorte, onPresentar, sidebarWidth = 0 }: FooterProps) {
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const z = getDefaultZoom()
    setZoom(z)
    applyZoom(z)
  }, [])

  // Keyboard shortcuts: Ctrl/Cmd + = / -
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setZoom(prev => { const next = Math.min(160, prev + 10); applyZoom(next); return next })
      }
      if (e.key === '-') {
        e.preventDefault()
        setZoom(prev => { const next = Math.max(60, prev - 10); applyZoom(next); return next })
      }
      if (e.key === '0') {
        e.preventDefault()
        const def = 100
        setZoom(def); applyZoom(def)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const changeZoom = (delta: number) => {
    setZoom(prev => {
      const next = Math.min(160, Math.max(60, prev + delta))
      applyZoom(next)
      return next
    })
  }

  const resetZoom = () => {
    setZoom(100)
    applyZoom(100)
  }

  return (
    <footer
      className="fixed bottom-0 right-0 z-20 flex items-center justify-between px-5 py-2.5"
      style={{
        left: sidebarWidth,
        background: 'rgba(8,14,30,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--color-surface-border)',
      }}
    >
      {/* Zoom controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => changeZoom(-10)}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Reducir zoom (Ctrl -)"
        >
          <Minus size={13} className="text-[var(--color-text-muted)]" />
        </button>
        <button
          onClick={resetZoom}
          className="min-w-[44px] text-center text-xs tabular-nums rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors"
          style={{ color: zoom !== 100 ? '#93c5fd' : 'var(--color-text-muted)' }}
          title="Restablecer zoom (Ctrl 0)"
        >
          {zoom}%
        </button>
        <button
          onClick={() => changeZoom(10)}
          className="p-1.5 rounded hover:bg-white/10 transition-colors"
          aria-label="Aumentar zoom (Ctrl +)"
        >
          <Plus size={13} className="text-[var(--color-text-muted)]" />
        </button>
        {zoom !== 100 && (
          <button
            onClick={resetZoom}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Restablecer"
          >
            <RotateCcw size={11} className="text-[var(--color-text-muted)]" />
          </button>
        )}
      </div>

      {/* Presentar */}
      <button
        onClick={onPresentar}
        className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-white/10"
        style={{
          color: 'var(--color-alcaldia-naranja)',
          border: '1px solid rgba(249,115,22,0.3)',
        }}
      >
        <Maximize size={13} />
        Presentar
      </button>

      {/* Fecha corte */}
      <p className="text-xs text-[var(--color-text-muted)]">
        Corte: {formatFecha(fechaCorte)}
      </p>
    </footer>
  )
}
