'use client'

import { useEffect, useState } from 'react'
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
import { GripVertical } from 'lucide-react'
import type { PlazoDetalle, Criterio } from '@/types/domain'
import type { CriterioFormValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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
import { eliminarPlazo } from '@/lib/actions/plazos'
import {
  crearCriterio,
  actualizarCriterio,
  eliminarCriterio,
  reordenarCriterios,
} from '@/lib/actions/criterios'

type EstadoCriterio = Criterio['estado']

const PLAZO_LABEL: Record<PlazoDetalle['plazo'], string> = {
  corto: 'Corto plazo',
  mediano: 'Mediano plazo',
  largo: 'Largo plazo',
}

interface Props {
  plazo: PlazoDetalle
  proyectoId: string
}

export function PlazoCriterios({ plazo, proyectoId }: Props) {
  const router = useRouter()
  const [criterios, setCriterios] = useState<Criterio[]>(plazo.criterios)

  useEffect(() => {
    setCriterios(plazo.criterios)
  }, [plazo.criterios])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = criterios.findIndex((c) => c.id === active.id)
    const newIndex = criterios.findIndex((c) => c.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const previo = criterios
    const reordenado = arrayMove(criterios, oldIndex, newIndex)
    setCriterios(reordenado)
    reordenarCriterios(plazo.id, reordenado.map((c) => c.id))
      .then(() => router.refresh())
      .catch((e) => {
        setCriterios(previo)
        toast.error(e instanceof Error ? e.message : 'Error al reordenar')
      })
  }

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-surface-border)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
            {PLAZO_LABEL[plazo.plazo]}
          </h3>
          <span
            className="text-xs tabular-nums font-semibold"
            style={{ color: 'var(--color-alcaldia-naranja)' }}
          >
            {Math.round(plazo.avance_calculado)}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <CriterioFormDialog
            plazoId={plazo.id}
            triggerLabel="+ criterio"
            title="Nuevo criterio"
            onDone={() => router.refresh()}
          />
          <ConfirmDialog
            triggerLabel="Quitar plazo"
            triggerVariant="destructive"
            title={`Quitar ${PLAZO_LABEL[plazo.plazo].toLowerCase()}`}
            description="Esto elimina en cascada sus criterios. Esta acción no se puede deshacer."
            confirmLabel="Quitar"
            onConfirm={async () => {
              await eliminarPlazo(plazo.id)
              toast.success('Plazo eliminado')
              router.refresh()
            }}
          />
        </div>
      </div>

      {criterios.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Sin criterios todavía.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={criterios.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {criterios.map((c) => (
                <CriterioRow
                  key={c.id}
                  criterio={c}
                  plazoId={plazo.id}
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

function CriterioRow({
  criterio,
  plazoId,
  onDone,
}: {
  criterio: Criterio
  plazoId: string
  onDone: () => void
}) {
  const [peso, setPeso] = useState(String(criterio.peso))
  const [estado, setEstado] = useState<EstadoCriterio>(criterio.estado)
  const [loading, setLoading] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: criterio.id })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const dirty =
    Number(peso) !== criterio.peso || estado !== criterio.estado

  async function handleSave() {
    setLoading(true)
    try {
      const input: CriterioFormValues = {
        proyecto_plazo_id: plazoId,
        texto: criterio.texto,
        descripcion: criterio.descripcion,
        peso: Number(peso),
        estado,
      }
      await actualizarCriterio(criterio.id, input)
      toast.success('Criterio actualizado')
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-surface-border)] p-2"
    >
      <button
        type="button"
        aria-label={`Reordenar ${criterio.texto}`}
        className="cursor-grab touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        {...(mounted ? attributes : {})}
        {...(mounted ? listeners : {})}
      >
        <GripVertical size={14} />
      </button>
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text-secondary)]">
        {criterio.texto}
      </span>
      <div className="flex items-center gap-1">
        <Label htmlFor={`peso-${criterio.id}`} className="text-[11px] text-[var(--color-text-muted)]">
          Peso
        </Label>
        <Input
          id={`peso-${criterio.id}`}
          type="number"
          min={0}
          max={1000}
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          className="h-7 w-16 tabular-nums"
        />
      </div>
      <Select value={estado} onValueChange={(v) => setEstado(v as EstadoCriterio)}>
        <SelectTrigger size="sm" aria-label={`Estado de ${criterio.texto}`}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pendiente">Pendiente</SelectItem>
          <SelectItem value="en_progreso">En progreso</SelectItem>
          <SelectItem value="cumplido">Cumplido</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        className="text-xs"
        disabled={!dirty || loading}
        onClick={handleSave}
      >
        {loading ? '…' : 'Guardar'}
      </Button>
      <ConfirmDialog
        triggerLabel="Eliminar"
        triggerVariant="destructive"
        title="Eliminar criterio"
        description="Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={async () => {
          await eliminarCriterio(criterio.id)
          toast.success('Criterio eliminado')
          onDone()
        }}
      />
    </li>
  )
}

function CriterioFormDialog({
  plazoId,
  triggerLabel,
  title,
  onDone,
}: {
  plazoId: string
  triggerLabel: string
  title: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState<EstadoCriterio>('pendiente')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pesoRaw = String(fd.get('peso') ?? '').trim()

    const input: CriterioFormValues = {
      proyecto_plazo_id: plazoId,
      texto: String(fd.get('texto') ?? '').trim(),
      descripcion: String(fd.get('descripcion') ?? '').trim() || null,
      peso: pesoRaw === '' ? 1 : Number(pesoRaw),
      estado,
    }

    setLoading(true)
    try {
      await crearCriterio(input)
      toast.success('Criterio creado')
      setOpen(false)
      setEstado('pendiente')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="text-xs" />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            El peso define cuánto aporta el criterio al avance del plazo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="texto">Texto</Label>
            <Input id="texto" name="texto" required maxLength={500} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea id="descripcion" name="descripcion" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="peso">Peso</Label>
              <Input
                id="peso"
                name="peso"
                type="number"
                min={0}
                max={1000}
                defaultValue={1}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="criterio-estado">Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoCriterio)}>
                <SelectTrigger id="criterio-estado" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_progreso">En progreso</SelectItem>
                  <SelectItem value="cumplido">Cumplido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
