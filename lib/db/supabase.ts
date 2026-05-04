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
  LogroInput,
  PasoInput,
} from '@/types/domain'

function notImpl(): never {
  throw new Error('SupabaseDataClient: implementar con @supabase/ssr cuando DATABASE_DRIVER=supabase')
}

export class SupabaseDataClient implements DataClient {
  constructor() {
    throw new Error(
      'SupabaseDataClient: configura DATABASE_DRIVER=supabase y las env vars NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  getInformeActivo(): Promise<InformeConRelaciones | null> { return notImpl() }
  getComponente(_slug: string): Promise<ComponenteConProyectos | null> { return notImpl() }
  getProyecto(_c: string, _p: string): Promise<ProyectoDetalle | null> { return notImpl() }
  getAllInformes(): Promise<Informe[]> { return notImpl() }
  getAllComponentes(_id: string): Promise<Componente[]> { return notImpl() }
  getAllProyectos(_id: string): Promise<Proyecto[]> { return notImpl() }
  createProyecto(_d: ProyectoInput): Promise<Proyecto> { return notImpl() }
  updateProyecto(_id: string, _d: Partial<ProyectoInput>): Promise<Proyecto> { return notImpl() }
  deleteProyecto(_id: string): Promise<void> { return notImpl() }
  upsertLogros(_id: string, _items: LogroInput[]): Promise<void> { return notImpl() }
  upsertProximosPasos(_id: string, _items: PasoInput[]): Promise<void> { return notImpl() }
  upsertRecursos(_id: string, _r: Array<{ tipo: string; titulo: string | null; url: string; thumbnail_url?: string | null; orden: number }>): Promise<void> { return notImpl() }
  createComponente(_d: ComponenteInput): Promise<Componente> { return notImpl() }
  updateComponente(_id: string, _d: Partial<ComponenteInput>): Promise<Componente> { return notImpl() }
  deleteComponente(_id: string): Promise<void> { return notImpl() }
  reorderComponentes(_informeId: string, _ids: string[]): Promise<void> { return notImpl() }
  createInforme(_d: InformeInput): Promise<Informe> { return notImpl() }
  updateInforme(_id: string, _d: Partial<InformeInput>): Promise<Informe> { return notImpl() }
  deleteInforme(_id: string): Promise<void> { return notImpl() }
  setInformeActivo(_id: string): Promise<void> { return notImpl() }
  duplicarInforme(_id: string): Promise<Informe> { return notImpl() }
}
