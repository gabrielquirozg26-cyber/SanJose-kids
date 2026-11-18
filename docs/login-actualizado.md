# Acceso actualizado

Inicio de sesión compartido por estudiantes y catequistas, con las rutas existentes `/` y `/catequista`. Se conserva `iniciarSesion` y las comprobaciones de rol de las rutas.

- Fondo celestial, escudo y nombre del equipo de catequesis, Lucy y Lily.
- Formulario claro con etiquetas de 16 px, campos de 56 px, autocompletado de credenciales y botón para mostrar u ocultar la contraseña.
- Presentación de dos columnas en escritorio y una columna en móvil, con desplazamiento natural al abrir el teclado.
- Un solo envío simultáneo, estados de carga y errores comprensibles. No se muestran errores técnicos ni se informa si un correo existe.
- Durante el envío se conserva el formulario aunque el proveedor cambie su estado de carga. Al autenticar, se espera el perfil antes de abrir el juego.
- No se cambian contraseñas, credenciales, proveedores ni llamadas a Firebase.

Archivos principales: `src/components/acceso/PantallaAcceso.jsx`, `src/styles/acceso.css`, `src/utils/mensajeAcceso.js`, las vistas Login/LoginCatequista y sus rutas en App.jsx.

Verificación: 86 pruebas automatizadas y compilación de producción; lint de los módulos de acceso. Las pruebas nuevas cubren mensajes de conexión, intentos, credenciales y ausencia de datos internos en el error visible.
