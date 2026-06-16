import type {
  PlazoEnum,
  EstadoEnum,
  CriterioEstadoEnum,
  RecursoTipoEnum,
} from '@/types/domain'

// ── Forma del data.json de entrada ─────────────────────────
interface RawActivity {
  id: string
  name: string
  progress?: number
  status?: string
  phase?: string
  description?: string
  achievements?: string[]
  nextSteps?: string[]
  video?: string
}
interface RawCategory {
  id: string
  name: string
  description?: string
  color?: string
  icon?: string
  activities?: RawActivity[]
}
interface RawData {
  project?: { name?: string; subtitle?: string; overallProgress?: number; lastUpdated?: string }
  categories?: RawCategory[]
}

// ── Plan de inserción (salida) ─────────────────────────────
export interface CriterioPlan {
  texto: string
  estado: CriterioEstadoEnum
  peso: number
  orden: number
}
export interface PlazoPlan {
  plazo: PlazoEnum
  avance_override: number | null
  criterios: CriterioPlan[]
}
export interface RecursoPlan {
  tipo: RecursoTipoEnum
  titulo: string | null
  url: string
  orden: number
}
export interface ProyectoPlan {
  slug: string
  codigo: string | null
  nombre: string
  descripcion_larga: string | null
  estado: EstadoEnum
  avance_override: number | null
  orden: number
  plazo: PlazoPlan
  recursos: RecursoPlan[]
}
export interface ComponentePlan {
  slug: string
  nombre: string
  descripcion: string | null
  icono: string
  color_hex: string
  color_token: string
  orden: number
  proyectos: ProyectoPlan[]
}
export interface SeedPlan {
  informe: {
    titulo: string
    subtitulo: string | null
    fecha_corte: string
    is_active: boolean
  }
  componentes: ComponentePlan[]
}

const ESTADOS: EstadoEnum[] = ['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']

export function parsePlazo(phase: string | undefined): PlazoEnum {
  const p = (phase ?? '').toLowerCase()
  if (p.includes('mediano')) return 'mediano'
  if (p.includes('largo')) return 'largo'
  return 'corto'
}

function parseEstado(status: string | undefined): EstadoEnum {
  return ESTADOS.includes(status as EstadoEnum) ? (status as EstadoEnum) : 'no_iniciado'
}

function parseCodigo(name: string): string | null {
  const m = name.match(/^([A-Za-z]+-\d+)\b/)
  return m ? m[1]! : null
}

export function mapDataToPlan(data: RawData): SeedPlan {
  const componentes: ComponentePlan[] = (data.categories ?? []).map((cat, ci) => ({
    slug: cat.id,
    nombre: cat.name,
    descripcion: cat.description ?? null,
    icono: cat.icon ?? '•',
    color_hex: cat.color ?? '#64748b',
    color_token: cat.id,
    orden: ci,
    proyectos: (cat.activities ?? []).map((act, pi) => {
      const criterios: CriterioPlan[] = [
        ...(act.achievements ?? []).map((texto, i) => ({
          texto,
          estado: 'cumplido' as CriterioEstadoEnum,
          peso: 1,
          orden: i,
        })),
        ...(act.nextSteps ?? []).map((texto, i) => ({
          texto,
          estado: 'pendiente' as CriterioEstadoEnum,
          peso: 1,
          orden: (act.achievements ?? []).length + i,
        })),
      ]
      const recursos: RecursoPlan[] = act.video
        ? [{ tipo: 'video_url', titulo: null, url: act.video, orden: 0 }]
        : []
      const progress = act.progress ?? null
      return {
        slug: act.id,
        codigo: parseCodigo(act.name),
        nombre: act.name,
        descripcion_larga: act.description ?? null,
        estado: parseEstado(act.status),
        avance_override: progress,
        orden: pi,
        plazo: {
          plazo: parsePlazo(act.phase),
          avance_override: progress,
          criterios,
        },
        recursos,
      }
    }),
  }))

  return {
    informe: {
      titulo: data.project?.name ?? 'Informe',
      subtitulo: data.project?.subtitle ?? null,
      fecha_corte: data.project?.lastUpdated ?? '2026-01-01',
      is_active: true,
    },
    componentes,
  }
}
