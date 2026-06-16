import { describe, it, expect } from 'vitest'
import { decideRedirect } from './access'

describe('decideRedirect', () => {
  it('sin sesión y ruta protegida → /login', () => {
    expect(decideRedirect('/', false, null)).toBe('/login')
    expect(decideRedirect('/analitica', false, null)).toBe('/login')
    expect(decideRedirect('/admin', false, null)).toBe('/login')
  })

  it('sin sesión en /login → no redirige', () => {
    expect(decideRedirect('/login', false, null)).toBeNull()
  })

  it('con sesión visitando /login → home', () => {
    expect(decideRedirect('/login', true, 'usuario')).toBe('/')
  })

  it('usuario no-admin en /admin → home', () => {
    expect(decideRedirect('/admin', true, 'usuario')).toBe('/')
    expect(decideRedirect('/admin/proyectos', true, 'usuario')).toBe('/')
  })

  it('admin en /admin → no redirige', () => {
    expect(decideRedirect('/admin', true, 'admin')).toBeNull()
  })

  it('usuario autenticado en el reporte → no redirige', () => {
    expect(decideRedirect('/', true, 'usuario')).toBeNull()
    expect(decideRedirect('/analitica', true, 'usuario')).toBeNull()
  })
})
