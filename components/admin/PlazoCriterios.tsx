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
import type {
  Objetivo,
  ObjetivoDetalle,
  PlazoEnum,
  ObjetivoTipoEnum,
  ObjetivoEstadoEnum,
} from '@/types/domain'
import type { ObjetivoFormValues } from '@/lib/schemas'
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
import {
  crearObjetivo,
  actualizarObjetivo,
  eliminarObjetivo,
  reordenarObjetivos,
} from '@/lib/actions/objetivos'

const PLAZO_LABEL: Record<PlazoEnum, string> = {
  corto: 'Corto plazo',
  mediano: 'Mediano plazo',
  largo: 'Largo plazo',
}

const TIPOS: { value: ObjetivoTipoEnum; label: string }[] = [
  { value: 'hu', label: 'HU' },
  { value: 'funcionalidad', label: 'Funcionalidad' },
]

const ESTADOS: { value: ObjetivoEstadoEnum; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'cumplido', label: 'Cumplido' },
]

const PLAZOS: { value: PlazoEnum; label: string }[] = [
  { value: 'corto', label: 'Corto plazo' },
  { value: 'mediano', label: 'Mediano plazo' },
  { value: 'largo', label: 'Largo plazo' },
]

interface Props {
  proyectoId: string
  plazo: PlazoEnum
  objetivos: ObjetivoDetalle[]
}

/**
 * Editor de los objetivos (HU/Funcionalidad) de un proyecto agrupados por plazo.
 * Reordena con dnd y crea/edita/elimina objetivos del grupo.
 */
export function ObjetivosPorPlazo({ proyectoId, plazo, objetivos }: Props) {
  const router = useRouter()
  const [items, setItems] = useState<ObjetivoDetalle[]>(objetivos)

  useEffect(() => {
    setItems(objetivos)
  }, [objetivos])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((o) => o.id === active.id)
    const newIndex = items.findIndex((o) => o.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    const previo = items
    const reordenado = arrayMove(items, oldIndex, newIndex)
    setItems(reordenado)
    reordenarObjetivos(proyectoId, reordenado.map((o) => o.id))
      .then(() => router.refresh())
      .catch((e) => {
        setItems(previo)
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
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
          {PLAZO_LABEL[plazo]}
        </h3>
        <ObjetivoFormDialog
          proyectoId={proyectoId}
          plazo={plazo}
          triggerLabel="+ objetivo"
          title={`Nuevo objetivo · ${PLAZO_LABEL[plazo].toLowerCase()}`}
          onDone={() => router.refresh()}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Sin objetivos todavía.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((o) => o.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {items.map((o) => (
                <ObjetivoRow key={o.id} objetivo={o} onDone={() => router.refresh()} />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function ObjetivoRow({
  objetivo,
  onDone,
}: {
  objetivo: Objetivo
  onDone: () => void
}) {
  const [titulo, setTitulo] = useState(objetivo.titulo)
  const [tipo, setTipo] = useState<ObjetivoTipoEnum>(objetivo.tipo)
  const [plazo, setPlazo] = useState<PlazoEnum>(objetivo.plazo)
  const [estado, setEstado] = useState<ObjetivoEstadoEnum>(objetivo.estado)
  const [peso, setPeso] = useState(String(objetivo.peso))
  const [fechaLimite, setFechaLimite] = useState(objetivo.fecha_limite ?? '')
  const [loading, setLoading] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: objetivo.id })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const dirty =
    titulo.trim() !== objetivo.titulo ||
    tipo !== objetivo.tipo ||
    plazo !== objetivo.plazo ||
    estado !== objetivo.estado ||
    Number(peso) !== objetivo.peso ||
    (fechaLimite || null) !== objetivo.fecha_limite

  async function handleSave() {
    setLoading(true)
    try {
      const input: ObjetivoFormValues = {
        proyecto_id: objetivo.proyecto_id,
        titulo: titulo.trim(),
        descripcion: objetivo.descripcion,
        tipo,
        plazo,
        estado,
        peso: Number(peso),
        fecha_limite: fechaLimite || null,
      }
      await actualizarObjetivo(objetivo.id, input)
      toast.success('Objetivo actualizado')
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
      className="space-y-2 rounded-lg border border-[var(--color-surface-border)] p-2"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Reordenar ${objetivo.titulo}`}
          className="cursor-grab touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          {...(mounted ? attributes : {})}
          {...(mounted ? listeners : {})}
        >
          <GripVertical size={14} />
        </button>
        <Input
          aria-label={`Título de ${objetivo.titulo}`}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="h-7 min-w-0 flex-1 text-sm"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2 pl-6">
        <Select value={tipo} onValueChange={(v) => setTipo(v as ObjetivoTipoEnum)}>
          <SelectTrigger size="sm" aria-label={`Tipo de ${objetivo.titulo}`}>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={plazo} onValueChange={(v) => setPlazo(v as PlazoEnum)}>
          <SelectTrigger size="sm" aria-label={`Plazo de ${objetivo.titulo}`}>
            <SelectValue placeholder="Plazo" />
          </SelectTrigger>
          <SelectContent>
            {PLAZOS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={(v) => setEstado(v as ObjetivoEstadoEnum)}>
          <SelectTrigger size="sm" aria-label={`Estado de ${objetivo.titulo}`}>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {ESTADOS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <Label htmlFor={`peso-${objetivo.id}`} className="text-[11px] text-[var(--color-text-muted)]">
            Peso
          </Label>
          <Input
            id={`peso-${objetivo.id}`}
            type="number"
            min={0}
            max={1000}
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            className="h-7 w-16 tabular-nums"
          />
        </div>
        <div className="flex items-center gap-1">
          <Label htmlFor={`fecha-${objetivo.id}`} className="text-[11px] text-[var(--color-text-muted)]">
            Fecha límite
          </Label>
          <Input
            id={`fecha-${objetivo.id}`}
            type="date"
            value={fechaLimite}
            onChange={(e) => setFechaLimite(e.target.value)}
            className="h-7 w-36 tabular-nums"
          />
        </div>
        <Button
          size="sm"
          className="text-xs"
          disabled={!dirty || loading || !titulo.trim()}
          onClick={handleSave}
        >
          {loading ? '…' : 'Guardar'}
        </Button>
        <ConfirmDialog
          triggerLabel="Eliminar"
          triggerVariant="destructive"
          title="Eliminar objetivo"
          description="Esto elimina en cascada sus actividades. Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await eliminarObjetivo(objetivo.id)
            toast.success('Objetivo eliminado')
            onDone()
          }}
        />
      </div>
    </li>
  )
}

function ObjetivoFormDialog({
  proyectoId,
  plazo,
  triggerLabel,
  title,
  onDone,
}: {
  proyectoId: string
  plazo: PlazoEnum
  triggerLabel: string
  title: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<ObjetivoTipoEnum>('hu')
  const [estado, setEstado] = useState<ObjetivoEstadoEnum>('pendiente')
  const [plazoSel, setPlazoSel] = useState<PlazoEnum>(plazo)

  function reset() {
    setTipo('hu')
    setEstado('pendiente')
    setPlazoSel(plazo)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pesoRaw = String(fd.get('peso') ?? '').trim()

    const input: ObjetivoFormValues = {
      proyecto_id: proyectoId,
      titulo: String(fd.get('titulo') ?? '').trim(),
      descripcion: String(fd.get('descripcion') ?? '').trim() || null,
      tipo,
      plazo: plazoSel,
      estado,
      peso: pesoRaw === '' ? 1 : Number(pesoRaw),
      fecha_limite: String(fd.get('fecha_limite') ?? '').trim() || null,
    }

    setLoading(true)
    try {
      await crearObjetivo(input)
      toast.success('Objetivo creado')
      setOpen(false)
      reset()
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
            El peso define cuánto aporta el objetivo al avance del proyecto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" required maxLength={500} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea id="descripcion" name="descripcion" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="objetivo-tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v as ObjetivoTipoEnum)}>
                <SelectTrigger id="objetivo-tipo" className="w-full">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="objetivo-plazo">Plazo</Label>
              <Select value={plazoSel} onValueChange={(v) => setPlazoSel(v as PlazoEnum)}>
                <SelectTrigger id="objetivo-plazo" className="w-full">
                  <SelectValue placeholder="Plazo" />
                </SelectTrigger>
                <SelectContent>
                  {PLAZOS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="objetivo-estado">Estado</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as ObjetivoEstadoEnum)}>
                <SelectTrigger id="objetivo-estado" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="peso">Peso</Label>
              <Input id="peso" name="peso" type="number" min={0} max={1000} defaultValue={1} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fecha_limite">Fecha límite (opcional)</Label>
              <Input id="fecha_limite" name="fecha_limite" type="date" />
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
