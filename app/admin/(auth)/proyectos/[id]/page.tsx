import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getDataClient } from '@/lib/db'
import { ProyectoForm } from '@/components/admin/ProyectoForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminProyectoDetailPage({ params }: Props) {
  const { id } = await params
  const client = getDataClient()
  const informe = await client.getInformeActivo()
  if (!informe) notFound()

  const proyecto = informe.componentes.flatMap(c => c.proyectos).find(p => p.id === id)
  if (!proyecto) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/proyectos"
          className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ChevronLeft size={14} />
          Proyectos
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-xs text-[var(--color-text-primary)]">
          {proyecto.codigo ? `${proyecto.codigo} — ` : ''}{proyecto.nombre}
        </span>
      </div>

      <ProyectoForm proyecto={proyecto} componentes={informe.componentes} />
    </div>
  )
}
