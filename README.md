# PLUVIAM — finalización integral UX y seguimiento sobre V52.1

**Estado: paquete CANDIDATO PARA QA EN STAGING. No publicarlo en producción.**

No se ha verificado que V52.1 sea el despliegue actualmente activo en Cloudflare. El número oficial de la siguiente versión queda pendiente hasta comparar el deployment Production, obtener respaldo y autorización.

## Qué contiene y por qué

- `site/index.html`, `site/app.js`, `site/ux-conversion-preview.css`: tarjeta de resultados centrada en captación anual, gasto a tres años e inversión orientativa; perfiles desplegables, formulario compacto y dos caminos comerciales desde el folio. Se conserva el test de 5 preguntas y los nueve perfiles.
- `site/mi-proyecto.html`, `site/project-timeline.js`, `site/project-premium.css`: vista privada con estado y etapas conectadas a la respuesta autenticada `/api/proyecto`, eventos y documentos reales si el backend los expone. No se inventan visitas, plazos o pagos.
- `site/mi-proyecto.js`: no muestra opciones de cobro si la propuesta ha vencido, incluso con opciones erróneas en la respuesta. El servidor continúa siendo la única autoridad de cobro.
- `site/project-docs.js`, `site/project-v50.css`: ficha PDF descargable sin clave; consentimiento separado para llamada de Valeria, inicialmente desmarcado, con confirmación mediante `/api/lead-abandonment` y revocación accesible. Descargar PDF no registra consentimiento.
- `site/cotizacion.html`, `site/privacidad.html`: textos más claros; las fotos no se cargan al servidor, y el aviso integral sigue pendiente de revisión/aprobación legal.
- Tests de integración lógica y manifiesto criptográfico en `tests/` y `COMPARATIVA_E_INTEGRIDAD.json`.

## Lo preservado, sin cambio de lógica

`site/_worker.js` (incluye control de anticipo y D1), `site/engine.js`, `retell-worker/index.js`, `backend/retell-pages.module.js` y migraciones. Ninguna API real fue ejecutada. No se enviaron emails, llamadas, datos de clientes ni pagos. No se establecieron variables de entorno ni credenciales.

## QA efectuada

Todos los scripts JavaScript parsean (`node --check`), los enlaces locales HTML existentes resuelven, no hay IDs HTML duplicados, y las suites de cálculo, controles comerciales, Retell mock, seguimiento, autorización independiente y UI de pago pasaron.

El test histórico `tests/compare_v51_v52.mjs` NO es aplicable a esta entrega porque exige literalmente que `mi-proyecto.js` y `project-docs.js` sean idénticos, justamente los módulos que el usuario pidió mejorar. En su lugar se auditan las identidades SHA256 del motor, Worker, pagos y Retell, y `test_integral_payment_ui.mjs` / `test_integral_consent.mjs` comprueban comportamientos nuevos.

**NO verificado:** navegador visual local (restricción ERR_BLOCKED_BY_ADMINISTRATOR), responsive real, pantallas lector de voz, QA HTTP en Pages, D1 real, sistema de correo, permisos A/B, webhook de Mercado Pago, MSI/SPEI comerciales, llamadas con Retell ni aviso legal aprobado. Para producción siguen siendo gates obligatorios.

## Procedimiento seguro

1. Confirmar en Cloudflare Pages la implementación actual **Production** y su origen e ID. Respaldar la versión y verificar rollback.
2. Crear **un proyecto Pages independiente** para la vista previa, sin tokens, D1 de producción, credenciales de pago ni llamadas reales. Extraer el ZIP de vista previa y cargar su contenido en la raíz de ese proyecto aislado.
3. Comprobar que `/api/estado` responda `accepting:false` mientras los avisos/bindings/schemas/Turnstile no estén aprobados. La web puede usarse en modo informativo sin recibir PII.
4. Para QA de expediente, utilizar una base de STAGING con migraciones y dos clientes sintéticos. Probar aislamiento con folios A/B, estados, event log y documentos; ninguna PII real.
5. Probar en móvil real (320, 375, 390, 428px), escritorio, zoom 200%, teclado, lectores de pantalla. Verificar acceso, privacidad, errores y CTAs.
6. Para cobros, usar exclusivamente sandbox y montos contractuales sintéticos; validar webhook verificado, idempotencia, estados de pago y recuperación. Retell sin outbound real durante QA.
7. Revisión legal del aviso integral y condiciones comerciales, autorización técnica/seguridad y GO expreso del fundador antes de cualquier despliegue Productivo.

**No pegar tokens de Cloudflare, Retell ni pasarela en el chat ni en el ZIP.**
