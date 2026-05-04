import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { DataClient } from './client'
import type {
  InformeConRelaciones,
  ComponenteConProyectos,
  ProyectoDetalle,
  ProyectoInput,
  ComponenteInput,
  InformeInput,
  Informe,
  Componente,
  Proyecto,
  ComponenteConAvance,
  ProyectoLogro,
  ProyectoProximoPaso,
  ProyectoRecurso,
  LogroInput,
  PasoInput,
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

function normalizeBool<T>(row: T, ...keys: (keyof T)[]): T {
  const result = { ...row } as T
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
      informeRow as unknown as Omit<InformeConRelaciones, 'componentes'>,
      'is_active'
    )

    const componenteRows = this.db
      .prepare('SELECT * FROM v_componentes_con_avance WHERE informe_id = ? ORDER BY orden')
      .all(informe.id) as ComponenteConAvance[]

    const componentes: ComponenteConProyectos[] = componenteRows.map((c) => {
      const proyectoRows = this.db
        .prepare('SELECT * FROM proyectos WHERE componente_id = ? ORDER BY orden')
        .all(c.id) as Proyecto[]

      const proyectos: ProyectoDetalle[] = proyectoRows.map((p) => ({
        ...p,
        logros: this.db
          .prepare('SELECT * FROM proyecto_logros WHERE proyecto_id = ? ORDER BY plazo, orden')
          .all(p.id) as ProyectoLogro[],
        proximos_pasos: this.db
          .prepare('SELECT * FROM proyecto_proximos_pasos WHERE proyecto_id = ? ORDER BY plazo, orden')
          .all(p.id) as ProyectoProximoPaso[],
        recursos: this.db
          .prepare('SELECT * FROM proyecto_recursos WHERE proyecto_id = ? ORDER BY orden')
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

  async getProyecto(componenteSlug: string, proyectoSlug: string): Promise<ProyectoDetalle | null> {
    const componente = await this.getComponente(componenteSlug)
    if (!componente) return null
    return componente.proyectos.find((p) => p.slug === proyectoSlug) ?? null
  }

  async getAllInformes(): Promise<Informe[]> {
    const rows = this.db
      .prepare('SELECT * FROM informes ORDER BY created_at DESC')
      .all() as Array<Record<string, unknown>>
    return rows.map((r) => normalizeBool(r as unknown as Informe, 'is_active'))
  }

  async getAllComponentes(informeId: string): Promise<Componente[]> {
    return this.db
      .prepare('SELECT * FROM componentes WHERE informe_id = ? ORDER BY orden')
      .all(informeId) as Componente[]
  }

  async getAllProyectos(componenteId: string): Promise<Proyecto[]> {
    return this.db
      .prepare('SELECT * FROM proyectos WHERE componente_id = ? ORDER BY orden')
      .all(componenteId) as Proyecto[]
  }

  async createProyecto(data: ProyectoInput): Promise<Proyecto> {
    const id = randomUUID()
    this.db.prepare(`
      INSERT INTO proyectos
        (id, componente_id, slug, codigo, nombre, descripcion_corta, descripcion_larga,
         plazo, estado, avance, avance_corto, avance_mediano, avance_largo,
         responsable, fecha_entrega, fecha_entrega_texto, orden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.componente_id, data.slug, data.codigo ?? null, data.nombre,
      data.descripcion_corta ?? null, data.descripcion_larga ?? null,
      data.plazo, data.estado, data.avance,
      data.avance_corto ?? null, data.avance_mediano ?? null, data.avance_largo ?? null,
      data.responsable ?? null, data.fecha_entrega ?? null, data.fecha_entrega_texto ?? null,
      data.orden
    )
    return this.db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id) as Proyecto
  }

  async updateProyecto(id: string, data: Partial<ProyectoInput>): Promise<Proyecto> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined)
    if (entries.length === 0) {
      return this.db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id) as Proyecto
    }
    const fields = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = [...entries.map(([, v]) => v), id]
    this.db.prepare(`UPDATE proyectos SET ${fields} WHERE id = ?`).run(...values)
    return this.db.prepare('SELECT * FROM proyectos WHERE id = ?').get(id) as Proyecto
  }

  async deleteProyecto(id: string): Promise<void> {
    this.db.prepare('DELETE FROM proyectos WHERE id = ?').run(id)
  }

  async upsertLogros(proyectoId: string, items: LogroInput[]): Promise<void> {
    this.db.prepare('DELETE FROM proyecto_logros WHERE proyecto_id = ?').run(proyectoId)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item?.texto?.trim()) {
        this.db
          .prepare('INSERT INTO proyecto_logros (id, proyecto_id, texto, plazo, orden) VALUES (?, ?, ?, ?, ?)')
          .run(randomUUID(), proyectoId, item.texto.trim(), item.plazo, i)
      }
    }
  }

  async upsertProximosPasos(proyectoId: string, items: PasoInput[]): Promise<void> {
    this.db.prepare('DELETE FROM proyecto_proximos_pasos WHERE proyecto_id = ?').run(proyectoId)
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item?.texto?.trim()) {
        this.db
          .prepare('INSERT INTO proyecto_proximos_pasos (id, proyecto_id, texto, plazo, orden) VALUES (?, ?, ?, ?, ?)')
          .run(randomUUID(), proyectoId, item.texto.trim(), item.plazo, i)
      }
    }
  }

  async upsertRecursos(
    proyectoId: string,
    recursos: Array<{ tipo: string; titulo: string | null; url: string; thumbnail_url?: string | null; orden: number }>
  ): Promise<void> {
    this.db.prepare('DELETE FROM proyecto_recursos WHERE proyecto_id = ?').run(proyectoId)
    for (const r of recursos) {
      this.db
        .prepare('INSERT INTO proyecto_recursos (id, proyecto_id, tipo, titulo, url, thumbnail_url, orden) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(randomUUID(), proyectoId, r.tipo, r.titulo ?? null, r.url, r.thumbnail_url ?? null, r.orden)
    }
  }

  async createComponente(data: ComponenteInput): Promise<Componente> {
    const id = randomUUID()
    this.db.prepare(`
      INSERT INTO componentes
        (id, informe_id, slug, nombre, descripcion, icono, color_hex, color_token, orden, avance_override)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.informe_id, data.slug, data.nombre, data.descripcion ?? null,
      data.icono, data.color_hex, data.color_token, data.orden, data.avance_override ?? null
    )
    return this.db.prepare('SELECT * FROM componentes WHERE id = ?').get(id) as Componente
  }

  async updateComponente(id: string, data: Partial<ComponenteInput>): Promise<Componente> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined)
    if (entries.length === 0) {
      return this.db.prepare('SELECT * FROM componentes WHERE id = ?').get(id) as Componente
    }
    const fields = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = [...entries.map(([, v]) => v), id]
    this.db.prepare(`UPDATE componentes SET ${fields} WHERE id = ?`).run(...values)
    return this.db.prepare('SELECT * FROM componentes WHERE id = ?').get(id) as Componente
  }

  async deleteComponente(id: string): Promise<void> {
    this.db.prepare('DELETE FROM componentes WHERE id = ?').run(id)
  }

  async reorderComponentes(informeId: string, ids: string[]): Promise<void> {
    const update = this.db.prepare('UPDATE componentes SET orden = ? WHERE id = ? AND informe_id = ?')
    this.db.transaction(() => {
      ids.forEach((id, i) => update.run(i, id, informeId))
    })()
  }

  async createInforme(data: InformeInput): Promise<Informe> {
    const id = randomUUID()
    this.db.prepare(`
      INSERT INTO informes (id, titulo, subtitulo, fecha_corte, avance_global_override, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id, data.titulo, data.subtitulo ?? null, data.fecha_corte,
      data.avance_global_override ?? null, data.is_active ? 1 : 0
    )
    const row = this.db.prepare('SELECT * FROM informes WHERE id = ?').get(id) as Record<string, unknown>
    return normalizeBool(row as unknown as Informe, 'is_active')
  }

  async updateInforme(id: string, data: Partial<InformeInput>): Promise<Informe> {
    const { is_active, ...rest } = data
    const toUpdate: Record<string, unknown> = { ...rest }
    if (is_active !== undefined) toUpdate['is_active'] = is_active ? 1 : 0

    const entries = Object.entries(toUpdate).filter(([, v]) => v !== undefined)
    if (entries.length > 0) {
      const fields = entries.map(([k]) => `${k} = ?`).join(', ')
      const values = [...entries.map(([, v]) => v), id]
      this.db.prepare(`UPDATE informes SET ${fields} WHERE id = ?`).run(...values)
    }

    const row = this.db.prepare('SELECT * FROM informes WHERE id = ?').get(id) as Record<string, unknown>
    return normalizeBool(row as unknown as Informe, 'is_active')
  }

  async deleteInforme(id: string): Promise<void> {
    this.db.prepare('DELETE FROM informes WHERE id = ?').run(id)
  }

  async setInformeActivo(id: string): Promise<void> {
    this.db.transaction(() => {
      this.db.prepare('UPDATE informes SET is_active = 0').run()
      this.db.prepare('UPDATE informes SET is_active = 1 WHERE id = ?').run(id)
    })()
  }

  async duplicarInforme(id: string): Promise<Informe> {
    const row = this.db.prepare('SELECT * FROM informes WHERE id = ?').get(id) as Record<string, unknown>
    const informe = normalizeBool(row as unknown as Informe, 'is_active')
    const newId = randomUUID()
    this.db.prepare(`
      INSERT INTO informes (id, titulo, subtitulo, fecha_corte, avance_global_override, is_active)
      VALUES (?, ?, ?, ?, ?, 0)
    `).run(newId, `${informe.titulo} (copia)`, informe.subtitulo, informe.fecha_corte, informe.avance_global_override)

    const componentes = this.db
      .prepare('SELECT * FROM componentes WHERE informe_id = ? ORDER BY orden')
      .all(id) as Componente[]

    for (const c of componentes) {
      const newCid = randomUUID()
      this.db.prepare(`
        INSERT INTO componentes
          (id, informe_id, slug, nombre, descripcion, icono, color_hex, color_token, orden, avance_override)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newCid, newId, c.slug, c.nombre, c.descripcion, c.icono, c.color_hex, c.color_token, c.orden, c.avance_override)

      const proyectos = this.db
        .prepare('SELECT * FROM proyectos WHERE componente_id = ? ORDER BY orden')
        .all(c.id) as Proyecto[]

      for (const p of proyectos) {
        const newPid = randomUUID()
        this.db.prepare(`
          INSERT INTO proyectos
            (id, componente_id, slug, codigo, nombre, descripcion_corta, descripcion_larga,
             plazo, estado, avance, avance_corto, avance_mediano, avance_largo,
             responsable, fecha_entrega, fecha_entrega_texto, orden)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          newPid, newCid, p.slug, p.codigo, p.nombre, p.descripcion_corta, p.descripcion_larga,
          p.plazo, p.estado, p.avance, p.avance_corto, p.avance_mediano, p.avance_largo,
          p.responsable, p.fecha_entrega, p.fecha_entrega_texto, p.orden
        )

        const logros = this.db
          .prepare('SELECT * FROM proyecto_logros WHERE proyecto_id = ? ORDER BY orden')
          .all(p.id) as ProyectoLogro[]
        for (const l of logros) {
          this.db.prepare('INSERT INTO proyecto_logros (id, proyecto_id, texto, plazo, orden) VALUES (?, ?, ?, ?, ?)')
            .run(randomUUID(), newPid, l.texto, l.plazo, l.orden)
        }

        const pasos = this.db
          .prepare('SELECT * FROM proyecto_proximos_pasos WHERE proyecto_id = ? ORDER BY orden')
          .all(p.id) as ProyectoProximoPaso[]
        for (const ps of pasos) {
          this.db.prepare('INSERT INTO proyecto_proximos_pasos (id, proyecto_id, texto, plazo, orden) VALUES (?, ?, ?, ?, ?)')
            .run(randomUUID(), newPid, ps.texto, ps.plazo, ps.orden)
        }

        const recursos = this.db
          .prepare('SELECT * FROM proyecto_recursos WHERE proyecto_id = ? ORDER BY orden')
          .all(p.id) as ProyectoRecurso[]
        for (const r of recursos) {
          this.db.prepare('INSERT INTO proyecto_recursos (id, proyecto_id, tipo, titulo, url, thumbnail_url, duracion_segundos, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
            .run(randomUUID(), newPid, r.tipo, r.titulo, r.url, r.thumbnail_url, r.duracion_segundos, r.orden)
        }
      }
    }

    const newRow = this.db.prepare('SELECT * FROM informes WHERE id = ?').get(newId) as Record<string, unknown>
    return normalizeBool(newRow as unknown as Informe, 'is_active')
  }
}

export function _resetSqliteCacheForTests() {
  if (_db) {
    _db.close()
    _db = null
  }
}

export type { Informe }
