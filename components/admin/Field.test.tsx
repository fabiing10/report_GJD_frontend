import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Field, FormSection } from './Field'

describe('Field', () => {
  it('renderiza label, ayuda y marca requerido', () => {
    render(
      <Field label="Nombre" htmlFor="n" description="Como aparece en el reporte." required>
        <input id="n" />
      </Field>
    )
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Como aparece en el reporte.')).toBeInTheDocument()
    expect(screen.getByText('*')).toBeInTheDocument()
  })
})

describe('FormSection', () => {
  it('renderiza título, descripción y contenido', () => {
    render(
      <FormSection title="Datos" description="Información base del proyecto.">
        <span>contenido</span>
      </FormSection>
    )
    expect(screen.getByText('Datos')).toBeInTheDocument()
    expect(screen.getByText('Información base del proyecto.')).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
  })
})
