(()=>{'use strict';
const $=q=>document.querySelector(q);let token='';
const feedback=$('#admin-feedback'),cases=$('#cases-panel'),details=$('#detail-panel');
const t=(el,text)=>{el.textContent=String(text??'—');return el};
const cell=(row,value)=>row.appendChild(t(document.createElement('td'),value));
const fmt=n=>Number.isFinite(Number(n))?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:0}).format(Number(n)):'—';
const names={vivienda:'Mi hogar',condominio:'Condominio',pyme:'Mi PYME',comercial:'Comercial',desarrollo:'Desarrollo',industrial:'Industria',gobierno:'Institución',civil:'Comunidad',profesional:'Profesional'};
async function api(url,options={}){const res=await fetch(url,{...options,cache:'no-store',headers:{'Authorization':'Bearer '+token,...(options.headers||{})}});const json=await res.json().catch(()=>({error:'Respuesta inválida'}));if(!res.ok)throw Error(json.error||'No fue posible consultar');return json}
function drawRows(rows){const body=$('#case-rows');body.replaceChildren();if(!rows.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=7;td.textContent='Todavía no hay solicitudes registradas en esta base.';tr.append(td);body.append(tr)}
for(const item of rows){const row=document.createElement('tr');cell(row,item.folio);cell(row,[item.name,item.email,item.phone].filter(Boolean).join(' · '));cell(row,(names[item.segment]||item.segment)+' · '+(item.city||'Sin ciudad'));cell(row,fmt(item.monthly_expense_mxn));cell(row,item.status+' · '+(item.has_diagnosis?'Diagnóstico completo':'Sin respuestas históricas')+' · '+(item.alert_status==='delivered'?'Correo enviado':'Correo pendiente'));cell(row,(item.quote_status||'Sin cotización')+' · '+(item.payment_status||'Sin cobro'));const td=document.createElement('td'),button=document.createElement('button');button.type='button';button.textContent='Abrir';button.addEventListener('click',()=>openDetail(item.folio));td.append(button);row.append(td);body.append(row)}cases.hidden=false}
async function health(){const panel=$('#health-panel'),checks=$('#health-checks');try{const data=await api('/api/admin/salud');panel.hidden=false;checks.replaceChildren();t($('#health-summary'),data.registroListo?'El registro D1 está listo para recibir solicitudes.':'Recepción incompleta: revisa los puntos pendientes.');for(const [key,passed] of Object.entries(data.checks||{})){const box=document.createElement('div'),term=document.createElement('dt'),value=document.createElement('dd');t(term,key.replace(/([A-Z])/g,' $1'));t(value,passed?'Configurado':'Pendiente');box.append(term,value);checks.append(box)}}catch(_){panel.hidden=true}}
async function operations(){const panel=$('#operations-panel');if(!token)return;try{const data=await api('/api/admin/operacion');panel.hidden=false;
 const rows=$('#operations-rows');rows.replaceChildren();for(const v of data.aggregates||[]){const tr=document.createElement('tr');cell(tr,v.provider);cell(tr,v.stage);cell(tr,v.state);cell(tr,v.total);cell(tr,fmt(Number(v.amount_cents||0)/100));rows.append(tr)}
 const pending=$('#operations-pending');pending.replaceChildren();for(const v of data.needsReview||[]){const tr=document.createElement('tr');cell(tr,v.folio);cell(tr,v.provider);cell(tr,v.stage);cell(tr,v.state);cell(tr,String(v.id)+' · '+String(v.created_at||''));pending.append(tr)}
 t($('#operations-summary'),(data.needsReview||[]).length+' intentos con más de dos horas sin resolver (máximo 25 visibles). Importes orientativos pendientes de conciliación.');
 }catch(e){panel.hidden=false;t($('#operations-summary'),'Panel de pagos pendiente: '+e.message);$('#operations-rows').replaceChildren();$('#operations-pending').replaceChildren()}}
async function list(){feedback.textContent='Consultando Cloudflare D1…';try{const {cases:rows}=await api('/api/admin/clientes');drawRows(rows);feedback.textContent='Se muestran hasta 50 expedientes recientes.'}catch(err){feedback.textContent=err.message;cases.hidden=true;details.hidden=true}}
function add(dl,k,v){const box=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');t(dt,k);t(dd,v===null||v===undefined||v===''?'—':Array.isArray(v)?v.join(', '):typeof v==='object'?JSON.stringify(v):v);box.append(dt,dd);dl.append(box)}
async function openDetail(folio){feedback.textContent='Abriendo expediente…';try{const {case:record,answers}=await api('/api/admin/expediente',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio})});$('#selected-folio').value=folio; t($('#detail-heading'),folio+' · '+(record.name||''));t($('#detail-note'),answers?'Respuestas del diagnóstico guardadas en D1.':'Este registro no tiene diagnóstico completo almacenado; no se deben inventar respuestas históricas.');const dl=$('#detail-fields');dl.replaceChildren();const labels={name:'Nombre',email:'Correo',phone:'WhatsApp',folio:'Folio',segment:'Perfil',city:'Ciudad',roof:'Superficie de techo (m²)',objective:'Necesidad principal',storage:'Almacenamiento',usage:'Usos previstos',timeframe:'Plazo',monthly_expense_mxn:'Gasto mensual orientativo (MXN)',preferred_payment:'Pago preferido',status:'Estado',next_step:'Siguiente paso',consent_version:'Versión del consentimiento',consent_at:'Fecha del consentimiento',created_at:'Fecha de registro'};for(const [k,label] of Object.entries(labels))add(dl,label,record[k]);if(answers)for(const [k,v] of Object.entries(answers))add(dl,'Respuesta · '+k,v);details.hidden=false;details.scrollIntoView({behavior:'smooth',block:'start'});feedback.textContent='Expediente consultado.'}catch(e){feedback.textContent=e.message}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&token){list();operations()}});setInterval(()=>{if(!document.hidden&&token){list();operations()}},30000);
$('#login-form').addEventListener('submit',e=>{e.preventDefault();token=$('#admin-token').value.trim();$('#admin-token').value='';if(!token)return;list();health();metrics();operations()});$('#refresh').addEventListener('click',()=>{list();operations()});$('#refresh-operations').addEventListener('click',operations);$('#close-detail').addEventListener('click',()=>details.hidden=true);

// V50 privileged commercial controls: nothing stored in the browser and amounts controlled by the Worker.
const commercialMessage=$('#admin-commercial-feedback');
$('#approved-quote-form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,folio=$('#selected-folio').value;
 if(!token||!folio||!form.reportValidity())return;
 const fields=Object.fromEntries(new FormData(form).entries());
 const body={folio,summary:String(fields.summary||''),paymentPlan:String(fields.paymentPlan||'50-50'),contractText:String(fields.contractText||'').trim()};
 const costs=['amountCents','directCostCents','operatingCostCents','warrantyReserveCents','cacCents','initialCashCents'];
 for(const key of costs){const n=Number(fields[key]);if(!Number.isFinite(n)||n<0||!Number.isSafeInteger(Math.round(n*100))){commercialMessage.textContent='Importe inválido';return;}body[key]=Math.round(n*100)}
 for(const key of ['rfq1Ref','rfq2Ref','technicalEvidenceRef','legalEvidenceRef','financeEvidenceRef','customerAcceptanceRef'])body[key]=String(fields[key]||'').trim();
 for(const key of ['technicalApproved','legalApproved','financeApproved','customerAccepted'])body[key]=fields[key]==='on';
 if(!confirm('¿Registrar esta cotización contractual? Confirma que las aprobaciones y referencias corresponden al folio '+folio+'.'))return;
 commercialMessage.textContent='Validando márgenes y aprobaciones en servidor…';
 try{const d=await api('/api/admin/cotizacion',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});commercialMessage.textContent='Cotización aprobada y guardada. ID: '+d.quoteId;await list();}
 catch(err){commercialMessage.textContent='No registrada: '+err.message;}
});
$('#project-status-form').addEventListener('submit',async e=>{e.preventDefault();if(!token||!$('#selected-folio').value||!e.currentTarget.reportValidity())return;
 const body={folio:$('#selected-folio').value,stage:$('#admin-status').value,nextStep:$('#admin-next-step').value.trim()};
 commercialMessage.textContent='Comprobando autorizaciones…';
 try{await api('/api/admin/estado',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});commercialMessage.textContent='Estado actualizado';await list();}
 catch(err){commercialMessage.textContent='Operación bloqueada: '+err.message;}
});
async function metrics(){try{const d=await api('/api/admin/metricas');const box=$('#analytics-metrics');box.replaceChildren();if(!d.enabled)return;for(const item of d.events||[]){const section=document.createElement('div');const title=document.createElement('span');title.textContent=item.event_type.replaceAll('_',' ');const total=document.createElement('strong');total.textContent=String(item.total);section.append(title,total);box.append(section)}$('#analytics-panel').hidden=false}catch(_){} }
$('#bbva-reconcile-form').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,folio=$('#selected-folio').value;if(!token||!folio||!form.reportValidity())return;
 const values=Object.fromEntries(new FormData(form).entries()),amount=Number(values.confirmedAmountMxn);
 if(!Number.isFinite(amount)||amount<=0||!Number.isSafeInteger(Math.round(amount*100))){commercialMessage.textContent='Importe bancario inválido';return;}
 const body={folio,bankReference:String(values.bankReference||'').trim().toUpperCase(),bankEvidenceId:String(values.bankEvidenceId||'').trim(),confirmedAmountCents:Math.round(amount*100),confirmedByBank:values.confirmedByBank==='on'};
 if(!confirm('ATENCIÓN: ¿Confirmas haber visto este abono en el ESTADO DE CUENTA bancario, con el importe exacto, y que no corresponde a otro folio? Esta acción acreditará un pago y podrá enviar confirmación al cliente.'))return;
 commercialMessage.textContent='Conciliando con la base de operaciones…';
 try{await api('/api/admin/conciliar-bbva',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});commercialMessage.textContent='Abono conciliado una vez. Conserva evidencia bancaria por canal seguro.';form.reset();await list();}
 catch(err){commercialMessage.textContent='No conciliado: '+err.message;}
});
$('#admin-document-form').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,folio=$('#selected-folio').value;if(!token||!folio||!form.reportValidity())return;const values=Object.fromEntries(new FormData(form).entries());commercialMessage.textContent='Guardando documento protegido…';try{await api('/api/admin/documento',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,kind:values.kind,title:values.title,body:values.body})});commercialMessage.textContent='Documento disponible mediante consulta autenticada del expediente.';form.reset()}catch(e){commercialMessage.textContent='No guardado: '+e.message}});
})();
