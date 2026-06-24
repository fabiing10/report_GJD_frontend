'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewSwitcher } from '@/components/ViewSwitcher'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AdminTopbarProps {
  email?: string
}

export function AdminTopbar({ email }: AdminTopbarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="h-12 flex items-center justify-between px-6 border-b shrink-0"
      style={{ background: 'var(--color-bg-elevated)', borderColor: 'var(--color-surface-border)' }}
    >
      <ViewSwitcher current="dashboard" />
      <div className="flex items-center gap-3">
        <p className="text-xs text-[var(--color-text-muted)]">{email ?? ''}</p>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs gap-1.5">
          <LogOut size={12} />
          Cerrar sesión
        </Button>
      </div>
    </header>
  )
}
