# Lily: introducción y novedades

## Integración

El tutorial vive en el shell de estudiantes, después del acceso y la bienvenida existente. No aparece durante lecciones ni exámenes, y espera a que terminen los cofres, la celebración de racha y los títulos pendientes. El acceso de catequistas permanece igual.

- `src/components/tutorial/TutorialProvider.jsx`: sesión del recorrido, navegación y recuperación de la vista previa.
- `RecorridoLily.jsx`: diálogo accesible, foco sobre elementos reales, adaptación a scroll y cambios de tamaño.
- `Lily.jsx`: personaje vectorial original del tutorial. Lucy continúa como compañera del resto del juego.
- `AyudaLily.jsx`: acceso manual desde Perfil al recorrido completo y a las novedades.
- `src/utils/tutorialLily.js`: pasos, diferenciación de usuarios y persistencia versionada.
- `src/styles/tutorial-lily.css`: presentación móvil, áreas seguras, controles de 48/56 px y movimiento reducido.

Los atributos `data-tutorial` identifican zonas de mapa, navegación, racha, álbum, misiones, mochila y compartir. El recorrido cambia de pestaña sin pulsar los controles del juego. Escape o cerrar equivale a posponer; también hay botones Atrás, Siguiente y Omitir. Al salir se recupera la pestaña de origen.

## Detección y memoria

Las cuentas nuevas reciben diez pasos. Las cuentas con actividad previa reciben cinco pasos sobre racha, cofres y compartir. Se conserva la condición de primer acceso cuando la bienvenida acaba de cambiar la contraseña inicial.

Cada cuenta utiliza `sanjosekids:tutorial-lily:<uid>` en localStorage. Solo se guardan versión, modo, identificador del paso, estado e indicador de introducción vista; no se guardan nombre, contraseña ni datos de progreso del juego.

- Un recorrido pendiente se reanuda después de recargar.
- Terminar, posponer u omitir evita repetirlo automáticamente en la misma versión.
- Se puede reabrir desde Perfil. Más tarde permite retomar el recorrido pospuesto.
- Si se publica otra actualización, se cambia `VERSION_TUTORIAL` para ofrecer las novedades.
- Si localStorage no está disponible, funciona con memoria durante la sesión. Al borrar los datos del navegador o cambiar de dispositivo puede volver a aparecer. No sincroniza preferencias con Firebase.

## Verificación

Pruebas de diferenciación, reanudación, estados de cierre, versión nueva, aislamiento de cuentas y almacenamiento corrupto o denegado. No se modifican proveedores de economía, autenticación, progreso ni transacciones de Firebase.

La suite completa contiene 78 pruebas. Se revisa lint de los módulos nuevos y la compilación de producción. La vista local de revisión usa datos de ejemplo y no escribe en Firebase.

La rama también conserva el trabajo anterior de racha, cofres y compartir. No se publica automáticamente: main permanece separado.
