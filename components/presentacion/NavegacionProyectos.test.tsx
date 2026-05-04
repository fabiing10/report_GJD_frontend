import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NavegacionProyectos } from './NavegacionProyectos'
import type { ProyectoDetalle } from '@/types/domain'

const mkProyecto = (slug: string, nombre: string): ProyectoDetalle => ({
  id: `id-${slug}`,
  componente_id: 'cid',
  slug,
  codigo: null,
  nombre,
  descripcion_corta: null,
  descripcion_larga: null,
  plazo: 'corto',
  estado: 'no_iniciado',
  avance: 0,
  avance_corto: null,
  avance_mediano: null,
  avance_largo: null,
  responsable: null,
  fecha_entrega: null,
  fecha_entrega_texto: null,
  orden: 0,
  created_at: '',
  updated_at: '',
  logros: [],
  proximos_pasos: [],
  recursos: [],
})

describe('NavegacionProyectos', () => {
  it('renderiza prev y next cuando ambos existen', () => {
    render(
      <NavegacionProyectos
        prev={mkProyecto('hu-1', 'HU-1')}
        next={mkProyecto('hu-3', 'HU-3')}
        componenteSlug="gestion-notificaciones"
      />
    )
    expect(screen.getByText(/HU-1/)).toBeInTheDocument()
    expect(screen.getByText(/HU-3/)).toBeInTheDocument()
  })

  it('renderiza solo next cuando prev es null', () => {
    render(
      <NavegacionProyectos
        prev={null}
        next={mkProyecto('hu-2', 'HU-2')}
        componenteSlug="gestion-notificaciones"
      />
    )
    expect(screen.getByText(/HU-2/)).toBeInTheDocument()
  })
})
