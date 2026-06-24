'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { InformeConAvance } from '@/types/domain'
import { informeSchema, type InformeFormValues } from '@/lib/schemas'
import {
  crearInforme,
  actualizarInforme,
  eliminarInforme,
  activarInforme,
  duplicarInforme,
} from '@/lib/actions/informes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/admin/Field'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'

interface InformesClientProps {
  informes: InformeConAvance[]
}

export function InformesClient({ informes }: InformesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
            Informes
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {informes.length} informe{informes.length === 1 ? '' : 's'}
          </p>
        </div>
        <InformeFormDialog mode="create" triggerLabel="+ Nuevo informe" />
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
            <TableRow
              className="hover:bg-transparent"
              style={{ borderColor: 'var(--color-surface-border)' }}
            >
              <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Título
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Fecha corte
              </TableHead>
              <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Activo
              </TableHead>
              <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Avance global
              </TableHead>
              <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {informes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="px-3 py-8 text-center text-xs text-[var(--color-text-muted)]"
                >
                  No hay informes. Crea el primero.
                </TableCell>
              </TableRow>
            ) : (
              informes.map((informe) => (
                <InformeRow key={informe.id} informe={informe} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function InformeRow({ informe }: { informe: InformeConAvance }) {
  const router = useRouter()

  const run = async (fn: () => Promise<void>, okMsg: string) => {
    try {
      await fn()
      toast.success(okMsg)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    }
  }

  return (
    <TableRow
      className="hover:bg-white/[0.02]"
      style={{ borderColor: 'var(--color-surface-border)' }}
    >
      <TableCell className="px-3 py-2.5 font-medium text-[var(--color-text-primary)]">
        <div>{informe.titulo}</div>
        {informe.subtitulo && (
          <div className="text-xs text-[var(--color-text-muted)]">
            {informe.subtitulo}
          </div>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5 text-xs tabular-nums text-[var(--color-text-muted)]">
        {informe.fecha_corte}
      </TableCell>
      <TableCell className="px-3 py-2.5">
        {informe.is_active ? (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium text-emerald-400"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            Activo
          </span>
        ) : (
          <span className="text-[10px] text-[var(--color-text-muted)]">—</span>
        )}
      </TableCell>
      <TableCell className="px-3 py-2.5 text-right tabular-nums text-[var(--color-text-primary)]">
        {Math.round(informe.avance_global_calculado)}%
      </TableCell>
      <TableCell className="px-3 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <InformeFormDialog
            mode="edit"
            triggerLabel="Editar"
            informe={informe}
          />
          {!informe.is_active && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() =>
                run(() => activarInforme(informe.id), 'Informe activado')
              }
            >
              Activar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() =>
              run(() => duplicarInforme(informe.id), 'Informe duplicado')
            }
          >
            Duplicar
          </Button>
          <ConfirmDialog
            triggerLabel="Eliminar"
            triggerVariant="destructive"
            title="¿Eliminar informe?"
            description="Esto borra el informe junto con sus componentes, proyectos, plazos, criterios y recursos en cascada. No se puede deshacer."
            confirmLabel="Eliminar"
            onConfirm={() =>
              run(() => eliminarInforme(informe.id), 'Informe eliminado')
            }
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

interface InformeFormDialogProps {
  mode: 'create' | 'edit'
  triggerLabel: string
  informe?: InformeConAvance
}

function InformeFormDialog({
  mode,
  triggerLabel,
  informe,
}: InformeFormDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [titulo, setTitulo] = useState(informe?.titulo ?? '')
  const [subtitulo, setSubtitulo] = useState(informe?.subtitulo ?? '')
  const [fechaCorte, setFechaCorte] = useState(informe?.fecha_corte ?? '')
  const [avance, setAvance] = useState(
    informe?.avance_global_override != null
      ? String(informe.avance_global_override)
      : ''
  )

  const reset = () => {
    setTitulo(informe?.titulo ?? '')
    setSubtitulo(informe?.subtitulo ?? '')
    setFechaCorte(informe?.fecha_corte ?? '')
    setAvance(
      informe?.avance_global_override != null
        ? String(informe.avance_global_override)
        : ''
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const values: InformeFormValues = informeSchema.parse({
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim() === '' ? null : subtitulo.trim(),
        fecha_corte: fechaCorte,
        avance_global_override: avance.trim() === '' ? null : Number(avance),
      })
      if (mode === 'create') {
        await crearInforme(values)
        toast.success('Informe creado')
      } else if (informe) {
        await actualizarInforme(informe.id, values)
        toast.success('Informe actualizado')
      }
      setOpen(false)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Datos inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button
            variant={mode === 'create' ? 'default' : 'ghost'}
            size="sm"
            className="text-xs"
          />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Nuevo informe' : 'Editar informe'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <Field
            label="Título"
            htmlFor="inf-titulo"
            description="Cómo aparece el informe en el listado."
            required
          >
            <Input
              id="inf-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Informe de gestión 2026"
            />
          </Field>
          <Field
            label="Subtítulo"
            htmlFor="inf-subtitulo"
            description="Texto secundario opcional, p. ej. el periodo."
          >
            <Input
              id="inf-subtitulo"
              value={subtitulo}
              onChange={(e) => setSubtitulo(e.target.value)}
              placeholder="Opcional"
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Fecha de corte"
              htmlFor="inf-fecha"
              description="Fecha a la que corresponden los datos."
            >
              <Input
                id="inf-fecha"
                type="date"
                value={fechaCorte}
                onChange={(e) => setFechaCorte(e.target.value)}
              />
            </Field>
            <Field
              label="Avance global override (%)"
              htmlFor="inf-avance"
              description="Vacío = se calcula desde los proyectos."
            >
              <Input
                id="inf-avance"
                type="number"
                min={0}
                max={100}
                value={avance}
                onChange={(e) => setAvance(e.target.value)}
                placeholder="Opcional — se calcula si se deja vacío"
              />
            </Field>
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button
            size="sm"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? '…' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
