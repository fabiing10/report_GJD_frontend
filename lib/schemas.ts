import { z } from 'zod'

const PLAZO = z.enum(['corto', 'mediano', 'largo'])
const ESTADO = z.enum([
  'completado',
  'en_progreso',
  'no_iniciado',
  'refinamiento',
  'bloqueado',
])
const CRITERIO_ESTADO = z.enum(['pendiente', 'en_progreso', 'cumplido'])
const ACTIVIDAD_TIPO = z.enum(['reunion', 'tarea', 'investigacion', 'informe'])
const ACTIVIDAD_ESTADO = z.enum(['pendiente', 'en_progreso', 'completada'])
const RECURSO_TIPO = z.enum(['video_url', 'imagen', 'link'])

export const informeSchema = z.object({
  titulo: z.string().min(1, 'Requerido').max(300),
  subtitulo: z.string().nullable(),
  fecha_corte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha YYYY-MM-DD'),
  avance_global_override: z.number().min(0).max(100).nullable(),
})

export const componenteSchema = z.object({
  informe_id: z.string().min(1),
  slug: z.string().min(1).max(100),
  nombre: z.string().min(1, 'Requerido').max(200),
  descripcion: z.string().nullable(),
  icono: z.string().min(1).max(10),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex'),
  color_token: z.string().min(1).max(50),
  avance_override: z.number().min(0).max(100).nullable(),
})

export const proyectoSchema = z.object({
  componente_id: z.string().min(1),
  slug: z.string().min(1).max(100),
  codigo: z.string().max(40).nullable(),
  nombre: z.string().min(1, 'Requerido').max(200),
  descripcion_corta: z.string().max(300).nullable(),
  descripcion_larga: z.string().nullable(),
  estado: ESTADO,
  responsable: z.string().max(200).nullable(),
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  avance_override: z.number().min(0).max(100).nullable(),
})

export const plazoSchema = z.object({
  proyecto_id: z.string().min(1),
  plazo: PLAZO,
  fecha_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  fecha_fin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  avance_override: z.number().min(0).max(100).nullable(),
})

export const criterioSchema = z.object({
  proyecto_plazo_id: z.string().min(1),
  texto: z.string().min(1, 'Requerido').max(500),
  descripcion: z.string().nullable(),
  peso: z.number().min(0).max(1000),
  estado: CRITERIO_ESTADO,
})

export const recursoSchema = z.object({
  proyecto_id: z.string().min(1),
  tipo: RECURSO_TIPO,
  titulo: z.string().max(200).nullable(),
  url: z.string().min(1).max(1000),
  thumbnail_url: z.string().max(1000).nullable(),
  duracion_segundos: z.number().int().min(0).nullable(),
})

export const actividadSchema = z.object({
  proyecto_id: z.string().min(1),
  proyecto_plazo_id: z.string().nullable(),
  tipo: ACTIVIDAD_TIPO,
  titulo: z.string().min(1, 'Requerido').max(300),
  descripcion: z.string().nullable(),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  estado: ACTIVIDAD_ESTADO,
  responsable: z.string().max(200).nullable(),
})

export const crearUsuarioSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  full_name: z.string().max(200).nullable(),
  role: z.enum(['admin', 'usuario']),
})

export const cambiarRolSchema = z.object({
  role: z.enum(['admin', 'usuario']),
})

export type InformeFormValues = z.infer<typeof informeSchema>
export type ComponenteFormValues = z.infer<typeof componenteSchema>
export type ProyectoFormValues = z.infer<typeof proyectoSchema>
export type PlazoFormValues = z.infer<typeof plazoSchema>
export type CriterioFormValues = z.infer<typeof criterioSchema>
export type RecursoFormValues = z.infer<typeof recursoSchema>
export type ActividadFormValues = z.infer<typeof actividadSchema>
export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>
