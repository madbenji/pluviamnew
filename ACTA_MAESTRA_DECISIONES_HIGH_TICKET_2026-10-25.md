# PLUVIAM — Acta maestra de acuerdos, evaluación y cierre de producto
**Fecha del corte:** 25 de octubre de 2026 (CDMX). **Clasificación:** interna, privada, no publicada. **Estado:** candidato de desarrollo, NO certificado para cobrar. **Única web:** https://pluviam.pages.dev/.

Este acta conserva las propuestas detalladas aportadas por el fundador en la conversación (incluidas reflexiones de otro asistente sobre pagos, contratos, riesgos y posicionamiento *high-ticket*) y las separa de la capacidad operativa implementada o autorizada. No es una firma, contrato, autorización fiscal, prueba de pago ni consentimiento legal. No se activaron llamadas, pagos, correo a clientes, contratos, órdenes de obra ni servicios nuevos.

## 1. Principios inamovibles
1. Una **estimación basada en cinco preguntas** puede ofrecer rango orientativo de captación y de inversión, con supuestos visibles, **sin capturar datos identificables obligatorios**. El usuario sólo proporciona contacto voluntariamente cuando solicita atención o propuesta formal. La idea de «muro obligatorio antes del precio» fue considerada, pero se **descarta hasta autorización legal/UX documentada**: evita que una estrategia comercial anule minimización y consentimiento.
2. Una cifra redonda como **$100,000 MXN**, un anticipo de **$50,000 MXN**, autonomía porcentual, «congelación por 15 días» o ahorros/plusvalía no son ofertas ni promesas automáticas. El precio cerrado sólo puede emitirse después de ingeniería, alcance, BOM y al menos dos referencias RFQ recientes, IVA, garantía, costos y aceptación contractual. La vigencia deberá estipularse y estar respaldada por proveedores reales.
3. **Sin anticipo confirmado no se autorizan compras, suministro, inicio de instalación u otra ejecución onerosa del contrato.** El prediagnóstico y la valoración previa acordada son distintos de la obra. Ni regreso del checkout ni captura de pantalla equivalen a conciliación bancaria.
4. **No fabricar dependencia de piezas exclusivas ni bloquear agua, filtración sanitaria, bombeo crítico, seguridad, certificados aplicables ni garantías legales para presionar un pago.** Se pueden programar servicios complementarios verdaderamente opcionales y de valor independiente con aceptación y entrega claras. Una instalación contratada debe poder operar de manera segura conforme a su uso antes de declararla entregada.
5. La experiencia de «Mi proyecto» debe registrar avances verídicos, no inventar fechas, visita, ingeniero, compra de piezas o certificaciones.

## 2. Jornada comercial aprobada como dirección del producto
Diagnóstico orientativo y anónimo → resultado con rangos, supuestos y usos permitidos → contacto optativo y consentimiento separado → folio/clave individual → evaluación y visita autorizada → BOM, RFQ, alcance y responsable técnico → **propuesta formal** con precio y calendario firmado/aceptado → **cobro de anticipo mediante proveedor seguro** → conciliación por webhook firmado/banco → autorización de compra e instalación → pagos por hitos documentados → QA independiente y aceptación de entrega → factura, garantía aplicable, manual y mantenimiento.

El objetivo comercial «valor antes del precio» sí es compatible con lo anterior: presentar la arquitectura, los litros **estimados**, los límites del modelo y el rango económico antes de ofrecer una propuesta formal. No mostrar precio único falso ni activar compra impulsiva de obra aún no revisada.

## 3. Formas de pago por contrato, no por el visitante
- **Plan A: 50/50 (vigente histórico):** 50% tras propuesta válida y antes de ejecución; 50% cuando esté documentado el hito de QA/entrega previsto en contrato. Se conserva en la migración como *default* para expedientes anteriores.
- **Plan B: 50/30/20 (alternativa nueva):** 50% con contrato y antes de ejecución; 30% al hito **verificado** de instalación pactado; 20% contra QA/entrega y conformidad según condiciones legales. El cliente debe conocer la distribución completa antes de aceptar. No se cambia retroactivamente una orden ya iniciada.
- El cronograma, comprobantes y conciliación de cada hito se mantienen dentro del expediente, con importes originados en la propuesta aprobada en el servidor.
- **Mercado Pago:** CardPayment Brick como opción existente en el código; Stripe como checkout del proveedor; BBVA SPEI sólo si están validados titular, CLABE y referencia conciliable. MSI sólo si el emisor lo permite; criptomonedas y HaaS son fase futura.
- Un saldo impagado debe generar revisión humana, aviso contractual, ruta de solución/cancelación y evaluación de obligaciones mutuas. No hay cobro coactivo, suspensión arbitraria de derechos ni sanción automática. Los retrasos de la empresa también deben tener remedios justos.

## 4. Riesgos a incluir en revisión contractual (sin presumir validez legal)
- **Infraestructura preexistente/obra civil oculta:** delimitar tuberías, impermeabilización, estructura y bajantes asumidos; registrar hallazgos con fotografías autorizadas y **orden de cambio aprobada por escrito antes de cobrar trabajos adicionales**.
- **Variación de lluvias:** cifras de potencial por área y pluviosidad son estimados, no promesa de disponibilidad anual, autonomía total o ahorro. Definir usos no potables salvo validación sanitaria pertinente.
- **Garantía y mantenimiento:** entregar manual, periodicidades razonables, garantía legal y garantías de equipos. Los cuidados del usuario deben explicarse; **la omisión de mantenimiento no extingue automáticamente los derechos de garantía legales**. El plan de servicio es una venta opcional separada, no una condición de marketing engañosa.
- **Permisos en condominios y reglamentos:** enumerar qué debe gestionar propietario/administración y qué permisos/responsabilidades técnicas corresponden a PLUVIAM o instalador; confirmar antes de ejecución. No convertirlos en renuncia general a responsabilidad.
- **Cambios y cancelación:** distinguir etapas ya ejecutadas y costos **razonables, comprobables y proporcionales**, anticipos no devengados, reembolsos, defectos, retrasos imputables y mecanismos de solución/atención, con reciprocidad.
- **Propiedad y entrega:** reservar bienes o software opcional sólo cuando se determine su titularidad, instalación, riesgos, legislación y derechos aplicables. No presumir que todo bien instalado sigue siendo de PLUVIAM, ni usar candados que vulneren seguridad/suministro/garantías.

## 5. Situación del producto y cambios P0 preparados hoy
| Elemento | Antes de este corte | Ahora en código candidato (NO producción) | Requisito pendiente |
|---|---|---|---|
| Pagos | `PAYMENTS_ENABLED` figuraba `true` públicamente, sin QA de dinero | Gate nuevo `COMMERCE_GO_APPROVED=true` **además** de los controles anteriores; false de forma predeterminada | Desactivar `PAYMENTS_ENABLED` en Cloudflare **ahora**, merchant y webhooks testados, CEO GO y despliegue seguro |
| Cronograma 50/50 | Única opción implementada | Conservado | Contrato válido por expediente |
| Cronograma 50/30/20 | Idea sin implementación | Migración D1 aditiva `payment_plan`, motor de tres importes en centavos y validación de hitos; control administrativo por cotización; frontend de consulta y pago | QA D1 y firmas; hitos y evidencia física independiente |
| Mi proyecto | Aprobación, depósito y saldo | Muestra los hitos reales de la propuesta aprobada y sólo habilita el siguiente permitido | Acceso A/B y flujo contractual revisados |
| Mercado Pago en Inicio | Brick vinculado siempre a depósito | Ahora usa el hito elegible del servidor | Prueba de credenciales, aprobada/rechazada/pendiente, webhook, reembolso, conciliación |
| Comunicación al cliente | Solo alerta a operaciones probada | Cola de email postpago por folio/hito con control propio, idempotencia y correo sin clave privada | Dominio Resend verificado, texto legal, aprobación, prueba de entrega y reintentos reales |
| Pago no duplicado | Idempotencia de intentos y webhooks | Se conserva; la notificación intenta una vez por ID y reintentos operativos | QA concurrencia, reversos, reembolsos |
| Contrato/PDF | PDF informativo local + referencias guardadas por admin | Plantilla jurídica para negociación y hitos documentados | Firma/autenticación verificable, responsable fiscal y aceptación de cliente REAL |
| Privacidad | Página pública todavía declara borrador | Sin publicar texto «definitivo» ficticio; revisión legal requerida | Identidad completa y domicilio del responsable, aviso integral, transferencias/ARCO, autoridad y CEO GO |

## 6. Fase 2 (no habilitada)
Valeria/Retell telefónico y WhatsApp con opt-in específico y verificación de identidad; agenda conectada; carga privada de fotografías en R2 con control A/B; Academia G0–G3 real y red de proveedores; sensores IoT y mantenimiento predictivo; imágenes satelitales como dato editable; referidos; programas HaaS e integración de CRM multiagente. No convertir estos conceptos en servicios que parezcan estar operativos.

## 7. Criterios objetivos de GO, en orden
1. **Contención inmediata en Cloudflare:** `PAYMENTS_ENABLED=false` y verificación externa `GET /api/estado => payments:false`. Conservar web informativa; alinear flag `LEGAL_APPROVED` y captación con aprobación jurídica real.
2. **Fuente y rollback:** respaldar configuración actual y D1; verificar despliegue canónico exacto; migración `003_hitos_y_correos_p0.sql` únicamente en staging aislado antes de nuevo Worker; tests de A/B, acceso e idempotencia.
3. **Contrato y presupuesto:** entidad o persona física real, CFDI/IVA, aviso aprobado y consentimiento, RFQ/BOM, responsable técnico, calendario, reparaciones preexistentes, seguridad y aceptación digital verificable. **No aprobar una cotización mediante casillas de admin sin evidencia externa válida.**
4. **Pruebas pasarela:** tarjetas de sandbox, firma e idempotencia de webhook, pago pendiente/rechazado/aprobado, transacción autorizada de bajo monto y conciliación de balance/reembolso. No cobrar $10–$20 reales automáticamente: requiere consentimiento expreso y soporte del proveedor/entidad fiscal.
5. **Comunicaciones:** dominio remitente verificado, cola de confirmaciones de pago sin clave privada, reintento idempotente, prueba de entrega, factura por flujo fiscal apropiado; no equiparar email a CFDI.
6. **GO separados de CEO:** a) captación de datos, b) cobros, c) primera orden de obra; documentar qué se aprobó, cuándo, por quién y con qué evidencias.

**Referencias jurídicas para revisión humana:** Ley Federal de Protección de Datos Personales en Posesión de los Particulares (DOF 20-03-2025, revisar reformas vigentes) https://www.ordenjuridico.gob.mx/Documentos/Federal/html/wo125102.html ; Profeco contratos de adhesión https://www.gob.mx/profeco/documentos/contratos-de-adhesion-informate-antes-de-firmar .

## 8. Restricciones de esta entrega
No se generó un ZIP nuevo por la orden de congelar diseño y entregables ZIP. Los archivos modificados están en `site/`, la migración en `migraciones/` y las pruebas en `tests/`. **No desplegado, no claves reales, no transacciones reales, no llamadas, no formularios con datos de clientes, no correo enviado**. La copia de código proviene del candidato de coherencia anterior, no de una extracción autenticada del commit actualmente publicado.
