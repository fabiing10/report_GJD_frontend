import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimelineSVG } from './TimelineSVG'
import type { ComponenteConProyectos } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const componentes: ComponenteConProyectos[] = [
  {
    id: 'c1',
    informe_id: 'i1',
    slug: 'gestion-notificaciones',
    nombre: 'Gestión de Notificaciones',
    descripcion: null,
    icono: '⚙️',
    color_hex: '#3B82F6',
    color_token: 'blue',
    orden: 0,
    avance_override: null,
    created_at: '',
    updated_at: '',
    avance_calculado: 86,
    total_actividades: 1,
    actividades_completadas: 1,
    proyectos: [
      {
        id: 'p1',
        componente_id: 'c1',
        slug: 'hu-1',
        codigo: 'HU-1',
        nombre: 'HU-1',
        descripcion_corta: null,
        descripcion_larga: null,
        estado: 'completado',
        avance_override: null,
        responsable: null,
        fecha_inicio: null,
        fecha_fin: null,
        orden: 0,
        created_at: '',
        updated_at: '',
        avance_calculado: 100,
        total_plazos: 1,
        total_criterios: 0,
        criterios_cumplidos: 0,
        plazos: [
          {
            id: 'pl1',
            proyecto_id: 'p1',
            plazo: 'corto',
            fecha_inicio: null,
            fecha_fin: null,
            avance_override: null,
            orden: 0,
            avance_calculado: 100,
            total_criterios: 0,
            criterios_cumplidos: 0,
            criterios: [],
          },
        ],
        recursos: [],
        actividades: [],
      },
    ],
  },
]

describe('TimelineSVG', () => {
  it('renderiza headers de los 3 plazos', () => {
    render(<TimelineSVG componentes={componentes} fechaCorte="2026-02-13" />)
    expect(screen.getByText(/Corto Plazo/)).toBeInTheDocument()
    expect(screen.getByText(/Mediano Plazo/)).toBeInTheDocument()
    expect(screen.getByText(/Largo Plazo/)).toBeInTheDocument()
  })
})
