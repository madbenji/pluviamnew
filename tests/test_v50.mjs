import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import os from 'node:os';import path from 'node:path';
const base=new URL('../site/',import.meta.url).pathname.replace(/\/$/,'');let checks=0;const check=(x,m)=>{assert.ok(x,m);checks++};
const scope={console,Number,Math,Intl,Object,String,Set};scope.globalThis=scope;vm.runInNewContext(fs.readFileSync(base+'/engine.js','utf8'),scope);vm.runInNewContext(fs.readFileSync(base+'/roi-r7.js','utf8'),scope);
const estimate=scope.PLUVIAM_ENGINE.estimate,roi=scope.PLUVIAM_ROI;
const profiles=['vivienda','condominio','pyme','comercial','desarrollo','industrial','gobierno','civil','profesional'];
let scenarios=0;
for(const segment of profiles)for(const roof of [5,50,100,200,500,1500,50000])for(const monthlyExpense of [0,800,1300,1800,2650,3500,5250,7000,17000])for(const uses of [['riego'],['riego','sanitarios'],['potable']])for(const storage of ['cisterna','ninguno','no_se']){
 const a=estimate({segment,roof,monthlyExpense,uses,storage,efficiency:.75,rainfall:800});
 check(Number.isFinite(a.annualPotential)&&a.annualPotential===Math.round(roof*800*.75),'potential invalid');
 check(a.priceBand&&a.priceBand.min<=a.priceBand.center&&a.priceBand.center<=a.priceBand.max,'price invalid');
 check(a.priceBand.min>=0&&a.priceBand.max>0,'price negative');
 const o=roi.overview({monthlyExpense},{priceBand:a.priceBand});check(o.payback===null,'unexpected guarantee payback');
 scenarios++;
}
check(roi.calculate({roofDeclared:100,annualPotential:60000,investment:150000,monthlyDemandM3:10,avoidableRateM3:40,maintenanceAnnual:1000}).status==='positive','known ROI');
check(roi.calculate({roofDeclared:100,annualPotential:60000,investment:150000,monthlyDemandM3:0,avoidableRateM3:40,maintenanceAnnual:1000}).status==='nonpositive','negative ROI');
check(roi.calculate({roofDeclared:null,annualPotential:60000,investment:150000,monthlyDemandM3:10,avoidableRateM3:40,maintenanceAnnual:1000}).status==='missing','missing ROI');
// Self-contained worker test: no network, no real D1. Minimal behavior validation.
const moduleFile=path.join(os.tmpdir(),'pluviam-worker-v50-'+process.pid+'.mjs');fs.writeFileSync(moduleFile,fs.readFileSync(base+'/_worker.js','utf8')+'\nexport {quoteExpired};\n');
const mod=await import('file://'+moduleFile); const fetchWorker=mod.default.fetch;
const quote={approved_at:'2026-10-01 00:00:00'};
check(mod.quoteExpired({QUOTE_VALIDITY_APPROVED:'false',QUOTE_VALID_DAYS:'15'},quote)===false,'unapproved policy expires quote');
check(mod.quoteExpired({QUOTE_VALIDITY_APPROVED:'true',QUOTE_VALID_DAYS:'15'},quote)===true,'expiry policy not working');
check(mod.quoteExpired({QUOTE_VALIDITY_APPROVED:'true',QUOTE_VALID_DAYS:'1000'},quote)===false,'invalid policy accepted');
function db(paidDeposit=false,paidFinal=false){
 return {prepare(sql){
  return {bind(...args){
   return {
    async first(){
      if(sql.startsWith('SELECT folio FROM lead_cases'))return {folio:args[0]};
      if(sql.includes("p.stage='deposit'"))return paidDeposit?{id:'deposit-paid'}:null;
      if(sql.includes("p.stage='final'"))return paidFinal?{id:'final-paid'}:null;
      return null;
    },
    async run(){return {success:true}}
   };
  }};
 }};
}
const env=(a,b)=>({DB:db(a,b),ADMIN_TOKEN:'local-only-admin'});
async function status(stage,a,b){const req=new Request('https://pluviam.example/api/admin/estado',{method:'POST',headers:{authorization:'Bearer local-only-admin','content-type':'application/json'},body:JSON.stringify({folio:'PLV-20261024-12345678',stage,nextStep:'Paso' })});return fetchWorker(req,env(a,b),{});}
let res=await status('instalacion',false,false);check(res.status===409,'execution allowed without paid deposit');
res=await status('qa',false,false);check(res.status===409,'QA allowed without deposit');
res=await status('instalacion',true,false);check(res.status===200,'legitimate execution blocked');
res=await status('mantenimiento',true,false);check(res.status===409,'maintenance allowed without final paid');
res=await status('mantenimiento',true,true);check(res.status===200,'post-sale incorrectly blocked');
res=await status('diseno',false,false);check(res.status===200,'engineering prepayment incorrectly blocked');
res=await status('instalacion',false,false);check((await res.json()).error.includes('anticipo'),'error message not actionable');
fs.unlinkSync(moduleFile);
console.log(JSON.stringify({success:true,scenarioCount:scenarios,assertions:checks,serverControls:'7 passed',quoteExpiry:'3 passed'},null,2));
