# Navegación y lecciones: revisión de usabilidad

## Navegación en ventana normal

Se retiraron las reglas duplicadas que fijaban html/body, forzaban alturas de pantalla completa y trataban de ocultar las barras del navegador. El shell de estudiantes usa una cuadrícula de dos filas: contenido desplazable y navegación. La barra inferior ocupa espacio propio dentro de 100dvh; sus etiquetas no dependen de F11. En escritorio y tablets, icono y nombre comparten una fila.

El desplazamiento de portadas, pestañas y focos de Lily utiliza el contenedor central mediante scrollJuego.js. Las lecciones y exámenes mantienen su propia vista.

## Ordenar: un solo tablero

Se retiró la navegación entre partes. Las oraciones cortas conservan palabras individuales; las largas se presentan como piezas de hasta tres palabras y unos 22 caracteres. El ejemplo de 21 palabras se reduce a ocho piezas sin quitar texto.

Cada toque añade una pieza a la oración visible y la marca como colocada en el banco. Las piezas mantienen su tamaño y sitio. Quitar la última y Empezar otra vez son las dos únicas acciones de edición. La respuesta completa se envía al validador existente: no se corrige automáticamente ni se otorgan premios intermedios.

## Ayuda y comprobación

En móvil, el personaje mide 80 px y vuelve la burbuja clara con su mensaje visible. La explicación móvil es breve; escritorio conserva el mensaje habitual. No hay que abrir Ver ayuda para entender el reto.

Comprobar utiliza una barra inferior con espacio reservado en celular, tablet y PC. El botón mide al menos 56 px de alto y tiene un ancho limitado en pantallas grandes. Su icono, texto y estado deshabilitado mantienen contraste. Las áreas de piezas tienen al menos 60 px de alto y separación de 16 px.

## Archivos

- App.jsx, index.css, index.html y styles/juego-layout.css: altura y distribución de la aplicación.
- NavegacionJuego.jsx y Navbar.jsx: presentación de la barra separada de las acciones de navegación.
- utils/scrollJuego.js, CabeceraAventura.jsx y componentes de tutorial: desplazamiento compatible con la nueva distribución.
- componentes/leccion/EjercicioOrdenar.jsx, CompaneroLeccion.jsx, LeccionOracion.jsx y RespuestaLeccion.jsx, styles/aula.css y utils/ejercicios.js: interacción, ayuda y controles.
- tests/ordenar-piezas.test.js: conservación de todos los versos, duplicados, deshacer y orden incorrecto sin autocorrección.

## Comprobaciones

83 pruebas automatizadas y compilación de producción. Lint de los componentes nuevos y modificados de la interacción. No se modificaron Firebase, proveedores, inventario, niveles ni transacciones de recompensas.

El teclado virtual y las áreas seguras deben comprobarse también en un dispositivo físico; las vistas de revisión locales usan los componentes reales y datos de ejemplo, sin operaciones sobre cuentas.
