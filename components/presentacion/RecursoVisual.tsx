'use client'

import { useState } from 'react'
import { PaginadorPuntos } from './PaginadorPuntos'
import type { ProyectoRecurso } from '@/types/domain'

interface RecursoVisualProps {
  recursos: ProyectoRecurso[]
}

export function RecursoVisual({ recursos }: RecursoVisualProps) {
  const [current, setCurrent] = useState(0)
  if (recursos.length === 0) return null

  const recurso = recursos[current]!

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-1 h-6 rounded-full"
          style={{ backgroundColor: 'var(--color-alcaldia-naranja)' }}
        />
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Recurso Visual
        </h3>
        {recurso.titulo && (
          <span className="text-xs text-[var(--color-text-muted)]">
            — {recurso.titulo}
          </span>
        )}
      </div>
      <div
        className="rounded-2xl overflow-hidden border"
        style={{
          borderColor: 'var(--color-surface-border)',
          aspectRatio: '16/9',
        }}
      >
        {recurso.tipo === 'video_url' &&
        recurso.url.startsWith('recursos/') ? (
          <video
            src={`/${recurso.url}`}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : recurso.tipo === 'video_url' || recurso.tipo === 'link' ? (
          <iframe
            src={recurso.url}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            title={recurso.titulo ?? 'Recurso visual'}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recurso.url}
            alt={recurso.titulo ?? 'Imagen'}
            className="w-full h-full object-contain"
          />
        )}
      </div>
      {recursos.length > 1 && (
        <div className="flex justify-center mt-3 gap-2">
          {recursos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="cursor-pointer"
              aria-label={`Ir a recurso ${i + 1}`}
            >
              <span
                className="block rounded-full transition-all duration-200"
                style={{
                  width: i === current ? 20 : 6,
                  height: 6,
                  backgroundColor:
                    i === current
                      ? 'var(--color-alcaldia-naranja)'
                      : 'rgba(148,163,184,0.3)',
                }}
              />
            </button>
          ))}
          <span className="sr-only">
            <PaginadorPuntos total={recursos.length} current={current} />
          </span>
        </div>
      )}
    </div>
  )
}
