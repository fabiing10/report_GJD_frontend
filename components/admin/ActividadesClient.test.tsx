import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActividadesClient } from './ActividadesClient'
import type { Actividad } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

vi.mock('@/lib/actions/actividades', () => ({
  crearActividad: vi.fn().mockResolvedValue(undefined),
  actualizarActividad: vi.fn().mockResolvedValue(undefined),
  eliminarActividad: vi.fn().mockResolvedValue(undefined),
}))

const objetivos = [
  { id: 'obj-1', label: 'Lago de datos — Definir esquema' },
  { id: 'obj-2', label: 'Gobernanza IA — Política de uso' },
]

const actividades: Array<
  Actividad & { objetivo_titulo: string; proyecto_nombre: string }
> = [
  {
    id: 'act-1',
    objetivo_id: 'obj-1',
    tipo: 'reunion',
    titulo: 'Kickoff del proyecto',
    descripcion: null,
    fecha: '2026-06-10',
    estado: 'completada',
    responsable: 'Ana',
    orden: 0,
    created_at: '',
    updated_at: '',
    objetivo_titulo: 'Definir esquema',
    proyecto_nombre: 'Lago de datos',
  },
  {
    id: 'act-2',
    objetivo_id: 'obj-2',
    tipo: 'investigacion',
    titulo: 'Benchmark de modelos',
    descripcion: null,
    fecha: '2026-06-12',
    estado: 'en_progreso',
    responsable: 'Beto',
    orden: 0,
    created_at: '',
    updated_at: '',
    objetivo_titulo: 'Política de uso',
    proyecto_nombre: 'Gobernanza IA',
  },
]

describe('ActividadesClient', () => {
  it('renderiza el botón "+ Nueva actividad"', () => {
    render(<ActividadesClient actividades={[]} objetivos={objetivos} />)
    expect(
      screen.getByRole('button', { name: /nueva actividad/i })
    ).toBeInTheDocument()
  })

  it('renderiza una fila por actividad con su título, proyecto y objetivo', () => {
    render(<ActividadesClient actividades={actividades} objetivos={objetivos} />)
    expect(screen.getByText('Kickoff del proyecto')).toBeInTheDocument()
    expect(screen.getByText('Benchmark de modelos')).toBeInTheDocument()
    expect(screen.getByText('Lago de datos')).toBeInTheDocument()
    expect(screen.getByText('Gobernanza IA')).toBeInTheDocument()
    expect(screen.getByText('Definir esquema')).toBeInTheDocument()
    expect(screen.getByText('Política de uso')).toBeInTheDocument()
  })

  it('muestra un estado vacío cuando no hay actividades', () => {
    render(<ActividadesClient actividades={[]} objetivos={objetivos} />)
    expect(screen.getByText(/sin actividades/i)).toBeInTheDocument()
  })
})
