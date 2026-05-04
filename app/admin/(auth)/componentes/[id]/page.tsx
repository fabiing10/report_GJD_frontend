'use client'

import { useState, useTransition } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateComponenteAction } from '@/lib/actions/componentes'
import type { ComponenteConAvance } from '@/types/domain'
import { useEffect } from 'react'

const COLOR_TOKENS = ['blue', 'purple', 'cyan', 'violet', 'slate', 'rose'] as const

export default function AdminComponenteDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [componente, setComponente] = useState<ComponenteConAvance | null>(null)
  const [form, setForm] = useState({
    informe_id: '',
    slug: '',
    nombre: '',
    descripcion: '',
    icono: '',
    color_hex: '',
    color_token: 'blue' as typeof COLOR_TOKENS[number],
    orden: 0,
    avance_override: '',
  })

  useEffect(() => {
    fetch(`/api/admin/componentes/${id}`)
      .then(r => r.json())
      .then((data: ComponenteConAvance) => {
        setComponente(data)
        setForm({
          informe_id: data.informe_id,
          slug: data.slug,
          nombre: data.nombre,
          descripcion: data.descripcion ?? '',
          icono: data.icono,
          color_hex: data.color_hex,
          color_token: data.color_token as typeof COLOR_TOKENS[number],
          orden: data.orden,
          avance_override: data.avance_override !== null ? String(data.avance_override) : '',
        })
      })
      .catch(() => toast.error('Error al cargar componente'))
  }, [id])

  const handleSave = () => {
    if (!componente) return
    startTransition(async () => {
      try {
        await updateComponenteAction(id, {
          ...form,
          descripcion: form.descripcion || null,
          avance_override: form.avance_override !== '' ? Number(form.avance_override) : null,
        })
        toast.success('Componente guardado')
        router.push('/admin/componentes')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  if (!componente) {
    return <div className="text-xs text-[var(--color-text-muted)]">Cargando...</div>
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/componentes" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          <ChevronLeft size={14} />
          Componentes
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-xs text-[var(--color-text-primary)]">{componente.nombre}</span>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Nombre *</Label>
            <Input value={form.nombre} onChange={e => set('nombre', e.target.value)} className="text-xs bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Slug (URL)</Label>
            <Input value={form.slug} onChange={e => set('slug', e.target.value)} className="text-xs bg-white/5 border-white/10 mt-1 font-mono" />
          </div>
        </div>
        <div>
          <Label className="text-xs">Descripción</Label>
          <Textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} className="text-xs bg-white/5 border-white/10 mt-1 resize-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Icono (emoji)</Label>
            <Input value={form.icono} onChange={e => set('icono', e.target.value)} className="text-2xl bg-white/5 border-white/10 mt-1 text-center" />
          </div>
          <div>
            <Label className="text-xs">Color hex</Label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={form.color_hex} onChange={e => set('color_hex', e.target.value)} className="w-10 h-9 rounded border border-white/10 bg-transparent cursor-pointer" />
              <Input value={form.color_hex} onChange={e => set('color_hex', e.target.value)} className="text-xs bg-white/5 border-white/10 font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Token CSS</Label>
            <select value={form.color_token} onChange={e => set('color_token', e.target.value as typeof COLOR_TOKENS[number])} className="w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1">
              {COLOR_TOKENS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Orden</Label>
            <Input type="number" value={form.orden} onChange={e => set('orden', Number(e.target.value))} className="text-xs bg-white/5 border-white/10 mt-1" />
          </div>
          <div>
            <Label className="text-xs">Avance override (% — vacío = automático)</Label>
            <Input type="number" min={0} max={100} value={form.avance_override} onChange={e => set('avance_override', e.target.value)} placeholder="Automático" className="text-xs bg-white/5 border-white/10 mt-1" />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-surface-border)' }}>
        <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar cambios'}</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  )
}
