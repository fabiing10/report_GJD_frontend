import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const signOut = vi.fn().mockResolvedValue({ error: null })
const push = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push, refresh: vi.fn() }) }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ auth: { signOut } }) }))

import { LogoutButton } from './LogoutButton'

describe('LogoutButton', () => {
  it('cierra sesión y redirige a /login', async () => {
    render(<LogoutButton />)
    fireEvent.click(screen.getByRole('button', { name: /salir/i }))
    await vi.waitFor(() => expect(signOut).toHaveBeenCalled())
    expect(push).toHaveBeenCalledWith('/login')
  })

  it('usa el label provisto (p. ej. "Cerrar sesión")', () => {
    render(<LogoutButton label="Cerrar sesión" />)
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
  })

  it('modo collapsed: solo ícono con tooltip, sigue cerrando sesión', async () => {
    render(<LogoutButton collapsed label="Cerrar sesión" />)
    const btn = screen.getByRole('button', { name: /cerrar sesión/i })
    // icon-rail: sin texto visible
    expect(btn).toHaveTextContent('')
    fireEvent.click(btn)
    await vi.waitFor(() => expect(signOut).toHaveBeenCalled())
  })
})
