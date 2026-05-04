import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProyectoDetalle } from '@/types/domain'

interface NavegacionProyectosProps {
  prev: ProyectoDetalle | null
  next: ProyectoDetalle | null
  componenteSlug: string
}

export function NavegacionProyectos({
  prev,
  next,
  componenteSlug,
}: NavegacionProyectosProps) {
  return (
    <div className="flex justify-between items-center mt-8">
      {prev ? (
        <Link
          href={`/${componenteSlug}/${prev.slug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-all"
        >
          <ChevronLeft size={16} />
          <span className="line-clamp-1 max-w-[180px]">
            {prev.codigo ? `${prev.codigo} ` : ''}
            {prev.nombre}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`/${componenteSlug}/${next.slug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-white/5 transition-all"
        >
          <span className="line-clamp-1 max-w-[180px]">
            {next.codigo ? `${next.codigo} ` : ''}
            {next.nombre}
          </span>
          <ChevronRight size={16} />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
