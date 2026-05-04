import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('renderiza el porcentaje redondeado', () => {
    render(<ProgressRing value={73.4} color="#3B82F6" />)
    expect(screen.getByText('73%')).toBeInTheDocument()
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
