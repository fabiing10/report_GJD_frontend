import { describe, it, expect } from 'vitest'
import { logros, proximosPasos, criteriosDeProyecto, criteriosPorPlazo } from './criterios'
import type { Criterio, PlazoDetalle } from '@/types/domain'

const c = (id: string, estado: Criterio['estado']): Criterio => ({
  id, proyecto_plazo_id: 'pl', texto: id, descripcion: null, peso: 1,
  estado, orden: 0, created_at: '', updated_at: '',
})

describe('criterios helper', () => {
  it('logros = solo cumplidos; próximos pasos = el resto', () => {
    const items = [c('a', 'cumplido'), c('b', 'pendiente'), c('c', 'en_progreso')]
    expect(logros(items).map((x) => x.id)).toEqual(['a'])
    expect(proximosPasos(items).map((x) => x.id)).toEqual(['b', 'c'])
  })

  it('criteriosDeProyecto aplana todos los plazos', () => {
    const plazos: PlazoDetalle[] = [
      { id: 'pl1', proyecto_id: 'p', plazo: 'corto', fecha_inicio: null, fecha_fin: null,
        avance_override: null, orden: 0, avance_calculado: 0, total_criterios: 1,
        criterios_cumplidos: 1, criterios: [c('a', 'cumplido')] },
      { id: 'pl2', proyecto_id: 'p', plazo: 'mediano', fecha_inicio: null, fecha_fin: null,
        avance_override: null, orden: 1, avance_calculado: 0, total_criterios: 1,
        criterios_cumplidos: 0, criterios: [c('b', 'pendiente')] },
    ]
    expect(criteriosDeProyecto(plazos).map((x) => x.id)).toEqual(['a', 'b'])
    expect(criteriosPorPlazo(plazos, 'mediano').map((x) => x.id)).toEqual(['b'])
    expect(criteriosPorPlazo(plazos, 'largo')).toEqual([])
  })
})
