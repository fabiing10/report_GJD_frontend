import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecursosEditor } from './RecursosEditor'
import type { ProyectoRecurso } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/lib/actions/recursos', () => ({
  crearRecurso: vi.fn(),
  actualizarRecurso: vi.fn(),
  eliminarRecurso: vi.fn(),
}))

const recurso: ProyectoRecurso = {
  id: 'r-1',
  proyecto_id: 'p-1',
  tipo: 'video_url',
  titulo: 'Demo del catálogo',
  url: 'https://example.com/video.mp4',
  thumbnail_url: null,
  duracion_segundos: null,
  orden: 0,
}

describe('RecursosEditor', () => {
  it('renderiza el titulo y la url de un recurso', () => {
    render(<RecursosEditor recursos={[recurso]} proyectoId="p-1" />)
    expect(screen.getByText('Demo del catálogo')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/video.mp4')).toBeInTheDocument()
  })

  it('renderiza el control para agregar un recurso', () => {
    render(<RecursosEditor recursos={[recurso]} proyectoId="p-1" />)
    expect(
      screen.getByRole('button', { name: /recurso/i })
    ).toBeInTheDocument()
  })

  it('sin recursos muestra un mensaje de vacío', () => {
    render(<RecursosEditor recursos={[]} proyectoId="p-1" />)
    expect(screen.getByText(/sin recursos/i)).toBeInTheDocument()
  })
})
