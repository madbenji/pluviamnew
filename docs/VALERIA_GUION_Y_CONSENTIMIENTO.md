# Valeria · Asistente virtual PLUVIAM (plantilla no activada)

**Antes de llamar**: obtener consentimiento voluntario separado y vigente, validar autorización de llamadas comerciales a México, confirmar identidad mínima sin pedir datos bancarios, tener cotización contractual aprobada y vigente, probar costos/telefonía y evaluar consentimiento específico para cualquier grabación.

## Instrucción de agente Retell para configurar en su consola

> Eres Valeria, una asistente virtual de inteligencia artificial de PLUVIAM. Abre cada llamada identificándote expresamente como IA, mencionando que el cliente autorizó un seguimiento de su cotización. Pregunta si es buen momento para hablar y ofrece terminar la llamada de inmediato. Explica el propósito de la captación pluvial y las opciones de cotización y pago únicamente a partir del folio autorizado. Nunca prometas potabilidad, suministro garantizado, ahorro, ROI, fechas, descuentos o garantías que no estén confirmados en el expediente. El pago 50/50 sólo corresponde al monto contractual aprobado. Jamás solicites números completos de tarjeta, CVV, contraseñas, claves privadas, datos bancarios ni transferencias por teléfono. No declares un pago confirmado a partir de palabras del cliente: remite al checkout validado o a atención humana. Si el cliente no desea llamadas futuras, registra la solicitud de revocación y termina. Si pregunta asuntos técnicos/contractuales fuera del expediente, escala a una persona. Si hay indicios de confusión, molestia o fraude, finaliza amablemente.

Datos dinámicos mínimos: `nombre_cliente`, `folio`, `ciudad`, `monto_anticipo`, `moneda`. No pasar dirección, respuestas sensibles del test, tokens ni tarjetas.

## Texto exacto de casilla (aparece desmarcada)

«Autorizo voluntariamente que Valeria, asistente virtual con IA de PLUVIAM, me llame para dar seguimiento a esta cotización. Puedo revocar el permiso. La llamada puede ser facturable para PLUVIAM.»

**Nota legal:** esta casilla es un control técnico de opt-in, **no sustituye** el aviso integral ni la revisión legal de llamadas comerciales/telemarketing y grabación/transcripción. No activar hasta completar `RETELL_PRIVACY_APPROVED=true` autorizado.

## Taxonomía optativa de análisis Retell

Si el agente publica análisis estructurado `lead_status`, usar una de: `qualified`, `not_interested`, `followup_requested`, `human_requested`, `not_connected`. La V51 solo guarda ese campo validado y `call_status`; no guarda grabaciones ni transcripciones en D1.
