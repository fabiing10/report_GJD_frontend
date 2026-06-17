import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({ usePathname: () => '/gestion/hu-1' }))

import { NavTree } from './NavTree'
import type { ComponenteConProyectos } from '@/types/domain'

const comp = (slug: string, nombre: string): ComponenteConProyectos => ({
  id: slug, informe_id: 'i', slug, nombre, descripcion: null, icono: '⚙️',
  color_hex: '#3B82F6', color_token: slug, orden: 0, avance_override: null,
  created_at: '', updated_at: '', avance_calculado: 60, total_actividades: 1,
  actividades_completadas: 0,
  proyectos: [
    {
      id: 'p1', componente_id: slug, slug: 'hu-1', codigo: 'HU-1', nombre: 'HU-1',
      descripcion_corta: null, descripcion_larga: null, estado: 'en_progreso',
      avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null,
      orden: 0, created_at: '', updated_at: '', avance_calculado: 57,
      total_objetivos: 2, objetivos_cumplidos: 1,
      objetivos: [
        { id: 'o1', proyecto_id: 'p1', titulo: 'Control sistémico', descripcion: null, tipo: 'hu', plazo: 'corto', estado: 'cumplido', peso: 1, orden: 0, created_at: '', updated_at: '', actividades: [] },
      ],
      recursos: [], ejes: [],
    },
  ],
})

describe('NavTree', () => {
  it('renderiza Inicio, Línea de Tiempo y los componentes', () => {
    render(<NavTree componentes={[comp('gestion', 'Gestión')]} />)
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Línea de Tiempo')).toBeInTheDocument()
    expect(screen.getByText('Gestión')).toBeInTheDocument()
  })

  it('auto-expande el componente y proyecto de la ruta actual', () => {
    render(<NavTree componentes={[comp('gestion', 'Gestión')]} />)
    // pathname /gestion/hu-1 → proyecto HU-1 visible
    expect(screen.getByText('HU-1')).toBeInTheDocument()
  })
})
