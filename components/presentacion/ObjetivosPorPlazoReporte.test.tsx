import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useSearchParams: () => ({ get: () => null }) }))

import { ObjetivosPorPlazoReporte } from './ObjetivosPorPlazoReporte'
import type { ObjetivoDetalle } from '@/types/domain'

const obj = (id: string, plazo: ObjetivoDetalle['plazo'], estado: ObjetivoDetalle['estado']): ObjetivoDetalle => ({
  id, proyecto_id: 'p1', titulo: id, descripcion: null, tipo: 'hu', plazo, estado,
  peso: 1, orden: 0, created_at: '', updated_at: '', actividades: [],
})

describe('ObjetivosPorPlazoReporte (tabs)', () => {
  it('muestra tabs por plazo; el tab activo lista objetivos como enlaces ?obj', () => {
    render(
      <ObjetivosPorPlazoReporte
        objetivos={[obj('A', 'corto', 'cumplido'), obj('B', 'mediano', 'pendiente')]}
        colorHex="#3B82F6"
      />
    )
    // tabs presentes
    expect(screen.getByText('Corto Plazo')).toBeInTheDocument()
    expect(screen.getByText('Mediano Plazo')).toBeInTheDocument()
    // tab por defecto = corto → A visible como enlace, B no
    expect(screen.getByText('A').closest('a')?.getAttribute('href')).toBe('?obj=A')
    expect(screen.queryByText('B')).toBeNull()
    // cambiar al tab Mediano → B visible
    fireEvent.click(screen.getByText('Mediano Plazo'))
    expect(screen.getByText('B').closest('a')?.getAttribute('href')).toBe('?obj=B')
  })
})
