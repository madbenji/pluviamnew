import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import os from 'node:os';
import path from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const modfile = path.join(os.tmpdir(), 'pluviam_bbva_p0_'+process.pid+'.mjs');
fs.writeFileSync(modfile,fs.readFileSync(root+'/site/_worker.js'));
const { default: worker } = await import(pathToFileURL(modfile).href);
let n=0;
function eq(a,b,msg){assert.deepEqual(a,b,msg);n++}
const db=new DatabaseSync(':memory:');
db.exec(`CREATE TABLE lead_cases(folio TEXT PRIMARY KEY);
CREATE TABLE approved_quotes(id TEXT PRIMARY KEY,folio TEXT UNIQUE);
CREATE TABLE payment_attempts(id TEXT PRIMARY KEY,quote_id TEXT,provider TEXT,stage TEXT,expected_cents INTEGER,state TEXT,provider_session TEXT,provider_payment_id TEXT,updated_at TEXT);
CREATE TABLE automation_outbox(event_id TEXT PRIMARY KEY,payment_attempt_id TEXT UNIQUE,folio TEXT,event_type TEXT,status TEXT);
CREATE TABLE admin_events(event_id TEXT PRIMARY KEY,folio TEXT,action TEXT);`);
db.exec(fs.readFileSync(root+'/migraciones/005_bbva_evidencia_unica_p0.sql','utf8'));
for(let i=1;i<=3;i++){
  db.prepare('INSERT INTO lead_cases VALUES(?)').run(`PLV-BBVA-0000000${i}`);
  db.prepare('INSERT INTO approved_quotes VALUES(?,?)').run(`q${i}`,`PLV-BBVA-0000000${i}`);
  db.prepare('INSERT INTO payment_attempts(id,quote_id,provider,stage,expected_cents,state,provider_session) VALUES(?,?,?,?,?,?,?)').run(`bank-attempt-${i}`,`q${i}`,'bbva','final',250075,'awaiting_bank',`PLV-BBVA-Q${i}-FIN`);
}
const facade={prepare(sql){return {async first(){return db.prepare(sql).get()||null},bind(...params){return {async first(){return db.prepare(sql).get(...params)||null},async all(){return {results:db.prepare(sql).all(...params)}},async run(){const r=db.prepare(sql).run(...params);return {meta:{changes:Number(r.changes)}}}}}}}};
const env={DB:facade,ADMIN_TOKEN:'temporary-admin-only-test',BANK_PAYMENT_ENABLED:'true',BANK_ACCOUNT_VERIFIED:'true',BBVA_CLABE:'012345678901234567',BBVA_BENEFICIARY_NAME:'PLUVIAM SIMULADO',ASTRA_ENABLED:'false',CUSTOMER_EMAIL_ENABLED:'false',ANALYTICS_ENABLED:'false'};
async function req(i,payload={}) {const r=await worker.fetch(new Request('https://staging.pluviam.invalid/api/admin/conciliar-bbva',{method:'POST',headers:{Authorization:'Bearer temporary-admin-only-test','Content-Type':'application/json'},body:JSON.stringify({folio:`PLV-BBVA-0000000${i}`,bankReference:`PLV-BBVA-Q${i}-FIN`,bankEvidenceId:'ABONO-RASTREO-12345',confirmedAmountCents:250075,confirmedByBank:true,...payload})}),env);return {status:r.status,body:await r.json()};}
let r;
r=await worker.fetch(new Request('https://staging.pluviam.invalid/api/admin/conciliar-bbva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio:'PLV-BBVA-00000001'})}),env);eq(r.status,403,'admin auth required');
env.BANK_ACCOUNT_VERIFIED='false';r=await req(1);eq(r.status,503,'bank verification gate');env.BANK_ACCOUNT_VERIFIED='true';
r=await req(1,{confirmedByBank:false});eq(r.status,422,'bank statement attestation');
r=await req(1,{confirmedAmountCents:250074});eq(r.status,409,'exact amount');
r=await req(1,{bankEvidenceId:'ABC'});eq(r.status,422,'valid movement ID');
r=await req(1,{bankReference:'FAKE-REF-1234'});eq(r.status,409,'exact payment reference');
eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get('bank-attempt-1').state,'awaiting_bank');
r=await req(1);eq(r.status,200,'bank match');eq(r.body.ok,true);
eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get('bank-attempt-1').state,'paid');
eq(db.prepare('SELECT COUNT(*) n FROM automation_outbox').get().n,1);
r=await req(1);eq(r.status,409,'no duplicate bank matching');
r=await req(2);eq(r.status,409,'bank movement ID reused across project rejected');
eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get('bank-attempt-2').state,'awaiting_bank');
r=await req(2,{bankEvidenceId:'ABONO-OTRO-987654'});eq(r.status,200,'unique movement for second project');
eq(db.prepare('SELECT COUNT(*) n FROM automation_outbox').get().n,2);
const dupIndexQuery=()=>db.prepare("UPDATE payment_attempts SET state='paid', provider_payment_id='ABONO-OTRO-987654' WHERE id='bank-attempt-3'").run();
assert.throws(dupIndexQuery,/UNIQUE/);n++;
eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get('bank-attempt-3').state,'awaiting_bank');
console.log(JSON.stringify({pass:true,assertions:n,synthetic:true,realBankTransfers:0,duplicateId:'rejected',auth:'enforced',uniqueIndex:'enforced'}));
db.close();fs.unlinkSync(modfile);
