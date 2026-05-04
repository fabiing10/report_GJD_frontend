import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

describe('Footer', () => {
  it('muestra fecha de corte formateada y botón Presentar', () => {
    render(<Footer fechaCorte="2026-02-13" onPresentar={vi.fn()} />)
    expect(screen.getByText(/Corte:/)).toBeInTheDocument()
    expect(screen.getByText('Presentar')).toBeInTheDocument()
  })
})
