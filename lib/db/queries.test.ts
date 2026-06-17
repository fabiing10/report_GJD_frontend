import { describe, it, expect, vi, beforeEach } from 'vitest'

function makeSupabase(tables: Record<string, unknown[]>) {
  return {
    from(table: string) {
      const rows = tables[table] ?? []
      const builder: Record<string, unknown> = {}
      const chain = () => builder
      builder['select'] = chain
      builder['eq'] = chain
      builder['in'] = chain
      builder['maybeSingle'] = () => Promise.resolve({ data: rows[0] ?? null })
      builder['then'] = (resolve: (v: { data: unknown[] }) => unknown) =>
        resolve({ data: rows })
      return builder
    },
  }
}

const createClient = vi.fn()
vi.mock('@/lib/supabase/server', () => ({ createClient }))

describe('getInformeActivo', () => {
  beforeEach(() => createClient.mockReset())

  it('devuelve null si no hay informe activo', async () => {
    createClient.mockResolvedValue(makeSupabase({ v_informes_con_avance: [] }))
    const { getInformeActivo } = await import('./queries')
    expect(await getInformeActivo()).toBeNull()
  })

  it('ensambla el árbol con objetivos y actividades', async () => {
    createClient.mockResolvedValue(
      makeSupabase({
        v_informes_con_avance: [{ id: 'i1', titulo: 'T', is_active: true, avance_global_calculado: 30 }],
        v_componentes_con_avance: [{ id: 'c1', informe_id: 'i1', slug: 'comp', orden: 0, avance_calculado: 50 }],
        v_proyectos_con_avance: [{ id: 'p1', componente_id: 'c1', slug: 'proy', orden: 0, avance_calculado: 50 }],
        objetivos: [{ id: 'o1', proyecto_id: 'p1', plazo: 'corto', tipo: 'hu', estado: 'cumplido', peso: 1, orden: 0 }],
        actividades: [{ id: 'a1', objetivo_id: 'o1', tipo: 'reunion', orden: 0 }],
        proyecto_recursos: [],
      })
    )
    const { getInformeActivo } = await import('./queries')
    const informe = await getInformeActivo()
    const proyecto = informe?.componentes[0]?.proyectos[0]
    expect(proyecto?.objetivos[0]?.id).toBe('o1')
    expect(proyecto?.objetivos[0]?.actividades[0]?.id).toBe('a1')
  })
})
