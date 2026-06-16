import { notFound } from 'next/navigation'
import { getComponente, getInformeActivo } from '@/lib/db/queries'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'
import { PlazoTabs } from '@/components/presentacion/PlazoTabs'

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
      {/* Hero: título izquierda — ring derecha */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          marginBottom: 40,
        }}
      >
        {/* Izquierda: icono + título + descripción */}
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

        {/* Derecha: ring de avance general */}
        <div style={{ flexShrink: 0 }}>
          <ProgressRing
            value={componente.avance_calculado}
            color={componente.color_hex}
            size="lg"
            label="avance general"
          />
        </div>
      </div>

      {/* Actividades agrupadas por plazo en tabs */}
      <PlazoTabs
        proyectos={componente.proyectos}
        componente={{ slug: componente.slug, color_hex: componente.color_hex }}
      />

      {informe && (
        <div className="flex justify-center mt-10">
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
