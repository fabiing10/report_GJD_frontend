'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, Trash2, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { setInformeActivoAction, duplicarInformeAction, deleteInformeAction } from '@/lib/actions/informes'
import type { Informe } from '@/types/domain'
import { formatFecha } from '@/lib/utils'

interface Props {
  informes: Informe[]
}

export function InformesClient({ informes: initial }: Props) {
  const [informes, setInformes] = useState(initial)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const handleSetActivo = (id: string) => {
    startTransition(async () => {
      try {
        await setInformeActivoAction(id)
        setInformes(prev => prev.map(i => ({ ...i, is_active: i.id === id })))
        toast.success('Informe activo actualizado')
        router.refresh()
      } catch {
        toast.error('Error al activar')
      }
    })
  }

  const handleDuplicar = (id: string) => {
    startTransition(async () => {
      try {
        const nuevo = await duplicarInformeAction(id)
        setInformes(prev => [nuevo, ...prev])
        toast.success('Informe duplicado')
      } catch {
        toast.error('Error al duplicar')
      }
    })
  }

  const handleDelete = (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción eliminará todos los componentes y proyectos asociados.`)) return
    startTransition(async () => {
      try {
        await deleteInformeAction(id)
        setInformes(prev => prev.filter(i => i.id !== id))
        toast.success('Informe eliminado')
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  return (
    <div className="space-y-2">
      {informes.map(informe => (
        <div
          key={informe.id}
          className="flex items-center gap-3 p-4 rounded-xl border transition-colors"
          style={{
            background: 'var(--color-surface-card)',
            borderColor: informe.is_active ? 'rgba(249,115,22,0.4)' : 'var(--color-surface-border)',
          }}
        >
          {informe.is_active && (
            <Radio size={14} className="shrink-0 text-[var(--color-alcaldia-naranja)]" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{informe.titulo}</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {informe.subtitulo && `${informe.subtitulo} · `}
              Corte: {formatFecha(informe.fecha_corte)}
              {informe.is_active && <span className="ml-2 text-[var(--color-alcaldia-naranja)] font-semibold">ACTIVO</span>}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {!informe.is_active && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSetActivo(informe.id)}
                className="text-xs gap-1"
              >
                Activar
              </Button>
            )}
            <Link
              href={`/admin/informes/${informe.id}`}
              className="p-1.5 rounded hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Editar"
            >
              <ExternalLink size={14} />
            </Link>
            <button
              onClick={() => handleDuplicar(informe.id)}
              className="p-1.5 rounded hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
              title="Duplicar"
            >
              <Copy size={14} />
            </button>
            {!informe.is_active && (
              <button
                onClick={() => handleDelete(informe.id, informe.titulo)}
                className="p-1.5 rounded hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
