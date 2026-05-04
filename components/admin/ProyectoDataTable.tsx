'use client'

import { useState, useTransition, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { ArrowUpDown, Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { EstadoBadge } from '@/components/presentacion/EstadoBadge'
import { ProyectoModal } from './ProyectoModal'
import { updateProyectoInlineAction, deleteProyectoAction } from '@/lib/actions/proyectos'
import type { ProyectoDetalle, ComponenteConProyectos, EstadoEnum } from '@/types/domain'

type ProyectoRow = ProyectoDetalle & { componente: ComponenteConProyectos }

interface Props {
  proyectos: ProyectoRow[]
  componentes: ComponenteConProyectos[]
}

const ESTADOS: EstadoEnum[] = ['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']

function AvanceCell({ row }: { row: { original: ProyectoRow } }) {
  const [value, setValue] = useState(row.original.avance)
  const [, startTransition] = useTransition()

  const handleBlur = () => {
    const clamped = Math.min(100, Math.max(0, value))
    if (clamped === row.original.avance) return
    startTransition(async () => {
      try {
        await updateProyectoInlineAction(row.original.id, { avance: clamped })
        toast.success('Avance actualizado')
      } catch {
        toast.error('Error al actualizar')
        setValue(row.original.avance)
      }
    })
  }

  return (
    <div className="flex items-center gap-2 w-28">
      <input
        type="number" min={0} max={100}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={handleBlur}
        className="w-14 text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-right tabular-nums"
      />
      <span className="text-[10px] text-[var(--color-text-muted)]">%</span>
    </div>
  )
}

function EstadoCell({ row }: { row: { original: ProyectoRow } }) {
  const [, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const estado = e.target.value as EstadoEnum
    startTransition(async () => {
      try {
        await updateProyectoInlineAction(row.original.id, { estado })
        toast.success('Estado actualizado')
      } catch {
        toast.error('Error al actualizar')
      }
    })
  }

  return (
    <select
      defaultValue={row.original.estado}
      onChange={handleChange}
      className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 cursor-pointer"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>{e.replace('_', ' ')}</option>
      ))}
    </select>
  )
}

export function ProyectoDataTable({ proyectos, componentes }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [modalState, setModalState] = useState<{ open: boolean; proyecto?: ProyectoRow }>({ open: false })
  const [, startTransition] = useTransition()

  const openNew = () => setModalState({ open: true })
  const openEdit = (p: ProyectoRow) => setModalState({ open: true, proyecto: p })
  const closeModal = () => setModalState({ open: false })
  const handleSaved = () => {
    closeModal()
    // Page revalidates via server action — no client reload needed
  }

  const handleDelete = (row: ProyectoRow) => {
    if (!confirm(`¿Eliminar "${row.nombre}"?`)) return
    startTransition(async () => {
      try {
        await deleteProyectoAction(row.id)
        toast.success('Proyecto eliminado')
      } catch {
        toast.error('Error al eliminar')
      }
    })
  }

  const columns = useMemo<ColumnDef<ProyectoRow>[]>(() => [
    {
      accessorKey: 'componente.nombre',
      header: 'Componente',
      cell: ({ row }) => (
        <span className="text-xs" style={{ color: row.original.componente.color_hex }}>
          {row.original.componente.icono} {row.original.componente.nombre.split(' ').slice(0, 2).join(' ')}
        </span>
      ),
    },
    {
      accessorKey: 'codigo',
      header: 'Código',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{String(getValue() ?? '—')}</span>
      ),
    },
    {
      accessorKey: 'nombre',
      header: ({ column }) => (
        <button className="flex items-center gap-1 text-xs" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Nombre <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs text-[var(--color-text-primary)] max-w-[200px] truncate block">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: 'estado',
      header: 'Estado',
      cell: ({ row }) => <EstadoCell row={row} />,
    },
    {
      accessorKey: 'avance',
      header: ({ column }) => (
        <button className="flex items-center gap-1 text-xs" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Avance <ArrowUpDown size={12} />
        </button>
      ),
      cell: ({ row }) => <AvanceCell row={row} />,
    },
    {
      accessorKey: 'plazo',
      header: 'Plazo',
      cell: ({ getValue }) => (
        <span className="text-xs text-[var(--color-text-muted)] capitalize">{String(getValue())}</span>
      ),
    },
    {
      id: 'logros_pasos',
      header: 'Contenido',
      cell: ({ row }) => (
        <span className="text-xs text-[var(--color-text-muted)]">
          {row.original.logros.length}L / {row.original.proximos_pasos.length}P
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 rounded hover:bg-white/10 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="p-1.5 rounded hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data: proyectos,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar proyectos..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs bg-white/5 border-white/10 text-sm"
          />
          <span className="text-xs text-[var(--color-text-muted)] flex-1">
            {table.getFilteredRowModel().rows.length} proyectos
          </span>
          <button
            onClick={openNew}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              color: '#fff',
              background: 'var(--color-alcaldia-naranja)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Nuevo proyecto
          </button>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-surface-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: 'var(--color-bg-elevated)' }}>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b" style={{ borderColor: 'var(--color-surface-border)' }}>
                    {hg.headers.map((h) => (
                      <th key={h.id} className="px-3 py-2.5 text-left text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-white/[0.02] cursor-pointer"
                    style={{
                      borderColor: 'var(--color-surface-border)',
                      background: i % 2 === 0 ? 'var(--color-surface-card)' : 'transparent',
                    }}
                    onDoubleClick={() => openEdit(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalState.open && (
        <ProyectoModal
          proyecto={modalState.proyecto}
          componentes={componentes}
          defaultComponenteId={componentes[0]?.id}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
    </>
  )
}
