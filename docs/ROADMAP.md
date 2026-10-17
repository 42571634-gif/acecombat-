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

Ampliación v0.4: [x] Perfiles investigados en fuentes oficiales, biblia de personajes, 471 intervenciones reescritas con voz propia, escenas con subtexto, acotaciones y continuidad de interlocutores. Ver CHARACTER_BIBLE.md.

- [x] Briefing, conversación adaptada, combate e informe para cada misión.
- [x] Bifurcaciones por decisiones y objetivos secundarios.
- [x] Archivo con búsqueda y simulador con guardado independiente.
- [x] Migración de partidas v1 y registro de misiones/finales.
- [x] Documentación de fuentes, equivalencias y mecánicas.

## Hito 2 — Combate táctico divertido

Ampliación v0.3 solicitada: [x] bullet hell con movimiento en dos ejes, tres dificultades, proyectiles, contramedidas y controles táctiles. Se mantienen las reglas narrativas y el modo táctico anterior en la API para regresiones. [x] Conversaciones triplicadas en introducción y las 52 misiones (briefing e informe). Los pendientes siguientes corresponden al diseño táctico anterior, no a requisitos de esta entrega.
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

## Ampliación v0.5 completada

- [x] Nueve retratos locales con fuentes y créditos.
- [x] Respuesta al pulsar, botones persistentes y animación sincronizada con el navegador.
- [x] Quince misiones con dos o tres fases y radio contextual.
- [x] Dardo, Manta y Lince con siluetas, movimientos y patrones diferentes.
- [x] Pruebas de regresión y revisión móvil sin desbordamiento.

## Primer prompt sugerido
"Lee AGENTS.md, README.md y docs/ROADMAP.md. Implementa exclusivamente el Hito 1. Mantén la demo jugable, trabaja incrementalmente, añade pruebas de navegación y de guardado, ejecuta npm run check, y documenta los cambios. No inventes el contenido canónico de Ace Combat 3."
