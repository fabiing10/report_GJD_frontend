// types/domain.ts

export type RoleEnum = 'admin' | 'usuario'
export type PlazoEnum = 'corto' | 'mediano' | 'largo'
export type EstadoEnum =
  | 'completado'
  | 'en_progreso'
  | 'no_iniciado'
  | 'refinamiento'
  | 'bloqueado'
export type CriterioEstadoEnum = 'pendiente' | 'en_progreso' | 'cumplido'
export type ActividadTipoEnum = 'reunion' | 'tarea' | 'investigacion' | 'informe'
export type ActividadEstadoEnum = 'pendiente' | 'en_progreso' | 'completada'
export type RecursoTipoEnum = 'video_url' | 'imagen' | 'link'

// ── Identidad ──────────────────────────────────────────────
export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: RoleEnum
  created_at: string
  updated_at: string
}

// ── Entidades base ─────────────────────────────────────────
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
  estado: EstadoEnum
  avance_override: number | null
  responsable: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  orden: number
  created_at: string
  updated_at: string
}

export interface ProyectoPlazo {
  id: string
  proyecto_id: string
  plazo: PlazoEnum
  fecha_inicio: string | null
  fecha_fin: string | null
  avance_override: number | null
  orden: number
}

export interface Criterio {
  id: string
  proyecto_plazo_id: string
  texto: string
  descripcion: string | null
  peso: number
  estado: CriterioEstadoEnum
  orden: number
  created_at: string
  updated_at: string
}

export interface Actividad {
  id: string
  proyecto_id: string
  proyecto_plazo_id: string | null
  tipo: ActividadTipoEnum
  titulo: string
  descripcion: string | null
  fecha: string | null
  estado: ActividadEstadoEnum
  responsable: string | null
  orden: number
  created_at: string
  updated_at: string
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

// ── Tipos de vistas (avance calculado) ─────────────────────
export interface PlazoConAvance extends ProyectoPlazo {
  avance_calculado: number
  total_criterios: number
  criterios_cumplidos: number
}

export interface ProyectoConAvance extends Proyecto {
  avance_calculado: number
  total_plazos: number
  total_criterios: number
  criterios_cumplidos: number
}

export interface ComponenteConAvance extends Componente {
  avance_calculado: number
  total_actividades: number
  actividades_completadas: number
}

export interface InformeConAvance extends Informe {
  avance_global_calculado: number
}

// ── Tipos compuestos para páginas ──────────────────────────
export interface PlazoDetalle extends PlazoConAvance {
  criterios: Criterio[]
}

export interface ProyectoDetalle extends ProyectoConAvance {
  plazos: PlazoDetalle[]
  recursos: ProyectoRecurso[]
  actividades: Actividad[]
}

export interface ComponenteConProyectos extends ComponenteConAvance {
  proyectos: ProyectoDetalle[]
}

export interface InformeConRelaciones extends InformeConAvance {
  componentes: ComponenteConProyectos[]
}

// ── Inputs para mutations del admin ────────────────────────
export type ProyectoInput = Omit<
  Proyecto,
  'id' | 'created_at' | 'updated_at'
>
export type ComponenteInput = Omit<
  Componente,
  'id' | 'created_at' | 'updated_at'
>
export type InformeInput = Omit<Informe, 'id' | 'created_at' | 'updated_at'>
