# Backoffice de gestión GJD — Diseño

**Fecha:** 2026-06-16
**Estado:** Aprobado — en ejecución
**Depende de:** `2026-06-16-migracion-supabase-roles-mer-design.md` (Supabase + MER + RLS ya implementados)

## Objetivo

Backoffice en `/admin` (solo rol `admin`) para gestionar toda la información del
reporte: informes, componentes, proyectos, plazos, criterios, recursos,
actividades (bitácora) y usuarios. Modelo de navegación **híbrido drill-down**.

## Arquitectura

- **Server Actions** (`lib/actions/*`) con el **cliente server (sesión del usuario)**.
  La RLS existente (escritura solo `is_admin()`) es la única capa de permisos.
- **Validación Zod** en cada action (`lib/schemas.ts`).
- **Usuarios**: las acciones de alta usan `service_role` (Auth Admin API) server-side
  y **verifican primero que el caller sea admin** (service-role salta RLS).
- **% derivado**: el admin lee de las vistas `v_*_con_avance`; cualquier cambio en
  criterios recalcula el avance automáticamente.
- **Refresco**: `revalidatePath('/', 'layout')` + ruta admin tras cada mutación.
- **Reordenamiento**: drag-and-drop con `@dnd-kit` (ya en deps); persiste `orden`.
- **Borrado**: modal de confirmación que advierte la cascada.

## Navegación

Sidebar: `Dashboard · Informes · Componentes · Proyectos · Actividades · Usuarios`.
La edición fina (plazos/criterios/recursos/bitácora) vive en el **editor de Proyecto**.

## Entidades y acciones

- **Informes** (`/admin/informes`): crear, editar (título, subtítulo, fecha_corte,
  avance_global_override), activar (único activo), duplicar (copia profunda), eliminar.
- **Componentes** (`/admin/componentes`): CRUD + reorder. Campos: nombre, slug,
  descripción, icono, color_hex, color_token, orden, avance_override.
- **Proyectos** (`/admin/proyectos`): lista filtrable por componente; CRUD básico +
  reorder; click → editor drill-down.
- **Editor de Proyecto** (`/admin/proyectos/[id]`):
  - Datos: código, nombre, slug, descripción corta/larga, estado, responsable,
    fecha_inicio/fin, orden, avance_override.
  - Plazos: agregar/quitar (corto/mediano/largo), fechas, override por plazo.
    Criterios por plazo: texto, descripción, peso, estado (pendiente/en_progreso/
    cumplido), orden — CRUD + reorder, con % recalculado en vivo.
  - Recursos: CRUD (tipo, título, url, thumbnail, orden).
  - Bitácora: actividades del proyecto (CRUD) + vínculo opcional a criterios.
- **Actividades** (`/admin/actividades`): vista global filtrable; CRUD.
- **Usuarios** (`/admin/usuarios`): lista de profiles (email, rol); crear usuario,
  cambiar rol, resetear contraseña, eliminar.

## Estructura de archivos

- `lib/actions/{informes,componentes,proyectos,plazos,criterios,recursos,actividades,usuarios}.ts`
- `lib/db/admin-queries.ts`, `lib/schemas.ts` (Zod), `lib/auth.ts` (requireAdmin)
- `app/admin/(auth)/{informes,componentes,proyectos,actividades,usuarios}/…`
- `components/admin/*` (tablas, formularios, repeaters, listas dnd, modales)

## Escenarios observables

1. Criterio `pendiente→cumplido` → sube el % en plazo/proyecto/componente/informe y el reporte público lo refleja.
2. Criterio con peso 2 → el ponderado cambia acorde.
3. Reordenar componentes (dnd) → orden persiste en el reporte.
4. Activar otro informe → solo uno activo; el reporte cambia.
5. Crear usuario rol `usuario` → entra y ve el reporte, no `/admin`.
6. Promover a `admin` → accede a `/admin`.
7. `usuario` que invoca una server action de escritura → RLS la rechaza.
8. Borrar componente → confirma y elimina en cascada.
9. Crear/editar/eliminar una actividad de bitácora → no altera ningún %.

## Fuera de alcance

Subida de archivos a Storage (recursos = URLs), auditoría/historial, i18n, notificaciones.

## Plan de fases (build)

A. Infra: `lib/auth.ts` (requireAdmin), `lib/schemas.ts`, `lib/db/admin-queries.ts`, sidebar.
B. Informes CRUD + activar/duplicar.
C. Componentes CRUD + reorder.
D. Proyectos lista + editor drill-down (plazos, criterios, recursos, bitácora).
E. Actividades global.
F. Usuarios.
G. QA runtime (9 escenarios) + build + tests.
