'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { reorderComponentesAction } from '@/lib/actions/componentes'
import type { ComponenteConAvance } from '@/types/domain'

function SortableItem({ componente }: { componente: ComponenteConAvance }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: componente.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        borderColor: isDragging ? componente.color_hex : 'var(--color-surface-border)',
      }}
      className="flex items-center gap-3 p-3 rounded-xl border"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        aria-label="Reordenar"
      >
        <GripVertical size={16} />
      </button>
      <span className="text-2xl">{componente.icono}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{componente.nombre}</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {componente.total_actividades} proyectos · {Math.round(componente.avance_calculado)}%
        </p>
      </div>
      <div className="w-24 h-1 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${componente.avance_calculado}%`, backgroundColor: componente.color_hex }} />
      </div>
      <Link
        href={`/admin/componentes/${componente.id}`}
        className="p-1.5 rounded hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        title="Editar"
      >
        <ExternalLink size={14} />
      </Link>
    </div>
  )
}

interface Props {
  componentes: ComponenteConAvance[]
  informeId: string
}

export function ComponenteSortableList({ componentes: initial, informeId }: Props) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(c => c.id === active.id)
    const newIndex = items.findIndex(c => c.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)

    startTransition(async () => {
      try {
        await reorderComponentesAction(informeId, reordered.map(c => c.id))
        toast.success('Orden actualizado')
      } catch {
        toast.error('Error al reordenar')
        setItems(initial)
      }
    })
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map(c => <SortableItem key={c.id} componente={c} />)}
        </div>
      </SortableContext>
    </DndContext>
  )
}
