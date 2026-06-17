import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({ default: ({ children }: { children: React.ReactNode }) => <a>{children}</a> }))
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, { get: () => (p: Record<string, unknown>) => <div {...p} /> }),
}))

import { OverviewEstrategico } from './OverviewEstrategico'
import type { InformeConRelaciones } from '@/types/domain'

const informe: InformeConRelaciones = {
  id: 'i1', titulo: 'Informe GJD', subtitulo: 'Sub', fecha_corte: '2026-02-13',
  avance_global_override: null, is_active: true, created_at: '', updated_at: '',
  avance_global_calculado: 31,
  componentes: [
    {
      id: 'c1', informe_id: 'i1', slug: 'gestion', nombre: 'Gestión', descripcion: null,
      icono: '⚙️', color_hex: '#3B82F6', color_token: 'g', orden: 0, avance_override: null,
      created_at: '', updated_at: '', avance_calculado: 86, total_actividades: 1, actividades_completadas: 1,
      proyectos: [
        {
          id: 'p1', componente_id: 'c1', slug: 'hu-1', codigo: 'HU-1', nombre: 'HU-1',
          descripcion_corta: null, descripcion_larga: null, estado: 'en_progreso',
          avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null,
          orden: 0, created_at: '', updated_at: '', avance_calculado: 50,
          total_objetivos: 2, objetivos_cumplidos: 1,
          objetivos: [
            { id: 'o1', proyecto_id: 'p1', titulo: 'A', descripcion: null, tipo: 'hu', plazo: 'corto', estado: 'cumplido', peso: 1, orden: 0, created_at: '', updated_at: '', actividades: [] },
            { id: 'o2', proyecto_id: 'p1', titulo: 'B', descripcion: null, tipo: 'hu', plazo: 'mediano', estado: 'pendiente', peso: 1, orden: 1, created_at: '', updated_at: '', actividades: [] },
          ],
          recursos: [], ejes: [],
        },
      ],
    },
  ],
}

describe('OverviewEstrategico', () => {
  it('muestra título, avance global y secciones de distribución', () => {
    render(<OverviewEstrategico informe={informe} />)
    expect(screen.getByText('Informe GJD')).toBeInTheDocument()
    expect(screen.getByText('Por plazo')).toBeInTheDocument()
    expect(screen.getByText('Por estado')).toBeInTheDocument()
    expect(screen.getByText('Gestión')).toBeInTheDocument()
  })
})
