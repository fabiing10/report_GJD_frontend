import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ObjetivosClient } from './ObjetivosClient'
import type { Objetivo } from '@/types/domain'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/lib/actions/objetivos', () => ({
  crearObjetivo: vi.fn().mockResolvedValue(undefined),
  actualizarObjetivo: vi.fn().mockResolvedValue(undefined),
  eliminarObjetivo: vi.fn().mockResolvedValue(undefined),
}))

const proyectos = [
  { id: 'p-1', label: 'Gestión de Notificaciones — Sistema Gestor' },
  { id: 'p-2', label: 'Analítica — Lago de datos' },
]

const objetivos: Array<Objetivo & { proyecto_nombre: string; componente_nombre: string }> = [
  {
    id: 'o-1', proyecto_id: 'p-1', titulo: 'HU-1 Gestión de Notificaciones', descripcion: null,
    tipo: 'hu', plazo: 'corto', estado: 'cumplido', peso: 1, fecha_limite: '2027-12-15',
    orden: 0, created_at: '', updated_at: '',
    proyecto_nombre: 'Sistema Gestor', componente_nombre: 'Gestión de Notificaciones',
  },
  {
    id: 'o-2', proyecto_id: 'p-2', titulo: 'Definir esquema', descripcion: null,
    tipo: 'funcionalidad', plazo: 'mediano', estado: 'pendiente', peso: 2, fecha_limite: null,
    orden: 0, created_at: '', updated_at: '',
    proyecto_nombre: 'Lago de datos', componente_nombre: 'Analítica',
  },
]

describe('ObjetivosClient', () => {
  it('renderiza el botón "+ Nuevo producto"', () => {
    render(<ObjetivosClient objetivos={[]} proyectos={proyectos} />)
    expect(screen.getByRole('button', { name: /nuevo producto/i })).toBeInTheDocument()
  })

  it('renderiza una fila por producto con título, proyecto y componente', () => {
    render(<ObjetivosClient objetivos={objetivos} proyectos={proyectos} />)
    expect(screen.getByText('HU-1 Gestión de Notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Definir esquema')).toBeInTheDocument()
    expect(screen.getByText('Sistema Gestor')).toBeInTheDocument()
    expect(screen.getByText('Lago de datos')).toBeInTheDocument()
    // contexto de componente + fecha límite visibles
    expect(screen.getByText('2027-12-15')).toBeInTheDocument()
    expect(screen.getAllByText('Analítica').length).toBeGreaterThan(0)
  })

  it('muestra estado vacío cuando no hay productos', () => {
    render(<ObjetivosClient objetivos={[]} proyectos={proyectos} />)
    expect(screen.getByText(/sin productos/i)).toBeInTheDocument()
  })
})
