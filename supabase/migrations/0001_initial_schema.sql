-- supabase/migrations/0001_initial_schema.sql
-- MER dinámico GJD Informe — Postgres/Supabase
-- Ver: docs/superpowers/specs/2026-06-16-migracion-supabase-roles-mer-design.md

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- ENUMs
-- ─────────────────────────────────────────────────────────────
do $$ begin create type role_enum as enum ('admin', 'usuario');
exception when duplicate_object then null; end $$;

do $$ begin create type plazo_enum as enum ('corto', 'mediano', 'largo');
exception when duplicate_object then null; end $$;

do $$ begin create type estado_enum as enum
  ('completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado');
exception when duplicate_object then null; end $$;

do $$ begin create type criterio_estado_enum as enum
  ('pendiente', 'en_progreso', 'cumplido');
exception when duplicate_object then null; end $$;

do $$ begin create type actividad_tipo_enum as enum
  ('reunion', 'tarea', 'investigacion', 'informe');
exception when duplicate_object then null; end $$;

do $$ begin create type actividad_estado_enum as enum
  ('pendiente', 'en_progreso', 'completada');
exception when duplicate_object then null; end $$;

do $$ begin create type recurso_tipo_enum as enum ('video_url', 'imagen', 'link');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- Identidad
-- ─────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role role_enum not null default 'usuario',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Reporte
-- ─────────────────────────────────────────────────────────────
create table if not exists informes (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  subtitulo text,
  fecha_corte date not null,
  avance_global_override numeric(5,2),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists componentes (
  id uuid primary key default uuid_generate_v4(),
  informe_id uuid not null references informes(id) on delete cascade,
  slug text not null,
  nombre text not null,
  descripcion text,
  icono text not null,
  color_hex text not null,
  color_token text not null,
  orden integer not null,
  avance_override numeric(5,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (informe_id, slug)
);

create table if not exists proyectos (
  id uuid primary key default uuid_generate_v4(),
  componente_id uuid not null references componentes(id) on delete cascade,
  slug text not null,
  codigo text,
  nombre text not null,
  descripcion_corta text,
  descripcion_larga text,
  estado estado_enum not null default 'no_iniciado',
  avance_override numeric(5,2),
  responsable text,
  fecha_inicio date,
  fecha_fin date,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (componente_id, slug)
);

create table if not exists proyecto_plazos (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  plazo plazo_enum not null,
  fecha_inicio date,
  fecha_fin date,
  avance_override numeric(5,2),
  orden integer not null default 0,
  unique (proyecto_id, plazo)
);

create table if not exists criterios (
  id uuid primary key default uuid_generate_v4(),
  proyecto_plazo_id uuid not null references proyecto_plazos(id) on delete cascade,
  texto text not null,
  descripcion text,
  peso numeric(6,2) not null default 1 check (peso >= 0),
  estado criterio_estado_enum not null default 'pendiente',
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists actividades (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  proyecto_plazo_id uuid references proyecto_plazos(id) on delete set null,
  tipo actividad_tipo_enum not null,
  titulo text not null,
  descripcion text,
  fecha date,
  estado actividad_estado_enum not null default 'pendiente',
  responsable text,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists actividad_criterios (
  actividad_id uuid not null references actividades(id) on delete cascade,
  criterio_id uuid not null references criterios(id) on delete cascade,
  primary key (actividad_id, criterio_id)
);

create table if not exists proyecto_recursos (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  tipo recurso_tipo_enum not null,
  titulo text,
  url text not null,
  thumbnail_url text,
  duracion_segundos integer,
  orden integer not null default 0
);

-- Solo un informe activo a la vez
create unique index if not exists idx_informes_unico_activo
  on informes (is_active) where is_active = true;

-- Índices de FK frecuentes
create index if not exists idx_componentes_informe on componentes (informe_id);
create index if not exists idx_proyectos_componente on proyectos (componente_id);
create index if not exists idx_plazos_proyecto on proyecto_plazos (proyecto_id);
create index if not exists idx_criterios_plazo on criterios (proyecto_plazo_id);
create index if not exists idx_actividades_proyecto on actividades (proyecto_id);
create index if not exists idx_recursos_proyecto on proyecto_recursos (proyecto_id);

-- ─────────────────────────────────────────────────────────────
-- Vistas de avance (security_invoker → respetan RLS del consultante)
-- ─────────────────────────────────────────────────────────────
create or replace view v_plazos_con_avance with (security_invoker = true) as
select
  pp.*,
  coalesce(
    pp.avance_override,
    coalesce(
      sum(c.peso) filter (where c.estado = 'cumplido')
        / nullif(sum(c.peso), 0) * 100,
      0
    )
  ) as avance_calculado,
  count(c.id) as total_criterios,
  count(*) filter (where c.estado = 'cumplido') as criterios_cumplidos
from proyecto_plazos pp
left join criterios c on c.proyecto_plazo_id = pp.id
group by pp.id;

create or replace view v_proyectos_con_avance with (security_invoker = true) as
select
  p.*,
  coalesce(
    p.avance_override,
    coalesce(
      sum(c.peso) filter (where c.estado = 'cumplido')
        / nullif(sum(c.peso), 0) * 100,
      0
    )
  ) as avance_calculado,
  count(distinct pp.id) as total_plazos,
  count(c.id) as total_criterios,
  count(*) filter (where c.estado = 'cumplido') as criterios_cumplidos
from proyectos p
left join proyecto_plazos pp on pp.proyecto_id = p.id
left join criterios c on c.proyecto_plazo_id = pp.id
group by p.id;

create or replace view v_componentes_con_avance with (security_invoker = true) as
select
  comp.*,
  coalesce(comp.avance_override, coalesce(avg(vp.avance_calculado), 0)) as avance_calculado,
  count(vp.id) as total_actividades,
  count(*) filter (where vp.estado = 'completado') as actividades_completadas
from componentes comp
left join v_proyectos_con_avance vp on vp.componente_id = comp.id
group by comp.id;

create or replace view v_informes_con_avance with (security_invoker = true) as
select
  i.*,
  coalesce(i.avance_global_override, coalesce(avg(vc.avance_calculado), 0)) as avance_global_calculado
from informes i
left join v_componentes_con_avance vc on vc.informe_id = i.id
group by i.id;

-- ─────────────────────────────────────────────────────────────
-- Triggers updated_at
-- ─────────────────────────────────────────────────────────────
create or replace function trigger_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

do $$
declare t text;
begin
  foreach t in array array['profiles','informes','componentes','proyectos','criterios','actividades']
  loop
    execute format('drop trigger if exists set_updated_at_%1$s on %1$s;', t);
    execute format(
      'create trigger set_updated_at_%1$s before update on %1$s
         for each row execute function trigger_set_updated_at();', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────
-- Identidad: profile automático + helper de rol
-- ─────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'usuario')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Grants: solo authenticated; anon sin acceso
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on v_plazos_con_avance, v_proyectos_con_avance,
  v_componentes_con_avance, v_informes_con_avance to authenticated;

-- ─────────────────────────────────────────────────────────────
-- RLS
-- ─────────────────────────────────────────────────────────────
alter table profiles            enable row level security;
alter table informes            enable row level security;
alter table componentes         enable row level security;
alter table proyectos           enable row level security;
alter table proyecto_plazos     enable row level security;
alter table criterios           enable row level security;
alter table actividades         enable row level security;
alter table actividad_criterios enable row level security;
alter table proyecto_recursos   enable row level security;

-- profiles: self-read (o admin); escritura solo admin
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_admin_write on profiles;
create policy profiles_admin_write on profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Tablas de reporte: SELECT a cualquier autenticado; escritura solo admin
do $$
declare t text;
begin
  foreach t in array array['informes','componentes','proyectos','proyecto_plazos',
                           'criterios','actividades','actividad_criterios','proyecto_recursos']
  loop
    execute format('drop policy if exists %1$s_select on %1$s;', t);
    execute format(
      'create policy %1$s_select on %1$s for select to authenticated using (true);', t);
    execute format('drop policy if exists %1$s_admin_write on %1$s;', t);
    execute format(
      'create policy %1$s_admin_write on %1$s for all to authenticated
         using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;
