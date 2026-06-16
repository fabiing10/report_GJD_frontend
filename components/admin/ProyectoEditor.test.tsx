import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProyectoEditor } from './ProyectoEditor'
import type { ProyectoDetalle } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/proyectos', () => ({
  actualizarProyecto: vi.fn(),
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

vi.mock('@/lib/actions/recursos', () => ({
  crearRecurso: vi.fn(),
  actualizarRecurso: vi.fn(),
  eliminarRecurso: vi.fn(),
}))

const proyecto: ProyectoDetalle = {
  id: 'p-1',
  componente_id: 'c-1',
  slug: 'catalogo-datos',
  codigo: 'PRY-001',
  nombre: 'Catálogo de datos',
  descripcion_corta: null,
  descripcion_larga: null,
  estado: 'en_progreso',
  responsable: 'Equipo datos',
  fecha_inicio: null,
  fecha_fin: null,
  avance_override: null,
  orden: 0,
  created_at: '',
  updated_at: '',
  avance_calculado: 67,
  total_plazos: 1,
  total_criterios: 1,
  criterios_cumplidos: 0,
  plazos: [
    {
      id: 'pl-1',
      proyecto_id: 'p-1',
      plazo: 'corto',
      fecha_inicio: null,
      fecha_fin: null,
      avance_override: null,
      orden: 0,
      avance_calculado: 67,
      total_criterios: 1,
      criterios_cumplidos: 0,
      criterios: [
        {
          id: 'cr-1',
          proyecto_plazo_id: 'pl-1',
          texto: 'Definir esquema',
          descripcion: null,
          peso: 1,
          estado: 'en_progreso',
          orden: 0,
          created_at: '',
          updated_at: '',
        },
      ],
    },
  ],
  recursos: [
    {
      id: 'r-1',
      proyecto_id: 'p-1',
      tipo: 'link',
      titulo: 'Repositorio',
      url: 'https://example.com',
      thumbnail_url: null,
      duracion_segundos: null,
      orden: 0,
    },
  ],
  actividades: [],
}

describe('ProyectoEditor', () => {
  it('renderiza el nombre del proyecto y su avance', () => {
    render(<ProyectoEditor proyecto={proyecto} />)
    expect(
      screen.getByDisplayValue('Catálogo de datos')
    ).toBeInTheDocument()
    expect(screen.getAllByText(/67%/).length).toBeGreaterThan(0)
  })

  it('renderiza las secciones de datos, plazos y recursos', () => {
    render(<ProyectoEditor proyecto={proyecto} />)
    expect(screen.getByText('Datos del proyecto')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Plazos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recursos' })).toBeInTheDocument()
  })

  it('renderiza el plazo y su criterio existente', () => {
    render(<ProyectoEditor proyecto={proyecto} />)
    expect(screen.getByText('Definir esquema')).toBeInTheDocument()
  })
})
