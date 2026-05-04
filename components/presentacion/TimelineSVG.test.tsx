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
        plazo: 'corto',
        estado: 'completado',
        avance: 100,
        avance_corto: null,
        avance_mediano: null,
        avance_largo: null,
        responsable: null,
        fecha_entrega: null,
        fecha_entrega_texto: null,
        orden: 0,
        created_at: '',
        updated_at: '',
        logros: [],
        proximos_pasos: [],
        recursos: [],
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
