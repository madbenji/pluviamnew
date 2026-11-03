import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const script=fs.readFileSync(new URL('../site/project-docs.js',import.meta.url),'utf8');let callbacks={},requests=[];
class E{constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.checked=false;this.disabled=false;this.textContent='';this.hidden=false;this.className='';}append(...items){this.children.push(...items)} setAttribute(k,v){this[k]=v} addEventListener(e,callback){this.listeners[e]=callback} async click(){if(this.listeners.click)await this.listeners.click()} walk(){return [this,...this.children.flatMap(c=>c instanceof E?c.walk():[])]}}
const zone=new E('section');const doc={createElement(tag){return new E(tag)},getElementById(name){return name==='project-result'?zone:null}};
const url={createObjectURL(){return 'blob:fake'},revokeObjectURL(){}};
const context={window:{addEventListener(name,cb){callbacks[name]=cb}},document:doc,URL:url,Blob,Math,Number,Date,String,Object,Array,Intl,console,setTimeout:(cb)=>cb(),fetch:async(endpoint,options)=>{requests.push({endpoint,body:JSON.parse(options.body)});return {ok:true,json:async()=>({ok:true,status:'scheduled'})}}};
vm.runInNewContext(script,context);
const data={quote:{approved:true,amountCents:13200000,expired:false},paymentStates:{},stage:'propuesta',stageLabel:'Propuesta disponible',retellFollowup:{enabled:true,eligible:true,consent:false,status:null,version:'v-consent-test'},recordsAvailable:true,documents:[{title:'Acta <b>fake</b>',kind:'Acta',body:'<script>xx</script>'}]};
callbacks['pluviam:proyecto']({detail:{data,folio:'PLV-DEMO',token:'secret-demo'}});
function byText(t){return zone.walk().find(n=>n.textContent===t)}
const pdf=byText('Descargar ficha de mi proyecto (PDF)');assert.ok(pdf);await pdf.click();assert.equal(requests.length,0,'PDF download cannot register consent');
const authorize=byText('Autorizar seguimiento de Valeria');assert.ok(authorize);assert.equal(authorize.disabled,true);const checkbox=zone.walk().find(n=>n.tagName==='input');assert.ok(checkbox);checkbox.checked=true;checkbox.listeners.change();assert.equal(authorize.disabled,false);await authorize.click();assert.equal(requests.length,1);assert.equal(requests[0].body.action,'consent');assert.equal(requests[0].body.consent,true);assert.equal(requests[0].body.consentVersion,'v-consent-test');
const revoke=byText('Revocar autorización de llamada automática');assert.ok(revoke,'revoke shown right after explicit consent');await revoke.click();assert.equal(requests.length,2);assert.equal(requests[1].body.action,'revoke');assert.equal(revoke.hidden,true);
assert.equal(zone.walk().some(n=>n.tagName==='script'),false,'no HTML injection');
console.log(JSON.stringify({status:'PASS',assertions:11,consentIndependentOfPdf:true,revokeImmediately:true,realCalls:0}));
