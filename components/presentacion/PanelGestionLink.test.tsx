import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PanelGestionLink } from './PanelGestionLink'

describe('PanelGestionLink', () => {
  it('admin expandido: muestra el switcher con acceso al Dashboard y al Reporte', () => {
    render(<PanelGestionLink isAdmin />)
    const dashboard = screen.getByRole('link', { name: /dashboard/i })
    expect(dashboard).toHaveAttribute('href', '/admin')
    const reporte = screen.getByRole('link', { name: /reporte/i })
    expect(reporte).toHaveAttribute('href', '/')
  })

  it('admin colapsado: muestra solo el ícono con acceso al Dashboard', () => {
    render(<PanelGestionLink isAdmin collapsed />)
    const link = screen.getByRole('link', { name: /dashboard/i })
    expect(link).toHaveAttribute('href', '/admin')
  })

  it('no-admin: no renderiza nada', () => {
    const { container } = render(<PanelGestionLink isAdmin={false} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
