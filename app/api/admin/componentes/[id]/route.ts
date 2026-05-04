import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDataClient } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = getDataClient()
  const informe = await client.getInformeActivo()
  if (!informe) return NextResponse.json({ error: 'Sin informe activo' }, { status: 404 })

  const componente = informe.componentes.find(c => c.id === id)
  if (!componente) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json(componente)
}
