'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { ProyectoDetalle, EstadoEnum } from '@/types/domain'
import type { ProyectoFormValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Field, FormSection } from '@/components/admin/Field'
import { actualizarProyecto } from '@/lib/actions/proyectos'
import { crearPlazo } from '@/lib/actions/plazos'
import { PlazoCriterios } from '@/components/admin/PlazoCriterios'
import { RecursosEditor } from '@/components/admin/RecursosEditor'

type PlazoKind = 'corto' | 'mediano' | 'largo'

const PLAZO_KINDS: PlazoKind[] = ['corto', 'mediano', 'largo']

const PLAZO_LABEL: Record<PlazoKind, string> = {
  corto: 'Corto plazo',
  mediano: 'Mediano plazo',
  largo: 'Largo plazo',
}

const ESTADOS: { value: EstadoEnum; label: string }[] = [
  { value: 'no_iniciado', label: 'No iniciado' },
  { value: 'refinamiento', label: 'Refinamiento' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'bloqueado', label: 'Bloqueado' },
  { value: 'completado', label: 'Completado' },
]

const cardStyle = {
  background: 'var(--color-surface-card)',
  borderColor: 'var(--color-surface-border)',
}

interface Props {
  proyecto: ProyectoDetalle
}

export function ProyectoEditor({ proyecto }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
            {proyecto.nombre}
          </h1>
          {proyecto.codigo && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{proyecto.codigo}</p>
          )}
        </div>
        <div
          className="rounded-xl px-4 py-2 border text-right"
          style={cardStyle}
        >
          <p className="text-[10px] text-[var(--color-text-muted)]">Avance</p>
          <p
            className="text-2xl font-display font-bold tabular-nums"
            style={{ color: 'var(--color-alcaldia-naranja)' }}
          >
            {Math.round(proyecto.avance_calculado)}%
          </p>
        </div>
      </div>

      <DatosSection
        key={proyecto.updated_at}
        proyecto={proyecto}
        onDone={() => router.refresh()}
      />

      <PlazosSection proyecto={proyecto} onDone={() => router.refresh()} />

      <div className="rounded-xl p-4 border" style={cardStyle}>
        <RecursosEditor recursos={proyecto.recursos} proyectoId={proyecto.id} />
      </div>
    </div>
  )
}

function DatosSection({
  proyecto,
  onDone,
}: {
  proyecto: ProyectoDetalle
  onDone: () => void
}) {
  const [estado, setEstado] = useState<EstadoEnum>(proyecto.estado)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const str = (k: string) => String(fd.get(k) ?? '').trim()
    const nullable = (k: string) => str(k) || null
    const avanceRaw = str('avance_override')

    const input: ProyectoFormValues = {
      componente_id: proyecto.componente_id,
      slug: str('slug'),
      codigo: nullable('codigo'),
      nombre: str('nombre'),
      descripcion_corta: nullable('descripcion_corta'),
      descripcion_larga: nullable('descripcion_larga'),
      estado,
      responsable: nullable('responsable'),
      fecha_inicio: nullable('fecha_inicio'),
      fecha_fin: nullable('fecha_fin'),
      avance_override: avanceRaw === '' ? null : Number(avanceRaw),
    }

    setLoading(true)
    try {
      await actualizarProyecto(proyecto.id, input)
      toast.success('Proyecto actualizado')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormSection
      title="Datos del proyecto"
      description="Identidad y metadatos. El avance se calcula desde los criterios salvo que fijes un override."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Nombre" htmlFor="nombre" required description="Cómo aparece el proyecto en el reporte.">
          <Input id="nombre" name="nombre" defaultValue={proyecto.nombre} required />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Slug" htmlFor="slug" required description="Identificador en la URL. Solo minúsculas y guiones.">
            <Input id="slug" name="slug" defaultValue={proyecto.slug} required />
          </Field>
          <Field label="Código" htmlFor="codigo" description="Referencia corta, p. ej. HU-1.">
            <Input id="codigo" name="codigo" defaultValue={proyecto.codigo ?? ''} placeholder="HU-1" />
          </Field>
        </div>

        <Field label="Descripción corta" htmlFor="descripcion_corta" description="Resumen de una línea para las tarjetas.">
          <Input
            id="descripcion_corta"
            name="descripcion_corta"
            defaultValue={proyecto.descripcion_corta ?? ''}
          />
        </Field>

        <Field label="Descripción larga" htmlFor="descripcion_larga" description="Contexto completo que se muestra en el detalle del proyecto.">
          <Textarea
            id="descripcion_larga"
            name="descripcion_larga"
            defaultValue={proyecto.descripcion_larga ?? ''}
            rows={4}
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Estado" htmlFor="estado" description="Etapa actual del proyecto.">
            <Select value={estado} onValueChange={(v) => setEstado(v as EstadoEnum)}>
              <SelectTrigger id="estado" className="w-full">
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
          </Field>
          <Field label="Responsable" htmlFor="responsable" description="Persona o área a cargo.">
            <Input id="responsable" name="responsable" defaultValue={proyecto.responsable ?? ''} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Field label="Fecha inicio" htmlFor="fecha_inicio">
            <Input id="fecha_inicio" name="fecha_inicio" type="date" defaultValue={proyecto.fecha_inicio ?? ''} />
          </Field>
          <Field label="Fecha fin" htmlFor="fecha_fin">
            <Input id="fecha_fin" name="fecha_fin" type="date" defaultValue={proyecto.fecha_fin ?? ''} />
          </Field>
          <Field label="Avance %" htmlFor="avance_override" description="Vacío = automático por criterios.">
            <Input
              id="avance_override"
              name="avance_override"
              type="number"
              min={0}
              max={100}
              defaultValue={proyecto.avance_override ?? ''}
              placeholder="auto"
            />
          </Field>
        </div>

        <div className="flex justify-end border-t pt-4" style={{ borderColor: 'var(--color-surface-border)' }}>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? 'Guardando…' : 'Guardar datos'}
          </Button>
        </div>
      </form>
    </FormSection>
  )
}

function PlazosSection({
  proyecto,
  onDone,
}: {
  proyecto: ProyectoDetalle
  onDone: () => void
}) {
  const [loading, setLoading] = useState(false)
  const existentes = new Set(proyecto.plazos.map((p) => p.plazo))
  const faltantes = PLAZO_KINDS.filter((k) => !existentes.has(k))

  async function handleAdd(kind: PlazoKind) {
    setLoading(true)
    try {
      await crearPlazo({
        proyecto_id: proyecto.id,
        plazo: kind,
        fecha_inicio: null,
        fecha_fin: null,
        avance_override: null,
      })
      toast.success('Plazo creado')
      onDone()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al crear plazo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          Plazos
        </h2>
        {faltantes.length > 0 && (
          <div className="w-44">
            <Select
              value=""
              disabled={loading}
              onValueChange={(v) => handleAdd(v as PlazoKind)}
            >
              <SelectTrigger className="w-full" aria-label="Agregar plazo">
                <SelectValue placeholder="+ plazo" />
              </SelectTrigger>
              <SelectContent>
                {faltantes.map((k) => (
                  <SelectItem key={k} value={k}>
                    {PLAZO_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {proyecto.plazos.length === 0 ? (
        <p className="text-xs text-[var(--color-text-muted)]">
          Sin plazos todavía. Agrega uno con el selector.
        </p>
      ) : (
        <div className="space-y-3">
          {proyecto.plazos.map((p) => (
            <PlazoCriterios key={p.id} plazo={p} proyectoId={proyecto.id} />
          ))}
        </div>
      )}
    </section>
  )
}
