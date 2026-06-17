# Navegación del reporte (usuarios finales) — Diseño

**Fecha:** 2026-06-17
**Estado:** Aprobado — en ejecución
**Construye sobre:** modelo objetivos/ejes (`2026-06-17-arquitectura-objetivos-ejes-design.md`)

## Objetivo

Capa de presentación optimizada para recorrer **Componente → Proyecto → Objetivo**
con un shell de navegación clave: árbol lateral persistente + breadcrumb + panel,
overview estratégico primero, y drawer de objetivo con su bitácora.

## Paradigma

Shell con **árbol lateral persistente** + **breadcrumb** + **panel principal** del
nodo seleccionado. (Decidido en brainstorming.)

## Componentes de UI

1. **PresentacionShell** (evoluciona): izquierda `NavTree`, topbar (breadcrumb +
   avance global + botón Presentar), centro = panel (children).
2. **NavTree** (client): árbol colapsable.
   - Raíz: **Inicio** (overview). Luego cada **Componente** (%, color) expandible →
     **Proyectos** (%, estado). Al expandir un proyecto → sus **Objetivos** (lazy,
     colapsado por defecto). + **Línea de Tiempo**.
   - Nodo actual resaltado, sincronizado con la ruta. Colapsa a offcanvas en móvil.
3. **Panel por nivel**:
   - **Inicio** → `OverviewEstrategico`: donut global, avance por componente,
     distribución por **plazo** y por **estado**, hitos.
   - **Componente** → hero + proyectos con %/estado.
   - **Proyecto** → header (%, estado, fechas, responsable) + **Objetivos por plazo**
     (Corto/Mediano/Largo con % por plazo) + recursos.
   - **Objetivo** → **drawer derecho** (`ObjetivoDrawer`): tipo (HU/Funcionalidad),
     estado, plazo, descripción + **bitácora** (reuniones/tareas/investigaciones/
     informes). Mantiene el contexto del proyecto.
4. **Breadcrumb**: `Inicio › Componente › Proyecto (› Objetivo)`.

## Rutas y deep-linking

- Se conservan: `/`, `/[componenteSlug]`, `/[componenteSlug]/[proyectoSlug]`, `/linea-tiempo`.
- Drawer del objetivo vía searchParam `?obj=<objetivoId>` en la página de proyecto
  (enlazable/compartible; cerrar = quitar el param).

## Modo presentación

Se conserva (`ModoPresentacionProvider`). En fullscreen el árbol se oculta, el panel
ocupa todo y se navega la secuencia componente→proyecto con flechas. (Objetivos en la
secuencia: fuera de alcance por ahora.)

## Consistencia

Sistema ya establecido: IBM Plex, tokens navy, color por componente, densidad compacta.

## Archivos

- Modificar: `components/presentacion/PresentacionShell.tsx`, `app/(presentacion)/page.tsx`
  (overview), `app/(presentacion)/[componenteSlug]/page.tsx`,
  `app/(presentacion)/[componenteSlug]/[proyectoSlug]/page.tsx` (panel + drawer),
  `Breadcrumbs.tsx`.
- Crear: `components/presentacion/NavTree.tsx`, `components/presentacion/OverviewEstrategico.tsx`,
  `components/presentacion/ObjetivoDrawer.tsx`, `components/presentacion/ObjetivosPorPlazoReporte.tsx`
  (panel de objetivos por plazo del proyecto).

## Escenarios observables

1. El árbol lateral muestra Componentes → (expandible) Proyectos → (lazy) Objetivos, con el nodo actual resaltado.
2. En Inicio, el overview muestra donut global + avance por componente + distribución por plazo y por estado.
3. En un Proyecto, los Objetivos aparecen agrupados por plazo (corto/mediano/largo) con su % por plazo.
4. Clic en un Objetivo abre un drawer derecho con su detalle + bitácora, sin perder la lista del proyecto; `?obj=<id>` queda en la URL y es enlazable.
5. El breadcrumb refleja la ruta y permite volver a cualquier nivel.
6. En móvil, el árbol colapsa a un botón/offcanvas.
7. El modo presentación sigue funcionando (fullscreen, navegación por flechas).
8. Cero errores de consola; navegación sin recargas completas innecesarias.

## Fuera de alcance

- Vista cruzada por Eje Transversal (dato listo; vista posterior).
- Objetivos dentro de la secuencia del modo presentación.
- Edición desde el reporte (eso es el backoffice).
