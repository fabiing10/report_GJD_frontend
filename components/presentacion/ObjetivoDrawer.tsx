'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { X, Users, CheckSquare, Search, FileText, Calendar } from 'lucide-react'
import type { ObjetivoDetalle, ActividadTipoEnum } from '@/types/domain'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
function fmtFecha(f: string | null): string | null {
  if (!f) return null
  const [y, m, d] = f.split('-')
  if (!y || !m || !d) return f
  return `${Number(d)} ${MESES[Number(m) - 1]} ${y}`
}

const TIPO_LABEL = { hu: 'HU', funcionalidad: 'Funcionalidad' } as const
const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  cumplido: 'Cumplido',
} as const
const PLAZO_LABEL = { corto: 'Corto plazo', mediano: 'Mediano plazo', largo: 'Largo plazo' } as const

const ACT_ICON: Record<ActividadTipoEnum, React.ReactNode> = {
  reunion: <Users size={13} />,
  tarea: <CheckSquare size={13} />,
  investigacion: <Search size={13} />,
  informe: <FileText size={13} />,
}
const ACT_LABEL: Record<ActividadTipoEnum, string> = {
  reunion: 'Reunión',
  tarea: 'Tarea',
  investigacion: 'Investigación',
  informe: 'Informe',
}

export function ObjetivoDrawer({
  objetivos,
  colorHex,
}: {
  objetivos: ObjetivoDetalle[]
  colorHex: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const objId = searchParams.get('obj')
  const obj = objetivos.find((o) => o.id === objId)
  if (!obj) return null

  const close = () => router.push(pathname, { scroll: false })

  return (
    <>
      <div
        onClick={close}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        aria-hidden
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l shadow-2xl"
        style={{
          background: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-surface-border)',
        }}
        role="dialog"
        aria-label={obj.titulo}
      >
        <header
          className="flex items-start justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: 'var(--color-surface-border)' }}
        >
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: `${colorHex}22`, color: colorHex }}
              >
                {TIPO_LABEL[obj.tipo]}
              </span>
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                {ESTADO_LABEL[obj.estado]}
              </span>
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
                {PLAZO_LABEL[obj.plazo]}
              </span>
              {fmtFecha(obj.fecha_limite) && (
                <span className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] tabular-nums text-[var(--color-text-muted)]">
                  <Calendar size={10} />
                  {fmtFecha(obj.fecha_limite)}
                </span>
              )}
            </div>
            <h2 className="text-sm font-semibold leading-snug text-[var(--color-text-primary)]">
              {obj.titulo}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar"
            className="shrink-0 rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {obj.descripcion && (
            <p className="mb-5 text-[13px] leading-relaxed text-[var(--color-text-secondary)]">
              {obj.descripcion}
            </p>
          )}

          <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Bitácora
          </h3>
          {obj.actividades.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Sin actividades registradas todavía.
            </p>
          ) : (
            <ul className="space-y-2">
              {obj.actividades.map((a) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2.5 rounded-lg border p-2.5"
                  style={{ borderColor: 'var(--color-surface-border)' }}
                >
                  <span
                    className="mt-0.5 shrink-0 rounded-md p-1"
                    style={{ background: `${colorHex}1a`, color: colorHex }}
                  >
                    {ACT_ICON[a.tipo]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] text-[var(--color-text-primary)]">
                      {a.titulo}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">
                      {ACT_LABEL[a.tipo]}
                      {a.fecha ? ` · ${a.fecha}` : ''}
                      {a.responsable ? ` · ${a.responsable}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
