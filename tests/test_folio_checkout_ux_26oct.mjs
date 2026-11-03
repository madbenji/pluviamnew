import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=path.resolve(new URL('../site/',import.meta.url).pathname);
const read=n=>fs.readFileSync(path.join(root,n),'utf8');
const app=read('app.js'),html=read('index.html'),pay=read('pagar.js');let checks=0;
function ck(v,m){assert.ok(v,m);checks++}
ck(!/confirmByEmail\s*\(/.test(app),'no auto mailto handler in diagnosis');
ck(!/location\.href\s*=\s*['"]mailto:/.test(app),'no Outlook app navigation in diagnosis');
ck(app.includes('leadSubmissionActive'),'guard prevents duplicate POST');
ck(!html.includes('id="lead-backup-actions"'),'no backup actions in user UI');
ck(!app.includes('Descargar mi diagnóstico (sin folio)'),'no misleading download without folio');
ck(!app.includes('COPIA PERSONAL SIN FOLIO'),'no fake alternative folio');
for (const [method,label] of [['mercadopago','Tarjeta'],['spei','SPEI'],['crypto','Criptomonedas']]){
 ck(html.includes('/pagar.html?metodo='+method),label+' links to authenticated portal');
}
ck(!app.includes('mailto:'),'no mail app on save');
ck(pay.includes("project.quote.contractAccepted"),'contract accepted required');
ck(pay.includes("project?.quote?.approved"),'quote approved required');
ck(pay.includes("const state=project.paymentStates?.[active.stage]"),'stage state checked');
ck(pay.includes("options.includes('mercadopago')?'mercadopago':options.includes('bbva')?'bbva'"),'SPEI routes only to configured provider or verified BBVA');
ck(!/window\.location\s*=\s*['"]https?:\/\//.test(pay),'payment URLs only from the backend');
ck(pay.includes('consulta el estado del expediente antes de volver a pagar'),'ambiguous payment protected');
// A closed API must not fabricate a client-side folio or call /api/solicitudes.
const block=app.slice(app.indexOf('let turnstileLoadPromise='),app.indexOf('function fallbackCopy('));
const status={textContent:''},button={disabled:false},form={reportValidity:()=>true};
let calls=0;
const context={
 $:s=>({'#send-lead':button,'#form-state':status,'#lead-form':form})[s],
 fetch:async path=>{calls++;if(path==='/api/estado')return {ok:true,json:async()=>({accepting:false})};throw Error('unexpected request')},
 window:{},leadGateReady:false,console,Error,sessionStorage:{setItem:()=>{throw Error('unexpected credential')}},
};
vm.createContext(context);vm.runInContext(block,context);
await vm.runInContext('submitLead({preventDefault(){}})',context);
ck(calls===1,'closed registration never submits a fake lead');
ck(!status.textContent.includes('No se recibió confirmación del servidor'),'fake legacy warning removed');
ck(!status.textContent.includes('Descarga'),'no alternative fake folio path');
// A registered project must display real server-issued credentials, never client-side placeholder tokens.
ck(app.includes("sessionStorage.setItem('pluviam-project',JSON.stringify({folio,accessToken}))"),'credentials obtained from actual POST saved in sessionStorage');
ck(app.includes("$('#confirmed-zone').hidden=false"),'successful response reveals real folio panel');
ck(html.includes('id="folio-number"')&&html.includes('id="access-key"'),'real folio and key fields present');
ck(read('pagar.html').includes('id="quick-pay-cards"'),'checkout renders three public method cards');
for(const method of ['mercadopago','spei','crypto'])ck(read('pagar.html').includes('data-pay-method="'+method+'"'),'checkout card '+method+' always visible');
ck(![...fs.readdirSync(root)].filter(n=>/\.(html|js)$/.test(n)).some(n=>read(n).includes('mailto:')),'no mailto in site');
console.log(JSON.stringify({status:'PASS',checks,release:'2026-10-26',scope:'local-mock + static UX; no production payment or real folio created'}));
