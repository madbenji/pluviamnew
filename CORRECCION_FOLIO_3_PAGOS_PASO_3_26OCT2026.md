# PLUVIAM — restauración del último paso (26 oct 2026)

## Entrega

- `site/` contiene paquete de Cloudflare Pages, _worker.js y tres tarjetas dentro de la confirmación de folio.
- `site/app.js`: arreglada carrera asíncrona de Turnstile, envío de solicitud real a `/api/solicitudes`, recepción de `folio` + `accessToken`, y `sessionStorage` privado.
- Si la API no confirma, el sitio **no inventa un folio** ni presenta un PDF local como si fuera un registro real. Muestra un único aviso breve y botón de guardar sigue disponible.
- Se eliminaron acciones de respaldo «Descargar sin folio», «Copiar resumen», «Reintentar registro», «Copiar correo». No hay `mailto:` en el flujo.
- `site/index.html`: tarjetas Mercado Pago, SPEI/CoDi y Crypto **dentro del paso 3 tras éxito**, no duplicadas antes de que la persona se registre.
- `site/pagar.js`: recupera automáticamente folio y clave de la sesión segura del navegador, oculta campos redundantes y usa el proveedor elegido al regresar con propuesta aprobada. Sin `token` en URL. Para otro dispositivo, sigue disponible la recuperación manual por folio y clave.
- No se elimina la verificación de autenticidad de pagos, firmas, monto ni la escritura en D1. Credenciales faltantes o cotización no aprobada impiden intentar cobrar.

## Estado y alcance

Se comprobó públicamente `/api/estado`: `accepting:true`, `payments:false` (26 oct). El éxito del **registro de folio en D1/Admin** requiere realizar prueba real autorizada en Cloudflare con cuenta de prueba (NO se hizo). Ni producción ni Preview fueron modificados en esta sesión.

## Publicación

1. Antes de subir a producción: respaldo de despliegue actual y base D1; desplegar ZIP de `site/` en un Cloudflare Pages Preview del proyecto correcto que soporte `_worker.js`, D1 y Turnstile.
2. En Preview confirmar `/api/estado`, usuario de prueba autorizado, folio auténtico, consulta en `/admin.html`, y `/pagar.html` sin introducir datos dos veces en la misma sesión.
3. Obtener aprobación para despliegue productivo, comprobar rollback y monitoreo. No activar `PAYMENTS_ENABLED` o claves financieras sin pruebas E2E, remitente/monto y merchant validados.

## QA local ejecutada

- `npm run verify`: **19/19 suites PASS**, además `tests/test_coherencia.mjs` **218 verificaciones PASS**.
- `tests/test_journey_registro_3_tarjetas.mjs`: prueba sintética de carrera de Turnstile; una pulsación → una petición a `/api/solicitudes` → credenciales devueltas y guardadas en sesión.
- No se hizo envío real de datos personales, escritura D1 real ni cobro a ningún proveedor.

## Para publicar hoy (requiere inicio de sesión Cloudflare del titular)

1. Panel Cloudflare → Workers & Pages → seleccionar proyecto `pluviam` → Create deployment → Preview → cargar ZIP Pages `PLUVIAM_JOURNEY_FOLIO_PRIMERO_CLOUDFLARE_PREVIEW.zip`.
2. Mantener los bindings y secretos de producción sin copiar ni mostrarlos en el chat; verificar que el mismo Worker corresponda al proyecto, D1 y Turnstile.
3. Probar un expediente real de prueba autorizado, comprobar `folio`, `accessToken` y registro en `/admin.html` de la misma base D1. Probar las tres tarjetas sin efectuar transferencias o pagos no autorizados.
4. Si falla, revertir despliegue de Preview. Para producción, despliegue controlado con respaldo/rollback.

Esta conversación no dispone de una sesión autenticada Cloudflare; no afirmamos que el ZIP se haya publicado.
