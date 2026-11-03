-- Ejecutar en la misma D1 existente, previa copia de seguridad, solo con autorización.
CREATE TABLE IF NOT EXISTS project_documents_v50 (
 id TEXT PRIMARY KEY,folio TEXT NOT NULL,kind TEXT NOT NULL,title TEXT NOT NULL,body TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(folio) REFERENCES lead_cases(folio));
CREATE INDEX IF NOT EXISTS idx_project_documents_v50_folio ON project_documents_v50(folio,created_at);
CREATE TABLE IF NOT EXISTS project_events_v50 (
 id TEXT PRIMARY KEY,folio TEXT NOT NULL,event_type TEXT NOT NULL,description TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(folio) REFERENCES lead_cases(folio));
CREATE INDEX IF NOT EXISTS idx_project_events_v50_folio ON project_events_v50(folio,created_at);
-- Activar PROJECT_DOCS_ENABLED=true únicamente después de migrar y probar aislamiento entre dos folios.

-- Métricas comerciales agregadas, sin IP, cookies ni datos de identificación de cliente.
CREATE TABLE IF NOT EXISTS analytics_events_v50 (
 id TEXT PRIMARY KEY, event_type TEXT NOT NULL CHECK(event_type IN
 ('cotizacion_solicitada','cotizacion_aprobada','anticipo_confirmado','saldo_liquidado','proyecto_activado')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_analytics_events_v50_type ON analytics_events_v50(event_type,created_at);
-- Activar ANALYTICS_ENABLED=true solo tras revisión de privacidad y QA.
