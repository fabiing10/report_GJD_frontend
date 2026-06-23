'use client'

import { useState } from 'react'
import { ProyectoCard } from './ProyectoCard'
import { ObjetivosGantt } from './ObjetivosGantt'
import { ObjetivoDrawer } from './ObjetivoDrawer'
import type { ProyectoDetalle } from '@/types/domain'

export function ComponenteProyectos({
  proyectos,
  slug,
  colorHex,
}: {
  proyectos: ProyectoDetalle[]
  slug: string
  colorHex: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(proyectos[0]?.id ?? null)

  if (proyectos.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Este componente aún no tiene proyectos.
      </p>
    )
  }

  const seleccionado = proyectos.find((p) => p.id === selectedId) ?? proyectos[0]!

  return (
    <div>
      {/* Cards de proyecto (seleccionables) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {proyectos.map((p, i) => (
          <ProyectoCard
            key={p.id}
            proyecto={p}
            componente={{ slug, color_hex: colorHex }}
            index={i}
            onSelect={() => setSelectedId(p.id)}
            active={p.id === seleccionado.id}
          />
        ))}
      </div>

      {/* Cronograma de objetivos del proyecto seleccionado */}
      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <div className="h-5 w-1 rounded-full" style={{ background: colorHex }} />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Cronograma de productos
          </h2>
          <span className="truncate text-xs text-[var(--color-text-muted)]">
            {seleccionado.codigo ? `${seleccionado.codigo} · ` : ''}
            {seleccionado.nombre} · {seleccionado.objetivos.length} productos por plazo
          </span>
        </div>
        <ObjetivosGantt objetivos={seleccionado.objetivos} colorHex={colorHex} />
      </div>

      {/* Modal de detalle del objetivo (abierto desde una barra del cronograma) */}
      <ObjetivoDrawer objetivos={seleccionado.objetivos} colorHex={colorHex} />
    </div>
  )
}
