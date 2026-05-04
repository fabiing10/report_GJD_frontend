import { notFound } from 'next/navigation'
import { Check, ArrowRight } from 'lucide-react'
import { getDataClient } from '@/lib/db'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { EstadoBadge, PlazoBadge } from '@/components/presentacion/EstadoBadge'
import { Breadcrumbs } from '@/components/presentacion/Breadcrumbs'
import { NavegacionProyectos } from '@/components/presentacion/NavegacionProyectos'
import { RecursoVisual } from '@/components/presentacion/RecursoVisual'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'

interface Props {
  params: Promise<{ componenteSlug: string; proyectoSlug: string }>
}

export default async function ProyectoPage({ params }: Props) {
  const { componenteSlug, proyectoSlug } = await params
  const client = getDataClient()
  const componente = await client.getComponente(componenteSlug)
  if (!componente) notFound()

  const proyectoIndex = componente.proyectos.findIndex(
    (p) => p.slug === proyectoSlug
  )
  if (proyectoIndex === -1) notFound()

  const proyecto = componente.proyectos[proyectoIndex]!
  const prev = proyectoIndex > 0 ? componente.proyectos[proyectoIndex - 1]! : null
  const next =
    proyectoIndex < componente.proyectos.length - 1
      ? componente.proyectos[proyectoIndex + 1]!
      : null

  return (
    <div className="px-4 pt-4 pb-24 max-w-6xl mx-auto">
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: componente.nombre, href: `/${componenteSlug}` },
          {
            label: proyecto.codigo
              ? `${proyecto.codigo} ${proyecto.nombre}`
              : proyecto.nombre,
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <div className="flex flex-col items-center gap-4 pt-4">
          <ProgressRing
            value={proyecto.avance}
            color={componente.color_hex}
            size="lg"
          />
          <EstadoBadge estado={proyecto.estado} />
          <PlazoBadge plazo={proyecto.plazo} />
          {proyecto.responsable && (
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              {proyecto.responsable}
            </p>
          )}
          {(proyecto.fecha_entrega_texto ?? proyecto.fecha_entrega) && (
            <p className="text-xs text-[var(--color-text-muted)] text-center">
              {proyecto.fecha_entrega_texto ?? proyecto.fecha_entrega}
            </p>
          )}
        </div>

        <div
          className="rounded-2xl p-5 border"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-surface-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-[var(--color-alcaldia-naranja)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Logros Alcanzados
            </h2>
          </div>
          <ul className="space-y-2.5">
            {proyecto.logros.length > 0 ? (
              proyecto.logros.map((l) => (
                <li key={l.id} className="flex gap-2.5">
                  <Check
                    size={14}
                    className="shrink-0 mt-0.5 text-[var(--color-estado-completado)]"
                  />
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {l.texto}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-[var(--color-text-muted)] italic">
                Sin logros registrados
              </li>
            )}
          </ul>
        </div>

        <div
          className="rounded-2xl p-5 border"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: 'var(--color-surface-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-[var(--color-estado-en-progreso)]" />
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Próximos Pasos
            </h2>
          </div>
          <ul className="space-y-2.5">
            {proyecto.proximos_pasos.length > 0 ? (
              proyecto.proximos_pasos.map((p) => (
                <li key={p.id} className="flex gap-2.5">
                  <ArrowRight
                    size={14}
                    className="shrink-0 mt-0.5 text-[var(--color-estado-en-progreso)]"
                  />
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    {p.texto}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-xs text-[var(--color-text-muted)] italic">
                Sin pasos registrados
              </li>
            )}
          </ul>
        </div>
      </div>

      <RecursoVisual recursos={proyecto.recursos} />

      <NavegacionProyectos
        prev={prev}
        next={next}
        componenteSlug={componenteSlug}
      />

      <div className="flex justify-center mt-6">
        <PaginadorPuntos
          total={componente.proyectos.length}
          current={proyectoIndex}
          color={componente.color_hex}
        />
      </div>
    </div>
  )
}
