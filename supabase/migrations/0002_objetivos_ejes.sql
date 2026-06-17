-- supabase/migrations/0002_objetivos_ejes.sql
-- criterios -> objetivos (plazo como atributo), ejes transversales, actividades bajo objetivo.
-- Ver: docs/superpowers/specs/2026-06-17-arquitectura-objetivos-ejes-design.md
-- Atómica: si algo falla, rollback completo.

begin;

-- ── Enum tipo de objetivo ─────────────────────────────────────
do $$ begin
  create type objetivo_tipo_enum as enum ('hu', 'funcionalidad');
exception when duplicate_object then null; end $$;

-- ── Objetivos (reemplaza criterios; plazo pasa a atributo) ─────
create table if not exists objetivos (
  id uuid primary key default uuid_generate_v4(),
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  titulo text not null,
  descripcion text,
  tipo objetivo_tipo_enum not null default 'hu',
  plazo plazo_enum not null,
  estado criterio_estado_enum not null default 'pendiente',
  peso numeric(6,2) not null default 1 check (peso >= 0),
  orden integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_objetivos_proyecto on objetivos (proyecto_id);

-- Migración de datos: criterios + plazo/proyecto desde proyecto_plazos
insert into objetivos (id, proyecto_id, titulo, descripcion, tipo, plazo, estado, peso, orden, created_at, updated_at)
select c.id, pp.proyecto_id, c.texto, c.descripcion, 'hu', pp.plazo, c.estado, c.peso, c.orden, c.created_at, c.updated_at
from criterios c
join proyecto_plazos pp on pp.id = c.proyecto_plazo_id;

-- ── Ejes transversales (catálogo + N:M) ───────────────────────
create table if not exists ejes_transversales (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  color_hex text not null default '#64748b',
  orden integer not null default 0
);
create table if not exists proyecto_ejes (
  proyecto_id uuid not null references proyectos(id) on delete cascade,
  eje_id uuid not null references ejes_transversales(id) on delete cascade,
  primary key (proyecto_id, eje_id)
);

-- ── Actividades re-vinculadas al objetivo (0 filas hoy) ───────
drop table if exists actividad_criterios;
drop table if exists actividades cascade;
create table actividades (
  id uuid primary key default uuid_generate_v4(),
  objetivo_id uuid not null references objetivos(id) on delete cascade,
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
create index if not exists idx_actividades_objetivo on actividades (objetivo_id);

-- ── Vistas: drop dependientes y recrear sobre objetivos ───────
drop view if exists v_informes_con_avance;
drop view if exists v_componentes_con_avance;
drop view if exists v_proyectos_con_avance;
drop view if exists v_plazos_con_avance;

create view v_proyectos_con_avance with (security_invoker = true) as
select p.*,
  coalesce(
    p.avance_override,
    coalesce(sum(o.peso) filter (where o.estado = 'cumplido') / nullif(sum(o.peso), 0) * 100, 0)
  ) as avance_calculado,
  count(o.id) as total_objetivos,
  count(*) filter (where o.estado = 'cumplido') as objetivos_cumplidos
from proyectos p
left join objetivos o on o.proyecto_id = p.id
group by p.id;

create view v_componentes_con_avance with (security_invoker = true) as
select comp.*,
  coalesce(comp.avance_override, coalesce(avg(vp.avance_calculado), 0)) as avance_calculado,
  count(vp.id) as total_actividades,
  count(*) filter (where vp.estado = 'completado') as actividades_completadas
from componentes comp
left join v_proyectos_con_avance vp on vp.componente_id = comp.id
group by comp.id;

create view v_informes_con_avance with (security_invoker = true) as
select i.*,
  coalesce(i.avance_global_override, coalesce(avg(vc.avance_calculado), 0)) as avance_global_calculado
from informes i
left join v_componentes_con_avance vc on vc.informe_id = i.id
group by i.id;

-- ── Drop tablas viejas (ya migradas) ──────────────────────────
drop table if exists criterios cascade;
drop table if exists proyecto_plazos cascade;

-- ── Triggers updated_at ───────────────────────────────────────
drop trigger if exists set_updated_at_objetivos on objetivos;
create trigger set_updated_at_objetivos before update on objetivos
  for each row execute function trigger_set_updated_at();
drop trigger if exists set_updated_at_actividades on actividades;
create trigger set_updated_at_actividades before update on actividades
  for each row execute function trigger_set_updated_at();

-- ── Grants + RLS ──────────────────────────────────────────────
grant select, insert, update, delete on objetivos, ejes_transversales, proyecto_ejes, actividades to authenticated;

alter table objetivos          enable row level security;
alter table ejes_transversales enable row level security;
alter table proyecto_ejes      enable row level security;
alter table actividades        enable row level security;

do $$
declare t text;
begin
  foreach t in array array['objetivos','ejes_transversales','proyecto_ejes','actividades']
  loop
    execute format('drop policy if exists %1$s_select on %1$s;', t);
    execute format('create policy %1$s_select on %1$s for select to authenticated using (true);', t);
    execute format('drop policy if exists %1$s_admin_write on %1$s;', t);
    execute format('create policy %1$s_admin_write on %1$s for all to authenticated using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

commit;
