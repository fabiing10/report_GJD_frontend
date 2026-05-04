'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ProyectoRecurso, RecursoTipoEnum } from '@/types/domain'

type RecursoInput = { tipo: RecursoTipoEnum; titulo: string | null; url: string; thumbnail_url: string | null; duracion_segundos: number | null; orden: number }

interface RecursoRepeaterProps {
  value: RecursoInput[]
  onChange: (value: RecursoInput[]) => void
}

const TIPOS: RecursoTipoEnum[] = ['video_url', 'imagen', 'link']

export function RecursoRepeater({ value, onChange }: RecursoRepeaterProps) {
  const [draft, setDraft] = useState<RecursoInput>({
    tipo: 'video_url',
    titulo: null,
    url: '',
    thumbnail_url: null,
    duracion_segundos: null,
    orden: 0,
  })

  const addItem = () => {
    if (!draft.url.trim()) return
    onChange([...value, { ...draft, orden: value.length }])
    setDraft({ tipo: 'video_url', titulo: null, url: '', thumbnail_url: null, duracion_segundos: null, orden: 0 })
  }

  const removeItem = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, orden: idx })))
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {value.map((r, i) => (
          <li key={i} className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--color-surface-border)' }}>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-[var(--color-text-muted)]">{r.tipo}</span>
            <div className="flex-1 min-w-0">
              {r.titulo && <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">{r.titulo}</p>}
              <p className="text-xs text-[var(--color-text-muted)] truncate">{r.url}</p>
            </div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="p-1 rounded hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>

      <div className="p-3 rounded-lg border space-y-2" style={{ borderColor: 'var(--color-surface-border)', background: 'var(--color-bg-elevated)' }}>
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Nuevo recurso</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">Tipo</Label>
            <select
              value={draft.tipo}
              onChange={e => setDraft(d => ({ ...d, tipo: e.target.value as RecursoTipoEnum }))}
              className="w-full text-xs bg-white/5 border border-white/10 rounded px-2 py-1.5 mt-1"
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <Label className="text-[10px]">Título (opcional)</Label>
            <Input
              value={draft.titulo ?? ''}
              onChange={e => setDraft(d => ({ ...d, titulo: e.target.value || null }))}
              className="text-xs bg-white/5 border-white/10 mt-1"
              placeholder="Título descriptivo"
            />
          </div>
        </div>
        <div>
          <Label className="text-[10px]">URL</Label>
          <Input
            value={draft.url}
            onChange={e => setDraft(d => ({ ...d, url: e.target.value }))}
            className="text-xs bg-white/5 border-white/10 mt-1"
            placeholder="https://... o recursos/video.mp4"
          />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addItem} className="gap-1">
          <Plus size={12} /> Agregar recurso
        </Button>
      </div>
    </div>
  )
}
