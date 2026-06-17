import { describe, it, expect } from 'vitest'
import { logros, proximosPasos, objetivosPorPlazo, avancePlazo } from './objetivos'
import type { Objetivo } from '@/types/domain'

const o = (id: string, plazo: Objetivo['plazo'], estado: Objetivo['estado'], peso = 1): Objetivo => ({
  id, proyecto_id: 'p', titulo: id, descripcion: null, tipo: 'hu', plazo, estado, peso,
  orden: 0, created_at: '', updated_at: '',
})

describe('objetivos helper', () => {
  const items = [
    o('a', 'corto', 'cumplido'),
    o('b', 'corto', 'pendiente'),
    o('c', 'mediano', 'en_progreso'),
  ]

  it('logros = cumplidos; próximos pasos = el resto', () => {
    expect(logros(items).map((x) => x.id)).toEqual(['a'])
    expect(proximosPasos(items).map((x) => x.id)).toEqual(['b', 'c'])
  })

  it('objetivosPorPlazo filtra por plazo', () => {
    expect(objetivosPorPlazo(items, 'corto').map((x) => x.id)).toEqual(['a', 'b'])
    expect(objetivosPorPlazo(items, 'largo')).toEqual([])
  })

  it('avancePlazo pondera por peso de cumplidos', () => {
    // corto: a(cumplido,1) + b(pendiente,1) = 1/2 = 50
    expect(avancePlazo(items, 'corto')).toBe(50)
    // largo: sin objetivos = 0
    expect(avancePlazo(items, 'largo')).toBe(0)
  })
})
