import { describe, it, expect, vi, beforeEach } from 'vitest'

const getProyectoEditable = vi.fn()
const notFound = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND')
})

vi.mock('@/lib/db/admin-queries', () => ({
  getProyectoEditable: (id: string) => getProyectoEditable(id),
  getAllEjes: () => Promise.resolve([]),
}))

vi.mock('next/navigation', () => ({
  notFound: () => notFound(),
}))

vi.mock('@/components/admin/ProyectoEditor', () => ({
  ProyectoEditor: () => null,
}))

import Page from './page'

describe('proyecto detalle page', () => {
  beforeEach(() => {
    getProyectoEditable.mockReset()
    notFound.mockClear()
  })

  it('llama notFound cuando el proyecto no existe', async () => {
    getProyectoEditable.mockResolvedValue(null)
    await expect(
      Page({ params: Promise.resolve({ id: 'missing' }) })
    ).rejects.toThrow('NEXT_NOT_FOUND')
    expect(getProyectoEditable).toHaveBeenCalledWith('missing')
    expect(notFound).toHaveBeenCalled()
  })

  it('renderiza el editor cuando el proyecto existe', async () => {
    getProyectoEditable.mockResolvedValue({ id: 'p-1', nombre: 'X' })
    const result = await Page({ params: Promise.resolve({ id: 'p-1' }) })
    expect(result).toBeTruthy()
    expect(notFound).not.toHaveBeenCalled()
  })
})
