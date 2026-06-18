import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import { GanttCronograma } from './GanttCronograma'
import type { ComponenteConProyectos } from '@/types/domain'

const comp: ComponenteConProyectos = {
  id: 'c1', informe_id: 'i', slug: 'gestion', nombre: 'Gestión', descripcion: null,
  icono: '⚙️', color_hex: '#3B82F6', color_token: 'g', orden: 0, avance_override: null,
  created_at: '', updated_at: '', avance_calculado: 60, total_actividades: 1, actividades_completadas: 0,
  proyectos: [
    {
      id: 'p1', componente_id: 'c1', slug: 'hu-1', codigo: 'HU-1', nombre: 'HU-1 Gestión',
      descripcion_corta: null, descripcion_larga: null, estado: 'en_progreso',
      avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null,
      orden: 0, created_at: '', updated_at: '', avance_calculado: 50, total_objetivos: 1,
      objetivos_cumplidos: 0,
      objetivos: [
        { id: 'o1', proyecto_id: 'p1', titulo: 'A', descripcion: null, tipo: 'hu', plazo: 'corto', estado: 'cumplido', peso: 1, orden: 0, created_at: '', updated_at: '', actividades: [] },
      ],
      recursos: [], ejes: [],
    },
  ],
}

describe('GanttCronograma', () => {
  it('muestra los años, los plazos, el componente y el proyecto con su barra', () => {
    render(<GanttCronograma componentes={[comp]} />)
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('2027')).toBeInTheDocument()
    expect(screen.getByText('Corto')).toBeInTheDocument()
    expect(screen.getByText('Gestión')).toBeInTheDocument()
    expect(screen.getAllByText(/HU-1/).length).toBeGreaterThan(0)
    // barra del proyecto (botón navegable)
    expect(screen.getByRole('button', { name: /HU-1/ })).toBeInTheDocument()
  })
})
