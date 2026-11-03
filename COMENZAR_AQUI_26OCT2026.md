# PLUVIAM | Restauración de folios y 3 métodos de cobro — 26/10/2026

## Archivos
- `PLUVIAM_RESTAURACION_FOLIO_3_BOTONES_CLOUDFLARE_PREVIEW.zip`: contenido directo de `site/` para Cloudflare Pages, incl. `_worker.js`.
- `PLUVIAM_RESTAURACION_FOLIO_3_BOTONES_CODIGO_Y_QA.zip`: código íntegro, migraciones, tests y guías.

## Cambios
- Tres tarjetas siempre visibles: **Mercado Pago**, **SPEI / CoDi**, **Criptomonedas**. Checkout continúa consultando el monto y generando enlace desde el proveedor autorizado, sin credenciales embebidas.
- Corrección completa del desvío a Outlook: no hay `mailto:` en los assets del sitio. La acción Guardar reintenta consultar API y muestra folio/clave **solo si fueron almacenados por D1**.
- Se revirtió específicamente el nuevo gate de privacidad `PRIVACY_NOTICE_GO_APPROVED`, recuperando la configuración `LEGAL_APPROVED` del código previo; no se deshabilitaron seguridad, consentimiento, token de seguimiento, antiduplcado, firma de webhook ni protección financiera.

## Estado de prueba
`npm run verify`: **18 suites locales PASS**, coherencia 219 PASS; providers y D1 *simulados*. No certifica pago en vivo, ni Turnstile y D1 reales, ni pruebas móviles visuales.

## Para activar realmente
1. Autorizar aviso de privacidad y conservar copia. Verificar en Cloudflare Pages que el binding `DB` apunte a la D1 correcta con backup; activar `LEADS_ENABLED=true` y `LEGAL_APPROVED=true` cuando se comprueben los respaldos legales; asegurar `TURNSTILE_SITE_KEY` y secreto válidos.
2. Publicar primero una versión **Preview**, comprobar `/api/estado` con `accepting:true`, crear un expediente de prueba consentido y validar folio+clave en UI y en `/admin.html` y consulta `/api/proyecto`.
3. Solo para cobros reales: titular y cuenta Mercado Pago habilitados, SPEI disponible en merchant, transferencia BBVA conciliable, NOWPayments configurado y wallet acreditada, aceptación/importe contratados, webhook autenticado y sandbox E2E.
4. Pasar a producción con rollback y monitoreo. Nunca pegar tokens de proveedor en HTML o chat.

## Lo que no es posible sin Cloudflare
Sin credenciales autorizadas de Cloudflare, conexión D1 y proveedor, el ZIP no actualiza `https://pluviam.pages.dev/` y el sistema no puede fabricar folios registrados ni enlaces efectivos. El usuario debe completar el acceso autorizado.
