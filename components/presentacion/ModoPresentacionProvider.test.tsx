import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  ModoPresentacionProvider,
  useModoPresentacion,
} from './ModoPresentacionProvider'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

function Probe() {
  const { isActive, slides } = useModoPresentacion()
  return (
    <div>
      <span data-testid="active">{String(isActive)}</span>
      <span data-testid="count">{slides.length}</span>
    </div>
  )
}

describe('ModoPresentacionProvider', () => {
  it('expone valores por defecto', () => {
    render(
      <ModoPresentacionProvider>
        <Probe />
      </ModoPresentacionProvider>
    )
    expect(screen.getByTestId('active').textContent).toBe('false')
    expect(screen.getByTestId('count').textContent).toBe('0')
  })
})
