// lib/db/sqlite.ts
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { DataClient } from './client'
import type {
  InformeConRelaciones,
  ComponenteConProyectos,
  ProyectoDetalle,
  Informe,
  Proyecto,
  ComponenteConAvance,
  ProyectoLogro,
  ProyectoProximoPaso,
  ProyectoRecurso,
} from '@/types/domain'

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  const dbPath = process.env['SQLITE_PATH'] ?? './local.db'
  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')

  const schema = readFileSync(
    join(process.cwd(), 'lib/db/sqlite-schema.sql'),
    'utf-8'
  )
  _db.exec(schema)

  return _db
}

// Normaliza booleanos SQLite (0/1 → boolean)
function normalizeBool<T extends Record<string, unknown>>(
  row: T,
  ...keys: (keyof T)[]
): T {
  const result = { ...row }
  for (const key of keys) {
    result[key] = Boolean(result[key]) as T[typeof key]
  }
  return result
}

export class SQLiteDataClient implements DataClient {
  private get db() {
    return getDb()
  }

  async getInformeActivo(): Promise<InformeConRelaciones | null> {
    const informeRow = this.db
      .prepare('SELECT * FROM v_informes_con_avance WHERE is_active = 1 LIMIT 1')
      .get() as Record<string, unknown> | undefined

    if (!informeRow) return null
    const informe = normalizeBool(
      informeRow as unknown as InformeConRelaciones,
      'is_active'
    )

    const componenteRows = this.db
      .prepare(
        'SELECT * FROM v_componentes_con_avance WHERE informe_id = ? ORDER BY orden'
      )
      .all(informe.id) as ComponenteConAvance[]

    const componentes: ComponenteConProyectos[] = componenteRows.map((c) => {
      const proyectoRows = this.db
        .prepare('SELECT * FROM proyectos WHERE componente_id = ? ORDER BY orden')
        .all(c.id) as Proyecto[]

      const proyectos: ProyectoDetalle[] = proyectoRows.map((p) => ({
        ...p,
        logros: this.db
          .prepare(
            'SELECT * FROM proyecto_logros WHERE proyecto_id = ? ORDER BY orden'
          )
          .all(p.id) as ProyectoLogro[],
        proximos_pasos: this.db
          .prepare(
            'SELECT * FROM proyecto_proximos_pasos WHERE proyecto_id = ? ORDER BY orden'
          )
          .all(p.id) as ProyectoProximoPaso[],
        recursos: this.db
          .prepare(
            'SELECT * FROM proyecto_recursos WHERE proyecto_id = ? ORDER BY orden'
          )
          .all(p.id) as ProyectoRecurso[],
      }))

      return { ...c, proyectos }
    })

    return { ...informe, componentes }
  }

  async getComponente(slug: string): Promise<ComponenteConProyectos | null> {
    const informe = await this.getInformeActivo()
    if (!informe) return null
    return informe.componentes.find((c) => c.slug === slug) ?? null
  }

  async getProyecto(
    componenteSlug: string,
    proyectoSlug: string
  ): Promise<ProyectoDetalle | null> {
    const componente = await this.getComponente(componenteSlug)
    if (!componente) return null
    return componente.proyectos.find((p) => p.slug === proyectoSlug) ?? null
  }
}

// Export para verificación local en tests sin tocar el cache de getDataClient
export function _resetSqliteCacheForTests() {
  if (_db) {
    _db.close()
    _db = null
  }
}

// Re-export tipo Informe para tests
export type { Informe }
