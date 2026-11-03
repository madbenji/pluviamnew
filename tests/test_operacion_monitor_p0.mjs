import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';import fs from 'node:fs';import {pathToFileURL} from 'node:url';import path from 'node:path';import os from 'node:os';
const root=new URL('..',import.meta.url).pathname,tmp=path.join(os.tmpdir(),'pluviam_ops_'+process.pid+'.mjs');fs.writeFileSync(tmp,fs.readFileSync(root+'/site/_worker.js','utf8'));
const {default:worker}=await import(pathToFileURL(tmp).href);const d=new DatabaseSync(':memory:');
d.exec(`CREATE TABLE approved_quotes(id TEXT PRIMARY KEY,folio TEXT); CREATE TABLE payment_attempts(id TEXT PRIMARY KEY,quote_id TEXT,provider TEXT,stage TEXT,state TEXT,expected_cents INTEGER,created_at TEXT);`);
d.prepare('INSERT INTO approved_quotes VALUES(?,?)').run('q1','PLV-TEST-12345678');
d.prepare('INSERT INTO payment_attempts VALUES(?,?,?,?,?,?,?)').run('attempt-1','q1','bbva','deposit','awaiting_bank',5000000,'2026-10-20 10:00:00');
d.prepare('INSERT INTO payment_attempts VALUES(?,?,?,?,?,?,?)').run('attempt-2','q1','mercadopago','final','paid',5000000,'2026-10-20 11:00:00');
const DB={prepare(sql){return {bind(...params){return {first:async()=>d.prepare(sql).get(...params)||null,all:async()=>({results:d.prepare(sql).all(...params)}),run:async()=>({meta:d.prepare(sql).run(...params)})}},all:async()=>({results:d.prepare(sql).all()}),first:async()=>d.prepare(sql).get()||null}}};
const env={DB,ADMIN_TOKEN:'TEST_ADMIN_SECRET',ASSETS:{fetch:()=>new Response('static')}};let assertions=0;
async function get(headers){return worker.fetch(new Request('https://pluviam.invalid/api/admin/operacion',{headers}),env)}
let r=await get({});assert.equal(r.status,403);assertions++;
r=await get({Authorization:'Bearer TEST_ADMIN_SECRET'});assert.equal(r.status,200);assertions++;
let x=await r.json();assert.equal(x.aggregates.length,2);assertions++;assert.equal(x.needsReview.length,1);assertions++;assert.equal(x.needsReview[0].folio,'PLV-TEST-12345678');assertions++;
assert.ok(!JSON.stringify(x).includes('TEST_ADMIN_SECRET'));assertions++;
d.close();fs.unlinkSync(tmp);console.log(JSON.stringify({pass:true,assertions,synthetic:true,realPayments:0}));
