import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ────────────────────────────────────────────────────
// vi.hoisted garantiza que estos spies existan cuando vitest eleva
// las llamadas vi.mock al inicio del archivo (evita el TDZ).
const { createClient, revalidatePath } = vi.hoisted(() => ({
  createClient: vi.fn(),
  revalidatePath: vi.fn(),
}))
vi.mock('@/lib/supabase/server', () => ({ createClient }))
vi.mock('next/cache', () => ({ revalidatePath }))

// Chainable supabase query-builder fake.
// Every builder method returns the builder itself (thenable), so that
// `await supabase.from(t).update(x).eq(a,b)` resolves to `result`.
type Result = { data?: unknown; error?: { message: string } | null }

function makeBuilder(result: Result) {
  const calls: Record<string, unknown[][]> = {}
  const record = (name: string, args: unknown[]) => {
    ;(calls[name] ??= []).push(args)
  }
  const builder: Record<string, unknown> = {}
  const chain =
    (name: string) =>
    (...args: unknown[]) => {
      record(name, args)
      return builder
    }
  // Terminal-ish methods that resolve.
  for (const m of ['insert', 'update', 'delete', 'select', 'eq', 'in', 'order']) {
    builder[m] = chain(m)
  }
  builder['single'] = (...args: unknown[]) => {
    record('single', args)
    return Promise.resolve(result)
  }
  builder['maybeSingle'] = builder['single']
  // Make the builder awaitable (PromiseLike) so `await builder` resolves to result.
  builder['then'] = (onFulfilled: (v: Result) => unknown) =>
    Promise.resolve(result).then(onFulfilled)
  ;(builder as { _calls: typeof calls })._calls = calls
  return builder as typeof builder & { _calls: Record<string, unknown[][]> }
}

// Per-test programmable supabase. Cada test configura
// `createClient` con un objeto cuyo `from(table)` devuelve un builder.
type FromFn = (table: string) => unknown
function setSupabase(from: FromFn) {
  createClient.mockResolvedValue({ from })
}

import {
  crearInforme,
  actualizarInforme,
  eliminarInforme,
  activarInforme,
  duplicarInforme,
} from './informes'

const validInput = {
  titulo: 'Informe 2026',
  subtitulo: 'Q2',
  fecha_corte: '2026-06-16',
  avance_global_override: null,
}

beforeEach(() => {
  revalidatePath.mockClear()
  createClient.mockReset()
})

describe('crearInforme', () => {
  it('valida y llama insert con los campos parseados', async () => {
    const builder = makeBuilder({ error: null })
    const from = vi.fn(() => builder)
    setSupabase(from)

    await crearInforme(validInput)

    expect(from).toHaveBeenCalledWith('informes')
    expect(builder._calls['insert']).toHaveLength(1)
    expect(builder._calls['insert']?.[0]?.[0]).toMatchObject({
      titulo: 'Informe 2026',
      subtitulo: 'Q2',
      fecha_corte: '2026-06-16',
      avance_global_override: null,
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/informes')
  })

  it('rechaza titulo vacío antes de tocar la base', async () => {
    const from = vi.fn(() => makeBuilder({ error: null }))
    setSupabase(from)
    await expect(
      crearInforme({ ...validInput, titulo: '' })
    ).rejects.toThrow()
    expect(from).not.toHaveBeenCalled()
  })

  it('lanza el mensaje de error de supabase', async () => {
    setSupabase(() => makeBuilder({ error: { message: 'db down' } }))
    await expect(crearInforme(validInput)).rejects.toThrow('db down')
  })
})

describe('actualizarInforme', () => {
  it('valida y actualiza por id', async () => {
    const builder = makeBuilder({ error: null })
    setSupabase(() => builder)

    await actualizarInforme('id-1', validInput)

    expect(builder._calls['update']).toHaveLength(1)
    expect(builder._calls['eq']?.[0]).toEqual(['id', 'id-1'])
    expect(revalidatePath).toHaveBeenCalledWith('/admin/informes')
  })
})

describe('eliminarInforme', () => {
  it('borra por id', async () => {
    const builder = makeBuilder({ error: null })
    setSupabase(() => builder)

    await eliminarInforme('id-2')

    expect(builder._calls['delete']).toHaveLength(1)
    expect(builder._calls['eq']?.[0]).toEqual(['id', 'id-2'])
  })
})

describe('activarInforme', () => {
  it('desactiva el activo actual y luego activa el id objetivo (dos updates en orden)', async () => {
    const builders: Array<ReturnType<typeof makeBuilder>> = []
    const from = vi.fn(() => {
      const b = makeBuilder({ error: null })
      builders.push(b)
      return b
    })
    setSupabase(from)

    await activarInforme('id-3')

    // dos llamadas a from('informes'), una por update
    expect(from).toHaveBeenCalledTimes(2)
    // primer update: is_active:false sobre is_active true
    expect(builders[0]?._calls['update']?.[0]?.[0]).toMatchObject({ is_active: false })
    expect(builders[0]?._calls['eq']?.[0]).toEqual(['is_active', true])
    // segundo update: is_active:true sobre id objetivo
    expect(builders[1]?._calls['update']?.[0]?.[0]).toMatchObject({ is_active: true })
    expect(builders[1]?._calls['eq']?.[0]).toEqual(['id', 'id-3'])
  })
})

describe('duplicarInforme', () => {
  it('crea un informe (copia) inactivo y re-inserta la jerarquía', async () => {
    // Programa respuestas por tabla/operación en orden de invocación.
    // El orden de from() en duplicar: informes(select origen),
    // componentes(select), proyectos(select), proyecto_plazos(select),
    // criterios(select), proyecto_recursos(select),
    // informes(insert copia), componentes(insert), proyectos(insert),
    // proyecto_plazos(insert), criterios(insert), proyecto_recursos(insert)
    const origen = {
      id: 'old-inf',
      titulo: 'Original',
      subtitulo: 's',
      fecha_corte: '2026-01-01',
      avance_global_override: null,
      is_active: true,
    }
    const comps = [{ id: 'c1', informe_id: 'old-inf', slug: 'a', nombre: 'C1', descripcion: null, icono: 'x', color_hex: '#000000', color_token: 't', orden: 0, avance_override: null }]
    const proys = [{ id: 'p1', componente_id: 'c1', slug: 'p', codigo: null, nombre: 'P1', descripcion_corta: null, descripcion_larga: null, estado: 'no_iniciado', avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null, orden: 0 }]
    const plazos = [{ id: 'pl1', proyecto_id: 'p1', plazo: 'corto', fecha_inicio: null, fecha_fin: null, avance_override: null, orden: 0 }]
    const crits = [{ id: 'cr1', proyecto_plazo_id: 'pl1', texto: 't', descripcion: null, peso: 1, estado: 'pendiente', orden: 0 }]
    const recs = [{ id: 'r1', proyecto_id: 'p1', tipo: 'link', titulo: null, url: 'u', thumbnail_url: null, duracion_segundos: null, orden: 0 }]

    const queue: Result[] = [
      { data: origen, error: null }, // select informe origen (single)
      { data: comps, error: null }, // select componentes
      { data: proys, error: null }, // select proyectos
      { data: plazos, error: null }, // select plazos
      { data: crits, error: null }, // select criterios
      { data: recs, error: null }, // select recursos
      { data: { id: 'new-inf' }, error: null }, // insert informe copia (single)
      { data: [{ id: 'new-c1' }], error: null }, // insert componentes (select)
      { data: [{ id: 'new-p1' }], error: null }, // insert proyectos (select)
      { data: [{ id: 'new-pl1' }], error: null }, // insert plazos (select)
      { data: null, error: null }, // insert criterios
      { data: null, error: null }, // insert recursos
    ]
    let i = 0
    const builders: Array<{ table: string; b: ReturnType<typeof makeBuilder> }> = []
    setSupabase((table: string) => {
      const b = makeBuilder(queue[i] ?? { data: null, error: null })
      i++
      builders.push({ table, b })
      return b
    })

    await duplicarInforme('old-inf')

    // El insert del informe copia debe marcar is_active:false y titulo con "(copia)"
    const infInsert = builders.find(
      (x) => x.table === 'informes' && x.b._calls['insert']
    )
    expect(infInsert).toBeTruthy()
    const payload = infInsert?.b._calls['insert']?.[0]?.[0] as Record<string, unknown>
    expect(payload['is_active']).toBe(false)
    expect(String(payload['titulo'])).toContain('(copia)')

    // Se insertó la jerarquía en las tablas hijas.
    const insertedTables = builders
      .filter((x) => x.b._calls['insert'])
      .map((x) => x.table)
    expect(insertedTables).toContain('componentes')
    expect(insertedTables).toContain('proyectos')
    expect(insertedTables).toContain('proyecto_plazos')
    expect(insertedTables).toContain('criterios')

    expect(revalidatePath).toHaveBeenCalledWith('/admin/informes')
  })
})
