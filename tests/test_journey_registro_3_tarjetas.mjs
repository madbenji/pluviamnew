import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const home=readFileSync(new URL('../site/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../site/app.js',import.meta.url),'utf8');
const checkout=readFileSync(new URL('../site/pagar.js',import.meta.url),'utf8');
let assertions=0;const ck=(value,label)=>{assert.ok(value,label);assertions++};
const successStart=home.indexOf('id="confirmed-zone"');const cardsStart=home.indexOf('class="checkout-shortcuts"');const cardEnd=home.indexOf('</section>',cardsStart);const confirmEnd=home.indexOf('id="payment-zone"',successStart);
ck(successStart>=0&&cardsStart>successStart&&cardEnd<confirmEnd,'all cards directly inside server-confirmed folio');
ck(home.indexOf('id="lead-form"')<successStart,'client registration before folio and payments');
for(const method of ['mercadopago','spei','crypto']){ck(home.slice(cardsStart,cardEnd).includes('/pagar.html?metodo='+method),'visible '+method+' card links to payment portal')}
ck(home.match(/\/pagar\.html\?metodo=/g)?.length===3,'exactly three payment cards');
ck(!home.includes('Descargar mi diagnóstico (sin folio)')&&!home.includes('id="lead-backup-actions"'),'no backup download CTA');
ck(!js.includes('No se recibió confirmación del servidor'),'misleading warning removed');
ck(!js.includes('mailto:')&&!checkout.includes('mailto:'),'no Outlook');
ck(js.includes("await fetch('/api/solicitudes'"),'real POST to backed D1 endpoint');
ck(checkout.includes('sessionAutoLookup')&&checkout.includes("$('access-form').requestSubmit()"),'same-browser session autologin');
ck(checkout.includes("$('access-form').hidden=true"),'no duplicate folio input if session confirmed');
ck(checkout.includes("jsonPost('/api/checkout'"),'payment URL issued by server');
// Simulate deliberate latency between Turnstile script append and load. One click must wait and persist.
const snippet=js.slice(js.indexOf('let turnstileLoadPromise='),js.indexOf('function fallbackCopy('));
function element(){return {hidden:false,disabled:false,textContent:'',scrollIntoView(){}}}
const els={};for(const id of ['send-lead','form-state','lead-zone','confirmed-zone','folio-number','access-key','captcha-box'])els['#'+id]=element();
els['#lead-form']={reportValidity:()=>true};
let requests=[],session={},rendered=0;
const host={
 $:key=>{if(!(key in els))throw Error('unknown '+key);return els[key]},
 document:{createElement:(tag)=>({tag}),head:{appendChild:(script)=>{queueMicrotask(()=>{host.window.turnstile={render:()=>{rendered++;return 7},getResponse:()=> 'token-valid-simulado'};script.onload()})}}},
 window:{turnstile:null},
 fetch:async(path)=>{requests.push(path);if(path==='/api/estado')return{ok:true,json:async()=>({accepting:true,turnstileSiteKey:'mock-public-key'})};if(path==='/api/solicitudes')return {ok:true,json:async()=>({folio:'PLV-2026-E2EABCD9',accessToken:'private-access-token-for-mock-only-123456'})};throw Error('Unexpected route')},
 sessionStorage:{setItem:(k,v)=>{session[k]=v}},
 getPayload:()=>({name:'Usuario Prueba',consent:true}),
 eraseDraft:async()=>{},refreshProject:async()=>{},
 leadGateReady:false,turnstileWidget:null,turnstileSite:'',folio:'',accessToken:'',publicWhatsApp:'',
 console,Error,Promise,
};
vm.createContext(host);vm.runInContext(snippet,host);await vm.runInContext('submitLead({preventDefault(){}})',host);
ck(requests.filter(x=>x==='/api/estado').length===1,'state checked once');
ck(requests.filter(x=>x==='/api/solicitudes').length===1,'form posted exactly once after async Turnstile loads');
ck(rendered===1,'Turnstile widget rendered once');
ck(els['#confirmed-zone'].hidden===false&&els['#lead-zone'].hidden===true,'real success replaces form');
ck(els['#folio-number'].textContent==='PLV-2026-E2EABCD9','shows server-issued folio');
ck(els['#access-key'].textContent.startsWith('private-access-token'),'shows server-issued private key');
ck(JSON.parse(session['pluviam-project']).folio==='PLV-2026-E2EABCD9','saves credential in session for checkout');
console.log(JSON.stringify({status:'PASS',assertions,kind:'mock simulated Cloudflare widget latency and D1 HTTP reply; no actual production lead or real payment'}));
