import { describe, it, expect } from 'vitest'
import { slugify, formatFecha, colorTokenToHex, cn } from './utils'

describe('slugify', () => {
  it('convierte texto con espacios a kebab-case', () => {
    expect(slugify('Gestión de Notificaciones')).toBe('gestion-de-notificaciones')
  })

  it('convierte texto con tildes', () => {
    expect(slugify('Análisis Jurídico')).toBe('analisis-juridico')
  })

  it('maneja código de HU', () => {
    expect(slugify('HU-1')).toBe('hu-1')
  })

  it('elimina caracteres especiales', () => {
    expect(slugify('Automatización & Desarrollo')).toBe('automatizacion-desarrollo')
  })
})

describe('formatFecha', () => {
  it('formatea fecha ISO a formato es-CO legible', () => {
    const result = formatFecha('2026-02-13')
    expect(result).toContain('2026')
    expect(result).toContain('13')
  })

  it('incluye el nombre del mes', () => {
    const result = formatFecha('2026-02-13')
    expect(result.toLowerCase()).toContain('feb')
  })
})

describe('colorTokenToHex', () => {
  it('mapea blue a azul', () => {
    expect(colorTokenToHex('blue')).toBe('#3B82F6')
  })

  it('mapea rose a rosa', () => {
    expect(colorTokenToHex('rose')).toBe('#F43F5E')
  })

  it('retorna azul por defecto para token desconocido', () => {
    expect(colorTokenToHex('unknown')).toBe('#3B82F6')
  })
})

describe('cn', () => {
  it('combina clases correctamente', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resuelve conflictos de tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })
})
