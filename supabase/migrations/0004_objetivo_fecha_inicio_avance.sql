-- supabase/migrations/0004_objetivo_fecha_inicio_avance.sql
-- Cada producto (objetivo) gana fecha de inicio y un % de avance manual,
-- independiente del estado. El avance del proyecto pasa a ser el promedio
-- ponderado de los % de sus productos: Σ(peso × avance) / Σ(peso).

alter table objetivos add column if not exists fecha_inicio date;
alter table objetivos add column if not exists avance integer not null default 0;

-- Rango válido del %.
do $$ begin
  alter table objetivos add constraint objetivos_avance_chk check (avance between 0 and 100);
exception when duplicate_object then null; end $$;

-- Backfill inicial del % desde el estado para no perder el avance actual.
update objetivos
set avance = case estado
  when 'cumplido' then 100
  when 'en_progreso' then 50
  else 0
end
where avance = 0;

-- Avance del proyecto = promedio ponderado de los % de productos.
-- Mismas columnas que antes → create or replace no rompe vistas dependientes.
create or replace view v_proyectos_con_avance with (security_invoker = true) as
select p.*,
  coalesce(
    p.avance_override,
    coalesce(sum(o.peso * o.avance)::numeric / nullif(sum(o.peso), 0), 0)
  ) as avance_calculado,
  count(o.id) as total_objetivos,
  count(*) filter (where o.estado = 'cumplido') as objetivos_cumplidos
from proyectos p
left join objetivos o on o.proyecto_id = p.id
group by p.id;

notify pgrst, 'reload schema';
