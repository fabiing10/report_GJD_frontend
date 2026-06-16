import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProyectosClient } from './ProyectosClient'
import type { Componente, ProyectoConAvance } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/proyectos', () => ({
  crearProyecto: vi.fn(),
  actualizarProyecto: vi.fn(),
  eliminarProyecto: vi.fn(),
  reordenarProyectos: vi.fn(),
}))

const comp: Componente = {
  id: 'c-1',
  informe_id: 'inf-1',
  slug: 'gobernanza',
  nombre: 'Gobernanza de datos',
  descripcion: null,
  icono: '🏛️',
  color_hex: '#3B82F6',
  color_token: 'azul',
  orden: 0,
  avance_override: null,
  created_at: '',
  updated_at: '',
}

const proy = (
  id: string,
  nombre: string,
  estado: ProyectoConAvance['estado'],
  avance: number,
  codigo: string | null
): ProyectoConAvance => ({
  id,
  componente_id: 'c-1',
  slug: nombre.toLowerCase().replace(/\s+/g, '-'),
  codigo,
  nombre,
  descripcion_corta: null,
  descripcion_larga: null,
  estado,
  avance_override: null,
  responsable: null,
  fecha_inicio: null,
  fecha_fin: null,
  orden: 0,
  created_at: '',
  updated_at: '',
  avance_calculado: avance,
  total_plazos: 0,
  total_criterios: 0,
  criterios_cumplidos: 0,
})

const grupos = [
  {
    componente: comp,
    proyectos: [
      proy('p-1', 'Catálogo de datos', 'en_progreso', 42, 'PRY-001'),
      proy('p-2', 'Política de calidad', 'completado', 100, null),
    ],
  },
]

describe('ProyectosClient', () => {
  it('renderiza los nombres de los proyectos', () => {
    render(<ProyectosClient grupos={grupos} />)
    expect(screen.getByText('Catálogo de datos')).toBeInTheDocument()
    expect(screen.getByText('Política de calidad')).toBeInTheDocument()
  })

  it('renderiza el nombre del componente y el botón de crear', () => {
    render(<ProyectosClient grupos={grupos} />)
    expect(screen.getByText('Gobernanza de datos')).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /nuevo proyecto/i }).length
    ).toBeGreaterThan(0)
  })

  it('renderiza el código y el avance de un proyecto', () => {
    render(<ProyectosClient grupos={grupos} />)
    expect(screen.getByText('PRY-001')).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('cada proyecto enlaza a su página de detalle', () => {
    render(<ProyectosClient grupos={grupos} />)
    const link1 = screen.getByRole('link', { name: /Catálogo de datos/i })
    expect(link1).toHaveAttribute('href', '/admin/proyectos/p-1')
    const link2 = screen.getByRole('link', { name: /Política de calidad/i })
    expect(link2).toHaveAttribute('href', '/admin/proyectos/p-2')
  })

  it('con grupos vacíos muestra un mensaje de vacío', () => {
    render(<ProyectosClient grupos={[]} />)
    expect(screen.getByText(/sin componentes/i)).toBeInTheDocument()
  })
})
