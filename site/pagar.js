(()=>{'use strict';
const $=id=>document.getElementById(id);let project=null,credentials=null,active=null;
const selectedMethod=(new URLSearchParams(location.search).get('metodo')||'').toLowerCase();
let quickChoice=['mercadopago','spei','bbva','crypto'].includes(selectedMethod)?selectedMethod:'mercadopago';
const money=n=>new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format((Number(n)||0)/100);
const tell=(id,msg)=>{$(id).textContent=msg||''};
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function stageNow(p){const stages=Array.isArray(p.quote?.milestones)?p.quote.milestones:[];const states=p.paymentStates||{};
const paidDep=states.deposit==='paid';const paidSecond=states.installation==='paid';return stages.find(x=>states[x.stage]!=='paid'&&(x.stage==='deposit'||x.stage==='installation'&&paidDep&&['instalacion','qa','entregado','mantenimiento'].includes(p.stage)||x.stage==='final'&&paidDep&&(!stages.some(i=>i.stage==='installation')||paidSecond)&&['qa','entregado','mantenimiento'].includes(p.stage)))}
function btnPayment(method,label,caption,icon){const button=el('button','method');button.type='button';const ico=el('span','method-icon',icon),body=el('span','method-body'),heading=el('b','',label),small=el('small','',caption),arrow=el('span','method-arrow','↗');body.append(heading,small);button.append(ico,body,arrow);button.dataset.method=method;button.addEventListener('click',()=>beginPayment(method,button));return button}
function quickFeedback(msg){tell('quick-pay-feedback',msg);}
async function chooseQuick(method){
 quickChoice=method;
 for(const btn of document.querySelectorAll('[data-pay-method]')){const match=btn.dataset.payMethod===method;btn.classList.toggle('quick-pay-selected',match);btn.setAttribute('aria-pressed',String(match));}
 if(!project||!credentials){quickFeedback('Elegiste '+(method==='mercadopago'?'Mercado Pago':method==='spei'?'SPEI / CoDi':'Criptomonedas')+'. Ingresa tu folio y clave para continuar sin abrir Outlook.');$('folio').focus();$('access-form').scrollIntoView({behavior:'smooth',block:'center'});return;}
 const options=project.paymentOptions||[];
 const provider=method==='spei'?(options.includes('mercadopago')?'mercadopago':options.includes('bbva')?'bbva':''):method;
 if(!project.quote?.approved||project.quote?.expired||!active){quickFeedback('Tu expediente existe, pero aún no tiene importe de cobro disponible. El equipo debe finalizar la cotización o la etapa.');return;}
 if(!project.quote.contractAccepted){quickFeedback('Solo falta aceptar la propuesta que aparece debajo para continuar.');$('accept-terms').focus();$('offer').scrollIntoView({behavior:'smooth',block:'center'});return;}
 if(['created','redirected','awaiting_bank'].includes(project.paymentStates?.[active.stage])){quickFeedback('Este pago ya tiene una operación pendiente: consulta la confirmación antes de repetirlo.');return;}
 if(!provider||!options.includes(provider)){quickFeedback('Esta cuenta aún no ofrece ese método para este expediente. Elige otro o solicita su activación.');return;}
 quickFeedback('Preparando la ventana segura del procesador…');
 await beginPayment(provider,document.querySelector('[data-pay-method="'+method+'"]'));
}
for(const btn of document.querySelectorAll('[data-pay-method]'))btn.addEventListener('click',()=>chooseQuick(btn.dataset.payMethod));
function showMethods(){const m=$('methods');m.replaceChildren();if(!project?.quote?.approved){m.append(el('p','quiet','No hay propuesta contractual aprobada.'));return}
if(!project.quote.contractAccepted){m.append(el('p','quiet','Acepta primero las condiciones aprobadas.'));return}
if(project.quote.expired){m.append(el('p','quiet','Tu cotización venció. Solicita una actualización.'));return}
if(!active){m.append(el('p','quiet','No existe un pago autorizado en esta etapa o ya se liquidó.'));return}
const state=project.paymentStates?.[active.stage];if(['created','redirected','awaiting_bank'].includes(state)){m.append(el('p','quiet','Existe un pago iniciado. Espera conciliación antes de intentar otro.'));return}
const options=project.paymentOptions||[];
if(options.includes('mercadopago'))m.append(btnPayment('mercadopago','Tarjeta o SPEI · Mercado Pago','Checkout Pro seguro; SPEI sujeto a disponibilidad.','▤'));
if(options.includes('stripe'))m.append(btnPayment('stripe','Tarjeta · Stripe','Pago protegido en sitio de Stripe.','▣'));
if(options.includes('bbva'))m.append(btnPayment('bbva','Transferencia BBVA','Requiere confirmación bancaria; no es instantánea.','⌁'));
if(options.includes('crypto'))m.append(btnPayment('crypto','Criptomonedas · NOWPayments','BTC / USDT / otras según disponibilidad y mínimo del proveedor.','₿'));
if(!m.childElementCount)m.append(el('p','quiet','Los métodos de pago todavía no están habilitados en este proyecto.'));
const desired=selectedMethod==='spei'?'mercadopago':selectedMethod;
const preferred=[...m.querySelectorAll('button.method')].find(b=>b.dataset.method===desired);
if(preferred){preferred.classList.add('method-preferred');preferred.prepend(el('span','sr-only','Método elegido en la página principal: '));}
else if(selectedMethod&&m.querySelector('button.method'))m.prepend(el('p','quiet','El método elegido no está disponible para esta cotización. Usa una de las opciones habilitadas.'));
}
function render(){const q=project.quote;active=stageNow(project);$('empty-state').hidden=true;$('offer').hidden=false;
$('offer-badge').textContent=q.approved?(q.contractAccepted?'Aceptación confirmada':'Pendiente de aceptación'):'Sin cotización contractual';
$('offer-summary').textContent=q.approved?(q.summary||'Propuesta de infraestructura hídrica'):'Tu expediente está registrado. En cuanto se apruebe una cotización real, aparecerá aquí.';
$('total').textContent=q.approved?money(q.amountCents):'—';$('milestone-label').textContent=active?active.label:'Siguiente hito';$('due').textContent=active?money(active.amountCents):'—';
const milestones=$('milestone-list');milestones.replaceChildren();for(const m of (q.milestones||[])){const p=el('p');p.append(el('span','',m.label),el('b','',money(m.amountCents)+' · '+(project.paymentStates?.[m.stage]==='paid'?'Conciliado':project.paymentStates?.[m.stage]||'Pendiente')));milestones.append(p)}
$('offer-terms').textContent=q.approved?q.contractText:'Aún no hay condiciones contractuales aprobadas.';$('accept-terms').checked=!!q.contractAccepted;$('accept-terms').disabled=!!q.contractAccepted;
$('accept-btn').disabled=!q.approved||!!q.contractAccepted;$('accept-btn').hidden=!q.approved||!!q.contractAccepted;
$('download-pdf').disabled=!q.approved;tell('accept-status',q.contractAccepted?'Aceptación registrada para esta versión exacta del contrato.':'');showMethods();quickFeedback('Expediente consultado. Elige una de las tres tarjetas de arriba para pagar, o revisa las condiciones de tu propuesta.')}
async function jsonPost(route,data){const r=await fetch(route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error||'No disponible');return j}
async function refresh(){project=await jsonPost('/api/proyecto',credentials);render()}
$('access-form').addEventListener('submit',async e=>{e.preventDefault();const b=$('lookup');b.disabled=true;tell('lookup-message','Consultando expediente…');credentials={folio:$('folio').value.trim(),token:$('token').value.trim()};try{await refresh();sessionStorage.setItem('pluviam-project',JSON.stringify({folio:credentials.folio,accessToken:credentials.token}));$('access-form').hidden=true;$('account-summary').hidden=false;$('account-summary').textContent='Expediente '+credentials.folio+' · Sesión verificada';tell('lookup-message','');if(sessionAutoLookup&&selectedMethod){sessionAutoLookup=false;void chooseQuick(selectedMethod);}}catch(err){project=null;active=null;credentials=null;$('offer').hidden=true;$('empty-state').hidden=false;$('access-form').hidden=false;$('account-summary').hidden=true;$('milestone-list').replaceChildren();$('methods').replaceChildren();$('offer-terms').textContent='';$('accept-terms').checked=false;tell('lookup-message',err.message)}finally{b.disabled=false}});
$('accept-btn').addEventListener('click',async()=>{if(!project?.quote?.approved||!$('accept-terms').checked){tell('accept-status','Marca la aceptación después de leer la propuesta.');return}const b=$('accept-btn');b.disabled=true;try{await jsonPost('/api/contrato/aceptar',{...credentials,agree:true,termsVersion:project.quote.termsVersion,offerDigest:project.quote.offerDigest});await refresh()}catch(e){tell('accept-status',e.message);b.disabled=false}});
$('download-pdf').addEventListener('click',async()=>{if(!credentials||!project?.quote?.approved)return;const b=$('download-pdf');b.disabled=true;try{const r=await fetch('/api/propuesta/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(credentials),cache:'no-store'});if(!r.ok){const j=await r.json();throw Error(j.error||'PDF no disponible')}const blob=await r.blob();const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='PLUVIAM-'+credentials.folio+'-propuesta.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(u),1500)}catch(e){tell('accept-status',e.message)}finally{b.disabled=false}});
async function beginPayment(method,button){if(!credentials||!active)return;button.disabled=true;try{const j=await jsonPost('/api/checkout',{...credentials,provider:method,stage:active.stage});if(j.manual){const panel=el('div','bank-info');for(const [label,value] of [['Banco',j.bank],['Beneficiario',j.accountName],['CLABE',j.clabe],['Referencia',j.bankRef],['Importe',money(j.amountCents)],['Confirmación',j.instructions]])panel.append(el('p','',label+': '+value));$('methods').replaceChildren(panel);return}if(!j.url||new URL(j.url).protocol!=='https:')throw Error('Enlace de cobro inválido');location.assign(j.url)}catch(err){const uncertain=err instanceof TypeError||/fetch|network|respuesta|JSON/i.test(String(err.message));tell('accept-status',uncertain?'No se pudo confirmar si el proveedor recibió la solicitud. Por seguridad, consulta el estado del expediente antes de volver a pagar.':err.message);button.disabled=uncertain;}}
// Persistencia sólo de sesión en este navegador; jamás pasar clave privada por URL.
let sessionAutoLookup=false;try{const previous=JSON.parse(sessionStorage.getItem('pluviam-project')||'null');if(/^PLV-[A-Z0-9-]{8,46}$/.test(previous?.folio||'')&&typeof previous.accessToken==='string'&&previous.accessToken.length>=20){$('folio').value=previous.folio;$('token').value=previous.accessToken;sessionAutoLookup=true;}}catch(_){}
const p=new URLSearchParams(location.search);if(p.has('folio'))$('folio').value=(p.get('folio')||'').slice(0,65); // No private token accepted in the URL.
if(selectedMethod){queueMicrotask(()=>{const matching=document.querySelector('[data-pay-method=\"'+(selectedMethod==='bbva'?'spei':selectedMethod)+'\"]');if(matching){matching.classList.add('quick-pay-selected');matching.setAttribute('aria-pressed','true')}});const display={mercadopago:'Mercado Pago',spei:'SPEI mediante pasarela',bbva:'Transferencia BBVA',stripe:'Stripe',crypto:'NOWPayments'};const msg=display[selectedMethod];if(msg)tell('lookup-message','Quieres pagar por '+msg+'. Consulta tu folio y clave para verificar si está habilitado. No se genera un cargo al entrar.');}
if(sessionAutoLookup){queueMicrotask(()=>$('access-form').requestSubmit());}
})();