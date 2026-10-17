# Documento de diseño (GDD) · v0.1

## Visión
Una experiencia narrativa ramificada con combates tácticos aéreos de 2–4 minutos, accesible desde navegador en PC o móvil, que permita comprender y explorar los conflictos, personajes y decisiones del Ace Combat 3 japonés.

## Bucle principal
1. Briefing con contexto y objetivos.
2. Conversación interactiva; elección de respuesta o alianza donde corresponda.
3. Minijuego ligado al conflicto y al objetivo de la misión.
4. Debriefing con consecuencias, registro y siguiente nodo del grafo.

## Mecánicas potenciales
- **Intercepción en radar**: detección, persecución, fijado y disparo.
- **Planificación táctica por turnos**: combustible limitado, ángulo de ataque, contramedidas y selección de objetivos; sin presión de tiempo.
- **Ataque a tierra**: rutas y priorización de amenazas.
- **Vuelo de precisión**: maniobras de navegación y obstáculos.

## Diseño de dificultad
Tres modos propuestos: Historia (sin exigencia de puntería), Normal (radar en tiempo real) y Táctico (pausa/turnos). La narrativa no debe depender de repetir combates largos.

## Alcance y estándares narrativos
- No transformar un combate cualquiera en una bifurcación canónica sin corroborarlo.
- No transcribir el guion original; diálogos originales de adaptación.
- Mantener un índice de nodos de referencia con fuentes, estados de verificación y consecuencias.

## UI
Pantalla de briefing y diálogo, panel de mapa de rutas, HUD de radar, informe de misión, glosario/personajes, historial de decisiones, guardar y continuar. Prioridad en legibilidad en Android y escritorio.
