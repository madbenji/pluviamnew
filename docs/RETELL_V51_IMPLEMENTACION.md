# PLUVIAM V51 — implementación adicional Retell AI sobre V50

**Estado:** paquete de PREPRODUCCIÓN; `RETELL_ENABLED=false` por defecto. No se han registrado llamadas reales. La versión V46-R7 publicada debe mantenerse hasta superar QA formal de V50 y V51.

## Auditoría real del repositorio

- `site/_worker.js`: Pages Advanced Mode; conserva D1 `DB`, `/api/proyecto`, `/api/solicitudes`, Webhooks Stripe/Mercado Pago y outbox. **Modificado solo para rutas V51, información de elegibilidad y cancelación al confirmar anticipo**. No se reconstruye ni modifica el motor `engine.js`.
- `site/project-docs.js`: el botón **Guardar mi propuesta y pagar después** sigue descargando PDF. Solo si el cliente marca una casilla independiente, al descargar también solicita registrar un seguimiento futuro; al fallar el registro la descarga de PDF sigue funcionando. No genera un segundo folio.
- `site/mi-proyecto.js`: pasa el token privado solo al componente de la página actual, no a URL o PDF.
- `site/project-v50.css`: estilos de consentimiento responsive sin premarcado.
- `migraciones/002_retell_v51.sql`: tablas nuevas `retell_consents_v51` y `retell_followups_v51` + índices, sin modificar V46 ni V50.
- `retell-worker/index.js`: Cron Worker independiente; **comparte la misma instancia D1** a través del binding `DB`. No crea segundo CRM, segundo folio ni otro sistema de cobro. No se necesitan Pages Functions ni Service Binding para este diseño.

## Flujo de extremo a extremo

1. El cliente envía el formulario original y obtiene folio+clave. Una propuesta solo puede recibir llamada de rescate después de aprobación técnica/legal, aceptación, vigencia y anticipo pendiente.
2. Tras autenticarse en **Mi proyecto**, puede guardar PDF sin llamadas, o autorizar por casilla **no premarcada** una llamada automatizada. La decisión se envía con `POST /api/lead-abandonment` y `folio + token`; el servidor recupera teléfono, monto y datos desde D1, ignorando importes suministrados por navegador.
3. Se guarda consentimiento separado de privacidad general (versión `retell-followup-v1-2026-10-24`) y un único seguimiento por cotización (`UNIQUE quote_id`), programado al menos `180` segundos después.
4. El Worker con `cron = '* * * * *'` revisa pendientes aproximadamente cada minuto; **3 minutos es tiempo mínimo, no exactitud al segundo**. Fuera de horario laboral lunes-viernes 10:00–18:00 de Ciudad de México se difiere. Se comprueba nuevamente el pago, revocación, validez de cotización, presupuesto y teléfono.
5. Se hace un `UPDATE` condicional atómico que reclama el único evento y se revalida inmediatamente antes de llamar. Si Retell no responde o hay timeout, queda `uncertain` **sin reintento automático** para evitar llamadas duplicadas y doble facturación.
6. Retell recibe solo nombre, folio, ciudad, anticipo del presupuesto aprobado, número E.164; NO recibe la clave privada ni tarjetas. Se almacena `call_id` y `call_status`; la conciliación consulta `GET /v2/get-call/{id}` y guarda solo `call_status` y, si Retell tiene análisis estructurado `call_analysis.custom_analysis_data.lead_status`, uno de los estados predefinidos `qualified`, `not_interested`, `followup_requested`, `human_requested`, `not_connected`.
7. Los webhook de pagos originales siguen actualizando `payment_attempts`. Después de una confirmación de anticipo se cancelan solicitudes programadas/pendientes por `quote_id`. En caso de faltar la migración V51, el cobro preexistente **no falla** por ello.
8. Un cliente puede revocar desde la misma página con folio y clave; no se realizan llamadas sin consentimiento. Solo se contempla inicialmente un destino mexicano validado, con normalización de teléfono nacional de 10 dígitos a `+52`.

### Limitación importante de concurrencia

La revisión condicional de D1 minimiza carreras entre conciliación de pagos y lanzamiento de llamada. No garantiza cancelar una llamada cuya solicitud **ya llegó a Retell**. Un piloto debe ensayar estos bordes y, si hace falta, implementar finalización de llamada ya iniciada con API de Retell y consentimiento aprobado. No se debe prometer cancelación del audio una vez conectado.

## Activar/desactivar

Variables en **Pages** y en el **Worker Cron** (mismos criterios de aprobación):

| Variable | Inicial | Propósito |
|---|---|---|
| `RETELL_ENABLED` | `false` | Kill switch principal: false cancela ejecución futura de llamadas |
| `RETELL_LAUNCH_APPROVED` | `false` | Aprobación final comercial/tecnológica |
| `RETELL_PRIVACY_APPROVED` | `false` | Revisión legal del consentimiento, responsable, proveedores y grabaciones |
| `RETELL_COST_APPROVED` | `false` | Aprobación de costos por minuto y eventuales números |
| `RETELL_MX_OUTBOUND_APPROVED` | `false` | Verificar capacidad del número configurado para llamar a +52 |
| `RETELL_API_KEY` | **Secret**, nunca en archivo | Clave API de Retell, configurar con `wrangler secret put` |
| `RETELL_AGENT_ID` | vacío | ID válido del agente Valeria |
| `RETELL_PHONE_NUMBER` | vacío | Número comprado/importado y habilitado para salientes México |
| `RETELL_RESCUE_DELAY_SECONDS` | `180` | Mínimo 180, máximo 86400 |
| `RETELL_MAX_CALLS_PER_DAY` | `0` | Máximo diario; >0 solo tras autorizar gasto |
| `QUOTE_VALIDITY_APPROVED` y `QUOTE_VALID_DAYS` | Copiar política aprobada existente | Nunca inventar vigencia de 15 días |

El **Cron Worker** necesita binding `DB` a la MISMA D1 de staging utilizada por el Pages Preview, sin credenciales en navegador. Pages continúa usando su propia vinculación `DB` (no alterarla).

## Instalación en STAGING (ejemplo de comandos, requiere acceso autorizado)

1. Registrar el ID del deployment original V46-R7, tomar copia verificable de V50 y exportar respaldo de D1. Crear un proyecto Pages PREVIEW/branch con configuración equivalente pero D1 de staging.
2. Ejecutar primero `migraciones/001_proyectos_v50.sql` **si aún no se ha aplicado** y luego `migraciones/002_retell_v51.sql` en staging, con migraciones aditivas y respaldo. Ejemplo: `npx wrangler d1 execute NOMBRE_D1_STAGING --remote --file=migraciones/002_retell_v51.sql`.
3. Desde la carpeta raíz, desplegar la carpeta `site/` a Pages Preview con `npx wrangler pages deploy ./site --project-name=NOMBRE_PAGES --branch=v51-retell-staging`; **no usar producción**.
4. Copiar `retell-worker/wrangler.toml.example` a `retell-worker/wrangler.toml`; completar el ID de la MISMA D1 staging, nombre de Worker, y dejar los flags en `false`. Por separado: `cd retell-worker && npx wrangler secret put RETELL_API_KEY` y `npx wrangler deploy`.
5. En Pages Preview y Worker configurar los mismos flags; no cambiar `LEGAL_APPROVED`, `PAYMENTS_ENABLED` o credenciales existentes de V46. Validar primero con `RETELL_ENABLED=false` y luego pruebas controladas solo cuando haya consentimiento, cuenta Retell y presupuesto aprobados.
6. Configurar Retell con un número de salida que admita llamadas a México. En Retell crear el agente “Valeria” y añadir herramientas/FAQ autorizadas; **no inventar promesas ni pagos**.
7. Validar una llamada explícitamente autorizada en ambiente de prueba; contrastar en D1 fila única, estado y Retell call ID. Confirmar que cliente pagado nunca es llamado, que no cambia transacción financiera y que el PDF permanece íntegro.
8. Tras revisión jurídica, seguridad, ingeniería comercial, costos e infraestructura, publicar **solo con GO explícito**. Se puede apagar el canal de llamadas cambiando `RETELL_ENABLED=false` en ambos despliegues. Las llamadas ya conectadas requieren intervención específica de Retell.

## Recuperación / rollback

- `RETELL_ENABLED=false` en Worker detiene Cron antes de ejecutar; en Pages oculta la opción de suscripción.
- La creación/consulta de folio, dashboard, pagos, PDF y CRM siguen funcionando independientemente.
- No borrar las tablas V51 al revertir; conservan consentimiento y registro de auditoría. Eliminar el Worker Cron después de comprobar que no hay llamadas en curso y de desactivar sus flags.
- Restaurar el deployment anterior V46-R7 o V50 en Pages si se detecta una regresión. **No revertir D1 eliminando tablas sin plan de retención y respaldo.**

## Costos REALES y limitaciones

Cloudflare Workers Cron y D1 pueden mantenerse dentro de cuotas de planes gratuitos según volumen y uso; no es una garantía de costo fijo para volúmenes arbitrarios. Retell AI **sí cobra por uso**: tarifas publicadas de voz orientativas de US$0.07–0.31/minuto; un número de Retell puede costar aproximadamente US$2/mes, y pueden existir costos adicionales de telefonía y destino. Consultar precios y disponibilidad actuales de llamadas salientes a México antes de activar. No comprar número ni realizar llamadas sin presupuesto y autorización expresa.

- Fuente Retell: https://www.retellai.com/pricing
- Fuente Cloudflare: https://developers.cloudflare.com/workers/platform/pricing/ y https://developers.cloudflare.com/workflows/reference/pricing/
- API Retell: https://api.retellai.com/v2/create-phone-call y https://api.retellai.com/v2/get-call/{call_id} (solo se llama en backend)
- Falta integrar/validar un aviso de privacidad integral que cubra procesador de voz, transferencias internacionales, grabación/transcripción, retención, revocación y reglas aplicables de telemarketing en México. Estas decisiones no se suponen aprobadas.

## Qué NO hace esta entrega

No publica V51, no activa llamadas, no prueba Retell real, no cambia datos de pago, no introduce CRM, no registra automáticamente a clientes por ver PDF, no garantiza exactitud de la llamada a 3 minutos, no publica datos sensibles, no convierte un precio del test en anticipo contractual, no configura un número saliente real. Los resultados de QA son locales con D1 SQLite/Retell simulados.
