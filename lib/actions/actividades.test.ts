import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (...a: unknown[]) => revalidatePath(...a),
}))

let insertError: { message: string } | null
let updateError: { message: string } | null
let deleteError: { message: string } | null

const insertSpy = vi.fn()
const deleteEqSpy = vi.fn()
const updatePatchCalls: Array<{ id: string; patch: Record<string, unknown> }> = []

function makeFrom() {
  return {
    insert: vi.fn(async (rows: unknown) => {
      insertSpy(rows)
      return { error: insertError }
    }),
    update: vi.fn((patch: Record<string, unknown>) => ({
      eq: vi.fn(async (_col: string, id: string) => {
        updatePatchCalls.push({ id, patch })
        return { error: updateError }
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(async (_col: string, id: string) => {
        deleteEqSpy(id)
        return { error: deleteError }
      }),
    })),
  }
}

const fromSpy = vi.fn(() => makeFrom())
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ from: fromSpy }),
}))

const validInput = {
  objetivo_id: 'obj-1',
  tipo: 'reunion' as const,
  titulo: 'Reunión de arranque',
  descripcion: 'Kickoff con el equipo',
  fecha: '2026-06-16',
  estado: 'pendiente' as const,
  responsable: 'Ana',
}

beforeEach(() => {
  vi.clearAllMocks()
  updatePatchCalls.length = 0
  insertError = null
  updateError = null
  deleteError = null
})

describe('crearActividad', () => {
  it('inserta los datos validados con orden = 0 y revalida', async () => {
    const { crearActividad } = await import('./actividades')
    await crearActividad(validInput)

    expect(insertSpy).toHaveBeenCalledTimes(1)
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        objetivo_id: 'obj-1',
        tipo: 'reunion',
        titulo: 'Reunión de arranque',
        estado: 'pendiente',
        responsable: 'Ana',
        orden: 0,
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/actividades')
  })

  it('rechaza título vacío (Zod) sin insertar', async () => {
    const { crearActividad } = await import('./actividades')
    await expect(
      crearActividad({ ...validInput, titulo: '' })
    ).rejects.toThrow()
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('propaga el mensaje de error de Supabase al insertar', async () => {
    insertError = { message: 'fk violation' }
    const { crearActividad } = await import('./actividades')
    await expect(crearActividad(validInput)).rejects.toThrow('fk violation')
  })
})

describe('actualizarActividad', () => {
  it('actualiza por id con datos validados y revalida', async () => {
    const { actualizarActividad } = await import('./actividades')
    await actualizarActividad('act-2', { ...validInput, titulo: 'Editado' })

    expect(updatePatchCalls).toHaveLength(1)
    expect(updatePatchCalls[0]?.id).toBe('act-2')
    expect(updatePatchCalls[0]?.patch).toEqual(
      expect.objectContaining({ titulo: 'Editado', tipo: 'reunion' })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/actividades')
  })

  it('propaga el mensaje de error de Supabase al actualizar', async () => {
    updateError = { message: 'update failed' }
    const { actualizarActividad } = await import('./actividades')
    await expect(
      actualizarActividad('act-2', validInput)
    ).rejects.toThrow('update failed')
  })
})

describe('eliminarActividad', () => {
  it('elimina por id y revalida', async () => {
    const { eliminarActividad } = await import('./actividades')
    await eliminarActividad('act-9')
    expect(deleteEqSpy).toHaveBeenCalledWith('act-9')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/actividades')
  })

  it('propaga el mensaje de error de Supabase al eliminar', async () => {
    deleteError = { message: 'delete failed' }
    const { eliminarActividad } = await import('./actividades')
    await expect(eliminarActividad('act-9')).rejects.toThrow('delete failed')
  })
})
