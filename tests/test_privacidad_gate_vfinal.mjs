import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
const root=new URL('..',import.meta.url).pathname,tmp=path.join(os.tmpdir(),'pluviam-privacy-'+process.pid+'.mjs');fs.writeFileSync(tmp,fs.readFileSync(root+'/site/_worker.js'));
const {default:worker}=await import(pathToFileURL(tmp).href);
const DB={prepare(sql){if(/approved_quotes|quote_customer_acceptances_p0|customer_payment_notifications_v1|customer_email_dispatch_lock_p0/.test(sql))throw Error('simulated missing schema');return {first:async()=>null,bind(){return this}}}};
const env={DB,TURNSTILE_SITE_KEY:'dummy',TURNSTILE_SECRET:'dummy',LEGAL_APPROVED:'true',LEADS_ENABLED:'true',PAYMENTS_ENABLED:'true',COMMERCE_GO_APPROVED:'true',CONTRACT_TERMS_APPROVED:'true'};
let n=0;async function state(){let r=await worker.fetch(new Request('https://pluviam.invalid/api/estado'),env);assert.equal(r.status,200);n++;return r.json()}
let x=await state();assert.equal(x.accepting,true);n++;assert.equal(x.payments,false);n++;
env.PRIVACY_NOTICE_GO_APPROVED='true';env.CONSENT_VERSION='borrador';x=await state();assert.equal(x.accepting,true);n++; // restored legacy lead gate, version gate removed
env.LEGAL_APPROVED='false';x=await state();assert.equal(x.accepting,false);n++;
env.LEGAL_APPROVED='true';env.CONSENT_VERSION='aviso-2026-10-v1';x=await state();assert.equal(x.accepting,true);n++;
// Payment schema remains absent, so the status endpoint cannot show a payment method as ready.
assert.equal(x.payments,false);n++;
fs.unlinkSync(tmp);console.log(JSON.stringify({pass:true,assertions:n,liveCloudflare:false,originalGateRestored:true}));
