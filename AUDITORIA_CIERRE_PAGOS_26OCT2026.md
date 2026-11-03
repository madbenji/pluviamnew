# PLUVIAM — Auditoría técnica y ruta de cierre de cobros
**Corte:** 26 de octubre de 2026 · **Sitio único:** https://pluviam.pages.dev/  
**Dictamen:** **NO-GO para cobrar públicamente.** Mantener el sitio informativo y la captación únicamente si la base legal fue validada. No se modificó Cloudflare ni se recibió dinero.

## 1. Hechos comprobados contra producción

- La respuesta pública a `GET https://pluviam.pages.dev/api/estado` mostró `backend:true`, `accepting:true`, `turnstile:true`, `payments:false`, `crypto:false`, `drafts:false`, `whatsAppNumber:null` (26-oct-2026). Estas son declaraciones de estado de la API; no certifican auditoría de D1, proveedor o cumplimiento legal.
- El sitio público contiene `/pagar` y `/mi-proyecto`. El portal exige folio y clave. Con credenciales deliberadamente ficticias respondió `Folio o clave no encontrados.` y no mostró montos, CLABE, enlaces de checkout ni aceptación habilitada. No se hicieron pruebas con clientes reales ni se aceptaron condiciones.
- Se observaron avisos de privacidad preliminares en la web y documentación de riesgo legal. La API indica `accepting:true`. Un jurista debe conciliar ambos y aprobar el aviso antes de continuar con captación comercial.
- **La versión fuente más reciente encontrada en Drive que pudimos probar es anterior a la versión pública de pago:** no incluye `/pagar.html`, ni NOWPayments. Por eso **no hay ZIP que deba reemplazar producción** con base en estos archivos.

## 2. Estado por método

| Método | Evidencia actual | Acción pendiente |
|---|---|---|
| Mercado Pago (tarjeta / Checkout Pro) | Worker histórico y pruebas locales ficticias con preferencias, firmas y montos; web live `payments:false` | merchant validado y credenciales guardadas en Cloudflare; callback firmada real, sandbox aprobado/rechazado/pendiente, devolución y conciliación, primer cargo controlado autorizado |
| SPEI vía Mercado Pago | Posible según oferta disponible en Checkout Pro de la cuenta; **no hay prueba de opción SPEI en pantalla real** | confirmar que el merchant/modalidad la ofrece, que la referencia es única y que la notificación marca pagado solo cuando proveedor confirma |
| BBVA transferencia directa | Source tiene endpoint y referencia por cotización, pero la UI admin no podía conciliar; se desarrolló parche y migración aislada de índice único | validar titular, CLABE, cuenta real, migración staging, extracto y abono único, política de parciales/sobrantes/devolución; nunca acreditar por captura de cliente |
| Criptomonedas NOWPayments | `crypto:false` en API live y versión fuente de Drive sin implementación | conseguir fuente exacta del portal actual y verificar firmas IPN, factura, red/token, caducidad, liquidación MXN, sub/sobrepago, reembolso y conciliación, luego habilitar con merchant autorizado |

## 3. Correcciones ya implementadas en el candidato NO PRODUCCIÓN

- En `site/admin.html` y `site/admin.js`, formulario de conciliación BBVA con revisión explícita de extracto, monto, referencia, ID del movimiento y administrador autenticado.
- En `site/_worker.js`, BBVA no se ofrece ni acepta hasta que `BANK_PAYMENT_ENABLED=true`, `BANK_ACCOUNT_VERIFIED=true`, CLABE de 18 dígitos, titular y migración 005 estén verificados. Rechaza prueba de importe diferente, referencia incorrecta o ID del movimiento reutilizado; actualización idempotente por estado.
- `migraciones/005_bbva_evidencia_unica_p0.sql` añade índice parcial que impide acreditar un mismo movimiento bancario a dos pagos BBVA. Requiere consultar duplicados previamente. No ha sido ejecutada sobre D1 real.
- `tests/test_bbva_conciliacion_p0.mjs` valida esos casos con D1 simulado en SQLite.
- Salud administrativa muestra `bbvaVerificado` con el gate correspondiente.

## 4. Pruebas locales del código candidato (no equivale a staging ni producción)

| Comprobación | Resultado | Alcance |
|---|---|---|
| Conciliación BBVA nueva | PASS · 18 aserciones | datos sintéticos / SQLite en memoria |
| Integración 4 puertas: contrato, proveedor, duplicados, email | PASS · 48 | proveedores simulados / SQLite en memoria |
| Hitos 50/50 y 50/30/20 | PASS · 59 | lógica y migración simulada |
| PDF contractual | PASS · 18 | render y contenido del ejemplo |
| UI de pago | PASS · 8 | escenarios ficticios |
| Consentimiento | PASS · 11 | validación interna |
| Cotización y Academia | PASS · 66 | validación interna |
| V50 | PASS · 20,425 | escenarios sintéticos |
| UX de hash inmutable del backend | **FAIL esperado por test obsoleto** | exigía byte por byte el Worker anterior; actualizar baseline solo tras revisión independiente |

**No se ha probado:** cuenta Cloudflare autenticada, D1 real en staging, credenciales de comercio, webhook real, correos al cliente realmente entregados, primeras transferencias SPEI/BBVA ni cobro o devolución real en NOWPayments.

## 5. Secuencia de cierre sin sorpresas

1. **Preservación:** respaldar Pages producción, Worker, bindings, D1 (con restauración probada) y controlar quién puede desplegar. No subir un ZIP de referencia como sustituto directo.
2. **Recuperación del código exacto publicado:** localizar versión completa del portal de pagos **incluido `/pagar` y crypto** y comparar hashes y rutas de API con producción; fusionar únicamente el parche BBVA revisado, sin perder diseño, contenidos ni rutas.
3. **Legal y financiero:** responsable fiscal y titular del merchant/banco; aviso de privacidad definitivo; contrato, términos de cancelación/reembolso, CFDI, costeo, 2 RFQ/ingeniería real, márgenes mínimos y dinero recibido.
4. **Staging aislado:** Pages preview/entorno separado; D1 no productiva; credenciales sandbox, dominios y webhooks separadas; migraciones en orden y comprobación de estructura. `PAYMENTS_ENABLED=false`, `COMMERCE_GO_APPROVED=false`, `BANK_PAYMENT_ENABLED=false`, `BANK_ACCOUNT_VERIFIED=false` hasta GO.
5. **Casos E2E:** folio A nunca lee folio B; no hay pago por estimación, sin aceptación, contrato vencido o cambiado; pago por hito exacto; inicio doble; pago aprobado, rechazado, pendiente, devolución, contracargo, webhook duplicado/simultáneo, timeout; en BBVA abono único, parcial/sobrante, referencia incorrecta e ID de movimiento repetido; en crypto factura vencida, moneda/red equivocada, sub/sobrepago y reversión.
6. **Aprobación de primera venta:** certificado de merchant y cuenta bancaria, conciliación D1 con saldo en proveedor/banco, recibo y CFDI por contador, correo postpago que no expone claves, agenda y entrega verificadas, observabilidad y plan de reembolso.
7. **Publicación controlada:** levantar exclusivamente los métodos que pasaron pruebas, con backup, rollback probado y monitoreo. Registrar un GO independiente para captación, ventas, obras y cada método. Confirmar `/api/estado`: `payments:true` solamente cuando corresponda y `crypto:true` solo si realmente operativo.

## 6. Variables necesarias (secrets SIEMPRE en Cloudflare, nunca en chat)

- Gates: `PAYMENTS_ENABLED`, `COMMERCE_GO_APPROVED`, `CONTRACT_TERMS_APPROVED`, `LEGAL_APPROVED`, `LEADS_ENABLED`, `BANK_PAYMENT_ENABLED`, `BANK_ACCOUNT_VERIFIED`.
- Mercadopago: `MP_ACCESS_TOKEN` (Secret), `MP_WEBHOOK_SECRET` (Secret), `MP_PUBLIC_KEY` (Text).
- Banco: `BBVA_CLABE` (Text solo tras validación), `BBVA_BENEFICIARY_NAME` (Text) y evidencia de titularidad fuera del frontend.
- Cripto NOWPayments: obtener los nombres exactos de variables a partir del **Worker actual del portal**, no inventarlos; configurar llave API/IPN Secret y moneda/red y destino de liquidación del titular en su panel.
- D1 binding: `DB` con esquema/migraciones correctas, staging totalmente separado de producción.

## 7. Reglas duras

- Una redirección de navegador o captura **no** es confirmación de pago.
- Un cobro puede estar pendiente mientras una notificación no llega. Reconciliar mediante consulta a proveedor y estado de banco antes de reintentar.
- `provider_payment_id` y referencia deben ser idempotentes, y ninguna factura/recibo se emitirá por un evento no confirmado.
- Un cambio de cotización invalida aceptación previa; no vender sin evidencia real de disponibilidad/ingeniería y contrato aceptado.
- No intentar activar NOWPayments solo por mostrar su nombre en la página.

**Próximo insumo de máxima prioridad:** copia del ZIP/código completo de la versión publicada con `/pagar` y NOWPayments, o acceso autenticado a repositorio/Cloudflare para obtener **ese código**; luego credenciales se configuran **directamente en Cloudflare, nunca aquí**. El archivo de staging entregado es deliberadamente no publicable.
