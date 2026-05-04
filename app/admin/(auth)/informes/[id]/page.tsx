'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { updateInformeAction } from '@/lib/actions/informes'
import type { Informe } from '@/types/domain'

export default function AdminInformeDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [informe, setInforme] = useState<Informe | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    subtitulo: '',
    fecha_corte: '',
    avance_global_override: '',
    is_active: false,
  })

  useEffect(() => {
    fetch(`/api/admin/informes/${id}`)
      .then(r => r.json())
      .then((data: Informe) => {
        setInforme(data)
        setForm({
          titulo: data.titulo,
          subtitulo: data.subtitulo ?? '',
          fecha_corte: data.fecha_corte,
          avance_global_override: data.avance_global_override !== null ? String(data.avance_global_override) : '',
          is_active: data.is_active,
        })
      })
      .catch(() => toast.error('Error al cargar informe'))
  }, [id])

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateInformeAction(id, {
          titulo: form.titulo,
          subtitulo: form.subtitulo || null,
          fecha_corte: form.fecha_corte,
          avance_global_override: form.avance_global_override !== '' ? Number(form.avance_global_override) : null,
          is_active: form.is_active,
        })
        toast.success('Informe guardado')
        router.push('/admin/informes')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Error al guardar')
      }
    })
  }

  if (!informe) return <div className="text-xs text-[var(--color-text-muted)]">Cargando...</div>

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/informes" className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors">
          <ChevronLeft size={14} />
          Informes
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-xs text-[var(--color-text-primary)] truncate max-w-xs">{informe.titulo}</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-xs">Título *</Label>
          <Input value={form.titulo} onChange={e => set('titulo', e.target.value)} className="text-xs bg-white/5 border-white/10 mt-1" />
        </div>
        <div>
          <Label className="text-xs">Subtítulo</Label>
          <Input value={form.subtitulo} onChange={e => set('subtitulo', e.target.value)} className="text-xs bg-white/5 border-white/10 mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Fecha de corte (YYYY-MM-DD)</Label>
            <Input value={form.fecha_corte} onChange={e => set('fecha_corte', e.target.value)} placeholder="2026-05-01" className="text-xs bg-white/5 border-white/10 mt-1 font-mono" />
          </div>
          <div>
            <Label className="text-xs">Avance override (% — vacío = automático)</Label>
            <Input type="number" min={0} max={100} value={form.avance_global_override} onChange={e => set('avance_global_override', e.target.value)} placeholder="Automático" className="text-xs bg-white/5 border-white/10 mt-1" />
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--color-surface-border)' }}>
          <Switch
            checked={form.is_active}
            onCheckedChange={v => set('is_active', v)}
            id="is-active"
          />
          <Label htmlFor="is-active" className="text-xs cursor-pointer">
            Informe activo (visible en la presentación)
          </Label>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t" style={{ borderColor: 'var(--color-surface-border)' }}>
        <Button onClick={handleSave} disabled={isPending}>{isPending ? 'Guardando...' : 'Guardar cambios'}</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
      </div>
    </div>
  )
}
