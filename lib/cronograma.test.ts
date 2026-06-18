import { describe, it, expect } from 'vitest'
import { buildMeses, proyectoSpan, PLAZO_RANGE, TOTAL_MESES } from './cronograma'
import type { ProyectoDetalle, Objetivo } from '@/types/domain'

const obj = (plazo: Objetivo['plazo']): Objetivo => ({
  id: Math.random().toString(36), proyecto_id: 'p', titulo: 't', descripcion: null,
  tipo: 'hu', plazo, estado: 'pendiente', peso: 1, orden: 0, created_at: '', updated_at: '',
})

const proy = (over: Partial<ProyectoDetalle>): ProyectoDetalle => ({
  id: 'p1', componente_id: 'c1', slug: 'p1', codigo: null, nombre: 'P1',
  descripcion_corta: null, descripcion_larga: null, estado: 'en_progreso',
  avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null,
  orden: 0, created_at: '', updated_at: '', avance_calculado: 0, total_objetivos: 0,
  objetivos_cumplidos: 0, objetivos: [], recursos: [], ejes: [], ...over,
})

describe('cronograma', () => {
  it('buildMeses cubre Ene 2026 → Dic 2027 (24 meses)', () => {
    const meses = buildMeses()
    expect(meses).toHaveLength(TOTAL_MESES)
    expect(meses).toHaveLength(24)
    expect(meses[0]).toMatchObject({ year: 2026, month: 1 })
    expect(meses[23]).toMatchObject({ year: 2027, month: 12 })
  })

  it('PLAZO_RANGE divide los 24 meses en corto/mediano/largo', () => {
    expect(PLAZO_RANGE.corto).toEqual({ start: 0, end: 5 })
    expect(PLAZO_RANGE.mediano).toEqual({ start: 6, end: 11 })
    expect(PLAZO_RANGE.largo).toEqual({ start: 12, end: 23 })
  })

  it('span por fechas explícitas del proyecto', () => {
    const s = proyectoSpan(proy({ fecha_inicio: '2026-03-01', fecha_fin: '2026-08-31' }))
    expect(s).toEqual({ start: 2, end: 7 }) // mar 2026 (idx 2) → ago 2026 (idx 7)
  })

  it('span derivado del rango de plazos de los objetivos cuando no hay fechas', () => {
    const s = proyectoSpan(proy({ objetivos: [obj('corto'), obj('largo')] as ProyectoDetalle['objetivos'] }))
    expect(s).toEqual({ start: 0, end: 23 }) // corto.start .. largo.end
  })

  it('sin fechas ni objetivos → null', () => {
    expect(proyectoSpan(proy({}))).toBeNull()
  })
})
