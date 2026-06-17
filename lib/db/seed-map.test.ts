import { describe, it, expect } from 'vitest'
import { mapDataToPlan, parsePlazo } from './seed-map'

const data = {
  project: { name: 'Eco', subtitle: 'Sub', overallProgress: 30, lastUpdated: '2026-02-13' },
  categories: [
    {
      id: 'automatizacion', name: 'Gestión', description: 'desc',
      color: '#3b82f6', icon: '⚙️',
      activities: [
        {
          id: 'hu-1', name: 'HU-1 Gestión de Notificaciones', progress: 100,
          status: 'completado', phase: 'Corto plazo', description: 'larga',
          achievements: ['Logro A', 'Logro B'],
          nextSteps: ['Paso A'],
          video: 'recursos/videos/x.mp4',
        },
      ],
    },
  ],
}

describe('parsePlazo', () => {
  it('mapea texto de fase a enum', () => {
    expect(parsePlazo('Corto plazo')).toBe('corto')
    expect(parsePlazo('Mediano Plazo')).toBe('mediano')
    expect(parsePlazo('Largo plazo')).toBe('largo')
    expect(parsePlazo('algo raro')).toBe('corto')
  })
})

describe('mapDataToPlan', () => {
  const plan = mapDataToPlan(data)

  it('crea informe activo', () => {
    expect(plan.informe.titulo).toBe('Eco')
    expect(plan.informe.is_active).toBe(true)
  })

  it('crea componente con orden y color', () => {
    expect(plan.componentes).toHaveLength(1)
    expect(plan.componentes[0]!.slug).toBe('automatizacion')
    expect(plan.componentes[0]!.color_hex).toBe('#3b82f6')
    expect(plan.componentes[0]!.orden).toBe(0)
  })

  it('proyecto con código parseado y override, sin plazo ni criterios', () => {
    const p = plan.componentes[0]!.proyectos[0]!
    expect(p.codigo).toBe('HU-1')
    expect(p.avance_override).toBe(100)
    expect(p.estado).toBe('completado')
    expect(p).not.toHaveProperty('plazo')
    expect(p).not.toHaveProperty('criterios')
    expect(Array.isArray(p.objetivos)).toBe(true)
  })

  it('achievements→cumplido, nextSteps→pendiente, tipo hu, plazo y peso 1', () => {
    const objs = plan.componentes[0]!.proyectos[0]!.objetivos
    expect(objs.filter((o) => o.estado === 'cumplido').map((o) => o.titulo)).toEqual(['Logro A', 'Logro B'])
    expect(objs.filter((o) => o.estado === 'pendiente').map((o) => o.titulo)).toEqual(['Paso A'])
    expect(objs.every((o) => o.peso === 1)).toBe(true)
    expect(objs.every((o) => o.tipo === 'hu')).toBe(true)
    expect(objs.every((o) => o.plazo === 'corto')).toBe(true)
    expect(objs.map((o) => o.orden)).toEqual([0, 1, 2])
  })

  it('video → recurso video_url', () => {
    const rec = plan.componentes[0]!.proyectos[0]!.recursos
    expect(rec[0]!.tipo).toBe('video_url')
    expect(rec[0]!.url).toContain('.mp4')
  })
})
