# Migración a Supabase + roles — Plan de implementación

> Ejecución pragmática inline. Sin TDD ceremonial: vitest solo donde hay lógica pura; el resto se verifica corriendo la app contra Supabase.

**Goal:** Migrar el origen de datos a Supabase, hacer la gestión 100% por DB, agregar auth con roles `admin`/`usuario`, según `docs/superpowers/specs/2026-06-16-migracion-supabase-roles-mer-design.md`.

**Arquitectura:** Supabase único (se elimina SQLite). Postgres + RLS como capa de seguridad por rol. Acceso de datos server-side vía `@supabase/ssr`. Login obligatorio gestionado en `proxy.ts`.

**Stack:** Next.js 16, `@supabase/ssr`, `@supabase/supabase-js`, Postgres (Supabase).

---

## Prerrequisito (manual del usuario)

Crear un proyecto en Supabase (cloud) y entregar a la app, en `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo para el seed, nunca al cliente)

Hasta tener esto, todo el código queda escrito y listo; las tareas de aplicar
migración / seed / verificación runtime se ejecutan cuando lleguen las llaves.

## Fases

### Fase 1 — Schema en Supabase
- `supabase/migrations/0002_mer_dinamico.sql`: enums, tablas (`profiles`,
  `proyecto_plazos`, `criterios`, `actividades`, `actividad_criterios`),
  ajuste de `proyectos` (quitar `plazo`, `avance_*`), vistas de avance, triggers
  `updated_at`, índice único de informe activo.
- Reescribe `0001_initial_schema.sql`? No: se deja `0002` como migración nueva,
  pero como el proyecto aún no está desplegado, se consolida todo en un único
  `0001_initial_schema.sql` actualizado (más limpio). Borrar el `0001` viejo y
  reescribirlo completo con el MER final.

### Fase 2 — RLS + identidad
- En la misma migración: `role_enum`, función `is_admin()`, trigger
  `handle_new_user` (crea `profiles` al alta), políticas RLS (SELECT a
  autenticados; escritura solo admin; `profiles` self-read + admin).

### Fase 3 — Capa de datos en la app
- `lib/supabase/server.ts` (createServerClient), `lib/supabase/client.ts`
  (createBrowserClient), `lib/supabase/admin.ts` (service-role para seed).
- `types/domain.ts`: nuevos tipos.
- `lib/db/queries.ts`: lecturas del reporte. Eliminar `lib/db/{index,client,sqlite,supabase,seed,seed.test}.ts`, `sqlite-schema.sql`.
- Quitar `better-sqlite3` de package.json; borrar `local.db*`.

### Fase 4 — Auth + roles
- `proxy.ts`: patrón `@supabase/ssr` (getUser); redirige a `/login` sin sesión;
  `/admin/*` exige `role=admin`.
- `app/login/page.tsx` + acción de login (email+password). Reusar/retirar
  `app/admin/login` y `app/api/admin/auth`.
- Botón de logout.

### Fase 5 — Seed/migración de datos
- `lib/db/seed.ts` (reescrito): usa service-role; lee `data.json`; inserta
  informe/componentes/proyectos/plazos/criterios/recursos. `logros`→criterio
  `cumplido`, `proximos_pasos`→`pendiente`, `peso=1`. Crea 1 usuario admin.

### Fase 6 — Adaptar presentación a criterios
- Páginas/comp. que usaban `logros`/`proximos_pasos`/`avance_*`: derivar de
  criterios (`cumplido`→logro, resto→próximo paso). Helper puro
  `lib/criterios.ts` con test vitest.
- Afecta: detalle de proyecto, `PlazoTabs`, `PlazoTabsDetalle`,
  `ActividadesTabs`, `ProyectoCard`.

### Fase 7 — Portar admin existente a Supabase
- `lib/actions/*` y pantallas admin (`proyectos`, `componentes`, `informes`)
  contra Supabase. Sin UI nueva para criterios/plazos/actividades.

### Fase 8 — Verificación
- Correr migración + seed en Supabase. `pnpm dev`. Validar los 8 escenarios de
  la spec (login obligatorio, gating por rol, % ponderado, override, RLS anon).
- `pnpm test` verde. `pnpm build` sin errores.

## Orden de ejecución
1→2 (una migración), 3, 4, 6, 7 (código, sin credenciales) → 5, 8 (requieren
proyecto Supabase).
