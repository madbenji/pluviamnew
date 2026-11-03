import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const site=path.resolve(new URL('../site/',import.meta.url).pathname);const hashes=JSON.parse(fs.readFileSync(path.resolve(site,'../tests/protected_hashes_vfinal.json'),'utf8'));
let count=0;const ck=(x,label)=>{assert.ok(x,label);count++};const read=name=>fs.readFileSync(path.join(site,name),'utf8');const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
// Release-specific integrity baseline: this is no longer the historical immutable V46 Worker.
const workerCurrent=read('_worker.js');
ck(hash(workerCurrent)===hashes['_worker.js'],'Reviewed Worker matches the VFinal release manifest');
ck(workerCurrent.includes('reviewRequired:true')&&workerCurrent.includes("'/api/admin/operacion'"),'Payment shortfall and reconciliation dashboard guards exist');
for(const core of ['engine.js','diagnostic-snapshot.js','admin.js','quote-r7.js'])ck(hash(read(core))===hashes[core],core+' unchanged');
const retellFile=path.resolve(site,'../retell-worker/index.js');ck(hash(fs.readFileSync(retellFile))===hashes['retell-worker/index.js'],'Retell Worker unchanged');
const home=read('index.html'),project=read('mi-proyecto.html'),docs=read('project-docs.js');
for(const id of ['liters','spend','investment','investment-note','get-quote','lead-consent','lead-pay','folio-number','access-key'])ck(home.includes(`id="${id}"`),`required homepage ${id}`);
for(const id of ['folio','token','lookup-form','project-result','feedback'])ck(project.includes(`id="${id}"`),`required private portal ${id}`);
for(const asset of ['project-timeline.js','project-premium.css','project-docs.js','diagnostic-snapshot.js'])ck(project.includes(asset),`linked portal ${asset}`);
ck(home.includes('no autoriza llamadas automatizadas'),'lead consent does not include automated calls');
ck(project.includes('noindex,nofollow,noarchive'),'private project noindex');
ck(!read('cotizacion.html').includes('type="file"')&&read('cotizacion.html').includes('canal privado autorizado'),'photo upload withheld until authorized secure channel');
ck(read('privacidad.html').includes('aviso integral'),'privacy integral still legally pending');
ck(!docs.includes("if(consentCheckbox?.checked&&token&&follow.enabled)"),'PDF does not trigger call consent');

// Minimal DOM: the same static JS runs with mocked authenticated data and detached DOM, no network.
class Node {
  constructor(tag){this.tagName=tag;this.children=[];this.attributes={};this.className='';this.textContent='';this.id='';this.hidden=false;this.checked=false;this.disabled=false;this.listeners={};}
  append(...els){this.children.push(...els);return this}setAttribute(k,v){this.attributes[k]=v}addEventListener(n,fn){(this.listeners[n]??=[]).push(fn)}remove(){this.removed=true;}
  querySelector(selector){if(selector==='#project-timeline')return this.children.find(x=>x.id==='project-timeline'&&!x.removed)||null;return null}
  get all(){return [this,...this.children.flatMap(x=>x instanceof Node?x.all:[])]}
  click(){for(const f of (this.listeners.click||[]))f()}
}
const zone=new Node('section');let handlers={};const fakeWindow={addEventListener(name,f){(handlers[name]??=[]).push(f);}};
const fakeDocument={createElement(name){return new Node(name)},getElementById(name){return name==='project-result'?zone:null}};
const sandbox={window:fakeWindow,document:fakeDocument,Intl,Date,String,Math,Number,Array,Object,console};
vm.runInNewContext(read('project-timeline.js'),sandbox);
const fakeData={stage:'diseno',nextStep:'Evaluación adicional pendiente',recordsAvailable:true,events:[{created_at:'2026-10-25T18:00:00Z',description:'<script>alert(1)</script>'}]};
handlers['pluviam:proyecto'][0]({detail:{data:fakeData}});
const timeline=zone.querySelector('#project-timeline');ck(timeline!==null,'timeline render');
ck(timeline.all.filter(n=>String(n.className).includes('is-current')).length===1,'exactly one current stage');
ck(timeline.all.some(n=>n.textContent==='Evaluación adicional pendiente'),'real next step visible');
ck(!timeline.all.some(n=>n.tagName==='script'),'event HTML is never interpreted');
ck(timeline.all.some(n=>n.textContent==='<script>alert(1)</script>'),'event output escaped as text');
handlers['pluviam:proyecto'][0]({detail:{data:{stage:'cancelado',recordsAvailable:false}}});
ck(zone.querySelector('#project-timeline')!==null,'timeline status cancelled');
ck(zone.querySelector('#project-timeline').all.some(n=>n.className==='project-cancelled'),'cancelled flow distinct');
console.log(JSON.stringify({status:'PASS',assertions:count,financialBackendReviewedVFinal:true,retellWorkerUnchanged:true,authenticatedTimelineTest:'PASS',consentSeparatedFromPDF:true}));
