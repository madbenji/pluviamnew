import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const src=fs.readFileSync(new URL('../site/mi-proyecto.js',import.meta.url),'utf8');
class E {constructor(){this.value='';this.hidden=true;this.textContent='';this.innerHTML='';this.className='';this.listeners={};this.children=[];} addEventListener(name,fn){this.listeners[name]=fn} append(...args){this.children.push(...args)} }
async function run(body){const els=Object.fromEntries(['lookup-form','feedback','project-result','folio','token','pay-buttons'].map(n=>[n,new E()]));els.folio.value='PLV-TEST';els.token.value='private-test';let dispatched=0;const calls=[];
 const sandbox={document:{getElementById:n=>els[n],createElement:n=>new E()},location:{hash:'',pathname:'/mi-proyecto.html'},history:{replaceState(){}},window:{dispatchEvent(){dispatched++}},CustomEvent:class{constructor(){}},Number,Math,String,JSON,Error,Intl,fetch:async(endpoint)=>{calls.push(endpoint);return {ok:true,json:async()=>body}}};
 vm.runInNewContext(src,sandbox);
 await els['lookup-form'].listeners.submit({preventDefault(){}});
 return {els,calls,dispatched};}
const base={folio:'PLV-TEST',stage:'propuesta',stageLabel:'Propuesta aprobada',nextStep:'Revalidar',quote:{approved:true,expired:true,amountCents:13200000},paymentOptions:['stripe','mercadopago'],paymentStates:{}};
const expired=await run(base);assert.equal(expired.els['pay-buttons'].children.length,0);assert.ok(expired.els['pay-buttons'].innerHTML.includes('No hay cobros'));assert.equal(expired.calls.length,1);
const pending=await run({...base,quote:{approved:false},paymentOptions:[]});assert.equal(pending.els['pay-buttons'].children.length,0);assert.ok(pending.els['project-result'].innerHTML.includes('Aún no hay una cotización contractual'));
const valid=await run({...base,quote:{approved:true,expired:false,amountCents:13200000},paymentOptions:['stripe']});assert.equal(valid.els['pay-buttons'].children.length,1);assert.equal(valid.els['pay-buttons'].children[0].textContent,'Pagar anticipo con Stripe');assert.equal(valid.calls.length,1,'display does not initiate checkout');
console.log(JSON.stringify({status:'PASS',assertions:8,expiredQuoteNoPayments:true,estimatedQuoteNoPayments:true,validApprovedQuotePaymentDisplayedOnly:true,livePayments:0}));
