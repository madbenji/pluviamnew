# PLUVIAM V52.1 · Compatibilidad Valeria / Retell

## Cambios realizados

Únicamente `retell-worker/index.js` cambia con respecto a V52. **No se modifica `site/`**: la web V52, el test, el historial D1, el checkout, los folios y los pagos siguen tal cual.

El Worker de llamadas transmite variables dinámicas según el agente Retell aprobado:

| Variable | Valor origen |
|---|---|
| `customer_name` | `lead_cases.name`, o texto alternativo seguro si falta |
| `quote_status` | `propuesta_aprobada`, únicamente si `approved_quotes.status='approved'` y se aprobaron requisitos técnico/legal/cliente |
| `folio` | D1 `lead_cases.folio` |
| `ciudad` | D1 `lead_cases.city` |
| `monto_anticipo` | `round(approved_quotes.amount_cents / 2) / 100`, dos decimales MXN, nunca precio ilustrativo |
| `nombre_cliente` | Alias legado para compatibilidad, no requerir al nuevo agente |

No se envían claves privadas ni datos de tarjeta. El API ahora usa `honor_internal_dnc: true` para respetar el bloqueo DNC de Retell, más `idempotency_key` estable por seguimiento. Si el proveedor devuelve HTTP 400 explícito por DNC, revoca localmente el permiso; si el resultado del análisis indica `user_requested_dnc`, también revoca localmente. Sin reintentos automáticos de llamadas ambiguas.

## Retell (manual, NO realizado desde este paquete)

1. En el agente Valeria activar `Agent Handbook > Scope Boundaries` si el panel lo permite y confirmar aviso de IA, reglas de anticipo y no solicitar medios de pago por voz. No podemos cambiar esa configuración sin autorización / acceso a tu cuenta.
2. En el saludo usar el fallback: «Hola, soy Valeria, asistente virtual con inteligencia artificial de PLUVIAM. ¿Hablo con la persona que solicitó una cotización?» cuando falte el nombre. El Worker evita el vacío también al enviar `customer_name` alternativo.
3. Indicar en su prompt que `quote_status=propuesta_aprobada` equivale a cotización contractual aprobada; otros valores nunca autorizan mencionar importes como definitivos.
4. Seleccionar y guardar la voz mexicana que ya elegiste; elegir voz no inicia llamadas. No llamar aún a clientes reales.

## Despliegue por separado (staging antes de producción)

- **No resubir la web Pages V52**: sus archivos permanecen idénticos.
- Crear / actualizar `retell-worker/index.js` con Wrangler para el Worker Cron de pruebas, con binding `DB` hacia D1 **staging** y migración `migraciones/002_retell_v51.sql` aplicada (ver `docs/RETELL_V51_IMPLEMENTACION.md`).
- Mantener los flags `RETELL_ENABLED=false`, `RETELL_LAUNCH_APPROVED=false`, `RETELL_PRIVACY_APPROVED=false`, `RETELL_COST_APPROVED=false`, `RETELL_MX_OUTBOUND_APPROVED=false`, `RETELL_MAX_CALLS_PER_DAY=0` por defecto.
- Tras autorizar pruebas controladas: configurar `RETELL_AGENT_ID`, `RETELL_PHONE_NUMBER` (habilitado para destinos +52), secreto `RETELL_API_KEY`, límite de gasto y horario. Un agente publicado y su ID no reemplazan las verificaciones financieras del sistema.
- Una llamada real a México puede tener cargos de Retell y telefonía. No realizar llamadas facturables sin aprobación explícita.

## Reversión

Poner `RETELL_ENABLED=false` en el Worker Cron, después volver al archivo `retell-worker/index.js` de V52 si hiciera falta. No revertir Pages; conservar D1 y consentimientos. No se garantiza detener llamadas ya conectadas.

## Pruebas

`node tests/test_retell_v52_1.mjs` y `node tests/test_retell_v51.mjs` (simuladas, sin llamadas reales). Comparación SHA256 del directorio site contra V52. La aplicación real de la migración y el contacto con Retell requieren staging con credenciales autorizadas.
