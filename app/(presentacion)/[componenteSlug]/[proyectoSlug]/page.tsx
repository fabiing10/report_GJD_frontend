import { notFound } from 'next/navigation'
import { getComponente } from '@/lib/db/queries'
import { isCurrentUserAdmin } from '@/lib/auth'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { EstadoBadge } from '@/components/presentacion/EstadoBadge'
import { Breadcrumbs } from '@/components/presentacion/Breadcrumbs'
import { NavegacionProyectos } from '@/components/presentacion/NavegacionProyectos'
import { RecursoVisual } from '@/components/presentacion/RecursoVisual'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'
import { ObjetivosKanban } from '@/components/presentacion/ObjetivosKanban'
import { ObjetivoDrawer } from '@/components/presentacion/ObjetivoDrawer'

interface Props {
  params: Promise<{ componenteSlug: string; proyectoSlug: string }>
}

export default async function ProyectoPage({ params }: Props) {
  const { componenteSlug, proyectoSlug } = await params
  const componente = await getComponente(componenteSlug)
  if (!componente) notFound()

  const proyectoIndex = componente.proyectos.findIndex((p) => p.slug === proyectoSlug)
  if (proyectoIndex === -1) notFound()

  const proyecto = componente.proyectos[proyectoIndex]!
  const prev = proyectoIndex > 0 ? componente.proyectos[proyectoIndex - 1]! : null
  const next =
    proyectoIndex < componente.proyectos.length - 1
      ? componente.proyectos[proyectoIndex + 1]!
      : null

  const isAdmin = await isCurrentUserAdmin()

  return (
    <div className="px-4 pt-4 pb-24 max-w-5xl mx-auto">
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

      {/* Header del proyecto */}
      <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <ProgressRing value={proyecto.avance_calculado} color={componente.color_hex} size="lg" />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)] leading-tight">
            {proyecto.codigo ? `${proyecto.codigo} · ` : ''}
            {proyecto.nombre}
          </h1>
          {proyecto.descripcion_corta && (
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {proyecto.descripcion_corta}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <EstadoBadge estado={proyecto.estado} />
            {proyecto.responsable && <span>· {proyecto.responsable}</span>}
            {(proyecto.fecha_fin ?? proyecto.fecha_inicio) && (
              <span>· {proyecto.fecha_fin ?? proyecto.fecha_inicio}</span>
            )}
          </div>
        </div>
      </div>

      {/* Objetivos por plazo */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2.5">
          <div
            className="h-5 w-1 rounded-full"
            style={{ background: componente.color_hex }}
          />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Objetivos
          </h2>
          <span className="text-xs text-[var(--color-text-muted)]">
            {proyecto.objetivos.length} · {isAdmin ? 'arrastra entre columnas para cambiar el plazo · ' : ''}toca uno para ver su detalle
          </span>
        </div>
        <ObjetivosKanban
          objetivos={proyecto.objetivos}
          colorHex={componente.color_hex}
          isAdmin={isAdmin}
        />
      </section>

      <RecursoVisual recursos={proyecto.recursos} />

      <NavegacionProyectos prev={prev} next={next} componenteSlug={componenteSlug} />

      <div className="flex justify-center mt-6">
        <PaginadorPuntos
          total={componente.proyectos.length}
          current={proyectoIndex}
          color={componente.color_hex}
        />
      </div>

      <ObjetivoDrawer objetivos={proyecto.objetivos} colorHex={componente.color_hex} />
    </div>
  )
}
