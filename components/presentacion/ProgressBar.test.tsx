import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('renderiza sin etiqueta por defecto', () => {
    const { container } = render(<ProgressBar value={50} color="#3B82F6" />)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('muestra label cuando showLabel=true', () => {
    render(<ProgressBar value={42} color="#3B82F6" showLabel />)
    expect(screen.getByText('42%')).toBeInTheDocument()
    expect(screen.getByText('Avance')).toBeInTheDocument()
  })
})
