import { describe, it, expect } from 'vitest'
import { logros, proximosPasos, objetivosPorPlazo, avancePlazo } from './objetivos'
import type { Objetivo } from '@/types/domain'

const o = (
  id: string,
  plazo: Objetivo['plazo'],
  estado: Objetivo['estado'],
  peso = 1,
  avance = 0
): Objetivo => ({
  id, proyecto_id: 'p', titulo: id, descripcion: null, tipo: 'hu', plazo, estado, peso,
  avance, fecha_inicio: null, fecha_limite: null, orden: 0, created_at: '', updated_at: '',
})

describe('objetivos helper', () => {
  const items = [
    o('a', 'corto', 'cumplido', 1, 100),
    o('b', 'corto', 'pendiente', 1, 0),
    o('c', 'mediano', 'en_progreso', 1, 50),
  ]

  it('logros = cumplidos; próximos pasos = el resto', () => {
    expect(logros(items).map((x) => x.id)).toEqual(['a'])
    expect(proximosPasos(items).map((x) => x.id)).toEqual(['b', 'c'])
  })

  it('objetivosPorPlazo filtra por plazo', () => {
    expect(objetivosPorPlazo(items, 'corto').map((x) => x.id)).toEqual(['a', 'b'])
    expect(objetivosPorPlazo(items, 'largo')).toEqual([])
  })

  it('avancePlazo = promedio ponderado de los % de avance', () => {
    // corto: (1×100 + 1×0) / 2 = 50
    expect(avancePlazo(items, 'corto')).toBe(50)
    // mediano: (1×50) / 1 = 50
    expect(avancePlazo(items, 'mediano')).toBe(50)
    // largo: sin objetivos = 0
    expect(avancePlazo(items, 'largo')).toBe(0)
  })
})
