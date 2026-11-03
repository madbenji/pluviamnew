import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {pathToFileURL} from 'node:url';
import os from 'node:os';import path from 'node:path';
const root=new URL('..',import.meta.url).pathname;
const src=fs.readFileSync(root+'/site/_worker.js','utf8');const modfile=path.join(os.tmpdir(),'pluviam4gates_'+process.pid+'.mjs');fs.writeFileSync(modfile,src);const {default:worker}=await import(pathToFileURL(modfile).href);
const assertCount={n:0};const eq=(x,y,s='')=>{assert.deepEqual(x,y,s);assertCount.n++};
const db=new DatabaseSync(':memory:');db.exec(`PRAGMA foreign_keys=ON;
CREATE TABLE lead_cases(folio TEXT PRIMARY KEY,access_hash TEXT,status TEXT,next_step TEXT,email TEXT);
CREATE TABLE lead_diagnostics(folio TEXT PRIMARY KEY, answers_json TEXT);
CREATE TABLE lead_alerts(folio TEXT PRIMARY KEY);
CREATE TABLE approved_quotes(id TEXT PRIMARY KEY,folio TEXT UNIQUE,amount_cents INT,currency TEXT,status TEXT,approved_at TEXT,approved_technical INT,approved_legal INT,accepted_by_customer INT,finance_policy_version TEXT,gross_margin_bps INT,contribution_margin_bps INT,cash_after_deposit_cents INT,summary TEXT);
CREATE TABLE payment_attempts(id TEXT PRIMARY KEY,quote_id TEXT,stage TEXT,provider TEXT,expected_cents INT,state TEXT DEFAULT 'created',provider_session TEXT,provider_payment_id TEXT,updated_at TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(quote_id,stage));
CREATE TABLE automation_outbox(event_id TEXT PRIMARY KEY,payment_attempt_id TEXT UNIQUE,folio TEXT,event_type TEXT,status TEXT,attempts INTEGER DEFAULT 0,last_error TEXT,delivered_at TEXT);
CREATE TABLE admin_events(event_id TEXT PRIMARY KEY,folio TEXT,action TEXT);
`);
// Both migrations run against isolated synthetic database.
for(const file of ['003_hitos_y_correos_p0.sql','004_aceptacion_contrato_y_email_lock_p0.sql'])db.exec(fs.readFileSync(root+'/migraciones/'+file,'utf8'));
const facade={prepare(sql){return {bind(...params){return {async first(){return db.prepare(sql).get(...params)||null},async all(){return {results:db.prepare(sql).all(...params)}},async run(){const ret=db.prepare(sql).run(...params);return {meta:{changes:Number(ret.changes)}}}}}}},batch:async stmts=>Promise.all(stmts.map(x=>x.run()))};
const accessToken='ABCDEFGHIJKLMNO-P0-PRIVATE-1234567890-1234567890',secondToken='OTHER-CLIENT-P0-PRIVATE-9876543210-9876543210';const tokHash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),b=>b.toString(16).padStart(2,'0')).join('');const dig=await tokHash(accessToken),digOther=await tokHash(secondToken);
const terms='Contrato revisado para alcance y costo, sin obras civiles ocultas incluidas. La lluvia depende del clima y la reserva exige mantenimiento preventivo. Cambios y cancelaciones requieren acuerdo por escrito; garantías legales no se suspenden indebidamente.';
const folios=['PLV-P0TEST-10000001','PLV-P0TEST-10000002'];const amounts=[10000000,8000000],ids=['QUOTE-P0-01','QUOTE-P0-02'];
folios.forEach((f,i)=>{db.prepare('INSERT INTO lead_cases(folio,access_hash,status,next_step,email) VALUES(?,?,?,?,?)').run(f,i===0?dig:digOther,'contrato','Contrato disponible','cliente-test@example.com');db.prepare("INSERT INTO approved_quotes(id,folio,amount_cents,currency,status,approved_at,approved_technical,approved_legal,accepted_by_customer,finance_policy_version,gross_margin_bps,contribution_margin_bps,cash_after_deposit_cents,summary,payment_plan,contract_text) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(ids[i],f,amounts[i],'MXN','approved','2026-10-25 18:00:00',1,1,1,'V43',5700,2700,500000,'Instalación de captación pluvial del inmueble según revisión técnica.', '50-50',terms)});
let stripeCreated=0,mpCreated=0,mpRead=0,sendCount=0,emailKeys=[],fakes={};const realFetch=globalThis.fetch;
globalThis.fetch=async (url,init={})=>{url=String(url);if(url.includes('api.stripe.com/v1/checkout/sessions')){stripeCreated++;return new Response(JSON.stringify({url:'https://checkout.stripe.com/test_mock',id:'cs_test_mock'}),{status:200})}
 if(url.includes('api.mercadopago.com/checkout/preferences')){mpCreated++;return new Response(JSON.stringify({init_point:'https://www.mercadopago.com.mx/checkout/v1/redirect/mock',id:'mp_pref_test'}),{status:200})}
 if(url.includes('api.mercadopago.com/v1/payments/')){mpRead++;return new Response(JSON.stringify(fakes.mpPayment),{status:200})}
 if(url.includes('api.resend.com/emails')){sendCount++;emailKeys.push(init.headers['Idempotency-Key']);return new Response(JSON.stringify({id:'mock-message-id'}),{status:200})}
 throw Error('Unexpected network call in mock: '+url);
};
const env={DB:facade,ASSETS:{fetch:()=>new Response('test asset')},TURNSTILE_SITE_KEY:'test',TURNSTILE_SECRET:'test',LEADS_ENABLED:'true',LEGAL_APPROVED:'true',PRIVACY_NOTICE_GO_APPROVED:'true',CONSENT_VERSION:'privacidad-vfinal-20261026',PAYMENTS_ENABLED:'true',COMMERCE_GO_APPROVED:'true',CONTRACT_TERMS_APPROVED:'true',STRIPE_SECRET_KEY:'test_sk',STRIPE_WEBHOOK_SECRET:'test_whsec',MP_ACCESS_TOKEN:'mock_private',MP_WEBHOOK_SECRET:'mock_webhook',MP_PUBLIC_KEY:'mock_public',CUSTOMER_EMAIL_ENABLED:'true',CUSTOMER_EMAIL_GO_APPROVED:'true',CUSTOMER_EMAIL_FROM:'recibos@pluviam.mx',RESEND_VERIFIED_DOMAIN:'pluviam.mx',RESEND_API_KEY:'test_resend',ASTRA_ENABLED:'false',ANALYTICS_ENABLED:'false',PROJECT_DOCS_ENABLED:'false'};
const call=async (route,body={},headers={})=>worker.fetch(new Request('https://staging.pluviam.test'+route,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}),env);
const json=async (route,body={},headers={})=>{const r=await call(route,body,headers);return [r.status,await r.json()]};
// Gate 1: no checkout without personal acceptance.
let [code,quote]=await json('/api/proyecto',{folio:folios[0],token:accessToken});eq(code,200);eq(quote.quote.approved,true);eq(quote.quote.contractAccepted,false);eq(quote.paymentOptions,[]);
let response=await json('/api/checkout',{provider:'stripe',stage:'deposit',folio:folios[0],token:accessToken});eq(response[0],409);
// Quote PDF must precede payment: proper MIME, amount, financial steps and reviewable contract terms.
let pdfResp=await call('/api/propuesta/pdf',{folio:folios[0],token:accessToken});eq(pdfResp.status,200);eq(pdfResp.headers.get('Content-Type'),'application/pdf');let pdf=Buffer.from(await pdfResp.arrayBuffer()).toString('latin1');eq(pdf.startsWith('%PDF-1.4'),true);eq(pdf.includes('50000.00'),true);eq(pdf.includes('Contrato revisado'),true);eq(pdf.includes('PENDIENTE'),true);
response=await json('/api/contrato/aceptar',{folio:folios[0],token:accessToken,offerDigest:'fake',termsVersion:quote.quote.termsVersion,agree:true});eq(response[0],422);
response=await json('/api/contrato/aceptar',{folio:folios[1],token:'INCORRECT-00000000000000000000',offerDigest:quote.quote.offerDigest,termsVersion:quote.quote.termsVersion,agree:true});eq(response[0],403);
response=await json('/api/contrato/aceptar',{folio:folios[0],token:accessToken,offerDigest:quote.quote.offerDigest,termsVersion:quote.quote.termsVersion,agree:true});eq(response[0],200);eq(response[1].ok,true);
response=await json('/api/contrato/aceptar',{folio:folios[0],token:accessToken,offerDigest:quote.quote.offerDigest,termsVersion:quote.quote.termsVersion,agree:true});eq(response[1].alreadyAccepted,true);
pdfResp=await call('/api/propuesta/pdf',{folio:folios[0],token:accessToken});pdf=Buffer.from(await pdfResp.arrayBuffer()).toString('latin1');fs.mkdirSync(root+'/qa_p0',{recursive:true});fs.writeFileSync(root+'/qa_p0/ejemplo_propuesta_sintetica.pdf',pdf,'latin1');eq(pdf.includes('PENDIENTE'),false);eq(pdf.includes('CONTRATO-P0-2026-10-25'),true);
[code,quote]=await json('/api/proyecto',{folio:folios[0],token:accessToken});eq(quote.quote.contractAccepted,true);eq(quote.paymentOptions.includes('stripe'),true);
// Gate 2: payment is for authentic quote amount and folio, never browser-provided price.
env.CONTRACT_TERMS_APPROVED='false';const gated=await json('/api/checkout',{provider:'stripe',stage:'deposit',folio:folios[0],token:accessToken});eq(gated[0],503);env.CONTRACT_TERMS_APPROVED='true';
response=await json('/api/checkout',{provider:'stripe',stage:'deposit',folio:folios[0],token:accessToken,amountCents:10});eq(response[0],200);eq(stripeCreated,1);
const p=db.prepare("SELECT * FROM payment_attempts WHERE quote_id=?").get(ids[0]);eq(p.expected_cents,5000000);eq(p.provider,'stripe');
// Gate 1 & 4: signed Stripe webhook confirms once, one downstream outbox and one customer email.
const stripeEvent={id:'evt_mock',type:'checkout.session.completed',data:{object:{id:'cs_test_mock',client_reference_id:p.id,amount_total:p.expected_cents,currency:'mxn',payment_status:'paid',payment_intent:'pi_mock'}}};const raw=JSON.stringify(stripeEvent);const ts=String(Math.floor(Date.now()/1000));const hmac=async (key,text)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('')};const signature=await hmac(env.STRIPE_WEBHOOK_SECRET,ts+'.'+raw);
const triggerStripe=async (sign=signature)=>worker.fetch(new Request('https://staging.pluviam.test/api/webhooks/stripe',{method:'POST',headers:{'Stripe-Signature':`t=${ts},v1=${sign}`},body:raw}),env);
let resp=await triggerStripe('deadbeef');eq(resp.status,403);eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get(p.id).state,'redirected');
await Promise.all([triggerStripe(),triggerStripe()]);eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get(p.id).state,'paid');eq(db.prepare('SELECT count(*) AS c FROM automation_outbox WHERE payment_attempt_id=?').get(p.id).c,1);eq(db.prepare('SELECT count(*) AS c FROM customer_payment_notifications_v1 WHERE attempt_id=?').get(p.id).c,1);eq(sendCount,1);eq(emailKeys[0],'pluviam-paid-'+p.id);
// Merchant payment mock in second folio, signature verified, provider crosscheck amount, duplicate same event no new email.
let [wrongCode,wrongData]=await json('/api/proyecto',{folio:folios[1],token:accessToken});eq(wrongCode,404);
let [,offerB]=await json('/api/proyecto',{folio:folios[1],token:secondToken});response=await json('/api/contrato/aceptar',{folio:folios[1],token:secondToken,offerDigest:offerB.quote.offerDigest,termsVersion:offerB.quote.termsVersion,agree:true});eq(response[0],200);
response=await json('/api/checkout',{provider:'mercadopago',stage:'deposit',folio:folios[1],token:secondToken});eq(response[0],200);eq(mpCreated,1);
const pb=db.prepare("SELECT * FROM payment_attempts WHERE quote_id=?").get(ids[1]);eq(pb.expected_cents,4000000);
const mpId='998877';const rid='req-001';const now=String(Date.now());fakes.mpPayment={id:mpId,status:'approved',external_reference:pb.id,transaction_amount:pb.expected_cents/100,currency_id:'MXN'};
const mpSig=await hmac(env.MP_WEBHOOK_SECRET,`id:${mpId};request-id:${rid};ts:${now};`);
const triggerMp=async(sig=mpSig)=>worker.fetch(new Request(`https://staging.pluviam.test/api/webhooks/mercadopago?data.id=${mpId}`,{method:'POST',headers:{'x-request-id':rid,'x-signature':`ts=${now},v1=${sig}`},body:'{"type":"payment"}'}),env);
resp=await triggerMp('bad');eq(resp.status,403);eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get(pb.id).state,'redirected');
fakes.mpPayment.transaction_amount=1;resp=await triggerMp();eq(resp.status,200);eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get(pb.id).state,'redirected');fakes.mpPayment.transaction_amount=pb.expected_cents/100;
await Promise.all([triggerMp(),triggerMp()]);eq(db.prepare('SELECT state FROM payment_attempts WHERE id=?').get(pb.id).state,'paid');eq(db.prepare('SELECT count(*) AS c FROM automation_outbox WHERE payment_attempt_id=?').get(pb.id).c,1);eq(sendCount,2);eq(mpRead,3);
// Gate 3: offer mutation invalidates acceptance snapshot (no future installments against altered terms).
db.prepare('UPDATE approved_quotes SET contract_text=contract_text||? WHERE id=?').run(' Añadido unilateral',ids[0]);[code,quote]=await json('/api/proyecto',{folio:folios[0],token:accessToken});eq(quote.quote.contractAccepted,false);eq(quote.paymentOptions,[]);
// Gate 4: never send with disabled policy despite already paid attempts.
let pre=sendCount;env.CUSTOMER_EMAIL_GO_APPROVED='false';resp=await triggerMp();eq(sendCount,pre);env.CUSTOMER_EMAIL_GO_APPROVED='true';
console.log(JSON.stringify({pass:true,assertions:assertCount.n,synthetic:true,realTransactions:0,providerCalls:{stripeCreated,mpCreated,mpRead,customerEmailSentToMock:sendCount},sqlite:'isolated memory',duplicateWebhook:'one payment update and one email per attempt'}));
globalThis.fetch=realFetch;db.close();fs.unlinkSync(modfile);
