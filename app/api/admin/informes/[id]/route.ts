import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getDataClient } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = getDataClient()
  const informes = await client.getAllInformes()
  const informe = informes.find(i => i.id === id)
  if (!informe) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  return NextResponse.json(informe)
}
