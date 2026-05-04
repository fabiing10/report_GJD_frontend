// types/domain.ts

export type PlazoEnum = 'corto' | 'mediano' | 'largo'
export type EstadoEnum =
  | 'completado'
  | 'en_progreso'
  | 'no_iniciado'
  | 'refinamiento'
  | 'bloqueado'
export type RecursoTipoEnum = 'video_url' | 'imagen' | 'link'

export interface Informe {
  id: string
  titulo: string
  subtitulo: string | null
  fecha_corte: string
  avance_global_override: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Componente {
  id: string
  informe_id: string
  slug: string
  nombre: string
  descripcion: string | null
  icono: string
  color_hex: string
  color_token: string
  orden: number
  avance_override: number | null
  created_at: string
  updated_at: string
}

export interface Proyecto {
  id: string
  componente_id: string
  slug: string
  codigo: string | null
  nombre: string
  descripcion_corta: string | null
  descripcion_larga: string | null
  plazo: PlazoEnum
  estado: EstadoEnum
  avance: number
  responsable: string | null
  fecha_entrega: string | null
  fecha_entrega_texto: string | null
  orden: number
  created_at: string
  updated_at: string
}

export interface ProyectoLogro {
  id: string
  proyecto_id: string
  texto: string
  orden: number
}

export interface ProyectoProximoPaso {
  id: string
  proyecto_id: string
  texto: string
  orden: number
}

export interface ProyectoRecurso {
  id: string
  proyecto_id: string
  tipo: RecursoTipoEnum
  titulo: string | null
  url: string
  thumbnail_url: string | null
  duracion_segundos: number | null
  orden: number
}

// View types (calculados desde las vistas del DB)
export interface ComponenteConAvance extends Componente {
  avance_calculado: number
  total_actividades: number
  actividades_completadas: number
}

export interface InformeConAvance extends Informe {
  avance_global_calculado: number
}

// Tipos compuestos para páginas
export interface ProyectoDetalle extends Proyecto {
  logros: ProyectoLogro[]
  proximos_pasos: ProyectoProximoPaso[]
  recursos: ProyectoRecurso[]
}

export interface ComponenteConProyectos extends ComponenteConAvance {
  proyectos: ProyectoDetalle[]
}

export interface InformeConRelaciones extends InformeConAvance {
  componentes: ComponenteConProyectos[]
}

// Tipo para mutations del admin (futuro)
export type ProyectoInput = Omit<Proyecto, 'id' | 'created_at' | 'updated_at'>
export type ComponenteInput = Omit<
  Componente,
  'id' | 'created_at' | 'updated_at'
>
export type InformeInput = Omit<Informe, 'id' | 'created_at' | 'updated_at'>
