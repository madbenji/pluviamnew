# Auditoría de estandarización PLUVIAM V52 — 24/oct/2026

## Hallazgos
- **C1 (corregido):** expediente guardaba respuestas, no resultados históricos. Se añade snapshot calculado y versionado en Worker.
- **C2 (corregido):** ejemplo de techo duplicado en dos lugares del frontend y separado del backend. Se centraliza usando el motor.
- **C3 (corregido):** respuesta tardía de `/api/diagnostico` podía actualizar el precio si solo cambiaba el techo. Se valida ID de petición, techo y potencial.
- **C4 (corregido):** desglose ilustrativo redondeado por componente podía diferir del total. Se ajusta última línea al residuo exacto.
- **C5 (corregido):** `Otra ciudad` más CP podía mostrar la etiqueta postal repetida; ahora se guarda una sola vez y el servidor lo valida.
- **C6 (mejorado):** todos los datos económicos del lead se vuelven a cotejar con las cinco preguntas y se rechaza si se altera techo de ejemplo, ciudad, gasto, almacenamiento, problemas o respuestas duplicadas.
- **C7 (protegido):** D1 del cliente ya no depende de volver a ejecutar la fórmula; el nuevo snapshot se recupera por `/api/proyecto` con folio+clave correctos.

## Veredictos
- Precio de contrato, cobros y cronograma comercial: **SIN CAMBIOS**. No se altera la matriz aprobada o sus importes ilustrativos.
- **No se garantiza ahorro ni años de recuperación**: el cuestionario no pregunta demanda sustituible, tarifa evitable o mantenimiento medidos. `null` es el resultado matemáticamente correcto.
- Los datos **no son climatología local**: 800 mm y 75 % son parámetros fijos ilustrativos. Recalibración geográfica futura requiere una fuente confiable y modelo técnico validado.
- El desglose de costos (recibo, pipas, garrafones, sarro) es ficticio e ilustrativo; no es un registro individual.
- Clientes históricos V51 o anteriores permanecen en D1 sin snapshot y no se reescriben retroactivamente.

## QA resumido
Ver `tests/QA_V52.json`; `tests/test_v52.mjs` y `tests/compare_v51_v52.mjs` son reproducibles sin red, credenciales ni datos reales.

**Gates sin verificar**: API y DB Cloudflare reales, seguridad de aislamiento multiusuario, navegador móvil real, cifras validadas por ingeniería, finalización de cotización y cobro sandbox. No publicar cambios de producción sin autorización.
