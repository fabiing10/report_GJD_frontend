'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Actividad, ActividadTipoEnum, ActividadEstadoEnum } from '@/types/domain'
import type { ActividadFormValues } from '@/lib/schemas'
import {
  crearActividad,
  actualizarActividad,
  eliminarActividad,
} from '@/lib/actions/actividades'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

type ActividadConProyecto = Actividad & { proyecto_nombre: string }
interface ProyectoOption {
  id: string
  nombre: string
}

const TIPOS: { value: ActividadTipoEnum; label: string }[] = [
  { value: 'reunion', label: 'Reunión' },
  { value: 'tarea', label: 'Tarea' },
  { value: 'investigacion', label: 'Investigación' },
  { value: 'informe', label: 'Informe' },
]

const ESTADOS: { value: ActividadEstadoEnum; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'completada', label: 'Completada' },
]

const TIPO_LABEL: Record<ActividadTipoEnum, string> = Object.fromEntries(
  TIPOS.map((t) => [t.value, t.label])
) as Record<ActividadTipoEnum, string>
const ESTADO_LABEL: Record<ActividadEstadoEnum, string> = Object.fromEntries(
  ESTADOS.map((e) => [e.value, e.label])
) as Record<ActividadEstadoEnum, string>

const ESTADO_COLOR: Record<ActividadEstadoEnum, string> = {
  pendiente: 'var(--color-text-muted)',
  en_progreso: 'var(--color-estado-en-progreso)',
  completada: 'var(--color-estado-completado)',
}

function emptyForm(proyectoId: string): ActividadFormValues {
  return {
    proyecto_id: proyectoId,
    proyecto_plazo_id: null,
    tipo: 'tarea',
    titulo: '',
    descripcion: null,
    fecha: null,
    estado: 'pendiente',
    responsable: null,
  }
}

interface FormProps {
  proyectos: ProyectoOption[]
  initial: ActividadFormValues
  submitLabel: string
  onSubmit: (values: ActividadFormValues) => Promise<void>
  onDone: () => void
}

function ActividadForm({
  proyectos,
  initial,
  submitLabel,
  onSubmit,
  onDone,
}: FormProps) {
  const [values, setValues] = useState<ActividadFormValues>(initial)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof ActividadFormValues>(
    key: K,
    value: ActividadFormValues[K]
  ) => setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit(values)
      toast.success('Actividad guardada')
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="act-proyecto">Proyecto</Label>
        <Select
          value={values.proyecto_id}
          onValueChange={(v) => set('proyecto_id', v as string)}
        >
          <SelectTrigger id="act-proyecto" className="w-full">
            <SelectValue placeholder="Selecciona un proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="act-tipo">Tipo</Label>
          <Select
            value={values.tipo}
            onValueChange={(v) => set('tipo', v as ActividadTipoEnum)}
          >
            <SelectTrigger id="act-tipo" className="w-full">
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
        <div className="grid gap-1.5">
          <Label htmlFor="act-estado">Estado</Label>
          <Select
            value={values.estado}
            onValueChange={(v) => set('estado', v as ActividadEstadoEnum)}
          >
            <SelectTrigger id="act-estado" className="w-full">
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
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="act-titulo">Título</Label>
        <Input
          id="act-titulo"
          value={values.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          placeholder="Título de la actividad"
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="act-descripcion">Descripción</Label>
        <Textarea
          id="act-descripcion"
          value={values.descripcion ?? ''}
          onChange={(e) => set('descripcion', e.target.value || null)}
          placeholder="Detalle opcional"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="act-fecha">Fecha</Label>
          <Input
            id="act-fecha"
            type="date"
            value={values.fecha ?? ''}
            onChange={(e) => set('fecha', e.target.value || null)}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="act-responsable">Responsable</Label>
          <Input
            id="act-responsable"
            value={values.responsable ?? ''}
            onChange={(e) => set('responsable', e.target.value || null)}
            placeholder="Nombre"
          />
        </div>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>
          Cancelar
        </DialogClose>
        <Button
          size="sm"
          disabled={saving || !values.proyecto_id || !values.titulo.trim()}
          onClick={handleSubmit}
        >
          {saving ? '…' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  )
}

interface ActividadesClientProps {
  actividades: ActividadConProyecto[]
  proyectos: ProyectoOption[]
}

export function ActividadesClient({
  actividades,
  proyectos,
}: ActividadesClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  const refresh = () => router.refresh()
  const defaultProyecto = proyectos[0]?.id ?? ''

  const visibles = actividades.filter(
    (a) =>
      (filtroTipo === 'todos' || a.tipo === filtroTipo) &&
      (filtroEstado === 'todos' || a.estado === filtroEstado)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
          Actividades
        </h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            + Nueva actividad
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva actividad</DialogTitle>
            </DialogHeader>
            <ActividadForm
              proyectos={proyectos}
              initial={emptyForm(defaultProyecto)}
              submitLabel="Crear"
              onSubmit={(v) => crearActividad(v)}
              onDone={() => {
                setCreateOpen(false)
                refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as string)}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {TIPOS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtroEstado}
          onValueChange={(v) => setFiltroEstado(v as string)}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{
          background: 'var(--color-surface-card)',
          borderColor: 'var(--color-surface-border)',
        }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Proyecto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-xs text-[var(--color-text-muted)] py-8"
                >
                  Sin actividades
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="text-[var(--color-text-secondary)]">
                    {a.proyecto_nombre}
                  </TableCell>
                  <TableCell className="text-[var(--color-text-muted)]">
                    {TIPO_LABEL[a.tipo]}
                  </TableCell>
                  <TableCell className="text-[var(--color-text-primary)] whitespace-normal">
                    {a.titulo}
                  </TableCell>
                  <TableCell className="text-[var(--color-text-muted)] tabular-nums">
                    {a.fecha ?? '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-xs font-medium"
                      style={{ color: ESTADO_COLOR[a.estado] }}
                    >
                      {ESTADO_LABEL[a.estado]}
                    </span>
                  </TableCell>
                  <TableCell className="text-[var(--color-text-muted)]">
                    {a.responsable ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Dialog
                        open={editId === a.id}
                        onOpenChange={(o) => setEditId(o ? a.id : null)}
                      >
                        <DialogTrigger
                          render={<Button variant="ghost" size="sm" className="text-xs" />}
                        >
                          Editar
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar actividad</DialogTitle>
                          </DialogHeader>
                          <ActividadForm
                            proyectos={proyectos}
                            initial={{
                              proyecto_id: a.proyecto_id,
                              proyecto_plazo_id: a.proyecto_plazo_id,
                              tipo: a.tipo,
                              titulo: a.titulo,
                              descripcion: a.descripcion,
                              fecha: a.fecha,
                              estado: a.estado,
                              responsable: a.responsable,
                            }}
                            submitLabel="Guardar"
                            onSubmit={(v) => actualizarActividad(a.id, v)}
                            onDone={() => {
                              setEditId(null)
                              refresh()
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                      <ConfirmDialog
                        triggerLabel="Eliminar"
                        triggerVariant="destructive"
                        title="¿Eliminar actividad?"
                        description="Esta acción no se puede deshacer."
                        confirmLabel="Eliminar"
                        onConfirm={async () => {
                          await eliminarActividad(a.id)
                          toast.success('Actividad eliminada')
                          refresh()
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
