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
