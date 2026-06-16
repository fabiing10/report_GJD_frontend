'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import type { Componente, EstadoEnum, ProyectoConAvance } from '@/types/domain'
import type { ProyectoFormValues } from '@/lib/schemas'
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
import { crearProyecto, actualizarProyecto, eliminarProyecto } from '@/lib/actions/proyectos'

export interface ProyectoGrupo {
  componente: Componente
  proyectos: ProyectoConAvance[]
}

interface Props {
  grupos: ProyectoGrupo[]
}

const ESTADOS: { value: EstadoEnum; label: string }[] = [
  { value: 'no_iniciado', label: 'No iniciado' },
  { value: 'refinamiento', label: 'Refinamiento' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'bloqueado', label: 'Bloqueado' },
  { value: 'completado', label: 'Completado' },
]

const ESTADO_LABEL: Record<EstadoEnum, string> = {
  no_iniciado: 'No iniciado',
  refinamiento: 'Refinamiento',
  en_progreso: 'En progreso',
  bloqueado: 'Bloqueado',
  completado: 'Completado',
}

const ESTADO_VAR: Record<EstadoEnum, string> = {
  no_iniciado: 'var(--color-estado-no-iniciado)',
  refinamiento: 'var(--color-estado-refinamiento)',
  en_progreso: 'var(--color-estado-en-progreso)',
  bloqueado: 'var(--color-estado-bloqueado)',
  completado: 'var(--color-estado-completado)',
}

export function ProyectosClient({ grupos }: Props) {
  const router = useRouter()
  const [filtro, setFiltro] = useState<string>('all')

  const visibles = useMemo(
    () => (filtro === 'all' ? grupos : grupos.filter((g) => g.componente.id === filtro)),
    [grupos, filtro]
  )

  if (grupos.length === 0) {
    return (
      <div
        className="rounded-xl p-6 border text-sm text-[var(--color-text-muted)]"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        Sin componentes todavía. Crea componentes antes de gestionar proyectos.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-muted)]">Componente</span>
          <Select value={filtro} onValueChange={(v) => setFiltro(v ?? 'all')}>
            <SelectTrigger className="min-w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {grupos.map((g) => (
                <SelectItem key={g.componente.id} value={g.componente.id}>
                  {g.componente.icono} {g.componente.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visibles.map((grupo) => (
        <section
          key={grupo.componente.id}
          className="rounded-xl border p-4 space-y-3"
          style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="text-lg" aria-hidden>
                {grupo.componente.icono}
              </span>
              <h2 className="truncate text-sm font-semibold text-[var(--color-text-primary)]">
                {grupo.componente.nombre}
              </h2>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {grupo.proyectos.length} proyecto{grupo.proyectos.length === 1 ? '' : 's'}
              </span>
            </div>
            <ProyectoFormDialog
              componenteId={grupo.componente.id}
              triggerLabel="+ Nuevo proyecto"
              title="Nuevo proyecto"
              onDone={() => router.refresh()}
            />
          </div>

          {grupo.proyectos.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)]">
              Sin proyectos en este componente.
            </p>
          ) : (
            <ul className="space-y-2">
              {grupo.proyectos.map((p) => (
                <ProyectoRow
                  key={p.id}
                  proyecto={p}
                  componenteId={grupo.componente.id}
                  onDone={() => router.refresh()}
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

function ProyectoRow({
  proyecto,
  componenteId,
  onDone,
}: {
  proyecto: ProyectoConAvance
  componenteId: string
  onDone: () => void
}) {
  return (
    <li
      className="flex items-center gap-3 rounded-lg border p-3"
      style={{ borderColor: 'var(--color-surface-border)' }}
    >
      <Link
        href={`/admin/proyectos/${proyecto.id}`}
        className="group flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-alcaldia-naranja)]">
              {proyecto.nombre}
            </p>
            {proyecto.codigo && (
              <span className="shrink-0 rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-[var(--color-text-muted)]">
                {proyecto.codigo}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-[var(--color-text-muted)]">{proyecto.slug}</p>
        </div>

        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: ESTADO_VAR[proyecto.estado] }}
        >
          {ESTADO_LABEL[proyecto.estado]}
        </span>

        <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-[var(--color-text-secondary)]">
          {Math.round(proyecto.avance_calculado)}%
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <ProyectoFormDialog
          componenteId={componenteId}
          proyecto={proyecto}
          triggerLabel="Editar"
          triggerIcon={<Pencil size={13} />}
          title="Editar proyecto"
          onDone={onDone}
        />
        <ConfirmDialog
          triggerLabel="Eliminar"
          triggerVariant="destructive"
          title={`Eliminar "${proyecto.nombre}"`}
          description="Esto elimina en cascada sus plazos, criterios y actividades. Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={async () => {
            await eliminarProyecto(proyecto.id)
            toast.success('Proyecto eliminado')
            onDone()
          }}
        />
      </div>
    </li>
  )
}

function ProyectoFormDialog({
  componenteId,
  proyecto,
  triggerLabel,
  triggerIcon,
  title,
  onDone,
}: {
  componenteId: string
  proyecto?: ProyectoConAvance
  triggerLabel: string
  triggerIcon?: React.ReactNode
  title: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [estado, setEstado] = useState<EstadoEnum>(proyecto?.estado ?? 'no_iniciado')

  function nullify(value: FormDataEntryValue | null): string | null {
    const v = String(value ?? '').trim()
    return v === '' ? null : v
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const avanceRaw = String(fd.get('avance_override') ?? '').trim()

    const input: ProyectoFormValues = {
      componente_id: componenteId,
      slug: String(fd.get('slug') ?? '').trim(),
      codigo: nullify(fd.get('codigo')),
      nombre: String(fd.get('nombre') ?? '').trim(),
      descripcion_corta: nullify(fd.get('descripcion_corta')),
      descripcion_larga: nullify(fd.get('descripcion_larga')),
      estado,
      responsable: nullify(fd.get('responsable')),
      fecha_inicio: nullify(fd.get('fecha_inicio')),
      fecha_fin: nullify(fd.get('fecha_fin')),
      avance_override: avanceRaw === '' ? null : Number(avanceRaw),
    }

    setLoading(true)
    try {
      if (proyecto) {
        await actualizarProyecto(proyecto.id, input)
        toast.success('Proyecto actualizado')
      } else {
        await crearProyecto(input)
        toast.success('Proyecto creado')
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
        render={<Button variant={proyecto ? 'ghost' : 'outline'} size="sm" className="text-xs" />}
      >
        {triggerIcon}
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define los datos del proyecto. El avance se calcula a partir de sus criterios salvo que
            se fije un override.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" name="nombre" defaultValue={proyecto?.nombre ?? ''} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={proyecto?.slug ?? ''} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="codigo">Código</Label>
              <Input id="codigo" name="codigo" defaultValue={proyecto?.codigo ?? ''} placeholder="PRY-001" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="descripcion_corta">Descripción corta</Label>
              <Input
                id="descripcion_corta"
                name="descripcion_corta"
                defaultValue={proyecto?.descripcion_corta ?? ''}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="descripcion_larga">Descripción larga</Label>
              <Textarea
                id="descripcion_larga"
                name="descripcion_larga"
                defaultValue={proyecto?.descripcion_larga ?? ''}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="estado-trigger">Estado</Label>
              <Select value={estado} onValueChange={(v) => v && setEstado(v as EstadoEnum)}>
                <SelectTrigger id="estado-trigger" className="w-full">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="responsable">Responsable</Label>
              <Input
                id="responsable"
                name="responsable"
                defaultValue={proyecto?.responsable ?? ''}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fecha_inicio">Fecha inicio</Label>
              <Input
                id="fecha_inicio"
                name="fecha_inicio"
                type="date"
                defaultValue={proyecto?.fecha_inicio ?? ''}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fecha_fin">Fecha fin</Label>
              <Input
                id="fecha_fin"
                name="fecha_fin"
                type="date"
                defaultValue={proyecto?.fecha_fin ?? ''}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="avance_override">Avance % (opcional)</Label>
              <Input
                id="avance_override"
                name="avance_override"
                type="number"
                min={0}
                max={100}
                defaultValue={proyecto?.avance_override ?? ''}
                placeholder="auto"
              />
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
