import { describe, it, expect } from 'vitest'
import { assembleInforme } from './assemble'
import type {
  InformeConAvance,
  ComponenteConAvance,
  ProyectoConAvance,
  Objetivo,
  Actividad,
  ProyectoRecurso,
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
  total_objetivos: 1, objetivos_cumplidos: 1,
})
const obj = (id: string, proy_id: string, orden: number): Objetivo => ({
  id, proyecto_id: proy_id, titulo: id, descripcion: null, tipo: 'hu',
  plazo: 'corto', estado: 'cumplido', peso: 1, orden, created_at: '', updated_at: '',
})

describe('assembleInforme', () => {
  it('arma informe→componentes→proyectos→objetivos ordenado', () => {
    const result = assembleInforme(
      informe,
      [comp('c2', 1), comp('c1', 0)],
      [proy('p1', 'c1', 0)],
      [obj('o2', 'p1', 1), obj('o1', 'p1', 0)],
      [],
      []
    )
    expect(result.avance_global_calculado).toBe(30)
    expect(result.componentes.map((c) => c.id)).toEqual(['c1', 'c2'])
    expect(result.componentes[0]!.proyectos[0]!.id).toBe('p1')
    expect(result.componentes[0]!.proyectos[0]!.avance_calculado).toBe(50)
    expect(result.componentes[0]!.proyectos[0]!.objetivos.map((o) => o.id)).toEqual(['o1', 'o2'])
    expect(result.componentes[0]!.proyectos[0]!.objetivos[0]!.plazo).toBe('corto')
    expect(result.componentes[0]!.proyectos[0]!.objetivos[0]!.tipo).toBe('hu')
    expect(result.componentes[0]!.proyectos[0]!.ejes).toEqual([])
    expect(result.componentes[1]!.proyectos).toEqual([])
  })

  it('adjunta actividades al objetivo y recursos al proyecto', () => {
    const recurso: ProyectoRecurso = {
      id: 'r1', proyecto_id: 'p1', tipo: 'link', titulo: null,
      url: 'http://x', thumbnail_url: null, duracion_segundos: null, orden: 0,
    }
    const actividad: Actividad = {
      id: 'a1', objetivo_id: 'o1', tipo: 'reunion', titulo: 'Kickoff',
      descripcion: null, fecha: null, estado: 'completada', responsable: null,
      orden: 0, created_at: '', updated_at: '',
    }
    const result = assembleInforme(
      informe, [comp('c1', 0)], [proy('p1', 'c1', 0)],
      [obj('o1', 'p1', 0)], [actividad], [recurso]
    )
    const p = result.componentes[0]!.proyectos[0]!
    expect(p.objetivos).toHaveLength(1)
    expect(p.objetivos[0]!.actividades.map((a) => a.id)).toEqual(['a1'])
    expect(p.recursos.map((r) => r.id)).toEqual(['r1'])
  })
})
