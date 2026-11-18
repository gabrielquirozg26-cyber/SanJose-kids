# Aula adaptada a celulares

## Diagnóstico de las capturas

La cabecera y el diálogo del personaje consumían gran parte de la pantalla inicial. El pie sticky cubría el contenido mientras que su altura aumentaba al incluir pociones. Ordenar duplicaba cada palabra: una ficha en el banco y otra en la oración formada, incluso para versos de 21 palabras.

## Solución

- En móvil, el aula ocupa la altura visible y se divide en cabecera, ruta, contenido desplazable y pie. El botón de comprobación ocupa su propia fila y conserva su espacio; no se dibuja sobre el reto.
- Marca y salida al mapa compactas, sin retirar el escudo ni San JoseKids.
- Personaje de 48 px y mensaje desplegable mediante Ver ayuda. Se conserva la presentación amplia de escritorio.
- Ordenar presenta partes de hasta seis palabras y aproximadamente 42 caracteres. Conserva todos los IDs originales y las palabras repetidas. Se puede regresar y editar cualquier parte antes de comprobar.
- Las palabras seleccionadas se muestran como texto legible, sin duplicar botones. Las fichas permanecen en su lugar y permiten añadir o quitar; una insignia indica su posición.
- La comprobación sigue recibiendo la oración completa. Cambiar de parte no valida, no concede monedas y no completa niveles.
- Botones de palabras de al menos 48 × 48 px y separación de 16 px. El botón principal conserva 56 px de altura. La ayuda de pociones está dentro del contenido y conserva sus reglas de consumo.
- Seleccionar utiliza dos columnas cuando hay espacio; conceptos y exámenes con respuestas largas conservan una columna.
- Ajuste de la altura con VisualViewport para el teclado móvil, sin reducir la interfaz al ampliar con los dedos. Se respetan las áreas seguras y el movimiento reducido.

Una oración larga o el texto ampliado pueden requerir desplazamiento dentro del reto. Se prioriza conservar textos legibles y controles amplios, en vez de forzar todo dentro de una pantalla.

## Referencias utilizadas

- [W3C: tamaño de objetivos táctiles](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced/). La implementación usa 48 px, por encima del umbral de 44 px del criterio mejorado.
- [MDN: VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport).
- [Chrome: teclado y cambios de viewport](https://developer.chrome.com/blog/viewport-resize-behavior/).

## Verificación

83 pruebas automatizadas: incluyen conservación de todos los versos reales, IDs repetidos, edición de partes y entrega íntegra al validador. Compilación de producción y lint de los componentes de lecciones modificados.

Revisión visual en Edge con los componentes reales y datos de ejemplo, dentro de ventanas de 390 × 780 y 320 × 640 px. Se comprobaron banco de palabras, avance entre partes, estabilidad de fichas, escritura y botón de comprobación habilitado. No se hicieron compras ni cambios en Firebase. La apertura de un teclado físico de Android/iOS queda por comprobar en un teléfono real.

No se modifican Firebase, proveedores de progreso, inventario ni transacciones de recompensas. La rama conserva también los últimos ajustes locales del recorrido de Lily y el acceso a compartir desde Perfil.
