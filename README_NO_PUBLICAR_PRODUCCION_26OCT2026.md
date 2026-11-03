# PLUVIAM · Cierre de conciliación bancaria y controles · 26-oct-2026

## ⛔ NO PUBLICAR EN PRODUCCIÓN / NO SUSTITUIR `pluviam.pages.dev`

**Este ZIP es un candidato técnico de staging, no el código fuente completo y sincronizado con el sitio público.** El sitio público ya muestra `/pagar`, menciona Mercado Pago/SPEI, BBVA y NOWPayments/cripto, pero **esta base histórica no incluye `/pagar.html` ni el motor NOWPayments**. Reemplazar la web con esta versión eliminaría el portal que ya está publicado. El trabajo en este paquete **no configura cuentas, no realiza cobros ni modifica Cloudflare**.

### Modificaciones propias de este cierre

- UI de conciliación bancaria verificada dentro de `site/admin.html` y `site/admin.js`, con referencia, movimiento bancario único, monto exacto y aprobación explícita.
- Protección del Worker para BBVA, con `BANK_ACCOUNT_VERIFIED`, cuenta/beneficiario presentes y verificación del índice único de D1; fail closed.
- Conciliación con comparación estricta de monto, rechazo de abonos repetidos y actualización transaccional condicionada al estado original.
- Migración `migraciones/005_bbva_evidencia_unica_p0.sql` con índice parcial único. Respaldar antes de usarla, verificar duplicados antes de migrar y ejecutar una vez en entorno de staging aislado.
- Pruebas `tests/test_bbva_conciliacion_p0.mjs` con 18 aserciones sintéticas: acceso de administrador, verificación bancaria, monto exacto, ID del movimiento, duplicados y creación de outbox. No hubo ninguna transferencia real.
- Endpoint de salud admin informa `bbvaVerificado`.

### Faltantes bloqueantes (no resueltos por este paquete)

1. Recuperar y comparar con producción el código del portal `/pagar` y los 50 archivos de su versión, especialmente endpoints, funciones y recepción segura de NOWPayments.
2. Mantener `PAYMENTS_ENABLED=false`, `COMMERCE_GO_APPROVED=false`, `BANK_PAYMENT_ENABLED=false` y `BANK_ACCOUNT_VERIFIED=false` mientras no exista GO escrito de QA, jurídico, finanzas y titular.
3. Aprobar aviso integral y términos contractuales con titular de cobro verdadero; controlar captación real de solicitudes.
4. Validar titular BBVA y CLABE con titular fiscal/merchant, extractos bancarios y conciliación, sin publicar datos no verificados.
5. Configurar credenciales de Mercado Pago y NOWPayments **solo en Cloudflare Secret**, IPNs/webhooks, allowlisting necesaria, antifraude y conciliación por referencia externa.
6. Staging aislado (D1 separada, credenciales sandbox y URL callback separada); ejecutar tests de aprobación, rechazo, pendiente, reverso, expiración, reinicio/duplicado, abono parcial y reembolso.
7. Solo tras prueba real autorizada, backup del despliegue publicado, rollback probado, conciliación contable y aprobación formal de producción.

### Comandos QA del paquete

```bash
node --check site/_worker.js
node --check site/admin.js
node tests/test_bbva_conciliacion_p0.mjs
node tests/test_p0_4_gates_e2e_mock.mjs
node tests/test_p0_hitos_2026.mjs
node tests/test_branded_pdf_v1.mjs
```

**Compatibilidad:** `tests/test_integral_ux.mjs` tiene una aserción histórica de hash del Worker que exige no cambiar el backend. Falla de forma esperada por los cambios de seguridad deliberados, no demuestra una regresión de un flujo de negocio. Debe modernizarse como prueba semántica sin afirmar un PASS falso.

**No introducir datos de clientes reales en las pruebas. No guardar claves privadas en Git, Drive público ni chats.**
