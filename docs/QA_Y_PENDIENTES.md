# PLUVIAM V50 · control de calidad y brechas

## Comprobado durante esta ejecución

- 5,103 combinaciones de perfil, superficie, gasto, usos y almacenamiento; 20,425 afirmaciones incluyendo seguridad de ROI.
- Backend ejecutado con D1 simulada: se niega iniciar instalación o QA sin depósito; se permite después de confirmar depósito; se niega pasar a mantenimiento sin liquidación final.
- Vigencia 15 días: se activa solo con la política habilitada, se ignoran valores fuera de rango y cotizaciones previas no vencen por defecto.
- JS validado con Node, rutas HTML locales auditadas, sin referencias faltantes ni IDs duplicados.
- Migración D1 V50 validada ejecutándose en SQLite contra una tabla de casos sintética.
- PDF generado con el código del navegador, leído con `pdfinfo`, convertido a imagen y extraído con `pdftotext`.
- Comparación con V46-R7 mejorada anterior: 29 archivos idénticos, 8 modificados y resto nuevos.

## No se pudo confirmar en este entorno

- Pruebas Chromium reales: la navegación a localhost, file:// y data: fue rechazada por políticas del entorno, así que **no** se garantiza el pixel-perfect en dispositivos físicos ni se declara E2E visual PASS.
- Servicios externos de producción: no se usaron claves de Cloudflare, Resend, Mercado Pago, Stripe ni R2. Sin pruebas de pagos reales, firmas webhook contra pasarelas, ni recepción real de correos.
- Plazos comerciales, 15 días, MSI, política de reembolsos y 100% de devolución: pendientes de aprobación humana y contratos.
- Ahorro y recuperación real: el test aporta gasto y área, **no** demanda sustituible medida, costo evitado, mantenimiento o costo firmado. No se inventan años de retorno.
- Envío automático de fotos, envío WhatsApp, recordatorios recurrentes y CFDI: no incluidos en esta actualización. Necesitan integraciones/consentimientos adicionales.
- Documentos contractuales firmados, administración técnica de obra e incidencias postventa completas: permanecen tareas posteriores. Los textos en expediente V50 no equivalen a firma/garantía validada.

## Lista de pruebas de aceptación en staging

1. Diagnóstico de cinco pasos → resultados de los nueve perfiles.
2. Página de cotización → formulario existente → folio válido y clave privada.
3. Recibo de lead en D1 y notificación Resend de prueba.
4. CRM sin token 403; con token autorizado muestra expediente y adjuntos propios.
5. Cotización validada por RFQ, viabilidad y márgenes desde admin; no aceptar precios sin respaldo.
6. Cliente descarga PDF sin clave y elige pagar después.
7. Cliente paga anticipo sandbox; valida firma webhook y un único efecto al recibir duplicados.
8. Reintento o pago incompleto → estado pendiente; nunca se activa obra por clic de frontend.
9. API admin bloquea cambio a instalación si el anticipo no está conciliado.
10. Solo saldo final tras QA/entrega autorizada, y posventa después de saldo pagado.
11. Política de 15 días sin aprobación: no vence. Con aprobación: no permite pago de vencidas y comunica revalidación.
12. Documentos y eventos únicamente consultables con clave correcta, entre dos clientes A/B.
13. Verificación visual real en iOS/Android/desktop a 320, 390, 768, 1366px; reflow de ilustración y lectura del resumen de ROI.

**Conclusión:** código listo para Preview y pruebas contra servicios reales; **NO-GO a activar producción comercial nueva** hasta completar gates y pruebas anteriores. El sitio V46-R7 publicado debe seguir protegido.
