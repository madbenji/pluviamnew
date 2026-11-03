-- PLUVIAM V51: aditiva. Ejecutar ÚNICAMENTE después de respaldo de D1 y QA en staging.
-- No modifica ni elimina tablas V46/V50.
CREATE TABLE IF NOT EXISTS retell_consents_v51 (
 folio TEXT PRIMARY KEY REFERENCES lead_cases(folio),
 granted INTEGER NOT NULL DEFAULT 0 CHECK(granted IN(0,1)),
 consent_version TEXT NOT NULL,
 granted_at TEXT,
 revoked_at TEXT,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS retell_followups_v51 (
 id TEXT PRIMARY KEY,
 folio TEXT NOT NULL REFERENCES lead_cases(folio),
 quote_id TEXT NOT NULL UNIQUE REFERENCES approved_quotes(id),
 status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','deferred','claimed','sent','completed','cancelled','ineligible','uncertain','failed')),
 scheduled_at TEXT NOT NULL,
 claimed_at TEXT,
 retell_call_id TEXT,
 call_status TEXT,
 call_outcome TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 last_error TEXT,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_retell_v51_due ON retell_followups_v51(status,scheduled_at);
CREATE INDEX IF NOT EXISTS idx_retell_v51_folio ON retell_followups_v51(folio,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_retell_v51_call_id ON retell_followups_v51(retell_call_id) WHERE retell_call_id IS NOT NULL;
-- Nunca registrar claves privadas de seguimiento ni datos de pago en las tablas de llamadas.
