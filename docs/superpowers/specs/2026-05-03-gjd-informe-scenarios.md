# GJD Informe — Escenarios Observables

> Holdout set. NO modificar para hacerlos pasar. El código converge hacia estos, nunca al revés.

---

## S1 — Seed y capa de datos

**"Un desarrollador corre `pnpm seed` en terminal y ve `✅ Seed completo` sin errores. Al consultar la DB con sqlite3, la vista `v_informes_con_avance` muestra título 'Ecosistema de Gestión Jurídica Digital' con `avance_global_calculado` entre 20 y 50. La vista `v_componentes_con_avance` devuelve 6 filas con `total_actividades` > 0 para cada componente."**

Verificación:
```bash
pnpm seed
sqlite3 local.db "SELECT titulo, avance_global_calculado FROM v_informes_con_avance;"
sqlite3 local.db "SELECT nombre, avance_calculado, total_actividades FROM v_componentes_con_avance;"
```
Satisfecho cuando: seed sin errores, 1 informe activo, 6 componentes con avance calculado, total actividades > 0 en cada uno.

---

## S2 — Bootstrap visual (Home vacío)

**"Un usuario visita http://localhost:3000 y ve un fondo azul marino oscuro (#0A1228) con partículas blancas animadas conectadas por líneas tenues. La tipografía visible usa la fuente Inter. No hay errores en la consola del navegador."**

Verificación: `pnpm dev` → abrir http://localhost:3000 → inspeccionar background color y font-family → verificar consola sin errores.

---

## S3 — Home page completa

**"El Secretario visita '/' y ve, de arriba a abajo: el logo placeholder 'GJD', el título 'Ecosistema de Gestión Jurídica Digital', un donut SVG grande en color naranja (#F97316) con el porcentaje global (~30%) en el centro, y una grid de 6 cards. Cada card muestra: el emoji del componente, el nombre, 'N actividades', una barra de progreso del color del componente, y el porcentaje a la derecha. Las cards aparecen con una animación escalonada (stagger)."**

Verificación: pnpm dev → http://localhost:3000 → verificar visualmente los 6 componentes con sus íconos: ⚙️🔭🔗📊📁🤖

---

## S4 — Navegación a componente

**"Un usuario en '/' hace click en la card '⚙️ Gestión de Notificaciones' y navega a '/gestion-notificaciones'. La nueva página muestra el emoji ⚙️ grande con glow azul, el nombre del componente, su descripción, una barra de progreso grande, y una grid de cards con los proyectos HU-1, HU-2, HU-3, HU-7, HU-4 (los 5 proyectos del componente)."**

Verificación: click en card → URL cambia → verificar grid de proyectos.

---

## S5 — Detalle de proyecto completado

**"Un usuario en '/gestion-notificaciones/hu-1' ve: un ProgressRing grande (200px) con 100% en color azul (#3B82F6) completamente lleno, badge verde 'Completado', badge 'Corto plazo', al menos 3 logros con check verde, al menos 2 próximos pasos con flecha azul, y un botón '← HU anterior' desactivado (HU-1 es el primero) y 'HU siguiente →' activo."**

Verificación: navegar a la URL → verificar visual.

---

## S6 — Detalle de proyecto en progreso

**"Un usuario en '/gestion-notificaciones/hu-7' ve un ProgressRing con 80%, badge azul 'En progreso', logros registrados, próximos pasos, y navegación prev/next funcional (HU-3 a la izquierda, HU-4 a la derecha)."**

---

## S7 — Cabecera de tabs

**"En cualquier página bajo '/gestion-notificaciones/*', el HeaderTabs muestra 6 tabs con íconos y nombres. El tab activo (⚙️ Gestión de Notificaciones) tiene fondo azul semitransparente y borde inferior azul. Los otros 5 tabs están en gris. Hacer click en '🔭 Automatización' navega a '/automatizacion-desarrollo'."**

---

## S8 — Línea de tiempo

**"Un usuario en '/linea-tiempo' ve un SVG con 3 columnas: 'Corto Plazo (Q1-Q2 2026)', 'Mediano Plazo (Q3-Q4 2026)', 'Largo Plazo (2027+)'. Hay 6 filas (una por componente) con el nombre y emoji a la izquierda. Los puntos de proyectos completados son círculos sólidos del color del componente; los no iniciados son círculos vacíos. Al hacer hover sobre un punto, aparece un tooltip con el nombre del proyecto y porcentaje."**

---

## S9 — Modo presentación: activación

**"Un usuario hace click en el botón '⊠ Presentar' del footer. La app solicita pantalla completa. El HeaderTabs y el Footer desaparecen. Aparece en la esquina superior derecha un indicador '1 / N' (donde N = total slides) con un botón X. El fondo con partículas sigue visible."**

---

## S10 — Modo presentación: navegación con teclado

**"En modo presentación, presionar '→' avanza al siguiente slide (URL cambia, contenido actualiza). Presionar '←' va al anterior. Presionar 'Esc' sale del modo presentación: HeaderTabs y Footer vuelven a aparecer, el indicador '1/N' desaparece. Presionar 'Home' navega a '/'."**

---

## S11 — Admin: protección de rutas

**"Un usuario sin sesión que visita '/admin' directamente es redirigido a '/admin/login'. Un usuario que ingresa un email no en la whitelist recibe respuesta 403. Un usuario autorizado (tecnologia@zetainc.co) puede acceder al dashboard de admin."**

---

## S12 — Admin: edición inline de avance

**"En '/admin/proyectos', la tabla muestra todos los proyectos con columnas: Componente, Código, Nombre, Plazo, Estado, % Avance, Responsable. Al hacer click en la celda de '% Avance' de HU-7, aparece un input numérico. Al cambiar el valor a 85 y presionar Tab o blur, el cambio se guarda. Al visitar '/' en otra pestaña y refrescar, el avance de 'Gestión de Notificaciones' refleja el nuevo cálculo."**

---

## S13 — TypeScript y build

**"Al ejecutar `pnpm tsc --noEmit`, no hay errores de tipo. Al ejecutar `pnpm build`, el build completa sin errores. No hay imports no resueltos ni tipos `any` sin justificación."**

Verificación:
```bash
pnpm tsc --noEmit
pnpm build
```

---

## Criterios de satisfacción globales

- Zero errores en consola del navegador en cualquier ruta pública
- Todos los slugs de componentes resuelven a páginas válidas (no 404)
- Todos los slugs de proyectos desde el seed resuelven a páginas válidas
- El modo presentación no rompe la navegación normal al salir
- El admin no es accesible sin sesión válida
