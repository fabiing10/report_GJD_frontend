'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BulletRepeater } from './BulletRepeater'
import { RecursoRepeater } from './RecursoRepeater'
import { saveProyectoAction, upsertRecursosAction } from '@/lib/actions/proyectos'
import type { ProyectoDetalle, ComponenteConAvance, EstadoEnum, PlazoEnum, RecursoTipoEnum } from '@/types/domain'

type RecursoInput = { tipo: RecursoTipoEnum; titulo: string | null; url: string; thumbnail_url: string | null; orden: number; duracion_segundos: number | null }

interface Props {
  proyecto: ProyectoDetalle
  componentes: ComponenteConAvance[]
}

const ESTADOS: EstadoEnum[] = ['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']
const PLAZOS: PlazoEnum[] = ['corto', 'mediano', 'largo']

export function ProyectoForm({ proyecto, componentes }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState({
    componente_id: proyecto.componente_id,
    slug: proyecto.slug,
    codigo: proyecto.codigo ?? '',
    nombre: proyecto.nombre,
    descripcion_corta: proyecto.descripcion_corta ?? '',
    descripcion_larga: proyecto.descripcion_larga ?? '',
    plazo: proyecto.plazo,
    estado: proyecto.estado,
    avance: proyecto.avance,
    responsable: proyecto.responsable ?? '',
    fecha_entrega: proyecto.fecha_entrega ?? '',
    fecha_entrega_texto: proyecto.fecha_entrega_texto ?? '',
    orden: proyecto.orden,
  })
  const [logros, setLogros] = useState<string[]>(proyecto.logros.map(l => l.texto))
  const [pasos, setPasos] = useState<string[]>(proyecto.proximos_pasos.map(p => p.texto))
  const [recursos, setRecursos] = useState<RecursoInput[]>(
    proyecto.recursos.map(r => ({
      tipo: r.tipo,
      titulo: r.titulo,
      url: r.url,
      thumbnail_url: r.thumbnail_url ?? null,
      duracion_segundos: r.duracion_segundos ?? null,
      orden: r.orden,
    }))
  )

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveProyectoAction({
          id: proyecto.id,
          componente_id: form.componente_id,
          codigo: form.codigo || null,
          nombre: form.nombre,
          descripcion_corta: form.descripcion_corta || null,
          descripcion_larga: form.descripcion_larga || null,
          plazo: form.plazo,
          estado: form.estado,
          avance: form.avance,
          avance_corto: proyecto.avance_corto ?? null,
          avance_mediano: proyecto.avance_mediano ?? null,
          avance_largo: proyecto.avance_largo ?? null,
          responsable: form.responsable || null,
          fecha_entrega_texto: form.fecha_entrega_texto || null,
          logros: logros.map(texto => ({ texto, plazo: form.plazo })),
          proximos_pasos: pasos.map(texto => ({ texto, plazo: form.plazo })),
        })
        await upsertRecursosAction(proyecto.id, recursos)
        toast.success('Proyecto guardado')
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-3xl space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="logros">Logros</TabsTrigger>
          <TabsTrigger value="pasos">Próximos pasos</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Componente</Label>
              <select
                value={form.componente_id}
                onChange={e => set('componente_id', e.target.value)}
                className="w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1"
              >
                {componentes.map(c => (
                  <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Código</Label>
              <Input
                value={form.codigo}
                onChange={e => set('codigo', e.target.value)}
                placeholder="HU-1"
                className="text-xs bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Nombre *</Label>
            <Input
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              className="text-xs bg-white/5 border-white/10 mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-xs">Slug (URL)</Label>
            <Input
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              className="text-xs bg-white/5 border-white/10 mt-1 font-mono"
            />
          </div>

          <div>
            <Label className="text-xs">Descripción corta</Label>
            <Textarea
              value={form.descripcion_corta}
              onChange={e => set('descripcion_corta', e.target.value)}
              rows={2}
              className="text-xs bg-white/5 border-white/10 mt-1 resize-none"
            />
          </div>

          <div>
            <Label className="text-xs">Descripción larga (Markdown)</Label>
            <Textarea
              value={form.descripcion_larga}
              onChange={e => set('descripcion_larga', e.target.value)}
              rows={5}
              className="text-xs bg-white/5 border-white/10 mt-1 resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Estado</Label>
              <select
                value={form.estado}
                onChange={e => set('estado', e.target.value as EstadoEnum)}
                className="w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1"
              >
                {ESTADOS.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Plazo</Label>
              <select
                value={form.plazo}
                onChange={e => set('plazo', e.target.value as PlazoEnum)}
                className="w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1"
              >
                {PLAZOS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Avance (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.avance}
                onChange={e => set('avance', Number(e.target.value))}
                className="text-xs bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Responsable</Label>
              <Input
                value={form.responsable}
                onChange={e => set('responsable', e.target.value)}
                className="text-xs bg-white/5 border-white/10 mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Fecha entrega (texto)</Label>
              <Input
                value={form.fecha_entrega_texto}
                onChange={e => set('fecha_entrega_texto', e.target.value)}
                placeholder="Q2 2026"
                className="text-xs bg-white/5 border-white/10 mt-1"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logros">
          <BulletRepeater
            value={logros}
            onChange={setLogros}
            placeholder="Agregar logro alcanzado..."
            label="Logros alcanzados"
          />
        </TabsContent>

        <TabsContent value="pasos">
          <BulletRepeater
            value={pasos}
            onChange={setPasos}
            placeholder="Agregar próximo paso..."
            label="Próximos pasos"
          />
        </TabsContent>

        <TabsContent value="recursos">
          <RecursoRepeater value={recursos} onChange={setRecursos} />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-surface-border)' }}>
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
