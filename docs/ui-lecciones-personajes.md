# Aula de aventuras: lecciones y exámenes

## Cambios de presentación

- Lucy, el ángel Nico y San Francisco acompañan los retos mediante ilustraciones SVG originales y animaciones breves. Se conserva el escudo y la identidad de Catequesis San José de Diriamba.
- Seleccionar: opciones amplias, letras de referencia y confirmación explícita antes de evaluar.
- Escribir: campo grande, pista visible y comprobación con Enter; no se fuerza el teclado del móvil.
- Ordenar: fichas identificadas individualmente, incluso cuando se repite una palabra. Se puede quitar una ficha, deshacer o empezar de nuevo.
- Conceptos y exámenes comparten encabezado, progreso, acompañantes y respuestas comprensibles. El examen mantiene sus reglas y permite revisar respuestas al terminar.
- Resultados diferenciados para aprobado, repaso e intento pendiente. Las monedas mostradas proceden del resultado real del guardado.
- Diseño adaptable, controles grandes, foco visible y respeto de `prefers-reduced-motion`. Las animaciones de los nuevos compañeros son finitas.

## Archivos principales

- `src/styles/aula.css`: estilos del aula, actividades, compañeros y resultados.
- `src/components/leccion/`: componentes de actividades, acompañantes y respuestas compartidas.
- `src/views/Leccion.jsx` y `src/views/Examen.jsx`: integración del recorrido.
- `src/hooks/useLeccion.js`: reinicio del formulario al avanzar, protección frente a doble avance y efectos opcionales.
- `src/utils/ejercicios.js` y `tests/ejercicios.test.js`: identidad de fichas, palabras repetidas y huecos de oración.
- `src/views/Mapa.jsx`, `Mapa.css`, `Misiones.jsx` y `src/components/GuiaLuz.jsx`: compañeros en reinos disponibles y nombre Lucy consistente.

No se modificaron los proveedores, las consultas de Firebase ni las transacciones que controlan progreso, inventario y monedas.

## Comprobación

- Pruebas automatizadas: 68 casos, incluidos cinco nuevos para fichas repetidas y frases con palabras repetidas.
- Compilación de producción y revisión de lint en los componentes del aula.
- Revisión visual en Edge sobre localhost: seleccionar, escribir, resultados de repaso y ordenar con deshacer, utilizando lecciones ya completadas de la cuenta de prueba.
- Se verificó que repetir una respuesta ya abonada muestra que estaba guardada y no vuelve a acreditarla.
- No se realizaron exámenes completos de todos los reinos ni una prueba física en tablet durante esta revisión.

Los cambios son locales; no se publicaron en producción.
