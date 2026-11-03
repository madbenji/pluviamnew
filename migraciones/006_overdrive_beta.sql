-- PLUVIAM OVERDRIVE BETA · D1 completamente aislada.
-- Aplicar únicamente en el binding DB_BETA de Preview. Nunca en DB productiva.
-- Todos los datos incluidos son sintéticos y no representan contratos ni aliados homologados.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS beta_access_grants (
  session_id TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','ally','architect','customer')),
  ally_id TEXT,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beta_allies (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  technical_contact TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('executor','referrer','executor_referrer')),
  status TEXT NOT NULL CHECK (status IN ('PENDING_VALIDATION','ACTIVE_BETA','SUSPENDED')),
  city TEXT NOT NULL,
  coverage_json TEXT NOT NULL,
  specialties_json TEXT NOT NULL,
  capacity_week INTEGER NOT NULL DEFAULT 0,
  capacity_status TEXT NOT NULL DEFAULT 'PENDING',
  rate_min_cents INTEGER,
  rate_max_cents INTEGER,
  rate_status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
  contract_status TEXT NOT NULL DEFAULT 'NOT_SIGNED',
  logo_publication_status TEXT NOT NULL DEFAULT 'NOT_AUTHORIZED',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beta_opportunities (
  id TEXT PRIMARY KEY,
  folio TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  city TEXT NOT NULL,
  responsible_role TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('NEW','DIAGNOSIS','DIAGNOSIS_COMPLETE','QUOTED','ASSIGNED','INSTALLATION','QA','CARE','CLOSED')),
  next_action TEXT NOT NULL,
  budget_estimate_cents INTEGER,
  expected_margin_bps INTEGER,
  consent_status TEXT NOT NULL CHECK (consent_status IN ('PENDING','GRANTED','REVOKED')),
  owner_scope TEXT NOT NULL,
  assigned_ally_id TEXT,
  diagnosis_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_ally_id) REFERENCES beta_allies(id)
);

CREATE TABLE IF NOT EXISTS beta_quotes (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  ally_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('REFERIDOR','INTEGRADOR')),
  client_price_incl_vat_cents INTEGER NOT NULL,
  vat_bps INTEGER NOT NULL DEFAULT 1600,
  materials_cents INTEGER NOT NULL DEFAULT 0,
  labor_cents INTEGER NOT NULL DEFAULT 0,
  engineering_cents INTEGER NOT NULL DEFAULT 0,
  transport_cents INTEGER NOT NULL DEFAULT 0,
  qa_cents INTEGER NOT NULL DEFAULT 0,
  warranty_cents INTEGER NOT NULL DEFAULT 0,
  cac_cents INTEGER NOT NULL DEFAULT 0,
  gateway_cents INTEGER NOT NULL DEFAULT 0,
  contingency_cents INTEGER NOT NULL DEFAULT 0,
  referral_fee_bps INTEGER NOT NULL DEFAULT 0,
  costs_verified INTEGER NOT NULL DEFAULT 0 CHECK (costs_verified IN (0,1)),
  capacity_confirmed INTEGER NOT NULL DEFAULT 0 CHECK (capacity_confirmed IN (0,1)),
  net_revenue_cents INTEGER NOT NULL,
  total_cost_cents INTEGER NOT NULL,
  contribution_cents INTEGER NOT NULL,
  contribution_margin_bps INTEGER NOT NULL,
  target_margin_bps INTEGER NOT NULL DEFAULT 2500,
  floor_margin_bps INTEGER NOT NULL DEFAULT 2000,
  minimum_price_incl_vat_cents INTEGER,
  status TEXT NOT NULL CHECK (status IN ('NO_GO','REVIEW','PRE_GO_REVIEW_CONTRACT','APPROVED')),
  status_reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  FOREIGN KEY (opportunity_id) REFERENCES beta_opportunities(id),
  FOREIGN KEY (ally_id) REFERENCES beta_allies(id)
);

CREATE INDEX IF NOT EXISTS idx_beta_quotes_opportunity ON beta_quotes(opportunity_id, created_at);

CREATE TABLE IF NOT EXISTS beta_work_orders (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  quote_id TEXT NOT NULL,
  ally_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING_INSTALLATION','IN_INSTALLATION','QA','QA_APPROVED','CLOSED')),
  qa_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (qa_status IN ('PENDING','PASSED','FAILED')),
  warranty_status TEXT NOT NULL DEFAULT 'PENDING',
  payments_enabled INTEGER NOT NULL DEFAULT 0 CHECK (payments_enabled IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES beta_opportunities(id),
  FOREIGN KEY (quote_id) REFERENCES beta_quotes(id),
  FOREIGN KEY (ally_id) REFERENCES beta_allies(id)
);

CREATE TABLE IF NOT EXISTS beta_catalog_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  price_status TEXT NOT NULL DEFAULT 'SIMULATED_NOT_PUBLIC',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE IF NOT EXISTS beta_orders (
  id TEXT PRIMARY KEY,
  owner_scope TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 20),
  status TEXT NOT NULL DEFAULT 'SIMULATED_NO_CHARGE' CHECK (status = 'SIMULATED_NO_CHARGE'),
  payment_enabled INTEGER NOT NULL DEFAULT 0 CHECK (payment_enabled = 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES beta_catalog_items(id)
);

CREATE TABLE IF NOT EXISTS beta_maintenance_requests (
  id TEXT PRIMARY KEY,
  owner_scope TEXT NOT NULL,
  opportunity_id TEXT,
  service_type TEXT NOT NULL CHECK (service_type IN ('FILTERS','TANK_CLEANING','REPAIR','REPLACEMENT','MULTIBRAND')),
  notes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW','ASSIGNED','COMPLETED')),
  payment_enabled INTEGER NOT NULL DEFAULT 0 CHECK (payment_enabled = 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (opportunity_id) REFERENCES beta_opportunities(id)
);

CREATE TABLE IF NOT EXISTS beta_events (
  id TEXT PRIMARY KEY,
  actor_session TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  detail_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO beta_access_grants(session_id,role,ally_id,label) VALUES
  ('beta-admin-synthetic','admin',NULL,'Operaciones beta sintéticas'),
  ('beta-fernando-synthetic','ally','AL-BETA-FERNANDO','Fernando / Rain Colecta · sintético'),
  ('beta-345-synthetic','ally','AL-BETA-345','Luis / 345 Ingeniería · sintético'),
  ('beta-architect-synthetic','architect',NULL,'Arquitecto referidor · sintético'),
  ('beta-customer-synthetic','customer',NULL,'Cliente · sintético');

INSERT OR IGNORE INTO beta_allies
  (id,display_name,legal_name,technical_contact,role,status,city,coverage_json,specialties_json,capacity_week,capacity_status,rate_min_cents,rate_max_cents,rate_status,contract_status,logo_publication_status)
VALUES
  ('AL-BETA-FERNANDO','Fernando / Rain Colecta','Rain Colecta · expediente beta','Fernando · contacto sintético','executor_referrer','PENDING_VALIDATION','Guadalajara','["Guadalajara","Zapopan"]','["diagnostico","captacion","mantenimiento"]',0,'PENDING',1500000,2000000,'PRELIMINARY_ONLY','NOT_SIGNED','NOT_AUTHORIZED'),
  ('AL-BETA-345','Luis / 345 Ingeniería','345 Ingeniería · expediente beta','Luis · contacto sintético','executor','PENDING_VALIDATION','Guadalajara','["Guadalajara","Zapopan","ZMG"]','["ingenieria","instalacion","QA"]',0,'PENDING',2500000,3000000,'HISTORICAL_BENCHMARK_ONLY','NOT_SIGNED','NOT_AUTHORIZED');

INSERT OR IGNORE INTO beta_catalog_items(id,name,category,description,price_cents,price_status) VALUES
  ('KIT-BETA-MODULAR','Kit modular de captación','kit','Configuración sintética para probar recomendaciones; requiere costos homologados.',0,'SIMULATED_NOT_PUBLIC'),
  ('FILTER-BETA-01','Filtro de reposición','consumible','Consumible sintético para probar recurrencia.',0,'SIMULATED_NOT_PUBLIC'),
  ('CARE-BETA-MULTIMARCA','HI Care multimarca','mantenimiento','Solicitud sintética de mantenimiento, sin cobro.',0,'SIMULATED_NOT_PUBLIC');

INSERT OR IGNORE INTO beta_opportunities
  (id,folio,source,city,responsible_role,status,next_action,budget_estimate_cents,expected_margin_bps,consent_status,owner_scope)
VALUES
  ('OP-BETA-001','FOLIO-BETA-001','beta_seed','Guadalajara','operations','NEW','Completar diagnóstico sintético',10000000,NULL,'GRANTED','beta-customer-synthetic');
