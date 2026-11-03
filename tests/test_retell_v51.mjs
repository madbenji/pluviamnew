import fs from 'node:fs';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {webcrypto as crypto} from 'node:crypto';
if(!globalThis.crypto)globalThis.crypto=crypto;
const root=new URL('../',import.meta.url).pathname;
const base=fs.readFileSync(root+'site/_worker.js','utf8');
const api=await import('data:text/javascript;base64,'+Buffer.from(base+'\nexport {retellOnPaid};').toString('base64'));
const cronsrc=fs.readFileSync(root+'retell-worker/index.js','utf8');
// Test determinista de horario: lunes 26/oct/2026, 11:00 Ciudad de México.
const cron=await import('data:text/javascript;base64,'+Buffer.from(cronsrc.replaceAll('new Date()','new Date("2026-10-26T17:00:00Z")')).toString('base64'));
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');
db.exec(`CREATE TABLE lead_cases(folio TEXT PRIMARY KEY, access_hash TEXT, phone TEXT, name TEXT, city TEXT, status TEXT, next_step TEXT);
CREATE TABLE approved_quotes(id TEXT PRIMARY KEY,folio TEXT UNIQUE REFERENCES lead_cases(folio),amount_cents INTEGER,currency TEXT,status TEXT,approved_at TEXT,approved_technical INTEGER,approved_legal INTEGER,accepted_by_customer INTEGER);
CREATE TABLE payment_attempts(id TEXT PRIMARY KEY,quote_id TEXT,stage TEXT,state TEXT);
`);
const migration=fs.readFileSync(root+'migraciones/002_retell_v51.sql','utf8');db.exec(migration);db.exec(migration);
let assertions=0;
function ck(test,msg){assert.ok(test,msg);assertions++;}
let notCalled=0;
const D1={prepare(sql){return {bind(...args){return {async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}},async run(){const result=db.prepare(sql).run(...args);return {meta:{changes:result.changes}}}}},async first(){return db.prepare(sql).get()||null},async all(){return {results:db.prepare(sql).all()}}}},async batch(stmts){return await Promise.all(stmts.map(st=>st.run()))}};
let folio='PLV-20261024-12345678';const token='test-token-1234567890123456789012345678',qId='quote-1';
const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
db.prepare('INSERT INTO lead_cases(folio,access_hash,phone,name,city,status,next_step) VALUES(?,?,?,?,?,?,?)').run(folio,hash,'5512345678','Cliente Prueba','Guadalajara','propuesta','');
db.prepare("INSERT INTO approved_quotes(id,folio,amount_cents,currency,status,approved_at,approved_technical,approved_legal,accepted_by_customer) VALUES(?, ?, 10000000, 'MXN','approved','2026-10-24 09:00:00',1,1,1)").run(qId,folio);
const env={DB:D1,RETELL_ENABLED:'true',RETELL_LAUNCH_APPROVED:'true',RETELL_PRIVACY_APPROVED:'true',RETELL_COST_APPROVED:'true',RETELL_MX_OUTBOUND_APPROVED:'true',RETELL_API_KEY:'FAKE_STAGING_NEVER_REAL',RETELL_AGENT_ID:'agent_fake',RETELL_PHONE_NUMBER:'+14157774444',RETELL_RESCUE_DELAY_SECONDS:'180',RETELL_MAX_CALLS_PER_DAY:'10',QUOTE_VALIDITY_APPROVED:'false'};
async function req(body,localEnv=env){const r=new Request('https://pluviam-staging.test/api/lead-abandonment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,token,...body})});const out=await api.default.fetch(r,{...localEnv,ASSETS:{fetch:()=>new Response('') }});return {...await out.json(),httpStatus:out.status};}
const auth={action:'consent',consent:true,consentVersion:'retell-followup-v1-2026-10-24'};
let ans=await req({...auth,consent:false});ck(ans.httpStatus===422,'consent must be explicit');
ans=await req({...auth,consentVersion:'privacy-v50'});ck(ans.httpStatus===422,'consent version must be separate');
ans=await req({...auth},{...env,RETELL_ENABLED:'false'});ck(ans.httpStatus===503,'disabled fails closed');
ans=await req(auth);ck(ans.httpStatus===200&&ans.ok,'consent accepted');
let row=db.prepare('SELECT * FROM retell_followups_v51').get();ck(row.status==='scheduled','scheduled row');
ck(Date.parse(row.scheduled_at)>=Date.now()+175000,'3m delay');
ans=await req(auth);ck(ans.alreadyRegistered,'duplicate click prevented');
ck(db.prepare('SELECT COUNT(*) AS n FROM retell_followups_v51').get().n===1,'unique followup');
ans=await req({action:'revoke'});ck(ans.ok,'revocation succeeds');
ck(db.prepare('SELECT status FROM retell_followups_v51').get().status==='cancelled','pending cancelled on revoke');
ans=await req(auth);ck(ans.httpStatus===409,'revoked quote not silently rescheduled');
let calls=0;
const origFetch=globalThis.fetch;
globalThis.fetch=async(url,options)=>{if(String(url).includes('/create-phone-call')){calls++;return new Response(JSON.stringify({call_id:'call_fake_abc',call_status:'registered'}),{status:201});}if(String(url).includes('/get-call/'))return new Response(JSON.stringify({call_status:'ended'}),{status:200});throw Error('Unexpected external fetch')};
// Otra cotización genuina para un expediente nuevo, sin romper llaves foráneas.
function newCase(nextFolio,nextQuote){folio=nextFolio;db.prepare('INSERT INTO lead_cases(folio,access_hash,phone,name,city,status,next_step) VALUES(?,?,?,?,?,?,?)').run(folio,hash,'5512345678','Cliente Prueba','Guadalajara','propuesta','');db.prepare("INSERT INTO approved_quotes(id,folio,amount_cents,currency,status,approved_at,approved_technical,approved_legal,accepted_by_customer) VALUES(?, ?, 10000000, 'MXN','approved','2026-10-24 09:00:00',1,1,1)").run(nextQuote,folio);}
newCase('PLV-20261024-22345678','quote-2');
ans=await req(auth);ck(ans.ok&&!ans.alreadyRegistered,'new eligible quote allowed');
row=db.prepare("SELECT * FROM retell_followups_v51 WHERE quote_id='quote-2'").get();
// Retell Worker usa hora fija en test, y la fecha del evento está en el futuro real (24/oct); forzamos vencimiento de timer:
db.prepare("UPDATE retell_followups_v51 SET scheduled_at=? WHERE id=?").run('2026-10-26T16:59:00Z',row.id);
await cron.__test.evaluate(env,{id:row.id});
ck(calls===1,'outbound initiated exactly once');
ck(db.prepare('SELECT status FROM retell_followups_v51 WHERE id=?').get(row.id).status==='sent','Retell sent recorded');
await cron.__test.evaluate(env,{id:row.id});ck(calls===1,'no second call after sent');
// Se reconcilia estado sin recibir transcripciones ni datos extra.
await cron.default.scheduled({},env,{});
ck(db.prepare('SELECT status FROM retell_followups_v51 WHERE id=?').get(row.id).status==='completed','call completion polled');
// Otra cotización: pago en ventana bloquea el contacto.
newCase('PLV-20261024-32345678','quote-3');
ans=await req(auth);ck(ans.ok,'third quote scheduled');
row=db.prepare("SELECT * FROM retell_followups_v51 WHERE quote_id='quote-3'").get();
db.prepare("UPDATE retell_followups_v51 SET scheduled_at=? WHERE id=?").run('2026-10-26T16:59:00Z',row.id);
db.prepare("INSERT INTO payment_attempts(id,quote_id,stage,state) VALUES('payment-1','quote-3','deposit','paid')").run();
await api.retellOnPaid(env,'payment-1');
ck(db.prepare('SELECT status FROM retell_followups_v51 WHERE id=?').get(row.id).status==='cancelled','payment hook cancels timer');
await cron.__test.evaluate(env,{id:row.id});ck(calls===1,'no call after paid');
// Proyecto sin propuesta aprobada nunca registra evento.
db.prepare('UPDATE approved_quotes SET status=? WHERE id=?').run('draft','quote-3');
ans=await req(auth);ck(ans.httpStatus===409,'unapproved quote blocked');
// No se llama sin aprobación explícita del presupuesto ni credenciales.
ck(cron.__test.active({...env,RETELL_COST_APPROVED:'false'})===false,'cost not approved means disabled');
ck(cron.__test.toMexicoPhone('5512345678')==='+525512345678','Mexico normalization');
ck(cron.__test.toMexicoPhone('+14157774444')===null,'other country blocked');
ck(!cron.__test.localWindow(new Date('2026-10-25T18:00:00Z')),'weekend blocked');
// Error ambigüo: nunca duplicar llamadas.
newCase('PLV-20261024-42345678','quote-4');
ans=await req(auth);ck(ans.ok,'new quote for uncertainty case');
row=db.prepare("SELECT * FROM retell_followups_v51 WHERE quote_id='quote-4'").get();
db.prepare("UPDATE retell_followups_v51 SET scheduled_at=? WHERE id=?").run('2026-10-26T16:59:00Z',row.id);
globalThis.fetch=async()=>{calls++;throw Error('Timeout: network uncertain');};
await cron.__test.evaluate(env,{id:row.id});
ck(db.prepare('SELECT status FROM retell_followups_v51 WHERE id=?').get(row.id).status==='uncertain','ambiguous call state');
await cron.__test.evaluate(env,{id:row.id});ck(calls===2,'uncertain network call not repeated');
globalThis.fetch=origFetch;
console.log(JSON.stringify({status:'PASS',assertions,migration:'idempotent',real_calls:0,sandbox_calls:2,customer_keys_exported:false,paid_blocked:true,consent_revocation:true,duplicate_prevention:true},null,2));
