# Arquitectura del informe — Objetivos, Ejes y capa de presentación

**Fecha:** 2026-06-17
**Estado:** Diseño aprobado — pendiente plan
**Evoluciona:** el MER de `2026-06-16-migracion-supabase-roles-mer-design.md` (Supabase + RLS ya en producción)

## Objetivo

Evolucionar el modelo para tener **control completo del proyecto** y una capa de
presentación que proyecte primero lo estratégico y permita adentrarse en
Componente → Proyecto → Objetivo. El Objetivo de un proyecto es una **HU o
Funcionalidad** (unidad medible final). Se incorpora el concepto de **Eje
Transversal** (a nivel de dato; su vista cruzada se difiere).

## Jerarquía

```
Informe → Componente → Proyecto → Objetivo (HU/Funcionalidad) → Actividad (bitácora)
                          │
                          └── Eje Transversal (N:M, catálogo)   [dato listo, vista posterior]
```

Estado: en **Proyecto** y en **Objetivo**. Plazo: **atributo del Objetivo**
(corto/mediano/largo). "Estrategia de comunicación" del diagrama original era
solo el título de la estructura vertical, **no** una entidad.

## Cambios de modelo (vs. lo implementado hoy)

| Hoy | Nuevo | Acción |
|-----|-------|--------|
| `criterios` (bajo `proyecto_plazo`) | **`objetivos`** (bajo `proyecto`) | Renombrar/reframe + agregar `tipo`, `plazo` |
| `proyecto_plazos` (contenedor) | — | **Eliminar**; `plazo` pasa a columna del objetivo |
| `actividades.proyecto_id` (+plazo) | `actividades.objetivo_id` | Re-vincular al objetivo |
| — | `ejes_transversales` + `proyecto_ejes` | **Nuevo** (catálogo + N:M) |

### `objetivos` (reemplaza `criterios`)
`id`, `proyecto_id`, `titulo`, `descripcion`, `tipo` (`hu` | `funcionalidad`),
`plazo` (`corto`|`mediano`|`largo`), `estado` (`pendiente`|`en_progreso`|`cumplido`),
`peso` (numeric, default 1), `orden`, timestamps.

### `actividades` (re-vinculada)
`id`, `objetivo_id` (FK → objetivos), `tipo` (`reunion`|`tarea`|`investigacion`|`informe`),
`titulo`, `descripcion`, `fecha`, `estado`, `responsable`, `orden`, timestamps.
**No afecta el %.**

### `ejes_transversales` + `proyecto_ejes`
`ejes_transversales`: `id`, `nombre`, `color_hex`, `orden`.
`proyecto_ejes`: `proyecto_id` + `eje_id` (PK compuesta). Relación N:M.

### `proyectos`
Sin cambios estructurales (conserva `estado`, `avance_override`, fechas, etc.).
Se le asocian ejes vía `proyecto_ejes`.

## Fórmulas de avance (híbrido ponderado, igual que hoy pero sobre objetivos)

`override` siempre gana; `0` cuando no hay datos.
- **Proyecto**: `COALESCE(override, Σ peso[objetivo cumplido] / NULLIF(Σ peso, 0) × 100, 0)`
- **Componente**: `COALESCE(override, AVG(avance de proyectos), 0)`
- **Informe**: `COALESCE(override, AVG(avance de componentes), 0)`
- **Por plazo** (display en el detalle): mismo cálculo restringido a los objetivos de ese plazo.

Vistas SQL: `v_proyectos_con_avance`, `v_componentes_con_avance`, `v_informes_con_avance`
(recalculadas sobre `objetivos`). Se elimina `v_plazos_con_avance` (el plazo es atributo;
el avance por plazo se calcula en la lectura/vista de proyecto o en TS).

## Capa de presentación (drill-down vertical mejorado)

- **Home**: overview estratégico — % global, avance por componente, distribución
  por **plazo** y por **estado**, hitos. (Vista por Eje Transversal: fase posterior.)
- **Componente**: proyectos del componente con su avance.
- **Proyecto (detalle)**: **Objetivos agrupados por plazo** (corto/mediano/largo)
  con estado, + **bitácora** de actividades del objetivo. Navegación lateral entre
  proyectos y componentes siempre disponible.
- Se mantiene el flujo de navegación actual (home → componente → proyecto); se
  suma el nivel Objetivo y el overview.

## Migración de datos

- `criterios` → `objetivos`: mapeo directo conservando `texto`→`titulo`,
  `descripcion`, `estado`, `peso`. El `plazo` se toma del `proyecto_plazo` padre.
  `tipo` por defecto `hu` (ajustable luego).
- `actividades`: re-vincular `proyecto_plazo_id`/`proyecto_id` → el `objetivo_id`
  correspondiente (o al primer objetivo del proyecto si no hay vínculo claro;
  revisar caso por caso — hoy hay 0 actividades, así que sin riesgo).
- `ejes_transversales`: seed inicial vacío o con un catálogo base; asignación de
  proyectos a ejes se hace luego por backoffice.
- `data.json` / `seed.ts` / `seed-map.ts` se actualizan al nuevo modelo.

## Blast radius

- **DB**: nueva migración (tablas `objetivos`, `ejes_transversales`, `proyecto_ejes`;
  drop `criterios`, `proyecto_plazos`; ajuste `actividades`; vistas).
- **Tipos** (`types/domain.ts`), **schemas Zod** (`lib/schemas.ts`).
- **Lecturas**: `lib/db/queries.ts`, `lib/db/assemble.ts`, `lib/db/admin-queries.ts`,
  `lib/criterios.ts` → `lib/objetivos.ts`.
- **Reporte**: detalle de proyecto (objetivos por plazo), home overview,
  `PlazoTabs`/`ActividadesTabs`.
- **Backoffice**: editor de proyecto (objetivos con plazo c/u), actividades bajo
  objetivo, catálogo de ejes (dato; UI mínima o diferida).
- **Seed**: `seed.ts` + `seed-map.ts`.

## Escenarios observables

1. En el detalle de un proyecto, los Objetivos aparecen **agrupados por plazo** (corto/mediano/largo) con su estado.
2. Marcar un Objetivo `cumplido` sube el % del proyecto/componente/informe (ponderado) y se refleja en el reporte.
3. Un Objetivo tiene `tipo` (`hu`/`funcionalidad`) visible.
4. Una Actividad de bitácora se asocia a un Objetivo y **no** altera ningún %.
5. Un Proyecto puede tener varios Ejes Transversales asignados (dato), sin romper la vista actual.
6. La migración convierte los 82 criterios actuales en objetivos conservando estado/plazo/peso; el reporte sigue mostrando el mismo avance.
7. `override` en cualquier nivel sigue reemplazando el cálculo.

## Fuera de alcance (esta spec)

- Vista/navegación **por Eje Transversal** (cruzada) — solo se deja el dato.
- Sub-criterios de aceptación bajo el Objetivo (el Objetivo es la unidad final).
- Cambios de estructura de navegación más allá de sumar Objetivos + overview.
