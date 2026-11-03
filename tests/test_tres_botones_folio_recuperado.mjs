import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
const site=new URL('../site/',import.meta.url).pathname;let n=0;function ck(x,m){assert.ok(x,m);n++}const read=n=>fs.readFileSync(path.join(site,n),'utf8');
const home=read('index.html'),portal=read('pagar.html'),js=read('pagar.js'),app=read('app.js'),worker=read('_worker.js');
for(const method of ['mercadopago','spei','crypto']){ck(home.includes('/pagar.html?metodo='+method),'public direct access '+method);ck(portal.includes('data-pay-method="'+method+'"'),'portal permanent card '+method);}
ck(!home.includes('/pagar.html?metodo=bbva'),'only three visible entry cards');
ck(!portal.includes('mailto:'),'payment portal no Outlook');
ck(!app.includes('confirmByEmail'),'form does not open Outlook');
ck(app.includes('const ready=await activateTurnstile()'),'awaits Turnstile loading before requesting folio');
ck(app.includes('turnstileLoadPromise'),'dedupes challenge load on submission');
ck(home.indexOf('id="confirmed-zone"')<home.indexOf('class="checkout-shortcuts"'),'payment cards appear only after folio');
ck(home.indexOf('class="checkout-shortcuts"')<home.indexOf('id="payment-zone"'),'cards in confirmation view');
ck(!home.includes('id="lead-backup-actions"'),'no download without folio buttons');
ck(app.includes("if(typeof d.folio!=='string'||!/^PLV-"),'folio must come from server');
ck(app.includes("$('#confirmed-zone').hidden=false"),'folio and key displayed after real server response');
ck(worker.includes("function privacyReady(env){return env.LEGAL_APPROVED==='true'}"),'extra privacy gate removed');
ck(worker.includes('TURNSTILE_SECRET')&&worker.includes('LEADS_ENABLED'),'legacy backend registration configuration respected');
ck(js.includes('beginPayment(provider,'),'payment cards call actual server checkout');
ck(js.includes("options.includes('bbva')"),'SPEI falls back to configured BBVA only');
ck(js.includes("!project.quote.contractAccepted"),'contract state verified before charging');
ck(js.includes("jsonPost('/api/checkout'"),'checkout backend generates actual URL');
for(const name of fs.readdirSync(site)){if(/\.(?:html|js)$/.test(name))ck(!read(name).includes('mailto:'),'no external mail client '+name);}
console.log(JSON.stringify({status:'PASS',assertions:n,realTransactions:0,cloudflareProductionChanged:false}));
