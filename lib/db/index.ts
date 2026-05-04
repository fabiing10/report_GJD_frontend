// lib/db/index.ts
import type { DataClient } from './client'

let _client: DataClient | null = null

/**
 * Devuelve el DataClient configurado por la env DATABASE_DRIVER.
 * SOLO debe llamarse en Server Components o Server Actions.
 */
export function getDataClient(): DataClient {
  if (_client) return _client

  const driver = process.env['DATABASE_DRIVER'] ?? 'sqlite'

  if (driver === 'sqlite') {
    // require() para evitar que webpack empaquete better-sqlite3 en el client bundle
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SQLiteDataClient } = require('./sqlite') as {
      SQLiteDataClient: new () => DataClient
    }
    _client = new SQLiteDataClient()
  } else if (driver === 'supabase') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseDataClient } = require('./supabase') as {
      SupabaseDataClient: new () => DataClient
    }
    _client = new SupabaseDataClient()
  } else {
    throw new Error(
      `DATABASE_DRIVER inválido: "${driver}". Usa "sqlite" o "supabase".`
    )
  }

  return _client
}
