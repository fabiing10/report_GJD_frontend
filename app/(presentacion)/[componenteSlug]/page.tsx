import { notFound } from 'next/navigation'
import { getDataClient } from '@/lib/db'
import { ProgressBar } from '@/components/presentacion/ProgressBar'
import { ProyectoCard } from '@/components/presentacion/ProyectoCard'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'

interface Props {
  params: Promise<{ componenteSlug: string }>
}

export default async function ComponentePage({ params }: Props) {
  const { componenteSlug } = await params
  const client = getDataClient()
  const componente = await client.getComponente(componenteSlug)
  if (!componente) notFound()

  const informe = await client.getInformeActivo()
  const componenteIndex =
    informe?.componentes.findIndex((c) => c.slug === componenteSlug) ?? 0

  return (
    <div className="px-4 pt-6 pb-24 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span
          className="text-8xl leading-none mb-4 block"
          style={{
            filter: `drop-shadow(0 0 32px ${componente.color_hex}55)`,
          }}
          aria-hidden="true"
        >
          {componente.icono}
        </span>
        <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)]">
          {componente.nombre}
        </h1>
        {componente.descripcion && (
          <p className="text-[var(--color-text-secondary)] text-sm mt-2 max-w-lg mx-auto">
            {componente.descripcion}
          </p>
        )}
        <div className="mt-6 max-w-xs mx-auto">
          <ProgressBar
            value={componente.avance_calculado}
            color={componente.color_hex}
            showLabel
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {componente.proyectos.map((proyecto, i) => (
          <ProyectoCard
            key={proyecto.id}
            proyecto={proyecto}
            componente={{
              slug: componente.slug,
              color_hex: componente.color_hex,
            }}
            index={i}
          />
        ))}
      </div>

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
