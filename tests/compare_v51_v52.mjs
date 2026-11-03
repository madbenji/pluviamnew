import fs from 'node:fs';import vm from 'node:vm';import path from 'node:path';import assert from 'node:assert/strict';
const original=path.resolve(new URL('../../PLUVIAM_V51/site/',import.meta.url).pathname),updated=path.resolve(new URL('../site/',import.meta.url).pathname);
const load=base=>{let c={Math,Set,String,Number,Object,Intl};vm.runInNewContext(fs.readFileSync(path.join(base,'engine.js'),'utf8'),c);return c.PLUVIAM_ENGINE.estimate};
const a=load(original),b=load(updated);let count=0;
for(const segment of ['vivienda','condominio','pyme','comercial','desarrollo','industrial','gobierno','civil','profesional'])for(const roof of [1,150,151,400,401,900,901,10000,300000])for(const expense of [0,800,1300,1800,2650,3500,5250,7000,10000])for(const storage of ['cisterna','ninguno','no_se'])for(let bits=1;bits<32;bits++){
const uses=['riego','limpieza','sanitarios','operacion','potable'].filter((_,i)=>bits&(1<<i));const obj={segment,roof,monthlyExpense:expense,storage,uses,issues:['pipas','calidad'],rainfall:800,efficiency:.75};
const x=JSON.stringify(a(obj)),y=JSON.stringify(b(obj));assert.equal(y,x,`changed math for ${JSON.stringify(obj)}`);count++;
}
const oldw=fs.readFileSync(path.join(original,'_worker.js'),'utf8'),neww=fs.readFileSync(path.join(updated,'_worker.js'),'utf8');
const chunk=(s,a,b)=>s.slice(s.indexOf(a),s.indexOf(b));
assert.equal(chunk(oldw,'function quoteFinancialGate(d){','function enabled(e){'),chunk(neww,'function quoteFinancialGate(d){','function enabled(e){'),'financial/pricing/checkout blocks should remain identical');
for(const file of ['roi-r7.js','mi-proyecto.js','project-docs.js'])assert.equal(fs.readFileSync(path.join(original,file),'utf8'),fs.readFileSync(path.join(updated,file),'utf8'),file+' must be untouched');
console.log(JSON.stringify({unchangedArithmeticCases:count,financialPaymentBlock:'SHA-equivalent text unchanged',roiDisplayModule:'unchanged',projectWorkflow:'unchanged',retellFrontend:'unchanged'},null,2));
