-- lib/db/sqlite-schema.sql
-- Equivalente al spec §4 con sintaxis SQLite (TEXT CHECK en lugar de ENUM nativo)

CREATE TABLE IF NOT EXISTS informes (
  id TEXT PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  fecha_corte TEXT NOT NULL,
  avance_global_override REAL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS componentes (
  id TEXT PRIMARY KEY,
  informe_id TEXT NOT NULL REFERENCES informes(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  icono TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  color_token TEXT NOT NULL,
  orden INTEGER NOT NULL,
  avance_override REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(informe_id, slug)
);

CREATE TABLE IF NOT EXISTS proyectos (
  id TEXT PRIMARY KEY,
  componente_id TEXT NOT NULL REFERENCES componentes(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  codigo TEXT,
  nombre TEXT NOT NULL,
  descripcion_corta TEXT,
  descripcion_larga TEXT,
  plazo TEXT NOT NULL CHECK (plazo IN ('corto', 'mediano', 'largo')),
  estado TEXT NOT NULL DEFAULT 'no_iniciado'
    CHECK (estado IN ('completado', 'en_progreso', 'no_iniciado', 'refinamiento', 'bloqueado')),
  avance REAL NOT NULL DEFAULT 0,
  responsable TEXT,
  fecha_entrega TEXT,
  fecha_entrega_texto TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(componente_id, slug)
);

CREATE TABLE IF NOT EXISTS proyecto_logros (
  id TEXT PRIMARY KEY,
  proyecto_id TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS proyecto_proximos_pasos (
  id TEXT PRIMARY KEY,
  proyecto_id TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS proyecto_recursos (
  id TEXT PRIMARY KEY,
  proyecto_id TEXT NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('video_url', 'imagen', 'link')),
  titulo TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duracion_segundos INTEGER,
  orden INTEGER NOT NULL DEFAULT 0
);

-- Vistas (equivalentes a las del spec)
CREATE VIEW IF NOT EXISTS v_componentes_con_avance AS
SELECT
  c.*,
  COALESCE(c.avance_override, COALESCE(AVG(p.avance), 0)) AS avance_calculado,
  COUNT(p.id) AS total_actividades,
  COUNT(CASE WHEN p.estado = 'completado' THEN 1 END) AS actividades_completadas
FROM componentes c
LEFT JOIN proyectos p ON p.componente_id = c.id
GROUP BY c.id;

CREATE VIEW IF NOT EXISTS v_informes_con_avance AS
SELECT
  i.*,
  COALESCE(i.avance_global_override, COALESCE(AVG(vc.avance_calculado), 0)) AS avance_global_calculado
FROM informes i
LEFT JOIN v_componentes_con_avance vc ON vc.informe_id = i.id
GROUP BY i.id;

-- Triggers para updated_at
CREATE TRIGGER IF NOT EXISTS update_informes_updated_at
  AFTER UPDATE ON informes FOR EACH ROW
  BEGIN UPDATE informes SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS update_componentes_updated_at
  AFTER UPDATE ON componentes FOR EACH ROW
  BEGIN UPDATE componentes SET updated_at = datetime('now') WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS update_proyectos_updated_at
  AFTER UPDATE ON proyectos FOR EACH ROW
  BEGIN UPDATE proyectos SET updated_at = datetime('now') WHERE id = NEW.id; END;
