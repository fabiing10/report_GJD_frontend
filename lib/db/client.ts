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

export interface DataClient {
  // Lectura pública
  getInformeActivo(): Promise<InformeConRelaciones | null>
  getComponente(slug: string): Promise<ComponenteConProyectos | null>
  getProyecto(componenteSlug: string, proyectoSlug: string): Promise<ProyectoDetalle | null>
  getAllInformes(): Promise<Informe[]>
  getAllComponentes(informeId: string): Promise<Componente[]>
  getAllProyectos(componenteId: string): Promise<Proyecto[]>

  // Escritura admin — proyectos
  createProyecto(data: ProyectoInput): Promise<Proyecto>
  updateProyecto(id: string, data: Partial<ProyectoInput>): Promise<Proyecto>
  deleteProyecto(id: string): Promise<void>
  upsertLogros(proyectoId: string, items: LogroInput[]): Promise<void>
  upsertProximosPasos(proyectoId: string, items: PasoInput[]): Promise<void>
  upsertRecursos(
    proyectoId: string,
    recursos: Array<{ tipo: string; titulo: string | null; url: string; thumbnail_url?: string | null; orden: number }>
  ): Promise<void>

  // Escritura admin — componentes
  createComponente(data: ComponenteInput): Promise<Componente>
  updateComponente(id: string, data: Partial<ComponenteInput>): Promise<Componente>
  deleteComponente(id: string): Promise<void>
  reorderComponentes(informeId: string, ids: string[]): Promise<void>

  // Escritura admin — informes
  createInforme(data: InformeInput): Promise<Informe>
  updateInforme(id: string, data: Partial<InformeInput>): Promise<Informe>
  deleteInforme(id: string): Promise<void>
  setInformeActivo(id: string): Promise<void>
  duplicarInforme(id: string): Promise<Informe>
}
