'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  DndContext,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, GripVertical } from 'lucide-react'
import {
  PLAZO_ORDER,
  PLAZO_LABEL,
  objetivosPorPlazo,
  avancePlazo,
} from '@/lib/objetivos'
import { cambiarPlazoObjetivo } from '@/lib/actions/objetivos'
import type {
  ObjetivoDetalle,
  PlazoEnum,
  ObjetivoEstadoEnum,
} from '@/types/domain'

const ESTADO: Record<ObjetivoEstadoEnum, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'var(--color-estado-no-iniciado)' },
  en_progreso: { label: 'En progreso', color: 'var(--color-estado-en-progreso)' },
  cumplido: { label: 'Cumplido', color: 'var(--color-estado-completado)' },
}
const TIPO_LABEL = { hu: 'HU', funcionalidad: 'Func.' } as const
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtFecha(f: string | null): string | null {
  if (!f) return null
  const [y, m, d] = f.split('-')
  if (!y || !m || !d) return f
  return `${Number(d)} ${MESES[Number(m) - 1]} ${y}`
}

export function ObjetivosKanban({
  objetivos,
  colorHex,
  isAdmin,
}: {
  objetivos: ObjetivoDetalle[]
  colorHex: string
  isAdmin: boolean
}) {
  const router = useRouter()
  const [items, setItems] = useState<ObjetivoDetalle[]>(objetivos)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setItems(objetivos), [objetivos])
  useEffect(() => setMounted(true), [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  )

  // dnd solo para admin y tras montar (evita mismatch de hidratación)
  const dndOn = isAdmin && mounted

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const target = over.id as PlazoEnum
    const obj = items.find((o) => o.id === active.id)
    if (!obj || obj.plazo === target) return

    const previo = items
    setItems(items.map((o) => (o.id === obj.id ? { ...o, plazo: target } : o)))
    cambiarPlazoObjetivo(String(active.id), target)
      .then(() => router.refresh())
      .catch((e) => {
        setItems(previo)
        toast.error(e instanceof Error ? e.message : 'No se pudo mover el objetivo')
      })
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Este proyecto aún no tiene objetivos registrados.
      </p>
    )
  }

  const board = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PLAZO_ORDER.map((plz) => {
        const cards = objetivosPorPlazo(items, plz)
        return (
          <Columna
            key={plz}
            plazo={plz}
            colorHex={colorHex}
            avance={avancePlazo(items, plz)}
            count={cards.length}
            droppable={dndOn}
          >
            {cards.map((o) =>
              dndOn ? (
                <CardArrastrable key={o.id} objetivo={o} />
              ) : (
                <CardEstatico key={o.id} objetivo={o} />
              )
            )}
          </Columna>
        )
      })}
    </div>
  )

  if (!dndOn) return board

  return (
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      {board}
    </DndContext>
  )
}

// ── Columna (plazo) ──────────────────────────────────────────
function Columna({
  plazo,
  colorHex,
  avance,
  count,
  droppable,
  children,
}: {
  plazo: PlazoEnum
  colorHex: string
  avance: number
  count: number
  droppable: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="flex flex-col rounded-xl border"
      style={{ borderColor: 'var(--color-surface-border)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-3 py-2.5"
        style={{ borderColor: 'var(--color-surface-border)' }}
      >
        <div className="flex items-center gap-2">
          <span className="h-3 w-1 rounded-full" style={{ background: colorHex }} />
          <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
            {PLAZO_LABEL[plazo]}
          </h3>
          <span className="rounded-full bg-white/[0.08] px-1.5 text-[10px] tabular-nums text-[var(--color-text-muted)]">
            {count}
          </span>
        </div>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: colorHex }}>
          {Math.round(avance)}%
        </span>
      </div>
      {droppable ? (
        <ZonaSoltar plazo={plazo} colorHex={colorHex}>
          {children}
        </ZonaSoltar>
      ) : (
        <div className="flex min-h-24 flex-col gap-2 p-2.5">{children}</div>
      )}
    </div>
  )
}

function ZonaSoltar({
  plazo,
  colorHex,
  children,
}: {
  plazo: PlazoEnum
  colorHex: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id: plazo })
  return (
    <div
      ref={setNodeRef}
      className="flex min-h-24 flex-col gap-2 rounded-b-xl p-2.5 transition-colors"
      style={{ background: isOver ? `${colorHex}14` : 'transparent' }}
    >
      {children}
    </div>
  )
}

// ── Cards ────────────────────────────────────────────────────
function CardEstatico({ objetivo }: { objetivo: ObjetivoDetalle }) {
  const searchParams = useSearchParams()
  const active = searchParams.get('obj') === objetivo.id
  return (
    <Link
      href={`?obj=${objetivo.id}`}
      scroll={false}
      className="block rounded-lg border p-3 transition-colors"
      style={{
        borderColor: active ? 'var(--color-text-secondary)' : 'var(--color-surface-border)',
        background: active ? 'var(--color-surface-card-hover)' : 'var(--color-surface-card)',
      }}
    >
      <CardCuerpo objetivo={objetivo} />
    </Link>
  )
}

function CardArrastrable({ objetivo }: { objetivo: ObjetivoDetalle }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: objetivo.id,
  })
  return (
    <div
      ref={setNodeRef}
      className="relative rounded-lg border p-3"
      style={{
        borderColor: 'var(--color-surface-border)',
        background: 'var(--color-surface-card)',
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 20 : undefined,
      }}
    >
      <button
        type="button"
        aria-label={`Mover ${objetivo.titulo}`}
        className="absolute right-1.5 top-1.5 z-10 cursor-grab touch-none rounded p-0.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)]"
        {...listeners}
        {...attributes}
      >
        <GripVertical size={13} />
      </button>
      <Link href={`?obj=${objetivo.id}`} scroll={false} className="block pr-5">
        <CardCuerpo objetivo={objetivo} />
      </Link>
    </div>
  )
}

function CardCuerpo({ objetivo }: { objetivo: ObjetivoDetalle }) {
  const est = ESTADO[objetivo.estado]
  const fecha = fmtFecha(objetivo.fecha_limite)
  return (
    <>
      <div className="flex items-start gap-2">
        <span
          className="mt-1 size-2 shrink-0 rounded-full"
          style={{ background: est.color }}
          aria-hidden
        />
        <p className="min-w-0 flex-1 text-[13px] font-medium leading-snug text-[var(--color-text-primary)] line-clamp-2">
          {objetivo.titulo}
        </p>
        <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--color-text-muted)]">
          {TIPO_LABEL[objetivo.tipo]}
        </span>
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-4">
        <span
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] tabular-nums"
          style={{
            background: fecha ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: 'var(--color-text-muted)',
            border: fecha ? 'none' : '1px dashed var(--color-surface-border)',
          }}
        >
          <Calendar size={10} />
          {fecha ?? 'Sin fecha'}
        </span>
        <span
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium"
          style={{ background: `${est.color}26`, color: est.color }}
        >
          {est.label}
        </span>
      </div>
    </>
  )
}
