import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/automatizacion/hu-1',
}))
vi.mock('@/lib/actions/objetivos', () => ({ cambiarPlazoObjetivo: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

import { ObjetivosKanban } from './ObjetivosKanban'
import type { ObjetivoDetalle } from '@/types/domain'

const obj = (
  id: string,
  plazo: ObjetivoDetalle['plazo'],
  estado: ObjetivoDetalle['estado'],
  fecha_limite: string | null = null
): ObjetivoDetalle => ({
  id, proyecto_id: 'p1', titulo: id, descripcion: null, tipo: 'hu', plazo, estado,
  peso: 1, fecha_limite, orden: 0, created_at: '', updated_at: '', actividades: [],
})

const datos = [
  obj('A', 'corto', 'cumplido', '2027-12-15'),
  obj('B', 'mediano', 'pendiente'),
  obj('C', 'largo', 'en_progreso'),
]

describe('ObjetivosKanban', () => {
  it('muestra 3 columnas por plazo con sus objetivos como enlaces ?obj (todas visibles)', () => {
    render(<ObjetivosKanban objetivos={datos} colorHex="#3B82F6" isAdmin={false} />)
    expect(screen.getByText('Corto Plazo')).toBeInTheDocument()
    expect(screen.getByText('Mediano Plazo')).toBeInTheDocument()
    expect(screen.getByText('Largo Plazo')).toBeInTheDocument()
    // a diferencia de los tabs, los 3 objetivos son visibles a la vez
    expect(screen.getByText('A').closest('a')?.getAttribute('href')).toBe('?obj=A')
    expect(screen.getByText('B').closest('a')?.getAttribute('href')).toBe('?obj=B')
    expect(screen.getByText('C').closest('a')?.getAttribute('href')).toBe('?obj=C')
  })

  it('cada card muestra etiqueta de estado y de fecha (o "Sin fecha")', () => {
    render(<ObjetivosKanban objetivos={datos} colorHex="#3B82F6" isAdmin={false} />)
    expect(screen.getByText('Cumplido')).toBeInTheDocument()
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
    expect(screen.getByText('En progreso')).toBeInTheDocument()
    // fecha formateada en español
    expect(screen.getByText('15 dic 2027')).toBeInTheDocument()
    // objetivos sin fecha → marcador "Sin fecha" (B y C)
    expect(screen.getAllByText('Sin fecha')).toHaveLength(2)
  })

  it('admin: cada card tiene control de arrastre; usuario normal: ninguno', () => {
    const { unmount } = render(
      <ObjetivosKanban objetivos={datos} colorHex="#3B82F6" isAdmin={true} />
    )
    expect(screen.getAllByLabelText(/^Mover /)).toHaveLength(3)
    unmount()

    render(<ObjetivosKanban objetivos={datos} colorHex="#3B82F6" isAdmin={false} />)
    expect(screen.queryByLabelText(/^Mover /)).toBeNull()
  })

  it('sin objetivos muestra mensaje vacío', () => {
    render(<ObjetivosKanban objetivos={[]} colorHex="#3B82F6" isAdmin={false} />)
    expect(screen.getByText(/aún no tiene objetivos/i)).toBeInTheDocument()
  })
})
