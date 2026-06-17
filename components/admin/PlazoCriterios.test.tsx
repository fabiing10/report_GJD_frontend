import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ObjetivosPorPlazo } from './PlazoCriterios'
import type { ObjetivoDetalle } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/objetivos', () => ({
  crearObjetivo: vi.fn(),
  actualizarObjetivo: vi.fn(),
  eliminarObjetivo: vi.fn(),
  reordenarObjetivos: vi.fn(),
}))

const objetivos: ObjetivoDetalle[] = [
  {
    id: 'obj-1',
    proyecto_id: 'p-1',
    titulo: 'Definir esquema de datos',
    descripcion: null,
    tipo: 'hu',
    plazo: 'corto',
    estado: 'en_progreso',
    peso: 1,
    orden: 0,
    created_at: '',
    updated_at: '',
    actividades: [],
  },
]

describe('ObjetivosPorPlazo', () => {
  it('renderiza el título del objetivo del grupo', () => {
    render(
      <ObjetivosPorPlazo proyectoId="p-1" plazo="corto" objetivos={objetivos} />
    )
    expect(screen.getByDisplayValue('Definir esquema de datos')).toBeInTheDocument()
  })

  it('renderiza el control para agregar un objetivo', () => {
    render(
      <ObjetivosPorPlazo proyectoId="p-1" plazo="corto" objetivos={objetivos} />
    )
    expect(
      screen.getByRole('button', { name: /objetivo/i })
    ).toBeInTheDocument()
  })

  it('muestra la etiqueta del plazo del grupo', () => {
    render(
      <ObjetivosPorPlazo proyectoId="p-1" plazo="corto" objetivos={objetivos} />
    )
    expect(
      screen.getByRole('heading', { name: 'Corto plazo' })
    ).toBeInTheDocument()
  })

  it('muestra un estado vacío cuando el grupo no tiene objetivos', () => {
    render(<ObjetivosPorPlazo proyectoId="p-1" plazo="mediano" objetivos={[]} />)
    expect(screen.getByText(/sin objetivos todavía/i)).toBeInTheDocument()
  })
})
