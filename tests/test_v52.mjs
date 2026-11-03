import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const root=path.resolve(new URL('../site/',import.meta.url).pathname);const source=fs.readFileSync(path.join(root,'engine.js'),'utf8');
const scope={Math,Number,String,Object,Set,Intl};vm.runInNewContext(source,scope);const E=scope.PLUVIAM_ENGINE;
let assertions=0,scenarios=0,apiChecks=0,storeChecks=0;const check=(expr,label)=>{assert.ok(expr,label);assertions++};
const segments=Object.keys(E.EXAMPLE_ROOFS),bands={A:1300,B:2650,C:5250,D:7000};
const usage=['riego','limpieza','sanitarios','operacion','potable'];const issueIds=['desabasto','pipas','sarro','calidad','costos','sustentabilidad'];
const roofs=[1,50,100,150,151,400,401,900,901,300000];
let counter=0;
for(const segment of segments)for(const [band,monthlyExpense] of Object.entries({...bands,'':0}))for(let umask=1;umask<32;umask++)for(let imask=0;imask<64;imask++)for(const storage of ['cisterna','ninguno','no_se']){
 const uses=usage.filter((_,i)=>umask&(1<<i)),issues=issueIds.filter((_,i)=>imask&(1<<i)),roof=roofs[counter++%roofs.length];
 const a=E.estimate({segment,roof,monthlyExpense,issues,uses,storage,rainfall:800,efficiency:.75});
 check(a.segment===segment,'segment');check(a.annualPotential===Math.round(roof*600),'liters');
 check(monthlyExpense===0?a.spendYear===null:a.spendYear===monthlyExpense*12,'annual spend');
 check(a.priceBand.min<=a.priceBand.center&&a.priceBand.center<=a.priceBand.max,'center bounds');
 check(a.priceBand.center===Math.round((a.priceBand.min+a.priceBand.max)/2),'price center');
 check(a.priceBand.min%1000===0&&a.priceBand.max%1000===0,'round to thousands');
 check(a.priceBand.band===(band||'B'),'expense band');
 check(a.priceBand.assumedExpense===(band===''),'assumption');
 check(Number.isSafeInteger(a.annualPotential),'finite liters');
 check(a.uses.length===uses.length,'valid uses');
 scenarios++;
}
const tmp=path.join(os.tmpdir(),`v52-worker-${process.pid}.mjs`);fs.writeFileSync(tmp,fs.readFileSync(path.join(root,'_worker.js'),'utf8').replace("}catch(e){return respond({error:'No se pudo procesar la solicitud. Intenta más tarde.'},500)}", "}catch(e){console.error('WORKER ERR',e);return respond({error:'No se pudo procesar la solicitud. Intenta más tarde.'},500)}"));
const module=await import('file://'+tmp);const worker=module.default.fetch;
const fakeFetch=globalThis.fetch;
globalThis.fetch=async(url)=>{if(String(url).includes('turnstile'))return new Response(JSON.stringify({success:true,hostname:'pluviam.example'}),{status:200});throw Error('Unexpected external fetch '+url)};
const makeEnv=()=>{const inserted=[];const db={prepare(sql){return {bind(...values){return {sql,values,async first(){if(sql.includes('SELECT folio,access_hash,status,next_step FROM lead_cases')){const f=inserted.find(x=>x.sql.startsWith('INSERT INTO lead_cases')&&x.values[0]===values[0]);return f?{folio:f.values[0],access_hash:f.values[1],status:'recibida',next_step:'Evaluación inicial'}:null;}if(sql.includes('SELECT answers_json FROM lead_diagnostics')){const f=inserted.find(x=>x.sql.startsWith('INSERT INTO lead_diagnostics')&&x.values[0]===values[0]);return f?{answers_json:f.values[1]}:null;}return null;},async all(){return {results:[]}},async run(){inserted.push({sql,values});return {success:true}}}},async first(){return null},async run(){inserted.push({sql,values:[]});return {success:true}}}},async batch(items){for(const item of items)inserted.push({sql:item.sql,values:item.values});return items.map(()=>({success:true}));}};return {DB:db,inserted,TURNSTILE_SECRET:'synthetic',TURNSTILE_SITE_KEY:'synthetic',LEGAL_APPROVED:'true',PRIVACY_NOTICE_GO_APPROVED:'true',CONSENT_VERSION:'privacidad-vfinal-20261026',LEADS_ENABLED:'true'}};
function payload(segment,band,roof,roofIsExample=false,cp=''){const monthlyExpense=bands[band]||0,uses=['riego','limpieza'],issues=['pipas'];const a={version:1,segment,city:'Guadalajara',cp,issues,uses,storage:'cisterna',roofDeclared:roofIsExample?null:roof,roofIsExample,expenseRange:band,expenseEstimate:monthlyExpense,expenseIsEstimate:true,quoteDetail:{},roiSaving:null,roiMaintenance:null};return {name:'QA Cliente Sintético',email:'qa@example.invalid',phone:'',segment,city:'Guadalajara'+(cp?' / CP '+cp:''),roof,rainfall:800,efficiency:.75,problem:'pipas',storage:'cisterna',uses:uses.join(','),timing:'por_evaluar',payment:'por_definir',monthlyExpense,answers:a,consent:true,turnstile:'test-turnstile'};}
async function call(path,body,env){return worker(new Request('https://pluviam.example'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}),env,{});}
for(const segment of segments)for(const band of ['','A','B','C','D']){
 const example=E.EXAMPLE_ROOFS[segment];for(const isExample of [true,false]){
 const roof=isExample?example:321,body=payload(segment,band,roof,isExample,'44100'),env=makeEnv();const r=await call('/api/solicitudes',body,env);assert.equal(r.status,201,`save ${segment}/${band}/${isExample}: ${await r.clone().text()}`);const response=await r.json();const save=env.inserted.find(x=>x.sql.startsWith('INSERT INTO lead_diagnostics'));check(!!save,'snapshot committed');const a=JSON.parse(save.values[1]);const snapshot=a.calculationSnapshot;check(snapshot.version===E.CALCULATION_VERSION,'version fixed');
 const local=E.estimate({segment,roof,uses:body.answers.uses,issues:body.answers.issues,storage:body.storage,monthlyExpense:body.monthlyExpense,rainfall:800,efficiency:.75});
 check(snapshot.output.annualPotentialLiters===local.annualPotential,'saved liters match display');check(snapshot.output.annualSpendMxn===local.spendYear,'saved annual spend');check(snapshot.output.threeYearSpendMxn===(local.spendYear===null?null:local.spendYear*3),'saved spend3');check(snapshot.output.investmentScenarioMxn.center===local.priceBand.center,'saved central investment');
 check(snapshot.output.paybackYears===null,'no false ROI');check(snapshot.inputs.roofIsExample===isExample,'roof source retained');
 const pr=await call('/api/proyecto',{folio:response.folio,token:response.accessToken},env);assert.equal(pr.status,200,await pr.clone().text());const pdata=await pr.json();check(pdata.diagnosticSnapshot?.version===snapshot.version,'saved version retrievable');check(pdata.diagnosticSnapshot?.output?.annualPotentialLiters===snapshot.output.annualPotentialLiters,'saved result retrievable');storeChecks++;
 }
}
for(const [name,mutate] of [
 ['roof tampered',b=>b.roof=999],['monthly expense tampered',b=>b.monthlyExpense=1800],['storage tampered',b=>b.storage='ninguno'],['city tampered',b=>b.city='CDMX'],['issue order mismatch',b=>b.problem='calidad'],['duplicate issue',b=>b.answers.issues.push('pipas')]
]){const env=makeEnv(),body=payload('vivienda','A',100,false);mutate(body);const res=await call('/api/solicitudes',body,env);check(res.status===422,'reject '+name);check(!env.inserted.some(x=>x.sql.startsWith('INSERT INTO lead_cases')),'do not store '+name)}
for(const segment of segments)for(const roof of [1,100,150,151,400,401,900,901,300000])for(const expense of [0,1300,2650,5250,7000]){
 const uses=['riego','sanitarios'];const d={segment,roof,monthlyExpense:expense,uses,issues:['pipas'],storage:'cisterna',city:'Guadalajara'};const env={};const res=await call('/api/diagnostico',d,env);assert.equal(res.status,200,await res.clone().text());const remote=await res.json();const local=E.estimate({...d,rainfall:800,efficiency:.75});check(remote.annualPotential===local.annualPotential,'worker/api liters parity');check(remote.priceBand.center===local.priceBand.center,'worker/api price parity');check(remote.calculationVersion===E.CALCULATION_VERSION,'api version');apiChecks++;
}
// Disallow exposing actual ROI from a five-question questionnaire.
const t=fs.readFileSync(path.join(root,'roi-r7.js'),'utf8');check(t.includes('payback:null'),'five-question test not asserting payback');
globalThis.fetch=fakeFetch;fs.unlinkSync(tmp);
const summary={success:true,scenarioCombinations:scenarios,assertions,apiParityCases:apiChecks,persistAndRetrieveCases:storeChecks,corruptPayloadsRejected:6,algorithmVersion:E.CALCULATION_VERSION,realD1:false,realPayments:false};
console.log(JSON.stringify(summary,null,2));fs.writeFileSync(new URL('QA_V52.json',import.meta.url),JSON.stringify(summary,null,2));
