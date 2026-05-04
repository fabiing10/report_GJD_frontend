'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface BulletRepeaterProps {
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  label?: string
}

export function BulletRepeater({ value, onChange, placeholder = 'Agregar ítem...', label }: BulletRepeaterProps) {
  const [draft, setDraft] = useState('')

  const addItem = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    onChange([...value, trimmed])
    setDraft('')
  }

  const removeItem = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
  }

  const updateItem = (i: number, text: string) => {
    const next = [...value]
    next[i] = text
    onChange(next)
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>}
      <ul className="space-y-1.5">
        {value.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <GripVertical size={14} className="mt-2 text-[var(--color-text-muted)] shrink-0" />
            <Textarea
              value={item}
              onChange={e => updateItem(i, e.target.value)}
              rows={2}
              className="flex-1 text-xs bg-white/5 border-white/10 resize-none"
            />
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="mt-2 p-1 rounded hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors shrink-0"
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <Textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={placeholder}
          rows={2}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) { e.preventDefault(); addItem() } }}
          className="flex-1 text-xs bg-white/5 border-white/10 resize-none"
        />
        <Button type="button" size="sm" variant="outline" onClick={addItem} className="self-end gap-1">
          <Plus size={12} /> Agregar
        </Button>
      </div>
    </div>
  )
}
