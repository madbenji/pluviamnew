# QA · PLUVIAM Overdrive Beta

## Resultado local

La suite `tests/test_beta_overdrive.mjs` ejecuta 13 pruebas end-to-end contra SQLite en memoria usando exclusivamente el esquema `006_overdrive_beta.sql` y datos sintéticos. `tests/test_beta_static.mjs` añade dos verificaciones de rutas y assets.

Casos cubiertos: estado de entorno aislado; rechazo sin sesión; dos aliados; consentimiento; diagnóstico; asignación; aislamiento Fernando/345; cotización `NO_GO` por costos no verificados; economía `INTEGRADOR`; bloqueo de orden sin aprobación; flujo aprobado → orden → QA; pedido Store sin cobro; HI Care sin cobro; auditoría sólo para operaciones.

## Resultado

`15/15 PASS` en Node 24.22.1.

El ZIP listo para subir manualmente a Pages es el contenido de `site/`, no el ZIP fuente completo. El hash del artefacto se registra en `MANIFEST_BETA_OVERDRIVE.json`.

El paquete heredado incluye suites históricas adicionales. Varias construyen rutas Windows desde `URL.pathname` y en este entorno producen `C:\C:\...`; sus errores son de harness/ruta, no de la beta nueva. Las pruebas históricas que no dependen de ese patrón permanecen PASS. Deben corregirse en el harness antes de usarlas como gate de release.

## No verificado aquí

- No hay URL Preview real: no existe sesión autenticada Cloudflare disponible.
- No se inspeccionaron deployment, bindings o D1 productivos; por eso no se declara producción intacta por observación autenticada, sólo por no haberlos tocado.
- No se ejecutó navegador real, móvil real, Pages HTTP, D1 Cloudflare ni webhook.
- No se activaron pagos, correo, WhatsApp, Retell ni IA real.
- `wrangler`/`npx` no están instalados o disponibles en este entorno; no se pudo ejecutar `wrangler whoami` ni comprobar una cuenta Cloudflare.
- El escaneo del Preview `site/` no encontró claves live, private keys ni tokens activos. El sitio heredado conserva el correo público de soporte `pluviammx@gmail.com`; el paquete fuente contiene placeholders de pruebas heredados, no credenciales de producción.

## Dictamen

**NO-GO para despliegue comercial o cobro. GO técnico condicionado para subir a Preview aislado**, después de crear `DB_BETA`, verificar el binding y ejecutar la migración en esa base. El siguiente cambio de mayor impacto es conectar el Preview a Cloudflare con un binding D1 beta y repetir los 13 casos contra D1 real, agregando verificación visual móvil/escritorio.

