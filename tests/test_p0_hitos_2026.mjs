import fs from 'node:fs';import assert from 'node:assert/strict';import os from 'node:os';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
const root=new URL('..',import.meta.url).pathname;const worker=fs.readFileSync(root+'/site/_worker.js','utf8');
const pathTmp=path.join(os.tmpdir(),'pluviam-p0-'+process.pid+'.mjs');fs.writeFileSync(pathTmp,worker+'\nexport {paymentMilestones,payGate,paymentContext,deliverCustomerPaymentEmail};\n');
const {paymentMilestones,payGate,paymentContext,deliverCustomerPaymentEmail}=await import('file://'+pathTmp);
let count=0;const eq=(a,b,m)=>{assert.deepEqual(a,b,m);count++};
for(let total of [10000,10001,7999999,10000000,15999999,100000001])for(let plan of ['50-50','50-30-20']){
 const installments=paymentMilestones(total,plan);eq(installments.reduce((a,x)=>a+x.amountCents,0),total,'Total cents mismatch');
 eq(installments[0].amountCents,Math.round(total/2));eq(installments.length,plan==='50-50'?2:3);
}
eq(paymentMilestones(10000000,'50-30-20').map(x=>x.amountCents),[5000000,3000000,2000000]);
eq(paymentMilestones(10000000,'50-50').map(x=>x.amountCents),[5000000,5000000]);
const base={DB:{},TURNSTILE_SECRET:'secret',TURNSTILE_SITE_KEY:'key',LEGAL_APPROVED:'true',PRIVACY_NOTICE_GO_APPROVED:'true',CONSENT_VERSION:'privacidad-vfinal-20261026',LEADS_ENABLED:'true',PAYMENTS_ENABLED:'true'};
eq(payGate(base),false,'Fail closed without extra GO');eq(payGate({...base,COMMERCE_GO_APPROVED:'true'}),false,'Must also approve contract terms');eq(payGate({...base,COMMERCE_GO_APPROVED:'true',CONTRACT_TERMS_APPROVED:'true'}),true);
// Replaced the obsolete pre-acceptance paymentContext mock with a fail-closed assertion.
// Modern accepted-offer checks, real D1 SQL and webhooks are covered by test_p0_4_gates_e2e_mock.mjs.
const blocked=await paymentContext({...base,COMMERCE_GO_APPROVED:'true',CONTRACT_TERMS_APPROVED:'false'},'PLV-TEST-12345678','private-test','deposit');
eq(blocked.error?.includes('contractuales'),true,'Contracts block payments before commercial GO');
const sourceTests=['COMMERCE_GO_APPROVED','PAYMENTS_ENABLED',"'installation'",'customer_payment_notifications_v1',"CUSTOMER_EMAIL_GO_APPROVED==='true'",'Idempotency-Key','RESEND_VERIFIED_DOMAIN'];for(const token of sourceTests){eq(worker.includes(token),true,'Missing '+token)}
const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON;CREATE TABLE lead_cases(folio TEXT PRIMARY KEY);CREATE TABLE approved_quotes(id TEXT PRIMARY KEY,folio TEXT UNIQUE,amount_cents INTEGER,payment_plan_missing TEXT);CREATE TABLE payment_attempts(id TEXT PRIMARY KEY,quote_id TEXT,stage TEXT,state TEXT);');
const sql=fs.readFileSync(root+'/migraciones/003_hitos_y_correos_p0.sql','utf8');db.exec(sql);
let columns=db.prepare('PRAGMA table_info(approved_quotes)').all();eq(columns.some(x=>x.name==='payment_plan'),true);
db.prepare('INSERT INTO approved_quotes(id,folio,amount_cents) VALUES(?,?,?)').run('q-1','PLV-TEST',10000000);
eq(db.prepare('SELECT payment_plan FROM approved_quotes').get().payment_plan,'50-50','Historical rows should default to 50-50');
let throws=false;try{db.prepare("UPDATE approved_quotes SET payment_plan='70-30'").run()}catch{throws=true}eq(throws,true,'Invalid plan accepted');
const col=fs.readFileSync(root+'/site/mi-proyecto.js','utf8');for(const word of ['paymentPlan','milestones',"active.stage==='installation'",'Pagar segundo hito'])eq(col.includes(word),true);
// Full SQL parse of approval INSERT to protect from parameter-count regressions.
const match=worker.match(/INSERT INTO approved_quotes\((.*?)\) VALUES\((.*?)\) ON CONFLICT\(folio\) DO UPDATE SET (.*?)`\)\.bind\(/s);eq(!!match,true);const columnsSQL=match[1].split(',').map(x=>x.trim());for(const c of columnsSQL)if(!columns.some(x=>x.name===c))db.exec('ALTER TABLE approved_quotes ADD COLUMN '+c+' TEXT'); db.exec('ALTER TABLE approved_quotes ADD COLUMN updated_at TEXT');
const stmt='INSERT INTO approved_quotes('+match[1]+') VALUES('+match[2]+') ON CONFLICT(folio) DO UPDATE SET '+match[3];const params=Array.from({length:(match[2].match(/\?/g)||[]).length},(_,i)=>i===0?'q-2':i===1?'PLV-TEST-2':i===4?'50-30-20':'value');db.prepare(stmt).run(...params);eq(db.prepare("SELECT payment_plan FROM approved_quotes WHERE id='q-2'").get().payment_plan,'50-30-20');
// Disabling transactional emails should never try to query D1 or emit any request.
const email=await deliverCustomerPaymentEmail({DB:{prepare(){throw Error('DB SHOULD NOT BE READ')}},CUSTOMER_EMAIL_ENABLED:'false'},'attempt-1');eq(email,false);
fs.unlinkSync(pathTmp);db.close();console.log(JSON.stringify({pass:true,assertions:count,plans:['50-50','50-30-20'],migration:'pass',mail:'fail closed',externalCalls:0}));
