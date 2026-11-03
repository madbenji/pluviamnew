import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker from '../site/_worker.js';

class D1Adapter {
  constructor(db) { this.db = db; }
  prepare(sql) {
    const db = this.db;
    let args = [];
    return {
      bind(...values) { args = values; return this; },
      first() { return db.prepare(sql).get(...args) || null; },
      all() { return { results: db.prepare(sql).all(...args) }; },
      run() { const result = db.prepare(sql).run(...args); return { meta: { changes: Number(result.changes), last_row_id: Number(result.lastInsertRowid || 0) } }; },
    };
  }
  batch(statements) { return statements.map((statement) => statement.run()); }
}

function makeEnv() {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migraciones/006_overdrive_beta.sql', import.meta.url), 'utf8'));
  db.exec(readFileSync(new URL('../migraciones_beta/007_pluviam3_identity_store_assistant.sql', import.meta.url), 'utf8'));
  db.exec(readFileSync(new URL('../migraciones_beta/008_pluviam3_allies_avianny_actions.sql', import.meta.url), 'utf8'));
  return { BETA_MODE: 'true', BETA_ISOLATED: 'true', BETA_SYNTHETIC_MODE: 'true', BETA_ACCESS_DEFAULT_ROLE: 'customer', DB_BETA: new D1Adapter(db), ASSETS: { fetch: async () => new Response('asset') } };
}

async function call(env, path, session, body, method = body ? 'POST' : 'GET', extraHeaders = {}) {
  const headers = session ? { 'X-Beta-Session': session } : {};
  Object.assign(headers, extraHeaders);
  if (body) headers['Content-Type'] = 'application/json';
  const request = new Request(`https://beta.example${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const response = await worker.fetch(request, env);
  const payload = await response.json();
  return { status: response.status, payload };
}

const goodQuote = {
  mode: 'INTEGRADOR', clientPriceInclVatCents: 10000000, vatBps: 1600,
  materialsCents: 2500000, laborCents: 1800000, engineeringCents: 300000, transportCents: 200000,
  qaCents: 200000, warrantyCents: 100000, cacCents: 200000, gatewayCents: 100000, contingencyCents: 300000,
  referralFeeBps: 0, costsVerified: true, capacityConfirmed: true,
};

test('01 · status reports isolated beta and payments off', async () => {
  const r = await call(makeEnv(), '/api/beta/status');
  assert.equal(r.status, 200);
  assert.equal(r.payload.binding, 'DB_BETA');
  assert.equal(r.payload.productionBindingUsed, false);
  assert.equal(r.payload.paymentsEnabled, false);
  assert.equal(r.payload.diagnosticPaymentEnabled, false);
});

test('02 · unauthorized access is rejected', async () => {
  const r = await call(makeEnv(), '/api/beta/allies');
  assert.equal(r.status, 401);
});

test('03 · admin sees three founder-approved beta ally profiles with official Preview logos', async () => {
  const r = await call(makeEnv(), '/api/beta/allies', 'beta-admin-synthetic');
  assert.equal(r.status, 200);
  assert.deepEqual(r.payload.allies.map((x) => x.id), ['AL-BETA-345', 'AL-BETA-FERNANDO', 'AL-BETA-ISLA']);
  assert.ok(r.payload.allies.every((x) => x.publicLogo === true && x.logoLicenseStatus === 'FOUNDER_APPROVED_PREVIEW' && x.founderApprovalStatus === 'APPROVED_BY_FOUNDER'));
});

test('04 · customer creates a consented synthetic opportunity', async () => {
  const r = await call(makeEnv(), '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', responsibleRole: 'customer', ownerConsent: true, budgetEstimateCents: 10000000 });
  assert.equal(r.status, 201);
  assert.equal(r.payload.opportunity.consent_status, 'GRANTED');
  assert.match(r.payload.opportunity.folio, /^FOLIO-BETA-/);
});

test('05 · full synthetic project traverses diagnosis and assignment', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true, budgetEstimateCents: 10000000 });
  const opportunityId = created.payload.opportunity.id;
  const diagnosis = await call(env, '/api/beta/diagnosis', 'beta-customer-synthetic', { opportunityId, answers: { roofM2: 180, uses: ['riego', 'limpieza'], rainfallMm: 800, monthlyExpenseMxn: 5000, issues: ['pipas'] } });
  assert.equal(diagnosis.status, 200);
  assert.equal(diagnosis.payload.status, 'DIAGNOSIS_COMPLETE');
  const assigned = await call(env, `/api/beta/opportunities/${opportunityId}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  assert.equal(assigned.status, 200);
  assert.equal(assigned.payload.opportunity.assigned_ally_id, 'AL-BETA-345');
});

test('06 · ally isolation hides the assigned case from Fernando', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true });
  await call(env, `/api/beta/opportunities/${created.payload.opportunity.id}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  const fernando = await call(env, '/api/beta/opportunities', 'beta-fernando-synthetic');
  const luis = await call(env, '/api/beta/opportunities', 'beta-345-synthetic');
  assert.equal(fernando.payload.opportunities.length, 0);
  assert.equal(luis.payload.opportunities.length, 1);
});

test('07 · unverified costs produce NO-GO and cannot be approved', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true });
  const opportunityId = created.payload.opportunity.id;
  await call(env, `/api/beta/opportunities/${opportunityId}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  const quote = await call(env, '/api/beta/quotes', 'beta-345-synthetic', { opportunityId, ...goodQuote, costsVerified: false });
  assert.equal(quote.status, 201);
  assert.equal(quote.payload.quote.status, 'NO_GO');
  const approval = await call(env, `/api/beta/quotes/${quote.payload.quote.id}/approve`, 'beta-admin-synthetic', {});
  assert.equal(approval.status, 422);
});

test('08 · finance engine separates integrator economics and computes margin', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true });
  const opportunityId = created.payload.opportunity.id;
  await call(env, `/api/beta/opportunities/${opportunityId}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  const quote = await call(env, '/api/beta/quotes', 'beta-345-synthetic', { opportunityId, ...goodQuote });
  assert.equal(quote.payload.quote.mode, 'INTEGRADOR');
  assert.equal(quote.payload.quote.netRevenueCents, 8620690);
  assert.equal(quote.payload.quote.totalCostCents, 5700000);
  assert.ok(quote.payload.quote.contributionMarginBps > 2500);
  assert.equal(quote.payload.quote.status, 'PRE_GO_REVIEW_CONTRACT');
  assert.equal(quote.payload.quote.approved, false);
});

test('09 · work order is blocked until human approval', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true });
  const opportunityId = created.payload.opportunity.id;
  await call(env, `/api/beta/opportunities/${opportunityId}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  const quote = await call(env, '/api/beta/quotes', 'beta-345-synthetic', { opportunityId, ...goodQuote });
  const work = await call(env, '/api/beta/work-orders', 'beta-admin-synthetic', { quoteId: quote.payload.quote.id });
  assert.equal(work.status, 422);
});

test('10 · approved quote creates a non-paying work order and QA closes the loop', async () => {
  const env = makeEnv();
  const created = await call(env, '/api/beta/opportunities', 'beta-customer-synthetic', { source: 'direct_beta', city: 'Guadalajara', ownerConsent: true });
  const opportunityId = created.payload.opportunity.id;
  await call(env, `/api/beta/opportunities/${opportunityId}/assign`, 'beta-admin-synthetic', { allyId: 'AL-BETA-345' });
  const quote = await call(env, '/api/beta/quotes', 'beta-345-synthetic', { opportunityId, ...goodQuote });
  const approval = await call(env, `/api/beta/quotes/${quote.payload.quote.id}/approve`, 'beta-admin-synthetic', {});
  assert.equal(approval.status, 200);
  const work = await call(env, '/api/beta/work-orders', 'beta-admin-synthetic', { quoteId: quote.payload.quote.id });
  assert.equal(work.status, 201);
  assert.equal(work.payload.paymentsEnabled, false);
  const qa = await call(env, `/api/beta/work-orders/${work.payload.workOrderId}/qa`, 'beta-345-synthetic', { passed: true, evidence: 'Checklist sintético QA-001' });
  assert.equal(qa.status, 200);
  assert.equal(qa.payload.qaStatus, 'PASSED');
});

test('11 · store order is simulated and never enables payment', async () => {
  const env = makeEnv();
  const order = await call(env, '/api/beta/orders', 'beta-customer-synthetic', { itemId: 'FILTER-BETA-01', quantity: 1 });
  assert.equal(order.status, 201);
  assert.equal(order.payload.status, 'SIMULATED_NO_CHARGE');
  assert.equal(order.payload.paymentEnabled, false);
});

test('12 · HI Care request is created without a charge', async () => {
  const r = await call(makeEnv(), '/api/beta/maintenance', 'beta-customer-synthetic', { serviceType: 'MULTIBRAND', notes: 'Revisar mantenimiento beta sintético.' });
  assert.equal(r.status, 201);
  assert.equal(r.payload.status, 'PENDING_REVIEW');
  assert.equal(r.payload.paymentEnabled, false);
});

test('13 · private audit is visible only to operations', async () => {
  const env = makeEnv();
  const admin = await call(env, '/api/beta/events', 'beta-admin-synthetic');
  assert.equal(admin.status, 200);
  const ally = await call(env, '/api/beta/events', 'beta-345-synthetic');
  assert.equal(ally.status, 403);
});

test('14 · Cloudflare Access identity resolves server-side and synthetic header is disabled outside demo mode', async () => {
  const env = makeEnv();
  env.BETA_SYNTHETIC_MODE = 'false';
  const real = await call(env, '/api/beta/allies', '', undefined, 'GET', { 'Cf-Access-Authenticated-User-Email': 'admin@synthetic.pluviam.test' });
  assert.equal(real.status, 200);
  const forged = await call(env, '/api/beta/allies', 'beta-admin-synthetic');
  assert.equal(forged.status, 401);
});

test('15 · shared cart, membership request and Avianny demo write only to DB_BETA', async () => {
  const env = makeEnv();
  const cart = await call(env, '/api/beta/cart', 'beta-customer-synthetic', { itemId: 'FILTER-BETA-01', quantity: 2 });
  assert.equal(cart.status, 200);
  const membership = await call(env, '/api/beta/memberships', 'beta-customer-synthetic', { planCode: 'HI-CARE-FILTERS' });
  assert.equal(membership.status, 201);
  assert.equal(membership.payload.paymentEnabled, false);
  const assistant = await call(env, '/api/beta/assistant', 'beta-customer-synthetic', { channel: 'web', message: 'Necesito mantenimiento de filtros' });
  assert.equal(assistant.status, 200);
  assert.equal(assistant.payload.mode, 'DEMO_NO_CREDENTIAL');
  assert.equal(assistant.payload.executionMode, 'DB_BETA_TOOLS');
  assert.equal(assistant.payload.action.type, 'maintenance_request');
  assert.equal(assistant.payload.externalActionsEnabled, false);
});

test('16 · Access-authenticated unmapped user gets least-privilege customer tools', async () => {
  const env = makeEnv();
  const assistant = await call(env, '/api/beta/assistant', '', { channel: 'web', message: 'Prepara tres soluciones para mi propiedad' }, 'POST', { 'Cf-Access-Authenticated-User-Email': 'founder@example.test' });
  assert.equal(assistant.status, 200);
  assert.equal(assistant.payload.action.type, 'quote_draft');
  assert.equal(assistant.payload.action.offers.length, 3);
  const maintenance = await call(env, '/api/beta/assistant', '', { channel: 'web', message: 'Necesito mantenimiento de filtro' }, 'POST', { 'Cf-Access-Authenticated-User-Email': 'founder@example.test' });
  assert.equal(maintenance.status, 200);
  assert.equal(maintenance.payload.action.type, 'maintenance_request');
});
