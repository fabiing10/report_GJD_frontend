// lib/db/seed.ts
// Convierte data.json al schema relacional SQLite.
import { randomUUID } from 'crypto'
import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { join } from 'path'
import { slugify } from '../utils'

interface DataJsonActivity {
  id: string
  name: string
  progress: number
  status: string
  phase: string
  description: string
  achievements?: string[]
  nextSteps?: string[]
  video?: string
}

interface DataJsonCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  activities: DataJsonActivity[]
}

interface DataJson {
  project: {
    name: string
    subtitle: string
    lastUpdated: string
    overallProgress: number
  }
  categories: DataJsonCategory[]
}

const ESTADO_MAP: Record<string, string> = {
  completado: 'completado',
  en_progreso: 'en_progreso',
  pendiente: 'no_iniciado',
  no_iniciado: 'no_iniciado',
  bloqueado: 'bloqueado',
  refinamiento: 'refinamiento',
}

const PLAZO_MAP: Record<string, string> = {
  'Corto plazo': 'corto',
  'Mediano plazo': 'mediano',
  'Largo plazo': 'largo',
  'Por definir': 'corto',
}

// Slugs canónicos de componentes (del spec §5)
const COMPONENTE_SLUG_MAP: Record<string, string> = {
  automatizacion: 'gestion-notificaciones',
  visor360: 'automatizacion-desarrollo',
  interoperabilidad: 'interoperabilidad',
  analitica: 'analitica-datos',
  'gestion-documental': 'gestion-documental',
  'inteligencia-artificial': 'inteligencia-artificial',
}

const COLOR_TOKEN_MAP: Record<string, string> = {
  '#3b82f6': 'blue',
  '#7c3aed': 'purple',
  '#8b5cf6': 'violet',
  '#06b6d4': 'cyan',
  '#64748b': 'slate',
  '#ec4899': 'rose',
}

function deriveProyectoSlug(act: DataJsonActivity): string {
  if (/^[a-z0-9-]+$/.test(act.id)) return act.id
  return slugify(act.name)
}

function deriveCodigo(actId: string, actName: string): string | null {
  const matchName = actName.match(/HU-?\d+/i)
  const matchId = actId.match(/hu-?\d+/i)
  const match = matchName ?? matchId
  return match ? match[0].toUpperCase() : null
}

export function runSeed(dbPath = './local.db') {
  const schema = readFileSync(
    join(process.cwd(), 'lib/db/sqlite-schema.sql'),
    'utf-8'
  )
  const rawData = JSON.parse(
    readFileSync(join(process.cwd(), 'data.json'), 'utf-8')
  ) as DataJson

  const db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.exec(schema)

  // Limpiar datos existentes
  db.exec(`
    DELETE FROM proyecto_recursos;
    DELETE FROM proyecto_proximos_pasos;
    DELETE FROM proyecto_logros;
    DELETE FROM proyectos;
    DELETE FROM componentes;
    DELETE FROM informes;
  `)

  const informeId = randomUUID()
  db.prepare(
    `INSERT INTO informes (id, titulo, subtitulo, fecha_corte, is_active)
     VALUES (?, ?, ?, ?, 1)`
  ).run(
    informeId,
    rawData.project.name,
    rawData.project.subtitle,
    rawData.project.lastUpdated
  )

  rawData.categories.forEach((cat, catIndex) => {
    const componenteId = randomUUID()
    const slug = COMPONENTE_SLUG_MAP[cat.id] ?? slugify(cat.name)
    const colorToken = COLOR_TOKEN_MAP[cat.color.toLowerCase()] ?? 'blue'

    db.prepare(
      `INSERT INTO componentes
        (id, informe_id, slug, nombre, descripcion, icono, color_hex, color_token, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      componenteId,
      informeId,
      slug,
      cat.name,
      cat.description,
      cat.icon,
      cat.color,
      colorToken,
      catIndex
    )

    cat.activities.forEach((act, actIndex) => {
      const proyectoId = randomUUID()
      const proyectoSlug = deriveProyectoSlug(act)
      const codigo = deriveCodigo(act.id, act.name)
      const estado = ESTADO_MAP[act.status] ?? 'no_iniciado'
      const plazo = PLAZO_MAP[act.phase] ?? 'corto'

      db.prepare(
        `INSERT INTO proyectos
          (id, componente_id, slug, codigo, nombre, descripcion_corta, descripcion_larga,
           plazo, estado, avance, orden)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        proyectoId,
        componenteId,
        proyectoSlug,
        codigo,
        act.name,
        act.description?.substring(0, 200) ?? null,
        act.description ?? null,
        plazo,
        estado,
        act.progress,
        actIndex
      )

      act.achievements?.forEach((texto, i) => {
        db.prepare(
          'INSERT INTO proyecto_logros (id, proyecto_id, texto, orden) VALUES (?, ?, ?, ?)'
        ).run(randomUUID(), proyectoId, texto, i)
      })

      act.nextSteps?.forEach((texto, i) => {
        db.prepare(
          'INSERT INTO proyecto_proximos_pasos (id, proyecto_id, texto, orden) VALUES (?, ?, ?, ?)'
        ).run(randomUUID(), proyectoId, texto, i)
      })

      if (act.video) {
        db.prepare(
          'INSERT INTO proyecto_recursos (id, proyecto_id, tipo, titulo, url, orden) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(randomUUID(), proyectoId, 'video_url', act.name, act.video, 0)
      }
    })
  })

  console.log(`✅ Seed completo. Informe ID: ${informeId}`)
  db.close()
}

const argvEntry = process.argv[1] ?? ''
if (argvEntry.endsWith('seed.ts') || argvEntry.endsWith('seed.js')) {
  runSeed()
}
