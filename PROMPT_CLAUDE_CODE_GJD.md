# Prompt para Claude Code — Ecosistema de Gestión Jurídica Digital

> **Cómo usar este prompt:** copia este archivo a la raíz de tu repo nuevo (vacío) como `INITIAL_PROMPT.md` y abre Claude Code en ese directorio. Comienza con: *"Lee `INITIAL_PROMPT.md` completo, hazme las preguntas que necesites para implementar lo descrito y procede por fases. Confirma cada fase antes de pasar a la siguiente."*

---

## 1. Contexto y propósito

Soy Fabian, líder técnico del proyecto **Gestión Jurídica Digital** en la **Secretaría General del Distrito Especial de Ciencia, Tecnología e Innovación de Medellín** (Alcaldía de Medellín). Este proyecto coordina la transformación tecnológica de los procesos jurídicos de la Secretaría, articulando sus dos subsecretarías (Prevención del Daño Antijurídico, y Defensa y Protección de lo Público) con sistemas de información (Helena, Hermes, Mercurio, Visor 360, Astrea, SAMAI), automatizaciones y un ecosistema de interoperabilidad con la Rama Judicial.

Necesito construir una **aplicación web de informe ejecutivo** que permita presentar los avances del proyecto al Secretario General. La audiencia es **gerencial**, no operativa: la app debe comunicar **dimensión, avance y dirección estratégica**, no micro-tareas.

Hubo una primera versión que se perdió (los capturas adjuntos en `/docs/references/` son de esa versión). Reemplaza esa versión con una mejor.

## 2. Filosofía del producto

- **Visual y dimensional.** Quien la mira debe sentir el tamaño del proyecto en 5 segundos: cuántos componentes, cuánto avance global, qué está completo, qué está en progreso.
- **Editable rápido.** El equipo debe poder cambiar porcentajes, fechas y descripciones en minutos, no horas. Cero compilación para actualizar contenido.
- **Foco gerencial.** Cada vista responde "¿qué le diría al Secretario en una frase?" antes de mostrar detalle.
- **Branding institucional.** Es producto de la Alcaldía de Medellín. Sobrio, profesional, no juguetón.

## 3. Stack técnico (no negociable)

| Capa | Tecnología | Justificación |
|---|---|---|
| Framework | **Next.js 15** (App Router, RSC) + TypeScript estricto | SSR para SEO interno y velocidad |
| UI | **Tailwind CSS 4** + **shadcn/ui** (estilo `new-york`) | Velocidad + consistencia |
| Animaciones | **Framer Motion** | Transiciones entre slides, progress rings animados |
| Charts | **Recharts** o SVG nativo (preferir SVG nativo para donuts simples) | Donuts y barras minimalistas |
| Backend | **Supabase** (PostgreSQL + auto-API + Storage + Auth) | Sin código backend propio |
| Cliente Supabase | `@supabase/ssr` (no usar `@supabase/auth-helpers-nextjs` que está deprecated) | App Router moderno |
| Iconos | **Lucide React** + emojis nativos para los iconos de componente | Sobriedad |
| Tipografía | **Inter** (variable) para texto, **Inter Tight** para titulares | Claridad institucional |
| Hosting | Configurable para Vercel y self-hosted (Dokploy + Hetzner) | El usuario tiene infra propia |

**Configuración inicial obligatoria:**
- TypeScript en modo `strict` con `noUncheckedIndexedAccess: true`.
- ESLint + Prettier con preset `next/core-web-vitals`.
- Variables de entorno: `.env.local` para dev, `.env.example` versionado.
- `next.config.ts` con `images.remotePatterns` configurado para Supabase Storage.

## 4. Modelo de datos (Supabase)

Genera un archivo `supabase/migrations/0001_initial_schema.sql` con el siguiente esquema. Crea las tablas exactamente con estos nombres y columnas. Habilita RLS en todas y crea policies de lectura pública + edición autenticada.

```sql
-- =========================
-- INFORMES (cortes de fecha)
-- =========================
create table informes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  subtitulo text,
  fecha_corte date not null,
  avance_global_override numeric(5,2), -- si null, se calcula desde componentes
  is_active boolean default false, -- solo uno activo a la vez
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- COMPONENTES ESTRATÉGICOS
-- =========================
create table componentes (
  id uuid primary key default gen_random_uuid(),
  informe_id uuid references informes(id) on delete cascade not null,
  slug text not null, -- "gestion-notificaciones", "automatizacion-desarrollo", etc
  nombre text not null,
  descripcion text,
  icono text not null, -- emoji: ⚙️, 🔭, 🔗, 📊, 📁, 🤖
  color_hex text not null, -- hex con #
  color_token text not null, -- "blue", "purple", "cyan", "violet", "slate", "rose"
  orden integer not null,
  avance_override numeric(5,2), -- si null, calcula desde proyectos
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(informe_id, slug)
);

-- =========================
-- PROYECTOS / HISTORIAS DE USUARIO
-- =========================
create type plazo_enum as enum ('corto', 'mediano', 'largo');
create type estado_enum as enum ('completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado');

create table proyectos (
  id uuid primary key default gen_random_uuid(),
  componente_id uuid references componentes(id) on delete cascade not null,
  codigo text, -- "HU-1", "HU-7", null si no aplica
  nombre text not null,
  descripcion_corta text, -- una línea para cards
  descripcion_larga text, -- markdown para detalle
  plazo plazo_enum not null,
  estado estado_enum not null default 'no_iniciado',
  avance numeric(5,2) not null default 0, -- 0-100
  responsable text,
  fecha_entrega date,
  fecha_entrega_texto text, -- "Por estimar", "30 mayo", etc — flexible
  orden integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- LOGROS Y PRÓXIMOS PASOS (bullets por proyecto)
-- =========================
create table proyecto_logros (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade not null,
  texto text not null,
  orden integer not null default 0
);

create table proyecto_proximos_pasos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade not null,
  texto text not null,
  orden integer not null default 0
);

-- =========================
-- RECURSOS VISUALES (videos, imágenes, links externos)
-- =========================
create type recurso_tipo_enum as enum ('video_url', 'imagen', 'link');

create table proyecto_recursos (
  id uuid primary key default gen_random_uuid(),
  proyecto_id uuid references proyectos(id) on delete cascade not null,
  tipo recurso_tipo_enum not null,
  titulo text,
  url text not null, -- URL externa (Teams/SharePoint/YouTube/etc)
  thumbnail_url text,
  duracion_segundos integer,
  orden integer not null default 0
);

-- =========================
-- VIEWS PARA CÁLCULOS AGREGADOS
-- =========================
create view v_componentes_con_avance as
select
  c.*,
  coalesce(c.avance_override, avg(p.avance)) as avance_calculado,
  count(p.id) as total_actividades,
  count(p.id) filter (where p.estado = 'completado') as actividades_completadas
from componentes c
left join proyectos p on p.componente_id = c.id
group by c.id;

create view v_informes_con_avance as
select
  i.*,
  coalesce(i.avance_global_override, avg(vc.avance_calculado)) as avance_global_calculado
from informes i
left join v_componentes_con_avance vc on vc.informe_id = i.id
group by i.id;

-- =========================
-- RLS
-- =========================
alter table informes enable row level security;
alter table componentes enable row level security;
alter table proyectos enable row level security;
alter table proyecto_logros enable row level security;
alter table proyecto_proximos_pasos enable row level security;
alter table proyecto_recursos enable row level security;

-- Lectura pública (cualquiera puede ver el informe)
create policy "lectura publica" on informes for select using (true);
create policy "lectura publica" on componentes for select using (true);
create policy "lectura publica" on proyectos for select using (true);
create policy "lectura publica" on proyecto_logros for select using (true);
create policy "lectura publica" on proyecto_proximos_pasos for select using (true);
create policy "lectura publica" on proyecto_recursos for select using (true);

-- Escritura solo autenticados
create policy "escritura autenticados" on informes for all using (auth.role() = 'authenticated');
create policy "escritura autenticados" on componentes for all using (auth.role() = 'authenticated');
create policy "escritura autenticados" on proyectos for all using (auth.role() = 'authenticated');
create policy "escritura autenticados" on proyecto_logros for all using (auth.role() = 'authenticated');
create policy "escritura autenticados" on proyecto_proximos_pasos for all using (auth.role() = 'authenticated');
create policy "escritura autenticados" on proyecto_recursos for all using (auth.role() = 'authenticated');

-- Trigger para updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_informes_updated_at before update on informes for each row execute procedure update_updated_at_column();
create trigger update_componentes_updated_at before update on componentes for each row execute procedure update_updated_at_column();
create trigger update_proyectos_updated_at before update on proyectos for each row execute procedure update_updated_at_column();
```

## 5. Datos seed reales

Genera `supabase/seed.sql` con los datos reales del proyecto. **Usa exactamente estos componentes y estos proyectos** (extraídos de la hoja de ruta oficial):

### Informe activo
- Título: `Ecosistema de Gestión Jurídica Digital`
- Subtítulo: `Informe de Avance — Secretaría General de Medellín`
- Fecha de corte: usa la fecha actual al momento de seed

### Componentes (en este orden)

| Slug | Nombre | Icono | Color token | Hex | Descripción |
|---|---|---|---|---|---|
| `gestion-notificaciones` | Gestión de Notificaciones | ⚙️ | blue | `#3B82F6` | Flujo de automatización, clasificación y extracción de notificaciones judiciales |
| `automatizacion-desarrollo` | Automatización & Desarrollo | 🔭 | purple | `#8B5CF6` | Automatización documental para cumplimiento de fallos y revisión de decretos presupuestales |
| `interoperabilidad` | Interoperabilidad | 🔗 | cyan | `#06B6D4` | Articulación con la Rama Judicial para integración de sistemas y notificaciones |
| `analitica-datos` | Analítica de Datos | 📊 | violet | `#A855F7` | Estrategia de datos, lago de información y modelos de Machine Learning |
| `gestion-documental` | Gestión Documental | 📁 | slate | `#64748B` | Expediente digital y digitalización de archivos físicos integrados |
| `inteligencia-artificial` | Inteligencia Artificial | 🤖 | rose | `#F43F5E` | Capa transversal de IA aplicada a clasificación, proyección y predicción |

### Proyectos (HUs) — usa estos datos exactos

**Componente: Gestión de Notificaciones**
- HU-1 Gestión de Notificaciones · Corto plazo · Completado · 100% · Innovación Digital/GLab · 13 feb 2026
- HU-2 Clasificación Automática · Corto plazo · Completado · 100% · Innovación Digital/GLab · 29 abr 2026
- HU-3 Extracción de Texto (ETL) · Corto plazo · Completado · 100% · Innovación Digital/GLab · 29 abr 2026
- HU-7 Conciliaciones y Procesos Judiciales · Corto plazo · En progreso · 80% · Hacienda/GLab · 30 may 2026
- HU-4 Integración de Asignación · Mediano plazo · En progreso · 50% · Erik Neftali (Helena) · Por estimar

**Componente: Automatización & Desarrollo**
- Cumplimiento de Fallos Judiciales · Corto plazo · En progreso · 12% · Hacienda/GLab · 30 may 2026
- Migración Hermes · Corto plazo · En progreso · 20% · Hacienda/GLab · 27 abr 2026
- HU - Pagos de Sentencias (Implementación) · Mediano plazo · No iniciado · 0% · Hacienda/GLab (Juliana) · 30 may 2026
- HU - Comité de Conciliación · Largo plazo · No iniciado · 0% · Innovación Digital/GLab · Por estimar

**Componente: Interoperabilidad**
- Integración Rama Judicial · Corto plazo · En progreso · 20% · Subsecretaría Defensa y Protección · Por estimar
- HU - Consulta Automatizada Rama Judicial · Mediano plazo · No iniciado · 0% · Por definir · Por estimar
- HU - Migración de Datos e Integración Completa · Largo plazo · No iniciado · 0% · Innovación Digital/GLab · Por estimar

**Componente: Analítica de Datos**
- HU - Lago de Datos Centralizado (Fase 1) · Corto plazo · En progreso · 45% · Miguel Villegas/Mónica · Por definir
- HU - Estandarización Helena/Hermes · Corto plazo · En progreso · 40% · Hacienda/GLab · 1 may 2026
- HU - Reporte de Indicadores Operativos · Corto plazo · En progreso · 30% · Miguel Villegas/GLab · Por definir
- HU - Lago de Datos (Fase 2) · Mediano plazo · No iniciado · 0% · Innovación Digital/GLab · Por estimar
- Implementación de Modelos de ML · Largo plazo · No iniciado · 0% · Miguel Villegas/GLab · Por estimar

**Componente: Gestión Documental**
- Recomendaciones para Expediente Digital · Corto plazo · En progreso · 20% · Contrato CES / Componente 2 · Por definir

**Componente: Inteligencia Artificial**
- HU - Clasificación de Notificaciones con IA · Mediano plazo · No iniciado · 0% · Innovación Digital/GLab · Por estimar
- Proyección Avanzada con IA · Largo plazo · No iniciado · 0% · Innovación Digital/GLab · Por estimar

Para cada proyecto **completado** o **en progreso**, agrega 3-4 logros y 2-3 próximos pasos placeholder (deja TODOs claros para que yo los llene después).

## 6. Estructura de rutas y páginas

```
app/
├── (presentacion)/
│   ├── layout.tsx                    # Layout con header tabs + footer (zoom + corte + botón Presentar)
│   ├── page.tsx                      # Home: Portada con donut global + grid de componentes
│   ├── [componenteSlug]/
│   │   ├── page.tsx                  # Vista de componente: hero + grid de proyectos
│   │   └── [proyectoSlug]/
│   │       └── page.tsx              # Detalle de proyecto: progress + logros + pasos + recurso visual
├── linea-tiempo/
│   └── page.tsx                      # Vista timeline: roadmap completo en una sola pantalla
├── admin/
│   ├── layout.tsx                    # Layout admin con sidebar + topbar (logout)
│   ├── page.tsx                      # Dashboard admin (stats + accesos rápidos)
│   ├── login/
│   │   └── page.tsx                  # Login con Magic Link (Supabase Auth)
│   ├── informes/
│   │   ├── page.tsx                  # Lista de informes con toggle activo
│   │   └── [id]/
│   │       └── page.tsx              # Edit informe + duplicar
│   ├── componentes/
│   │   ├── page.tsx                  # Lista con drag-and-drop para reordenar
│   │   └── [id]/
│   │       └── page.tsx              # Edit componente
│   └── proyectos/
│       ├── page.tsx                  # Tabla con filtros + edición inline (% y estado)
│       └── [id]/
│           └── page.tsx              # Form completo con tabs (4 secciones)
├── api/
│   └── informe-activo/route.ts       # Endpoint que devuelve el informe activo + relaciones
├── layout.tsx                        # Root layout (fonts + providers + Sonner)
├── middleware.ts                     # Protege /admin/* (whitelist de emails)
└── globals.css                       # Tokens de diseño (ver §7)

components/
├── presentacion/
│   ├── HeaderTabs.tsx                # Navegación entre componentes (estilo de la imagen 2)
│   ├── Footer.tsx                    # Zoom + botón "Presentar" + fecha de corte
│   ├── ModoPresentacionProvider.tsx  # Context que controla el estado de presentación
│   ├── ModoPresentacionBar.tsx       # Mini-barra superior visible solo en modo presentación
│   ├── ProgressRing.tsx              # Donut SVG animado con % en el centro
│   ├── ProgressBar.tsx               # Barra horizontal con gradient por color de componente
│   ├── ComponenteCard.tsx            # Card del home con icono, % y barra
│   ├── ProyectoCard.tsx              # Card de HU con donut pequeño, badge de plazo y descripción
│   ├── EstadoBadge.tsx               # Pill: Completado/En progreso/No iniciado
│   ├── Breadcrumbs.tsx               # Inicio › Componente › HU-X
│   ├── NavegacionProyectos.tsx       # Botones Prev/Next entre HUs del componente
│   ├── RecursoVisual.tsx             # Embed de iframe (Teams/SharePoint/YouTube)
│   ├── PaginadorPuntos.tsx           # Dots indicador (ver imágenes 2-11 al pie)
│   └── EstrellasFondo.tsx            # Background con puntos sutiles tipo constelación
└── admin/
    ├── AdminSidebar.tsx              # Sidebar con secciones (Dashboard, Informes, etc)
    ├── AdminTopbar.tsx               # Topbar con email del usuario + logout
    ├── ProyectoDataTable.tsx         # Tabla con TanStack Table + filtros + inline edit
    ├── ProyectoForm.tsx              # Form RHF + Zod con 4 tabs
    ├── BulletRepeater.tsx            # Repeater para logros y próximos pasos (con drag)
    ├── RecursoRepeater.tsx           # Repeater para recursos visuales con preview
    └── ComponenteSortableList.tsx    # Lista de componentes con dnd-kit
```

## 7. Sistema de diseño

### Tokens (en `globals.css`)

```css
@theme {
  /* Fondo y superficies */
  --color-bg-base: #0A1228;        /* azul marino casi negro, igual a las imágenes */
  --color-bg-elevated: #111A33;
  --color-surface-card: rgba(20, 30, 60, 0.45);
  --color-surface-card-hover: rgba(28, 42, 80, 0.6);
  --color-surface-border: rgba(99, 130, 200, 0.15);

  /* Texto */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #64748B;

  /* Componentes (tonos, no colores duros) */
  --color-comp-blue: #3B82F6;       /* Gestión Notificaciones */
  --color-comp-purple: #8B5CF6;     /* Automatización & Desarrollo */
  --color-comp-cyan: #06B6D4;       /* Interoperabilidad */
  --color-comp-violet: #A855F7;     /* Analítica de Datos */
  --color-comp-slate: #94A3B8;      /* Gestión Documental */
  --color-comp-rose: #F43F5E;       /* Inteligencia Artificial */

  /* Estados */
  --color-estado-completado: #22C55E;
  --color-estado-en-progreso: #3B82F6;
  --color-estado-no-iniciado: #64748B;
  --color-estado-bloqueado: #EF4444;

  /* Branding institucional */
  --color-alcaldia-naranja: #F97316;

  /* Tipografía */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter Tight', 'Inter', sans-serif;
}
```

### Reglas visuales

1. **Fondo:** SVG sutil con puntos blancos a baja opacidad (constelación), animados con `prefers-reduced-motion` respetado. Ver imágenes adjuntas — ese es el look exacto.
2. **Cards:** `bg-surface-card backdrop-blur-md border border-surface-border rounded-2xl`. Hover sube el `surface-card-hover` con transición de 200ms.
3. **Tipografía de números (porcentajes):** display font, peso 600, tabular-nums, color del componente al que pertenecen.
4. **ProgressRing:** SVG con dos paths circulares. Path de fondo a 8% opacidad, path de progreso con `stroke-dasharray` animado en mount con Framer Motion (1.2s ease-out). Tamaños: `sm` (48px), `md` (96px), `lg` (200px).
5. **Donuts y barras** usan **siempre** el color del componente al que representan, nunca un color genérico.
6. **Iconos de componente:** se renderizan como emoji nativo a tamaño grande (96-120px) con `filter: drop-shadow(0 0 24px <color>33)` para glow sutil.
7. **Transiciones entre páginas:** Framer Motion `AnimatePresence` con fade + slide-up de 12px, 250ms.

## 8. Funcionalidades específicas por vista

### 8.1 Home / Portada (`/`)

Layout idéntico a **imagen 1** de las referencias:

- Logo del proyecto **arriba centrado** (subir el archivo a `public/logo-gjd.svg` — yo lo proveo, deja un placeholder).
- Título grande: `Ecosistema de Gestión Jurídica Digital`.
- Subtítulo: `Informe de Avance — Secretaría General de Medellín`.
- **Donut grande central** con el avance global calculado (200px).
- **Grid de 6 cards** (3 columnas en desktop, 2 en tablet, 1 en mobile), una por componente:
  - Icono emoji a la izquierda
  - Nombre del componente
  - `N actividades` (count de proyectos)
  - Barra de progreso fina con gradient del color del componente
  - `%` arriba a la derecha en el color del componente
- Click en card → navega a `/[componenteSlug]`.

### 8.2 Vista de Componente (`/[componenteSlug]`)

Layout idéntico a **imagen 2**:

- **Header con tabs** (navegación entre los 6 componentes). El tab activo es el del componente actual, con fondo del color del componente y glow sutil.
- Logo de proyecto arriba a la izquierda (mini, 40px).
- Hero centrado: emoji icono + nombre del componente + descripción corta.
- **Barra de progreso grande** con `%` del componente.
- **Grid de cards de proyectos/HUs** (3 columnas):
  - Donut pequeño (sm) con `%`
  - `Código + nombre` del proyecto
  - Badge de plazo (`Corto plazo`, `Mediano plazo`, `Largo plazo`)
  - Badge de estado (`Completado`, `En progreso`, etc.)
  - 2 líneas de descripción truncadas
- Click en card → `/[componenteSlug]/[proyectoSlug]`.
- Footer con `PaginadorPuntos` indicando posición dentro de los 6 componentes.

### 8.3 Detalle de Proyecto (`/[componenteSlug]/[proyectoSlug]`)

Layout idéntico a **imágenes 3-11**:

- Header con tabs (mismo).
- **Breadcrumbs:** `Inicio › [Componente] › [HU-X]`.
- Layout en 3 columnas en desktop (1 col en mobile):
  - **Izquierda:** ProgressRing grande con `%`, badge de estado debajo, badge de plazo debajo.
  - **Centro:** Card "Logros Alcanzados" con barra naranja vertical a la izquierda y bullets con check verde.
  - **Derecha:** Card "Próximos Pasos" con bullets con flecha azul.
- Sección **"Recurso Visual"** abajo, full-width, con:
  - Barra naranja vertical a la izquierda del título
  - Player embebido si hay recurso (URL externa → iframe; storage → `<video>`).
  - Si hay múltiples recursos, slider con `PaginadorPuntos` debajo del player.
- Abajo a la izquierda: botón "← HU anterior". Abajo a la derecha: "HU siguiente →". Calcula prev/next dentro del **mismo componente** ordenado por `orden`.
- Footer con `PaginadorPuntos` indicando posición dentro de las HUs del componente.

### 8.4 Línea de tiempo (`/linea-tiempo`)

Vista nueva (no estaba en la versión anterior). Es una vista **horizontal** que muestra **todos los componentes y proyectos en una sola pantalla** organizados por plazo:

```
        CORTO PLAZO          MEDIANO PLAZO        LARGO PLAZO
        (Q1-Q2 2026)         (Q3-Q4 2026)         (2027)
        ─────────────────────────────────────────────────────►
                                              ▼ HOY (línea vertical)
[Comp 1] ●─●─●─●─[80%]──────●─[50%]─────────────────────
[Comp 2] ●─[20%]────────────●─[0%]────────────●─[0%]────
[Comp 3] ●─[20%]────────────●─[0%]────────────●─[0%]────
[Comp 4] ●─●─●─[avg 38%]────●─[0%]────────────●─[0%]────
[Comp 5] ●─[20%]──────────────────────────────────────────
[Comp 6] ─────────────────────●─[0%]──────────●─[0%]────
```

Cada punto es un proyecto. Color = color del componente. Tamaño del punto = avance (más grande = más avance). Hover → tooltip con nombre + %. Click → navega al detalle. Línea vertical "HOY" se calcula desde `fecha_corte` del informe activo.

### 8.5 Modo presentación

Activación **explícita** desde un botón visible en el footer (centro): icono `Maximize` de Lucide + texto "Presentar". También accesible con el atajo `F` en cualquier vista.

**Al activarse:**
1. Solicita pantalla completa al navegador (`document.documentElement.requestFullscreen()`).
2. Estado de presentación se guarda en un Context (`ModoPresentacionProvider`).
3. Se ocultan: `HeaderTabs`, `Breadcrumbs`, `Footer` normal, `NavegacionProyectos` (botones prev/next inline).
4. Se muestra `ModoPresentacionBar` en la esquina superior derecha (semi-transparente, blur):
   - Texto: `Slide N de Total` (ej: "Slide 4 de 23")
   - `PaginadorPuntos` mini que muestra el componente actual
   - Botón ícono `X` para salir (también funciona Esc)

**Atajos de teclado globales (siempre activos en presentación):**
- `←` / `↑` — slide anterior
- `→` / `↓` / `Espacio` — slide siguiente
- `F` — toggle fullscreen
- `Esc` — sale de modo presentación
- `Home` — vuelve a la portada
- `End` — va a la línea de tiempo (última slide)

**Orden lógico de slides** (calculado en cliente desde el informe activo):
```
Home
  → Componente 1 (overview)
    → HU 1.1 → HU 1.2 → ... → HU 1.N
  → Componente 2 (overview)
    → HU 2.1 → ... → HU 2.N
  → ... (los 6 componentes)
  → Línea de tiempo
  → (loop a Home)
```

**Importante:**
- El zoom del footer NO se aplica en modo presentación (pantalla completa ya da el espacio).
- Los atajos `←` `→` también funcionan en modo navegación normal (NO solo en presentación), porque a veces el usuario querrá moverse rápido sin entrar a fullscreen. La diferencia es solo visual: en presentación se ocultan las cromas.
- Implementación de Context, **NO Zustand** (sin nuevas dependencias).

### 8.6 Footer (modo navegación)

Visible solo cuando NO está en modo presentación. Tres zonas:

- **Izquierda:** zoom controls (`-` `100%` `+`). Aplica `transform: scale()` al `<main>`. Estado en `localStorage`.
- **Centro:** botón "Presentar" (ícono `Maximize` + texto). Activa el modo presentación.
- **Derecha:** `Corte: [fecha del informe activo formateada en es-CO]` (ej: "Corte: 13 de Febrero de 2026").

En modo presentación, el footer se reemplaza por la `ModoPresentacionBar` en la esquina superior derecha.

## 9. Carga de datos

- Server Components leen de Supabase con `@supabase/ssr` server client.
- Una sola query en el layout raíz que trae el informe activo con todas las relaciones (componentes → proyectos → logros + pasos + recursos). Pásalo por contexto vía Server Components / props.
- Revalidate: `revalidate = 60` (1 minuto). Para actualización inmediata, agrega un botón "Refrescar datos" en el footer que hace `router.refresh()`.

## 10. Mini admin protegido

Construir un panel administrativo en `/admin/*` con autenticación Supabase Auth (Magic Link, sin contraseña).

### 10.1 Stack del admin

- **shadcn/ui:** `Form`, `Input`, `Textarea`, `Select`, `Button`, `Card`, `Table`, `Dialog`, `Tabs`, `Badge`, `Slider`, `Switch`, `Separator`, `Sonner` (toasts).
- **Forms:** `react-hook-form` + `@hookform/resolvers/zod` + `zod`.
- **Tablas:** `@tanstack/react-table` (la versión que usa shadcn data-table).
- **Drag-and-drop:** `@dnd-kit/core` + `@dnd-kit/sortable` (para reordenar componentes y bullets).
- **Fechas:** `date-fns` con locale `es`.
- **Mutations:** Server Actions (`'use server'`) — sin API routes innecesarias.

### 10.2 Autenticación

- **Magic Link** vía Supabase Auth (Email OTP). Sin contraseña, sin SSO complejo.
- **Whitelist por email.** Variable de entorno:
  ```env
  ADMIN_ALLOWED_EMAILS=fabian@medellin.gov.co,otro@medellin.gov.co
  ```
- **`middleware.ts`** protege todo `/admin/*` excepto `/admin/login`:
  - Sin sesión → redirect a `/admin/login`.
  - Con sesión pero email NO en whitelist → redirect a `/?error=unauthorized`.
  - Con sesión y email autorizado → permite acceso.
- Botón "Cerrar sesión" en el sidebar (llama `supabase.auth.signOut()` + redirect).

### 10.3 Páginas del admin

#### `/admin` — Dashboard

Cards con stats agregadas:
- Total de informes (con cuál está activo)
- Total de componentes
- Total de proyectos por estado (Completado / En progreso / No iniciado / Bloqueado)
- Avance global del informe activo

Sección de **accesos rápidos:**
- Botón grande "Editar proyectos" → `/admin/proyectos`
- Botón "Editar informe activo"
- Botón "Crear nuevo corte" (duplica el informe activo en uno nuevo, queda inactivo hasta toggle).

#### `/admin/proyectos` — Lista (vista principal de edición)

Esta es la pantalla que más usará el equipo. Optimízala para velocidad de edición.

Tabla con columnas:
- Componente (con badge de color)
- Código (HU-1, HU-2, etc.)
- Nombre
- Plazo (badge)
- Estado (badge editable inline)
- % Avance (input numérico editable inline)
- Fecha entrega
- Responsable
- Acciones (ícono lápiz → detalle)

**Filtros arriba de la tabla:**
- Select de componente
- Select de estado
- Select de plazo
- Search por nombre/código

**Edición inline rápida:**
- Click en celda `% Avance` → input numérico (0-100), `onBlur` guarda con Server Action y muestra toast.
- Click en celda `Estado` → select inline, `onChange` guarda.
- Cambios optimistas con `useOptimistic` para UX inmediato.

Click en fila (fuera de las celdas inline) → navega a `/admin/proyectos/[id]` para edición completa.

#### `/admin/proyectos/[id]` — Form completo

Layout con **4 tabs de shadcn:**

**Tab 1 — General**
- `código` (input, opcional)
- `nombre` (input, required)
- `descripción corta` (input, max 200 chars, contador visible)
- `descripción larga` (textarea grande, soporta markdown básico)
- `componente` (select)
- `plazo` (select: Corto/Mediano/Largo)
- `estado` (select)
- `avance` (Slider 0-100 + input numérico sincronizado)
- `responsable` (input)
- `fecha entrega` (DatePicker, opcional)
- `fecha entrega texto` (input, opcional, ej: "Por estimar", "30 mayo")
- `orden` (number)

**Tab 2 — Logros alcanzados**
Repeater (`BulletRepeater`) con:
- Botón "+ Agregar logro"
- Cada item: input de texto + botón eliminar + drag handle
- Drag-and-drop para reordenar (`@dnd-kit/sortable`)

**Tab 3 — Próximos pasos**
Igual que logros, otra tabla.

**Tab 4 — Recursos visuales**
Repeater (`RecursoRepeater`) con cards. Cada card:
- `tipo` (select: video_url / imagen / link)
- `título` (input)
- `URL` (input — para Teams, pegar la URL de "Compartir → Embed" si está disponible)
- `thumbnail_url` (input opcional)
- **Preview embebido en vivo** al lado del form (iframe pequeño que muestra cómo se verá)

**Botones globales:**
- "Guardar cambios" sticky en la parte inferior (en todos los tabs).
- "Eliminar proyecto" (destructive, abre `Dialog` de confirmación).
- Toast de éxito/error con `sonner` tras cada acción.

#### `/admin/componentes` y `/admin/componentes/[id]`

- Lista con drag-and-drop para reordenar (`@dnd-kit`).
- Form de edición: nombre, descripción, icono (input emoji), color (color picker o select de los 6 tokens), orden, override de avance (opcional).

#### `/admin/informes` y `/admin/informes/[id]`

- Lista con toggle "Activo" (Switch). Solo uno puede estar activo — al activar uno, los demás se desactivan automáticamente.
- Form: título, subtítulo, fecha de corte (DatePicker), override de avance global (opcional).
- Botón "Duplicar informe" → copia toda la estructura (componentes + proyectos + logros + pasos + recursos) en un nuevo informe inactivo. Esto permite cortes mensuales sin perder histórico.

### 10.4 Validaciones

Crear `lib/schemas.ts` con schemas Zod reutilizables:

```typescript
export const proyectoSchema = z.object({
  codigo: z.string().max(20).nullable(),
  nombre: z.string().min(1, "Requerido").max(200),
  descripcion_corta: z.string().max(200).nullable(),
  descripcion_larga: z.string().nullable(),
  componente_id: z.string().uuid(),
  plazo: z.enum(['corto', 'mediano', 'largo']),
  estado: z.enum(['completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado']),
  avance: z.number().min(0).max(100),
  responsable: z.string().nullable(),
  fecha_entrega: z.date().nullable(),
  fecha_entrega_texto: z.string().nullable(),
  orden: z.number().int().min(0),
});
```

Reutilizar los mismos schemas en formularios (RHF resolver) y en Server Actions (validación en el servidor antes de escribir a Supabase).

### 10.5 Revalidación

Tras cada mutation exitosa:
```typescript
revalidatePath('/');
revalidatePath('/[componenteSlug]', 'layout');
revalidatePath('/admin');
```

Esto asegura que la presentación pública refleje cambios en menos de 1 segundo.

### 10.6 UX del admin

- Sidebar con secciones siempre visibles: Dashboard, Informes, Componentes, Proyectos.
- Topbar con email del usuario logueado + botón "Cerrar sesión" + link "Ver presentación →" (abre `/` en nueva pestaña).
- Estilo del admin: usa los mismos tokens de color que la presentación (dark theme, navy de fondo) para consistencia visual y para que el equipo se sienta en el mismo producto.

## 11. Plan de implementación por fases

Procede en este orden, **confirmando conmigo al cerrar cada fase**:

### Fase 1 — Bootstrap (1-2h)
- `pnpm create next-app` con Tailwind, TS, App Router.
- Configurar shadcn/ui, Lucide, Framer Motion, Inter.
- Crear `globals.css` con todos los tokens del §7.
- Configurar Supabase: cliente browser + cliente server (`@supabase/ssr`). Variables de entorno.
- Crear background de constelación reutilizable.
- ✋ **Pausa:** muéstrame screenshot de un Hello World con el background y la tipografía aplicados.

### Fase 2 — Schema + Seed (1h)
- Crear migración `0001_initial_schema.sql` con todo el §4.
- Crear `seed.sql` con todos los datos del §5.
- Generar tipos TypeScript con `supabase gen types typescript --local > types/database.ts`.
- Documentar en `README.md` cómo correr migraciones (`supabase db push`).
- ✋ **Pausa:** confírmame que el seed corre limpio y los views de avance calculan bien.

### Fase 3 — Componentes UI base (2-3h)
- `ProgressRing`, `ProgressBar`, `EstadoBadge`, `ComponenteCard`, `ProyectoCard`, `Breadcrumbs`, `HeaderTabs`, `Footer`, `PaginadorPuntos`.
- Storybook **NO** — son demasiados, prefiere un `app/_dev/components/page.tsx` con showcase de cada uno para que yo los revise.
- ✋ **Pausa:** muéstrame el showcase con todos los componentes, todos los colores y estados.

### Fase 4 — Vista Home (1-2h)
- Implementar `/` con la query a Supabase y el grid de componentes.
- Animaciones de entrada con Framer Motion (stagger 80ms entre cards).
- ✋ **Pausa:** screenshot lado a lado con la imagen 1 de referencia.

### Fase 5 — Vista Componente + Detalle (3-4h)
- `/[componenteSlug]` y `/[componenteSlug]/[proyectoSlug]`.
- Recurso visual con embed de iframe (Teams/SharePoint/YouTube).
- Navegación prev/next entre HUs.
- ✋ **Pausa:** screenshots vs imágenes 2-11.

### Fase 6 — Línea de Tiempo + Modo Presentación (2-3h)
- `/linea-tiempo` con el SVG horizontal.
- `ModoPresentacionProvider` (Context).
- `ModoPresentacionBar` con dots + slide counter.
- Botón "Presentar" en el footer.
- Atajos de teclado globales (`←` `→` `F` `Esc` `Home` `End`).
- Lógica de orden de slides desde el informe activo.
- ✋ **Pausa:** screenshots + grabación corta navegando con flechas, entrando y saliendo de presentación.

### Fase 7 — Mini admin (4-5h)
- `middleware.ts` con whitelist de emails.
- `/admin/login` con Magic Link.
- `/admin` dashboard con stats.
- `/admin/proyectos` tabla con filtros y edición inline.
- `/admin/proyectos/[id]` form con 4 tabs (General / Logros / Pasos / Recursos).
- `/admin/componentes` y `/admin/informes`.
- Server Actions con validación Zod.
- `revalidatePath` tras cada mutation.
- ✋ **Pausa:** grabación corta editando un proyecto y viendo el cambio reflejado en la presentación pública.

### Fase 8 — Polish + Deploy (1-2h)
- Reduce motion respetado.
- Responsive mobile/tablet revisado vista por vista.
- Lighthouse > 90 en performance y accesibilidad.
- Configurar Vercel/Dokploy con variables de entorno (incluir `ADMIN_ALLOWED_EMAILS`).
- README final con instrucciones de deploy y de uso del admin.

## 12. Convenciones que debes seguir estrictamente

- **No me pidas instalar paquetes a la mitad de una fase.** Lista todos los paquetes al inicio de cada fase y los instalo de una.
- **Commits pequeños** con prefijo de fase: `feat(fase-1): bootstrap nextjs + tokens`. Una rama por fase: `feat/fase-1-bootstrap`.
- **TypeScript estricto.** Cero `any` salvo en boundaries de Supabase (y aun ahí tipa con `Database` generado por `supabase gen types`).
- **No reinventes.** Si shadcn/ui tiene el componente, úsalo. Si Lucide tiene el icono, úsalo.
- **Comentarios en código en español.** Variables y funciones en inglés.
- **Una pregunta a la vez** cuando me consultes algo. No me hagas listas de 8 preguntas.

## 13. Lo que NO debes hacer

- No agregar Storybook, Jest, Playwright en esta primera versión.
- No usar i18n. Es una app en español, hardcoded.
- No agregar dark/light mode. **Solo dark.**
- No usar charting libraries pesadas (Highcharts, Chart.js). Recharts solo si es estrictamente necesario; preferir SVG nativo.
- No proponer Postgres self-hosted, Drizzle, Prisma, ni otros ORMs. Cliente nativo de Supabase.
- No agregar telemetría, analytics, ni cookies de terceros.

## 14. Activos que yo proveo (no los inventes)

- `/public/logo-gjd.svg` — logo del proyecto (lo subo después).
- `/public/escudo-medellin.svg` — escudo de la Alcaldía (lo subo después).
- `/docs/references/` — los 16 capturas de la primera versión que adjunté (úsalos como referencia visual exacta).

Si un activo no existe aún, deja un placeholder con dimensiones correctas y un TODO bien marcado en el código.

## 15. Pregunta inicial obligatoria

Antes de empezar la Fase 1, **lista las 3 dudas más importantes que tengas sobre este prompt**, ordenadas por impacto en el resultado. Las respondo y arrancamos.

---

**Fin del prompt.**
