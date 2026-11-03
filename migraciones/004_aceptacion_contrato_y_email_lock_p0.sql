-- P0 staging aislado, luego GO legal + backup antes de D1 productiva. Ejecutar UNA vez, DESPUES de 003.
ALTER TABLE approved_quotes ADD COLUMN contract_text TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS quote_customer_acceptances_p0 (
 quote_id TEXT PRIMARY KEY REFERENCES approved_quotes(id),
 folio TEXT NOT NULL REFERENCES lead_cases(folio),
 offer_digest TEXT NOT NULL CHECK(length(offer_digest)=64),
 version TEXT NOT NULL,accepted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_quote_customer_acceptances_p0_folio ON quote_customer_acceptances_p0(folio);
CREATE TABLE IF NOT EXISTS customer_email_dispatch_lock_p0 (
 attempt_id TEXT PRIMARY KEY REFERENCES payment_attempts(id),
 status TEXT NOT NULL DEFAULT 'new' CHECK(status IN('new','sending','delivered')),
 last_started_at TEXT
);
