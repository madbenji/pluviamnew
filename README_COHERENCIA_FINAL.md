# PLUVIAM — CIERRE DE COHERENCIA WEB (25 OCT 2026)

**Estado: CANDIDATO DE PUBLICACIÓN / QA. NO DESPLEGADO EN PRODUCCIÓN.**

## Resultado ejecutivo

Se contrastaron las rutas públicas de https://pluviam.pages.dev/ (Inicio, Diagnóstico, Casa 3D, Cotización, Academia, Mi proyecto, Contacto, Privacidad y 404) con el paquete archivado PLUVIAM_CIERRE_CODIGO_COMPLETO_Y_QA_NO_PROD.zip. Se mantuvo intacto el diseño principal, la UX de diagnóstico, Academia profesional, journey de cotización y portal protegido.

### Hallazgo de producción P0: Contacto inaccesible

El navegador real observó `ERR_TOO_MANY_REDIRECTS` al abrir https://pluviam.pages.dev/contacto.html, también ocurrió en intentos de lectura públicos. Causa localizada en el Worker: `'/contacto':'/contacto.html'` contradice la canonización de URL HTML de Cloudflare Pages que puede dirigir `contacto.html` a `/contacto`. Se retiraron las dos redirecciones de Contacto del mapa legacy para entregar esa ruta a `env.ASSETS.fetch(request)`, como se hace con Academia y Cotización. NO se ha verificado el efecto en Pages real: probar las rutas `/contacto` y `/contacto.html` antes de publicar. **Actualmente el error público podría continuar hasta desplegar el parche.**

### Cambios coherencia

- **Inicio:** enlace de accesibilidad «Ir al diagnóstico» enlaza `#experience` verdadero; pie con descripción uniforme de marca.
- **Casa 3D:** regreso al diagnóstico directo `/#experience`; navegación entre secciones completa; CTA no confunde el diagnóstico con la cotización formal.
- **Cotización:** una sola navegación transversal (eliminó cabecera duplicada); claridad de residencial vs proyecto a medida, cinco pasos y política de fotografías sin subida; sin jerga técnica de almacenamiento en el copy al cliente.
- **Academia:** misma navegación de las demás páginas; distingue arquitectos, ingeniería, instaladores y supervisores; programa G0–G3 de futura homologación, sin certificaciones activas ni empleos prometidos.
- **Mi proyecto:** acceso transversal sin tocar búsqueda ni contenido sensible; conserva robots noindex.
- **Contacto:** rutas identificables para nuevo diagnóstico, consultar folio, escribir voluntariamente y colaboración profesional; header/footer transversales.
- **Privacidad:** corrigió la referencia obsoleta a un selector de fotos que ya NO existe en Cotización. Aviso integral todavía pendiente de validación jurídica, sin afirmar aprobación.
- **404:** salida a Inicio, Cotización, Mi proyecto y Contacto.

### Alcance de cambio

Modificados 9 archivos web previos y añadido 1 CSS compartido. Único cambio en `_worker.js`: eliminar redirecciones circulares de `contacto`. **No se tocaron endpoints /api, cálculos hidrológicos, las tablas D1, integraciones de pago ni Retell.** Otros archivos de `site/` son SHA256 idénticos a la entrega anterior.

## QA comprobado

- Auditoría de rutas, enlaces, encabezados, CTA, estado de fotos/Academia y acceso `noindex`: `tests/test_coherencia.mjs` PASS 212+ aserciones; mock env.ASSETS confirma ausencia del redirect en ambas variantes Contacto.
- `tests/test_academia_cotizacion.mjs` PASS, 66 aserciones.
- `tests/test_integral_ux.mjs` PASS, 36 aserciones con verificación de hash de backend salvo la diferencia de rutas documentada.
- `tests/test_integral_consent.mjs` PASS 11; `tests/test_integral_payment_ui.mjs` PASS 8.
- `tests/test_retell_v52_1.mjs` PASS 24; `tests/test_retell_v51.mjs` PASS 27, simulaciones sin llamadas reales.
- `tests/test_v50.mjs` PASS: 5,103 escenarios / 20,425 aserciones.
- `tests/test_v52.mjs` PASS: 267,840 combinaciones / 2,680,528 aserciones, 405 casos API y 90 mocks de persistencia.
- Validación sintáctica `node --check` en JS del sitio y Retell PASS.
- Chromium HTML/CSS inyectado (sin peticiones de red ni Worker real): 8 rutas × 3 anchos (390 / 768 / 1280) = **24/24 sin overflow horizontal**. Menú móvil en Inicio y Academia verificado en 390 y 768.

**Comparadores históricos que no se consideran pruebas de esta entrega:** `tests/compare_v51_v52.mjs` exige que `mi-proyecto.js` sea idéntico al V51, aunque el paquete previo ya contiene mejoras intencionales; falla por comparación con esa línea histórica. `tests/test_v51_static.py` está ligado a los cambios exactos del parche V51 y falla porque la estructura actual es posterior. Se conservan sin reescribir afirmaciones sobre esos baselines; su resultado no invalida la verificación SHA256 contra el paquete inmediatamente anterior.

## Comp puertas para producción

1. Confirmar fuente/commit y backup del deployment Cloudflare vigente (el ID visto en captura era `70b74dac` el 25/oct; puede haber cambiado). No inferir versión interna a partir del ID.
2. **Hacer deploy a proyecto de staging aislado** del ZIP Cloudflare raíz, sin bindings de DB/secretos productivos. Probar `contacto` y `contacto.html` con HTTP/redirects reales y rutas internas bajo la versión deployada, tanto desktop como móvil.
3. Probar `env.ASSETS` y rutas API sintéticas bajo Worker Pages real, políticas R16/R18, acceso A/B por folio/token, legal/consentimientos, Turnstile, CSP y rollback. Nunca datos de clientes reales en staging.
4. Revisar y aprobar aviso integral, consentimiento y controles; decisión explícita GO del fundador y responsables de seguridad/legal. Sin GO no activar lead capture, pagos, fotos, Retell ni WhatsApp.
5. Aplicar diff sobre fuente de producción real y aprobación explícita antes de cualquier publicación a pluviam.pages.dev.

**No implementado:** subida a R2, WhatsApp con Valeria, satélite, telemetría, one-click payment, credenciales profesionales o embajadores. Figuran como arquitectura futura y NO deben anunciarse como servicios activos.

Fuentes de gobernanza: Centro de Inteligencia https://docs.google.com/document/d/1d1-5qHYCBQJSuc88AbN4oWEqGBf6iWn-05ujXC9NUaM/edit ; Command Center https://docs.google.com/document/d/1bS6MUL-J7QFKQEeK1D_yXiiG3SJojjjIiQE-1ppbTiI/edit ; M01 NO-GO https://trello.com/c/zZFS0be1/2-ci-m-29-01-p0-privacidad-r16-r18-preparar-contenci%C3%B3n-qa-sin-go-producci%C3%B3n .
