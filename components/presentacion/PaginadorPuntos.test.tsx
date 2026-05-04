import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaginadorPuntos } from './PaginadorPuntos'

describe('PaginadorPuntos', () => {
  it('renderiza el número correcto de puntos', () => {
    render(<PaginadorPuntos total={5} current={2} />)
    expect(screen.getAllByRole('tab')).toHaveLength(5)
  })

  it('marca el punto actual como selected', () => {
    render(<PaginadorPuntos total={3} current={1} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
  })
})
