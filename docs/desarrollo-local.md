# Probar cambios locales

1. Abre la carpeta `catequesis-app` en VS Code.
2. Conserva la configuración pública del proyecto Firebase en `.env.local`. Hay una plantilla sin valores en `.env.example`. No uses aquí el archivo de servicio Admin.
3. En la terminal ejecuta `npm.cmd run dev` y deja esa terminal funcionando.
4. Abre la dirección que muestra Vite. Para esta prueba usamos `http://localhost:5173/`.

Que el juego se vea en localhost no demuestra que Vite esté funcionando: una versión anterior podía aparecer desde el caché aun con el servidor detenido. El service worker ahora se retira en localhost para evitarlo.

Si cambias de rama, espera la recarga y comprueba que estás viendo el diseño de esa rama. No pruebes con la web publicada hasta autorizar un deploy.

## Qué significa el nivel

Las cuentas empiezan en nivel 1. Cada lección distinta completada añade un nivel. Con una sola lección completada, el perfil debe mostrar nivel 2; repetirla no cambia ese número. Los reinos requieren completar todas las lecciones de los reinos anteriores.

El nivel mostrado se calcula desde las lecciones únicas del catálogo, no desde el antiguo contador. Al finalizar una lección, la transacción también ajusta ese contador al valor correcto para esa cuenta. No se ejecuta una migración masiva.

## Comprobaciones

- `npm.cmd test`: pruebas de progreso y caché.
- `npm.cmd run build`: compilación de producción.
- En una cuenta de prueba, anota el nivel, repite Señal de la Cruz, vuelve al perfil y comprueba que no cambió. Recarga y vuelve a comprobarlo.

El inicio y las recompensas de una cuenta de prueba siguen usando el Firebase configurado: jugar una lección modifica sus datos reales. Las pruebas automáticas usan datos simulados y no se conectan a Firebase.
