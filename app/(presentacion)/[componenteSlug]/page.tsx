import { notFound } from 'next/navigation'
import { getComponente, getInformeActivo } from '@/lib/db/queries'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'
import { ProyectoCard } from '@/components/presentacion/ProyectoCard'

interface Props {
  params: Promise<{ componenteSlug: string }>
}

export default async function ComponentePage({ params }: Props) {
  const { componenteSlug } = await params
  const componente = await getComponente(componenteSlug)
  if (!componente) notFound()

  const informe = await getInformeActivo()
  const componenteIndex =
    informe?.componentes.findIndex((c) => c.slug === componenteSlug) ?? 0

  return (
    <div className="px-6 pt-8 pb-24 max-w-6xl mx-auto">
      {/* Hero: título izquierda — ring derecha, dentro de un contenedor */}
      <div
        className="mb-8 flex items-center gap-10 rounded-2xl border p-6 sm:p-8"
        style={{
          background: `linear-gradient(180deg, ${componente.color_hex}12, var(--color-surface-card))`,
          borderColor: 'var(--color-surface-border)',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontSize: 56,
              lineHeight: 1,
              display: 'block',
              marginBottom: 12,
              filter: `drop-shadow(0 0 24px ${componente.color_hex}55)`,
            }}
            aria-hidden="true"
          >
            {componente.icono}
          </span>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              marginBottom: componente.descripcion ? 8 : 0,
            }}
          >
            {componente.nombre}
          </h1>
          {componente.descripcion && (
            <p
              style={{
                fontSize: 14,
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
                maxWidth: 480,
              }}
            >
              {componente.descripcion}
            </p>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>
          <ProgressRing
            value={componente.avance_calculado}
            color={componente.color_hex}
            size="lg"
            label="avance general"
          />
        </div>
      </div>

      {/* Proyectos del componente */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="h-5 w-1 rounded-full" style={{ background: componente.color_hex }} />
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Proyectos</h2>
        <span className="text-xs text-[var(--color-text-muted)]">
          {componente.proyectos.length}
        </span>
      </div>

      {componente.proyectos.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          Este componente aún no tiene proyectos.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {componente.proyectos.map((proyecto, i) => (
            <ProyectoCard
              key={proyecto.id}
              proyecto={proyecto}
              componente={{ slug: componente.slug, color_hex: componente.color_hex }}
              index={i}
            />
          ))}
        </div>
      )}

      {informe && (
        <div className="mt-10 flex justify-center">
          <PaginadorPuntos
            total={informe.componentes.length}
            current={componenteIndex}
            color={componente.color_hex}
          />
        </div>
      )}
    </div>
  )
}
