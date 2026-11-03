# Activación controlada de V50 en Cloudflare Pages

## Cómo está organizada

- **Frontend:** archivos estáticos, sin framework nuevo. No usa una segunda base de datos.
- **Backend:** `_worker.js` Cloudflare Pages advanced mode. Conserva las API R7.
- **D1:** binding existente `DB`; el esquema V50 es aditivo e independiente de la recepción y pagos R7.
- **Acceso:** el usuario utiliza folio y clave privada por POST `/api/proyecto`; el administrador emplea `ADMIN_TOKEN` en memoria.
- **Pagos:** importes reales solo desde `approved_quotes` en D1. Nunca se cobra el precio ilustrativo del test. Los mecanismos existentes de Stripe/Mercado Pago/BBVA se preservaron.

## Variables / bindings (sin compartir secretos)

Existentes de R7 (verificar sin sobrescribir):
`DB` (binding D1), `TURNSTILE_SECRET`, `TURNSTILE_SITE_KEY`, `LEGAL_APPROVED`, `LEADS_ENABLED`, `ADMIN_TOKEN`, `PAYMENTS_ENABLED`, `RESEND_API_KEY`, `RESEND_FROM`, `OPERATIONS_EMAIL`, `JOBS_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `BANK_PAYMENT_ENABLED`, `BBVA_CLABE`, `BBVA_BENEFICIARY_NAME`, `ABUSE_PEPPER`, `CONSENT_VERSION`.

Nuevas *opcionales* de V50:

| Variable | Valor inicial recomendado | Función |
|---|---|---|
| `PROJECT_DOCS_ENABLED` | `false` | Habilitar documentos y bitácora D1 solo después de ejecutar la migración y probar aislamiento |
| `ANALYTICS_ENABLED` | `false` | Guardar métricas de conversión agregadas |
| `QUOTE_VALIDITY_APPROVED` | `false` | Prohíbe vencer cotizaciones sin aprobación comercial |
| `QUOTE_VALID_DAYS` | sin establecer | Por ejemplo `15`, solo tras aprobar la política y comprobar fechas |

**Nunca incrustar tokens, credenciales de pasarela ni secretos dentro del ZIP.**

## Despliegue sin pérdida de la V46-R7

1. Descargar por separado un respaldo del deployment de Cloudflare **y** exportar D1 mediante la ruta autorizada del panel. Confirmar el ID del deployment y el proyecto destino.
2. Crear una rama de pruebas o un deployment Preview del proyecto *existente* conservando su configuración; para pruebas de escritura, usar una D1 **de staging**, no la productiva, y secretos de prueba.
3. Subir el contenido de la carpeta `Cloudflare/` mediante el método de despliegue ya probado por el equipo (en Pages Direct Upload por interfaz puede aceptarse el ZIP con los archivos en la raíz; `wrangler pages deploy` recibe una **carpeta**, no ZIP).
4. Verificar que el deployment sirve la portada, `/modelo-3d.html`, `/cotizacion.html`, `/mi-proyecto.html`, `/admin.html` y `/privacidad.html`. Revisar recursos en Network y responsive en dispositivos reales.
5. Verificar `/api/estado` y `/api/admin/salud` con el token autorizado. **No hacer POST de clientes reales** en Preview.
6. Realizar E2E con personas y folios ficticios: crear lead, recibir correo real de prueba, entrar al CRM, guardar propuesta, aprobar con RFQ/evidencias sintéticas, realizar pagos **sandbox**, confirmar webhooks, verificar deduplicación e impedir instalación antes de anticipo.
7. Para documentos/analítica, aplicar *primero* la migración `migraciones/001_proyectos_v50.sql` a D1 de staging; repetir la prueba con dos expedientes distintos (A/B) para validar aislamiento. Repetir en D1 aprobada para producción solo con backup y permisos formales; activar después las variables opcionales.
8. Solicitar aprobación técnica, financiera, legal y de seguridad. Revisar que el aviso de privacidad integral, contratos de pago, devolución y documentos fiscales correspondan al responsable legal real.
9. Solo después del GO desplegar producción manteniendo rollback hacia el deployment anterior. Confirmar en vivo las rutas y la transacción sandbox sin cobrar realmente a nadie.

## Regla 50/50

- Precio contractual de $100,000 MXN → anticipo $50,000 MXN + saldo final $50,000 MXN, confirmado y conciliado por servidor.
- Proyecto no inicia obra, ejecución, QA ni entrega con anticipo pendiente. La actualización de etapa retorna 409.
- El saldo final se ofrece solo tras los hitos de QA/entrega contemplados; posventa requiere liquidación final.
- Una cotización vencida (si política aprobada) no inicia un nuevo cobro sin revalidación; un intento anterior debe conciliarse antes de reintentar.

## Restricciones aún vigentes

La ficha PDF es un **resumen de estado**, no un CFDI ni un contrato firmado. El sistema documental V50 conserva textos con acceso por folio/clave; no sustituye archivo de documentos firmados ni bóveda R2 con controles por documento. Recordatorios por WhatsApp/correo requieren proveedor, consentimiento y servicio programado; **no se habilitaron ni se anuncian como operativos**. La conexión a pagos reales debe validarse en una cuenta sandbox y con aprobación comercial.
