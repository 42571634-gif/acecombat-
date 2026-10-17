# Roadmap para Codex

## Hito 0 — Baseline (incluido)
- [x] Preservar prototipo HTML jugable.
- [x] Separar HTML, CSS y JS sin cambiar mecánicas.
- [x] Documentar instalación y pruebas automáticas básicas.

## Hito 1 — Arquitectura + guardado
- [x] Extraer datos de campaña a módulos narrativos.
- [x] Modelar estado con inventario de decisiones, ruta actual, misiones y resultados.
- [x] Añadir guardado/carga por `localStorage`, con versión de esquema.
- [x] Validar el grafo y añadir test automático de rutas.
- [x] Corregir bugs de reinicio y de tiempo de misión.

Implementado: grafo declarativo, motor independiente, historial reproducible, guardado local versionado y pruebas de las cinco rutas. La carga durante combate reinicia la misión pendiente.

## Ampliación v0.2 — 52 misiones

- [x] Briefing, conversación adaptada, combate e informe para cada misión.
- [x] Bifurcaciones por decisiones y objetivos secundarios.
- [x] Archivo con búsqueda y simulador con guardado independiente.
- [x] Migración de partidas v1 y registro de misiones/finales.
- [x] Documentación de fuentes, equivalencias y mecánicas.

## Hito 2 — Combate táctico divertido
- [ ] Implementar fijado de misil y objetivos móviles con estados.
- [ ] Introducir pausas/turnos como modo alternativo.
- [ ] Añadir combustible, munición, contramedidas y enemigos con comportamientos diferenciados.
- [ ] Equilibrar duración y claridad de las misiones.

## Hito 3 — Contenido fiel a las rutas japonesas
- [x] Construir mapa de misiones y bifurcaciones desde fuentes comprobables.
- [x] Registrar facciones, relaciones, personajes y cronología.
- [x] Adaptar cada capítulo con texto original propio, separando lo canónico de lo recreado.
- [x] Probar todos los finales y condiciones de acceso.

Implementado en v0.2: 52 misiones jugables en el grafo, cinco finales y fuentes comunitarias por capítulo. Los textos, tiempos, cantidades y eventos de combate son adaptaciones; ver RESEARCH.md. No se certifica una reproducción íntegra del guion o del juego original.

## Hito 4 — Interfaz y lanzamiento
- [ ] Mapa visual de rutas, enciclopedia de personajes y debriefing.
- [ ] Accesibilidad y soporte táctil integral.
- [ ] Optimización de rendimiento y despliegue estático (GitHub Pages).

## Primer prompt sugerido
"Lee AGENTS.md, README.md y docs/ROADMAP.md. Implementa exclusivamente el Hito 1. Mantén la demo jugable, trabaja incrementalmente, añade pruebas de navegación y de guardado, ejecuta npm run check, y documenta los cambios. No inventes el contenido canónico de Ace Combat 3."
