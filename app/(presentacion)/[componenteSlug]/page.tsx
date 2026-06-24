import { notFound } from 'next/navigation'
import { getComponente, getInformeActivo } from '@/lib/db/queries'
import { ProgressRing } from '@/components/presentacion/ProgressRing'
import { PaginadorPuntos } from '@/components/presentacion/PaginadorPuntos'
import { ComponenteProyectos } from '@/components/presentacion/ComponenteProyectos'

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
    <div className="px-6 pt-8 pb-24 mx-auto w-[90%] max-w-[1800px]">
      {/* Hero: ícono a la izquierda + título/descripción — ring a la derecha */}
      <div
        className="mb-8 flex items-center gap-5 rounded-2xl border p-5 sm:gap-6 sm:p-6"
        style={{
          background: `linear-gradient(180deg, ${componente.color_hex}12, var(--color-surface-card))`,
          borderColor: 'var(--color-surface-border)',
        }}
      >
        <span
          style={{
            fontSize: 44,
            lineHeight: 1,
            flexShrink: 0,
            filter: `drop-shadow(0 0 20px ${componente.color_hex}55)`,
          }}
          aria-hidden="true"
        >
          {componente.icono}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              color: 'var(--color-text-primary)',
              lineHeight: 1.15,
              marginBottom: componente.descripcion ? 6 : 0,
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
                maxWidth: 520,
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
          {componente.proyectos.length} · selecciona uno para ver el cronograma de sus productos
        </span>
      </div>

      <ComponenteProyectos
        proyectos={componente.proyectos}
        slug={componente.slug}
        colorHex={componente.color_hex}
      />

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
