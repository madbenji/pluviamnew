# PLUVIAM — CIERRE DE PÁGINA + PDFs CON BRANDING — 25 OCT 2026

Esta entrega NO es prueba de conexión real a pasarela, ni reemplaza acuerdos con especialistas, dictamen legal o Cloudflare staging.

## Paquete de Cloudflare Pages
El ZIP `PLUVIAM_WEB_FINAL_CLOUDFLARE_PAGES_P0_BRANDING_NO_PROD.zip` contiene solo el contenido de `site/` en su raíz, incluido `_worker.js` (Pages Advanced Mode). Debe probarse en un proyecto staging aislado antes de publicar.

## Cambios de esta entrega
1. PDF contractual generado por el Worker desde cotización aprobada, términos, calendario de pagos, digest y aceptación del titular: **ahora con branding PLUVIAM** vectorial, tipografía jerárquica, tarjetas de inversión, cronograma y pies de página, multipágina.
2. Ficha informativa descargable de `Mi proyecto`: mismo lenguaje visual de PLUVIAM. No incluye clave privada.
3. Conservar intactas la interfaz web y los cuatro P0 entregados anteriormente: aceptación digital, Stripe/Mercado Pago checkout por monto del servidor, idempotencia de webhook D1, correo transaccional protegido.
4. Reconciliar pruebas de P0 con aceptación obligatoria; 48 checks integración mock + 59 hitos + 18 PDF + 212 coherencia.

## Antes de cualquier subida a Production
- NO desplegar directamente mientras no exista respaldo del proyecto real, contrato aprobado y revisión de migraciones 003/004.
- Probar en Pages staging con **D1 de pruebas aislada**, no el D1 productivo.
- Variables `COMMERCE_GO_APPROVED` y `CONTRACT_TERMS_APPROVED` deben quedar AUSENTES o `false` hasta GO; aunque `PAYMENTS_ENABLED=true`, el nuevo backend falla cerrado. Por prudencia poner también `PAYMENTS_ENABLED=false` en la instancia actual.
- Verificar que la nueva ruta `/api/propuesta/pdf` abre un PDF multipágina real; probar `/api/contrato/aceptar` y checkout en sandbox después de confirmar contrato, aviso, identidad del titular y migración D1.
- Stripe, Mercado Pago y Resend fueron simulados. **Cero pesos cobrados** y ningún correo enviado al cliente en producción por este trabajo.
- El aviso de privacidad público es un borrador; jurídicamente NO basta con cambiar el título.
- No afirmar que componentes Tlaloque inexistentes están patentados, certificados o desplegados.
- Comisionamiento técnico sí; retención encubierta de filtros, sensores o controles de seguridad como castigo por impago, NO. Condiciones contractuales claras y proporcionalidad.

## Estado final
**CÓDIGO Y PDF TERMINADOS PARA STAGING. NO CERTIFICADO EN PRODUCCIÓN.**
