# PLUVIAM | Incidentes y contingencias de cobro
**Meta:** proteger dinero del cliente y evidencia. Ningún reintento automático de un cargo ambiguo.

1. **Intento abierto sin respuesta / timeout:** detener reintento en UI, localizar `payment_attempts.id`; consultar proveedor por ID o `external_reference` y conciliación. Si el proveedor confirma pago, verificar importe, moneda, identidad y actualizar solo mediante ruta/auditoría autorizada. Si no hay certeza, mantener estado pendiente y escalar.
2. **Webhook repetido o falsificado:** validar firma/timestamp, consultar proveedor por API; el `UPDATE` condicional debe dar 0 cambios al segundo webhook. Conservar evidencia HMAC sin exponer secretos.
3. **Pago parcial de crypto marcado `finished`:** la liberación automática se bloquea cuando `actually_paid < pay_amount` (o faltan datos); conciliar manualmente con NOWPayments y valorar pago complementario, devolución o ajuste contractual. **No marcar pagado por simple cambio de estado en el panel.**
4. **Transferencia BBVA duplicada:** no aplicar dos veces el mismo identificador único; cotejar cuenta de titular, rastreo y monto; si banco no ofrece una ID inequívoca, escalar a contabilidad y no aprobar la operación.
5. **Reembolso/contracargo:** este release no automatiza ciclo completo de refunds/chargebacks. Congelar ejecución y nuevos cobros, recopilar folio, proveedor, movimiento bancario, documentos contractuales, soporte al cliente y autorización financiera; revisar D1 con auditoría. No compensar manualmente con otra venta.
6. **Privacidad o acceso no autorizado:** suspender `LEADS_ENABLED` y/o `PAYMENTS_ENABLED`, preservar logs con mínimo dato personal, rotar claves afectadas, revisar incidentes con jurídico y avisos requeridos; no mandar datos por chat.
7. **Caída de Cloudflare / D1 / pasarela:** dejar página informativa y botones cerrados; canal comercial alternativo solo después de aprobación legal. Restauración desde backup probado, sin restaurar pagos antiguos sobre nuevos ni perder idempotencia.

## Niveles de escalamiento
- **P0 dinero o privacidad:** contención inmediata, D13 Tecnología + D05 Finanzas + D04 Legal + D01 CEO; no liberar servicio hasta conciliación.
- **P1 expediente/correo/operación:** D13, Comercial y D14 QA; comprobar duplicados, tiempos y entregabilidad.
- **P2 mejoras no críticas:** mejoras de UX, automatización, IoT, WhatsApp/Valeria; sin bloquear protección de cobros.

## Evidencia mínima del incidente
Fecha/hora CDMX y UTC; folio; ID intento; método; ID proveedor/banco; MXN esperado; MXN efectivamente conciliado; estado D1; estado proveedor; reporte bancario; acción autorizada; persona responsable; desenlace y prevención. No copiar API keys a esta bitácora.
