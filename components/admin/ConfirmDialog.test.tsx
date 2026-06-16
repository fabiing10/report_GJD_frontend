import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

describe('ConfirmDialog', () => {
  it('muestra el trigger y abre el diálogo al hacer click', () => {
    render(
      <ConfirmDialog
        triggerLabel="Eliminar"
        title="¿Eliminar?"
        description="Esto borra en cascada."
        onConfirm={vi.fn()}
      />
    )
    const trigger = screen.getByRole('button', { name: 'Eliminar' })
    expect(trigger).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.getByText('¿Eliminar?')).toBeInTheDocument()
    expect(screen.getByText('Esto borra en cascada.')).toBeInTheDocument()
  })

  it('invoca onConfirm al confirmar', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined)
    render(<ConfirmDialog triggerLabel="Borrar" title="t" onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar' }))
    fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
    await vi.waitFor(() => expect(onConfirm).toHaveBeenCalled())
  })
})
