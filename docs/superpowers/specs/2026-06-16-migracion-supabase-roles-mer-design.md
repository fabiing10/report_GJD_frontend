# Migración a Supabase + MER dinámico + roles

**Fecha:** 2026-06-16
**Estado:** Diseño aprobado — pendiente plan de implementación
**Proyecto:** GJD Informe (`gjd-informe`)

## Objetivo

Migrar el origen de datos de SQLite a Supabase para que toda la gestión de
componentes/proyectos sea 100% dinámica vía DB, replicar y enriquecer el MER
proyectado, y agregar autenticación con dos roles (`admin`, `usuario`). El
modelo se diseña anticipando un backoffice futuro; el backoffice en sí queda
fuera de alcance de esta spec.

## Decisiones (cerradas)

| # | Decisión | Valor |
|---|----------|-------|
| 1 | Cálculo de avance | Híbrido ponderado por criterios |
| 2 | Roll-up de plazos en proyecto | Ponderado por # de criterios (pool de pesos) |
| 3 | Roll-up componente / informe | Promedio de hijos, con override |
| 4 | Autenticación | Supabase Auth (email + password) |
| 5 | Alta de usuarios | Solo admin, sin registro público |
| 6 | Modelo de bitácora | Tabla única `actividades` + N:M con criterios |
| 7 | Driver de datos | Supabase único — se elimina SQLite |
| 8 | Acceso al reporte | Login obligatorio para todo |
| 9 | Roles y destino | `usuario` → reporte; `admin` → reporte + `/admin` (backoffice) |
| 10 | Logros / próximos pasos | Consolidados en `criterios` (derivados del estado) |

## Roles

- **`usuario`**: autenticarse y ver el reporte (solo lectura). Sin acceso a `/admin`.
- **`admin`**: ver el reporte + acceder al dashboard `/admin` para gestionar los
  resultados. En esta spec gestiona informes/componentes/proyectos (admin
  existente portado a Supabase). La gestión de criterios, plazos y actividades
  se sumará en la spec de backoffice.

## MER

```
auth.users (Supabase Auth) ──1:1── profiles { role: admin | usuario }

informes
  └─1:N─ componentes
           └─1:N─ proyectos
                    ├─1:N─ proyecto_plazos
                    │        └─1:N─ criterios ◄──┐
                    ├─1:N─ proyecto_recursos     │ N:M (actividad_criterios)
                    └─1:N─ actividades ──────────┘
```

### Capa de identidad

**`profiles`** (1:1 con `auth.users`)

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | uuid PK | FK → `auth.users(id)` ON DELETE CASCADE |
| `email` | text | espejo del correo de auth |
| `full_name` | text | nullable |
| `role` | `role_enum` | `admin` \| `usuario`, default `usuario` |
| `created_at` / `updated_at` | timestamptz | |

Trigger `on auth.users insert` crea automáticamente la fila `profiles` con
`role = 'usuario'`. La promoción a `admin` la hace otro admin (o seed inicial).

### Capa de reporte

**`informes`** — sin cambios respecto a hoy.

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `titulo` | text NOT NULL |
| `subtitulo` | text |
| `fecha_corte` | date NOT NULL |
| `avance_global_override` | numeric(5,2) |
| `is_active` | boolean (índice único parcial: un solo activo) |
| `created_at` / `updated_at` | timestamptz |

**`componentes`** — sin cambios respecto a hoy.

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `informe_id` | uuid FK → informes CASCADE |
| `slug` | text — `unique(informe_id, slug)` |
| `nombre` | text NOT NULL |
| `descripcion` | text |
| `icono` | text NOT NULL |
| `color_hex` | text NOT NULL |
| `color_token` | text NOT NULL |
| `orden` | integer NOT NULL |
| `avance_override` | numeric(5,2) |
| `created_at` / `updated_at` | timestamptz |

**`proyectos`** — refinado. Se eliminan `plazo` y `avance_corto/mediano/largo`
(migran a `proyecto_plazos`).

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `componente_id` | uuid FK → componentes CASCADE |
| `slug` | text — `unique(componente_id, slug)` |
| `codigo` | text |
| `nombre` | text NOT NULL |
| `descripcion_corta` | text |
| `descripcion_larga` | text |
| `estado` | `estado_enum` default `no_iniciado` |
| `avance_override` | numeric(5,2) |
| `responsable` | text |
| `fecha_inicio` | date |
| `fecha_fin` | date |
| `orden` | integer NOT NULL default 0 |
| `created_at` / `updated_at` | timestamptz |

**`proyecto_plazos`** (NUEVA) — la fase/horizonte con su línea de tiempo.

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `proyecto_id` | uuid FK → proyectos CASCADE |
| `plazo` | `plazo_enum` (`corto`\|`mediano`\|`largo`) — `unique(proyecto_id, plazo)` |
| `fecha_inicio` | date |
| `fecha_fin` | date |
| `avance_override` | numeric(5,2) |
| `orden` | integer NOT NULL default 0 |

**`criterios`** (NUEVA) — criterios de aceptación = objetivos estratégicos.
Consolida los antiguos `logros` y `proximos_pasos`.

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `proyecto_plazo_id` | uuid FK → proyecto_plazos CASCADE |
| `texto` | text NOT NULL |
| `descripcion` | text |
| `peso` | numeric(6,2) NOT NULL default 1 — peso para el cálculo ponderado |
| `estado` | `criterio_estado_enum` (`pendiente`\|`en_progreso`\|`cumplido`) default `pendiente` |
| `orden` | integer NOT NULL default 0 |
| `created_at` / `updated_at` | timestamptz |

Render en el reporte: `cumplido` → "Logro alcanzado"; `pendiente`/`en_progreso`
→ "Próximo paso". Solo `cumplido` suma al porcentaje.

**`actividades`** (NUEVA) — bitácora operativa. No afecta el porcentaje.

| Columna | Tipo |
|---------|------|
| `id` | uuid PK |
| `proyecto_id` | uuid FK → proyectos CASCADE |
| `proyecto_plazo_id` | uuid FK → proyecto_plazos SET NULL (nullable) |
| `tipo` | `actividad_tipo_enum` (`reunion`\|`tarea`\|`investigacion`\|`informe`) |
| `titulo` | text NOT NULL |
| `descripcion` | text |
| `fecha` | date |
| `estado` | `actividad_estado_enum` (`pendiente`\|`en_progreso`\|`completada`) |
| `responsable` | text |
| `orden` | integer NOT NULL default 0 |
| `created_at` / `updated_at` | timestamptz |

**`actividad_criterios`** (NUEVA, N:M) — trazabilidad actividad → criterio.

| Columna | Tipo |
|---------|------|
| `actividad_id` | uuid FK → actividades CASCADE |
| `criterio_id` | uuid FK → criterios CASCADE |
| | PK compuesta (`actividad_id`, `criterio_id`) |

**`proyecto_recursos`** — sin cambios respecto a hoy (`video_url`\|`imagen`\|`link`).

### ENUMs

`role_enum`, `plazo_enum`, `estado_enum`, `criterio_estado_enum`,
`actividad_tipo_enum`, `actividad_estado_enum`, `recurso_tipo_enum`.

## Fórmulas de porcentaje (vistas SQL)

El `override` siempre tiene prioridad sobre el cálculo. `0` cuando no hay datos.

- **Plazo** (`v_plazos_con_avance`, para display):
  `COALESCE(override, Σ peso[estado=cumplido] / NULLIF(Σ peso, 0) × 100, 0)`
- **Proyecto** (`v_proyectos_con_avance`, ponderado sobre TODOS sus criterios de
  todos sus plazos):
  `COALESCE(override, Σ peso[cumplido] / NULLIF(Σ peso total, 0) × 100, 0)`
- **Componente** (`v_componentes_con_avance`):
  `COALESCE(override, AVG(avance de sus proyectos), 0)` + conteos de actividades.
- **Informe** (`v_informes_con_avance`):
  `COALESCE(override, AVG(avance de sus componentes), 0)`

## Autenticación, roles y RLS

- **Supabase Auth** con email + password. Signup público deshabilitado; las
  cuentas las crea el admin (dashboard de Supabase o seed en esta spec).
- **Función helper** `is_admin()` → consulta `profiles.role` por `auth.uid()`.
- **RLS en todas las tablas del reporte** (informes, componentes, proyectos,
  proyecto_plazos, criterios, actividades, actividad_criterios, proyecto_recursos):
  - `SELECT`: cualquier usuario autenticado.
  - `INSERT` / `UPDATE` / `DELETE`: solo `is_admin()`.
- **`profiles`**: cada usuario lee su propia fila; admin lee todas; solo admin
  modifica `role`.
- **Anon (sin sesión)**: sin acceso a ninguna tabla → reporte invisible sin login.
- **`proxy.ts`** se reescribe: valida sesión de Supabase en todas las rutas;
  redirige a `/login` si no hay sesión; `/admin/*` exige `role = admin`.

## Migración y blast radius

### Se elimina
- Dependencia `better-sqlite3` y `@types/better-sqlite3`.
- `lib/db/sqlite.ts`, `lib/db/sqlite-schema.sql`, `lib/db/seed.ts` (versión sqlite),
  `lib/db/seed.test.ts`.
- `local.db`, `local.db-shm`, `local.db-wal`.
- Factory `lib/db/index.ts` + `lib/db/client.ts` (interfaz DataClient + selección
  de driver).

### Se agrega
- `@supabase/ssr` + `@supabase/supabase-js`.
- Clientes Supabase server-side y browser-side (`lib/supabase/server.ts`,
  `lib/supabase/client.ts`).
- `lib/db/queries.ts` — funciones de lectura del reporte (server).
- Migraciones SQL en `supabase/migrations/` (schema + enums + vistas + triggers
  + RLS + función `is_admin()` + trigger de `profiles`).
- Script de seed/migración de datos: lee `data.json` → puebla Supabase. Mapeo:
  `logros` → criterios `cumplido`; `proximos_pasos` → criterios `pendiente`;
  `peso` por defecto = 1; `avance_corto/mediano/largo` previos → `proyecto_plazos`.

### Se adapta
- `proxy.ts`, `app/admin/login/page.tsx`, `app/api/admin/auth/route.ts` → Supabase Auth.
- Páginas/componentes que consumían `logros`/`proximos_pasos` → criterios:
  `app/(presentacion)/[componenteSlug]/[proyectoSlug]/page.tsx`,
  `components/presentacion/PlazoTabs.tsx`, `PlazoTabsDetalle.tsx`,
  `ActividadesTabs.tsx`, `ProyectoCard.tsx`.
- `lib/actions/*` y pantallas admin existentes (`proyectos`, `componentes`,
  `informes`) → reescritas contra Supabase.
- `types/domain.ts` → nuevos tipos (`Profile`, `ProyectoPlazo`, `Criterio`,
  `Actividad`) y ajuste de `Proyecto`/`ProyectoDetalle`.
- `.env.example` / `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, y service-role key para el seed.

### Consumidores y docs afectados
- Toda ruta bajo `app/(presentacion)/*` (ahora requiere sesión).
- Memoria del proyecto `project_gjd_informe.md` (auth, datos, arquitectura
  cambian) — actualizar tras implementar.

## Escenarios observables (criterios de aceptación de la spec)

1. Un visitante sin sesión que abre `/` es redirigido a `/login`.
2. Un `usuario` autenticado ve el reporte completo pero al abrir `/admin` es
   rechazado/redirigido.
3. Un `admin` autenticado ve el reporte y accede a `/admin`.
4. El % de un plazo refleja `Σ peso[cumplido] / Σ peso × 100`; marcar un criterio
   como `cumplido` sube el % del plazo, del proyecto, del componente y del informe.
5. Un `avance_override` en cualquier nivel reemplaza el cálculo automático.
6. Una actividad de bitácora vinculada a un criterio no altera ningún porcentaje.
7. Tras el seed desde `data.json`, los 6 componentes y sus proyectos aparecen en
   el reporte con el mismo contenido (logros → criterios cumplidos).
8. Un cliente no autenticado que consulta la API/DB de Supabase no obtiene filas
   (RLS bloquea anon).

## Fuera de alcance (esta spec)

- Backoffice completo: CRUD de criterios, plazos y actividades desde la app.
- Gestión de usuarios desde la app (se hace por dashboard de Supabase).
- Visualización de la bitácora de actividades en el reporte.

## Riesgos y notas

- **Dev depende de Supabase**: al eliminar SQLite, el desarrollo local apunta a un
  proyecto Supabase (cloud o, opcionalmente más adelante, CLI local con Docker).
- **Cambio de UX**: el reporte deja de ser público. Requiere crear al menos un
  usuario admin inicial vía seed para no quedar bloqueados.
- **Migración de datos**: el mapeo logros/pasos → criterios asume `peso = 1`; los
  pesos reales se ajustan luego (o en el backoffice).
