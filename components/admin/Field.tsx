import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

interface FieldProps {
  label: string
  htmlFor?: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Campo de formulario con label, ayuda opcional y ritmo vertical consistente.
 * Mantiene los forms "dicientes" y espaciados sin repetir markup.
 */
export function Field({
  label,
  htmlFor,
  description,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="flex items-center gap-1 text-xs font-medium">
        {label}
        {required && (
          <span className="text-[var(--color-alcaldia-naranja)]" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {description && (
        <p className="text-[11px] leading-snug text-[var(--color-text-muted)]">
          {description}
        </p>
      )}
    </div>
  )
}

interface FormSectionProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}

/** Bloque de formulario: encabezado + descripción + contenido en tarjeta. */
export function FormSection({
  title,
  description,
  action,
  className,
  children,
}: FormSectionProps) {
  return (
    <section
      className={cn('rounded-xl border', className)}
      style={{
        background: 'var(--color-surface-card)',
        borderColor: 'var(--color-surface-border)',
      }}
    >
      <header className="flex items-start justify-between gap-3 border-b px-5 py-3.5"
        style={{ borderColor: 'var(--color-surface-border)' }}
      >
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h2>
          {description && (
            <p className="text-[11px] leading-snug text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
