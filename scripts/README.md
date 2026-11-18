# Scripts administrativos y datos privados

Estos scripts usan Firebase Admin y pueden modificar usuarios reales. No ejecutarlos para probar la interfaz.

## Configuración local

1. Copia `.env.admin.example` como `.env.admin.local`, en la raíz del proyecto.
2. Completa la variable del script con una contraseña nueva de al menos 12 caracteres. Los espacios exteriores no cuentan para el mínimo.
3. Conserva `scripts/serviceAccountKey.json` solo en tu equipo.
4. Ejecuta manualmente solo el script que necesites y hayas autorizado:

```powershell
node --env-file=.env.admin.local scripts/crearNinoInteractivo.js
```

| Script | Variable |
| --- | --- |
| crearNinoInteractivo.js | ADMIN_NINO_PASSWORD |
| generarCredencialesNinos.js | ADMIN_NINO_PASSWORD |
| crearCatequistaAuto.js | ADMIN_CATEQUISTA_PASSWORD |
| crearCatequistaTest.js | ADMIN_CATEQUISTA_TEST_PASSWORD |

Los scripts conservan su comportamiento de creación y sus salidas de consola. Las credenciales impresas y los archivos generados siguen siendo privados. No compartas capturas ni subas esos archivos. La contraseña configurada sigue siendo compartida por las cuentas nuevas de cada ejecución; las contraseñas individuales requieren otra mejora.

`generarCredencialesNinos.js` no recupera contraseñas de Firebase: imprime la contraseña configurada. Para cuentas existentes, ese dato no demuestra cuál es su contraseña actual. No distribuyas su salida sin comprobar que corresponde a las cuentas.

Los scripts antiguos ignorados por Git (por ejemplo, `crearUsuarios.js`) no quedan migrados por este cambio. No los vuelvas a incluir en Git sin revisar sus secretos.

## Archivos privados

Git ignora las variantes privadas de `.env`, claves de servicio, `scripts/credenciales_*`, `scripts/resultados_*`, hojas de cálculo administrativas y claves `.pem` / `.key`.

Excluir un archivo no cifra su contenido. Conserva estos datos fuera de carpetas compartidas y respáldalos en un lugar privado. No fuerces su inclusión con `git add -f`.

## Pendientes que requieren una intervención separada

Retirar archivos del seguimiento no los borra de commits anteriores ni de GitHub.

Las contraseñas que estuvieron en Git deben considerarse expuestas. Cambiar la configuración local no cambia las contraseñas de cuentas existentes: su reemplazo requiere un proceso coordinado con quienes las usan.

Si una clave de servicio se compartió, hay que revocarla y reemplazarla desde Google Cloud/Firebase. No encontramos `scripts/serviceAccountKey.json` en el historial local consultado; eso no acredita que nunca se haya compartido por otra vía.

Limpiar el historial remoto requiere acordar las ramas afectadas, avisar a colaboradores y preparar la recuperación. No hacer un push forzado como parte de este cambio.

Antes de subir cambios, revisa `git status` y `git diff --cached --stat`.
