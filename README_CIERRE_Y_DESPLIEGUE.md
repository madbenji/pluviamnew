# PLUVIAM · ENTREGA DE CIERRE SEGURA · 25 OCT 2026

**RELEASE CANDIDATE PARA QA / STAGING AISLADO. NO DELEGAR PRODUCCIÓN NI DATOS REALES.**

## Estado

Base: paquete candidato V52.1 + cierre Academia/Cotización. No se ha confirmado que este paquete sea idéntico al código fuente del deployment Cloudflare de producción `70b74dac` y no se ha desplegado en Cloudflare. **No crear una versión pública o comercial oficial hasta cotejar el commit/deployment y obtener GO legal/técnico/CEO.**

## Páginas y cambios

- **Inicio**: navegación móvil accesible sin JS con `<details>` y seis enlaces; enlace real a Academia profesional desde footer; marcador visible de cinco preguntas y tres etapas; enlace de sistema con flecha hacia abajo.
- **Academia**: programa de colaboración profesional (arquitectos/despachos, ingeniería, instaladores, QA y mantenimiento), G0-G3 orientativo, sin credenciales/registro activo, con menú móvil.
- **Cotización**: ruta residencial vs a medida, cinco pasos, fotografía sólo **después** de un canal privado autorizado; sin falsas subidas; precios finales/anticipos sólo tras ingeniería, aprobación y propuesta vigente.
- **Contacto**: cuatro rutas de navegación (diagnóstico, expediente privado, correo redactado por el visitante, Academia); no recogida de PII en esta página, no plazos de respuesta inventados ni autosend.
- **Mi proyecto**: línea de tiempo y documentos existentes conservados, con folio y clave privada; ninguna autorización por número WhatsApp.
- **Privacidad**: conserva borrador informativo; legal debe aprobar el aviso integral antes de operar.

### Diferencia mínima desde el paquete anterior
`site/index.html`, `site/academia.html`, `site/contacto.html`, más `site/release-polish.css`. Toda la capa financiera, cálculos, API, Retell y migraciones D1 se mantienen byte a byte sin cambios desde la entrega revisada anterior.

## QA realizado

- `node --check` en JS de sitio y Retell: PASS.
- `node tests/test_academia_cotizacion.mjs`: PASS (52 aserciones).
- `node tests/test_integral_ux.mjs`: PASS (36).
- `node tests/test_integral_consent.mjs`: PASS (11).
- `node tests/test_integral_payment_ui.mjs`: PASS (8).
- `node tests/test_retell_v52_1.mjs`: PASS (24; SIMULACIONES, cero llamadas reales).
- `node tests/test_v50.mjs`: PASS (5,103 escenarios; 20,425 aserciones, ejecución local).
- `node tests/test_v52.mjs`: PASS (267,840 combinaciones; ejecución local).
- Validación de enlaces/rutas y targets # de ocho páginas PASS.
- Chromium estático sin red: ocho páginas x tres viewport (390,768,1280), **24/24 PASS sin overflow horizontal**, menú móvil abre en Inicio y Academia.

Limitación: el navegador local bloquea http://localhost con ERR_BLOCKED_BY_ADMINISTRATOR; se probaron HTML y CSS inyectados `set_content`. No se ha verificado navegación HTTP real, integraciones Cloudflare, R2, CSP, teclado/lector de pantalla completo, Chrome/Safari móvil real, ni uso real de D1/pagos/Retell.

## PREVIEW seguro en Cloudflare

1. Registrar/confirmar deployment Production actual y commit: captura del 25oct muestra `70b74dac` en main, sin identificar SHA/source que la generó. **Hacer respaldo y obtener fuente/commit antes de cualquier promoción.**
2. Crear un proyecto Pages completamente nuevo, no asociado a `pluviam.pages.dev`, con `PLUVIAM_PREVIEW` distinto, sin bindings D1/R2 productivos, sin secretos de producción y sin pagos ni Retell habilitados.
3. Descomprimir `PLUVIAM_CIERRE_STAGING_PAGES_RAIZ.zip`: en Cloudflare subir el **contenido raíz**, no una carpeta `site` anidada.
4. Aislar el acceso al preview, verificar `_worker.js` sin bindings; comprobar Home → Cotización → formulario sin PII en entorno aislado → Mi proyecto no permite expedientes productivos → Academia → Contacto; probar móvil real y acceso por teclado.
5. Probar A/B: dos cuentas sintéticas no leen expedientes ajenos; revisar R16/R18, CORS, cookies, CSP, límites, Turnstile, consentimientos/ARCO, retención, errores y rollback. NO usar contactos reales.
6. Revisión y firma del aviso integral y GO técnico/legal/CEO por escrito. **Solo con GO** y un diff contra commit real desplegado puede considerarse producción.

## NO HABILITADO

- Upload de fotos/R2, WhatsApp de Valeria, emisión de credenciales, estimación por satélite, telemetría IoT, embajadores, 1-click checkout, cobro recurrente, teléfonos automáticos nuevos. Son iniciativas documentadas, no features declaradas.
- El backend existente no recibe un GO de captación comercial por pasar suites sintéticas.

## Referencias rectores

Centro Inteligencia CI54: https://docs.google.com/document/d/1d1-5qHYCBQJSuc88AbN4oWEqGBf6iWn-05ujXC9NUaM/edit
Command Center: https://docs.google.com/document/d/1bS6MUL-J7QFKQEeK1D_yXiiG3SJojjjIiQE-1ppbTiI/edit
Academia profesional: https://docs.google.com/document/d/1L_SgFEJTYvtYarbbLkXncNEkZh8_8Tl_ct-bpE17tOQ/edit
Cotización técnica: https://docs.google.com/document/d/1nMlJgsMLVuB79Z9vRippYMHtJzXukqh3IMGvAEg75kA/edit
M01 NO-GO: https://trello.com/c/zZFS0be1/2-ci-m-29-01-p0-privacidad-r16-r18-preparar-contenci%C3%B3n-qa-sin-go-producci%C3%B3n
