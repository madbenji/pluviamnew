# PLUVIAM — Reparación del folio, salida a Outlook y navegación omnicanal
**Fecha:** 26 de octubre de 2026 · **Clase:** incidencia P0 UX/ventas · **Estado:** código y QA local completos; *candidato de staging, no desplegado*

## Hallazgo comprobado en el sitio en vivo
`https://pluviam.pages.dev/api/estado` respondió:
`{"backend":true,"accepting":false,"turnstile":true,"turnstileSiteKey":null,"payments":false,"crypto":false,"drafts":false,"whatsAppNumber":null}`.

Por tanto, la web pública no puede generar un folio nuevo ni una clave privada y no permite iniciar pagos reales. El aviso `/privacidad` continúa identificado como borrador; no es correcto activar el registro en Cloudflare sin revisión jurídica y consentimiento válido. La inspección de `app.js` reproducía el origen del popup de Outlook: con `leadGateReady=false`, `submitLead` llamaba `confirmByEmail()`, que hacía `window.location.href='mailto:...'`.

Se navegó en navegador real por el test, la página pública y `/pagar.html` sin introducir información personal, emitir una solicitud ni generar un cargo. La inspección en navegador fue parcial respecto de la pantalla final de envío; la causa del redireccionamiento proviene del análisis directo del código que estaba empaquetado, coherente con las capturas aportadas por el fundador.

## Correcciones en código
1. `site/app.js`: **eliminada toda redirección automática `mailto:` de la sección de diagnóstico**. Con `accepting:false`, el botón principal queda deshabilitado, muestra la situación real y se ofrecen cuatro acciones autónomas: descargar el resumen orientativo sin datos de contacto y sin folio (`.txt` local), copiar resumen, volver a consultar estado y copiar la dirección de contacto. WhatsApp sólo aparece con número públicamente configurado válido. No hay promesa de correo enviado ni folio ficticio.
2. `site/index.html` y `site/styles.css`: explicación transparente en última etapa, controles responsivos y cuatro botones visibles hacia `/pagar.html?metodo=mercadopago|spei|bbva|crypto`. Todos llegan al portal **privado**; los botones por sí solos no autorizan importes ni crean pagos. Los datos del diagnóstico no son cobros.
3. `site/pagar.js` y `site/pagar.css`: se conserva el método sugerido únicamente como *preferencia visual* después de consultar la propuesta. Es imprescindible verificar folio+clave, contrato aprobado y aceptado, hito e importe D1, y pasarela activa. SPEI sólo si el proveedor efectivamente lo ofrece; BBVA requiere confirmación de abono; crypto se valida con NOWPayments. En error de red ambiguo no se permite reintentar impulsivamente el cargo. Guardado de la clave únicamente en `sessionStorage` del navegador, sin enviarla por URL.
4. `site/mi-proyecto.js`: tras regresar desde pasarela, puede recuperar el folio/clave guardados en esa sesión; **regresar no equivale a pago acreditado**, y el cliente debe consultar el estado.
5. `tests/test_folio_checkout_ux_26oct.mjs`: 22 comprobaciones específicas y una simulación ejecutable del cierre del registro. `tests/test_coherencia.mjs` modernizado para resolver correctamente rutas con query string, sin cambiar comprobaciones financieras.

## QA
`npm run verify` con Node.js: **17/17 suites PASS** y **220 comprobaciones de coherencia PASS**. Incluye suite específica de folio+checkout, privacidad, contratos/hitos, conciliación BBVA, webhook cripto, MP/Stripe con mocks, PDF y pruebas sintéticas de motor. Se revisó sintaxis de los JS de Pages y Worker. **No se probó un cobro bancario/cripto real, D1 productiva o staging autenticada, ni E2E de formulario con consentimiento válido**. Los tests no sustituyen esos hitos.

## Para restablecer el folio real y los pagos
1. D04/D01: publicar aviso integral definitivo, consentimiento/versionado, datos del responsable y política contractual; resolver el borrador del sitio vivo.
2. D13: obtener acceso autenticado a Cloudflare, hacer backup de D1 real, validar migraciones, secrets y binding, desplegar primero a **Pages Preview**, comprobar envío con Turnstile y retorno de `folio+accessToken` reales. Sólo después cambiar flags de captación, con autorizaciones reales (no autodeclaraciones).
3. D05: acreditar titular y operación MP, SPEI del merchant, CLABE+beneficiario BBVA, NOWPayments/API/IPN/wallet y política de divisas y comisiones. Seguir flujos de autorización/formalización legal.
4. D14: confirmar en Preview: nuevo folio+clave, consulta segura de expediente, propuesta por versión, aceptación, enlaces `?metodo`, rechazo previo a cotización, pago sandbox, webhook firmado y duplicado, reintentos ambiguos, devolución/contracargo y notificación sin exponer secrets. Registrar evidencia.
5. D01 emitir GO formal en conjunto con D04/D05/D08/D13/D14 para despliegue productivo. **No elevar `PAYMENTS_ENABLED`, `COMMERCE_GO_APPROVED` ni `LEADS_ENABLED` solo por tener el ZIP.**

## Limitación material
Este parche arregla la causa de Outlook **una vez desplegado** y evita confundir un archivo descargado con un folio registrado. **No puede crear un folio real cuando `accepting:false`** ni acreditar dinero sin acceso a cuenta de comercio y webhooks efectivos. No se modificaron secretos ni la producción.

### Resultado del intento visual local
Se intentó una prueba adicional con Chromium + Playwright contra `127.0.0.1` y fue bloqueada por la política del entorno con `net::ERR_BLOCKED_BY_ADMINISTRATOR` **antes de cargar el sitio**. No se cuenta como éxito visual ni equivale a QA de Cloudflare Preview. Se preservan la prueba pública exploratoria no destructiva y las suites automáticas locales comprobadas.
