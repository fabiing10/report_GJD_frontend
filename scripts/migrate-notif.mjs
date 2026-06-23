// Reestructura el componente "Gestión de Notificaciones":
//   5 HU-proyectos  →  1 proyecto "Sistema Gestor de Notificaciones"
//   cada HU         →  1 objetivo (tipo hu)
//   los 7 criterios de cada HU  →  actividades anidadas de esa HU-objetivo
//
// Estado HU-objetivo: completado→cumplido, si no→en_progreso (pendiente si 0%).
// Plazo HU-objetivo:  plazo dominante de sus criterios.
// Avance: dinámico (sin override).
//
// Backup JSON antes de tocar nada. Dry-run por defecto; escribe solo con APPLY=1.
import { writeFileSync } from 'node:fs'
import pg from 'pg'

const APPLY = process.env.APPLY === '1'
const COMP_SLUG = 'automatizacion' // componente "Gestión de Notificaciones"
const NUEVO = {
  slug: 'sistema-gestor-notificaciones',
  nombre: 'Sistema Gestor de Notificaciones',
  descripcion_corta:
    'Plataforma de automatización documental: notificaciones, clasificación, ETL, asignación y conciliaciones.',
}

const ESTADO_ACT = { cumplido: 'completada', en_progreso: 'en_progreso', pendiente: 'pendiente' }

function estadoHU(p) {
  if (p.estado === 'completado' || Number(p.avance_override) === 100) return 'cumplido'
  if (p.estado === 'no_iniciado' && !p.avance_override) return 'pendiente'
  return 'en_progreso'
}
function plazoDominante(criterios) {
  const cuenta = {}
  for (const c of criterios) cuenta[c.plazo] = (cuenta[c.plazo] ?? 0) + 1
  return Object.entries(cuenta).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'corto'
}
function numHU(codigo) {
  const m = /(\d+)/.exec(codigo ?? '')
  return m ? Number(m[1]) : 999
}

const c = new pg.Client({
  host: process.env.PGHOST, port: 5432, database: 'postgres',
  user: process.env.PGUSER, password: process.env.PGPASSWORD, ssl: { rejectUnauthorized: false },
})
await c.connect()

const { rows: comps } = await c.query('select id, nombre from componentes where slug=$1', [COMP_SLUG])
const comp = comps[0]
if (!comp) { console.error('No existe el componente'); process.exit(1) }

const { rows: proys } = await c.query(
  'select * from proyectos where componente_id=$1 order by orden', [comp.id]
)
const conObjetivos = []
for (const p of proys) {
  const { rows: objs } = await c.query('select * from objetivos where proyecto_id=$1 order by orden', [p.id])
  conObjetivos.push({ ...p, criterios: objs })
}

// Backup
const backup = { componente: comp, proyectos: conObjetivos, ts: process.env.TS ?? 'manual' }
const backupPath = `scripts/backup-notif.json`
writeFileSync(backupPath, JSON.stringify(backup, null, 2))
console.log(`Backup escrito en ${backupPath} (${conObjetivos.length} proyectos, ${conObjetivos.reduce((s, p) => s + p.criterios.length, 0)} criterios)\n`)

// Plan
const ordenadas = [...conObjetivos].sort((a, b) => numHU(a.codigo) - numHU(b.codigo))
console.log(`=== PLAN (${APPLY ? 'APLICAR' : 'DRY-RUN'}) ===`)
console.log(`Nuevo proyecto: "${NUEVO.nombre}" (slug=${NUEVO.slug}) en componente "${comp.nombre}"`)
ordenadas.forEach((p, i) => {
  console.log(`  objetivo[${i}] ${p.nombre}  estado=${estadoHU(p)}  plazo=${plazoDominante(p.criterios)}  actividades=${p.criterios.length}`)
})
console.log(`Eliminará ${proys.length} proyectos viejos y sus ${conObjetivos.reduce((s, p) => s + p.criterios.length, 0)} objetivos.\n`)

if (!APPLY) {
  console.log('DRY-RUN: no se escribió ningún cambio. Re-ejecuta con APPLY=1 para aplicar.')
  await c.end()
  process.exit(0)
}

try {
  await c.query('begin')
  const { rows: [np] } = await c.query(
    `insert into proyectos (componente_id, slug, codigo, nombre, descripcion_corta, descripcion_larga,
       estado, avance_override, responsable, fecha_inicio, fecha_fin, orden)
     values ($1,$2,null,$3,$4,null,'en_progreso',null,null,null,null,0) returning id`,
    [comp.id, NUEVO.slug, NUEVO.nombre, NUEVO.descripcion_corta]
  )
  const nuevoProyId = np.id

  for (let i = 0; i < ordenadas.length; i++) {
    const p = ordenadas[i]
    const { rows: [no] } = await c.query(
      `insert into objetivos (proyecto_id, titulo, descripcion, tipo, plazo, estado, peso, fecha_limite, orden)
       values ($1,$2,$3,'hu',$4,$5,1,null,$6) returning id`,
      [nuevoProyId, p.nombre, p.descripcion_corta ?? p.descripcion_larga ?? null, plazoDominante(p.criterios), estadoHU(p), i]
    )
    const objId = no.id
    for (let j = 0; j < p.criterios.length; j++) {
      const cr = p.criterios[j]
      await c.query(
        `insert into actividades (objetivo_id, tipo, titulo, descripcion, fecha, estado, responsable, orden)
         values ($1,'tarea',$2,$3,$4,$5,null,$6)`,
        [objId, cr.titulo, cr.descripcion ?? null, cr.fecha_limite ?? null, ESTADO_ACT[cr.estado] ?? 'pendiente', j]
      )
    }
  }

  // Eliminar proyectos viejos (primero objetivos, luego proyectos)
  const oldIds = proys.map((p) => p.id)
  await c.query('delete from objetivos where proyecto_id = any($1)', [oldIds])
  await c.query('delete from proyectos where id = any($1)', [oldIds])

  await c.query('commit')
  await c.query("notify pgrst, 'reload schema'")
  console.log('OK: reestructuración aplicada.')
} catch (e) {
  await c.query('rollback')
  console.error('ERROR (rollback):', e.message)
  process.exit(2)
} finally {
  await c.end()
}
