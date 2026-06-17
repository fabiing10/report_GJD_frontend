import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProyectoEditor } from './ProyectoEditor'
import type { ProyectoDetalle, EjeTransversal } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/proyectos', () => ({
  actualizarProyecto: vi.fn(),
}))

vi.mock('@/lib/actions/objetivos', () => ({
  crearObjetivo: vi.fn(),
  actualizarObjetivo: vi.fn(),
  eliminarObjetivo: vi.fn(),
  reordenarObjetivos: vi.fn(),
}))

vi.mock('@/lib/actions/ejes', () => ({
  asignarEjeProyecto: vi.fn(),
  quitarEjeProyecto: vi.fn(),
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
  total_objetivos: 1,
  objetivos_cumplidos: 0,
  objetivos: [
    {
      id: 'obj-1',
      proyecto_id: 'p-1',
      titulo: 'Definir esquema',
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
  ejes: [
    { id: 'eje-1', nombre: 'Seguridad', color_hex: '#112233', orden: 0 },
  ],
}

const ejesDisponibles: EjeTransversal[] = [
  { id: 'eje-1', nombre: 'Seguridad', color_hex: '#112233', orden: 0 },
  { id: 'eje-2', nombre: 'Datos abiertos', color_hex: '#445566', orden: 1 },
]

describe('ProyectoEditor', () => {
  it('renderiza el nombre del proyecto y su avance', () => {
    render(<ProyectoEditor proyecto={proyecto} ejesDisponibles={ejesDisponibles} />)
    expect(screen.getByDisplayValue('Catálogo de datos')).toBeInTheDocument()
    expect(screen.getAllByText(/67%/).length).toBeGreaterThan(0)
  })

  it('renderiza las secciones de datos, objetivos, ejes y recursos', () => {
    render(<ProyectoEditor proyecto={proyecto} ejesDisponibles={ejesDisponibles} />)
    expect(screen.getByText('Datos del proyecto')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Objetivos' })).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Ejes transversales' })
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recursos' })).toBeInTheDocument()
  })

  it('agrupa los objetivos por plazo y muestra el objetivo existente bajo su grupo', () => {
    render(<ProyectoEditor proyecto={proyecto} ejesDisponibles={ejesDisponibles} />)
    expect(screen.getByRole('heading', { name: 'Corto plazo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Mediano plazo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Largo plazo' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Definir esquema')).toBeInTheDocument()
  })

  it('lista los ejes asignados al proyecto', () => {
    render(<ProyectoEditor proyecto={proyecto} ejesDisponibles={ejesDisponibles} />)
    expect(screen.getByText('Seguridad')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /quitar seguridad/i })
    ).toBeInTheDocument()
  })
})
