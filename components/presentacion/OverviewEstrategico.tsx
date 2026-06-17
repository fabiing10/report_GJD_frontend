import Image from 'next/image'
import { ProgressRing } from './ProgressRing'
import { ProgressBar } from './ProgressBar'
import { ComponenteCard } from './ComponenteCard'
import { PLAZO_ORDER, PLAZO_LABEL, objetivosPorPlazo, avancePlazo } from '@/lib/objetivos'
import type { InformeConRelaciones, Objetivo } from '@/types/domain'

const ESTADO_OBJ = [
  { key: 'cumplido', label: 'Cumplidos', color: 'var(--color-estado-completado)' },
  { key: 'en_progreso', label: 'En progreso', color: 'var(--color-estado-en-progreso)' },
  { key: 'pendiente', label: 'Pendientes', color: 'var(--color-estado-no-iniciado)' },
] as const

export function OverviewEstrategico({ informe }: { informe: InformeConRelaciones }) {
  const objetivos: Objetivo[] = informe.componentes.flatMap((c) =>
    c.proyectos.flatMap((p) => p.objetivos)
  )
  const totalObj = objetivos.length
  const porEstado = ESTADO_OBJ.map((e) => ({
    ...e,
    n: objetivos.filter((o) => o.estado === e.key).length,
  }))
  const porPlazo = PLAZO_ORDER.map((plz) => ({
    plz,
    n: objetivosPorPlazo(objetivos, plz).length,
    avance: avancePlazo(objetivos, plz),
  })).filter((x) => x.n > 0)

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-24">
      <div className="mb-8 flex flex-col items-center gap-4">
        <Image src="/logo-gjd.svg" alt="GJD" width={72} height={72} priority />
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-4xl">
            {informe.titulo}
          </h1>
          {informe.subtitulo && (
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{informe.subtitulo}</p>
          )}
        </div>
      </div>

      <div className="mb-10">
        <ProgressRing value={informe.avance_global_calculado} color="#F97316" size="lg" label="Avance global" />
      </div>

      {/* Distribuciones estratégicas */}
      <div className="mb-10 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="Por plazo">
          {porPlazo.length === 0 ? (
            <Empty />
          ) : (
            <ul className="space-y-3">
              {porPlazo.map((x) => (
                <li key={x.plz} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-text-secondary)]">
                      {PLAZO_LABEL[x.plz]}{' '}
                      <span className="text-[var(--color-text-muted)]">· {x.n} obj.</span>
                    </span>
                    <span className="font-semibold tabular-nums text-[var(--color-text-secondary)]">
                      {Math.round(x.avance)}%
                    </span>
                  </div>
                  <ProgressBar value={x.avance} color="#F97316" />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Por estado">
          <div className="flex items-end gap-3">
            {porEstado.map((e) => {
              const pct = totalObj ? (e.n / totalObj) * 100 : 0
              return (
                <div key={e.key} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
                    {e.n}
                  </span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: e.color }} />
                  </div>
                  <span className="text-[11px] text-[var(--color-text-muted)]">{e.label}</span>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      {/* Avance por componente */}
      <div className="w-full max-w-5xl">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
          Componentes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {informe.componentes.map((c, i) => (
            <ComponenteCard key={c.id} componente={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
    >
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Empty() {
  return <p className="text-xs text-[var(--color-text-muted)]">Sin datos.</p>
}
