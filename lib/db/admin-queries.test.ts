import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeSupabase(tables) {
  return {
    from(table) {
      const rows = tables[table] ?? []
      const b = {}
      const chain = () => b
      b.select = chain
      b.eq = chain
      b.in = chain
      b.order = chain
      b.maybeSingle = () => Promise.resolve({ data: rows[0] ?? null })
      b.then = (res) => res({ data: rows })
      return b
    },
  }
}
const createClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({ createClient }))

describe('admin-queries', () => {
  beforeEach(() => createClient.mockReset())

  it('getAllInformes devuelve la lista', async () => {
    createClient.mockResolvedValue(
      makeSupabase({ v_informes_con_avance: [{ id: 'i1', titulo: 'T' }] })
    )
    const { getAllInformes } = await import('./admin-queries')
    const r = await getAllInformes()
    expect(r.map((x) => x.id)).toEqual(['i1'])
  })

  it('getProyectoEditable ensambla objetivos con actividades y ejes', async () => {
    createClient.mockResolvedValue(
      makeSupabase({
        v_proyectos_con_avance: [{ id: 'p1', nombre: 'P', componente_id: 'c1' }],
        objetivos: [{ id: 'o1', proyecto_id: 'p1', plazo: 'corto', tipo: 'hu', estado: 'cumplido', peso: 1, orden: 0 }],
        actividades: [{ id: 'a1', objetivo_id: 'o1', orden: 0 }],
        proyecto_recursos: [],
        proyecto_ejes: [{ ejes_transversales: { id: 'e1', nombre: 'IA', color_hex: '#000', orden: 0 } }],
      })
    )
    const { getProyectoEditable } = await import('./admin-queries')
    const p = await getProyectoEditable('p1')
    expect(p?.objetivos[0]?.id).toBe('o1')
    expect(p?.objetivos[0]?.actividades[0]?.id).toBe('a1')
    expect(p?.ejes[0]?.nombre).toBe('IA')
  })
})
