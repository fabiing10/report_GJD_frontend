import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActividadesClient } from './ActividadesClient'
import type { Actividad } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/lib/actions/actividades', () => ({
  crearActividad: vi.fn().mockResolvedValue(undefined),
  actualizarActividad: vi.fn().mockResolvedValue(undefined),
  eliminarActividad: vi.fn().mockResolvedValue(undefined),
}))

const proyectos = [
  { id: 'proy-1', nombre: 'Lago de datos' },
  { id: 'proy-2', nombre: 'Gobernanza IA' },
]

const actividades: Array<Actividad & { proyecto_nombre: string }> = [
  {
    id: 'act-1',
    proyecto_id: 'proy-1',
    proyecto_plazo_id: null,
    tipo: 'reunion',
    titulo: 'Kickoff del proyecto',
    descripcion: null,
    fecha: '2026-06-10',
    estado: 'completada',
    responsable: 'Ana',
    orden: 0,
    created_at: '',
    updated_at: '',
    proyecto_nombre: 'Lago de datos',
  },
  {
    id: 'act-2',
    proyecto_id: 'proy-2',
    proyecto_plazo_id: null,
    tipo: 'investigacion',
    titulo: 'Benchmark de modelos',
    descripcion: null,
    fecha: '2026-06-12',
    estado: 'en_progreso',
    responsable: 'Beto',
    orden: 0,
    created_at: '',
    updated_at: '',
    proyecto_nombre: 'Gobernanza IA',
  },
]

describe('ActividadesClient', () => {
  it('renderiza el botón "+ Nueva actividad"', () => {
    render(<ActividadesClient actividades={[]} proyectos={proyectos} />)
    expect(
      screen.getByRole('button', { name: /nueva actividad/i })
    ).toBeInTheDocument()
  })

  it('renderiza una fila por actividad con su título y proyecto', () => {
    render(
      <ActividadesClient actividades={actividades} proyectos={proyectos} />
    )
    expect(screen.getByText('Kickoff del proyecto')).toBeInTheDocument()
    expect(screen.getByText('Benchmark de modelos')).toBeInTheDocument()
    expect(screen.getByText('Lago de datos')).toBeInTheDocument()
    expect(screen.getByText('Gobernanza IA')).toBeInTheDocument()
  })

  it('muestra un estado vacío cuando no hay actividades', () => {
    render(<ActividadesClient actividades={[]} proyectos={proyectos} />)
    expect(screen.getByText(/sin actividades/i)).toBeInTheDocument()
  })
})
