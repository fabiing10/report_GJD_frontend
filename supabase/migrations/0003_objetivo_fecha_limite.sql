-- supabase/migrations/0003_objetivo_fecha_limite.sql
-- Fecha límite (meta temporal) por objetivo. Alimenta la etiqueta de fecha
-- en los cards del tablero Kanban del reporte y es editable en el backoffice.
-- Idempotente y seguro: solo agrega una columna nullable.

alter table objetivos
  add column if not exists fecha_limite date;

-- Las vistas (v_proyectos_con_avance, etc.) no enumeran columnas de objetivo
-- más allá de id/estado/proyecto_id, así que no requieren recrearse.

-- Refrescar el cache de esquema de PostgREST.
notify pgrst, 'reload schema';
