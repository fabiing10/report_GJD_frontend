import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const push = vi.fn()
let obj: string | null = 'o1'
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  usePathname: () => '/gestion/hu-1',
  useSearchParams: () => ({ get: (k: string) => (k === 'obj' ? obj : null) }),
}))

import { ObjetivoDrawer } from './ObjetivoDrawer'
import type { ObjetivoDetalle } from '@/types/domain'

const objetivos: ObjetivoDetalle[] = [
  {
    id: 'o1', proyecto_id: 'p1', titulo: 'Control sistémico', descripcion: 'Desc del objetivo',
    tipo: 'hu', plazo: 'corto', estado: 'cumplido', peso: 1, orden: 0, created_at: '', updated_at: '',
    actividades: [
      { id: 'a1', objetivo_id: 'o1', tipo: 'reunion', titulo: 'Kickoff', descripcion: null, fecha: '2026-02-12', estado: 'completada', responsable: null, orden: 0, created_at: '', updated_at: '' },
    ],
  },
]

describe('ObjetivoDrawer', () => {
  it('muestra el objetivo activo con su descripción y bitácora', () => {
    obj = 'o1'
    render(<ObjetivoDrawer objetivos={objetivos} colorHex="#3B82F6" />)
    expect(screen.getByText('Control sistémico')).toBeInTheDocument()
    expect(screen.getByText('Desc del objetivo')).toBeInTheDocument()
    expect(screen.getByText('Kickoff')).toBeInTheDocument()
  })

  it('no renderiza nada si no hay obj en la URL', () => {
    obj = null
    const { container } = render(<ObjetivoDrawer objetivos={objetivos} colorHex="#3B82F6" />)
    expect(container).toBeEmptyDOMElement()
  })
})
