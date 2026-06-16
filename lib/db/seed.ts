/**
 * Seed de Supabase desde data.json.
 * Uso: pnpm seed   (requiere NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *                   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD en .env.local)
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createAdminClient } from '@/lib/supabase/admin'
import { mapDataToPlan } from './seed-map'

async function main() {
  const data = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data.json'), 'utf-8')
  ) as Parameters<typeof mapDataToPlan>[0]
  const plan = mapDataToPlan(data)
  const db = createAdminClient()

  const fail = (label: string, error: unknown) => {
    if (error) {
      console.error(`✗ ${label}:`, error)
      process.exit(1)
    }
  }

  // Limpieza idempotente (cascade desde informes).
  fail('limpiar informes', (await db.from('informes').delete().neq('id', '00000000-0000-0000-0000-000000000000')).error)

  // Informe
  const { data: informe, error: eInf } = await db
    .from('informes')
    .insert(plan.informe)
    .select('id')
    .single()
  fail('insertar informe', eInf)
  const informeId = (informe as { id: string }).id

  for (const comp of plan.componentes) {
    const { proyectos, ...compRow } = comp
    const { data: cRow, error: eC } = await db
      .from('componentes')
      .insert({ ...compRow, informe_id: informeId })
      .select('id')
      .single()
    fail(`componente ${comp.slug}`, eC)
    const componenteId = (cRow as { id: string }).id

    for (const proy of proyectos) {
      const { plazo, recursos, ...proyRow } = proy
      const { data: pRow, error: eP } = await db
        .from('proyectos')
        .insert({ ...proyRow, componente_id: componenteId })
        .select('id')
        .single()
      fail(`proyecto ${proy.slug}`, eP)
      const proyectoId = (pRow as { id: string }).id

      const { criterios, ...plazoRow } = plazo
      const { data: plRow, error: ePl } = await db
        .from('proyecto_plazos')
        .insert({ ...plazoRow, proyecto_id: proyectoId, orden: 0 })
        .select('id')
        .single()
      fail(`plazo ${proy.slug}`, ePl)
      const plazoId = (plRow as { id: string }).id

      if (criterios.length > 0) {
        fail(
          `criterios ${proy.slug}`,
          (await db.from('criterios').insert(
            criterios.map((c) => ({ ...c, proyecto_plazo_id: plazoId }))
          )).error
        )
      }
      if (recursos.length > 0) {
        fail(
          `recursos ${proy.slug}`,
          (await db.from('proyecto_recursos').insert(
            recursos.map((r) => ({ ...r, proyecto_id: proyectoId }))
          )).error
        )
      }
    }
  }

  // Usuario admin inicial
  const adminEmail = process.env['SEED_ADMIN_EMAIL']
  const adminPassword = process.env['SEED_ADMIN_PASSWORD']
  if (adminEmail && adminPassword) {
    const { data: created, error: eU } = await db.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    })
    if (eU && !String(eU.message).includes('already')) fail('crear admin', eU)
    const userId = created?.user?.id
    if (userId) {
      fail(
        'promover admin',
        (await db.from('profiles').update({ role: 'admin' }).eq('id', userId)).error
      )
    }
    console.log(`✓ Admin: ${adminEmail}`)
  } else {
    console.warn('⚠ Sin SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD: no se creó admin.')
  }

  console.log(`✓ Seed completo: ${plan.componentes.length} componentes.`)
}

main()
