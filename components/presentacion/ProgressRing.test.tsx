import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('renderiza el porcentaje redondeado, en blanco (no el color del anillo)', () => {
    render(<ProgressRing value={73.4} color="#3B82F6" />)
    const num = screen.getByText('73%')
    expect(num).toBeInTheDocument()
    expect(num).toHaveStyle({ color: 'var(--color-text-primary)' })
  })

  it('renderiza con label opcional', () => {
    render(<ProgressRing value={50} color="#3B82F6" label="Avance" />)
    expect(screen.getByText('Avance')).toBeInTheDocument()
  })

  it('soporta tamaños sm/md/lg', () => {
    const { rerender } = render(
      <ProgressRing value={20} color="#3B82F6" size="sm" />
    )
    rerender(<ProgressRing value={20} color="#3B82F6" size="md" />)
    rerender(<ProgressRing value={20} color="#3B82F6" size="lg" />)
    expect(screen.getByText('20%')).toBeInTheDocument()
  })
})
