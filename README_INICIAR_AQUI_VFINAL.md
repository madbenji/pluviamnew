# PLUVIAM | Entrega técnica VFinal — **NO ACTIVAR COBROS REALES SIN GO**
**Único dominio objetivo:** https://pluviam.pages.dev  |  **Fecha:** 26/oct/2026

Este paquete incorpora mejoras de seguridad a la versión previa de 50 archivos. **No contiene API keys ni configura cuentas bancarias ni desplegó Cloudflare.**

- `site/`: subir su contenido plano a Cloudflare Pages **staging**, con D1, bindings y flags por entorno. El ZIP directo `PLUVIAM_CLOUDFLARE_PAGES_CANDIDATO_STAGING_26OCT2026.zip` contiene exactamente esta carpeta sin directorio padre.
- `tests/`: `npm test` (16 suites) para regresión sintética; `npm run verify` para sintaxis, 16 suites y prueba de coherencia.
- `migraciones/`: complementos aditivos. No hay D1 base universal ni respaldo productivo en el paquete.
- `docs/00_CIERRE_EJECUTIVO_Y_GO_NO_GO.md` y restantes: secuencia de GO, checklist, operación diaria e incidentes.

Bloqueos de seguridad adicionales en este candidato: `PRIVACY_NOTICE_GO_APPROVED` + `CONSENT_VERSION` aprobada, MP ambiguo no reintentable, crypto pagada íntegra según API, tablero de conciliación.

El portal que ve el cliente debe seguir simple. La complejidad de RFQ, legal, inventario, reconciliación, CFDI y QA permanece en el panel privado y el procedimiento del equipo.
