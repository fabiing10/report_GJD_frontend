import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PlazoCriterios } from './PlazoCriterios'
import type { PlazoDetalle } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/plazos', () => ({
  crearPlazo: vi.fn(),
  actualizarPlazo: vi.fn(),
  eliminarPlazo: vi.fn(),
}))

vi.mock('@/lib/actions/criterios', () => ({
  crearCriterio: vi.fn(),
  actualizarCriterio: vi.fn(),
  eliminarCriterio: vi.fn(),
  reordenarCriterios: vi.fn(),
}))

const plazo: PlazoDetalle = {
  id: 'pl-1',
  proyecto_id: 'p-1',
  plazo: 'corto',
  fecha_inicio: null,
  fecha_fin: null,
  avance_override: null,
  orden: 0,
  avance_calculado: 50,
  total_criterios: 1,
  criterios_cumplidos: 0,
  criterios: [
    {
      id: 'cr-1',
      proyecto_plazo_id: 'pl-1',
      texto: 'Definir esquema de datos',
      descripcion: null,
      peso: 1,
      estado: 'en_progreso',
      orden: 0,
      created_at: '',
      updated_at: '',
    },
  ],
}

describe('PlazoCriterios', () => {
  it('renderiza el texto del criterio y el avance del plazo', () => {
    render(<PlazoCriterios plazo={plazo} proyectoId="p-1" />)
    expect(screen.getByText('Definir esquema de datos')).toBeInTheDocument()
    expect(screen.getByText(/50%/)).toBeInTheDocument()
  })

  it('renderiza el control para agregar un criterio', () => {
    render(<PlazoCriterios plazo={plazo} proyectoId="p-1" />)
    expect(
      screen.getByRole('button', { name: /criterio/i })
    ).toBeInTheDocument()
  })

  it('muestra la etiqueta del plazo', () => {
    render(<PlazoCriterios plazo={plazo} proyectoId="p-1" />)
    expect(screen.getByText(/corto/i)).toBeInTheDocument()
  })
})
