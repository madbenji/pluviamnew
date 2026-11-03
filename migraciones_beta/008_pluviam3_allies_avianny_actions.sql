-- PLUVIAM 3.0 visual network and Avianny action layer.
-- Preview DB_BETA only. All records remain synthetic and payments/external channels stay off.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS beta_ally_profiles (
  ally_id TEXT PRIMARY KEY,
  founder_approval_status TEXT NOT NULL DEFAULT 'PENDING',
  relationship_type TEXT NOT NULL,
  zone TEXT NOT NULL,
  public_summary TEXT NOT NULL,
  logo_asset_path TEXT,
  logo_license_status TEXT NOT NULL DEFAULT 'ASSET_OR_LICENSE_PENDING',
  logo_alt TEXT NOT NULL,
  cta_label TEXT NOT NULL DEFAULT 'Ver expediente beta',
  FOREIGN KEY (ally_id) REFERENCES beta_allies(id)
);

CREATE TABLE IF NOT EXISTS beta_quote_drafts (
  id TEXT PRIMARY KEY,
  owner_scope TEXT NOT NULL,
  opportunity_id TEXT,
  source TEXT NOT NULL,
  offers_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','REVIEWED','CANCELLED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES beta_opportunities(id)
);

INSERT OR IGNORE INTO beta_allies
  (id,display_name,legal_name,technical_contact,role,status,city,coverage_json,specialties_json,capacity_week,capacity_status,rate_min_cents,rate_max_cents,rate_status,contract_status,logo_publication_status)
VALUES
  ('AL-BETA-ISLA','Isla Urbana','Isla Urbana · expediente beta','Contacto sintético · Isla Urbana','executor_referrer','PENDING_VALIDATION','Ciudad de México','["Ciudad de México","Valle de México"]','["captacion","educacion","sistemas urbanos"]',0,'PENDING',NULL,NULL,'PENDING_VERIFICATION','NOT_SIGNED','NOT_AUTHORIZED');

INSERT OR IGNORE INTO beta_access_grants(session_id,role,ally_id,label) VALUES
  ('beta-isla-synthetic','ally','AL-BETA-ISLA','Isla Urbana · sintético');

INSERT OR IGNORE INTO beta_identities(identity_id,email,role,ally_id,tenant_id,label) VALUES
  ('ID-BETA-ISLA','isla@synthetic.pluviam.test','ally','AL-BETA-ISLA','tenant-beta-isla','Isla Urbana sintética');

INSERT OR IGNORE INTO beta_ally_profiles
  (ally_id,founder_approval_status,relationship_type,zone,public_summary,logo_asset_path,logo_license_status,logo_alt,cta_label)
VALUES
  ('AL-BETA-ISLA','APPROVED_BY_FOUNDER','Tecnología / aliado de red','CDMX · Valle de México','Perfil aprobado por el fundador para la Preview. La relación contractual, cobertura y G0 operativo siguen en validación.','/ally-isla-urbana.svg', 'FOUNDER_APPROVED_PREVIEW','Logotipo oficial de Isla Urbana','Abrir ficha de Isla Urbana'),
  ('AL-BETA-FERNANDO','APPROVED_BY_FOUNDER','Aliado técnico / referidor','Guadalajara · Zapopan','Fernando / Rain Colecta aprobado por el fundador para la Preview. Tarifas, capacidad, contrato y cobertura se muestran sólo en entorno sintético.','/ally-raincolecta.svg', 'FOUNDER_APPROVED_PREVIEW','Logotipo oficial de Rain Colecta','Abrir ficha de Rain Colecta'),
  ('AL-BETA-345','APPROVED_BY_FOUNDER','Ingeniería / instalación','Guadalajara · ZMG','345 Ingeniería / Luis aprobado por el fundador para la Preview. G0, RFQ, capacidad y contrato requieren validación antes de asignar obra real.','/ally-345-ingenieria.svg', 'FOUNDER_APPROVED_PREVIEW','Logotipo oficial de 345 Ingeniería','Abrir ficha de 345 Ingeniería');
