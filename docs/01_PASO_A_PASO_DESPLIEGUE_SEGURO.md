# Despliegue seguro en Cloudflare Pages (sin secretas en ZIP)
## 0. Backup y permisos
- No tocar `pluviam.pages.dev` sin aprobación. Identificar proyecto/versión Cloudflare exactos. Exportar esquema y copia restaurable de D1; conservar Worker, enlaces, variables/secretos por inventario de NOMBRES, no de valores; documentar rollback y acceso de dos personas.
- No subir directamente el ZIP de staging a producción. Para Direct Upload, subir **el contenido de `site/`** o el ZIP plano `PLUVIAM_CLOUDFLARE_PAGES_CANDIDATO_STAGING.zip` a Preview/staging del mismo proyecto de pruebas aislado. Verificar que el despliegue de Pages admita `_worker.js` y tenga `ASSETS` / `DB` correctamente vinculados.

## 1. Staging independiente
- D1 de staging con esquema histórico validado. `migraciones/001` crea sólo tablas auxiliares; la base `lead_cases`, `approved_quotes`, `payment_attempts` viene del esquema histórico de la aplicación **y NO está incluida como migración inicial completa**. No inventar ni sobreescribir una D1 vacía.
- Aplicar 003 y 004 una sola vez (ALTER de columna), 005 tras inspeccionar duplicados de identificadores bancarios; 002 sólo si la función Retell se prueba por separado. Contrastar previamente `PRAGMA table_info('approved_quotes');` y tablas en `sqlite_master`.
- Vincular `DB` a D1 staging; configurar credenciales sandbox del proveedor, nunca producción. Turnstile propio para el dominio de pruebas.

## 2. Bandera de bloqueo inicial
Variables staging no secretas:
```
LEADS_ENABLED=false
LEGAL_APPROVED=false
PRIVACY_NOTICE_GO_APPROVED=false
CONSENT_VERSION=pendiente
PAYMENTS_ENABLED=false
COMMERCE_GO_APPROVED=false
CONTRACT_TERMS_APPROVED=false
BANK_PAYMENT_ENABLED=false
BANK_ACCOUNT_VERIFIED=false
NOWPAYMENTS_ENABLED=false
CRYPTO_COMPLIANCE_APPROVED=false
CUSTOMER_EMAIL_ENABLED=false
CUSTOMER_EMAIL_GO_APPROVED=false
PROJECT_DOCS_ENABLED=false
RETELL_ENABLED=false
```
**No** cambiar a true por presiones de fecha. La nueva `PRIVACY_NOTICE_GO_APPROVED` sigue exigiendo que se apruebe de verdad el aviso público. Para habilitar, usar una `CONSENT_VERSION` alfanumérica aprobada (p. ej. `aviso-2026-10-v1`), no "borrador", "test" ni "preliminar".

## 3. Secretos Cloudflare (nunca en HTML/ZIP/chat)
`TURNSTILE_SECRET`, `ABUSE_PEPPER`, `ADMIN_TOKEN`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`; si se usan Stripe/Resend/Jobs, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `JOBS_TOKEN`. En `Settings → Variables and Secrets`, **Encrypt / Secret**. La `MP_PUBLIC_KEY`, `TURNSTILE_SITE_KEY` y variables de negocio no son secretas. Si se habilita BBVA: `BBVA_CLABE`, `BBVA_BENEFICIARY_NAME` solo tras validar identidad/titularidad y según política de exposición.

## 4. Endpoints y webhooks
- GET `/api/estado`: flags públicas. Si `accepting:true` sin aviso legal definitivo, **NO GO**, deshabilitar recepción y revisar banderas.
- GET `/api/admin/salud`, GET `/api/admin/operacion`: privados con `Authorization: Bearer <ADMIN_TOKEN>` desde panel. Los contadores no sustituyen reportes de banco.
- `POST /api/webhooks/mercadopago`, `POST /api/webhooks/nowpayments`, `POST /api/webhooks/stripe` si Stripe está contratado. Copiar únicamente URLs del dominio realmente desplegado; IPN secret distinta del API key.
- Verificar lista de IP permitidas/firewall para webhooks, reloj, latencia, reintentos, autenticidad, deduplicación y callbacks de estatus reales. Bloquear acceso a `/_worker.js`, `/admin` con Cloudflare Access/WAF adicional para cuentas del personal.

## 5. Activación por etapas
- Legal aprueba y publica identidad/domicilio/derechos y texto contractual: activar `LEGAL_APPROVED`, `PRIVACY_NOTICE_GO_APPROVED` y `CONSENT_VERSION`; prueba de captación de control.
- Técnicos validan cotizador/BOM, propuestas y aceptación del cliente; finanzas firman precio/margen, factura y anticipo.
- Comercio habilita merchant MP: `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`; si tarjeta Brick, `MP_PUBLIC_KEY`. Confirmar en la cuenta qué métodos SPEI están disponibles. Prueba de pago completa contra D1 staging.
- BBVA: verificar beneficiario y CLABE real, index 005 y conciliación con extracto; no activar "automático" sin proveedor bancario autenticado.
- Crypto: generar factura en MXN con monedas/wallet validadas, firmar IPN y consultar transacción; un cambio a `finished` de pago parcial no debe acreditar sin revisión.
- Correo: dominio Resend del remitente, pruebas reales de entrega y reintento idempotente.
- Después del informe D14 QA y acta D01, pasar a Production con flags cerrados, smoke test y **activar método por método**. Prueba real de importe autorizado únicamente con permiso expreso del titular y política fiscal.

## 6. Reversión
- Ante descuadres, revertir `PAYMENTS_ENABLED=false` y/o `NOWPAYMENTS_ENABLED=false`, redeplegar/configurar según el proyecto; impedir nuevos intentos, NO borrar D1 ni modificar pagos conciliados. Registrar IDs de proveedor y caso; recuperar última versión aprobada si hay fallo de frontend. Mantener evidencias para auditoría.

Referencias oficiales: https://developers.cloudflare.com/pages/functions/bindings/ ; https://developers.cloudflare.com/pages/get-started/direct-upload/ ; https://www.mercadopago.com.mx/developers/es/docs/checkout-pro-orders/overview ; https://nowpayments.zendesk.com/hc/en-us/articles/21345824322717-API-and-endpoint-description
