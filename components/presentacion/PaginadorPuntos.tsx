interface PaginadorPuntosProps {
  total: number
  current: number
  color?: string
}

export function PaginadorPuntos({
  total,
  current,
  color = '#3B82F6',
}: PaginadorPuntosProps) {
  return (
    <div className="flex items-center gap-1.5" role="tablist">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          role="tab"
          aria-selected={i === current}
          className="rounded-full transition-all duration-200"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            backgroundColor: i === current ? color : 'rgba(148,163,184,0.3)',
          }}
        />
      ))}
    </div>
  )
}
