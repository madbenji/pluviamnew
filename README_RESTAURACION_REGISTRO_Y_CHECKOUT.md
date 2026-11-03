# PLUVIAM — Recuperar el registro y checkout visible (26 octubre 2026)

## Qué se modificó
- Se RESTAURÓ el gate LEGAL_APPROVED usado en la base anterior en lugar de los flags adicionales `PRIVACY_NOTICE_GO_APPROVED` y `CONSENT_VERSION` usados como bloqueo global en VFinal; **no se elimina la validación de identidad, Turnstile ni la escritura D1**. La aceptación y versión del consentimiento siguen guardándose en la base si el backend recibe solicitudes.
- Guardar diagnóstico continúa siendo botón habilitado. Intenta activar el registro de nuevo en cada envío; no abre `mailto:` ni otra app externa. **Solo muestra folio y clave reales tras respuesta 201 de D1**. En error no crea credenciales inventadas que el panel no puede consultar.
- Tres tarjetas visibles siempre en página y checkout: Mercado Pago, SPEI/CoDi y Criptomonedas. Si el cliente tiene folio/clave/propuesta cobrable, el botón lleva al endpoint del procesador. Si no, enfoca el formulario o explica qué falta. SPEI usa Mercado Pago o BBVA solo si la cuenta realmente ofrece el método. CoDi se anuncia como opción bancaria pero QR no se presenta si no existe una integración real.
- El correo de contacto se presenta como texto y en `/contacto.html` (no `mailto:` automático).

## Para restaurar HOY el folio real en ADMIN
En Cloudflare Pages conectada a DB D1, verificar `LEADS_ENABLED=true`, `LEGAL_APPROVED=true` (únicamente tras aprobación del aviso) y secretos `TURNSTILE_SECRET` / `TURNSTILE_SITE_KEY`, más el esquema D1 válido. **No introducir secretos en código ni en un chat**. Verificar `GET /api/estado` => `accepting:true` y Turnstile site key, probar un registro consentido, comprobar `201 {folio,accessToken}` y lectura en `/admin.html`. Si la web real continúa con `accepting:false`, ningún ZIP local crea folios en esa base.

## Pagos
La visualización de botones no implica que estén cobrándose fondos. Para que Mercado Pago Checkout Pro, SPEI y NOWPayments/USDT procesen pagos se requieren cuentas activas, URLs/API secretas en Cloudflare, permisos de negocio, esquema D1 y pruebas reales. No se habilitan enlaces arbitrarios, no se inventa CLABE/QR ni se elimina conciliación ni verificación de webhooks. Desplegar primero a Preview; pasar a producción tras pruebas reales de propuesta, pago y devolución.

## Estado
CANDIDATO STAGING, no se ha publicado ni modificado Cloudflare. No cuenta con credenciales autenticadas de Cloudflare ni de los proveedores de pago. Ninguna transacción real ejecutada.
