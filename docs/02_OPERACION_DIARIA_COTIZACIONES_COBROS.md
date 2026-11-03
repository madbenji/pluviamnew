# SOP operativo PLUVIAM — cotización, caja y seguimiento
## 1. Estados y responsables
| Etapa | Dueño operativo | Evidencia y salida |
| --- | --- | --- |
| Solicitud | Comercial | Folio D1, consentimiento válido, contacto sin filtrar datos |
| Visita/calificación | Ingeniería | Datos de inmueble y alcance medidos por técnico habilitado |
| Dos RFQ y BOM | Compras/Ingeniería | Comparables vigentes, costos de instalación, garantías, capacidad |
| Cotización | D05 Finanzas + D04 Jurídico | Margen, impuestos, plan de pagos, propuesta contractual, versión y vigencia |
| Aceptación | Cliente | Folio y clave; huella de condiciones exactas, hora registrada; firmas adicionales según revisión legal |
| Anticipo | Cliente/proveedor | Intento único y pago real consultado al proveedor/banco |
| Ejecución | Ingeniería/operaciones | Anticipo realmente conciliado, orden de trabajo y recursos confirmados |
| Hito adicional | Operaciones | Evidencia física de instalación + cobro 30% cuando aplique |
| QA y saldo | D14 QA + Finanzas | Acta QA, saldo según contrato, conciliación 50% o 20% |
| Garantía/CFDI | Finanzas/posventa | CFDI emitido conforme régimen, acta de entrega y garantía registrada (no automatizados por este código) |

## 2. Rutina diaria para pagos
- Al inicio y al final del día hábil, abrir `/admin.html` y el bloque **Pagos pendientes y alertas**, comparar intentos abiertos con reportes MP/BBVA/NOWPayments de la misma jornada; priorizar intentos con más de dos horas.
- `created`/`redirected`/`awaiting_bank` **no son ingresos**. Conciliar con extracto/consulta oficial antes de cualquier decisión. No conceder acceso a obra o producto por captura, retorno de checkout, WhatsApp o QR sin abono.
- Para cada `paid`, anotar importe exacto, comisión, neto liquidado, moneda, folio, identificador proveedor, banco de destino, hito, fecha y comprobante. Este código muestra importes esperados y estado; **no implementa aún un libro mayor contable con neto de comisiones**.
- Revisar notificaciones y correos pendientes; el correo es aviso, NO CFDI y NO garantía de entrega al buzón.
- Registrar devoluciones/contracargos/reversiones manualmente en el procedimiento de incidentes hasta que se implemente un workflow auditado completo de reversos en D1.

## 3. Políticas de cotización
- Nunca cobrar el cálculo ilustrativo. Nunca publicar 50% o una cifra ejemplo como presupuesto definitivo.
- Emplear dos RFQ verificables con los mismos supuestos; margen bruto/contribución y colchón de caja conforme al motor vigente; pruebas de costo real, flete, instalación, permisos, impuestos y garantía.
- Un cambio de monto, alcance o condiciones invalida la aceptación anterior y requiere nueva versión antes de cobrar.
- No comprometer plazos ni potabilidad sin ingeniería y pruebas reales. Antes del anticipo, no movilizar ejecución contractual.

## 4. Métricas mínimas semanales
`Leads válidos`, `visitas`, `cotizaciones con dos RFQ`, `aceptaciones`, `intentos iniciados`, `pagos conciliados`, `ingreso bruto real`, `neto de comisiones`, `cuentas por cobrar por hito`, `devoluciones/contracargos`, `obras QA`, `incidencias`, `margen de contribución real`, `tiempo a respuesta`. Fuente contable conciliada, no número de clics ni flag.
