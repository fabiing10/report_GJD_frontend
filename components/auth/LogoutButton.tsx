'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({
  className,
  collapsed = false,
  label = 'Salir',
}: {
  className?: string
  /** Modo icon-rail: solo el ícono, con tooltip. */
  collapsed?: boolean
  label?: string
}) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        title={label}
        aria-label={label}
        className={
          className ??
          'flex w-full items-center justify-center py-2.5 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-primary)]'
        }
      >
        <LogOut size={16} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label={label}
      className={
        className ??
        'inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors'
      }
    >
      <LogOut size={14} />
      <span>{label}</span>
    </button>
  )
}
