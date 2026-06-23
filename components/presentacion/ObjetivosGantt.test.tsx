import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { push } = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/visor360',
}))

import { ObjetivosGantt } from './ObjetivosGantt'
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

describe('ObjetivosGantt', () => {
  it('lista una fila por objetivo con cabeceras de cronograma (años + plazos)', () => {
    render(
      <ObjetivosGantt
        objetivos={[obj('OBJ-A', 'corto', 'cumplido'), obj('OBJ-B', 'largo', 'pendiente')]}
        colorHex="#3B82F6"
      />
    )
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('2027')).toBeInTheDocument()
    // los productos aparecen en la columna de etiqueta
    expect(screen.getAllByText('OBJ-A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('OBJ-B').length).toBeGreaterThan(0)
    // la barra muestra el % de avance (cumplido → 100%, pendiente → 0%)
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    // encabezado de columna renombrado a "Producto"
    expect(screen.getByText('Producto')).toBeInTheDocument()
  })

  it('clic en la barra de un objetivo navega al modal de detalle (?obj)', () => {
    render(<ObjetivosGantt objetivos={[obj('OBJ-A', 'corto', 'cumplido')]} colorHex="#3B82F6" />)
    fireEvent.click(screen.getByRole('button', { name: /OBJ-A/ }))
    expect(push).toHaveBeenCalledWith('/visor360?obj=OBJ-A', { scroll: false })
  })

  it('proyecto sin objetivos muestra mensaje vacío', () => {
    render(<ObjetivosGantt objetivos={[]} colorHex="#3B82F6" />)
    expect(screen.getByText(/aún no tiene productos para trazar/i)).toBeInTheDocument()
  })
})
