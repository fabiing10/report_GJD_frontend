import { z } from 'zod'

export const proyectoSchema = z.object({
  componente_id: z.string().min(1),
  slug: z.string().min(1).max(100),
  codigo: z.string().max(20).nullable(),
  nombre: z.string().min(1, 'Requerido').max(200),
  descripcion_corta: z.string().max(200).nullable(),
  descripcion_larga: z.string().nullable(),
  plazo: z.enum(['corto', 'mediano', 'largo']),
  estado: z.enum(['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']),
  avance: z.number().min(0).max(100),
  responsable: z.string().max(200).nullable(),
  fecha_entrega: z.string().nullable(),
  fecha_entrega_texto: z.string().max(100).nullable(),
  orden: z.number().int().min(0),
})

export const componenteSchema = z.object({
  informe_id: z.string().min(1),
  slug: z.string().min(1).max(100),
  nombre: z.string().min(1).max(200),
  descripcion: z.string().nullable(),
  icono: z.string().max(10),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  color_token: z.enum(['blue', 'purple', 'cyan', 'violet', 'slate', 'rose']),
  orden: z.number().int().min(0),
  avance_override: z.number().min(0).max(100).nullable(),
})

export const informeSchema = z.object({
  titulo: z.string().min(1).max(300),
  subtitulo: z.string().nullable(),
  fecha_corte: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  avance_global_override: z.number().min(0).max(100).nullable(),
  is_active: z.boolean(),
})

export const actividadSchema = z.object({
  proyecto_id: z.string().min(1),
  nombre: z.string().min(1).max(300),
  descripcion: z.string().nullable(),
  plazo: z.enum(['corto', 'mediano', 'largo']),
  estado: z.enum(['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']),
  avance: z.number().min(0).max(100),
  orden: z.number().int().min(0),
})

export type ProyectoFormValues = z.infer<typeof proyectoSchema>
export type ComponenteFormValues = z.infer<typeof componenteSchema>
export type InformeFormValues = z.infer<typeof informeSchema>
export type ActividadFormValues = z.infer<typeof actividadSchema>
