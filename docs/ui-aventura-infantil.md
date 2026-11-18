# Interfaz de aventura para niños de 7 a 13 años

Rama local: `fix/ui-aventura-infantil`.

## Pantallas adaptadas

- **Misiones:** portada con Luci, estrella guía ilustrada en SVG; botón para ir al mapa o recoger premios; retos con iconos grandes, color por tipo y recompensa visible. Las misiones recibidas se agrupan en un desplegable cerrado inicialmente. El siguiente reto sugerido se elige entre los pendientes por su proporción de avance, sin modificar sus objetivos. Filtros «Hoy», «Esta semana» y «Premios».
- **Mapa:** conserva el recorrido y los bloqueos existentes. Se sustituye la portada de fotografía y tipografía editorial por una portada de aventura con Luci, azul luminoso, títulos redondeados y controles más legibles. Se mantienen colores por reino, navegación, selección de lección y progreso.
- **Exámenes:** introducción con tres reglas visuales y premio explícito. El requisito del 70% se explica también como cantidad de aciertos (6 de 8). Opciones identificadas por letras, mensajes de acompañamiento y resultados con monedas realmente recibidas. La barra incluye la pregunta actual una vez confirmada.
- **Títulos:** insignias visibles en la tienda y celebración con Luci al recibir un título. Se conserva el diálogo accesible y el canje existente.

## Implementación y límites

Luci es un único componente compartido, sin imágenes externas ni dependencias nuevas. Su movimiento termina después de dos ciclos y se desactiva con `prefers-reduced-motion`. El diseño usa controles de al menos 48 px, llamadas principales de 56 px, texto funcional de 16 px y texto secundario de 14 px. Las tarjetas pasan a una columna en móvil.

No se cambiaron Firebase, las reglas del juego, los precios, los premios, las preguntas ni el estado global de monedas, vidas o progreso. Ir al mapa cambia solamente la pestaña de navegación.

Las pruebas existentes y la compilación pasan; los archivos JSX nuevos o reescritos pasan ESLint. Esto verifica implementación y regresiones, no demuestra por sí solo que la interfaz guste a todos los niños. Queda pendiente observar su uso con niños de distintas edades.

Revisión visual en Edge y localhost: portada de Misiones con Luci, tarjetas semanales y misiones recibidas colapsadas; navegación desde «¡Vamos al mapa!» al mapa actualizado y su siguiente actividad. Los contrastes calculados de cinco combinaciones principales de texto y fondo están entre 7,48:1 y 10,29:1. No se hizo una comprobación visual de todas las pantallas ni una prueba manual en un dispositivo móvil real.
