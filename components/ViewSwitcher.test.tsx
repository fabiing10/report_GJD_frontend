import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ViewSwitcher } from './ViewSwitcher'

describe('ViewSwitcher', () => {
  it('enlaza Reporte (/) y Dashboard (/admin)', () => {
    render(<ViewSwitcher current="reporte" />)
    expect(screen.getByRole('link', { name: /reporte/i })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/admin')
  })

  it('marca la vista actual con aria-current', () => {
    const { rerender } = render(<ViewSwitcher current="reporte" />)
    expect(screen.getByRole('link', { name: /reporte/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current')

    rerender(<ViewSwitcher current="dashboard" />)
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /reporte/i })).not.toHaveAttribute('aria-current')
  })
})
