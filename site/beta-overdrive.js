const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const ROLES = new Set(['admin', 'ally', 'architect', 'customer']);
const MODES = new Set(['REFERIDOR', 'INTEGRADOR']);
const SERVICE_TYPES = new Set(['FILTERS', 'TANK_CLEANING', 'REPAIR', 'REPLACEMENT', 'MULTIBRAND']);
const BETA_VAT_BPS = 1600;
const TARGET_MARGIN_BPS = 2500;
const FLOOR_MARGIN_BPS = 2000;

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
const text = (value, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const integer = (value, min = 0, max = 1000000000000) => Number.isInteger(value) && value >= min && value <= max;
const id = (prefix) => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`;
const money = (value) => Math.round(Number(value) || 0);

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

export function calculateQuote(input = {}) {
  const mode = MODES.has(input.mode) ? input.mode : '';
  const price = money(input.clientPriceInclVatCents);
  const vatBps = integer(input.vatBps, 0, 5000) ? input.vatBps : BETA_VAT_BPS;
  const referralFeeBps = integer(input.referralFeeBps, 0, 5000) ? input.referralFeeBps : 0;
  const operating = ['materialsCents', 'laborCents', 'engineeringCents', 'transportCents', 'qaCents', 'warrantyCents', 'contingencyCents']
    .reduce((sum, key) => sum + money(input[key]), 0);
  const cac = money(input.cacCents);
  const gateway = money(input.gatewayCents);
  const netRevenue = Math.round(price / (1 + vatBps / 10000));
  const referralRevenue = Math.round(netRevenue * referralFeeBps / 10000);
  const revenue = mode === 'REFERIDOR' ? referralRevenue : netRevenue;
  const referralCost = mode === 'INTEGRADOR' ? referralRevenue : 0;
  const totalCost = (mode === 'REFERIDOR' ? 0 : operating) + cac + gateway + referralCost;
  const contribution = revenue - totalCost;
  const marginBps = revenue > 0 ? Math.floor(contribution * 10000 / revenue) : -10000;
  let minimumPriceInclVatCents = null;
  if (mode === 'INTEGRADOR') {
    const denominator = 1 - referralFeeBps / 10000 - TARGET_MARGIN_BPS / 10000;
    if (denominator > 0) minimumPriceInclVatCents = Math.ceil(((operating + cac + gateway) / denominator) * (1 + vatBps / 10000));
  } else {
    const denominator = referralFeeBps / 10000 - TARGET_MARGIN_BPS / 10000;
    if (denominator > 0) minimumPriceInclVatCents = Math.ceil((cac + gateway) / denominator * (1 + vatBps / 10000));
  }
  let status = 'PRE_GO_REVIEW_CONTRACT';
  let statusReason = 'Cálculo supera el objetivo de contribución; requiere revisión contractual humana.';
  if (!mode || price <= 0) { status = 'NO_GO'; statusReason = 'Modalidad o precio inválido.'; }
  else if (!input.costsVerified || !input.capacityConfirmed) { status = 'NO_GO'; statusReason = 'NO-GO: costo o capacidad del proveedor no está verificado.'; }
  else if (contribution <= 0 || marginBps < FLOOR_MARGIN_BPS) { status = 'NO_GO'; statusReason = 'NO-GO: contribución negativa o por debajo del piso de 20%.'; }
  else if (marginBps < TARGET_MARGIN_BPS) { status = 'REVIEW'; statusReason = 'REVISIÓN: supera el piso de 20% pero no alcanza el objetivo inicial de 25%.'; }
  return {
    mode, vatBps, clientPriceInclVatCents: price, netRevenueCents: netRevenue,
    revenueCents: revenue, operatingCostCents: operating, cacCents: cac, gatewayCents: gateway,
    referralCostCents: referralCost, totalCostCents: totalCost, contributionCents: contribution,
    contributionMarginBps: marginBps, targetMarginBps: TARGET_MARGIN_BPS, floorMarginBps: FLOOR_MARGIN_BPS,
    minimumPriceInclVatCents, status, statusReason,
  };
}

function betaReady(env) {
  return env?.BETA_MODE === 'true' && env?.BETA_ISOLATED === 'true' && !!env?.DB_BETA;
}

async function bodyJson(request, max = 12000) {
  const raw = await request.text();
  if (raw.length > max) throw new Error('Solicitud demasiado grande');
  const value = JSON.parse(raw || '{}');
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('JSON inválido');
  return value;
}

async function grantFor(request, db) {
  const header = request.headers.get('X-Beta-Session') || request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!header || header.length > 120) return null;
  const row = await db.prepare('SELECT session_id,role,ally_id,label FROM beta_access_grants WHERE session_id=? AND enabled=1').bind(header).first();
  return row && ROLES.has(row.role) ? row : null;
}

function canView(grant, opportunity) {
  return grant.role === 'admin' || opportunity.owner_scope === grant.session_id || (grant.role === 'ally' && opportunity.assigned_ally_id === grant.ally_id);
}

async function event(db, grant, entityType, entityId, eventType, detail = {}) {
  await db.prepare('INSERT INTO beta_events(id,actor_session,entity_type,entity_id,event_type,detail_json) VALUES(?,?,?,?,?,?)')
    .bind(id('EVT-BETA'), grant.session_id, entityType, entityId, eventType, JSON.stringify(detail)).run();
}

async function opportunity(db, opportunityId) {
  return db.prepare('SELECT o.*,a.display_name AS ally_name FROM beta_opportunities o LEFT JOIN beta_allies a ON a.id=o.assigned_ally_id WHERE o.id=?').bind(opportunityId).first();
}

async function allies(request, env, grant) {
  const rows = grant.role === 'admin'
    ? await env.DB_BETA.prepare('SELECT * FROM beta_allies ORDER BY id').all()
    : await env.DB_BETA.prepare('SELECT * FROM beta_allies WHERE id=?').bind(grant.ally_id).all();
  return json({ allies: (rows.results || []).map((row) => ({ ...row, coverage: safeJson(row.coverage_json, []), specialties: safeJson(row.specialties_json, []), publicLogo: false, publicStatus: 'NO PUBLICABLE' })) });
}

async function opportunities(env, grant) {
  const rows = await env.DB_BETA.prepare('SELECT o.*,a.display_name AS ally_name FROM beta_opportunities o LEFT JOIN beta_allies a ON a.id=o.assigned_ally_id ORDER BY o.created_at DESC').all();
  const visible = (rows.results || []).filter((row) => canView(grant, row)).map((row) => ({
    ...row, publicDataOnly: true, budgetEstimateMxn: row.budget_estimate_cents == null ? null : row.budget_estimate_cents / 100,
  }));
  return json({ opportunities: visible });
}

async function catalog(env) {
  const rows = await env.DB_BETA.prepare('SELECT id,name,category,description,price_status FROM beta_catalog_items WHERE active=1 ORDER BY id').all();
  return json({ catalog: rows.results || [], paymentEnabled: false, note: 'Catálogo de beta: precios no publicados y pedidos simulados.' });
}

export async function handleBetaRequest(request, env, path) {
  if (!path.startsWith('/api/beta/')) return null;
  if (!betaReady(env)) return json({ error: 'Beta aislada no configurada. No se usa DB productiva.' }, 503);
  const db = env.DB_BETA;
  if (path === '/api/beta/status' && request.method === 'GET') {
    return json({ enabled: true, environment: 'isolated-preview', binding: 'DB_BETA', productionBindingUsed: false, dataMode: 'synthetic-only', paymentsEnabled: false, diagnosticPaymentEnabled: false, emailsEnabled: false, aiMode: 'MOCK', logosPublic: false, noRealInvitations: true });
  }
  const grant = await grantFor(request, db);
  if (!grant) return json({ error: 'Sesión beta sintética requerida.' }, 401);
  if (path === '/api/beta/allies' && request.method === 'GET') return allies(request, env, grant);
  if (path === '/api/beta/catalog' && request.method === 'GET') return catalog(env);
  if (path === '/api/beta/opportunities' && request.method === 'GET') return opportunities(env, grant);
  if (path === '/api/beta/events' && request.method === 'GET') {
    if (grant.role !== 'admin') return json({ error: 'Sólo operaciones beta.' }, 403);
    const rows = await db.prepare('SELECT * FROM beta_events ORDER BY created_at DESC LIMIT 100').all();
    return json({ events: rows.results || [] });
  }
  if (path === '/api/beta/orders' && request.method === 'GET') {
    const rows = grant.role === 'admin' ? await db.prepare('SELECT * FROM beta_orders ORDER BY created_at DESC').all() : await db.prepare('SELECT * FROM beta_orders WHERE owner_scope=? ORDER BY created_at DESC').bind(grant.session_id).all();
    return json({ orders: rows.results || [], paymentsEnabled: false });
  }
  if (path === '/api/beta/maintenance' && request.method === 'GET') {
    const rows = grant.role === 'admin' ? await db.prepare('SELECT * FROM beta_maintenance_requests ORDER BY created_at DESC').all() : await db.prepare('SELECT * FROM beta_maintenance_requests WHERE owner_scope=? ORDER BY created_at DESC').bind(grant.session_id).all();
    return json({ requests: rows.results || [], paymentsEnabled: false });
  }

  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  let value;
  try { value = await bodyJson(request); } catch (error) { return json({ error: error.message }, 400); }

  if (path === '/api/beta/opportunities') {
    if (!['admin', 'architect', 'customer'].includes(grant.role)) return json({ error: 'Rol no autorizado.' }, 403);
    if (value.ownerConsent !== true) return json({ error: 'Se requiere consentimiento de propietario para atribuir la oportunidad.' }, 422);
    const city = text(value.city, 80), source = text(value.source, 60), role = text(value.responsibleRole || grant.role, 50);
    if (!city || !source) return json({ error: 'Ciudad y fuente son obligatorias.' }, 422);
    const opportunityId = id('OP-BETA'), folio = `FOLIO-BETA-${opportunityId.slice(-12).toUpperCase()}`;
    await db.prepare('INSERT INTO beta_opportunities(id,folio,source,city,responsible_role,status,next_action,budget_estimate_cents,expected_margin_bps,consent_status,owner_scope) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
      .bind(opportunityId, folio, source, city, role, 'NEW', 'Completar diagnóstico sintético', integer(value.budgetEstimateCents, 0) ? value.budgetEstimateCents : null, null, 'GRANTED', grant.session_id).run();
    await event(db, grant, 'opportunity', opportunityId, 'created', { source, city });
    return json({ ok: true, opportunity: await opportunity(db, opportunityId) }, 201);
  }

  if (path === '/api/beta/diagnosis') {
    const row = await opportunity(db, text(value.opportunityId, 120));
    if (!row || !canView(grant, row)) return json({ error: 'Oportunidad no disponible para esta sesión.' }, 404);
    const answers = value.answers && typeof value.answers === 'object' ? {
      roofM2: money(value.answers.roofM2), uses: Array.isArray(value.answers.uses) ? value.answers.uses.slice(0, 5).map((x) => text(x, 30)) : [],
      rainfallMm: money(value.answers.rainfallMm), monthlyExpenseMxn: money(value.answers.monthlyExpenseMxn), issues: Array.isArray(value.answers.issues) ? value.answers.issues.slice(0, 6).map((x) => text(x, 30)) : [],
    } : null;
    if (!answers || !integer(answers.roofM2, 1, 300000) || !answers.uses.length) return json({ error: 'Diagnóstico sintético incompleto.' }, 422);
    await db.prepare("UPDATE beta_opportunities SET status='DIAGNOSIS_COMPLETE',next_action='Preparar cotización con costos y capacidad verificados',diagnosis_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(JSON.stringify(answers), row.id).run();
    await event(db, grant, 'opportunity', row.id, 'diagnosis_completed', { fields: Object.keys(answers) });
    return json({ ok: true, status: 'DIAGNOSIS_COMPLETE', opportunityId: row.id, nextAction: 'Preparar cotización con costos y capacidad verificados' });
  }

  const assign = path.match(/^\/api\/beta\/opportunities\/([^/]+)\/assign$/);
  if (assign) {
    if (grant.role !== 'admin') return json({ error: 'Sólo operaciones puede asignar aliados.' }, 403);
    const opportunityId = decodeURIComponent(assign[1]), allyId = text(value.allyId, 80);
    const row = await opportunity(db, opportunityId), ally = await db.prepare('SELECT id,status FROM beta_allies WHERE id=?').bind(allyId).first();
    if (!row || !ally) return json({ error: 'Oportunidad o aliado no encontrado.' }, 404);
    await db.prepare("UPDATE beta_opportunities SET assigned_ally_id=?,status='ASSIGNED',next_action='Preparar cotización del aliado; validar RFQ y margen',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(allyId, opportunityId).run();
    await event(db, grant, 'opportunity', opportunityId, 'ally_assigned', { allyId });
    return json({ ok: true, opportunity: await opportunity(db, opportunityId) });
  }

  if (path === '/api/beta/quotes') {
    if (!['admin', 'ally'].includes(grant.role)) return json({ error: 'Sólo operaciones o aliado asignado.' }, 403);
    const row = await opportunity(db, text(value.opportunityId, 120));
    const allyId = text(value.allyId || grant.ally_id, 80);
    if (!row || !canView(grant, row) || row.assigned_ally_id !== allyId) return json({ error: 'El aliado no está asignado a esta oportunidad.' }, 403);
    const ally = await db.prepare('SELECT id FROM beta_allies WHERE id=?').bind(allyId).first();
    if (!ally) return json({ error: 'Aliado inexistente.' }, 404);
    const calc = calculateQuote({ ...value, mode: value.mode, clientPriceInclVatCents: value.clientPriceInclVatCents, allyId });
    if (!calc.mode || !integer(calc.clientPriceInclVatCents, 10000, 100000000000)) return json({ error: 'Modalidad o precio de cotización inválido.' }, 422);
    const quoteId = id('Q-BETA');
    await db.prepare(`INSERT INTO beta_quotes(id,opportunity_id,ally_id,mode,client_price_incl_vat_cents,vat_bps,materials_cents,labor_cents,engineering_cents,transport_cents,qa_cents,warranty_cents,cac_cents,gateway_cents,contingency_cents,referral_fee_bps,costs_verified,capacity_confirmed,net_revenue_cents,total_cost_cents,contribution_cents,contribution_margin_bps,target_margin_bps,floor_margin_bps,minimum_price_incl_vat_cents,status,status_reason) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(quoteId, row.id, allyId, calc.mode, calc.clientPriceInclVatCents, calc.vatBps, money(value.materialsCents), money(value.laborCents), money(value.engineeringCents), money(value.transportCents), money(value.qaCents), money(value.warrantyCents), calc.cacCents, calc.gatewayCents, money(value.contingencyCents), integer(value.referralFeeBps, 0, 5000) ? value.referralFeeBps : 0, value.costsVerified === true ? 1 : 0, value.capacityConfirmed === true ? 1 : 0, calc.netRevenueCents, calc.totalCostCents, calc.contributionCents, calc.contributionMarginBps, TARGET_MARGIN_BPS, FLOOR_MARGIN_BPS, calc.minimumPriceInclVatCents, calc.status, calc.statusReason).run();
    await db.prepare("UPDATE beta_opportunities SET status='QUOTED',expected_margin_bps=?,next_action=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(calc.contributionMarginBps, calc.status === 'PRE_GO_REVIEW_CONTRACT' ? 'Revisión contractual humana antes de aprobar' : 'Corregir costos/capacidad antes de aprobar', row.id).run();
    await event(db, grant, 'quote', quoteId, 'quote_created', { mode: calc.mode, status: calc.status, marginBps: calc.contributionMarginBps });
    return json({ ok: true, quote: { id: quoteId, ...calc, approved: false, paymentsEnabled: false } }, 201);
  }

  const approve = path.match(/^\/api\/beta\/quotes\/([^/]+)\/approve$/);
  if (approve) {
    if (grant.role !== 'admin') return json({ error: 'La aprobación financiera es humana y privada.' }, 403);
    const quoteId = decodeURIComponent(approve[1]), quote = await db.prepare('SELECT * FROM beta_quotes WHERE id=?').bind(quoteId).first();
    if (!quote) return json({ error: 'Cotización no encontrada.' }, 404);
    if (quote.status !== 'PRE_GO_REVIEW_CONTRACT') return json({ error: 'La cotización no supera los gates de margen, costos y capacidad.' }, 422);
    await db.prepare("UPDATE beta_quotes SET status='APPROVED',approved_at=CURRENT_TIMESTAMP WHERE id=?").bind(quoteId).run();
    await event(db, grant, 'quote', quoteId, 'quote_approved_human', { paymentsEnabled: false });
    return json({ ok: true, quoteId, status: 'APPROVED', paymentsEnabled: false });
  }

  if (path === '/api/beta/work-orders') {
    if (grant.role !== 'admin') return json({ error: 'Sólo operaciones puede crear órdenes.' }, 403);
    const quote = await db.prepare('SELECT * FROM beta_quotes WHERE id=? AND status=\'APPROVED\'').bind(text(value.quoteId, 120)).first();
    if (!quote) return json({ error: 'Se requiere cotización aprobada por una persona autorizada.' }, 422);
    const row = await opportunity(db, quote.opportunity_id);
    const workOrderId = id('WO-BETA');
    await db.prepare("INSERT INTO beta_work_orders(id,opportunity_id,quote_id,ally_id,status,qa_status,warranty_status,payments_enabled) VALUES(?,?,?,?,'PENDING_INSTALLATION','PENDING','PENDING',0)").bind(workOrderId, row.id, quote.id, quote.ally_id).run();
    await db.prepare("UPDATE beta_opportunities SET status='INSTALLATION',next_action='Ejecutar instalación sintética y registrar QA',updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(row.id).run();
    await event(db, grant, 'work_order', workOrderId, 'work_order_created', { paymentsEnabled: false });
    return json({ ok: true, workOrderId, status: 'PENDING_INSTALLATION', paymentsEnabled: false }, 201);
  }

  const qa = path.match(/^\/api\/beta\/work-orders\/([^/]+)\/qa$/);
  if (qa) {
    const workOrderId = decodeURIComponent(qa[1]), work = await db.prepare('SELECT * FROM beta_work_orders WHERE id=?').bind(workOrderId).first();
    if (!work) return json({ error: 'Orden no encontrada.' }, 404);
    if (grant.role !== 'admin' && !(grant.role === 'ally' && grant.ally_id === work.ally_id)) return json({ error: 'Expediente no visible para esta sesión.' }, 403);
    const passed = value.passed === true;
    await db.prepare("UPDATE beta_work_orders SET status=?,qa_status=?,warranty_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(passed ? 'QA_APPROVED' : 'QA', passed ? 'PASSED' : 'FAILED', passed ? 'READY' : 'PENDING', workOrderId).run();
    await db.prepare("UPDATE beta_opportunities SET status=?,next_action=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(passed ? 'CARE' : 'INSTALLATION', passed ? 'Abrir mantenimiento HI Care o cierre con garantía' : 'Corregir pendientes y repetir QA', work.opportunity_id).run();
    await event(db, grant, 'work_order', workOrderId, passed ? 'qa_passed' : 'qa_failed', { evidence: text(value.evidence, 240) });
    return json({ ok: true, workOrderId, qaStatus: passed ? 'PASSED' : 'FAILED', paymentsEnabled: false });
  }

  if (path === '/api/beta/orders') {
    if (!['admin', 'customer'].includes(grant.role)) return json({ error: 'Sólo cliente sintético u operaciones.' }, 403);
    const itemId = text(value.itemId, 80), quantity = value.quantity;
    if (!integer(quantity, 1, 20)) return json({ error: 'Cantidad inválida.' }, 422);
    const item = await db.prepare('SELECT id FROM beta_catalog_items WHERE id=? AND active=1').bind(itemId).first();
    if (!item) return json({ error: 'Producto beta inexistente.' }, 404);
    const orderId = id('ORD-BETA');
    await db.prepare("INSERT INTO beta_orders(id,owner_scope,item_id,quantity) VALUES(?,?,?,?)").bind(orderId, grant.session_id, itemId, quantity).run();
    await event(db, grant, 'order', orderId, 'simulated_order_created', { paymentEnabled: false });
    return json({ ok: true, orderId, status: 'SIMULATED_NO_CHARGE', paymentEnabled: false }, 201);
  }

  if (path === '/api/beta/maintenance') {
    if (!['admin', 'customer', 'ally'].includes(grant.role)) return json({ error: 'Rol no autorizado.' }, 403);
    const serviceType = text(value.serviceType, 40), notes = text(value.notes, 500), opportunityId = text(value.opportunityId, 120) || null;
    if (!SERVICE_TYPES.has(serviceType) || notes.length < 4) return json({ error: 'Servicio y notas son obligatorios.' }, 422);
    if (opportunityId) {
      const row = await opportunity(db, opportunityId);
      if (!row || !canView(grant, row)) return json({ error: 'Expediente no visible para esta sesión.' }, 404);
    }
    const requestId = id('CARE-BETA');
    await db.prepare("INSERT INTO beta_maintenance_requests(id,owner_scope,opportunity_id,service_type,notes) VALUES(?,?,?,?,?)").bind(requestId, grant.session_id, opportunityId, serviceType, notes).run();
    await event(db, grant, 'maintenance', requestId, 'maintenance_requested', { paymentEnabled: false });
    return json({ ok: true, requestId, status: 'PENDING_REVIEW', paymentEnabled: false }, 201);
  }

  return json({ error: 'Ruta beta no encontrada.' }, 404);
}

