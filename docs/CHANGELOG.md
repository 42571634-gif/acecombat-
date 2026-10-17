# v0.3 — bullet hell y conversaciones ampliadas

- Combate por defecto con cañón automático, proyectiles enemigos por abanicos dirigidos, cortinas y anillos, movimiento en dos ejes y hitbox visible.
- Tres dificultades con velocidad, densidad, blindaje, daño y ventana de invulnerabilidad diferentes; preferencia local independiente de las partidas.
- Tres contramedidas por intento; precisión con Shift, movimiento táctil por arrastre y botones de cuatro direcciones.
- Conservadas las condiciones de las 52 misiones, objetivos secundarios y cinco finales. El núcleo táctico anterior sigue disponible para las regresiones del motor; la interfaz utiliza bullet hell.
- Triplicadas las intervenciones: introducción 1→3, cada briefing 2→6 y cada informe 1→3 (157→471). Textos originales específicos, fuentes y marcas de adaptación conservadas.
- Versionados recursos como 0.3.0 para actualizar móviles sin reutilizar módulos antiguos.

# v0.2 — campaña japonesa de 52 misiones

- Añadidos 52 capítulos adaptados, 162 nodos y cinco finales con fuentes por misión.
- Sustituido el acceso abreviado General Resource→Neucom por la bifurcación de Scylla and Charybdis en la campaña nueva.
- Añadidas condiciones por objetivos secundarios para las bifurcaciones 06, 20, 24, 30, 34, 39 y 48.
- Añadidas reglas de reconocimiento, escolta, navales, tren, contención, contenedores, órbita, navegación y asaltos por fases, además de intercepción e instalaciones.
- Añadidos archivo con búsqueda, prueba individual de misiones, pausa manual y lista de objetivos accesibles.
- Añadidos guardado separado de simulador y perfil persistente de misiones/finales.
- Migración de esquema 1→2 que conserva la demo anterior como campaña compatible.
- Documentadas fuentes comunitarias, adaptaciones de umbrales y límites de reproducción en RESEARCH.md.

La simulación y las conversaciones son adaptaciones, con objetivos y tiempos simplificados. No se han incorporado transcripciones completas ni recursos del juego.

# Hito 1 — arquitectura, guardado y validación

- Separados datos narrativos y misiones; el motor aplica decisiones declarativas y devuelve estados nuevos.
- Añadido estado de campaña con ruta, decisiones, resultados e historial reproducible.
- Añadidos autoguardado y controles Guardar partida/Continuar guardada con esquema versión 1.
- Añadido rechazo de guardados corruptos, incompatibles o incoherentes y tolerancia a almacenamiento bloqueado.
- Conservados los textos, las nueve misiones y los cinco finales del prototipo, incluido el acceso abreviado a Neucom.
- Corregidos tiempo fijo por fotograma, bajas acumuladas al reintentar, controles retenidos y transiciones pendientes tras reiniciar/cargar.
- El combate se pausa al ocultar la pestaña; cargar durante una misión la reinicia desde su comienzo.
- Migración a módulos JavaScript nativos: se requiere servidor HTTP local o alojamiento estático; no hay dependencias nuevas.

## Verificación

npm run check: comprobación sintáctica de los siete módulos y 18 pruebas automáticas. Incluyen las cinco rutas, una campaña UPEO completa mediante eventos de interfaz, guardado/carga y regresiones de combate.

Comprobación adicional en navegador real: inicio, decisión, recarga, recuperación de escena, carga de misión pendiente, radar y controles visibles. Consola sin errores JavaScript durante la revisión. Vista móvil de 390 px: paneles apilados y sin desbordamiento horizontal. La comprobación de tacto físico en un dispositivo móvil no se ha realizado.

La versión 0.2 incorpora identificadores de versión en CSS y módulos para evitar reutilizar recursos de la demo desde la caché del navegador.
