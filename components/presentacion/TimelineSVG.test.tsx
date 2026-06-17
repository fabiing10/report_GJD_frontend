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
        total_objetivos: 1,
        objetivos_cumplidos: 1,
        objetivos: [
          {
            id: 'o1',
            proyecto_id: 'p1',
            titulo: 'Objetivo 1',
            descripcion: null,
            tipo: 'hu',
            plazo: 'corto',
            estado: 'cumplido',
            peso: 1,
            orden: 0,
            created_at: '',
            updated_at: '',
            actividades: [],
          },
        ],
        recursos: [],
        ejes: [],
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
