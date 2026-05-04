-- supabase/migrations/0001_initial_schema.sql
-- PostgreSQL schema (Supabase) — equivalente al spec §4 + columna slug en proyectos

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ENUMs
do $$ begin
  create type plazo_enum as enum ('corto', 'mediano', 'largo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type estado_enum as enum (
    'completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type recurso_tipo_enum as enum ('video_url', 'imagen', 'link');
exception when duplicate_object then null; end $$;

-- Tablas
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
  unique(informe_id, slug)
);

create table if not exists proyectos (
  id uuid primary key default uuid_generate_v4(),
  componente_id uuid not null references componentes(id) on delete cascade,
  slug text not null,
  codigo text,
  nombre text not null,
  descripcion_corta text,
  descripcion_larga text,
  plazo plazo_enum not null,
  estado estado_enum not null default 'no_iniciado',
  avance numeric(5,2) not null default 0,
  responsable text,
  fecha_entrega date,
  fecha_entrega_texto text,
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(componente_id, slug)
);

create table if not exists proyecto_logros (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  texto text not null,
  orden integer not null default 0
);

create table if not exists proyecto_proximos_pasos (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  texto text not null,
  orden integer not null default 0
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

-- Vistas
create or replace view v_componentes_con_avance as
select
  c.*,
  coalesce(c.avance_override, coalesce(avg(p.avance), 0)) as avance_calculado,
  count(p.id) as total_actividades,
  count(case when p.estado = 'completado' then 1 end) as actividades_completadas
from componentes c
left join proyectos p on p.componente_id = c.id
group by c.id;

create or replace view v_informes_con_avance as
select
  i.*,
  coalesce(i.avance_global_override, coalesce(avg(vc.avance_calculado), 0)) as avance_global_calculado
from informes i
left join v_componentes_con_avance vc on vc.informe_id = i.id
group by i.id;

-- Triggers updated_at
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_informes on informes;
create trigger set_updated_at_informes before update on informes
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at_componentes on componentes;
create trigger set_updated_at_componentes before update on componentes
  for each row execute function trigger_set_updated_at();

drop trigger if exists set_updated_at_proyectos on proyectos;
create trigger set_updated_at_proyectos before update on proyectos
  for each row execute function trigger_set_updated_at();

-- Constraint: solo un informe activo a la vez
create unique index if not exists idx_informes_unico_activo
  on informes (is_active) where is_active = true;
