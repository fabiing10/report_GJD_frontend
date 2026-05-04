// lib/db/supabase.ts
// TODO: Implementar cuando se migre a Supabase.
// La interface es idéntica a SQLiteDataClient — solo cambia el driver subyacente.

import type { DataClient } from './client'

export class SupabaseDataClient implements DataClient {
  constructor() {
    throw new Error(
      'SupabaseDataClient: configura DATABASE_DRIVER=supabase y las env vars NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY antes de usar este driver.'
    )
  }

  async getInformeActivo() {
    throw new Error('Not implemented')
    return null
  }

  async getComponente(_slug: string) {
    throw new Error('Not implemented')
    return null
  }

  async getProyecto(_componenteSlug: string, _proyectoSlug: string) {
    throw new Error('Not implemented')
    return null
  }
}
