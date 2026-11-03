# PLUVIAM — Propuesta técnica priorizada (ideas Gemini contrastadas)

**Regla:** arquitectura potencial, no capacidades actuales. El enfoque inmediato es conversión + privacidad + primera cotización real verificada. No hay GO M01 para cobros, llamadas automatizadas nuevas, credenciales ni fotoenvíos.

## P0 — Experiencia actual y seguridad

- Academia: separar perfil profesional de consumidor, mostrar disciplinas y responsabilidades (ya plasmado en candidato), homologación G0–G3 sólo cuando exista evaluador, identidad, seguro y práctica supervisada. Credenciales firmadas revocables; un NFT/POAP, de considerarse, sólo atestigua el dato que efectivamente verifica.
- Cotización: cinco hitos y dos rutas (ya plasmado); después del diagnóstico el cliente elige seguimiento voluntario. Si no hay registro seguro no se inventa folio. Ningún pago hasta alcance técnico firmado. **No subir fotos desde un formulario abierto.**
- R16/R18: verificar `accepting:false` antes de GO; aviso integral, permisos A/B, controls anti-IDOR, autentificación robusta, Turnstile, rate limits, cifrado, retención/ARCO, pruebas sintéticas, auditoría y rollback.

## P1 — Imágenes seguras en expediente (después de GO legal y técnico)

**Contrato propuesto:** desde `/mi-proyecto` ya autenticado, `POST /api/proyecto/adjuntos/presign` (folio + prueba de acceso robusta, scopes, cuota por expediente, consentimiento de imágenes); backend genera identificador opaco y URL R2 de corta vida para **subida de archivo exclusivamente** con tipo/tamaño permitido. Jamás exponer lista ni rutas R2 públicas. Estado `pendiente` hasta `POST .../confirmar`; confirmar extensión *y magic bytes*, límite de 4 imágenes por solicitud, 5 MiB por imagen, imagen real decodificable, sanitización EXIF/metadatos GPS, escaneo antimalware y transformación; enlazar a expediente D1 sólo cuando QA de acceso completo termine. Descarga siempre con autorización de proyecto y URL efímera. Conservar logs mínimos y política de retención/borrado; nunca compartir enlace por simple reconocimiento de teléfono. **Esto es blueprint, endpoints NO implementados**.

## P1/P2 — Valeria por WhatsApp

Usar API oficial de WhatsApp Business y consentimiento específico/opt-in, políticas de plantillas y ventanas de conversación. Vincular expediente con verificación adicional (OTP, sesión privada de Mi proyecto, folio + segundo factor), **nunca sólo por caller ID o número de teléfono**. Crear servicio de consulta autorizado de lectura limitada (`stage`, `nextStep`, próxima cita real), sin devolver dirección, pagos, clave privada o diagnósticos por simple número. Registrar trazabilidad, revocación/DNC, retención y un camino a asesor humano. Prueba con dos expedientes A/B antes del primer mensaje. Valeria Retell telefónica actual no equivale a canal oficial WhatsApp.

## P2 — Pago autorizado de propuesta, no débito arbitrario

Mercado Pago admite pagos puntuales con tarjeta guardada (Card-on-File) y cobros iniciados por cliente; también existen operaciones MIT con condiciones de consentimiento. No significa que hoy PLUVIAM pueda guardar tarjetas o cargar un anticipo automático. El flujo correcto: propuesta técnica y costos aprobados → contrato/versionado y factura/comprobante → cliente autenticado revisa importe/hito → acepta términos y **autoriza explícitamente el cargo concreto** → tokenización exclusivamente del PSP → clave de idempotencia, bloqueo transaccional, conciliación del webhook y confirmación antifraude → liberación de orden sólo después de saldo *realmente confirmado* y de las puertas técnicas/contractuales. Para primer lanzamiento elegir checkout seguro por hito, sin guardar tarjeta. Habilitar Card-on-File posteriormente con cumplimiento del procesador y opción de eliminar medio guardado.

Referencia oficial: https://www.mercadopago.com.mx/developers/es/docs/automatic-payments/recurring-charges

## P2 — Imagen satelital como asistencia, no auditoría milimétrica

Un código postal no identifica un techo. Una imagen satelital puede sugerir polígonos aproximados si cobertura/resolución/fecha lo permiten; debe distinguir aleros, obstáculos, pendiente, estructuras, servidumbres y cubierta utilizable. El clima histórico mensual y el volumen efectivamente **capturable** requieren validación regional y coeficientes revisables, no equivalen a litros exactos sin medición ni a disponibilidad anual garantizada. Sólo ofrecer «área sugerida» con edición manual, fuente de datos, incertidumbre y aviso de privacidad para ubicación exacta; permitir continuar sin dirección. Prototipo con parcelas ficticias y permiso de geocodificación antes de contratar APIs.

## P3 — Tablero IoT y embajadores

IoT: necesita hardware, fuente de energía, cobertura, calibración, mantenimiento, consentimiento, telemetría cifrada y controles de acceso. Separar precipitación del techo, litros entrantes, litros en tanque, consumo sustituido y **ahorro económico validado**; no mostrar ahorro ni CO2 "en vivo" sin contadores ni método reconocido. Programa embajadores: sólo tras instalaciones completas, margen real, reglas antifraude, presupuesto y términos fiscales; evitar derivar links públicos de folio o clave privada. Separar códigos de referido aleatorios.

## Secuencia de lanzamiento recomendada

1. **Ahora, sin producción:** QA comercial de Academia/Cotización + Portal ya existente + protección de la versión publicada.
2. **Primer GO real:** aviso/permiso A/B → expediente autenticado → subida segura de fotos por invitación → generación de propuesta verificable.
3. **Después de una cotización pagada y QA real:** checkout cliente autoriza cada cargo; tracking de hitos y oferta de mantenimiento.
4. **Cuando exista demanda/operación:** WhatsApp oficial de lectura mínima y agenda confirmada; satélite como asistencia opcional.
5. **Con instalaciones instrumentadas:** telemetría y programa de recomendaciones sin promesas especulativas.
