/* PLUVIAM V50: payback math is reserved for verified inputs; presentation has zero extra questions. */
(function(root){'use strict';
function num(x){if(x===null||x===undefined||x==='')return null;const n=Number(x);return Number.isFinite(n)&&n>=0?n:null;}
function calculate(input){
 const roof=num(input.roofDeclared),potential=num(input.annualPotential),investment=num(input.investment),demand=num(input.monthlyDemandM3),rate=num(input.avoidableRateM3),maintenance=num(input.maintenanceAnnual);
 if(roof===null||roof<=0||potential===null||potential<=0||investment===null||investment<=0)return {status:'missing'};
 if(demand===null||rate===null||maintenance===null)return {status:'missing'};
 const usefulLiters=Math.min(potential,demand*12000),annualGross=usefulLiters/1000*rate,annualNet=annualGross-maintenance;
 return {status:annualNet>0?'positive':'nonpositive',usefulLiters,annualGross,annualNet,investment,years:annualNet>0?investment/annualNet:null};
}
function overview(model,result){const investment=num(result?.priceBand?.center),expense=num(model?.monthlyExpense),yearSpend=expense>0?expense*12:null;
 return {investment,yearSpend,threeYearSpend:yearSpend===null?null:yearSpend*3,
   yearsOfTotalSpend:investment>0&&yearSpend?investment/yearSpend:null,payback:null};
}
root.PLUVIAM_ROI={calculate,overview};
if(typeof document==='undefined')return;
const fmt=n=>Math.round(n).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const txt=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
window.addEventListener('pluviam:diagnostico',ev=>{const o=overview(ev.detail.model,ev.detail.result);
 txt('roi-simple-investment',o.investment===null?'Pendiente':fmt(o.investment));
 txt('roi-simple-expense',o.threeYearSpend===null?'No declarado':fmt(o.threeYearSpend));
 txt('roi-simple-headline','Lo confirmamos con tu cotización');
 txt('roi-simple-description', 'El test identifica tu potencial e inversión. Para darte un plazo real necesitamos calcular el agua pagada que sí puedes sustituir y el mantenimiento de tu sistema.');
 const compare=o.yearsOfTotalSpend!==null?`Tu inversión orientativa equivale a ${o.yearsOfTotalSpend.toLocaleString('es-MX',{maximumFractionDigits:1})} años de tu gasto total actual. Es una comparación, NO el tiempo de recuperación.`:'Tu escenario se afinará cuando conozcamos tu consumo y la infraestructura disponible.';
 txt('roi-simple-comparison',compare);
});
document.getElementById('roi-quote-shortcut')?.addEventListener('click',()=>document.getElementById('get-quote')?.click());
})(typeof window!=='undefined'?window:globalThis);
