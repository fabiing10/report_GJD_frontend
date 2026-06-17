'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/admin/Field'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import type { Profile, RoleEnum } from '@/types/domain'
import {
  crearUsuario,
  cambiarRol,
  resetearPassword,
  eliminarUsuario,
} from '@/lib/actions/usuarios'

interface UsuariosClientProps {
  profiles: Profile[]
}

export function UsuariosClient({ profiles }: UsuariosClientProps) {
  const router = useRouter()

  return (
    <div className="rounded-xl border overflow-hidden" style={cardStyle}>
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: 'var(--color-surface-border)' }}
      >
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {profiles.length} {profiles.length === 1 ? 'usuario' : 'usuarios'}
        </p>
        <NuevoUsuarioDialog onDone={() => router.refresh()} />
      </div>

      <Table>
        <TableHeader>
          <TableRow
            className="hover:bg-transparent"
            style={{ borderColor: 'var(--color-surface-border)' }}
          >
            <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Email
            </TableHead>
            <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Nombre
            </TableHead>
            <TableHead className="px-3 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Rol
            </TableHead>
            <TableHead className="px-3 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((p) => (
            <TableRow
              key={p.id}
              className="hover:bg-white/[0.02]"
              style={{ borderColor: 'var(--color-surface-border)' }}
            >
              <TableCell className="px-3 py-2.5 text-[var(--color-text-primary)]">
                {p.email ?? '—'}
              </TableCell>
              <TableCell className="px-3 py-2.5 text-[var(--color-text-secondary)]">
                {p.full_name ?? '—'}
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <RolBadge role={p.role} />
              </TableCell>
              <TableCell className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <CambiarRolSelect
                    userId={p.id}
                    role={p.role}
                    onDone={() => router.refresh()}
                  />
                  <ResetPasswordDialog
                    userId={p.id}
                    email={p.email}
                    onDone={() => router.refresh()}
                  />
                  <ConfirmDialog
                    triggerLabel="Eliminar"
                    triggerVariant="destructive"
                    title="¿Eliminar usuario?"
                    description={`Se eliminará ${p.email ?? 'este usuario'} de forma permanente.`}
                    confirmLabel="Eliminar"
                    onConfirm={async () => {
                      await eliminarUsuario(p.id)
                      toast.success('Usuario eliminado')
                      router.refresh()
                    }}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function RolBadge({ role }: { role: RoleEnum }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{
        background: 'rgba(255,255,255,0.06)',
        color: isAdmin ? '#3B82F6' : 'var(--color-text-muted)',
      }}
    >
      {isAdmin ? 'Admin' : 'Usuario'}
    </span>
  )
}

function CambiarRolSelect({
  userId,
  role,
  onDone,
}: {
  userId: string
  role: RoleEnum
  onDone: () => void
}) {
  const [pending, setPending] = useState(false)

  const handleChange = async (value: RoleEnum | null) => {
    if (!value || value === role) return
    setPending(true)
    try {
      await cambiarRol(userId, value)
      toast.success('Rol actualizado')
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setPending(false)
    }
  }

  return (
    <Select value={role} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger size="sm" className="w-28 text-xs">
        <SelectValue placeholder="Rol" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="usuario">Usuario</SelectItem>
      </SelectContent>
    </Select>
  )
}

function NuevoUsuarioDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<RoleEnum>('usuario')

  const reset = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('usuario')
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await crearUsuario({
        email,
        password,
        full_name: fullName.trim() === '' ? null : fullName.trim(),
        role,
      })
      toast.success('Usuario creado')
      reset()
      setOpen(false)
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>+ Nuevo usuario</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Crea una cuenta y asigna su rol.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <Field
            label="Email"
            htmlFor="nuevo-email"
            description="Con este correo iniciará sesión."
            required
          >
            <Input
              id="nuevo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
            />
          </Field>
          <Field
            label="Contraseña"
            htmlFor="nuevo-password"
            description="Mínimo 8 caracteres."
            required
          >
            <Input
              id="nuevo-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
          <Field
            label="Nombre"
            htmlFor="nuevo-nombre"
            description="Nombre completo para mostrar. Opcional."
          >
            <Input
              id="nuevo-nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo (opcional)"
            />
          </Field>
          <Field
            label="Rol"
            htmlFor="nuevo-rol"
            description="Admin gestiona todo; Usuario solo consulta."
          >
            <Select
              value={role}
              onValueChange={(v) => {
                if (v) setRole(v)
              }}
            >
              <SelectTrigger id="nuevo-rol">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button size="sm" disabled={loading} onClick={handleSubmit}>
            {loading ? '…' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  userId,
  email,
  onDone,
}: {
  userId: string
  email: string | null
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await resetearPassword(userId, password)
      toast.success('Contraseña actualizada')
      setPassword('')
      setOpen(false)
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" className="text-xs" />}
      >
        Resetear contraseña
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          <DialogDescription>
            Nueva contraseña para {email ?? 'este usuario'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <Field
            label="Nueva contraseña"
            htmlFor="reset-password"
            description="Mínimo 8 caracteres. Reemplaza la actual."
            required
          >
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button size="sm" disabled={loading} onClick={handleSubmit}>
            {loading ? '…' : 'Actualizar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const cardStyle = {
  background: 'var(--color-surface-card)',
  borderColor: 'var(--color-surface-border)',
} as const
