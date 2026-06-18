import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelGestionLink } from './PanelGestionLink'

describe('PanelGestionLink', () => {
  it('admin: renderiza el enlace al panel de gestión', () => {
    render(<PanelGestionLink isAdmin />)
    const link = screen.getByRole('link', { name: /panel de gestión/i })
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('no-admin: no renderiza nada', () => {
    const { container } = render(<PanelGestionLink isAdmin={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
