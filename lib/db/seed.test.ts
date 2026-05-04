// lib/db/seed.test.ts
import { describe, it, expect, afterEach } from 'vitest'
import { unlinkSync, existsSync } from 'fs'
import Database from 'better-sqlite3'
import { runSeed } from './seed'

const TEST_DB = './seed-test.db'

afterEach(() => {
  if (existsSync(TEST_DB)) unlinkSync(TEST_DB)
})

describe('runSeed', () => {
  it('crea un informe activo desde data.json', () => {
    runSeed(TEST_DB)
    const db = new Database(TEST_DB)
    const row = db
      .prepare('SELECT COUNT(*) as count FROM informes WHERE is_active = 1')
      .get() as { count: number }
    expect(row.count).toBe(1)
    db.close()
  })

  it('inserta los 6 componentes', () => {
    runSeed(TEST_DB)
    const db = new Database(TEST_DB)
    const row = db
      .prepare('SELECT COUNT(*) as count FROM componentes')
      .get() as { count: number }
    expect(row.count).toBe(6)
    db.close()
  })

  it('inserta proyectos con avance numérico', () => {
    runSeed(TEST_DB)
    const db = new Database(TEST_DB)
    const proyectos = db
      .prepare('SELECT avance FROM proyectos')
      .all() as Array<{ avance: number }>
    expect(proyectos.length).toBeGreaterThan(0)
    expect(proyectos.every((p) => typeof p.avance === 'number')).toBe(true)
    db.close()
  })

  it('la vista v_informes_con_avance calcula el avance global', () => {
    runSeed(TEST_DB)
    const db = new Database(TEST_DB)
    const row = db
      .prepare('SELECT avance_global_calculado FROM v_informes_con_avance')
      .get() as { avance_global_calculado: number }
    expect(row.avance_global_calculado).toBeGreaterThan(0)
    expect(row.avance_global_calculado).toBeLessThanOrEqual(100)
    db.close()
  })
})
