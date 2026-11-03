# Matriz QA de liberación
## Sí se ha probado localmente
- Pruebas de cotizador, privacidad/consentimiento, acceso folio+clave, contrato y aceptación por digest, pago por hito, Mercado Pago/Stripe con respuestas falsas, BBVA con índice único, NOWPayments firmas/IPN simuladas, correo mock e idempotencia.
- Adicional VFinal: bloqueo de crypto `finished` con `actually_paid` insuficiente y seguridad del panel de operación, flag adicional del aviso de privacidad, conservación del intento MP de respuesta HTTP ambigua.
- Sintaxis Node de JS afectado y test de assets mock; **sin desplegar**.

## Qué NO se ha probado (bloquea GO)
- Cloudflare autenticado: variables, binding D1 staging/producción, schema real, rollback, firewall, logs y métricas bajo carga.
- Cuenta MP/BBVA/NOWPayments real y callbacks firmados reales; abono y retiro a cuenta de titular verificada; reembolsos/contracargos reales.
- Cuenta comercial y fiscal; texto definitivo de aviso, contrato/firma, permisos, garantías, CFDI y obra física.
- Ensayos visuales actuales en navegadores móviles (solo hay capturas históricas), pruebas de carga, alta disponibilidad, disaster recovery y accesibilidad del checkout proveedor.
- Escenario de varias transferencias crypto para una sola factura, que permanece deliberadamente en conciliación manual.

## Casos mínimos para testigo GO
1. Expediente A no ve B; folio/clave inválidos denegados. Sin aviso aprobado: `accepting:false`, `payments:false`.
2. Sin cotización o vencida no cobra; no acepta precio del frontend.
3. Doble click/reintento mismo hito no genera dos cargos.
4. Rechazado/pending/approved de MP, webhook firmado/no firmado, importe alterado, moneda distinta, refunds.
5. SPEI realmente ofrecido por la cuenta y CLABE/instrucciones emitidas en checkout real, pago conciliado con D1.
6. BBVA ID movimiento único y monto exacto; captura falsa/no depositada rechazada.
7. NOWPayments firma válida/no válida, API verificada, paid parcial, final, duplicado, importe/mXN, mínimos/moneda y wallet real.
8. Pago hito 2 sólo tras instalación y anticipo; pago final solo tras QA y cuotas anteriores.
9. Confirmación al cliente una vez sin compartir clave; CFDI por flujo aprobado externo.
10. Despliegue reversible y reporte de incidentes firmado por D14 y D01.

`npm test` corre tests de comportamiento; los archivos históricos `tests/compare_v51_v52.mjs` y `tests/pdf_generator.mjs` **no son suites vigentes** (requieren rutas/baselines antiguas). Su presencia no equivale a un fallo del checkout nuevo, pero tampoco deben eliminarse o llamarse PASS sin migrarlos.
