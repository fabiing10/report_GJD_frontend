import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EstadoBadge, PlazoBadge } from './EstadoBadge'

describe('EstadoBadge', () => {
  it('muestra el label "Completado" para estado completado', () => {
    render(<EstadoBadge estado="completado" />)
    expect(screen.getByText('Completado')).toBeInTheDocument()
  })

  it('muestra "En progreso" para estado en_progreso', () => {
    render(<EstadoBadge estado="en_progreso" />)
    expect(screen.getByText('En progreso')).toBeInTheDocument()
  })
})

describe('PlazoBadge', () => {
  it('muestra el plazo corto', () => {
    render(<PlazoBadge plazo="corto" />)
    expect(screen.getByText('Corto plazo')).toBeInTheDocument()
  })

  it('muestra el plazo largo', () => {
    render(<PlazoBadge plazo="largo" />)
    expect(screen.getByText('Largo plazo')).toBeInTheDocument()
  })
})
