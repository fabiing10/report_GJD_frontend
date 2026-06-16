import { describe, it, expect } from 'vitest'
import { assembleInforme } from './assemble'
import type {
  InformeConAvance,
  ComponenteConAvance,
  ProyectoConAvance,
  PlazoConAvance,
  Criterio,
  ProyectoRecurso,
  Actividad,
} from '@/types/domain'

const informe: InformeConAvance = {
  id: 'i1', titulo: 'T', subtitulo: null, fecha_corte: '2026-01-01',
  avance_global_override: null, is_active: true,
  created_at: '', updated_at: '', avance_global_calculado: 30,
}
const comp = (id: string, orden: number): ComponenteConAvance => ({
  id, informe_id: 'i1', slug: id, nombre: id, descripcion: null, icono: '⚡',
  color_hex: '#000', color_token: 'x', orden, avance_override: null,
  created_at: '', updated_at: '', avance_calculado: 0,
  total_actividades: 0, actividades_completadas: 0,
})
const proy = (id: string, comp_id: string, orden: number): ProyectoConAvance => ({
  id, componente_id: comp_id, slug: id, codigo: null, nombre: id,
  descripcion_corta: null, descripcion_larga: null, estado: 'en_progreso',
  avance_override: null, responsable: null, fecha_inicio: null, fecha_fin: null,
  orden, created_at: '', updated_at: '', avance_calculado: 50,
  total_plazos: 1, total_criterios: 2, criterios_cumplidos: 1,
})
const plazo = (id: string, proy_id: string): PlazoConAvance => ({
  id, proyecto_id: proy_id, plazo: 'corto', fecha_inicio: null, fecha_fin: null,
  avance_override: null, orden: 0, avance_calculado: 50,
  total_criterios: 2, criterios_cumplidos: 1,
})
const crit = (id: string, plazo_id: string, orden: number): Criterio => ({
  id, proyecto_plazo_id: plazo_id, texto: id, descripcion: null, peso: 1,
  estado: 'cumplido', orden, created_at: '', updated_at: '',
})

describe('assembleInforme', () => {
  it('arma el árbol informe→componentes→proyectos→plazos→criterios ordenado', () => {
    const result = assembleInforme(
      informe,
      [comp('c2', 1), comp('c1', 0)],
      [proy('p1', 'c1', 0)],
      [plazo('pl1', 'p1')],
      [crit('cr2', 'pl1', 1), crit('cr1', 'pl1', 0)],
      [],
      []
    )
    expect(result.componentes.map((c) => c.id)).toEqual(['c1', 'c2'])
    expect(result.componentes[0]!.proyectos[0]!.id).toBe('p1')
    expect(result.componentes[0]!.proyectos[0]!.plazos[0]!.criterios.map((x) => x.id))
      .toEqual(['cr1', 'cr2'])
    expect(result.componentes[1]!.proyectos).toEqual([])
  })

  it('adjunta recursos y actividades al proyecto correcto', () => {
    const recurso: ProyectoRecurso = {
      id: 'r1', proyecto_id: 'p1', tipo: 'link', titulo: null,
      url: 'http://x', thumbnail_url: null, duracion_segundos: null, orden: 0,
    }
    const actividad: Actividad = {
      id: 'a1', proyecto_id: 'p1', proyecto_plazo_id: null, tipo: 'reunion',
      titulo: 'Kickoff', descripcion: null, fecha: null, estado: 'completada',
      responsable: null, orden: 0, created_at: '', updated_at: '',
    }
    const result = assembleInforme(
      informe, [comp('c1', 0)], [proy('p1', 'c1', 0)],
      [plazo('pl1', 'p1')], [], [recurso], [actividad]
    )
    const p = result.componentes[0]!.proyectos[0]!
    expect(p.recursos.map((r) => r.id)).toEqual(['r1'])
    expect(p.actividades.map((a) => a.id)).toEqual(['a1'])
  })
})
