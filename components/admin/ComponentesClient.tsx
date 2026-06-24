'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil } from 'lucide-react'
import type { Componente } from '@/types/domain'
import type { ComponenteFormValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/admin/Field'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  crearComponente,
  actualizarComponente,
  eliminarComponente,
  reordenarComponentes,
} from '@/lib/actions/componentes'

interface Props {
  componentes: Componente[]
  informeId: string
}

export function ComponentesClient({ componentes, informeId }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<Componente[]>(componentes)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((c) => c.id === active.id)
    const newIndex = items.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const reordenado = arrayMove(items, oldIndex, newIndex)
    setItems(reordenado)

    startTransition(async () => {
      try {
        await reordenarComponentes(reordenado.map((c) => c.id))
        router.refresh()
      } catch (e) {
        setItems(items)
        toast.error(e instanceof Error ? e.message : 'Error al reordenar')
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--color-text-muted)]">
          Arrastra para reordenar. El orden define cómo aparecen en la presentación.
        </p>
        <ComponenteFormDialog
          informeId={informeId}
          triggerLabel="+ Nuevo componente"
          title="Nuevo componente"
          onDone={() => router.refresh()}
        />
      </div>

      {items.length === 0 ? (
        <div
          className="rounded-xl p-6 border text-sm text-[var(--color-text-muted)]"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
        >
          Sin componentes todavía. Crea el primero con &ldquo;+ Nuevo componente&rdquo;.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((c) => (
                <ComponenteRow
                  key={c.id}
                  componente={c}
                  informeId={informeId}
                  onDone={() => router.refresh()}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function ComponenteRow({
  componente,
  informeId,
  onDone,
}: {
  componente: Componente
  informeId: string
  onDone: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: componente.id })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const avance = componente.avance_override

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-surface-border)',
      }}
      className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-white/[0.02]"
    >
      <button
        type="button"
        aria-label={`Reordenar ${componente.nombre}`}
        className="cursor-grab touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        {...(mounted ? attributes : {})}
        {...(mounted ? listeners : {})}
      >
        <GripVertical size={16} />
      </button>

      <span className="text-lg w-7 text-center" aria-hidden>
        {componente.icono}
      </span>

      <span
        className="h-5 w-5 shrink-0 rounded-md border"
        style={{ backgroundColor: componente.color_hex, borderColor: 'var(--color-surface-border)' }}
        title={componente.color_hex}
        aria-label={`Color ${componente.color_hex}`}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
          {componente.nombre}
        </p>
        <p className="truncate text-[11px] text-[var(--color-text-muted)]">{componente.slug}</p>
      </div>

      <span className="w-14 text-right text-xs tabular-nums text-[var(--color-text-secondary)]">
        {avance === null ? 'auto' : `${avance}%`}
      </span>

      <div className="flex items-center gap-1">
        <ComponenteFormDialog
          informeId={informeId}
          componente={componente}
          triggerLabel="Editar"
          triggerIcon={<Pencil size={13} />}
          title="Editar componente"
          onDone={onDone}
        />
        <ConfirmDialog
          triggerLabel="Eliminar"
          triggerVariant="destructive"
          title={`Eliminar "${componente.nombre}"`}
          description="Esto elimina en cascada sus proyectos, plazos y criterios. Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await eliminarComponente(componente.id)
            toast.success('Componente eliminado')
            onDone()
          }}
        />
      </div>
    </li>
  )
}

function ComponenteFormDialog({
  informeId,
  componente,
  triggerLabel,
  triggerIcon,
  title,
  onDone,
}: {
  informeId: string
  componente?: Componente
  triggerLabel: string
  triggerIcon?: React.ReactNode
  title: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [colorHex, setColorHex] = useState(componente?.color_hex ?? '#3B82F6')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const avanceRaw = String(fd.get('avance_override') ?? '').trim()

    const input: ComponenteFormValues = {
      informe_id: informeId,
      slug: String(fd.get('slug') ?? '').trim(),
      nombre: String(fd.get('nombre') ?? '').trim(),
      descripcion: String(fd.get('descripcion') ?? '').trim() || null,
      icono: String(fd.get('icono') ?? '').trim(),
      color_hex: String(fd.get('color_hex') ?? '').trim(),
      color_token: String(fd.get('color_token') ?? '').trim(),
      avance_override: avanceRaw === '' ? null : Number(avanceRaw),
    }

    setLoading(true)
    try {
      if (componente) {
        await actualizarComponente(componente.id, input)
        toast.success('Componente actualizado')
      } else {
        await crearComponente(input)
        toast.success('Componente creado')
      }
      setOpen(false)
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={componente ? 'ghost' : 'outline'} size="sm" className="text-xs" />
        }
      >
        {triggerIcon}
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define los datos del componente. El orden se ajusta arrastrando en la lista.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            label="Nombre"
            htmlFor="nombre"
            required
            description="Cómo aparece el componente en la presentación."
          >
            <Input id="nombre" name="nombre" defaultValue={componente?.nombre ?? ''} required />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Slug"
              htmlFor="slug"
              required
              description="Identificador en la URL. Solo minúsculas y guiones."
            >
              <Input id="slug" name="slug" defaultValue={componente?.slug ?? ''} required />
            </Field>
            <Field
              label="Icono"
              htmlFor="icono"
              required
              description="Emoji que encabeza el componente."
            >
              <Input id="icono" name="icono" defaultValue={componente?.icono ?? ''} required />
            </Field>
          </div>

          <Field
            label="Descripción"
            htmlFor="descripcion"
            description="Contexto breve del componente."
          >
            <Textarea
              id="descripcion"
              name="descripcion"
              defaultValue={componente?.descripcion ?? ''}
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Color (hex)"
              htmlFor="color_hex"
              description="Color de acento del componente."
            >
              <div className="flex items-center gap-2">
                <Input
                  id="color_hex"
                  name="color_hex"
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-8 w-12 p-1"
                />
                <Input
                  aria-label="Color en texto"
                  value={colorHex.toUpperCase()}
                  readOnly
                  className="flex-1 font-mono tabular-nums"
                />
              </div>
            </Field>
            <Field
              label="Color token"
              htmlFor="color_token"
              required
              description="Nombre del token de color del tema."
            >
              <Input
                id="color_token"
                name="color_token"
                defaultValue={componente?.color_token ?? ''}
                required
              />
            </Field>
          </div>

          <Field
            label="Avance %"
            htmlFor="avance_override"
            description="Vacío = automático por proyectos."
          >
            <Input
              id="avance_override"
              name="avance_override"
              type="number"
              min={0}
              max={100}
              defaultValue={componente?.avance_override ?? ''}
              placeholder="auto"
            />
          </Field>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" size="sm" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? '…' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
