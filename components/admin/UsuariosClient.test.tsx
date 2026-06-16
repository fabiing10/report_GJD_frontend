import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Profile } from '@/types/domain'
import { UsuariosClient } from './UsuariosClient'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/actions/usuarios', () => ({
  crearUsuario: vi.fn(),
  cambiarRol: vi.fn(),
  resetearPassword: vi.fn(),
  eliminarUsuario: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const profiles: Profile[] = [
  {
    id: 'u-1',
    email: 'ana@example.com',
    full_name: 'Ana Pérez',
    role: 'admin',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  },
  {
    id: 'u-2',
    email: 'luis@example.com',
    full_name: null,
    role: 'usuario',
    created_at: '2026-01-02',
    updated_at: '2026-01-02',
  },
]

describe('UsuariosClient', () => {
  it('renderiza los emails de los perfiles', () => {
    render(<UsuariosClient profiles={profiles} />)
    expect(screen.getByText('ana@example.com')).toBeInTheDocument()
    expect(screen.getByText('luis@example.com')).toBeInTheDocument()
  })

  it('muestra el botón "+ Nuevo usuario"', () => {
    render(<UsuariosClient profiles={profiles} />)
    expect(
      screen.getByRole('button', { name: /nuevo usuario/i })
    ).toBeInTheDocument()
  })
})
