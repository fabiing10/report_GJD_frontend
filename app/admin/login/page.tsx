'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const resp = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (resp.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await resp.json() as { error?: string }
        toast.error(data.error ?? 'Email no autorizado')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)]">
      <div
        className="w-full max-w-sm rounded-2xl p-8 border"
        style={{ background: 'var(--color-surface-card)', borderColor: 'var(--color-surface-border)' }}
      >
        <h1 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-2">
          Admin GJD
        </h1>
        <p className="text-xs text-[var(--color-text-muted)] mb-6">
          Acceso restringido al equipo autorizado
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email institucional</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="usuario@medellin.gov.co"
              required
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Verificando...' : 'Acceder'}
          </Button>
        </form>
      </div>
    </div>
  )
}
