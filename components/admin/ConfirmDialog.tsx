'use client'

import { useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ConfirmDialogProps {
  triggerLabel: string
  title: string
  description?: string
  confirmLabel?: string
  triggerVariant?: 'ghost' | 'outline' | 'destructive'
  onConfirm: () => Promise<void> | void
}

export function ConfirmDialog({
  triggerLabel,
  title,
  description,
  confirmLabel = 'Confirmar',
  triggerVariant = 'ghost',
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button variant={triggerVariant} size="sm" className="text-xs" />}
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Cancelar
          </DialogClose>
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? '…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
