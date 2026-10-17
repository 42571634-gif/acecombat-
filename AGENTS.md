# Instrucciones para Codex

## Objetivo
Desarrollar una experiencia HTML5 de *Ace Combat 3: Electrosphere* (versión japonesa) basada en narrativa ramificada, conversaciones y minijuegos aéreos tácticos breves, sin exigir reflejos intensos.

## Reglas de trabajo
1. Preservar jugabilidad en desktop y móvil, con interfaz responsive y controles accesibles.
2. **No inventar acontecimientos canónicos**: anotar `source`, `confidence` y `adaptation` en futuros datos de historia; diferenciar narrativa verificada de diálogo recreado.
3. No copiar diálogo protegido, cinemáticas, modelos 3D ni otros recursos originales. Usar texto propio y gráficos originales.
4. No hacer refactor gigantesco en una sola entrega. Priorizar cambios incrementales, con pruebas.
5. Conservar una demo ejecutable en cada commit. Ejecutar `npm run check` antes de finalizar cada tarea.
6. No añadir framework, bundler ni dependencia externa sin justificar necesidad.
7. El total de 52 misiones se reparte entre múltiples rutas: modelar un grafo, no 52 misiones obligatorias por partida.
8. Documentar para cada nueva mecánica: controles, condición de victoria, condición de derrota y efecto narrativo.
9. No cambiar arbitrariamente estructura de alianzas, decisiones ni finales canónicos.

## Primera tarea recomendada
Extraer datos `missions` y `story` de `src/game.js` hacia módulos separados y establecer un modelo `campaignState` con persistencia local, sin alterar el recorrido del prototipo. Añadir pruebas sobre decisiones y nodos inexistentes. Ver `docs/ROADMAP.md`.

## Definición de terminado
El proyecto arranca localmente, se puede completar al menos una ruta sin bloquearse, pasa las pruebas, mantiene la jugabilidad táctil y no confunde ficción adaptada con hechos del guion original.
