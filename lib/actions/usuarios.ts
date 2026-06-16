'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { crearUsuarioSchema, cambiarRolSchema } from '@/lib/schemas'
import type { CrearUsuarioFormValues } from '@/lib/schemas'
import type { RoleEnum } from '@/types/domain'

const passwordSchema = z.string().min(8, 'Mínimo 8 caracteres')

export async function crearUsuario(input: CrearUsuarioFormValues): Promise<void> {
  await requireAdmin()
  const { email, password, full_name, role } = crearUsuarioSchema.parse(input)

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  // Si el usuario ya existe seguimos para poder ajustar su rol/perfil.
  if (error && !error.message.includes('already')) {
    throw new Error(error.message)
  }

  const userId = data.user?.id
  if (userId) {
    const { error: profileError } = await admin
      .from('profiles')
      .update({ role, full_name })
      .eq('id', userId)
    if (profileError) throw new Error(profileError.message)
  }

  revalidatePath('/admin/usuarios')
}

export async function cambiarRol(userId: string, role: RoleEnum): Promise<void> {
  await requireAdmin()
  const { role: validRole } = cambiarRolSchema.parse({ role })

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role: validRole })
    .eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

export async function resetearPassword(userId: string, password: string): Promise<void> {
  await requireAdmin()
  const validPassword = passwordSchema.parse(password)

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: validPassword,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}

export async function eliminarUsuario(userId: string): Promise<void> {
  await requireAdmin()

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/usuarios')
}
