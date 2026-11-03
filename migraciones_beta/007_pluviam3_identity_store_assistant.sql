-- PLUVIAM 3.0 integration layer for the isolated Preview database.
-- Synthetic seed data only. Never apply to the production DB binding.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS beta_identities (
  identity_id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin','ally','architect','customer')),
  ally_id TEXT,
  tenant_id TEXT NOT NULL,
  label TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0,1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ally_id) REFERENCES beta_allies(id)
);

CREATE INDEX IF NOT EXISTS idx_beta_identities_email_enabled ON beta_identities(email, enabled);

CREATE TABLE IF NOT EXISTS beta_cart_items (
  owner_scope TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 20),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (owner_scope, item_id),
  FOREIGN KEY (item_id) REFERENCES beta_catalog_items(id)
);

CREATE TABLE IF NOT EXISTS beta_membership_plans (
  plan_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_status TEXT NOT NULL DEFAULT 'DEMO_NO_PRICE',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1))
);

CREATE TABLE IF NOT EXISTS beta_memberships (
  id TEXT PRIMARY KEY,
  owner_scope TEXT NOT NULL,
  plan_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED','ACTIVE_BETA','CANCELLED')),
  payment_enabled INTEGER NOT NULL DEFAULT 0 CHECK (payment_enabled = 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_code) REFERENCES beta_membership_plans(plan_code),
  UNIQUE (owner_scope, plan_code)
);

CREATE TABLE IF NOT EXISTS beta_assistant_events (
  id TEXT PRIMARY KEY,
  actor_scope TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('web','app','admin')),
  intent TEXT NOT NULL,
  detail_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO beta_membership_plans(plan_code,name,description) VALUES
  ('HI-CARE-BASIC','HI Care · mantenimiento','Solicitud de mantenimiento para equipos PLUVIAM y multimarca; alcance sujeto a revisión.'),
  ('HI-CARE-FILTERS','HI Care · filtros','Recordatorio y reposición de consumibles; sin cobro en Preview.'),
  ('HI-CARE-MULTIBRAND','HI Care · multimarca','Limpieza, revisión, reparación o sustitución; sin promesa de disponibilidad.'),
  ('PLUVIAM-RECURRENT','PLUVIAM · recurrencia','Catálogo recurrente para validar expediente, inventario y cancelación.' );

-- Synthetic identities are explicit fixtures for local/closed-demo QA, not real accounts.
INSERT OR IGNORE INTO beta_identities(identity_id,email,role,ally_id,tenant_id,label) VALUES
  ('ID-BETA-ADMIN','admin@synthetic.pluviam.test','admin',NULL,'tenant-beta-ops','Operaciones beta sintéticas'),
  ('ID-BETA-FERNANDO','fernando@synthetic.pluviam.test','ally','AL-BETA-FERNANDO','tenant-beta-fernando','Fernando sintético'),
  ('ID-BETA-345','luis@synthetic.pluviam.test','ally','AL-BETA-345','tenant-beta-345','345 sintético'),
  ('ID-BETA-ARCHITECT','architect@synthetic.pluviam.test','architect',NULL,'tenant-beta-architect','Arquitecto sintético'),
  ('ID-BETA-CUSTOMER','customer@synthetic.pluviam.test','customer',NULL,'tenant-beta-customer','Cliente sintético');
