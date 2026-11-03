# PLUVIAM — Runbook de seguridad, staging, despliegue y GO de cobros
**No ejecutar en producción sin autorización del propietario, respaldo D1, revisión legal y QA independiente.** Código congelado: no se modificó diseño ni 3D ni menús. No se generó ZIP adicional.

## ACCIÓN INMEDIATA DEL TITULAR (no realizada por el asistente)
En Cloudflare Pages → proyecto *pluviam* → Settings → Variables and Secrets → **`PAYMENTS_ENABLED=false`** en Production. Aplicar nuevo despliegue si Cloudflare lo requiere y comprobar `https://pluviam.pages.dev/api/estado` con `payments:false`. Esta acción no debe comprometer la función informativa de la web. El último estado consultado por el asistente fue `payments:true`; la mera bandera no prueba un cobro real, pero exige contención.

Verificar que `LEGAL_APPROVED=true` corresponde a un aviso realmente aprobado con identidad y domicilio legal (el texto público declara «borrador»). Si falta autorización, no asumir que la captación de nuevos datos es conforme; requerir responsable jurídico y bloqueo adecuado. No guardar tokens de pasarela ni teléfonos privados en chat.

## Cambios incorporados en candidato P0
- `site/_worker.js`: `payGate` exige ahora `COMMERCE_GO_APPROVED=true` además de `PAYMENTS_ENABLED=true` y controles existentes. Por defecto el flag extra **NO existe y cobra cero**.
- `migraciones/003_hitos_y_correos_p0.sql`: columna `approved_quotes.payment_plan` con default `50-50` y tabla `customer_payment_notifications_v1` para una confirmación por intento conciliado.
- `site/admin.html` y `site/admin.js`: selecciona explícitamente 50/50 o 50/30/20 por propuesta. Mantiene verificación administrativa de 2 RFQ, ingeniería, legal, finanzas, consentimiento y márgenes. Las casillas **no certifican firma electrónica del cliente**.
- `site/_worker.js`: cotización devuelve esquema/importe por hito; el segundo requiere anticipo conciliado y fase de instalación registrada; el tercero requiere QA/entrega, anticipo y segundo hito conciliados si corresponde; nunca acepta importe suministrado por navegador.
- `site/mi-proyecto.js`, `site/project-docs.js`, `site/app.js`: hito elegible reflejado con importes correctos. Mantiene Mercado Pago Brick para cobro con tarjeta en página principal cuando se habilite; Mi proyecto sigue pudiendo redirigir a checkout verificado; la integración de Brick embebido EN Mi proyecto requiere prueba de proveedor y queda pendiente.
- `site/_worker.js`: email al cliente postpago con identificador/importe del hito, NO clave ni factura; necesita flags `CUSTOMER_EMAIL_ENABLED=true`, `CUSTOMER_EMAIL_GO_APPROVED=true`, `RESEND_VERIFIED_DOMAIN` y `CUSTOMER_EMAIL_FROM` en dominio verificado. En ausencia de estos flags no envía. Confirmación `accepted_by_provider` no prueba llegada a Inbox. Múltiples reintentos usan la misma clave idempotente, con revisión operativa.

## Variables de staging sugeridas (no secretas)
`PAYMENTS_ENABLED=false`, `COMMERCE_GO_APPROVED=false`, `CUSTOMER_EMAIL_ENABLED=false`, `CUSTOMER_EMAIL_GO_APPROVED=false`, `PROJECT_DOCS_ENABLED=false` hasta migración y aislamiento probados. `LEGAL_APPROVED` sólo según dictamen real. Mantener distintos DB, issuer/merchant, tokens y webhooks de entorno de pruebas. No cambiar arbitrariamente los valores en producción.

## Secuencia de despliegue
1. Comparar código actual de producción con el respaldo del candidato (identidad del commit/despliegue aún no verificada); respaldar Worker, bindings y D1 antes de modificar; conservar posibilidad de revertir.
2. Crear staging separado, D1 aislado, secret/merchant de prueba, dominio autorizado. **No** conectar staging a D1 productiva ni a llaves reales. Aplicar `003_hitos_y_correos_p0.sql` una vez (ALTER no es idempotente si se repite). Verificar tablas existentes reales y columnas antes de ejecutar.
3. Desplegar **carpeta `site/`** a staging sin empaquetar ZIP adicional. Verificar rutas, CSS y captación anónima. Ejecutar tests `test_p0_hitos_2026.mjs` y suites de regresión compatibles; los tests históricos que exigían backend byte-identical fallan por diseño tras el nuevo P0, no son un pase ni una regresión operacional.
4. Reproducir mínimo dos expedientes artificiales aislados A y B. Verificar folio/clave (una no debe abrir la otra), no pago por estimación, cotización solo tras evidencia real revisada, exactitud de 50/50 y 50/30/20 y prohibición de cambiar una oferta con cobros pendientes.
5. Probar MP/Stripe en **sandbox**: tarjeta aprobada, rechazada y pendiente, webhook auténtico, moneda/cantidad, reintento simultáneo, duplicados, reversos y reembolso. No usar tarjeta real sin consentimiento explícito y autorización fiscal de una operación real de importe mínimo.
6. Verificar plantillas y consentimiento de correo y Resend del dominio propio antes de activar `CUSTOMER_EMAIL_*`. Confirmar entrega, duplicados, reintentos, límites y seguridad de PII; después recién habilitar en staging.
7. Jurista, contador, ingeniero/QA y CEO validan contrato/propuesta, actas, permiso, responsable fiscal, factura, mercancía disponible, BOM, RFQ, márgenes y caja. Conservar acta de GO separada por captura, pagos y obra.
8. Solo después de los anteriores: migración D1 producción con copia/rollback, publicar código y verificar que `COMMERCE_GO_APPROVED=false` mantiene `payments:false`; levantar flags únicamente con acta GO y monitoreo. Nunca usar capturas como prueba de transacción.

## Incidencias conocidas / NO-GO
- `LEGAL_APPROVED` en el entorno no prueba un aviso legítimo. Texto actual de Privacidad es borrador: debe sustituirse por uno validado antes de promocionar captura real.
- Cliente todavía NO firma en un flujo autenticado dentro de la web: el CRM registra una referencia de aceptación administrada. Una referencia escrita puede ser falsa sin revisión; no homologar por automatización.
- No existen cotizaciones de proveedores, contrato firmado, merchant/webhooks reales o actividad bancaria verificados en esta entrega. Pago por SPEI exige conciliación real.
- Opción 50/30/20 es **contrato específico**, nunca condición universal sin aviso. La segunda cuota requiere hitos registrados; el registro por admin no sustituye evidencia física.
- Correo transaccional no equivale a factura CFDI, ni a entrega ni acuse de lectura. No se configuraron secrets ni dominio Resend aquí.
- No se añadió upload de fotografías, WhatsApp comercial, mensajería de Valeria, garantías digitales ni módulos IoT; fase 2.

## QA realizado
- `node --check`: Worker, App, admin, Mi proyecto, PDFs.
- `test_p0_hitos_2026.mjs`: prueba aritmética, 50/50, 50/30/20, gates de anticipo/instalación/QA, autenticación, D1 migración SQLite in-memory y desactivación de emails.
- Regresiones antiguas: v50/v52, consentimiento, pagos UI, Academia, coherencia, Retell V52.1. Historias que exigen igualdad de hash con la vieja versión deben reemplazarse por baseline/revisión nueva, no falsificar pass.
- No se probó transacción real, webhook real, dominio verificado, Cloudflare autenticado ni D1 de producción.
