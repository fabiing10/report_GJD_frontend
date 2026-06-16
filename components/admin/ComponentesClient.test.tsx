import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentesClient } from './ComponentesClient'
import type { Componente } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/actions/componentes', () => ({
  crearComponente: vi.fn(),
  actualizarComponente: vi.fn(),
  eliminarComponente: vi.fn(),
  reordenarComponentes: vi.fn(),
}))

const comp = (id: string, nombre: string, slug: string): Componente => ({
  id,
  informe_id: 'inf-1',
  slug,
  nombre,
  descripcion: null,
  icono: '🏛️',
  color_hex: '#3B82F6',
  color_token: 'azul',
  orden: 0,
  avance_override: null,
  created_at: '',
  updated_at: '',
})

describe('ComponentesClient', () => {
  const componentes = [
    comp('a', 'Gobernanza de datos', 'gobernanza'),
    comp('b', 'Lago de datos', 'lago-datos'),
  ]

  it('renderiza los nombres de los componentes', () => {
    render(<ComponentesClient componentes={componentes} informeId="inf-1" />)
    expect(screen.getByText('Gobernanza de datos')).toBeInTheDocument()
    expect(screen.getByText('Lago de datos')).toBeInTheDocument()
  })

  it('renderiza los slugs de los componentes', () => {
    render(<ComponentesClient componentes={componentes} informeId="inf-1" />)
    expect(screen.getByText('gobernanza')).toBeInTheDocument()
    expect(screen.getByText('lago-datos')).toBeInTheDocument()
  })

  it('muestra el botón "+ Nuevo componente"', () => {
    render(<ComponentesClient componentes={componentes} informeId="inf-1" />)
    expect(
      screen.getByRole('button', { name: /nuevo componente/i })
    ).toBeInTheDocument()
  })

  it('con lista vacía muestra el botón de crear y un mensaje vacío', () => {
    render(<ComponentesClient componentes={[]} informeId="inf-1" />)
    expect(
      screen.getByRole('button', { name: /nuevo componente/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/sin componentes/i)).toBeInTheDocument()
  })
})
