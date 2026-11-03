/* PLUVIAM V52: show the frozen, server-calculated diagnosis on the authenticated project page. */
(()=>{'use strict';
const mx=n=>Math.round(n).toLocaleString('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0});
const liters=n=>Math.round(n).toLocaleString('es-MX')+' L/año';
window.addEventListener('pluviam:proyecto',event=>{
 const zone=document.getElementById('project-result');
 zone?.querySelector('#diagnostico-guardado')?.remove();
 const s=event.detail?.data?.diagnosticSnapshot;
 if(!zone||!s?.version||!s.output||!s.inputs)return;
 const o=s.output,i=s.inputs;
 const el=document.createElement('section');el.id='diagnostico-guardado';el.className='info-panel';
 const title=document.createElement('h3');title.textContent='Diagnóstico original guardado';el.append(title);
 const p=document.createElement('p');p.textContent='Este es el escenario que quedó registrado con tu folio. No se recalcula con precios o supuestos nuevos.';el.append(p);
 const metrics=[['Captación potencial',Number.isFinite(o.annualPotentialLiters)?liters(o.annualPotentialLiters):'No disponible'],
 ['Techo',i.roofIsExample?`${i.roofM2} m² (ejemplo)`:`${i.roofM2} m² (declarado)`],
 ['Gasto estimado a 3 años',o.threeYearSpendMxn===null?'No declarado':mx(o.threeYearSpendMxn)],
 ['Inversión ilustrativa',o.investmentScenarioMxn?mx(o.investmentScenarioMxn.center):'Por evaluar'],
 ['Recuperación de inversión','No calculable con los datos del test']];
 const dl=document.createElement('dl');dl.className='v52-diagnostic';
 for(const [k,v] of metrics){const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.append(dt,dd)}el.append(dl);
 const foot=document.createElement('small');foot.textContent=`Versión del cálculo: ${s.version}. Lluvia y eficiencia ilustrativas, sin garantía de ahorro ni potabilidad.`;el.append(foot);
 zone.append(el);
});
})();
