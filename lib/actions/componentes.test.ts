import { describe, it, expect, vi, beforeEach } from 'vitest'

const revalidatePath = vi.fn()
vi.mock('next/cache', () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }))

// Mutable handles the per-test mock fills.
let maxOrdenRow: { orden: number } | null
let selectError: { message: string } | null
let insertError: { message: string } | null
let deleteError: { message: string } | null
let updateError: { message: string } | null

const insertSpy = vi.fn()
const deleteEqSpy = vi.fn()
// Records [id, orden] pairs produced by reordenarComponentes.
const updateCalls: Array<{ orden: number; id: string }> = []
// Records full update patches keyed by id (used by actualizarComponente).
const updatePatchCalls: Array<{ id: string; patch: Record<string, unknown> }> = []

function makeFrom() {
  return {
    // crearComponente: max orden lookup → select().eq().order().limit().maybeSingle()
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            maybeSingle: vi.fn(async () => ({ data: maxOrdenRow, error: selectError })),
          })),
        })),
      })),
    })),
    insert: vi.fn(async (rows: unknown) => {
      insertSpy(rows)
      return { error: insertError }
    }),
    update: vi.fn((patch: Record<string, unknown>) => ({
      eq: vi.fn(async (_col: string, id: string) => {
        updatePatchCalls.push({ id, patch })
        if (typeof patch['orden'] === 'number' && Object.keys(patch).length === 1) {
          updateCalls.push({ orden: patch['orden'] as number, id })
        }
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
  informe_id: 'inf-1',
  slug: 'gobernanza',
  nombre: 'Gobernanza de datos',
  descripcion: 'Desc',
  icono: '🏛️',
  color_hex: '#3B82F6',
  color_token: 'azul',
  avance_override: null,
}

beforeEach(() => {
  vi.clearAllMocks()
  updateCalls.length = 0
  updatePatchCalls.length = 0
  maxOrdenRow = null
  selectError = null
  insertError = null
  deleteError = null
  updateError = null
})

describe('crearComponente', () => {
  it('inserta datos validados con orden = max+1', async () => {
    maxOrdenRow = { orden: 4 }
    const { crearComponente } = await import('./componentes')
    await crearComponente(validInput)

    expect(insertSpy).toHaveBeenCalledTimes(1)
    expect(insertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        informe_id: 'inf-1',
        slug: 'gobernanza',
        nombre: 'Gobernanza de datos',
        color_hex: '#3B82F6',
        orden: 5,
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/admin/componentes')
  })

  it('usa orden 0 cuando el informe no tiene componentes', async () => {
    maxOrdenRow = null
    const { crearComponente } = await import('./componentes')
    await crearComponente(validInput)
    expect(insertSpy).toHaveBeenCalledWith(expect.objectContaining({ orden: 0 }))
  })

  it('rechaza color_hex inválido (Zod) sin insertar', async () => {
    const { crearComponente } = await import('./componentes')
    await expect(
      crearComponente({ ...validInput, color_hex: 'rojo' })
    ).rejects.toThrow()
    expect(insertSpy).not.toHaveBeenCalled()
  })

  it('propaga el mensaje de error de Supabase al insertar', async () => {
    insertError = { message: 'duplicate slug' }
    const { crearComponente } = await import('./componentes')
    await expect(crearComponente(validInput)).rejects.toThrow('duplicate slug')
  })
})

describe('reordenarComponentes', () => {
  it('actualiza orden de cada id según su índice', async () => {
    const { reordenarComponentes } = await import('./componentes')
    await reordenarComponentes(['a', 'b', 'c'])
    expect(updateCalls).toEqual([
      { id: 'a', orden: 0 },
      { id: 'b', orden: 1 },
      { id: 'c', orden: 2 },
    ])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/componentes')
  })
})

describe('eliminarComponente', () => {
  it('elimina por id y revalida', async () => {
    const { eliminarComponente } = await import('./componentes')
    await eliminarComponente('comp-9')
    expect(deleteEqSpy).toHaveBeenCalledWith('comp-9')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/componentes')
  })
})

describe('actualizarComponente', () => {
  it('actualiza por id con datos validados', async () => {
    const { actualizarComponente } = await import('./componentes')
    await actualizarComponente('comp-2', validInput)
    expect(updatePatchCalls).toHaveLength(1)
    expect(updatePatchCalls[0]!.id).toBe('comp-2')
    expect(updatePatchCalls[0]!.patch).toEqual(
      expect.objectContaining({ nombre: 'Gobernanza de datos', slug: 'gobernanza' })
    )
    // No debe tocar el campo orden al editar.
    expect(updatePatchCalls[0]!.patch).not.toHaveProperty('orden')
    expect(revalidatePath).toHaveBeenCalledWith('/admin/componentes')
  })
})
