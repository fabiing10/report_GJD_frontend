import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProyectoCard } from './ProyectoCard'
import type { ProyectoDetalle } from '@/types/domain'

const mockProyecto: ProyectoDetalle = {
  id: 'p1',
  componente_id: 'c1',
  slug: 'hu-1',
  codigo: 'HU-1',
  nombre: 'HU-1 Gestión de Notificaciones',
  descripcion_corta: 'Flujo automatizado',
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
  total_plazos: 0,
  total_criterios: 0,
  criterios_cumplidos: 0,
  plazos: [],
  recursos: [],
  actividades: [],
}

describe('ProyectoCard', () => {
  it('renderiza código, nombre y descripción corta', () => {
    render(
      <ProyectoCard
        proyecto={mockProyecto}
        componente={{
          slug: 'gestion-notificaciones',
          color_hex: '#3B82F6',
        }}
      />
    )
    expect(screen.getByText('HU-1')).toBeInTheDocument()
    expect(
      screen.getByText('HU-1 Gestión de Notificaciones')
    ).toBeInTheDocument()
    expect(screen.getByText('Flujo automatizado')).toBeInTheDocument()
  })
})
