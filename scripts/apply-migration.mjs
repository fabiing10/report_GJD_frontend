// Aplica una migración SQL vía conexión directa al pooler de Supabase.
// Uso: PGHOST=... PGUSER=... PGPASSWORD=... node scripts/apply-migration.mjs <archivo.sql>
import { readFileSync } from 'node:fs'
import pg from 'pg'

const file = process.argv[2]
if (!file) {
  console.error('Falta el archivo .sql')
  process.exit(1)
}
const sql = readFileSync(file, 'utf8')

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? 'postgres',
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(sql)
  console.log('OK: migración aplicada')
} catch (e) {
  console.error('ERROR:', e.message)
  process.exit(2)
} finally {
  await client.end()
}
