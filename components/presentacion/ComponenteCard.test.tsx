import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponenteCard } from './ComponenteCard'
import type { ComponenteConAvance } from '@/types/domain'

const mockComponente: ComponenteConAvance = {
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
  total_actividades: 5,
  actividades_completadas: 3,
}

describe('ComponenteCard', () => {
  it('renderiza nombre, icono y porcentaje', () => {
    render(<ComponenteCard componente={mockComponente} />)
    expect(screen.getByText('Gestión de Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('86%')).toBeInTheDocument()
    expect(screen.getByText('5 actividades')).toBeInTheDocument()
  })
})
