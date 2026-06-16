import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { InformeConAvance } from '@/types/domain'

vi.mock('@/lib/actions/informes', () => ({
  crearInforme: vi.fn(),
  actualizarInforme: vi.fn(),
  eliminarInforme: vi.fn(),
  activarInforme: vi.fn(),
  duplicarInforme: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { InformesClient } from './InformesClient'

const informes: InformeConAvance[] = [
  {
    id: '1',
    titulo: 'Informe activo 2026',
    subtitulo: 'Q2',
    fecha_corte: '2026-06-16',
    avance_global_override: null,
    is_active: true,
    created_at: '2026-06-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
    avance_global_calculado: 42.5,
  },
  {
    id: '2',
    titulo: 'Borrador histórico',
    subtitulo: null,
    fecha_corte: '2025-12-01',
    avance_global_override: null,
    is_active: false,
    created_at: '2025-11-01T00:00:00Z',
    updated_at: '2025-11-01T00:00:00Z',
    avance_global_calculado: 100,
  },
]

describe('InformesClient', () => {
  it('renderiza los títulos de cada informe', () => {
    render(<InformesClient informes={informes} />)
    expect(screen.getByText('Informe activo 2026')).toBeInTheDocument()
    expect(screen.getByText('Borrador histórico')).toBeInTheDocument()
  })

  it('muestra el botón "+ Nuevo informe"', () => {
    render(<InformesClient informes={informes} />)
    expect(
      screen.getByRole('button', { name: /nuevo informe/i })
    ).toBeInTheDocument()
  })

  it('muestra el avance global redondeado', () => {
    render(<InformesClient informes={informes} />)
    expect(screen.getByText('43%')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('marca el informe activo con un badge "Activo"', () => {
    render(<InformesClient informes={informes} />)
    // "Activo" aparece como encabezado de columna y como badge de fila.
    // El badge es el <span>, no el <th> (columnheader).
    const matches = screen.getAllByText('Activo')
    const badge = matches.find((el) => el.tagName.toLowerCase() === 'span')
    expect(badge).toBeInTheDocument()
  })
})
