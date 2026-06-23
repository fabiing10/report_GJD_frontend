import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/visor360',
  useSearchParams: () => ({ get: () => null }),
}))

import { ComponenteProyectos } from './ComponenteProyectos'
import type { ProyectoDetalle, ObjetivoDetalle } from '@/types/domain'

const obj = (id: string): ObjetivoDetalle => ({
  id, proyecto_id: 'x', titulo: id, descripcion: null, tipo: 'hu', plazo: 'corto',
  estado: 'pendiente', peso: 1, fecha_limite: null, orden: 0, created_at: '', updated_at: '', actividades: [],
})

const proy = (id: string, nombre: string, objetivos: ObjetivoDetalle[]): ProyectoDetalle => ({
  id, componente_id: 'c1', slug: id, codigo: null, nombre, descripcion_corta: null,
  descripcion_larga: null, estado: 'en_progreso', avance_override: null, responsable: null,
  fecha_inicio: null, fecha_fin: null, orden: 0, created_at: '', updated_at: '',
  avance_calculado: 0, total_objetivos: objetivos.length, objetivos_cumplidos: 0,
  objetivos, recursos: [], ejes: [],
})

const proyectos = [
  proy('pa', 'Proyecto A', [obj('OBJ-A1')]),
  proy('pb', 'Proyecto B', [obj('OBJ-B1')]),
]

describe('ComponenteProyectos (master-detail)', () => {
  it('por defecto selecciona el primer proyecto y muestra su cronograma', () => {
    render(<ComponenteProyectos proyectos={proyectos} slug="visor360" colorHex="#3B82F6" />)
    // card del primer proyecto activa
    expect(screen.getByRole('button', { name: /Proyecto A/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Proyecto B/ })).toHaveAttribute('aria-pressed', 'false')
    // cronograma del primero: su objetivo visible, el del segundo no
    expect(screen.getAllByText('OBJ-A1').length).toBeGreaterThan(0)
    expect(screen.queryByText('OBJ-B1')).toBeNull()
  })

  it('al seleccionar otro proyecto cambia el cronograma sin navegar', () => {
    render(<ComponenteProyectos proyectos={proyectos} slug="visor360" colorHex="#3B82F6" />)
    fireEvent.click(screen.getByRole('button', { name: /Proyecto B/ }))
    expect(screen.getByRole('button', { name: /Proyecto B/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText('OBJ-B1').length).toBeGreaterThan(0)
    expect(screen.queryByText('OBJ-A1')).toBeNull()
  })

  it('sin proyectos muestra mensaje vacío', () => {
    render(<ComponenteProyectos proyectos={[]} slug="visor360" colorHex="#3B82F6" />)
    expect(screen.getByText(/aún no tiene proyectos/i)).toBeInTheDocument()
  })
})
