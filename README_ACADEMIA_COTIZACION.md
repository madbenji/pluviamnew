# PLUVIAM — Candidato de cierre comercial, Academia y Cotización

**ESTADO: CÓDIGO PARA REVISIÓN / STAGING AISLADO. NO PUBLICAR EN PRODUCCIÓN NI CARGAR DATOS REALES.**

## Qué se modificó en comparación con la entrega integral candidata V52.1

- `site/academia.html`: convertida en **Academia y red profesional** para arquitectos, despachos, ingeniería hidrosanitaria, instaladores/jefes de cuadrilla, QA/mantenimiento. Presenta G0–G3, alcance profesional, matriz preliminar y régimen propuesto de colaboración. Sin solicitudes de registro, credenciales activas, empleos prometidos ni cursos certificados.
- `site/cotizacion.html`: reconstruido el journey en cinco hitos, dos rutas, instrucciones para material técnico y condiciones de pago después de la propuesta formal.
- `site/journey-profesional.css`: estilos responsivos nuevos para esas dos páginas.
- `tests/test_academia_cotizacion.mjs`: QA de enlaces/seguridad declarativa. `tests/test_integral_ux.mjs` actualizado porque el selector local de fotos se eliminó deliberadamente; el QA de integridad ahora usa hashes de referencia portables guardados en `tests/protected_hashes.json`.

**No cambia nada más del `site/` anterior:** index, app.js, motor, `_worker.js`, mi-proyecto, Retell, D1, esquema, migraciones, pagos, privacidad ni endpoint alguno. No instala, crea o ejecuta servicios externos.

## Decisión explícita sobre fotografías

Antes: un control `<input type=file>` permitía visualizar hasta cuatro fotografías **sólo localmente**, sin enviarlas. Daba una expectativa falsa de que PLUVIAM podía recibirlas. Se eliminó de la pantalla nueva. Ahora se explica que las imágenes permanecen en el dispositivo del cliente hasta que exista un canal privado autorizado. **No hay carga ni almacenamiento de fotos habilitado.** `quote-r7.js` histórico se conserva sin modificar, pero la cotización nueva no lo importa.

## Gates obligatorios, informados por Command Center

El tablero CI-M-29-01 indica R16/R18 NO-GO: no activar captación PII, CRM, propuestas contractuales automáticas, checkout, Webhooks financieros o envío de fotos hasta completar aislamiento A/B, legal, consentimientos, tests HTTP y autorización. La captura de una página pública que funciona no acredita seguridad del backend.

Fuentes rectoras consultadas:
- [D02 / Centro de Inteligencia CI-54](https://docs.google.com/document/d/1d1-5qHYCBQJSuc88AbN4oWEqGBf6iWn-05ujXC9NUaM/edit)
- [Command Center](https://docs.google.com/document/d/1bS6MUL-J7QFKQEeK1D_yXiiG3SJojjjIiQE-1ppbTiI/edit)
- [Sprint Academia (matriz v0.1)](https://docs.google.com/document/d/1L_SgFEJTYvtYarbbLkXncNEkZh8_8Tl_ct-bpE17tOQ/edit)
- [Ficha de cotización técnica](https://docs.google.com/document/d/1nMlJgsMLVuB79Z9vRippYMHtJzXukqh3IMGvAEg75kA/edit)
- [Trello M01 NO-GO](https://trello.com/c/zZFS0be1/2-ci-m-29-01-p0-privacidad-r16-r18-preparar-contenci%C3%B3n-qa-sin-go-producci%C3%B3n)

## QA local

Suites PASSED: test_academia_cotizacion.mjs (46), test_integral_ux.mjs (36), test_integral_consent.mjs (11), test_integral_payment_ui.mjs (8), test_retell_v52_1.mjs (24), test_v50.mjs (5,103 escenarios), test_v52.mjs (267,840 combinaciones). JavaScript syntax check PASS. Comparativa SHA: núcleo, pago, Retell intactos.

Pruebas de visualización **offline** en Chromium, `set_content` con CSS e imágenes locales embebidas: Academia y Cotización, anchos 390 / 768 / 1280 px sin desbordamiento horizontal detectado. Se generaron capturas de teléfono y hero escritorio. Esto **no valida el deployment HTTPS real**, accesibilidad integral ni dispositivos reales. La primera ejecución de QA falló por navegador Playwright empaquetado no disponible y una posterior tardó demasiado por múltiples capturas; se usó `/usr/bin/chromium` instalado y sesiones puntuales para comprobar los seis tamaños.

## Cómo probar en Cloudflare sin riesgo

1. **No actualizar el dominio `pluviam.pages.dev`** ni el deployment actual sin inventario de código y rollback verificados; la captura recibida muestra `70b74dac` como Production, pero NO demuestra qué commit/ZIP desplegó.
2. Descomprimir `PLUVIAM_ACADEMIA_COTIZACION_PREVIEW_PAGES_AISLADO.zip` y usar su contenido raíz para un proyecto de prueba NUEVO, separado, sin bindings D1/R2 productivos ni secretos.
3. Verificar Inicio → Cotización → cinco pasos → Inicio/diagnóstico, Academia → rutas profesionales → CTA mailto voluntario, Mi proyecto y enlaces de privacidad. Comprobar que no aparece input de fotos.
4. Test de dos cuentas falsas antes de cualquier PII; revisar legal, prueba móvil real y rollback; requerir GO explícito para promoción de preview.

No se desplegó Cloudflare, no se registraron leads, no se cargaron fotos ni se emitieron credenciales, cobros o llamadas.
