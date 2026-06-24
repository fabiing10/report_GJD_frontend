'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Objetivo, ObjetivoTipoEnum, ObjetivoEstadoEnum, PlazoEnum } from '@/types/domain'
import type { ObjetivoFormValues } from '@/lib/schemas'
import {
  crearObjetivo,
  actualizarObjetivo,
  eliminarObjetivo,
} from '@/lib/actions/objetivos'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Field } from '@/components/admin/Field'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

type ObjetivoConContexto = Objetivo & {
  proyecto_nombre: string
  componente_nombre: string
}
interface ProyectoOption {
  id: string
  label: string
}

const TIPOS: { value: ObjetivoTipoEnum; label: string }[] = [
  { value: 'hu', label: 'HU' },
  { value: 'funcionalidad', label: 'Funcionalidad' },
]
const PLAZOS: { value: PlazoEnum; label: string }[] = [
  { value: 'corto', label: 'Corto plazo' },
  { value: 'mediano', label: 'Mediano plazo' },
  { value: 'largo', label: 'Largo plazo' },
]
const ESTADOS: { value: ObjetivoEstadoEnum; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'cumplido', label: 'Cumplido' },
]

const TIPO_LABEL = Object.fromEntries(TIPOS.map((t) => [t.value, t.label])) as Record<ObjetivoTipoEnum, string>
const PLAZO_LABEL = Object.fromEntries(PLAZOS.map((p) => [p.value, p.label])) as Record<PlazoEnum, string>
const ESTADO_LABEL = Object.fromEntries(ESTADOS.map((e) => [e.value, e.label])) as Record<ObjetivoEstadoEnum, string>
const ESTADO_COLOR: Record<ObjetivoEstadoEnum, string> = {
  pendiente: 'var(--color-text-muted)',
  en_progreso: 'var(--color-estado-en-progreso)',
  cumplido: 'var(--color-estado-completado)',
}

function emptyForm(proyectoId: string): ObjetivoFormValues {
  return {
    proyecto_id: proyectoId,
    titulo: '',
    descripcion: null,
    tipo: 'hu',
    plazo: 'corto',
    estado: 'pendiente',
    peso: 1,
    avance: 0,
    fecha_inicio: null,
    fecha_limite: null,
  }
}

interface FormProps {
  proyectos: ProyectoOption[]
  initial: ObjetivoFormValues
  submitLabel: string
  onSubmit: (values: ObjetivoFormValues) => Promise<void>
  onDone: () => void
}

function ObjetivoForm({ proyectos, initial, submitLabel, onSubmit, onDone }: FormProps) {
  const [values, setValues] = useState<ObjetivoFormValues>(initial)
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof ObjetivoFormValues>(key: K, value: ObjetivoFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await onSubmit(values)
      toast.success('Producto guardado')
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Field
        label="Proyecto"
        htmlFor="obj-proyecto"
        description="Proyecto al que pertenece el producto (HU/Funcionalidad)."
        required
      >
        <Select
          value={values.proyecto_id}
          onValueChange={(v) => set('proyecto_id', v as string)}
          items={proyectos.map((p) => ({ value: p.id, label: p.label }))}
        >
          <SelectTrigger id="obj-proyecto" className="w-full">
            <SelectValue placeholder="Selecciona un proyecto" />
          </SelectTrigger>
          <SelectContent>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field
        label="Título"
        htmlFor="obj-titulo"
        description="Nombre del producto / objetivo (p. ej. HU-1 Gestión de Notificaciones)."
        required
      >
        <Input
          id="obj-titulo"
          value={values.titulo}
          onChange={(e) => set('titulo', e.target.value)}
          placeholder="Título del producto"
        />
      </Field>

      <Field
        label="Descripción"
        htmlFor="obj-descripcion"
        description="Detalle opcional del alcance o el criterio de aceptación."
      >
        <Textarea
          id="obj-descripcion"
          value={values.descripcion ?? ''}
          onChange={(e) => set('descripcion', e.target.value || null)}
          placeholder="Detalle opcional"
          rows={3}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="Tipo" htmlFor="obj-tipo" description="Naturaleza del producto.">
          <Select value={values.tipo} onValueChange={(v) => set('tipo', v as ObjetivoTipoEnum)} items={TIPOS}>
            <SelectTrigger id="obj-tipo" className="w-full">
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
        </Field>
        <Field label="Plazo" htmlFor="obj-plazo" description="Horizonte temporal.">
          <Select value={values.plazo} onValueChange={(v) => set('plazo', v as PlazoEnum)} items={PLAZOS}>
            <SelectTrigger id="obj-plazo" className="w-full">
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
        </Field>
        <Field label="Estado" htmlFor="obj-estado" description="Avance actual.">
          <Select value={values.estado} onValueChange={(v) => set('estado', v as ObjetivoEstadoEnum)} items={ESTADOS}>
            <SelectTrigger id="obj-estado" className="w-full">
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
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Avance %"
          htmlFor="obj-avance"
          description="Porcentaje de avance del producto (0–100). Llena la barra del cronograma."
        >
          <Input
            id="obj-avance"
            type="number"
            min={0}
            max={100}
            value={values.avance}
            onChange={(e) => set('avance', Math.max(0, Math.min(100, Number(e.target.value))))}
          />
        </Field>
        <Field
          label="Peso"
          htmlFor="obj-peso"
          description="Cuánto aporta al avance del proyecto (relativo a los demás)."
        >
          <Input
            id="obj-peso"
            type="number"
            min={0}
            max={1000}
            value={values.peso}
            onChange={(e) => set('peso', Number(e.target.value))}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Fecha inicio"
          htmlFor="obj-fecha-inicio"
          description="Inicio del producto. Arranca la barra del cronograma (opcional)."
        >
          <Input
            id="obj-fecha-inicio"
            type="date"
            value={values.fecha_inicio ?? ''}
            onChange={(e) => set('fecha_inicio', e.target.value || null)}
          />
        </Field>
        <Field
          label="Fecha límite"
          htmlFor="obj-fecha"
          description="Meta / fin del producto. Cierra la barra del cronograma (opcional)."
        >
          <Input
            id="obj-fecha"
            type="date"
            value={values.fecha_limite ?? ''}
            onChange={(e) => set('fecha_limite', e.target.value || null)}
          />
        </Field>
      </div>

      <DialogFooter>
        <DialogClose render={<Button variant="outline" size="sm" />}>Cancelar</DialogClose>
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

interface ObjetivosClientProps {
  objetivos: ObjetivoConContexto[]
  proyectos: ProyectoOption[]
}

export function ObjetivosClient({ objetivos, proyectos }: ObjetivosClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [filtroProyecto, setFiltroProyecto] = useState<string>('todos')
  const [filtroPlazo, setFiltroPlazo] = useState<string>('todos')
  const [filtroEstado, setFiltroEstado] = useState<string>('todos')

  const refresh = () => router.refresh()
  const defaultProyecto = proyectos[0]?.id ?? ''

  const visibles = objetivos.filter(
    (o) =>
      (filtroProyecto === 'todos' || o.proyecto_id === filtroProyecto) &&
      (filtroPlazo === 'todos' || o.plazo === filtroPlazo) &&
      (filtroEstado === 'todos' || o.estado === filtroEstado)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
            Productos / Objetivos
          </h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            Las HU y funcionalidades de cada proyecto. Sus actividades se gestionan en Actividades.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<Button size="sm" />} disabled={proyectos.length === 0}>
            + Nuevo producto
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl sm:p-6">
            <DialogHeader>
              <DialogTitle>Nuevo producto</DialogTitle>
              <DialogDescription>
                Un producto es una HU o funcionalidad. El peso define cuánto aporta al avance del
                proyecto.
              </DialogDescription>
            </DialogHeader>
            <ObjetivoForm
              proyectos={proyectos}
              initial={emptyForm(defaultProyecto)}
              submitLabel="Crear"
              onSubmit={(v) => crearObjetivo(v)}
              onDone={() => {
                setCreateOpen(false)
                refresh()
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <Select
          value={filtroProyecto}
          onValueChange={(v) => setFiltroProyecto(v as string)}
          items={[{ value: 'todos', label: 'Todos los proyectos' }, ...proyectos.map((p) => ({ value: p.id, label: p.label }))]}
        >
          <SelectTrigger size="sm" className="w-56">
            <SelectValue placeholder="Proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los proyectos</SelectItem>
            {proyectos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtroPlazo}
          onValueChange={(v) => setFiltroPlazo(v as string)}
          items={[{ value: 'todos', label: 'Todos los plazos' }, ...PLAZOS]}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue placeholder="Plazo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los plazos</SelectItem>
            {PLAZOS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filtroEstado}
          onValueChange={(v) => setFiltroEstado(v as string)}
          items={[{ value: 'todos', label: 'Todos los estados' }, ...ESTADOS]}
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
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent" style={{ borderColor: 'var(--color-surface-border)' }}>
              {['Componente', 'Proyecto', 'Producto', 'Tipo', 'Plazo', 'Estado', 'Avance', 'Inicio', 'Fin', 'Peso'].map((h) => (
                <TableHead
                  key={h}
                  className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]"
                >
                  {h}
                </TableHead>
              ))}
              <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="px-3 py-8 text-center text-xs text-[var(--color-text-muted)]">
                  Sin productos
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((o) => (
                <TableRow key={o.id} className="hover:bg-white/[0.02]" style={{ borderColor: 'var(--color-surface-border)' }}>
                  <TableCell className="px-3 py-2.5 text-[var(--color-text-muted)]">
                    {o.componente_nombre}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[var(--color-text-secondary)]">
                    {o.proyecto_nombre}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 whitespace-normal text-[var(--color-text-primary)]">
                    {o.titulo}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-[var(--color-text-muted)]">{TIPO_LABEL[o.tipo]}</TableCell>
                  <TableCell className="px-3 py-2.5 text-[var(--color-text-muted)]">{PLAZO_LABEL[o.plazo]}</TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: 'rgba(255,255,255,0.06)', color: ESTADO_COLOR[o.estado] }}
                    >
                      {ESTADO_LABEL[o.estado]}
                    </span>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums font-medium text-[var(--color-text-secondary)]">
                    {o.avance}%
                  </TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums text-[var(--color-text-muted)]">
                    {o.fecha_inicio ?? '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums text-[var(--color-text-muted)]">
                    {o.fecha_limite ?? '—'}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums text-[var(--color-text-muted)]">{o.peso}</TableCell>
                  <TableCell className="px-3 py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Dialog open={editId === o.id} onOpenChange={(open) => setEditId(open ? o.id : null)}>
                        <DialogTrigger render={<Button variant="ghost" size="sm" className="text-xs" />}>
                          Editar
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl sm:p-6">
                          <DialogHeader>
                            <DialogTitle>Editar producto</DialogTitle>
                          </DialogHeader>
                          <ObjetivoForm
                            proyectos={proyectos}
                            initial={{
                              proyecto_id: o.proyecto_id,
                              titulo: o.titulo,
                              descripcion: o.descripcion,
                              tipo: o.tipo,
                              plazo: o.plazo,
                              estado: o.estado,
                              peso: o.peso,
                              avance: o.avance,
                              fecha_inicio: o.fecha_inicio,
                              fecha_limite: o.fecha_limite,
                            }}
                            submitLabel="Guardar"
                            onSubmit={(v) => actualizarObjetivo(o.id, v)}
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
                        title={`¿Eliminar "${o.titulo}"?`}
                        description="Esto elimina en cascada sus actividades. Esta acción no se puede deshacer."
                        confirmLabel="Eliminar"
                        onConfirm={async () => {
                          await eliminarObjetivo(o.id)
                          toast.success('Producto eliminado')
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
