// lib/db/client.ts
import type {
  InformeConRelaciones,
  ComponenteConProyectos,
  ProyectoDetalle,
} from '@/types/domain'

/**
 * DataClient interface — read-only API para fases 2-6.
 * Métodos de escritura (admin) se agregan en fase 7.
 */
export interface DataClient {
  getInformeActivo(): Promise<InformeConRelaciones | null>
  getComponente(slug: string): Promise<ComponenteConProyectos | null>
  getProyecto(
    componenteSlug: string,
    proyectoSlug: string
  ): Promise<ProyectoDetalle | null>
}
