import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeaderTabs } from './HeaderTabs'
import type { ComponenteConAvance } from '@/types/domain'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

const componentes: ComponenteConAvance[] = [
  {
    id: '1',
    informe_id: 'i',
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
    avance_calculado: 80,
    total_actividades: 5,
    actividades_completadas: 3,
  },
]

describe('HeaderTabs', () => {
  it('renderiza un tab por componente', () => {
    render(<HeaderTabs componentes={componentes} />)
    expect(screen.getByText('Gestión de Notificaciones')).toBeInTheDocument()
  })
})
