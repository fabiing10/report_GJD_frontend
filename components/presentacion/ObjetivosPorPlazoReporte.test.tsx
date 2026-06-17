import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useSearchParams: () => ({ get: () => null }) }))

import { ObjetivosPorPlazoReporte } from './ObjetivosPorPlazoReporte'
import type { ObjetivoDetalle } from '@/types/domain'

const obj = (id: string, plazo: ObjetivoDetalle['plazo'], estado: ObjetivoDetalle['estado']): ObjetivoDetalle => ({
  id, proyecto_id: 'p1', titulo: id, descripcion: null, tipo: 'hu', plazo, estado,
  peso: 1, orden: 0, created_at: '', updated_at: '', actividades: [],
})

describe('ObjetivosPorPlazoReporte', () => {
  it('agrupa por plazo y lista los objetivos como enlaces a ?obj', () => {
    render(
      <ObjetivosPorPlazoReporte
        objetivos={[obj('A', 'corto', 'cumplido'), obj('B', 'mediano', 'pendiente')]}
        colorHex="#3B82F6"
      />
    )
    expect(screen.getByText('Corto Plazo')).toBeInTheDocument()
    expect(screen.getByText('Mediano Plazo')).toBeInTheDocument()
    expect(screen.getByText('A').closest('a')?.getAttribute('href')).toBe('?obj=A')
    expect(screen.getByText('B').closest('a')?.getAttribute('href')).toBe('?obj=B')
  })
})
