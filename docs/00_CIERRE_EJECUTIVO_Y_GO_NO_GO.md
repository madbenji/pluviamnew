# PLUVIAM | Cierre técnico y operativo para cotizar y cobrar
**Corte:** 26 de octubre de 2026 · **estado:** código integrado y prueba sintética aprobada; **NO-GO cobros reales / NO desplegado**.

## Resultado comprobable
- Conservamos el dominio previsto `https://pluviam.pages.dev/`, el sitio existente, el portal privado `/pagar`, cotizador, Academia, administración, PDFs, aceptación por huella del contrato y pagos escalonados 50/50 o 50/30/20.
- Frontend y Worker, D1, idempotencia de Stripe/Mercado Pago, BBVA manual, factura NOWPayments con IPN firmada, emails condicionados y panel de seguimiento.
- Corrección VFinal: `PRIVACY_NOTICE_GO_APPROVED` + `CONSENT_VERSION` explicitamente validada; sin ambas, captación, borradores y pagos quedan bloqueados aun si `LEGAL_APPROVED=true` en un despliegue viejo.
- Corrección VFinal: el estado crypto `finished` por sí solo **no** acredita una factura; para autoacreditar se valida con GET proveedor el ID, factura, pedido, monto, MXN y `actually_paid >= pay_amount`. Un faltante exige revisión humana (sin crear otro intento).
- Corrección VFinal: Brick MP conserva un intento reservado si HTTP no confirma el resultado; nunca lo marca `failed` por respuesta ambigua. No se vuelve a cobrar sin conciliar.
- Tablero `/api/admin/operacion` autenticado, sin secretos, con sumatoria de importes **esperados**, grupos por proveedor/etapa/estado e intentos abiertos más de dos horas; se refleja en `/admin.html`.

## Hallazgo en sitio público (lectura sin modificar)
`GET /api/estado` devolvió `backend:true, accepting:true, payments:false, crypto:false` el 26/10/2026. `/privacidad` dice explícitamente "Borrador informativo para revisión interna". Un flag de entorno no sustituye una revisión jurídica. **Recomendación de contención:** suspender nuevas solicitudes con datos personales hasta que el aviso del responsable esté validado, incluso si la UI pública hoy acepta; no se hizo cambio en producción desde esta sesión.

## Matriz de activación real
| Frente | Código / diseño | Evidencia externa indispensable | Estado |
| --- | --- | --- | --- |
| Diagnóstico ilustrativo | Disponible | No presentar estimados como precio o medición in situ | Solo informativo |
| Captación y CRM | D1/Turnstile/folio | Aviso integral con responsable, domicilio, ARCO, retención y consentimiento | **NO-GO legal** |
| Cotización contractual | Admin, RFQ, margen, PDF y aceptación por versión | 2 RFQ actuales, BOM, ingeniería, capacidad, contrato, RFC, impuestos/CFDI, garantías | **NO-GO negocio** |
| Mercado Pago/Checkout Pro | Integración en código | Merchant y webhook autenticados, fondos conciliados, SPEI probado si se anuncia | **NO-GO real** |
| BBVA manual | Instrucciones verificado + índice único + panel | CLABE y titular verificados, extracto de banco y protocolo contable | **NO-GO real** |
| Crypto NOWPayments | Factura alojada, HMAC y API de verificación | Cuenta/KYB, wallet, IPN, disponibilidad de MXN/redes, prueba IPN real, fiscal/AML | **NO-GO real** |
| Correo al cliente | Outbox / idempotencia | Dominio verificado, recepción real, reintentos auditados | Pendiente |
| Hitos de obra y garantía | Estados y documentos texto | Actas firmadas, QA de obra, garantías y comprobantes externos | Pendiente |
| Seguridad y alta disponibilidad | Cloudflare D1/Workers; default cerrado | WAF/rate limits, backups/restauración, logs, alertas, 2FA, roles, pruebas E2E | Pendiente |

**La aprobación de diseño o QA sintética NO debe contarse como pago, venta, CFDI ni disponibilidad de servicio.**

## Criterio de GO por método
1. **GO captación**: jurídico publica aviso definitivo, versiona consentimiento y protege D1; tecnología valida folio/captcha/aislamiento/ARCO; D01 aprueba el flag propio.
2. **GO cotización**: ingeniería y finanzas autentican costos de dos proveedores, alcances y márgenes; jurídico aprueba texto y mecanismo de aceptación; titular autoriza.
3. **GO pagos**: D1 staging aislada + migraciones compatibles + merchant, webhooks y pruebas E2E (aprobado, rechazado, pendiente, duplicado, pérdida de respuesta, devolución, importe y moneda).
4. **GO producción**: respaldo/reversión comprobados, despliegue del mismo proyecto, smoke test de lectura, transacción controlada autorizada y conciliada, registro del GO en Command Center.
5. **GO escala**: 3+ operaciones completas con margen real y SLA cumplido, incidencias y contracargos controlados, proveedor con capacidad y reserva de caja verificada (umbral de decisión del equipo, no métrica histórica observada).

## Advertencias de proveedor
- Mercado Pago ofrece SPEI en productos seleccionados, pero ni el token ni Checkout Pro garantizan por sí solos la CLABE individual dinámica en cada modalidad. Debe inspeccionarse un checkout real del comercio y probarse la acreditación por webhook.
- CoDi/QR BBVA no informa por sí mismo a la D1 del sitio. Mantener conciliación bancaria real, salvo integración empresarial y notificaciones autenticadas demostradas.
- Las facturas NOWPayments y pagos pueden admitir depósitos parciales o cambios manuales de estado. Este release bloquea autoacreditación por insuficiencia de cripto; **no** acumula automáticamente múltiples pagos parciales de una misma factura. Conciliar en panel del proveedor y resolver la excepción manualmente con registro.
- No implementar enlaces a wallet personal no conciliables ni mostrar claves secretas o CLABE no verificada al público.

## Documentos de apoyo
- `01_PASO_A_PASO_DESPLIEGUE_SEGURO.md`
- `02_OPERACION_DIARIA_COTIZACIONES_COBROS.md`
- `03_INCIDENTES_ESCALAMIENTO_Y_REVERSOS.md`
- `04_PRUEBAS_Y_CRITERIOS_ACEPTACION.md`
