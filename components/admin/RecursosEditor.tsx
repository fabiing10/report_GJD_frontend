'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Pencil } from 'lucide-react'
import type { ProyectoRecurso } from '@/types/domain'
import type { RecursoFormValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  crearRecurso,
  actualizarRecurso,
  eliminarRecurso,
} from '@/lib/actions/recursos'

type RecursoTipo = ProyectoRecurso['tipo']

const TIPO_LABEL: Record<RecursoTipo, string> = {
  video_url: 'Video',
  imagen: 'Imagen',
  link: 'Link',
}

interface Props {
  recursos: ProyectoRecurso[]
  proyectoId: string
}

export function RecursosEditor({ recursos, proyectoId }: Props) {
  const router = useRouter()

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Recursos
        </h2>
        <RecursoFormDialog
          proyectoId={proyectoId}
          triggerLabel="+ recurso"
          title="Nuevo recurso"
          onDone={() => router.refresh()}
        />
      </div>

      {recursos.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Sin recursos todavía.
        </p>
      ) : (
        <ul className="space-y-2">
          {recursos.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{
                background: 'var(--color-surface-card)',
                borderColor: 'var(--color-surface-border)',
              }}
            >
              <span className="w-14 shrink-0 text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">
                {TIPO_LABEL[r.tipo]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {r.titulo ?? '(sin título)'}
                </p>
                <p className="truncate text-[11px] text-[var(--color-text-muted)]">
                  {r.url}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <RecursoFormDialog
                  proyectoId={proyectoId}
                  recurso={r}
                  triggerLabel="Editar"
                  triggerIcon={<Pencil size={13} />}
                  title="Editar recurso"
                  onDone={() => router.refresh()}
                />
                <ConfirmDialog
                  triggerLabel="Eliminar"
                  triggerVariant="destructive"
                  title="Eliminar recurso"
                  description="Esta acción no se puede deshacer."
                  confirmLabel="Eliminar"
                  onConfirm={async () => {
                    await eliminarRecurso(r.id)
                    toast.success('Recurso eliminado')
                    router.refresh()
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecursoFormDialog({
  proyectoId,
  recurso,
  triggerLabel,
  triggerIcon,
  title,
  onDone,
}: {
  proyectoId: string
  recurso?: ProyectoRecurso
  triggerLabel: string
  triggerIcon?: React.ReactNode
  title: string
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tipo, setTipo] = useState<RecursoTipo>(recurso?.tipo ?? 'link')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const input: RecursoFormValues = {
      proyecto_id: proyectoId,
      tipo,
      titulo: String(fd.get('titulo') ?? '').trim() || null,
      url: String(fd.get('url') ?? '').trim(),
      thumbnail_url: String(fd.get('thumbnail_url') ?? '').trim() || null,
      duracion_segundos: recurso?.duracion_segundos ?? null,
    }

    setLoading(true)
    try {
      if (recurso) {
        await actualizarRecurso(recurso.id, input)
        toast.success('Recurso actualizado')
      } else {
        await crearRecurso(input)
        toast.success('Recurso creado')
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
          <Button variant={recurso ? 'ghost' : 'outline'} size="sm" className="text-xs" />
        }
      >
        {triggerIcon}
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Video, imagen o link asociado al proyecto.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="recurso-tipo">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as RecursoTipo)}>
              <SelectTrigger id="recurso-tipo" className="w-full">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video_url">Video</SelectItem>
                <SelectItem value="imagen">Imagen</SelectItem>
                <SelectItem value="link">Link</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" name="titulo" defaultValue={recurso?.titulo ?? ''} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="url">URL</Label>
            <Input id="url" name="url" defaultValue={recurso?.url ?? ''} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="thumbnail_url">Thumbnail (opcional)</Label>
            <Input
              id="thumbnail_url"
              name="thumbnail_url"
              defaultValue={recurso?.thumbnail_url ?? ''}
            />
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
