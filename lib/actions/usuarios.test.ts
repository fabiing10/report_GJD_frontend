import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}))

const requireAdmin = vi.fn(async () => ({ userId: 'x' }))
vi.mock('@/lib/auth', () => ({
  requireAdmin: () => requireAdmin(),
}))

// Mutable handles for per-test fills.
let createUserResult: { data: { user: { id: string } | null }; error: { message: string } | null }
let updateError: { message: string } | null

const createUserSpy = vi.fn()
const deleteUserSpy = vi.fn()
const updateUserByIdSpy = vi.fn()
// Records profiles update patches keyed by id.
const profileUpdateCalls: Array<{ id: string; patch: Record<string, unknown> }> = []

function makeAdmin() {
  return {
    auth: {
      admin: {
        createUser: vi.fn(async (args: unknown) => {
          createUserSpy(args)
          return createUserResult
        }),
        deleteUser: vi.fn(async (id: string) => {
          deleteUserSpy(id)
          return { error: null }
        }),
        updateUserById: vi.fn(async (id: string, args: unknown) => {
          updateUserByIdSpy(id, args)
          return { error: null }
        }),
      },
    },
    from: vi.fn(() => ({
      update: vi.fn((patch: Record<string, unknown>) => ({
        eq: vi.fn(async (_col: string, id: string) => {
          profileUpdateCalls.push({ id, patch })
          return { error: updateError }
        }),
      })),
    })),
  }
}

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => makeAdmin(),
}))

const validInput = {
  email: 'nuevo@example.com',
  password: 'password123',
  full_name: 'Nuevo Usuario',
  role: 'admin' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
  profileUpdateCalls.length = 0
  createUserResult = { data: { user: { id: 'user-1' } }, error: null }
  updateError = null
  requireAdmin.mockResolvedValue({ userId: 'x' })
})

describe('crearUsuario', () => {
  it('llama requireAdmin + createUser y asigna rol al profile', async () => {
    const { crearUsuario } = await import('./usuarios')
    await crearUsuario(validInput)

    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(createUserSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nuevo@example.com',
        password: 'password123',
        email_confirm: true,
      })
    )
    expect(profileUpdateCalls).toEqual([
      { id: 'user-1', patch: { role: 'admin', full_name: 'Nuevo Usuario' } },
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/usuarios')
  })

  it('rechaza email inválido (Zod) sin crear usuario', async () => {
    const { crearUsuario } = await import('./usuarios')
    await expect(
      crearUsuario({ ...validInput, email: 'no-es-email' })
    ).rejects.toThrow()
    expect(createUserSpy).not.toHaveBeenCalled()
  })

  it('rechaza password corto (Zod) sin crear usuario', async () => {
    const { crearUsuario } = await import('./usuarios')
    await expect(
      crearUsuario({ ...validInput, password: 'short' })
    ).rejects.toThrow()
    expect(createUserSpy).not.toHaveBeenCalled()
  })

  it('NO lanza cuando createUser falla con error "already" (usuario ya existe)', async () => {
    createUserResult = {
      data: { user: null },
      error: { message: 'A user with this email address has already been registered' },
    }
    const { crearUsuario } = await import('./usuarios')
    await expect(crearUsuario(validInput)).resolves.not.toThrow()
  })

  it('lanza cuando createUser falla con error que no contiene "already"', async () => {
    createUserResult = {
      data: { user: null },
      error: { message: 'database connection failed' },
    }
    const { crearUsuario } = await import('./usuarios')
    await expect(crearUsuario(validInput)).rejects.toThrow('database connection failed')
  })

  it('propaga el error cuando requireAdmin lanza', async () => {
    requireAdmin.mockRejectedValueOnce(new Error('No autorizado'))
    const { crearUsuario } = await import('./usuarios')
    await expect(crearUsuario(validInput)).rejects.toThrow('No autorizado')
    expect(createUserSpy).not.toHaveBeenCalled()
  })
})

describe('cambiarRol', () => {
  it('actualiza el rol del profile por id', async () => {
    const { cambiarRol } = await import('./usuarios')
    await cambiarRol('user-2', 'usuario')
    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(profileUpdateCalls).toEqual([
      { id: 'user-2', patch: { role: 'usuario' } },
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/usuarios')
  })

  it('rechaza rol inválido (Zod)', async () => {
    const { cambiarRol } = await import('./usuarios')
    await expect(
      cambiarRol('user-2', 'superadmin' as unknown as 'admin')
    ).rejects.toThrow()
    expect(profileUpdateCalls).toEqual([])
  })

  it('propaga el error cuando requireAdmin lanza', async () => {
    requireAdmin.mockRejectedValueOnce(new Error('No autorizado'))
    const { cambiarRol } = await import('./usuarios')
    await expect(cambiarRol('user-2', 'admin')).rejects.toThrow('No autorizado')
  })

  it('propaga el mensaje de error de Supabase', async () => {
    updateError = { message: 'update failed' }
    const { cambiarRol } = await import('./usuarios')
    await expect(cambiarRol('user-2', 'admin')).rejects.toThrow('update failed')
  })
})

describe('resetearPassword', () => {
  it('actualiza el password via updateUserById', async () => {
    const { resetearPassword } = await import('./usuarios')
    await resetearPassword('user-3', 'newpassword123')
    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(updateUserByIdSpy).toHaveBeenCalledWith('user-3', {
      password: 'newpassword123',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/usuarios')
  })

  it('rechaza password corto (Zod)', async () => {
    const { resetearPassword } = await import('./usuarios')
    await expect(resetearPassword('user-3', 'short')).rejects.toThrow()
    expect(updateUserByIdSpy).not.toHaveBeenCalled()
  })
})

describe('eliminarUsuario', () => {
  it('elimina el auth user por id', async () => {
    const { eliminarUsuario } = await import('./usuarios')
    await eliminarUsuario('user-4')
    expect(requireAdmin).toHaveBeenCalledTimes(1)
    expect(deleteUserSpy).toHaveBeenCalledWith('user-4')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/usuarios')
  })

  it('propaga el error cuando requireAdmin lanza', async () => {
    requireAdmin.mockRejectedValueOnce(new Error('No autorizado'))
    const { eliminarUsuario } = await import('./usuarios')
    await expect(eliminarUsuario('user-4')).rejects.toThrow('No autorizado')
    expect(deleteUserSpy).not.toHaveBeenCalled()
  })
})
