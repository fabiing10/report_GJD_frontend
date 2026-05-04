import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ModoPresentacionBar } from './ModoPresentacionBar'
import { ModoPresentacionProvider } from './ModoPresentacionProvider'
import type { InformeConRelaciones } from '@/types/domain'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

const informe: InformeConRelaciones = {
  id: 'i1',
  titulo: 'Test',
  subtitulo: null,
  fecha_corte: '2026-02-13',
  avance_global_override: null,
  is_active: true,
  created_at: '',
  updated_at: '',
  avance_global_calculado: 30,
  componentes: [],
}

describe('ModoPresentacionBar', () => {
  it('renderiza el botón de salida', () => {
    render(
      <ModoPresentacionProvider>
        <ModoPresentacionBar informe={informe} />
      </ModoPresentacionProvider>
    )
    expect(
      screen.getByRole('button', { name: /Salir de presentación/i })
    ).toBeInTheDocument()
  })
})
