# Migración D1 P0 — no ejecutar sin respaldo y GO

Incluye `payment_plan` y `customer_payment_notifications_v1`. Ejecución una sola vez, primero D1 staging aislado; si columna existe, no repetir.

```sql
-- P0 · ejecutar SOLO en DB aislada primero. Backup antes de producción y previa aprobación D01/D14.
-- ALTER es aditivo; ejecutar una sola vez en la base de destino tras verificar columnas.
ALTER TABLE approved_quotes ADD COLUMN payment_plan TEXT NOT NULL DEFAULT '50-50'
  CHECK(payment_plan IN ('50-50','50-30-20'));
CREATE TABLE IF NOT EXISTS customer_payment_notifications_v1 (
 attempt_id TEXT PRIMARY KEY REFERENCES payment_attempts(id),
 folio TEXT NOT NULL REFERENCES lead_cases(folio),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted_by_provider')),
 attempts INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_payment_notifications_v1_status
 ON customer_payment_notifications_v1(status,created_at);

```
