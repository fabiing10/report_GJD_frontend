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
})
