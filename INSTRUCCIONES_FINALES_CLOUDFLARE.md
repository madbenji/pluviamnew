# PLUVIAM · Entrega final candidata (código P0 + PDF con identidad de marca)

## Qué se entrega
- Sitio íntegro en `site/` (ZIP de Pages con contenido de esa carpeta en la raíz).
- Backend Pages Worker con cuatro controles P0 (quote/firma/checkout/webhook/correo transaccional).
- PDF de propuesta contractual y ficha de proyecto con encabezado visual PLUVIAM, pagos por hitos y trazabilidad. No es CFDI ni garantiza validez jurídica sin revisión.
- Migraciones D1 `001`–`004`; las nuevas son `003` y `004`, sólo tras verificar esquema existente y respaldo.

## Importante antes de subir
**No sustituye una prueba en staging aislado.** Subir esta carpeta a Production mientras `PAYMENTS_ENABLED=true` puede cambiar comportamientos inesperados. El código nuevo requiere flags adicionales `COMMERCE_GO_APPROVED=true` y `CONTRACT_TERMS_APPROVED=true` para permitir pagos (por defecto, AUSENTES => cerrado). No ponerlos en true sin GO jurídico, técnico y pruebas.

Usar un **proyecto Pages de staging separado**, con D1 de pruebas aislada, secretos de sandbox y cuentas de prueba. No usar D1 productiva para pruebas.

1. Descomprimir el ZIP de Pages: archivos en raíz, incluyendo `_worker.js`.
2. Desplegar en Pages staging. Comprobar rutas, diagnosis y `api/estado`; comprobar D1 migrations `003/004` en staging.
3. Pruebas manuales autorizadas: cotización realista con monto del servidor, PDF completo, consentimiento inequívoco de titular, cobro con claves sandbox, 2 webhooks idénticos, 1 pago conciliado, 1 correo; rechazo y reintento.
4. Revisar aviso, términos comerciales, RFC/CFDI, identidad de proveedor, alcance/garantías, devolución y obra civil.
5. Antes de producción, confirmar la versión desplegada/backup/GO; no dar por terminado porque existan los botones.

## Seguridad y comisionamiento
El comisionamiento puede ser una fase real (pruebas de fugas, presiones, funcionamiento seguro, aguas de uso permitido). Es un hito descrito por escrito, no un pretexto oculto para retener controles de seguridad, filtración sanitaria o partes que expongan a daño a personas o inmueble. Si hay disputa de saldo, seguir la vía contractual y las obligaciones legales de garantía, sin bloquear ni manipular sistemas críticos.

## Alcance
Este paquete no activa Stripe, Mercado Pago, facturación CFDI, correo al cliente ni Retell por sí solo. Requieren claves y validación expresa. Precio de $100,000 es escenario de prueba, no tarifa de venta autorizada.
