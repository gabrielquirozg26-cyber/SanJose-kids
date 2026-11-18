# Compras, inventario y recompensas

Las operaciones de saldo usan transacciones de Firestore sobre el perfil del usuario. Cobro, entrega y límite diario se confirman juntos. La interfaz solo muestra una compra exitosa después de que Firestore confirma el guardado.

## Catálogo e inventario

- Los precios y límites se definen en `src/utils/economia.js`. La oferta se calcula con la misma función al mostrarla y al cobrarla; no se confía en un precio enviado por la interfaz.
- Se conserva el formato de inventario existente: un array de IDs. Las unidades repetidas representan cantidades. Consumir un objeto quita solo una coincidencia.
- Comprar un marco lo añade al inventario y a los marcos desbloqueados, y lo equipa. No se vuelve a cobrar un cosmético ya adquirido.
- Se conservan precios, probabilidades, límites y compensaciones originales de los cofres comprados. Un santo repetido se compensa en la misma transacción del cobro.
- Los períodos diarios y semanales mantienen las fechas UTC que usaba el juego. Cambiar a un calendario local requiere tratar la transición de los límites existentes por separado.

## Lecciones y premios

- Doble XP se activa al entrar a la siguiente lección y consume una unidad. Reabrir esa misma lección sin terminarla conserva la sesión y no gasta otra unidad.
- Cada ejercicio se paga una sola vez en una sesión. Abrir otra lección en otra pestaña reemplaza la sesión anterior; una pestaña con la sesión reemplazada no puede seguir cobrando.
- Las monedas de cada ejercicio, su multiplicador y el progreso de misiones se guardan juntos. La interfaz muestra el importe realmente abonado.
- La primera finalización guarda progreso, cofre, título pendiente y los bonos aplicables en la misma transacción. Repetir permite practicar con recompensa reducida, pero no vuelve a entregar el cofre ni el bono de primera finalización.
- Los conceptos abonan el bono de 100 monedas que antes solo aparecía en el resumen; Doble XP también lo duplica. La pantalla final usa el bono confirmado.
- Los logros usan los IDs actuales de las lecciones. Al repetir una lección puede recuperarse un título que faltaba por el mapa de IDs antiguo, sin volver a pagar el cofre.
- El bono diario utiliza la racha actualizada y no puede cobrarse dos veces el mismo día. El protector cubre un día omitido y consume solo una unidad.
- Canjear una misión o un título pendiente marca el canje y entrega la recompensa juntos. Los exámenes no vuelven a conceder el bono de aprobación ni el cofre una vez aprobados.

## Verificación

Ejecuta `npm.cmd test` y `npm.cmd run build`.

En una cuenta de prueba, comprueba también:

1. Una oferta descuenta exactamente su precio anunciado.
2. Comprar dos unidades conserva ambas después de recargar; usar una deja la otra.
3. Saldo insuficiente, vidas completas o límite diario no cobran monedas.
4. Doble XP se consume una vez y las monedas del ejercicio se duplican.
5. Completar y repetir una lección no duplica los premios de primera finalización.
6. Canjear una misión entrega el importe una sola vez.

Las pruebas automáticas usan datos simulados. Las pruebas en el navegador sí modifican las monedas y el inventario de la cuenta de prueba conectada al Firebase configurado.

No se ejecuta una migración masiva ni se devuelven automáticamente compras antiguas: las unidades que se perdieron antes del arreglo no pueden reconstruirse con certeza sin un historial de operaciones. Estas transacciones tampoco sustituyen las reglas de autorización de Firestore.
