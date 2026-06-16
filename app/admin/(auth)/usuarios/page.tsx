import { getAllProfiles } from '@/lib/db/admin-queries'
import { UsuariosClient } from '@/components/admin/UsuariosClient'

export default async function UsuariosPage() {
  const profiles = await getAllProfiles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)]">
          Usuarios
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Gestión de cuentas y roles del backoffice.
        </p>
      </div>

      <UsuariosClient profiles={profiles} />
    </div>
  )
}
