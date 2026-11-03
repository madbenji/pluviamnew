# PLUVIAM — Entrega unificada de web, contratos y pagos (26 oct 2026)

**Versión:** candidato técnico para staging / NO GO de cobro real aún. **Único sitio público:** https://pluviam.pages.dev. **Nunca pegar Access Token, IPN Secret, private keys, CLABE personal o contraseñas en código, HTML, chat o Google Docs.** Los secretos se agregan a Cloudflare Pages → Settings → Variables and Secrets (tipo Secret), con accesos y registro de cambios.

## Qué quedó integrado en este paquete

* Se fusionaron los dos ZIP aportados por el fundador (50 archivos de sitio, incluido /pagar y NOWPayments) con el candidato auditado P0 de contratos, PDF, hitos, correo transaccional y módulo de conciliación BBVA. No se reemplazó el sitio público.
* La UI cliente utiliza folio + clave, muestra únicamente la propuesta aprobada en D1, su importe y hitos, permite descargar PDF y aceptar la versión exacta de las condiciones. No se habilitan cobros de un estimado ni un folio inventado. Los métodos se muestran solo si el backend devuelve elegibilidad y banderas activas.
* Mercado Pago Checkout Pro (tarjeta; SPEI solo cuando efectivamente lo ofrezca la modalidad/cuenta), tarjeta por MP Brick opcional, Stripe si está configurado, transferencia BBVA manual con conciliación humana y NOWPayments Hosted Invoice con IPN HMAC-SHA512 y consulta de API antes de acreditar `finished`.
* La conciliación BBVA exige `BANK_ACCOUNT_VERIFIED=true`, `BANK_PAYMENT_ENABLED=true`, beneficiario, CLABE válida e índice único de D1 creado por migración 005. No se acredita solo por pantalla/captura del cliente. Un ID de abono no puede pagar dos proyectos.
* Si la creación de checkout falla de forma ambigua, el intento queda pendiente de revisión en vez de declararse fallido/no cobrado y facilitar un posible doble cargo. En el portal, una consulta fallida borra los datos de propuesta mostrados previamente.

## Evidencia de pruebas

Pruebas Node/SQLite en memoria y pasarelas simuladas: 48 aserciones para MP/Stripe/contratos/correo; 59 de hitos; 18 BBVA; 18 PDF; 8 UI; 11 consentimiento; 67 cotizador/academia; **30 de NOWPayments** (firma inválida, ID de factura, mismatch de importe, estado no terminado, pago terminado y duplicados). Los tests se ejecutaron con datos artificiales. `node --check` validó `_worker.js`, `pagar.js`, `admin.js`. No se han recibido fondos reales ni comprobado webhooks auténticos en Cloudflare.

## Bloqueos reales al cobro público

1. Cuenta del comercio a nombre de persona/RFC realmente facultado, banco/CLABE y beneficiario comprobados, revisión fiscal de anticipos/CFDI/reembolsos e IVA; política crypto, riesgo cambiario y elegibilidad comercial revisadas.
2. Aviso de privacidad público actualmente identificado como preliminar por registros operativos; obtener versión jurídica definitiva, tratamiento de datos, consentimientos y contratos revisados. Las flags no sustituyen aprobaciones.
3. Cloudflare Pages `pluviam` y D1 de producción **no fueron inspeccionadas autenticadamente ni cambiadas aquí**. Deben respaldarse despliegue y base antes de modificaciones. Importar schema real antes de aplicar migraciones 001–005; 003/004 alteran columnas una sola vez. Una D1 nueva desde cero requiere **migración base histórica no incluida**: NO ejecutar solo las aditivas esperando que nazcan las tablas madre.
4. Mercado Pago: token privado + secreto webhooks en Cloudflare, cuenta verificada y medios de pago reales probados. Las credenciales por sí solas no garantizan SPEI. CoDi/QR de BBVA es distinto de SPEI automatizado y no se activa mediante un QR descargado.
5. NOWPayments: clave API + IPN secreto + wallet comercial/configuración en su panel; verificar monedas/redes, MXN base, mínimos, IPN real y política para pagos parciales, expiración y refunds. No se obtiene custodia o protección jurídica solo por activar botón.
6. Ejecutar E2E en **staging aislado** (otra D1 y credenciales sandbox). Probar aprobados, pendientes, rechazados, callbacks duplicados, cargo sin respuesta de red, contracargo/reembolso y saldo conciliado; autorizar transacción real mínima explícitamente antes de declararlo lanzado.

## Paso a paso de activación segura

**A. Preservación.** Respaldar Worker publicado, assets, variables, bindings y D1 productiva; documentar IDs/hash y procedimiento de rollback. Comparar contra el ZIP `sitio_cloudflare` aportado. No reemplazar producción directamente.

**B. Staging.** Desplegar solo el contenido de `site/` a un entorno **privado de pruebas** de Cloudflare Pages. Vincular DB de staging bajo binding `DB`. Restaurar copia sintética/sanitizada del esquema base si existe; verificar dependencias antes de migrar 001–005. No aplicar `003` ni `004` dos veces. Ejecutar preflight de duplicados BBVA antes de 005. No conectar staging a D1 ni merchant de producción.

**C. Variables no secretas (staging inicial).** `LEADS_ENABLED=false`, `LEGAL_APPROVED=false`, `PAYMENTS_ENABLED=false`, `COMMERCE_GO_APPROVED=false`, `CONTRACT_TERMS_APPROVED=false`, `BANK_PAYMENT_ENABLED=false`, `BANK_ACCOUNT_VERIFIED=false`, `NOWPAYMENTS_ENABLED=false`, `CRYPTO_COMPLIANCE_APPROVED=false`, `CUSTOMER_EMAIL_ENABLED=false`, `CUSTOMER_EMAIL_GO_APPROVED=false`, `PROJECT_DOCS_ENABLED=false`. Habilitar recepción únicamente cuando legal y Turnstile estén comprobados. Poner en `DB` una D1 existente compatible.

**D. Secrets por entorno.** `TURNSTILE_SECRET`, `ABUSE_PEPPER`, `ADMIN_TOKEN`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, además de `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` solo si Stripe se usa, `RESEND_API_KEY` cuando dominio/remitente esté validado. No guardar sus valores aquí. Otros textos necesarios: `TURNSTILE_SITE_KEY`, `MP_PUBLIC_KEY` (si Brick), `BBVA_CLABE` y `BBVA_BENEFICIARY_NAME` solamente si verificados, `RESEND_VERIFIED_DOMAIN`, `CUSTOMER_EMAIL_FROM` cuando el correo se active.

**E. Webhooks.** MP `https://<dominio-staging>/api/webhooks/mercadopago` (evento payment). NOWPayments `https://<dominio-staging>/api/webhooks/nowpayments` (IPN secret + callbacks de invoice). Stripe, si aplica: `https://<dominio-staging>/api/webhooks/stripe`. Probar firmas reales y que el firewall no bloquee notificaciones. No confiar en la página de retorno.

**F. Pruebas de contrato y pago.** Preparar folio sintético, segunda cuenta de prueba separada, propuesta/aceptación verificadas, pagos por hitos; comprobar idempotencia de reintentos y webhook duplicado y auditoría de D1. Reconciliar extracto del banco y reporte del proveedor; aprobar informe de QA independiente.

**G. GO escalonado.** Aprobar por separado legal/finanzas/tecnología/CEO: captación, cotización, MP, BBVA, crypto, obra. Solo después activar los flags asociados y redeplegar. En producción confirmar `/api/estado`: `payments:true` significa **banderas/esquema**, no demuestra que una transacción real se haya hecho. `crypto:true` igualmente requiere un cargo probado y conciliado.

## Operación (para Command Center / Inteligencia)

* Estados: solicitud → evaluación técnica → dos RFQ / costos → aprobación legal y financiera → PDF versión inmutable → aceptación identificada → intento único por hito → pasarela/banco confirma → D1 paid → notificación única → instalación/QA → liquidación, CFDI/garantía en sistemas aprobados.
* Diario: revisar expedientes pendientes, intentos `created`/`redirected`/`awaiting_bank`, webhooks, alertas/outbox y conciliación monetaria contra MP/BBVA/NOWPayments; resolver manualmente ambigüedades antes de reintento. Nunca hacer cambio manual directo de `paid` sin rastro.
* Incident response: si el estado del proveedor difiere de D1, congelar método afectado (`PAYMENTS_ENABLED=false` para contención global); preservar ID, hora, folio, importe, response/callback firmado, registro D1; investigar reembolsos/chargebacks y notificar según contrato y marco legal. Restaurar de copia validada solo con registro de autorización.
* Escalamiento: D01/CEO GO, D02 Inteligencia matriz de riesgos, D04 Jurídico y privacidad, D05 Finanzas/contabilidad, D08 Ingeniería/proveedores, D13 Tecnología, D14 QA. No presentar simulaciones como ingresos.

## Nota de transparencia

Este ZIP **contiene la infraestructura de código para iniciar y verificar cobros cuando los proveedores estén conectados**; no es un comprobante de que el comercio esté habilitado, de que Mercado Pago otorgue SPEI o de que haya ocurrido un pago real. Se entrega cerrado por defecto para proteger a PLUVIAM y a los clientes.
