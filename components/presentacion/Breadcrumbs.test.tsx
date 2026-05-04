import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from './Breadcrumbs'

describe('Breadcrumbs', () => {
  it('renderiza enlaces y último item como texto', () => {
    render(
      <Breadcrumbs
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Componente', href: '/comp' },
          { label: 'HU-1' },
        ]}
      />
    )
    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.getByText('Componente')).toBeInTheDocument()
    expect(screen.getByText('HU-1')).toBeInTheDocument()
  })
})
