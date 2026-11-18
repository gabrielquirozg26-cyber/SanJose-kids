# Álbum, Tienda, Ranking y Perfil

Rama local: `fix/ui-coleccion-tienda-perfil-ranking`.

## Identidad y estructura

Las cuatro pantallas comparten la cabecera `CabeceraAventura`: Luci, azul celestial, acentos dorados, escudo original y firma «San JoseKids · Equipo de Catequesis · San José, Diriamba». No se sustituyeron las imágenes de los santos ni su contenido catequético. La cabecera es más compacta que la portada del mapa.

`aventura-vistas.css` contiene los estilos comunes. `ImagenJuego` ofrece imágenes con respaldo de icono sin modificar el DOM mediante `innerHTML`.

## Mejoras por pantalla

- **Álbum:** cartas con nombres completos y estado legible; pestañas para todos, propios y pendientes; búsqueda que ignora tildes; selección de familia y rareza; explicación para conseguir cofres; las cartas pendientes explican cómo descubrirlas. El filtrado y la ordenación ya no mutan el catálogo compartido. La historia del santo usa el mismo estilo y conserva biografía, festividad y enseñanza.
- **Tienda:** categorías con nombre visible también en móvil; uso de cada objeto, cantidades de mochila, límites y motivos para desactivar compras; precios del catálogo compartido existente. Antes del cobro hay un diálogo con producto, precio y saldo posterior. Cancelarlo no escribe datos. Los cofres describen la carta sorpresa y no prometen una rareza garantizada.
- **Ranking:** lenguaje de compañeros y equipos, nombres sin truncado, listado propio/global/equipos y posición personal por UID. Mantiene el orden por monedas y explica que las compras cambian el saldo. Ignora respuestas de una selección anterior cuando el niño cambia de pestaña. Se eliminan animaciones repetidas y avisos automáticos de posición. Los equipos se despliegan para consultar sus integrantes.
- **Perfil:** pasaporte con avatar editable mediante un botón accesible; estadísticas legibles; pestañas con texto; títulos y marcos equipables; ayuda cuando no hay tesoros. El perfil público sigue el catálogo real de 30 lecciones y el progreso único, en lugar de mostrar un porcentaje sobre 17 niveles. Se mantienen edición de biografía, santo favorito, compartir progreso y evaluaciones del catequista.
- **Navegación común:** seis destinos con etiquetas de mayor tamaño, estado actual accesible, controles amplios, fondo sin desenfoque y espacio seguro inferior. Se mantiene visible y al cambiar de pantalla vuelve al inicio del contenedor real de desplazamiento.

## Datos

No se modificaron las consultas de Firebase, los providers, precios, reglas, recompensas ni la contabilidad de monedas, vidas y progreso. La Tienda invoca las mismas operaciones transaccionales existentes después de confirmar. Los errores de edición del perfil conservan el formulario para reintentar.

## Comprobaciones

- 63 pruebas existentes aprobadas; compilación y ESLint de todos los archivos JSX editados aprobados.
- Revisión visual en Edge y localhost de Álbum, Tienda, Ranking y Perfil.
- Búsqueda «Jose» devuelve las dos cartas con «José» en el nombre.
- Diálogo de poción: precio 120, saldo previo 287 y saldo posterior anunciado 167. Se canceló sin comprar y el saldo siguió en 287.
- Ranking de grupo y clasificación por equipos cargados; navegación nueva lleva al principio de la vista.
- Vista emulada de teléfono de 390 × 844: Perfil y Tienda; categorías de tienda visibles en dos columnas. No equivale a una prueba en un móvil físico.
- No se ejecutaron compras adicionales ni cambios de avatar o biografía durante esta revisión. Queda pendiente la observación con niños de distintas edades.

La compilación conserva los avisos anteriores sobre tamaño del paquete de Firebase y sus importaciones dinámicas; no bloquean la compilación.
