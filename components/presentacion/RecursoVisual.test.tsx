import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RecursoVisual } from './RecursoVisual'
import type { ProyectoRecurso } from '@/types/domain'

const recurso: ProyectoRecurso = {
  id: 'r1',
  proyecto_id: 'p1',
  tipo: 'video_url',
  titulo: 'Demo HU-1',
  url: 'recursos/videos/HU1.mp4',
  thumbnail_url: null,
  duracion_segundos: null,
  orden: 0,
}

describe('RecursoVisual', () => {
  it('no renderiza cuando no hay recursos', () => {
    const { container } = render(<RecursoVisual recursos={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el título del recurso', () => {
    render(<RecursoVisual recursos={[recurso]} />)
    expect(screen.getByText(/Demo HU-1/)).toBeInTheDocument()
    expect(screen.getByText('Recurso Visual')).toBeInTheDocument()
  })
})
