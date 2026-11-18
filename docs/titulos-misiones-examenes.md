# Títulos, misiones y exámenes

Trabajo local en `fix/titles-missions-exams-ui`, sin publicación automática.

## Comportamiento

- Misiones usa TitlesContext para consultar y reclamar títulos. Los 17 títulos de aprendizaje tienen una lección actual asociada. Si una cuenta ya completó esa lección, puede recuperar el título desde Misiones sin repetir la lección, monedas ni cofres. Los títulos ya poseídos se excluyen de los pendientes.
- Los contadores de misiones consideran completada una misión al alcanzar su meta. Reclamar mantiene la transacción existente que marca el premio como recibido y abona su importe una sola vez.
- La misión semanal de cinco días seguidos registra fechas únicas del período y comprueba tramos consecutivos. El protector de racha personal no convierte un día sin actividad en un día jugado para esta misión.
- Se mantiene el calendario UTC existente: en Nicaragua, el cambio diario ocurre a las 18:00 y el semanal el domingo a las 18:00.
- Cada uno de los ocho reinos tiene un acceso a su examen, separado de las 30 lecciones y del contador de nivel. Requiere todas las lecciones de ese reino y los anteriores. La entrega de monedas comprueba también estos requisitos con el documento vigente dentro de la transacción.
- Los bancos de examen se construyen a partir de las lecciones actuales: preguntas de conceptos, preguntas anteriores de comprensión cuando coincide el nombre de la lección y ejercicios de completar versos en los demás casos. No se agregan doctrinas ni temas nuevos. Se eligen ocho preguntas sin repetir, con representación de cada lección.
- Cada respuesta acertada conserva el premio existente de 50 monedas. Aprobar por primera vez entrega 200 monedas y un cofre de plata; practicar no repite ese premio final. Para aprobar se necesita responder todo y acertar al menos el 70%, sin redondear el umbral. El intento se detiene al agotarse las vidas.
- El perfil muestra nombres de títulos pendientes y el total real de lecciones en lugar de un gráfico ficticio de 17 niveles.

## Diseño

Misiones tiene estilos propios, verde oscuro y dorado como el mapa, portada con resumen de recompensas, filtros por período y por premios pendientes, y tarjetas en dos columnas que pasan a una columna en móvil. Texto funcional de 16 px, información secundaria de 14 px, controles de al menos 48 px y foco visible. Las animaciones de interacción respetan la preferencia de movimiento reducido.

Los diálogos de títulos usan el diálogo nativo del navegador para mantener el foco dentro de la ventana y permitir cerrarla con Escape. Se eliminó el acceso que fallaba al recibir títulos de rareza `mitico`.

## Verificación

- 63 pruebas automáticas: progreso, compras, inventario, premios, bancos de los ocho exámenes, recuperación de títulos y rachas semanales.
- Compilación de producción y revisión de los archivos nuevos con ESLint.
- En localhost, con la cuenta de prueba, se verificó un canje real de Protector del Reino: apareció el diálogo, el título desapareció de pendientes y el saldo siguió en 142 monedas.
- Los ocho exámenes se verificaron mediante sus bancos y condiciones de desbloqueo; no se completó un recorrido manual de los ocho reinos.

Estos cambios son validaciones de la aplicación cliente. No sustituyen controles de autorización en las reglas de Firebase o un backend. No se modificaron contraseñas, reglas de Firebase ni se migraron cuentas de producción.
