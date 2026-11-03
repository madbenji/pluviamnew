
import { handleBetaRequest } from './beta-overdrive.js';

// Internal scenario — runs only in the Pages Worker, not in public asset JavaScript.
// PLUVIAM_PRICE_ENGINE_SHARED_BEGIN
const PUBLIC_PRICE_ENGINE=(()=>{const scope={};
/* Public hydrological estimator. Shows indicative investment scenarios by profile and expense band. */
(function(root){'use strict';
const segments=new Set(['vivienda','condominio','pyme','comercial','desarrollo','industrial','gobierno','civil','profesional']);
const EXAMPLE_ROOFS=Object.freeze({vivienda:100,condominio:650,pyme:200,comercial:500,desarrollo:950,industrial:1200,gobierno:700,civil:450,profesional:100});
const EXPENSE_BAND_ESTIMATES=Object.freeze({A:1300,B:2650,C:5250,D:7000});
const CALCULATION_VERSION='V46-R7-CALC-2026-10-24';
const plans={vivienda:'PLUVIAM HOME / RESERVA HÍDRICA',condominio:'PLUVIAM COLLECTIVE',pyme:'PLUVIAM BUSINESS',comercial:'PLUVIAM COMMERCIAL',desarrollo:'PLUVIAM BUILD',industrial:'PLUVIAM ENGINEERING',gobierno:'PLUVIAM CIVIC',civil:'PLUVIAM COMMUNITY',profesional:'PLUVIAM ACADEMY'};
const issueGuidance={desabasto:'Analizar respaldo ante cortes y continuidad del suministro.',pipas:'Dimensionar almacenamiento para reducir dependencia de pipas.',sarro:'Evaluar dureza y compatibilidad de materiales antes de elegir tratamiento.',calidad:'Solicitar análisis de calidad y tratamiento específico por uso.',costos:'Medir consumos y pérdidas para proponer ahorro con evidencia.',sustentabilidad:'Priorizar superficie de captación y aprovechamiento de lluvia.'};
const useGuidance={riego:'Separar circuitos para riego y uso exterior.',limpieza:'Definir puntos de limpieza con tratamiento apropiado.',sanitarios:'Evaluar circuito no potable dedicado a sanitarios.',operacion:'Evaluar seguridad de procesos y caudales del negocio.',potable:'Consumo humano sólo tras potabilización validada y análisis sanitario.'};
const reasons={vivienda:'Escenario residencial de referencia basado en el perfil y el gasto hídrico declarado.',condominio:'Escenario orientativo para operación compartida y áreas comunes.',pyme:'Escenario orientativo para negocio, continuidad operativa y almacenamiento.',comercial:'Escenario orientativo para superficie comercial y demanda operativa.',desarrollo:'Escenario orientativo para preingeniería, coordinación y obra por etapas.',industrial:'Escenario orientativo para infraestructura productiva y continuidad de planta.',gobierno:'Escenario orientativo para proyecto institucional sujeto a validación técnica.',civil:'Escenario orientativo para proyecto colectivo y operación comunitaria.',profesional:'Escenario orientativo canalizable para proyecto profesional o de cliente final.'};
const matrix={vivienda:{A:[95000,135000],B:[135000,185000],C:[185000,260000],D:[260000,380000]},condominio:{A:[220000,380000],B:[380000,650000],C:[650000,1050000],D:[1050000,1800000]},pyme:{A:[180000,320000],B:[320000,540000],C:[540000,880000],D:[880000,1400000]},comercial:{A:[350000,650000],B:[650000,1100000],C:[1100000,1900000],D:[1900000,3200000]},desarrollo:{A:[500000,900000],B:[900000,1600000],C:[1600000,3000000],D:[3000000,5500000]},industrial:{A:[700000,1200000],B:[1200000,2300000],C:[2300000,4800000],D:[4800000,9000000]},gobierno:{A:[300000,550000],B:[550000,950000],C:[950000,1700000],D:[1700000,3000000]},civil:{A:[250000,450000],B:[450000,800000],C:[800000,1500000],D:[1500000,2800000]},profesional:{A:[250000,450000],B:[350000,650000],C:[650000,1200000],D:[1200000,2200000]}};
function inferBand(expense){if(expense>=7000)return 'D'; if(expense>=3500)return 'C'; if(expense>=1800)return 'B'; if(expense>=800)return 'A'; return 'B'}
function adjustRange(range,s){let [min,max]=range;const area=Math.max(1,Math.min(300000,Number(s.roof)||100));const uses=Array.isArray(s.uses)?[...new Set(s.uses)]:String(s.uses||'riego').split(',').filter(Boolean);const storage=s.storage||'cisterna';let factor=1;if(area>150&&area<=400)factor+=0.08;else if(area>400&&area<=900)factor+=0.15;else if(area>900)factor+=0.24;if(storage==='ninguno'||storage==='no_se')factor+=0.06;if(uses.includes('sanitarios'))factor+=0.05;if(uses.includes('limpieza'))factor+=0.03;if(uses.includes('operacion'))factor+=0.06;if(uses.includes('potable'))factor+=0.09;min=Math.round(min*factor/1000)*1000;max=Math.round(max*factor/1000)*1000;return [min,max]}
function estimate(s){s=s||{};const segment=segments.has(s.segment)?s.segment:'vivienda';const area=Math.max(1,Math.min(300000,Number(s.roof)||100));const rainfall=Math.max(200,Math.min(2000,Number(s.rainfall)||800));const efficiency=Math.max(.4,Math.min(.9,Number(s.efficiency)||.75));const uses=Array.isArray(s.uses)?[...new Set(s.uses)]:String(s.uses||'riego').split(',').filter(Boolean);const monthlyExpense=Math.max(0,Math.min(100000000,Number(s.monthlyExpense)||0));const issues=Array.isArray(s.issues)?[...new Set(s.issues)].filter(x=>Object.hasOwn(issueGuidance,x)):[];const actions=[...issues.map(x=>issueGuidance[x]),...uses.filter(x=>Object.hasOwn(useGuidance,x)).map(x=>useGuidance[x])];const spendYear=monthlyExpense?monthlyExpense*12:null;const annualPotential=Math.round(area*rainfall*efficiency);const expenseUnknown=!monthlyExpense;const band=inferBand(monthlyExpense);let priceBand=null;if(band&&matrix[segment]){const [min,max]=adjustRange(matrix[segment][band],s);priceBand={min,center:Math.round((min+max)/2),max,band,assumedExpense:expenseUnknown};}return {segment,area,rainfall,efficiency,uses,monthlyExpense,annualPotential,spendYear,priceBand,actions,packageName:plans[segment]||'PLUVIAM / DISEÑO PERSONALIZADO',reason:reasons[segment],confidence:expenseUnknown?'Estimación exploratoria: banda de gasto B supuesta porque no se declaró un gasto.':'Escenario económico orientativo para conversación comercial.'}}
root.PLUVIAM_ENGINE={estimate,EXAMPLE_ROOFS,EXPENSE_BAND_ESTIMATES,CALCULATION_VERSION};
})(scope);

return scope.PLUVIAM_ENGINE;})();
// PLUVIAM_PRICE_ENGINE_SHARED_END
/* PLUVIAM V40 Cloudflare Pages advanced-mode Worker.
 * No PII accepted until DB, Turnstile, approved notice & operator GO are configured.
 * All prices for payment are read from approved_quotes, NEVER browser estimates.
 */
const JSON_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'};
const SEGMENTS=new Set(['vivienda','condominio','pyme','comercial','desarrollo','industrial','gobierno','civil','profesional']);
const STAGES={recibida:'Solicitud recibida',calificacion:'Evaluación inicial',visita:'Diagnóstico / visita pendiente',diseno:'Diseño y presupuesto en preparación',propuesta:'Propuesta disponible',contrato:'Contrato y confirmación',instalacion:'Instalación en proceso',qa:'Control de calidad',entregado:'Sistema entregado',mantenimiento:'Mantenimiento',cancelado:'Solicitud cerrada'};
function respond(o,status=200){return new Response(JSON.stringify(o),{status,headers:JSON_HEADERS})}
function norm(s,n=120){return typeof s==='string'?s.trim().slice(0,n):''}
function validNumber(n,min,max){return typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max}
function originAllowed(req){let origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin}
// Compatibility restoration: do not require extra PRIVACY_NOTICE_GO_APPROVED gate introduced in VFinal.
// Existing legal approval, consent capture and Turnstile remain; Cloudflare runtime flags control reception.
function privacyReady(env){return env.LEGAL_APPROVED==='true'}
function gate(env){return !!(env.DB&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&privacyReady(env)&&env.LEADS_ENABLED==='true')}
function payGate(env){return !!(gate(env)&&env.PAYMENTS_ENABLED==='true'&&env.COMMERCE_GO_APPROVED==='true'&&env.CONTRACT_TERMS_APPROVED==='true')} // Independent audited commercial GO; fail closed by default
// Evita presentar el formulario como operativo si la migración D1 no está aplicada.
async function schemaReady(env){if(!env.DB)return false;try{for(const table of ['lead_cases','lead_diagnostics','lead_alerts'])await env.DB.prepare('SELECT '+(table==='lead_cases'?'folio':table==='lead_diagnostics'?'folio':'folio')+' FROM '+table+' LIMIT 1').first();return true}catch(_){return false}}

// Readiness must reflect the contract and email idempotency migrations, not just a flag.
async function paymentSchemaReady(env){if(!env.DB)return false;try{
 await env.DB.prepare('SELECT contract_text,payment_plan FROM approved_quotes LIMIT 1').first();
 await env.DB.prepare('SELECT offer_digest FROM quote_customer_acceptances_p0 LIMIT 1').first();
 await env.DB.prepare('SELECT status FROM customer_payment_notifications_v1 LIMIT 1').first();
 await env.DB.prepare('SELECT status FROM customer_email_dispatch_lock_p0 LIMIT 1').first();return true;
 }catch(_){return false}}
// Fail closed for manual bank transfers unless this D1 schema has the unique bank reconciliation index.
async function bankReady(env){
 if(!env.DB||env.BANK_PAYMENT_ENABLED!=='true'||env.BANK_ACCOUNT_VERIFIED!=='true'||
    !/^\d{18}$/.test(env.BBVA_CLABE||'')||!norm(env.BBVA_BENEFICIARY_NAME,200))return false;
 try{const idx=await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_bbva_evidencia_pagada_unica'").first();return !!idx;}
 catch(_){return false;}
}
async function hash(v){const raw=new TextEncoder().encode(v);const dig=await crypto.subtle.digest('SHA-256',raw);return Array.from(new Uint8Array(dig),x=>x.toString(16).padStart(2,'0')).join('')}
async function hmacHex(key,text){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',k,new TextEncoder().encode(text))),x=>x.toString(16).padStart(2,'0')).join('')}
function safeSame(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0}
async function validateTurnstile(request,env,token){const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});const ip=request.headers.get('CF-Connecting-IP');if(ip)body.set('remoteip',ip);const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});const v=await r.json();return v.success===true&&v.hostname===new URL(request.url).hostname}
async function limited(request,env){if(!env.ABUSE_PEPPER)return true;let ip=request.headers.get('CF-Connecting-IP');if(!ip)return true;const window=Math.floor(Date.now()/3600000);const signature=await hash(env.ABUSE_PEPPER+':'+ip+':'+window);await env.DB.prepare('DELETE FROM abuse_windows WHERE expires_at < ?').bind(new Date().toISOString()).run();const existing=await env.DB.prepare('SELECT attempts FROM abuse_windows WHERE signature=?').bind(signature).first();if(existing&&existing.attempts>=8)return false;const expire=new Date(Date.now()+86400000).toISOString();await env.DB.prepare('INSERT INTO abuse_windows(signature,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(signature) DO UPDATE SET attempts=attempts+1').bind(signature,expire).run();return true}
async function bodyJson(request,max=12000){const len=Number(request.headers.get('content-length')||0);if(len>max)throw new Error('Tamaño de solicitud excesivo');const t=await request.text();if(t.length>max)throw new Error('Contenido demasiado largo');return JSON.parse(t)}
async function publicDiagnosis(req){let p;try{p=await bodyJson(req,2000)}catch{return respond({error:'Diagnóstico inválido'},400)}
 const seg=norm(p.segment,35),roof=Number(p.roof),storage=norm(p.storage,35),uses=Array.isArray(p.uses)?p.uses:[],issues=Array.isArray(p.issues)?p.issues:[],city=norm(p.city,50),expense=Number(p.monthlyExpense);
 if(!SEGMENTS.has(seg)||!validNumber(roof,1,300000)||!['cisterna','ninguno','no_se'].includes(storage)||uses.length>5||!uses.length||new Set(uses).size!==uses.length||uses.some(v=>!['riego','limpieza','sanitarios','operacion','potable'].includes(v))||issues.length>6||new Set(issues).size!==issues.length||issues.some(v=>!['desabasto','pipas','sarro','calidad','costos','sustentabilidad'].includes(v))||!validNumber(expense,0,100000000))return respond({error:'Dimensiones inválidas'},422);
 const x=PUBLIC_PRICE_ENGINE.estimate({segment:seg,roof,storage,uses,issues,city,monthlyExpense:expense,rainfall:800,efficiency:.75});
 return respond({pricingVersion:'V46-R7',calculationVersion:PUBLIC_PRICE_ENGINE.CALCULATION_VERSION,packageName:x.packageName,reason:x.reason,priceBand:x.priceBand,actions:x.actions,confidence:x.confidence,annualPotential:x.annualPotential,assumption:'Precio orientativo, no constituye cotización ni genera obligación de pago.'});
}
async function identity(db,folio,token){if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio)||token.length>200||token.length<20)return null;let row=await db.prepare('SELECT folio,access_hash,status,next_step FROM lead_cases WHERE folio=?').bind(folio).first();if(!row||!safeSame(row.access_hash,await hash(token)))return null;return row}
// Alertas persistentes: registrar en D1 dentro de la misma transacción que el lead.
// El proveedor se llama con clave idempotente; fallas de correo NUNCA borran el prospecto.
async function deliverLeadAlert(env,folio){
 if(!env.RESEND_API_KEY||!env.RESEND_FROM||!env.DB)return 'pending';
 try{
  const row=await env.DB.prepare('SELECT folio,name,email,phone,segment,city FROM lead_cases WHERE folio=?').bind(folio).first();
  if(!row)return 'pending';
  const owner=norm(env.OPERATIONS_EMAIL||'pluviammx@gmail.com',180);
  if(!/^\S+@\S+\.\S+$/.test(owner))return 'pending';
  const message={from:env.RESEND_FROM,to:[owner],subject:'PLUVIAM | Nueva solicitud '+folio,
   text:['PLUVIAM · Nuevo expediente registrado','Folio: '+folio,'Nombre: '+row.name,'Correo: '+row.email,'WhatsApp: '+(row.phone||'No indicado'),'Perfil: '+row.segment,'Ciudad: '+row.city,'Panel privado: https://pluviam.pages.dev/admin.html','No compartas la clave privada del cliente.'].join('\n')};
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'lead-'+folio},body:JSON.stringify(message),signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw Error('Proveedor no confirmó la aceptación del aviso');
  await env.DB.prepare("UPDATE lead_alerts SET status='delivered',attempts=attempts+1,last_error=NULL,sent_at=CURRENT_TIMESTAMP WHERE folio=? AND status='pending'").bind(folio).run();
  return 'sent';
 }catch(_){try{await env.DB.prepare("UPDATE lead_alerts SET attempts=attempts+1,last_error='No confirmado por proveedor' WHERE folio=? AND status='pending'").bind(folio).run()}catch(__){}return 'pending'}
}
async function retryLeadAlerts(env){
 if(!env.DB||!env.RESEND_API_KEY||!env.RESEND_FROM)return {processed:0};
 const rows=await env.DB.prepare("SELECT folio FROM lead_alerts WHERE status='pending' AND attempts<5 ORDER BY created_at LIMIT 5").all();
 let processed=0;for(const item of (rows.results||[])){await deliverLeadAlert(env,item.folio);processed++}return {processed};
}
// Guardado previo de avances: sólo datos de cuestionario SIN identidad, tras consentimiento explícito.
async function saveDraft(request,env){
 if(!env.DB||!privacyReady(env)||env.DRAFTS_ENABLED!=='true')return respond({error:'Avances en D1 todavía no habilitados.'},503);
 if(!(await limited(request,env)))return respond({error:'Inténtalo de nuevo más tarde.'},429);
 let d;try{d=await bodyJson(request,3500)}catch{return respond({error:'Avance inválido'},400)}
 const token=norm(d.token,125),stage=d.step,answers=d.answers;
 if(!/^[-a-f0-9]{36}-[-a-f0-9]{36}$/i.test(token)||d.consent!==true||!Number.isInteger(stage)||stage<0||stage>5||!answers||typeof answers!=='object'||Array.isArray(answers))return respond({error:'Revisa tu autorización y diagnóstico'},422);
 const allowed=new Set(['segment','city','cp','issues','uses','storage','roof','monthlyRange']);
 if(Object.keys(answers).some(k=>!allowed.has(k))||Object.values(answers).some(v=>typeof v==='string'&&v.length>100))return respond({error:'Datos no permitidos en el borrador'},422);
 const segment=norm(answers.segment,35),city=norm(answers.city,60);
 if(!SEGMENTS.has(segment)||!['CDMX','Guadalajara','Estado de México','Otra ciudad'].includes(city)||!['','A','B','C','D'].includes(answers.monthlyRange||''))return respond({error:'Datos del borrador inválidos'},422);
 if(!Array.isArray(answers.uses)||!Array.isArray(answers.issues)||answers.uses.length>6||answers.issues.length>6||answers.uses.some(v=>!['riego','limpieza','sanitarios','operacion','potable'].includes(v))||answers.issues.some(v=>!['desabasto','pipas','sarro','calidad','costos','sustentabilidad'].includes(v))||!/^\d{0,5}$/.test(String(answers.cp||''))||!['cisterna','ninguno','no_se'].includes(answers.storage)||!(answers.roof===''||answers.roof===null||Number.isFinite(Number(answers.roof))&&Number(answers.roof)>=1&&Number(answers.roof)<=300000))return respond({error:'Respuestas inválidas'},422);
 const snapshot=JSON.stringify(answers);if(snapshot.length>1600)return respond({error:'Diagnóstico demasiado largo'},422);
 const id=await hash(token);
 await env.DB.prepare('DELETE FROM lead_drafts WHERE expires_at < CURRENT_TIMESTAMP').run();
 await env.DB.prepare("INSERT INTO lead_drafts(draft_id,step,answers_json,expires_at) VALUES(?,?,?,datetime('now','+7 days')) ON CONFLICT(draft_id) DO UPDATE SET step=excluded.step,answers_json=excluded.answers_json,updated_at=CURRENT_TIMESTAMP,expires_at=excluded.expires_at").bind(id,stage,snapshot).run();
 return respond({saved:true,step:stage});
}
async function deleteDraft(request,env){
 if(!env.DB)return respond({saved:false},200);
 let d;try{d=await bodyJson(request,400)}catch{return respond({error:'Token inválido'},400)}
 const token=norm(d.token,125);if(!/^[-a-f0-9]{36}-[-a-f0-9]{36}$/i.test(token))return respond({error:'Token inválido'},422);
 await env.DB.prepare('DELETE FROM lead_drafts WHERE draft_id=?').bind(await hash(token)).run();return respond({deleted:true});
}
// Canonical, server-recalculated diagnostic. Snapshot is saved in existing answers_json;
// no database migration, no browser-provided savings, no contractual price.
function canonicalDiagnosis(s,a){
 const area=Number(s.roof),expense=Number(s.monthlyExpense||0);
 const scenario=PUBLIC_PRICE_ENGINE.estimate({segment:s.segment,roof:area,storage:s.storage,uses:a.uses,
   issues:a.issues,city:a.city,monthlyExpense:expense,rainfall:800,efficiency:.75});
 const declaredRoof=a.roofIsExample?null:area;
 const band=a.expenseRange||null;
 return {version:PUBLIC_PRICE_ENGINE.CALCULATION_VERSION,pricingVersion:'V46-R7',
  inputs:{segment:s.segment,city:a.city,roofM2:area,roofDeclaredM2:declaredRoof,
   roofIsExample:a.roofIsExample,expenseRange:band,monthlyExpenseIsBandEstimate:!!band,
   monthlyExpenseWasNotDeclared:band===null,monthlyExpenseMxn:expense,
   rainfallMmYear:800,rainfallIllustrative:true,efficiency:.75,uses:[...a.uses],issues:[...a.issues],storage:s.storage},
  output:{annualPotentialLiters:scenario.annualPotential,annualSpendMxn:scenario.spendYear,
   threeYearSpendMxn:scenario.spendYear===null?null:scenario.spendYear*3,
   investmentScenarioMxn:scenario.priceBand?{
    min:scenario.priceBand.min,center:scenario.priceBand.center,max:scenario.priceBand.max,
    band:scenario.priceBand.band,assumedExpense:scenario.priceBand.assumedExpense}:null,
   paybackYears:null,paybackStatus:'no_calculable_con_este_test'},
  units:{volume:'L/año',expense:'MXN',area:'m²'},
  rounding:{annualPotentialLiters:'Math.round(L)',investmentBandMxn:'multiple de 1000 MXN',monthlyBandMxn:'valor ilustrativo fijo',currencyUi:'peso completo MXN'},
  disclaimer:'Potencial y precios exploratorios: no equivalen a suministro, ahorro, contrato ni plazo de recuperación verificado.'};
}
async function newLead(request,env){if(!gate(env)||!(await schemaReady(env)))return respond({error:'La recepción de solicitudes aún no está habilitada.'},503);if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);let s;try{s=await bodyJson(request)}catch{return respond({error:'Formulario inválido.'},400)};
 const name=norm(s.name,100),email=norm(s.email,180).toLowerCase(),phone=norm(s.phone,25),segment=norm(s.segment,40),city=norm(s.city,80),roof=s.roof,rainfall=s.rainfall,efficiency=s.efficiency,turn=norm(s.turnstile,5000);
 if(typeof s.uses!=='string'||!s.uses||s.uses.length>180||s.uses.split(',').length>6||s.uses.split(',').some(x=>!['riego','limpieza','sanitarios','operacion','varios','potable'].includes(x))||!validNumber(Number(s.monthlyExpense||0),0,100000000)||!s.consent||name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!SEGMENTS.has(segment)||!validNumber(roof,1,300000)||!validNumber(rainfall,200,2000)||!validNumber(efficiency,.4,.9)||!turn||!['stripe','mercadopago','msi','bbva','btc','usdc','usdt','xrp','xlm','por_definir'].includes(s.payment))return respond({error:'Revisa los campos y el consentimiento.'},422);
 if(!(await validateTurnstile(request,env,turn)))return respond({error:'No se pudo validar la comprobación anti-spam.'},403);
 const a=s.answers,validIssue=['desabasto','pipas','sarro','calidad','costos','sustentabilidad'];
 if(!a||typeof a!=='object'||a.version!==1||a.segment!==segment||typeof a.city!=='string'||a.city.length>60||!['CDMX','Guadalajara','Estado de México','Otra ciudad'].includes(a.city)||typeof a.cp!=='string'||!/^\d{0,5}$/.test(a.cp)||!Array.isArray(a.issues)||a.issues.length>6||a.issues.some(i=>!validIssue.includes(i))||!Array.isArray(a.uses)||a.uses.join(',')!==s.uses||typeof a.roofIsExample!=='boolean'||!['','A','B','C','D'].includes(a.expenseRange)||!validNumber(Number(a.expenseEstimate),0,100000000)||!validNumber(Number(a.roiSaving??0),0,100000000)||!validNumber(Number(a.roiMaintenance??0),0,100000000)||JSON.stringify(a).length>3500)return respond({error:'Las respuestas del diagnóstico son inválidas.'},422);
 const expectedBand=PUBLIC_PRICE_ENGINE.EXPENSE_BAND_ESTIMATES;
 const roofExample=PUBLIC_PRICE_ENGINE.EXAMPLE_ROOFS[segment];
 const declaredRoofValid=a.roofDeclared===null||
   (typeof a.roofDeclared==='number'&&Number.isFinite(a.roofDeclared)&&a.roofDeclared>=1&&a.roofDeclared<=300000);
 const issueValid=new Set(a.issues).size===a.issues.length;
 const usesValid=new Set(a.uses).size===a.uses.length && a.uses.length>0;
 if(Number(a.expenseEstimate)!==(expectedBand[a.expenseRange]||0)||
 Number(s.monthlyExpense||0)!==Number(a.expenseEstimate)||
 !declaredRoofValid||!issueValid||!usesValid||
 (a.roofDeclared!==null&&a.roofDeclared!==roof)||
 a.roofIsExample!==(a.roofDeclared===null)||
 (a.roofIsExample&&roof!==roofExample)||
 a.storage!==s.storage||!['cisterna','ninguno','no_se'].includes(a.storage)||
 a.issues.length===0&&s.problem!=='evaluacion'||
 a.issues.length>0&&s.problem!==a.issues[0]||
 a.expenseIsEstimate!==true||
 city!==(a.city+(a.cp?' / CP '+a.cp:''))||
 a.expenseRange!==''&&a.expenseRange!==null&&!Object.hasOwn(expectedBand,a.expenseRange))
 return respond({error:'Los datos económicos no coinciden con las respuestas.'},422);
 const canonical=canonicalDiagnosis(s,a);
 const storedAnswers={...a,calculationSnapshot:canonical};
 const folio='PLV-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),accessToken=crypto.randomUUID()+'-'+crypto.randomUUID();
 const fields=[folio,await hash(accessToken),name,email,phone,segment,city,roof,norm(s.problem,35),norm(s.storage,35),norm(s.uses,180),norm(s.timing,35),rainfall,efficiency,norm(s.payment,35),Number(s.monthlyExpense||0),norm(env.CONSENT_VERSION,55),new Date().toISOString()];
 await env.DB.batch([env.DB.prepare('INSERT INTO lead_cases(folio,access_hash,name,email,phone,segment,city,roof,objective,storage,usage,timeframe,rainfall,efficiency,preferred_payment,monthly_expense_mxn,consent_version,consent_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...fields),env.DB.prepare('INSERT INTO lead_diagnostics(folio,answers_json) VALUES(?,?)').bind(folio,JSON.stringify(storedAnswers)),env.DB.prepare("INSERT INTO lead_alerts(folio,status) VALUES(?,'pending')").bind(folio)]);
 const alert=await deliverLeadAlert(env,folio);await aggregateEvent(env,'cotizacion_solicitada');return respond({folio,accessToken,stage:'recibida',alert},201)
}
async function aggregateEvent(env,type){
 if(env.ANALYTICS_ENABLED!=='true'||!env.DB)return;
 const accepted=['cotizacion_solicitada','cotizacion_aprobada','anticipo_confirmado','saldo_liquidado','proyecto_activado'];
 if(!accepted.includes(type))return;
 try{await env.DB.prepare('INSERT INTO analytics_events_v50(id,event_type) VALUES(?,?)').bind(crypto.randomUUID(),type).run()}catch(_){}
}
async function dossierRecords(env,folio){
 if(env.PROJECT_DOCS_ENABLED!=='true')return {recordsAvailable:false,documents:[],events:[]};
 try{
  const ds=await env.DB.prepare('SELECT id,kind,title,body,created_at FROM project_documents_v50 WHERE folio=? ORDER BY created_at DESC LIMIT 30').bind(folio).all();
  const es=await env.DB.prepare('SELECT event_type,description,created_at FROM project_events_v50 WHERE folio=? ORDER BY created_at DESC LIMIT 50').bind(folio).all();
  return {recordsAvailable:true,documents:ds.results||[],events:es.results||[]};
 }catch(_){return {recordsAvailable:false,documents:[],events:[]}}
}
async function dossierEvent(env,folio,eventType,description){
 if(env.PROJECT_DOCS_ENABLED!=='true')return;
 try{await env.DB.prepare('INSERT INTO project_events_v50(id,folio,event_type,description) VALUES(?,?,?,?)').bind(crypto.randomUUID(),folio,eventType,norm(description,600)).run()}catch(_){}
}
// P0: offer snapshot bound to exact quote, amount, plan, scope and written contractual terms.
const CONTRACT_VERSION='PLUVIAM-CONTRATO-P0-2026-10-25';
async function offerDigest(q){return hash(JSON.stringify({version:CONTRACT_VERSION,id:q.id,folio:q.folio,amountCents:q.amount_cents,currency:q.currency,paymentPlan:q.payment_plan||'50-50',approvedAt:q.approved_at,summary:q.summary,contractText:q.contract_text}));}
async function loadQuote(env,folio){return env.DB.prepare('SELECT id,folio,amount_cents,currency,status,approved_at,approved_technical,approved_legal,accepted_by_customer,payment_plan,summary,contract_text FROM approved_quotes WHERE folio=?').bind(folio).first();}
async function acceptedOffer(env,q){
 if(!q||!q.contract_text||!q.summary)return false;
 const row=await env.DB.prepare('SELECT offer_digest,version FROM quote_customer_acceptances_p0 WHERE quote_id=?').bind(q.id).first();
 return !!(row&&row.version===CONTRACT_VERSION&&safeSame(row.offer_digest,await offerDigest(q)));
}
async function offerDetails(env,q){
 const accepted=await acceptedOffer(env,q);return {accepted,digest:await offerDigest(q),termsVersion:CONTRACT_VERSION,contractText:q.contract_text,summary:q.summary};
}
async function acceptOffer(req,env){
 if(!env.DB||env.CONTRACT_TERMS_APPROVED!=='true'||!privacyReady(env))return respond({error:'Aceptación contractual todavía no habilitada'},503);
 let v;try{v=await bodyJson(req,1800)}catch{return respond({error:'Solicitud inválida'},400)}
 const folio=norm(v.folio,70),token=norm(v.token,200);if(!await identity(env.DB,folio,token))return respond({error:'Identidad no verificada'},403);
 const q=await loadQuote(env,folio);if(!q||q.status!=='approved'||q.approved_technical!==1||q.approved_legal!==1||!q.contract_text||quoteExpired(env,q))return respond({error:'Propuesta aprobada y vigente requerida'},409);
 const digest=await offerDigest(q);if(v.agree!==true||v.termsVersion!==CONTRACT_VERSION||!safeSame(norm(v.offerDigest,80),digest))return respond({error:'Aceptación explícita de la versión exacta requerida'},422);
 // Already accepted the same snapshot: idempotent. Changed snapshots need renewed consent when no payment exists.
 const old=await env.DB.prepare('SELECT offer_digest FROM quote_customer_acceptances_p0 WHERE quote_id=?').bind(q.id).first();
 if(old){if(safeSame(old.offer_digest,digest))return respond({ok:true,alreadyAccepted:true});
  const paid=await env.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND state IN ('created','redirected','awaiting_bank','paid')").bind(q.id).first();if(paid)return respond({error:'No puede reemplazarse una aceptación con pagos iniciados'},409);
 }
 // No password/access key/email stored in the acceptance record.
 await env.DB.prepare(`INSERT INTO quote_customer_acceptances_p0(quote_id,folio,offer_digest,version,accepted_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP)
 ON CONFLICT(quote_id) DO UPDATE SET offer_digest=excluded.offer_digest,version=excluded.version,accepted_at=CURRENT_TIMESTAMP`).bind(q.id,folio,digest,CONTRACT_VERSION).run();
 await adminEvent(env.DB,folio,'customer-contract-accepted:'+q.id);return respond({ok:true,offerDigest:digest});
}
function brandedPdf(data){
  // PLUVIAM shared offline PDF renderer. No remote fonts, no browser library, no secrets.
  // Standard PDF vector objects; Latin-1/WinAnsi encoding for Spanish accents.
  const W=595,H=842,navy='#071C2B',navy2='#103247',teal='#117C90',aqua='#54D4DB',ink='#183748',muted='#5C7281',line='#D7E5E8',paper='#FFFFFF',pale='#EAF6F6',amber='#C9AA79';
  const clean=v=>String(v??'').replace(/[\x00-\x1f\x7f]/g,' ').replace(/[\u2013\u2014]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/\u2022/g,'·').replace(/\u20ac/g,'EUR').replace(/[^\x20-\xff]/g,' ').replace(/\s+/g,' ').trim();
  const esc=v=>clean(v).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
  const color=h=>{const s=h.replace('#','');return [0,2,4].map(i=>(parseInt(s.slice(i,i+2),16)/255).toFixed(3)).join(' ')};
  const pages=[];let ops=[],top=0,page=0;
  const box=(x,t,w,h,c)=>ops.push(color(c)+' rg '+x+' '+(H-t-h).toFixed(2)+' '+w+' '+h+' re f');
  const rule=(x,t,w,c=line)=>box(x,t,w,1,c);
  const txt=(x,t,v,size=10,c=ink,bold=false)=>{const val=clean(v);if(!val)return;ops.push(`BT /${bold?'F2':'F1'} ${size} Tf ${color(c)} rg 1 0 0 1 ${x.toFixed(2)} ${(H-t-size).toFixed(2)} Tm (${esc(val)}) Tj ET`)};
  const width=(v,size,bold=false)=>{let n=0;for(const ch of clean(v)){n+=(ch===' '?0.27:/[iIl1.,:;\!'|]/.test(ch)?0.28:/[MW@#%]/.test(ch)?0.81:bold?0.56:0.51)*size}return n;};
  const wrap=(v,size=10,max=500,bold=false)=>{const words=clean(v).split(/\s+/),result=[];let row='';for(let word of words){while(width(word,size,bold)>max){let cut=1;while(cut<word.length&&width(word.slice(0,cut+1),size,bold)<=max)cut++;if(row){result.push(row);row=''}result.push(word.slice(0,cut));word=word.slice(cut)}if(!word)continue;const test=row?row+' '+word:word;if(width(test,size,bold)>max&&row){result.push(row);row=word}else row=test;}if(row)result.push(row);return result.length?result:['-'];};
  const drawLogo=(x,t,scale=1)=>{ // original geometric water drop mark
    const sx=x,sy=H-t;ops.push(`${color(aqua)} rg ${(sx+8*scale).toFixed(2)} ${(sy-22*scale).toFixed(2)} m ${(sx-4*scale).toFixed(2)} ${(sy-9*scale).toFixed(2)} ${(sx+2*scale).toFixed(2)} ${(sy-1*scale).toFixed(2)} ${(sx+8*scale).toFixed(2)} ${(sy+6*scale).toFixed(2)} c ${(sx+14*scale).toFixed(2)} ${(sy-1*scale).toFixed(2)} ${(sx+20*scale).toFixed(2)} ${(sy-9*scale).toFixed(2)} ${(sx+8*scale).toFixed(2)} ${(sy-22*scale).toFixed(2)} c f`)};
  const footer=()=>{rule(40,790,515,line);txt(40,800,'PLUVIAM  /  INGENIERÍA DEL AGUA',8,muted,true);txt(385,800,'Documento privado · Página '+(page+1),8,muted);};
  const start=(first=false)=>{if(ops.length){footer();pages.push(ops.join('\n'));}ops=[];page=pages.length;
    box(0,0,W,H,paper);box(0,0,W,first?221:105,navy);box(0,first?214:98,W,7,teal);
    drawLogo(45,42,.9);txt(69,27,'PLUVIAM',24,paper,true);txt(70,56,'INTELIGENCIA DEL AGUA  /  DISEÑO A TU MEDIDA',8,aqua,true);
    if(first){txt(43,110,data.kind==='ficha'?'FICHA PRIVADA DE PROYECTO':'PROPUESTA TÉCNICA Y COMERCIAL',11,aqua,true);
      txt(43,136,data.kind==='ficha'?'Tu proyecto, en detalle.':'Claridad antes de construir.',19,paper,true);
      txt(43,177,'FOLIO  '+clean(data.folio||'PENDIENTE'),11,paper,true);
    }else txt(44,77,clean(data.kind==='ficha'?'FICHA DE SEGUIMIENTO':'PROPUESTA Y CONDICIONES')+'  /  CONTINUACIÓN',8,paper,true);
    top=first?245:132;
  };
  const ensure=h=>{if(top+h>775)start(false)};
  const heading=(eyebrow,title)=>{ensure(75);txt(43,top,eyebrow.toUpperCase(),8,teal,true);top+=21;txt(43,top,title,15,navy,true);top+=32;rule(43,top-5,508,line)};
  const note=(title,body)=>{const ls=wrap(body,10,470);ensure(ls.length*15+52);box(43,top,509,ls.length*15+42,pale);box(43,top,4,ls.length*15+42,aqua);txt(58,top+10,title,10,navy,true);ls.forEach((s,i)=>txt(58,top+29+i*15,s,10,ink));top+=ls.length*15+56;};
  const para=(value,opt={})=>{const ls=wrap(value,opt.size||10,507,!!opt.bold);const height=ls.length*(opt.leading||15)+(opt.after||9);ensure(height);ls.forEach((s,i)=>txt(43,top+i*(opt.leading||15),s,opt.size||10,opt.color||ink,!!opt.bold));top+=height;};
  const row=(k,v)=>{ensure(30);txt(43,top,k,10,muted);const vals=wrap(v,10,300,true);vals.forEach((s,i)=>txt(245,top+i*15,s,10,navy,true));top+=Math.max(31,vals.length*15+8);rule(43,top-7,508,line)};
  const amount=n=>{const v=Number(n);return Number.isFinite(v)?'$'+(v/100).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2})+' MXN':'Pendiente';};
  const stamp=(label,value)=>{ensure(58);box(43,top,509,54,pale);txt(55,top+6,label.toUpperCase(),8,teal,true);txt(55,top+23,value,13,navy,true);top+=70;};
  start(true);
  if(data.kind==='ficha'){
    heading('01  /  IDENTIDAD Y SEGUIMIENTO','Resumen de tu expediente');
    row('Folio',data.folio||'Pendiente');row('Fecha de consulta',data.issuedAt||'No indicada');row('Estado',data.status||'En evaluación');
    heading('02  /  PROPUESTA','Inversión y calendario');
    if(data.approved){stamp('Inversión total aprobada',amount(data.amountCents));for(const m of (data.milestones||[]))row(String(m.label||m.stage||'Hito'),amount(m.amountCents));}else note('Sin propuesta contractual','El diagnóstico inicial es orientativo. Ningún precio se cobra hasta la aprobación formal de una propuesta.');
    row('Plan',data.paymentPlan||'Por definir');row('Anticipo',data.deposit||'Pendiente');row('Saldo',data.final||'Pendiente');
    heading('03  /  SIGUIENTE PASO','Continúa con seguridad');para('Consulta tu expediente usando folio y clave privada. La clave no figura en este documento.');
    note('Documento informativo','Esta ficha no constituye contrato, CFDI, recibo, garantía adicional ni confirmación bancaria. Las obligaciones dependen del acuerdo firmado y del servicio efectivamente contratado.');
  }else{
    heading('01  /  DATOS DE LA OFERTA','Inversión aprobada');
    stamp('Inversión total aprobada',amount(data.amountCents));
    row('Referencia',data.quoteId||'No especificada');row('Aprobación técnica',data.approvedAt||'Pendiente');row('Moneda',data.currency||'MXN');row('Modalidad',data.paymentPlan||'50-50');
    heading('02  /  CALENDARIO','Pagos por hitos');
    for(const m of(data.milestones||[])) {row(String(m.label||m.stage||'Hito'),amount(m.amountCents));para('Importe verificable en MXN: '+(Number(m.amountCents||0)/100).toFixed(2),{size:8,color:muted});}
    note('Regla de inicio','No se autoriza comprar materiales ni iniciar trabajos antes de confirmar el anticipo conforme al contrato. La liberación de etapas depende de los hitos pactados y las verificaciones correspondientes.');
    heading('03  /  ALCANCE','Qué incluye esta propuesta');para(data.summary||'El alcance detallado queda pendiente de confirmación técnica.');
    heading('04  /  CONDICIONES','Revisa antes de aceptar');para(data.contractText||'Pendiente de términos revisados.',{leading:16});
    heading('05  /  TRAZABILIDAD','Aceptación y versión');
    row('Versión contractual',data.termsVersion||'PENDIENTE');row('Aceptación electrónica',data.acceptedAt||'PENDIENTE');
    para('Huella SHA-256 de la oferta:',{size:9,color:muted});
    const digest=clean(data.offerDigest||'PENDIENTE');const dd=wrap(digest,9,507);dd.forEach(s=>{ensure(17);txt(43,top,s,9,teal);top+=16});top+=12;
    note('Información importante','Este archivo documenta una oferta y su estado de aceptación. No es factura, CFDI, firma electrónica avanzada ni recibo. La captación depende de la lluvia disponible y de las condiciones verificadas del inmueble.');
  }
  footer();pages.push(ops.join('\n'));
  // Build standard uncompressed PDF with readable text and accurate per-byte offsets.
  const objects=[null,'<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids ['+pages.map((_,i)=>(5+i*2)+' 0 R').join(' ')+'] /Count '+pages.length+' >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  pages.forEach((stream,i)=>{const pageNum=5+i*2;objects[pageNum]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${pageNum+1} 0 R >>`;objects[pageNum+1]='<< /Length '+stream.length+' >>\nstream\n'+stream+'\nendstream'});
  let pdf='%PDF-1.4\n%PLUVIAM\n',offsets=[0];for(let i=1;i<objects.length;i++){offsets.push(pdf.length);pdf+=i+' 0 obj\n'+objects[i]+'\nendobj\n'}const xref=pdf.length;pdf+='xref\n0 '+objects.length+'\n0000000000 65535 f \n';for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';pdf+='trailer\n<< /Root 1 0 R /Size '+objects.length+' >>\nstartxref\n'+xref+'\n%%EOF';
  const bytes=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)bytes[i]=pdf.charCodeAt(i)&255;return bytes;
}
function quotePdf(q,acceptedAt){return brandedPdf({kind:'propuesta',folio:q.folio,quoteId:q.id,approvedAt:q.approved_at,amountCents:q.amount_cents,currency:q.currency,paymentPlan:q.payment_plan||'50-50',milestones:paymentMilestones(q.amount_cents,q.payment_plan||'50-50'),summary:q.summary,contractText:q.contract_text,termsVersion:CONTRACT_VERSION,offerDigest:q.offer_digest,acceptedAt:acceptedAt||'PENDIENTE'});}
async function proposalPdf(req,env){if(!env.DB)return respond({error:'No disponible'},503);let d;try{d=await bodyJson(req,1500)}catch{return respond({error:'Solicitud inválida'},400)};
 const folio=norm(d.folio,70),token=norm(d.token,200);if(!await identity(env.DB,folio,token))return respond({error:'Identidad no verificada'},403);
 const q=await loadQuote(env,folio);if(!q||q.status!=='approved'||q.approved_technical!==1||q.approved_legal!==1||!q.contract_text)return respond({error:'Propuesta contractual no disponible'},409);
 const approval=await env.DB.prepare('SELECT accepted_at,offer_digest FROM quote_customer_acceptances_p0 WHERE quote_id=?').bind(q.id).first();const digest=await offerDigest(q);
 const acceptedAt=approval&&safeSame(approval.offer_digest,digest)?approval.accepted_at:null;
 try{return new Response(quotePdf({...q,offer_digest:digest},acceptedAt),{headers:{'Content-Type':'application/pdf','Cache-Control':'no-store, private','Content-Disposition':'attachment; filename="PLUVIAM-'+folio+'-propuesta.pdf"','X-Content-Type-Options':'nosniff'}})}catch{return respond({error:'Documento demasiado extenso; solicita versión contractual revisada'},422)}
}
async function project(req,env){if(!env.DB)return respond({error:'Servicio no configurado.'},503);let v;try{v=await bodyJson(req)}catch{return respond({error:'Datos inválidos'},400)};const row=await identity(env.DB,norm(v.folio,70),norm(v.token,200));if(!row)return respond({error:'Folio o clave no encontrados.'},404);
 let qr;try{qr=await loadQuote(env,row.folio)}catch(_){return respond({error:'Migración contractual P0 aún no aplicada'},503)}const approved=qr&&qr.status==='approved'&&qr.approved_technical===1&&qr.approved_legal===1;const terms=approved?await offerDetails(env,qr):null;
 let paymentStates={};if(approved){const stateRows=await env.DB.prepare('SELECT stage,state FROM payment_attempts WHERE quote_id=?').bind(qr.id).all();for(const p of stateRows.results||[])paymentStates[p.stage]=p.state;}let options=[];const expired=!!(approved&&quoteExpired(env,qr));if(approved&&terms.accepted&&!expired&&payGate(env)){if(env.STRIPE_SECRET_KEY&&env.STRIPE_WEBHOOK_SECRET)options.push('stripe');if(env.MP_ACCESS_TOKEN&&env.MP_WEBHOOK_SECRET)options.push('mercadopago');if(cryptoConfigured(env))options.push('crypto');if(await bankReady(env))options.push('bbva')};const records=await dossierRecords(env,row.folio);
 // Return only the historical snapshot to the authenticated owner; never recalculate past estimates.
 let diagnosticSnapshot=null;
 try{const stored=await env.DB.prepare('SELECT answers_json FROM lead_diagnostics WHERE folio=?').bind(row.folio).first();
  const saved=stored?JSON.parse(stored.answers_json):null;
  if(saved?.calculationSnapshot?.version&&saved.calculationSnapshot.output)diagnosticSnapshot=saved.calculationSnapshot;
 }catch(_){/* Legacy records may not yet have a canonical snapshot. */}
 const retellFollowup=await retellEligibility(env,row.folio,qr?{...qr,approved:!!approved}:null,expired);return respond({diagnosticSnapshot,retellFollowup,folio:row.folio,stage:row.status,stageLabel:STAGES[row.status]||'En evaluación',nextStep:row.next_step,quote:approved?{approved:true,expired,amountCents:qr.amount_cents,currency:qr.currency,approvedAt:qr.approved_at,paymentPlan:qr.payment_plan||'50-50',milestones:paymentMilestones(qr.amount_cents,qr.payment_plan||'50-50'),contractAccepted:terms.accepted,offerDigest:terms.digest,termsVersion:terms.termsVersion,summary:terms.summary,contractText:terms.contractText}:{approved:false},paymentOptions:options,paymentStates,...records})}
function admin(request,env){const token=request.headers.get('Authorization')||'';return env.ADMIN_TOKEN&&safeSame(token,'Bearer '+env.ADMIN_TOKEN)}
async function adminList(request,env){
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 const rows=await env.DB.prepare(`SELECT l.folio,l.name,l.email,l.phone,l.segment,l.city,
 l.monthly_expense_mxn,l.preferred_payment,l.status,l.created_at,
 CASE WHEN d.folio IS NULL THEN 0 ELSE 1 END AS has_diagnosis,
 q.status AS quote_status,q.amount_cents AS quote_amount_cents,a.status AS alert_status,
 (SELECT p.state FROM payment_attempts p JOIN approved_quotes aq ON aq.id=p.quote_id
  WHERE aq.folio=l.folio ORDER BY p.created_at DESC LIMIT 1) AS payment_status
 FROM lead_cases l LEFT JOIN lead_diagnostics d ON d.folio=l.folio
 LEFT JOIN approved_quotes q ON q.folio=l.folio
 LEFT JOIN lead_alerts a ON a.folio=l.folio
 ORDER BY l.created_at DESC,l.folio DESC LIMIT 50`).all();
 await adminEvent(env.DB,'','leads:list');
 return respond({cases:rows.results||[],limit:50});
}
async function adminEvent(db,folio,action){await db.prepare('INSERT INTO admin_events(event_id,folio,action) VALUES(?,?,?)').bind(crypto.randomUUID(),folio,action).run()}

// Reliable post-payment handoff. Outbox is append-only per payment attempt, and
// payload intentionally excludes phone, email, address, and other customer PII.
async function paidOutbox(env,attemptId){
 const row=await env.DB.prepare(`SELECT p.id,p.stage,p.provider,p.expected_cents,q.folio FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE p.id=? AND p.state='paid'`).bind(attemptId).first();
 if(!row)return;
 if(row.stage==='deposit')await retellOnPaid(env,attemptId);
 await env.DB.prepare("INSERT OR IGNORE INTO automation_outbox(event_id,payment_attempt_id,folio,event_type,status) VALUES(?,?,?,?, 'pending')").bind(crypto.randomUUID(),row.id,row.folio,row.stage==='deposit'?'deposit_paid':row.stage==='installation'?'installation_paid':'final_paid').run();
 if(row.stage!=='installation')await aggregateEvent(env,row.stage==='deposit'?'anticipo_confirmado':'saldo_liquidado');await dossierEvent(env,row.folio,'payment',row.stage==='deposit'?'Anticipo confirmado':row.stage==='installation'?'Hito de instalación conciliado':'Saldo final confirmado');
 await deliverOutbox(env,row.id);
 try{await deliverCustomerPaymentEmail(env,row.id);}catch(_){/* Un fallo de email nunca revierte un pago ni el webhook de conciliación. */}
}
async function deliverOutbox(env,attemptId){
 if(env.ASTRA_ENABLED!=='true'||!env.ASTRA_WEBHOOK_URL||!env.ASTRA_WEBHOOK_SECRET)return false;
 let target;try{target=new URL(env.ASTRA_WEBHOOK_URL);if(target.protocol!=='https:'||target.username||target.password||target.hash) return false;}catch{return false}
 const row=await env.DB.prepare(`SELECT o.event_id,o.event_type,o.folio,o.status,p.stage,p.provider,p.expected_cents FROM automation_outbox o JOIN payment_attempts p ON p.id=o.payment_attempt_id WHERE o.payment_attempt_id=? AND p.state='paid'`).bind(attemptId).first();
 if(!row||row.status==='delivered')return row?.status==='delivered';
 const payload=JSON.stringify({eventId:row.event_id,eventType:row.event_type,folio:row.folio,stage:row.stage,provider:row.provider,amountCents:row.expected_cents,currency:'MXN',scheduleUrl:env.CALENDLY_SCHEDULING_URL||null});
 const signature=await hmacHex(env.ASTRA_WEBHOOK_SECRET,payload);
 try{
  const response=await fetch(target.toString(),{method:'POST',headers:{'Content-Type':'application/json','X-Pluviam-Signature':'sha256='+signature,'X-Idempotency-Key':row.event_id},body:payload,signal:AbortSignal.timeout(2500)});
  if(!response.ok)throw Error('Notification rejected');
  await env.DB.prepare("UPDATE automation_outbox SET status='delivered',attempts=attempts+1,last_error=NULL,delivered_at=CURRENT_TIMESTAMP WHERE payment_attempt_id=? AND status!='delivered'").bind(attemptId).run();
  return true;
 }catch(_){
  await env.DB.prepare("UPDATE automation_outbox SET status='pending',attempts=attempts+1,last_error='Delivery pending' WHERE payment_attempt_id=? AND status!='delivered'").bind(attemptId).run();
  return false;
 }
}

// Transactional email: only for bank/provider-confirmed paid attempts and verified sender.
// Exactly one provider idempotency key per attempt. Receipt is informational, not CFDI.
async function deliverCustomerPaymentEmail(env,attemptId){
 if(env.CUSTOMER_EMAIL_ENABLED!=='true'||env.CUSTOMER_EMAIL_GO_APPROVED!=='true'||
    !privacyReady(env)||!env.RESEND_API_KEY||!env.CUSTOMER_EMAIL_FROM||!env.RESEND_VERIFIED_DOMAIN||!env.DB)return false;
 const from=norm(env.CUSTOMER_EMAIL_FROM,200),domain=norm(env.RESEND_VERIFIED_DOMAIN,150).toLowerCase();
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(from)||domain==='resend.dev'||!domain.includes('.')||from.split('@')[1].toLowerCase()!==domain)return false;
 const row=await env.DB.prepare(`SELECT p.id,p.stage,p.expected_cents,q.folio,l.email FROM payment_attempts p
  JOIN approved_quotes q ON q.id=p.quote_id JOIN lead_cases l ON l.folio=q.folio WHERE p.id=? AND p.state='paid'`).bind(attemptId).first();
 if(!row||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.email||''))return false;
 await env.DB.prepare("INSERT OR IGNORE INTO customer_payment_notifications_v1(attempt_id,folio,status) VALUES(?,?,'pending')").bind(row.id,row.folio).run();
 const msg=await env.DB.prepare('SELECT status,attempts FROM customer_payment_notifications_v1 WHERE attempt_id=?').bind(row.id).first();
 if(!msg||msg.status==='accepted_by_provider'||msg.attempts>=5)return msg?.status==='accepted_by_provider';const claim=await env.DB.prepare("INSERT OR IGNORE INTO customer_email_dispatch_lock_p0(attempt_id,status) VALUES(?,'new')").bind(row.id).run();const leased=await env.DB.prepare("UPDATE customer_email_dispatch_lock_p0 SET status='sending',last_started_at=CURRENT_TIMESTAMP WHERE attempt_id=? AND status='new'").bind(row.id).run();if(!leased.meta?.changes)return false;
 const kind=milestoneName(row.stage);const money=(row.expected_cents/100).toFixed(2);
 const payload={from,to:[row.email],subject:'PLUVIAM | Pago confirmado | '+row.folio,
  text:['PLUVIAM · Confirmación de pago registrado','Folio: '+row.folio,'Hito: '+kind,
   'Importe confirmado: $'+money+' MXN','Consulta tu expediente desde https://pluviam.pages.dev/mi-proyecto.html usando tu folio y clave privada.',
   'La cita, ingeniería, materiales y trabajos se coordinan conforme al contrato y a la validación del equipo.',
   'Este aviso no sustituye al CFDI, factura, recibo bancario ni garantía. Nunca respondas con tu clave privada.'].join('\n')};
 try{
  const resp=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,
   'Content-Type':'application/json','Idempotency-Key':'pluviam-paid-'+row.id},body:JSON.stringify(payload),signal:AbortSignal.timeout(4500)});
  if(!resp.ok)throw Error('Proveedor no aceptó mensaje');
  await env.DB.prepare("UPDATE customer_payment_notifications_v1 SET status='accepted_by_provider',attempts=attempts+1,updated_at=CURRENT_TIMESTAMP WHERE attempt_id=? AND status='pending'").bind(row.id).run();await env.DB.prepare("UPDATE customer_email_dispatch_lock_p0 SET status='delivered' WHERE attempt_id=? AND status='sending'").bind(row.id).run();
  return true;
 }catch(_){await env.DB.prepare("UPDATE customer_payment_notifications_v1 SET attempts=attempts+1,updated_at=CURRENT_TIMESTAMP WHERE attempt_id=? AND status='pending'").bind(row.id).run();/* Unknown delivery: keep lock until operator reconciles Resend by deterministic idempotency key. */return false}
}
async function adminUpdate(request,env,path){if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);if(path==='/api/admin/reintentar-alertas')return respond({ok:true,...await retryLeadAlerts(env)});let d;try{d=await bodyJson(request,10000)}catch{return respond({error:'Solicitud inválida'},400)};const folio=norm(d.folio,60);if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio))return respond({error:'Folio inválido'},400);const exists=await env.DB.prepare('SELECT folio FROM lead_cases WHERE folio=?').bind(folio).first();if(!exists)return respond({error:'Caso no encontrado'},404);
 if(path==='/api/admin/expediente'){const row=await env.DB.prepare('SELECT folio,name,email,phone,segment,city,roof,objective,storage,usage,timeframe,monthly_expense_mxn,preferred_payment,status,next_step,consent_version,consent_at,created_at FROM lead_cases WHERE folio=?').bind(folio).first();const detail=await env.DB.prepare('SELECT answers_json FROM lead_diagnostics WHERE folio=?').bind(folio).first();await adminEvent(env.DB,folio,'diagnostic:view');return respond({case:row,answers:detail?JSON.parse(detail.answers_json):null})}
 if(path==='/api/admin/documento'){
  if(env.PROJECT_DOCS_ENABLED!=='true')return respond({error:'Expediente documental pendiente de habilitación.'},503);
  const kind=norm(d.kind,30),title=norm(d.title,110),body=norm(d.body,5000);
  if(!['alcance','propuesta','contrato','manual','garantia','mantenimiento','entrega','pruebas'].includes(kind)||title.length<5||body.length<12)return respond({error:'Tipo, título o contenido inválidos.'},422);
  try{const id=crypto.randomUUID();await env.DB.prepare('INSERT INTO project_documents_v50(id,folio,kind,title,body) VALUES(?,?,?,?,?)').bind(id,folio,kind,title,body).run();await adminEvent(env.DB,folio,'document:'+kind);await dossierEvent(env,folio,'document',title);return respond({ok:true,id})}
  catch(_){return respond({error:'No se pudo guardar el documento. Revisa migración V50.'},503)}
 }
 if(path==='/api/admin/estado'){
  if(!STAGES[d.stage])return respond({error:'Etapa inválida'},422);
  // V50: server-side no-work-before-deposit invariant (cannot bypass via admin UI).
  const executableStages=new Set(['instalacion','qa','entregado','mantenimiento']);
  if(executableStages.has(d.stage)){
   const paidDeposit=await env.DB.prepare(`SELECT p.id FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE q.folio=? AND q.status='approved' AND q.approved_technical=1 AND q.approved_legal=1 AND q.accepted_by_customer=1 AND p.stage='deposit' AND p.state='paid' LIMIT 1`).bind(folio).first();
   if(!paidDeposit)return respond({error:'La ejecución está bloqueada hasta confirmar el anticipo, el alcance técnico y el contrato aprobado.'},409);
  }
  if(d.stage==='mantenimiento'){
   const finalPaid=await env.DB.prepare(`SELECT p.id FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE q.folio=? AND p.stage='final' AND p.state='paid' LIMIT 1`).bind(folio).first();
   if(!finalPaid)return respond({error:'Antes de cerrar y pasar a mantenimiento debe constar la liquidación final.'},409);
  }
  await env.DB.prepare('UPDATE lead_cases SET status=?,next_step=?,updated_at=CURRENT_TIMESTAMP WHERE folio=?').bind(d.stage,norm(d.nextStep,700),folio).run();await adminEvent(env.DB,folio,'stage:'+d.stage);await dossierEvent(env,folio,'stage',STAGES[d.stage]);if(d.stage==='instalacion')await aggregateEvent(env,'proyecto_activado');return respond({ok:true});
 }
 if(path==='/api/admin/reintentar-notificacion'){const attempt=norm(d.paymentAttemptId,75);if(!/^[a-zA-Z0-9-]{12,75}$/.test(attempt))return respond({error:'Identificador inválido'},422);const found=await env.DB.prepare(`SELECT p.id FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE q.folio=? AND p.id=? AND p.state='paid'`).bind(folio,attempt).first();if(!found)return respond({error:'Pago conciliado no encontrado'},404);let customerEmailAccepted=false;try{customerEmailAccepted=await deliverCustomerPaymentEmail(env,attempt)}catch(_){}return respond({ok:await deliverOutbox(env,attempt),customerEmailAccepted});}
 if(path==='/api/admin/conciliar-bbva'){
  if(!await bankReady(env))return respond({error:'Conciliación bancaria no autorizada: revisar titular, cuenta BBVA y migración 005'},503);
  const ref=norm(d.bankReference,120),proof=norm(d.bankEvidenceId,180);
  if(!/^[A-Z0-9-]{8,65}$/.test(ref)||! /^[A-Za-z0-9._-]{8,100}$/.test(proof)||d.confirmedByBank!==true)return respond({error:'Indica referencia exacta, identificador único de movimiento bancario y revisión manual del extracto.'},422);
  const pay=await env.DB.prepare("SELECT p.id,p.expected_cents FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE q.folio=? AND p.provider='bbva' AND p.provider_session=? AND p.state='awaiting_bank'").bind(folio,ref).first();
  if(!pay)return respond({error:'Pago no encontrado o ya conciliado'},409);
  if(!Number.isSafeInteger(d.confirmedAmountCents)||d.confirmedAmountCents!==pay.expected_cents)return respond({error:'Importe de banco no coincide'},409);
  const reused=await env.DB.prepare("SELECT id FROM payment_attempts WHERE provider='bbva' AND provider_payment_id=? AND state='paid' LIMIT 1").bind(proof).first();
  if(reused)return respond({error:'Ese movimiento bancario ya se utilizó para conciliar otro pago.'},409);
  let update;
  try{update=await env.DB.prepare("UPDATE payment_attempts SET state='paid',provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND provider='bbva' AND state='awaiting_bank'").bind(proof,pay.id).run();}
  catch(_){return respond({error:'El movimiento ya fue conciliado o existe un conflicto; revisar D1 antes de repetir.'},409)}
  if(!update.meta?.changes)return respond({error:'Conciliación ya ejecutada por otra operación; no se duplicó el cobro.'},409);
  await adminEvent(env.DB,folio,'bbva-confirmed:'+proof);await paidOutbox(env,pay.id);
  return respond({ok:true,receipt:proof});
 }
 if(path==='/api/admin/cotizacion'){if(env.CONTRACT_TERMS_APPROVED!=='true')return respond({error:'Términos contractuales aún no autorizados'},503);const contractText=norm(d.contractText,1250);if(contractText.length<150||contractText.length>1150)return respond({error:'Especifica condiciones contractuales revisadas de 150 a 1150 caracteres'},422);const amount=d.amountCents;const plan=d.paymentPlan||'50-50';if(!['50-50','50-30-20'].includes(plan))return respond({error:'Plan de pagos inválido'},422);if(!Number.isInteger(amount)||amount<10000||amount>100000000000)return respond({error:'Importe inválido en centavos MXN'},422);if(!d.technicalApproved||!d.legalApproved||!d.customerAccepted||!d.financeApproved)return respond({error:'Se requieren revisiones técnica, legal, financiera y aceptación del cliente antes de activar cobro.'},422);
 const refs=['rfq1Ref','rfq2Ref','technicalEvidenceRef','legalEvidenceRef','financeEvidenceRef','customerAcceptanceRef'];
 if(refs.some(k=>!/^([A-Za-z0-9:/._-]{10,230})$/.test(norm(d[k],230))))return respond({error:'Faltan dos RFQ comparables y referencias de soporte firmado verificables.'},422);
 if(d.rfq1Ref===d.rfq2Ref)return respond({error:'Las dos cotizaciones de proveedores deben ser diferentes.'},422);
 const fin=quoteFinancialGate(d);if(!fin.ok)return respond({error:fin.error,finance:fin},422);
 const old=await env.DB.prepare('SELECT id FROM approved_quotes WHERE folio=?').bind(folio).first();if(old){const pay=await env.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND state IN ('created','redirected','awaiting_bank','paid')").bind(old.id).first();if(pay)return respond({error:'La propuesta tiene un pago iniciado: no se puede cambiar monto'},409)}
 const id=old?.id||crypto.randomUUID();await env.DB.prepare(`INSERT INTO approved_quotes(id,folio,amount_cents,currency,approved_technical,approved_legal,accepted_by_customer,status,summary,approved_at,payment_plan,gross_margin_bps,contribution_margin_bps,cash_after_deposit_cents,rfq_1_ref,rfq_2_ref,finance_evidence_ref,technical_evidence_ref,legal_evidence_ref,customer_acceptance_ref,finance_policy_version) VALUES(?,?,?,'MXN',1,1,1,'approved',?,CURRENT_TIMESTAMP,?,?,?,?,?,?,?,?,?,?,'V43') ON CONFLICT(folio) DO UPDATE SET amount_cents=excluded.amount_cents,approved_technical=1,approved_legal=1,accepted_by_customer=1,status='approved',summary=excluded.summary,approved_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP,payment_plan=excluded.payment_plan,finance_policy_version='V43',gross_margin_bps=excluded.gross_margin_bps,contribution_margin_bps=excluded.contribution_margin_bps,cash_after_deposit_cents=excluded.cash_after_deposit_cents,rfq_1_ref=excluded.rfq_1_ref,rfq_2_ref=excluded.rfq_2_ref,finance_evidence_ref=excluded.finance_evidence_ref,technical_evidence_ref=excluded.technical_evidence_ref,legal_evidence_ref=excluded.legal_evidence_ref,customer_acceptance_ref=excluded.customer_acceptance_ref`).bind(id,folio,amount,norm(d.summary,650),plan,fin.grossMarginBps,fin.contributionMarginBps,fin.cashAfterDepositCents,norm(d.rfq1Ref,230),norm(d.rfq2Ref,230),norm(d.financeEvidenceRef,230),norm(d.technicalEvidenceRef,230),norm(d.legalEvidenceRef,230),norm(d.customerAcceptanceRef,230)).run();await env.DB.prepare('UPDATE approved_quotes SET contract_text=? WHERE id=?').bind(contractText,id).run();await adminEvent(env.DB,folio,'quote-approved:V43:'+String(fin.grossMarginBps)+':'+String(fin.contributionMarginBps));await dossierEvent(env,folio,'quote','Cotización aprobada bajo política financiera V43');await aggregateEvent(env,'cotizacion_aprobada');return respond({ok:true,quoteId:id,paymentPlan:plan,finance:{grossMarginBps:fin.grossMarginBps,contributionMarginBps:fin.contributionMarginBps,cashAfterDepositCents:fin.cashAfterDepositCents}})}
 return respond({error:'Ruta no encontrada'},404)
}
// V43: policy is server-side; price calculations from an anonymous questionnaire cannot authorize cash collection.
function quoteFinancialGate(d){
 const ints=['amountCents','directCostCents','operatingCostCents','warrantyReserveCents','cacCents','initialCashCents'];
 if(ints.some(k=>!Number.isSafeInteger(d[k])||d[k]<0))return {ok:false,error:'Faltan costos completos verificables expresados en centavos.'};
 const bps=Number.isInteger(d.gatewayFeeBps)?d.gatewayFeeBps:350, fixed=Number.isInteger(d.gatewayFixedCents)?d.gatewayFixedCents:300;
 if(bps<0||bps>2000||fixed<0||fixed>100000)return {ok:false,error:'Comisión pasarela inválida.'};
 const net=d.amountCents/1.16, fee=(d.amountCents*bps/10000+fixed)*1.16;
 const gm=Math.round((net-d.directCostCents)/net*10000);
 const contribution=net-d.directCostCents-d.operatingCostCents-d.warrantyReserveCents-d.cacCents-fee;
 const cm=Math.round(contribution/net*10000);
 const cash=d.amountCents*0.5/1.16-(d.amountCents*0.5*bps/10000+fixed)*1.16-d.initialCashCents;
 const minCash=300000; // $3,000 MXN operating buffer. Financial policy can only change via reviewed server release.
 return {ok:gm>=5500&&cm>=2500&&cash>=minCash, grossMarginBps:gm, contributionMarginBps:cm, cashAfterDepositCents:Math.round(cash),
  error:'Cotización bloqueada: margen bruto 55%, contribución 25% o colchón de caja inicial de $3,000 insuficientes.'};
}
function quoteExpired(env,q){
 if(env.QUOTE_VALIDITY_APPROVED!=='true')return false;
 const days=Number(env.QUOTE_VALID_DAYS);
 if(!Number.isInteger(days)||days<1||days>365||!q?.approved_at)return false;
 const date=new Date(String(q.approved_at).replace(' ','T').replace(/Z?$/,'Z'));
 return Number.isFinite(date.getTime())&&Date.now()>date.getTime()+days*86400000;
}
// Contractual schedule is immutable once a payment attempt is started.
// 50-50 is the historical default; 50-30-20 requires explicit quote acceptance.
function paymentMilestones(amountCents,plan='50-50'){
 if(!Number.isSafeInteger(amountCents)||amountCents<0)throw Error('Total inválido');
 const dep=Math.round(amountCents/2);
 if(plan==='50-30-20'){
  const installation=Math.round(amountCents*.3);
  return [{stage:'deposit',label:'Anticipo antes de ejecutar',amountCents:dep},
   {stage:'installation',label:'Hito de instalación',amountCents:installation},
   {stage:'final',label:'Entrega y conformidad',amountCents:amountCents-dep-installation}];
 }
 return [{stage:'deposit',label:'Anticipo antes de ejecutar',amountCents:dep},
  {stage:'final',label:'Entrega y conformidad',amountCents:amountCents-dep}];
}
function cryptoConfigured(env){return !!(env.NOWPAYMENTS_ENABLED==='true'&&env.CRYPTO_COMPLIANCE_APPROVED==='true'&&env.NOWPAYMENTS_API_KEY&&env.NOWPAYMENTS_IPN_SECRET)}
function milestoneName(stage){return stage==='deposit'?'Anticipo contractual':stage==='installation'?'Hito de instalación':'Finiquito contractual'}
async function paymentContext(env,folio,token,stage){if(!payGate(env)||env.CONTRACT_TERMS_APPROVED!=='true')return {error:'Pagos y términos contractuales todavía no habilitados'};const row=await identity(env.DB,folio,token);if(!row)return {error:'Credenciales de proyecto inválidas'};let q;try{q=await env.DB.prepare('SELECT id,folio,amount_cents,currency,approved_at,payment_plan,summary,contract_text FROM approved_quotes WHERE folio=? AND approved_technical=1 AND approved_legal=1 AND accepted_by_customer=1 AND finance_policy_version=\'V43\' AND gross_margin_bps>=5500 AND contribution_margin_bps>=2500 AND cash_after_deposit_cents>=300000 AND status=?').bind(folio,'approved').first()}catch(_){return {error:'Pagos bloqueados: falta verificar la migración de hitos en D1.'}}if(!q)return {error:'Este proyecto aún no tiene contrato y cotización aprobados.'};if(!await acceptedOffer(env,q))return {error:'El titular debe aceptar personalmente la versión exacta de propuesta y términos antes de pagar.'};if(quoteExpired(env,q))return {error:'Esta cotización venció. Solicita su revalidación antes de realizar un pago.'};const milestones=paymentMilestones(q.amount_cents,q.payment_plan||'50-50');
 const item=milestones.find(x=>x.stage===stage);if(!item)return {error:'Hito no definido por el contrato aprobado.'};
 if(stage==='installation'){
  if(!['instalacion','qa','entregado','mantenimiento'].includes(row.status))return {error:'El hito de instalación todavía no está documentado.'};
  const paid=await env.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid'").bind(q.id).first();
  if(!paid)return {error:'Se requiere anticipo conciliado antes de cobrar el segundo hito.'};
 }
 if(stage==='final'){
  if(!['qa','entregado','mantenimiento'].includes(row.status))return {error:'El pago final requiere control de calidad o entrega registrada.'};
  const paid=await env.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid'").bind(q.id).first();
  if(!paid)return {error:'Se requiere anticipo conciliado.'};
  if(milestones.some(x=>x.stage==='installation')){
   const second=await env.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='installation' AND state='paid'").bind(q.id).first();
   if(!second)return {error:'Se requiere segundo hito conciliado antes del finiquito.'};
  }
 }
 return {row,q,amount:item.amountCents,milestones};}
async function checkout(request,env){if(!payGate(env))return respond({error:'Los pagos no están habilitados'},503);let d;try{d=await bodyJson(request)}catch{return respond({error:'Solicitud inválida'},400)};
 const provider=norm(d.provider,20),stage=norm(d.stage,20),folio=norm(d.folio,60),token=norm(d.token,200);if(!['stripe','mercadopago','bbva','crypto'].includes(provider)||!['deposit','installation','final'].includes(stage))return respond({error:'Método o hito inválido'},422);
 const ctx=await paymentContext(env,folio,token,stage);if(ctx.error)return respond({error:ctx.error},409);
 const {q,amount}=ctx;const exists=await env.DB.prepare('SELECT id,state FROM payment_attempts WHERE quote_id=? AND stage=?').bind(q.id,stage).first();if(exists&&exists.state!=='failed')return respond({error:'Ya existe un intento de cobro para este hito. Contacta a PLUVIAM para conciliarlo.'},409);
 if(provider==='crypto'&&!cryptoConfigured(env))return respond({error:'Criptomonedas no habilitadas para este comercio.'},503);
 if(provider==='bbva'&&!await bankReady(env))return respond({error:'Transferencia BBVA todavía sin datos bancarios completos verificados'},503);
 const id=crypto.randomUUID();if(exists){await env.DB.prepare("UPDATE payment_attempts SET id=?,state='created',provider=?,expected_cents=?,provider_session=NULL,provider_payment_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE quote_id=? AND stage=?").bind(id,provider,amount,q.id,stage).run()}else{await env.DB.prepare('INSERT INTO payment_attempts(id,quote_id,stage,provider,expected_cents) VALUES(?,?,?,?,?)').bind(id,q.id,stage,provider,amount).run()}
 if(provider==='bbva'){const bankRef='PLV-'+q.id.replaceAll('-','').slice(0,14).toUpperCase()+'-'+(stage==='deposit'?'ANT':stage==='installation'?'INS':'FIN');await env.DB.prepare("UPDATE payment_attempts SET state='awaiting_bank',provider_session=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(bankRef,id).run();return respond({manual:true,bank:'BBVA México',accountName:env.BBVA_BENEFICIARY_NAME,clabe:env.BBVA_CLABE,bankRef,amountCents:amount,currency:'MXN',instructions:'Transferir solo el importe exacto de la cotización aprobada con la referencia indicada. El pago se reflejará únicamente cuando PLUVIAM confirme la recepción en el estado de cuenta; no enviar capturas como única prueba.'});}
 const origin=new URL(request.url).origin;let url,session='';try{if(provider==='crypto'){
  // Hosted crypto invoice. The secret and any wallet payout settings stay with NOWPayments.
  // Never trust amounts, addresses or crypto status supplied by the browser.
  const payload={price_amount:amount/100,price_currency:'mxn',order_id:id,
   order_description:'PLUVIAM · '+milestoneName(stage)+' · '+folio,
   ipn_callback_url:origin+'/api/webhooks/nowpayments',
   success_url:origin+'/pagar.html',cancel_url:origin+'/pagar.html'};
  const r=await fetch('https://api.nowpayments.io/v1/invoice',{method:'POST',headers:{'x-api-key':env.NOWPAYMENTS_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const j=await r.json();const check=(()=>{try{const u=new URL(j.invoice_url);return u.protocol==='https:'&&(u.hostname==='nowpayments.io'||u.hostname.endsWith('.nowpayments.io'))}catch{return false}})();
  if(!r.ok||!check||!/^\d{1,30}$/.test(String(j.id||'')))throw Error('NOWPayments no emitió factura verificable');
  url=j.invoice_url;session=String(j.id);
 }else if(provider==='stripe'){
  if(!env.STRIPE_SECRET_KEY||!env.STRIPE_WEBHOOK_SECRET)throw Error('Stripe no configurado');let p=new URLSearchParams();p.set('mode','payment');p.set('client_reference_id',id);p.set('success_url',origin+'/mi-proyecto.html');p.set('cancel_url',origin+'/mi-proyecto.html');p.set('line_items[0][price_data][currency]','mxn');p.set('line_items[0][price_data][unit_amount]',String(amount));p.set('line_items[0][price_data][product_data][name]','PLUVIAM · '+(milestoneName(stage))+' '+folio);p.set('line_items[0][quantity]','1');p.set('payment_intent_data[metadata][payment_attempt]',id);const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY,'Content-Type':'application/x-www-form-urlencoded','Idempotency-Key':id},body:p});const j=await r.json();if(!r.ok||!j.url)throw Error('Stripe rechazó la creación de checkout');url=j.url;session=j.id;
 }else{
  if(!env.MP_ACCESS_TOKEN||!env.MP_WEBHOOK_SECRET)throw Error('Mercado Pago no configurado');const payload={items:[{title:'PLUVIAM · '+(milestoneName(stage)),quantity:1,currency_id:'MXN',unit_price:amount/100}],external_reference:id,back_urls:{success:origin+'/mi-proyecto.html',failure:origin+'/mi-proyecto.html',pending:origin+'/mi-proyecto.html'},auto_return:'approved',notification_url:origin+'/api/webhooks/mercadopago'};const r=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN,'Content-Type':'application/json','X-Idempotency-Key':id},body:JSON.stringify(payload)});const j=await r.json();if(!r.ok||!j.init_point)throw Error('Mercado Pago rechazó la preferencia');url=j.init_point;session=j.id;}}
 catch(err){await env.DB.prepare("UPDATE payment_attempts SET state='redirected',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='created'").bind(id).run();return respond({error:'No fue posible confirmar el inicio del pago con el proveedor. El intento quedó pendiente de revisión. No pagues otra vez sin conciliarlo.'},502)}
 await env.DB.prepare("UPDATE payment_attempts SET state='redirected',provider_session=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='created'").bind(session,id).run();return respond({url});
}
async function stripeWebhook(request,env){if(!env.DB||!env.STRIPE_WEBHOOK_SECRET)return respond({error:'No configurado'},503);const signature=request.headers.get('Stripe-Signature')||'';const bits=Object.fromEntries(signature.split(',').map(x=>x.trim().split('=')));const raw=await request.text();if(!bits.t||!bits.v1||Math.abs(Date.now()/1000-Number(bits.t))>300)return respond({error:'Firma o tiempo inválido'},403);
 const v=await hmacHex(env.STRIPE_WEBHOOK_SECRET,bits.t+'.'+raw);if(!safeSame(v,bits.v1))return respond({error:'Firma inválida'},403);let event;try{event=JSON.parse(raw)}catch{return respond({error:'JSON inválido'},400)};
 if(event.type==='checkout.session.completed'&&event.data?.object?.payment_status==='paid'){const s=event.data.object;const id=norm(s.client_reference_id,90),amount=Number(s.amount_total);const pay=await env.DB.prepare('SELECT id,expected_cents,state,provider_session FROM payment_attempts WHERE id=? AND provider=?').bind(id,'stripe').first();if(pay&&pay.provider_session===s.id&&pay.expected_cents===amount&&s.currency==='mxn'&&['created','redirected'].includes(pay.state)){const cas=await env.DB.prepare("UPDATE payment_attempts SET state='paid',provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('created','redirected')").bind(norm(s.payment_intent,140),id).run();if(cas.meta?.changes){await adminEvent(env.DB,'','stripe-paid:'+id);await paidOutbox(env,id)}}}return respond({received:true})}
async function mpWebhook(request,env){if(!env.DB||!env.MP_WEBHOOK_SECRET||!env.MP_ACCESS_TOKEN)return respond({error:'No configurado'},503);const url=new URL(request.url),id=url.searchParams.get('data.id')||url.searchParams.get('id')||'',header=request.headers.get('x-signature')||'',rid=request.headers.get('x-request-id')||'';const parts=Object.fromEntries(header.split(',').map(s=>s.trim().split('=')));const ts=parts.ts||'';
 if(!/^\d{1,30}$/.test(id)||!rid||!ts||!parts.v1)return respond({error:'Notificación inválida'},403);const millis=Number(ts)<1e11?Number(ts)*1000:Number(ts);if(Math.abs(Date.now()-millis)>300000)return respond({error:'Tiempo inválido'},403);
 const check=await hmacHex(env.MP_WEBHOOK_SECRET,`id:${id.toLowerCase()};request-id:${rid};ts:${ts};`);if(!safeSame(check,parts.v1.toLowerCase()))return respond({error:'Firma inválida'},403);
 const r=await fetch('https://api.mercadopago.com/v1/payments/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN}});if(!r.ok)return respond({error:'No se pudo confirmar con pasarela'},502);const p=await r.json();if(p.status==='approved'){const ref=norm(p.external_reference,90);const pay=await env.DB.prepare('SELECT id,expected_cents,state FROM payment_attempts WHERE id=? AND provider=?').bind(ref,'mercadopago').first();if(pay&&pay.expected_cents===Math.round(Number(p.transaction_amount)*100)&&p.currency_id==='MXN'&&['created','redirected'].includes(pay.state)){const cas=await env.DB.prepare("UPDATE payment_attempts SET state='paid',provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('created','redirected')").bind(id,ref).run();if(cas.meta?.changes){await adminEvent(env.DB,'','mp-paid:'+ref);await paidOutbox(env,ref)}}}return respond({received:true})}

/* V46: embedded Mercado Pago CardPayment Brick. The server owns price and idempotency.
 * This never creates a quote, never changes contract status, and never handles raw PAN/CVV.
 * Production requires MP_PUBLIC_KEY, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET, DB,
 * TURNSTILE, LEGAL_APPROVED, LEADS_ENABLED and PAYMENTS_ENABLED.
 */
async function brickSetup(request,env){
 if(!payGate(env)||!env.MP_ACCESS_TOKEN||!env.MP_PUBLIC_KEY||!env.MP_WEBHOOK_SECRET)return respond({error:'El pago con tarjeta aún no está habilitado.'},503);
 let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}
 const folio=norm(d.folio,60),token=norm(d.token,200),stage=norm(d.stage,20);
 if(!['deposit','installation','final'].includes(stage))return respond({error:'Hito inválido'},422);
 const ctx=await paymentContext(env,folio,token,stage);if(ctx.error)return respond({error:ctx.error},409);
 const q=ctx.q;let pa=await env.DB.prepare("SELECT id,state,provider,expected_cents FROM payment_attempts WHERE quote_id=? AND stage=?").bind(q.id,stage).first();
 if(pa && pa.state==='paid')return respond({error:'Este hito ya está pagado.'},409);
 if(pa && !['created','failed'].includes(pa.state))return respond({error:'Existe un pago pendiente de conciliación. Consulta el estado antes de reintentarlo.'},409);
 if(pa && (pa.provider!=='mercadopago'||pa.expected_cents!==ctx.amount) && pa.state!=='failed')return respond({error:'Existe una solicitud de cobro de otro método.'},409);
 if(!pa){const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO payment_attempts(id,quote_id,stage,provider,expected_cents,state) VALUES(?,?,?,?,?,'created')").bind(id,q.id,stage,'mercadopago',ctx.amount).run();}
 else if(pa.state==='failed'){await env.DB.prepare("UPDATE payment_attempts SET id=?,provider='mercadopago',expected_cents=?,state='created',provider_session=NULL,provider_payment_id=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='failed'").bind(crypto.randomUUID(),ctx.amount,pa.id).run();}
 return respond({publicKey:env.MP_PUBLIC_KEY,amountCents:ctx.amount,currency:'MXN',stage});
}
async function brickPay(request,env){
 if(!payGate(env)||!env.MP_ACCESS_TOKEN||!env.MP_PUBLIC_KEY||!env.MP_WEBHOOK_SECRET)return respond({error:'Pago no habilitado'},503);
 let d;try{d=await bodyJson(request,8000)}catch{return respond({error:'Datos de pago inválidos'},400)}
 const stage=norm(d.stage,20),folio=norm(d.folio,60),token=norm(d.token,200);
 if(!['deposit','installation','final'].includes(stage))return respond({error:'Hito inválido'},422);
 const ctx=await paymentContext(env,folio,token,stage);if(ctx.error)return respond({error:ctx.error},409);
 const f=d.formData||{},payToken=norm(f.token,230),method=norm(f.payment_method_id,70),email=norm(f.payer?.email,180),installments=Number(f.installments),issuer=f.issuer_id;
 if(!/^[A-Za-z0-9_-]{10,230}$/.test(payToken)||!/^[a-z0-9_-]{2,70}$/i.test(method)||!/^\S+@\S+\.\S+$/.test(email)||!Number.isInteger(installments)||installments<1||installments>18)return respond({error:'Datos de pago incompletos'},422);
 const pay=await env.DB.prepare("SELECT id,state,provider,expected_cents FROM payment_attempts WHERE quote_id=? AND stage=?").bind(ctx.q.id,stage).first();
 if(!pay||pay.state!=='created'||pay.provider!=='mercadopago'||pay.expected_cents!==ctx.amount)return respond({error:'Ya existe un pago en proceso o este hito no está preparado'},409);
 const locked=await env.DB.prepare("UPDATE payment_attempts SET state='redirected',updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='created'").bind(pay.id).run();
 if(!locked.meta?.changes)return respond({error:'Pago ya enviado; revisa el estado antes de reintentar'},409);
 const payload={transaction_amount:ctx.amount/100,token:payToken,description:'PLUVIAM · '+(milestoneName(stage))+' · '+folio,installments,payment_method_id:method,external_reference:pay.id,notification_url:new URL(request.url).origin+'/api/webhooks/mercadopago',payer:{email}};
 if(issuer!==undefined && issuer!==null && String(issuer).length<18)payload.issuer_id=issuer;
 const ident=f.payer?.identification;if(ident&&/^[A-Za-z]{2,8}$/.test(ident.type||'')&&typeof ident.number==='string'&&ident.number.length<40)payload.payer.identification={type:ident.type,number:ident.number};
 let p;try{const response=await fetch('https://api.mercadopago.com/v1/payments',{method:'POST',headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN,'Content-Type':'application/json','X-Idempotency-Key':pay.id},body:JSON.stringify(payload)});p=await response.json();if(!response.ok){/* Rechazo HTTP no prueba que no se haya generado un cargo; retener y conciliar antes de otro intento. */return respond({error:'La pasarela no confirmó el resultado. El intento permanece reservado: consulta Mercado Pago y concilia antes de reintentar.'},502)}}catch(_){return respond({error:'No se pudo verificar la respuesta de Mercado Pago. El intento quedó pendiente de conciliación; evita pagar otra vez.'},502)}
 const state=p.status==='approved'?'paid':p.status==='rejected'?'failed':'redirected';
 if(p.id&&p.currency_id==='MXN'&&Math.round(Number(p.transaction_amount)*100)===ctx.amount){const cas=await env.DB.prepare("UPDATE payment_attempts SET state=?,provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state='redirected'").bind(state,String(p.id),pay.id).run();if(cas.meta?.changes){await adminEvent(env.DB,folio,'mp-card-'+p.status+':'+pay.id);if(state==='paid')await paidOutbox(env,pay.id)}return respond({status:p.status,confirmed:state==='paid',paymentId:String(p.id)});}return respond({error:'Pago sujeto a conciliación. Revisa el folio antes de repetir.'},202);
}

/* PLUVIAM V51. Módulo adicional aislado; desactivado por defecto.
   Todos los datos de importes/cotización se consultan en backend, jamás del navegador. */
const RETELL_CONSENT_VERSION='retell-followup-v1-2026-10-24';
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const str=(v,n=200)=>typeof v==='string'?v.trim().slice(0,n):'';
function enabled(e){return e.RETELL_ENABLED==='true' && e.RETELL_LAUNCH_APPROVED==='true' && e.RETELL_PRIVACY_APPROVED==='true' && e.RETELL_COST_APPROVED==='true' && e.RETELL_MX_OUTBOUND_APPROVED==='true' && Number(e.RETELL_MAX_CALLS_PER_DAY)>0 && e.RETELL_API_KEY && e.RETELL_AGENT_ID && e.RETELL_PHONE_NUMBER && e.DB;}
async function exists(e){try{await e.DB.prepare('SELECT folio FROM retell_consents_v51 LIMIT 1').first();await e.DB.prepare('SELECT id FROM retell_followups_v51 LIMIT 1').first();return true;}catch{return false;}}
function phoneValid(v){return /^(?:\+52[1-9]\d{9}|[1-9]\d{9}|52[1-9]\d{9})$/.test(String(v||'').replace(/[ ()-]/g,''));} // enfoque inicial: México, no asumir códigos de país
async function read(req){const raw=await req.text();if(raw.length>3500)throw Error('Too large');return JSON.parse(raw);}
async function paid(e,quoteId){return !!(await e.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid' LIMIT 1").bind(quoteId).first());}
async function retellEligibility(env,folio,quote,expired){
 const base={enabled:false,eligible:false,consent:false,status:null,version:RETELL_CONSENT_VERSION};
 if(!enabled(env)||!quote?.approved||expired||!quote.id||!await exists(env))return base;
 try{const consent=await env.DB.prepare('SELECT granted,revoked_at FROM retell_consents_v51 WHERE folio=?').bind(folio).first();const f=await env.DB.prepare('SELECT status FROM retell_followups_v51 WHERE quote_id=?').bind(quote.id).first();const hasPhone=await env.DB.prepare('SELECT phone FROM lead_cases WHERE folio=?').bind(folio).first();return {enabled:true,eligible:phoneValid(hasPhone?.phone)&&!await paid(env,quote.id),consent:consent?.granted===1&&!consent.revoked_at,status:f?.status||null,version:RETELL_CONSENT_VERSION};}catch{return base;}
}
async function retellCustomerApi(req,env,helpers){
 if(!env.DB)return json({error:'Servicio no configurado.'},503);
 let d;try{d=await read(req);}catch{return json({error:'Datos inválidos'},400);}
 const folio=str(d.folio,70),token=str(d.token,200);
 const row=await helpers.identity(env.DB,folio,token);
 if(!row)return json({error:'Folio o clave inválidos.'},403);
 if(!await exists(env))return json({error:'Servicio de llamadas no configurado.'},503);
 const action=str(d.action,12);
 if(action==='revoke'){
  await env.DB.batch([
   env.DB.prepare("UPDATE retell_consents_v51 SET granted=0,revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE folio=?").bind(folio),
   env.DB.prepare("UPDATE retell_followups_v51 SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE folio=? AND status IN ('scheduled','deferred','claimed')").bind(folio)
  ]);
  return json({ok:true,status:'revoked'});
 }
 if(action!=='consent'||d.consent!==true||str(d.consentVersion)!==RETELL_CONSENT_VERSION)return json({error:'Autorización expresa y versión vigente requeridas.'},422);
 if(!enabled(env))return json({error:'Llamadas automáticas desactivadas.'},503);
 const q=await env.DB.prepare("SELECT id,folio,status,approved_at,approved_technical,approved_legal,accepted_by_customer FROM approved_quotes WHERE folio=?").bind(folio).first();
 if(!q||q.status!=='approved'||q.approved_technical!==1||q.approved_legal!==1||q.accepted_by_customer!==1||helpers.quoteExpired(env,q))return json({error:'La cotización debe estar aprobada, aceptada y vigente.'},409);
 if(await paid(env,q.id))return json({error:'El anticipo ya está confirmado; no procede una llamada de rescate.'},409);
 const lead=await env.DB.prepare('SELECT phone FROM lead_cases WHERE folio=?').bind(folio).first();
 if(!phoneValid(lead?.phone))return json({error:'Se requiere teléfono mexicano en formato +52 y diez dígitos.'},422);
 const old=await env.DB.prepare('SELECT status FROM retell_followups_v51 WHERE quote_id=?').bind(q.id).first();
 if(old){if(old.status==='cancelled')return json({error:'Esta cotización tiene una autorización revocada y no se puede programar otra llamada automática. Contacta al equipo PLUVIAM.'},409);return json({ok:true,alreadyRegistered:true,status:old.status});}
 const delay=Number(env.RETELL_RESCUE_DELAY_SECONDS||180);
 if(!Number.isInteger(delay)||delay<180||delay>86400)return json({error:'Demora no configurada de manera segura.'},503);
 const id=crypto.randomUUID(),when=new Date(Date.now()+delay*1000).toISOString();
 // Transacción D1: un solo seguimiento por cotización. Fallos transitorios no deben romper PDF/checkout.
 try{
  await env.DB.batch([
   env.DB.prepare("INSERT INTO retell_consents_v51(folio,granted,consent_version,granted_at,revoked_at,updated_at) VALUES(?,1,?,CURRENT_TIMESTAMP,NULL,CURRENT_TIMESTAMP) ON CONFLICT(folio) DO UPDATE SET granted=1,consent_version=excluded.consent_version,granted_at=CURRENT_TIMESTAMP,revoked_at=NULL,updated_at=CURRENT_TIMESTAMP").bind(folio,RETELL_CONSENT_VERSION),
   env.DB.prepare("INSERT OR IGNORE INTO retell_followups_v51(id,folio,quote_id,status,scheduled_at) VALUES(?,?,?,'scheduled',?)").bind(id,folio,q.id,when)
  ]);
  const saved=await env.DB.prepare('SELECT id,status,scheduled_at FROM retell_followups_v51 WHERE quote_id=?').bind(q.id).first();return json({ok:true,status:saved.status,scheduledAt:saved.scheduled_at});
 }catch{return json({error:'No se pudo registrar la autorización; puedes conservar el PDF.'},503);}
}
// Cancelar llamadas pendientes cuando una conciliación REAL confirma el anticipo (operación idempotente).
async function retellOnPaid(env,paymentAttemptId){
 if(!env.DB)return;
 try{await env.DB.prepare("UPDATE retell_followups_v51 SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE quote_id IN (SELECT quote_id FROM payment_attempts WHERE id=? AND stage='deposit' AND state='paid') AND status IN ('scheduled','deferred','claimed')").bind(paymentAttemptId).run();}catch(_){/* Si faltó la migración, la función de pagos permanece intacta. Cron vuelve a revisar el pago. */}
}



// NOWPayments IPN: signature HMAC-SHA512 of recursively sorted JSON. Only 'finished' means paid.
function sortKeysDeep(x){if(Array.isArray(x))return x.map(sortKeysDeep);if(x&&typeof x==='object')return Object.fromEntries(Object.keys(x).sort().map(k=>[k,sortKeysDeep(x[k])]));return x}
async function cryptoSig(secret,payload){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-512'},false,['sign']);const out=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(JSON.stringify(sortKeysDeep(payload))));return Array.from(new Uint8Array(out),x=>x.toString(16).padStart(2,'0')).join('')}
async function nowpaymentsWebhook(request,env){
 if(!env.DB||!cryptoConfigured(env))return respond({error:'Criptomonedas no habilitadas'},503);
 const signature=(request.headers.get('x-nowpayments-sig')||'').toLowerCase();
 if(!/^[a-f0-9]{128}$/.test(signature))return respond({error:'Firma faltante'},403);
 let payload;try{payload=await bodyJson(request,18000)}catch{return respond({error:'JSON inválido'},400)}
 if(!safeSame(await cryptoSig(env.NOWPAYMENTS_IPN_SECRET,payload),signature))return respond({error:'Firma inválida'},403);
 const id=String(payload.payment_id||'');const attemptId=String(payload.order_id||'');const invoiceId=String(payload.invoice_id||'');
 if(!/^\d{1,30}$/.test(id)||!/^[0-9a-f-]{36}$/.test(attemptId)||!/^\d{1,30}$/.test(invoiceId))return respond({received:true,matched:false});
 const record=await env.DB.prepare("SELECT id,expected_cents,provider_session,state FROM payment_attempts WHERE id=? AND provider='crypto'").bind(attemptId).first();
 if(!record||String(record.provider_session)!==invoiceId)return respond({received:true,matched:false});
 // Retrieve canonical payment state from NOWPayments API before touching D1.
 const r=await fetch('https://api.nowpayments.io/v1/payment/'+encodeURIComponent(id),{headers:{'x-api-key':env.NOWPAYMENTS_API_KEY}});
 if(!r.ok)return respond({error:'No fue posible verificar el pago con NOWPayments'},502);
 const p=await r.json();
 if(String(p.payment_id)!==id||String(p.order_id)!==attemptId||String(p.invoice_id)!==invoiceId||
    String(p.price_currency||'').toLowerCase()!=='mxn'||
    Math.round(Number(p.price_amount)*100)!==Number(record.expected_cents)||
    String(p.payment_status||'')!=='finished')return respond({received:true,matched:false});
 // NOWPayments permite marcar manualmente como finished pagos parciales: no reconocer el importe de factura
 // como dinero efectivamente recibido. Requerir la cantidad de cripto íntegra consultada por API.
 const requiredCrypto=Number(p.pay_amount),receivedCrypto=Number(p.actually_paid);
 if(!Number.isFinite(requiredCrypto)||requiredCrypto<=0||!Number.isFinite(receivedCrypto)||receivedCrypto<=0||
    receivedCrypto+1e-10<requiredCrypto)return respond({received:true,matched:true,paid:false,reviewRequired:true});
 const applied=await env.DB.prepare("UPDATE payment_attempts SET state='paid',provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND provider='crypto' AND state IN ('redirected','created') AND provider_session=?").bind(id,attemptId,invoiceId).run();
 if(applied.meta?.changes){await adminEvent(env.DB,'','crypto-paid:'+attemptId);await paidOutbox(env,attemptId)}
 return respond({received:true,matched:true,paid:!!applied.meta?.changes});
}

// Pages Advanced Mode invariant: if(!path.startsWith('/api/'))return env.ASSETS.fetch(request)
const PLUVIAM3_HOME = `<section class="network-section" id="red-especialistas" aria-labelledby="network-title">
  <div class="network-heading"><span class="eyebrow blue">PLUVIAM / BEEHIVE</span><h2 id="network-title">Una red de especialistas, <em>visible y trazable.</em></h2><p>Estas fichas están aprobadas por el fundador para la Preview. Mostramos el estado documental real: el archivo o licencia de cada logotipo se incorpora sólo cuando existe.</p></div>
  <div class="ally-grid">
    <article class="ally-card"><div class="ally-mark ally-mark-image"><img src="/ally-isla-urbana.svg" alt="Isla Urbana"></div><div><span class="ally-status">APROBADO POR FUNDADOR · PREVIEW</span><h3>Isla Urbana</h3><p>Tecnología / aliado de red · CDMX y Valle de México.</p><small>Logo oficial incorporado al entorno de demostración. G0 y relación contractual en validación.</small><a href="/colaborar/">Ver red BeeHive ↗</a></div></article>
    <article class="ally-card"><div class="ally-mark ally-mark-image"><img src="/ally-raincolecta.svg" alt="Rain Colecta"></div><div><span class="ally-status">APROBADO POR FUNDADOR · PREVIEW</span><h3>Fernando / Rain Colecta</h3><p>Aliado técnico / referidor · Guadalajara y Zapopan.</p><small>Logo oficial incorporado al entorno de demostración. Capacidad, tarifas y G0 en validación.</small><a href="/colaborar/">Abrir expediente BeeHive ↗</a></div></article>
    <article class="ally-card"><div class="ally-mark ally-mark-image"><img src="/ally-345-ingenieria.svg" alt="345 Ingeniería"></div><div><span class="ally-status">APROBADO POR FUNDADOR · PREVIEW</span><h3>345 Ingeniería / Luis</h3><p>Ingeniería / instalación · Guadalajara y ZMG.</p><small>Logo oficial incorporado al entorno de demostración. RFQ, capacidad y contrato en validación.</small><a href="/colaborar/">Abrir expediente BeeHive ↗</a></div></article>
  </div>
  <p class="network-footnote">Aprobación de negocio del fundador no equivale por sí sola a licencia de marca, contrato, seguro, certificación o cobertura activa.</p>
</section>
<section class="pluviam3-audiences" aria-labelledby="audience-title"><div><span class="eyebrow blue">PLUVIAM 3.0 / ENTRADAS</span><h2 id="audience-title">La misma infraestructura para <em>tres formas de participar.</em></h2></div><div class="audience-grid"><a href="#experience"><strong>Hogar</strong><span>Diagnóstico, soluciones y reserva hídrica.</span></a><a href="/cotizacion.html"><strong>PyME / Industrial</strong><span>Diseño por inmueble y operación continua.</span></a><a href="/colaborar/"><strong>Arquitectos / Profesionales</strong><span>BeeHive, referidos y expedientes con permisos.</span></a><a href="/mi-proyecto.html"><strong>HI Care / Property OS</strong><span>Equipos, documentos, incidencias y mantenimiento.</span></a></div></section>`;
// The wrapper below injects the shared Avianny UI, network cards and audience entry points while preserving the asset binding.
async function serveAsset(request,env,path){
 const response=await env.ASSETS.fetch(request);
 const contentType=response.headers.get('content-type')||'';
 if(request.method!=='GET'||!contentType.includes('text/html'))return response;
 const html=await response.text();
 if(html.includes('/avianny.js'))return response;
 const scripts='<link rel="stylesheet" href="/avianny.css"><link rel="stylesheet" href="/alliances.css"><link rel="stylesheet" href="/pluviam3.css"><script src="/avianny.js" defer></script>'+(path==='/admin.html'?'<script src="/beta-admin-ui.js" defer></script>':'');
 const home = (path==='/' || path==='/index.html') ? PLUVIAM3_HOME : '';
 const headers=new Headers(response.headers);headers.delete('Content-Length');
 const body=html.replace('</head>',scripts+'</head>').replace('</main>',home+'</main>');
 return new Response(body,{status:response.status,statusText:response.statusText,headers});
}

export default {async fetch(request,env){const path=new URL(request.url).pathname;if(path==='/_worker.js'||path==='/_worker.js.map')return new Response('Not found',{status:404});/* Cloudflare Pages canoniza contacto.html a /contacto. Nunca redirigir /contacto de regreso a .html o crearía un bucle. */const legacy={'/calculadora/':'/#experience','/calculadora':'/#experience','/nosotros/':'/','/nosotros':'/','/recorrido/':'/academia.html','/recorrido':'/academia.html','/colaborar':'/colaborar/','/store':'/store/','/admin':'/admin/'};if(Object.hasOwn(legacy,path))return Response.redirect(new URL(legacy[path],request.url).href,301);if(!path.startsWith('/api/'))return serveAsset(request,env,path);if(!originAllowed(request))return respond({error:'Origen no autorizado'},403);
 try{
  if(path.startsWith('/api/beta/'))return await handleBetaRequest(request,env,path);
  if(path==='/api/estado'&&request.method==='GET'){const databaseReady=await schemaReady(env),accepting=gate(env)&&databaseReady,payments=payGate(env)&&databaseReady&&await paymentSchemaReady(env);return respond({backend:true,accepting,turnstile:!!env.TURNSTILE_SITE_KEY,turnstileSiteKey:accepting?env.TURNSTILE_SITE_KEY:null,payments,crypto:payments&&cryptoConfigured(env),drafts:!!(env.DB&&privacyReady(env)&&env.DRAFTS_ENABLED==='true'),whatsAppNumber:/^[1-9]\d{9,14}$/.test(env.PUBLIC_WHATSAPP_NUMBER||'')?env.PUBLIC_WHATSAPP_NUMBER:null})}
  if(path==='/api/jobs/reintentar-alertas'&&request.method==='POST'){const auth=request.headers.get('Authorization')||'';if(!env.JOBS_TOKEN||!safeSame(auth,'Bearer '+env.JOBS_TOKEN))return respond({error:'No autorizado'},403);return respond({ok:true,...await retryLeadAlerts(env)});}
  if(path==='/api/borrador'&&request.method==='POST')return await saveDraft(request,env);
  if(path==='/api/borrador/borrar'&&request.method==='POST')return await deleteDraft(request,env);
  if(path==='/api/diagnostico'&&request.method==='POST')return await publicDiagnosis(request);
  if(path==='/api/solicitudes'&&request.method==='POST')return await newLead(request,env);
  if(path==='/api/proyecto'&&request.method==='POST')return await project(request,env);
  if(path==='/api/contrato/aceptar'&&request.method==='POST')return await acceptOffer(request,env);
  if(path==='/api/propuesta/pdf'&&request.method==='POST')return await proposalPdf(request,env);
  if(path==='/api/lead-abandonment'&&request.method==='POST')return await retellCustomerApi(request,env,{identity,quoteExpired});
  if(path==='/api/admin/salud'&&request.method==='GET'){if(!admin(request,env))return respond({error:'No autorizado'},403);const schema=await schemaReady(env);const checks={baseD1:!!env.DB,esquemaD1:schema,turnstile:!!(env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY),avisoAprobado:privacyReady(env),recepcionActiva:env.LEADS_ENABLED==='true',correoConfigurado:!!(env.RESEND_API_KEY&&env.RESEND_FROM&&env.OPERATIONS_EMAIL),reintentoCorreo:!!env.JOBS_TOKEN,pagosHabilitados:payGate(env)&&await paymentSchemaReady(env),goComercialAprobado:env.COMMERCE_GO_APPROVED==='true',bbvaVerificado:await bankReady(env),notificacionClienteHabilitada:env.CUSTOMER_EMAIL_ENABLED==='true'&&env.CUSTOMER_EMAIL_GO_APPROVED==='true'};return respond({registroListo:gate(env)&&schema,checks});}
  if(path==='/api/admin/operacion'&&request.method==='GET'){
   if(!admin(request,env))return respond({error:'No autorizado'},403);
   if(!env.DB)return respond({error:'D1 no configurada'},503);
   try{
    const grouped=await env.DB.prepare('SELECT provider,stage,state,COUNT(*) AS total,SUM(expected_cents) AS amount_cents FROM payment_attempts GROUP BY provider,stage,state ORDER BY provider,stage,state').all();
    const unresolved=await env.DB.prepare("SELECT p.id,q.folio,p.provider,p.stage,p.state,p.expected_cents,p.created_at FROM payment_attempts p JOIN approved_quotes q ON q.id=p.quote_id WHERE p.state IN ('created','redirected','awaiting_bank') AND datetime(p.created_at) < datetime('now','-2 hours') ORDER BY p.created_at ASC LIMIT 25").all();
    return respond({ok:true,asOf:new Date().toISOString(),aggregates:grouped.results||[],needsReview:unresolved.results||[],notes:'Montos esperados, NO saldo efectivamente liquidado. Conciliar con banco y proveedor.'});
   }catch(_){return respond({error:'Esquema de pagos pendiente: revisar migraciones y conexión D1.'},503)}
  }
  if(path==='/api/admin/metricas'&&request.method==='GET'){
   if(!admin(request,env)||!env.DB)return respond({error:'No autorizado'},403);
   if(env.ANALYTICS_ENABLED!=='true')return respond({enabled:false,events:[]});
   try{const rows=await env.DB.prepare('SELECT event_type,COUNT(*) AS total FROM analytics_events_v50 GROUP BY event_type').all();return respond({enabled:true,events:rows.results||[]})}catch(_){return respond({enabled:false,events:[],reason:'Ejecutar migración V50'},503)}
  }
  if(path==='/api/admin/retell'&&request.method==='GET'){
   if(!admin(request,env))return respond({error:'No autorizado'},403);
   if(!env.DB||!await exists(env))return respond({enabled:false,events:[]},503);
   const rows=await env.DB.prepare('SELECT folio,quote_id,status,scheduled_at,call_status,call_outcome,retell_call_id,attempts,created_at,updated_at FROM retell_followups_v51 ORDER BY created_at DESC LIMIT 50').all();
   return respond({enabled:!!enabled(env),events:rows.results||[]});
  }
  if(path==='/api/admin/clientes'&&request.method==='GET')return await adminList(request,env);
  if(path.startsWith('/api/admin/')&&request.method==='POST')return await adminUpdate(request,env,path);
  if(path==='/api/checkout'&&request.method==='POST')return await checkout(request,env);
  if(path==='/api/brick/setup'&&request.method==='POST')return await brickSetup(request,env);
  if(path==='/api/brick/pay'&&request.method==='POST')return await brickPay(request,env);
  if(path==='/api/webhooks/stripe'&&request.method==='POST')return await stripeWebhook(request,env);
  if(path==='/api/webhooks/mercadopago'&&request.method==='POST')return await mpWebhook(request,env);
  if(path==='/api/webhooks/nowpayments'&&request.method==='POST')return await nowpaymentsWebhook(request,env);
  return respond({error:'Ruta API no encontrada'},404)
 }catch(e){return respond({error:'No se pudo procesar la solicitud. Intenta más tarde.'},500)}
 }};
