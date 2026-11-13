
import { handleBetaRequest } from './beta-overdrive.js';
import { handleAvianyRequest } from './aviany-production.js';

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
const WATERNET_SESSION_SECONDS=30*24*60*60;
const SEGMENTS=new Set(['vivienda','condominio','pyme','comercial','desarrollo','industrial','gobierno','civil','profesional']);
const STAGES={recibida:'Solicitud recibida',calificacion:'Evaluación inicial',visita:'Diagnóstico / visita pendiente',diseno:'Diseño y presupuesto en preparación',propuesta:'Propuesta disponible',contrato:'Contrato y confirmación',instalacion:'Instalación en proceso',qa:'Control de calidad',entregado:'Sistema entregado',mantenimiento:'Mantenimiento',cancelado:'Solicitud cerrada'};
const CRM_STAGES=new Set(['NUEVO','CONTACTADO','CALIFICADO','VISITA','COTIZACIÓN','PROPUESTA APROBADA','ANTICIPO CONFIRMADO','INSTALACIÓN','ENTREGADO','HI CARE']);
const CRM_SOURCES=new Set(['facebook','referido','google','organico','aliado','desconocida']);
const CRM_PRIORITIES=new Set(['baja','normal','alta','critica']);
function respond(o,status=200){return new Response(JSON.stringify(o),{status,headers:JSON_HEADERS})}
function norm(s,n=120){return typeof s==='string'?s.trim().slice(0,n):''}
function validNumber(n,min,max){return typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max}
function originAllowed(req){let origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin}
// Compatibility restoration: do not require extra PRIVACY_NOTICE_GO_APPROVED gate introduced in VFinal.
// Existing legal approval, consent capture and Turnstile remain; Cloudflare runtime flags control reception.
function privacyReady(env){return env.LEGAL_APPROVED==='true'}
function betaRuntimeReady(env){return env.BETA_MODE==='true'&&env.BETA_ISOLATED==='true'&&!!env.DB_BETA}
function publicWriteApproved(env){return env.PRODUCTION_PUBLIC_GO_APPROVED==='true'}
function gate(env){return !!(env.DB&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&privacyReady(env)&&env.LEADS_ENABLED==='true'&&(betaRuntimeReady(env)||publicWriteApproved(env)))}
function payGate(env){return !!(gate(env)&&env.PRODUCTION_PAYMENTS_APPROVED==='true'&&env.PAYMENTS_ENABLED==='true'&&env.COMMERCE_GO_APPROVED==='true'&&env.CONTRACT_TERMS_APPROVED==='true')} // Explicit production approval required; fail closed by default
function externalCommsReady(env){return env.PRODUCTION_COMMS_APPROVED==='true'}
// Evita presentar el formulario como operativo si la migración D1 no está aplicada.
async function schemaReady(env){if(!env.DB)return false;try{for(const table of ['lead_cases','lead_diagnostics','lead_alerts'])await env.DB.prepare('SELECT '+(table==='lead_cases'?'folio':table==='lead_diagnostics'?'folio':'folio')+' FROM '+table+' LIMIT 1').first();return true}catch(_){return false}}
async function schemaDiagnostic(env){
 if(!env.DB)return {state:'missing',label:'Ausente',reason:'El binding DB no está disponible en este entorno.'};
 try{for(const table of ['lead_cases','lead_diagnostics','lead_alerts'])await env.DB.prepare('SELECT folio FROM '+table+' LIMIT 1').first();return {state:'operational',label:'Operativa',reason:'Las tablas mínimas de recepción responden.'};}
 catch(error){const message=String(error?.message||'');const migration=/no such table|does not exist|not found/i.test(message);return migration?{state:'migration_pending',label:'Migración pendiente',reason:'Falta una tabla mínima del esquema de recepción.'}:{state:'connection_error',label:'Error de conexión',reason:'No se pudo consultar el esquema D1.'};}
}

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
// Cloudflare's official test pair can return hostname=localhost or example.com; allow only those placeholders on a Pages Preview host, after Siteverify succeeds.
const TURNSTILE_TEST_SITE_KEY='1x00000000000000000000AA',TURNSTILE_TEST_SECRET='1x0000000000000000000000000000000AA';
async function validateTurnstile(request,env,token){
 const requestHost=new URL(request.url).hostname.toLowerCase(),body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token}),ip=request.headers.get('CF-Connecting-IP');if(ip)body.set('remoteip',ip);
 const officialTestPair=env.TURNSTILE_SITE_KEY===TURNSTILE_TEST_SITE_KEY&&env.TURNSTILE_SECRET===TURNSTILE_TEST_SECRET,previewPagesHost=requestHost.endsWith('.pluviam.pages.dev')&&requestHost!=='pluviam.pages.dev';let httpStatus=null;
 try{
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body});httpStatus=r.status;const v=await r.json(),rawCodes=Array.isArray(v?.['error-codes'])?v['error-codes']:[],errorCodes=rawCodes.filter(code=>typeof code==='string'&&/^[a-z0-9-]{1,80}$/i.test(code)).slice(0,8),hostname=typeof v?.hostname==='string'&&/^[a-z0-9.-]{1,253}$/i.test(v.hostname)?v.hostname.toLowerCase():null,action=typeof v?.action==='string'&&/^[a-z0-9_-]{1,32}$/i.test(v.action)?v.action:null,hostnameMatch=hostname===requestHost,testHostnameAllowed=officialTestPair&&previewPagesHost&&(hostname==='localhost'||hostname==='example.com'),accepted=r.ok&&v?.success===true&&(hostnameMatch||testHostnameAllowed);
  console.info('WATERNET_TURNSTILE_SITEVERIFY',{httpStatus,success:v?.success===true,errorCodes,hostname,requestHost,hostnameMatch,action,officialTestPair,previewPagesHost,accepted});return accepted;
 }catch(error){console.warn('WATERNET_TURNSTILE_SITEVERIFY',{httpStatus,success:false,errorCodes:[],hostname:null,requestHost,hostnameMatch:false,action:null,officialTestPair,previewPagesHost,accepted:false,errorName:error?.name||'Error'});return false}
}
async function limited(request,env){if(!env.ABUSE_PEPPER)return true;let ip=request.headers.get('CF-Connecting-IP');if(!ip)return true;const window=Math.floor(Date.now()/3600000);const signature=await hash(env.ABUSE_PEPPER+':'+ip+':'+window);await env.DB.prepare('DELETE FROM abuse_windows WHERE expires_at < ?').bind(new Date().toISOString()).run();const existing=await env.DB.prepare('SELECT attempts FROM abuse_windows WHERE signature=?').bind(signature).first();if(existing&&existing.attempts>=8)return false;const expire=new Date(Date.now()+86400000).toISOString();await env.DB.prepare('INSERT INTO abuse_windows(signature,attempts,expires_at) VALUES(?,1,?) ON CONFLICT(signature) DO UPDATE SET attempts=attempts+1').bind(signature,expire).run();return true}
async function bodyJson(request,max=12000){const len=Number(request.headers.get('content-length')||0);if(len>max)throw new Error('Tamaño de solicitud excesivo');const t=await request.text();if(t.length>max)throw new Error('Contenido demasiado largo');return JSON.parse(t)}
const ALLY_TERMS_VERSION='PLUVIAM-ALIADOS-2026-11-04-v1',ALLY_PRIVACY_VERSION='PLUVIAM-PRIVACIDAD-2026-11-04-v1';
function allyGate(env){return !!(env.DB&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY&&privacyReady(env)&&env.ALLIES_ENABLED==='true'&&(publicWriteApproved(env)||env.ALLY_INTAKE_PREVIEW_APPROVED==='true'))}
async function allySchemaReady(env){if(!env.DB)return false;try{for(const table of ['aliados','aliados_admin_logs','consentimiento_logs','enlaces_aliado'])await env.DB.prepare('SELECT * FROM '+table+' LIMIT 1').first();return true}catch(_){return false}}
function listInput(value,max=8){const values=Array.isArray(value)?value:value===undefined||value===null?'':String(value).split(',');return [...new Set(values.map(v=>norm(v,60).toLowerCase()).filter(Boolean))].slice(0,max)}
function profileImage(value){
 if(value===undefined||value===null||value==='')return '';
 if(typeof value!=='string'||value.length>245800)return null;
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
 if(!match)return null;
 let bytes;try{bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0))}catch{return null}
 if(bytes.length>184320)return null;
 const isPng=match[1]==='png'&&bytes.length>=8&&[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
 const isJpeg=match[1]==='jpeg'&&bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const isWebp=match[1]==='webp'&&bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return isPng||isJpeg||isWebp?value:null;
}
function httpsUrl(value,max=1200){
 if(value===undefined||value===null||value==='')return '';
 if(typeof value!=='string'||value.length>max)return null;
 try{const url=new URL(value.trim());return url.protocol==='https:'&&!url.username&&!url.password?url.toString():null}catch{return null}
}
async function newAlly(request,env){
 if(!allyGate(env)||!(await allySchemaReady(env)))return respond({error:'El onboarding de aliados aún no está habilitado.'},503);
 if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);
 let s;try{s=await bodyJson(request,9000)}catch{return respond({error:'Solicitud de incorporación inválida.'},400)}
 const synthetic=s.qaSynthetic===true;
 if(synthetic&&env.ALLOW_SYNTHETIC_ALLY_INTAKE!=='true')return respond({error:'El modo QA sintético está deshabilitado.'},403);
 const fullName=norm(s.fullName,120),company=norm(s.company,140),email=norm(s.email,180).toLowerCase(),phone=norm(s.phone,30),city=norm(s.city,80),role=norm(s.role,20).toUpperCase(),services=listInput(s.services),coverage=listInput(s.coverage),capacity=Number(s.capacityMonth),availability=norm(s.availability,20).toLowerCase(),clientRequestId=norm(s.clientRequestId,90),logo=s.logoPermissionInterest===true,turn=norm(s.turnstile,5000);
 if(fullName.length<2||!/^\S+@\S+\.\S+$/.test(email)||phone.length<7||city.length<2||!['REFERIDOR','EJECUTOR','AMBOS'].includes(role)||!services.length||services.length>8||!coverage.length||coverage.length>8||!Number.isInteger(capacity)||capacity<0||capacity>100||!['ahora','semana','mes','saturado'].includes(availability)||!/^[A-Za-z0-9_-]{16,90}$/.test(clientRequestId)||s.consent!==true||s.privacyAccepted!==true||!turn)return respond({error:'Revisa los datos, el consentimiento y la verificación de seguridad.'},422);
 if(!(await validateTurnstile(request,env,turn)))return respond({error:'No se pudo validar la comprobación anti-spam.'},403);
 const existing=await env.DB.prepare('SELECT id,is_synthetic FROM aliados WHERE client_request_id=?').bind(clientRequestId).first();if(existing)return respond({id:existing.id,state:'received',synthetic:!!existing.is_synthetic,idempotent:true},200);
 const duplicate=await env.DB.prepare('SELECT id FROM aliados WHERE lower(email_normalized)=?').bind(email).first();if(duplicate)return respond({error:'Este correo ya tiene un perfil, por favor contacta al administrador para reclamar tu acceso'},409);
 try{const member=await env.DB.prepare("SELECT member_id FROM beehive_memberships WHERE lower(access_email)=? AND status='ACTIVE' AND ally_id IS NOT NULL LIMIT 1").bind(email).first(),invite=await env.DB.prepare("SELECT invite_id FROM beehive_invites WHERE lower(access_email)=? AND status='READY' AND ally_id IS NOT NULL AND julianday(expires_at)>julianday('now') LIMIT 1").bind(email).first();if(member||invite)return respond({error:'Este correo ya tiene un perfil, por favor contacta al administrador para reclamar tu acceso'},409)}catch(error){if(!/no such table/i.test(String(error?.message||'')))throw error}
 const id='ALY-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),now=new Date().toISOString(),ipHash=await hash(request.headers.get('CF-Connecting-IP')||'unknown'),userAgent=norm(request.headers.get('User-Agent')||'unknown',240),termsHash=await hash(ALLY_TERMS_VERSION),privacyHash=await hash(ALLY_PRIVACY_VERSION);
 try{await env.DB.batch([
  env.DB.prepare("INSERT INTO aliados(id,client_request_id,full_name,company,email_normalized,phone,city,role,services_json,coverage_json,capacity_month,availability,status,logo_permission_interest,is_synthetic,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,clientRequestId,fullName,company,email,phone,city,role,JSON.stringify(services),JSON.stringify(coverage),capacity,availability,'PENDIENTE_G0',logo?1:0,synthetic?1:0,now,now),
  env.DB.prepare("INSERT INTO consentimiento_logs(id,aliado_id,event_type,ip_address,user_agent,created_at,terms_version,privacy_version,terms_sha256,privacy_sha256,terms_accepted,privacy_accepted,logo_permission_interest) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,'ally_intake',ipHash,userAgent,now,ALLY_TERMS_VERSION,ALLY_PRIVACY_VERSION,termsHash,privacyHash,1,1,logo?1:0),
  env.DB.prepare("INSERT INTO aliados_admin_logs(id,aliado_id,actor_email,accion,estado_anterior,estado_nuevo,detalle_json,timestamp_utc) VALUES(?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,'public-intake',synthetic?'registro_QA_sintetico':'registro_publico',null,'PENDIENTE_G0',JSON.stringify({services,coverage,capacityMonth:capacity,availability,synthetic}),now)
 ]);}catch(error){if(/unique constraint failed: aliados\.email_normalized/i.test(String(error?.message||'')))return respond({error:'Este correo ya tiene un perfil, por favor contacta al administrador para reclamar tu acceso'},409);throw error}
 return respond({id,state:'received',synthetic},201)
}
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
 if(!externalCommsReady(env)||!env.RESEND_API_KEY||!env.RESEND_FROM||!env.DB)return 'disabled';
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
 if(!externalCommsReady(env)||!env.DB||!env.RESEND_API_KEY||!env.RESEND_FROM)return {processed:0};
 const rows=await env.DB.prepare("SELECT folio FROM lead_alerts WHERE status='pending' AND attempts<5 ORDER BY created_at LIMIT 5").all();
 let processed=0;for(const item of (rows.results||[])){await deliverLeadAlert(env,item.folio);processed++}return {processed};
}
// Folio al cliente: sólo si el proveedor, el remitente y la autorización de comunicaciones están activos.
// Sin llaves configuradas devuelve 'disabled' y NUNCA bloquea ni revierte el alta del prospecto.
async function deliverLeadFolio(env,folio){
 if(!externalCommsReady(env)||!env.RESEND_API_KEY||!env.RESEND_FROM||!env.DB)return 'disabled';
 try{
  const row=await env.DB.prepare('SELECT folio,name,email FROM lead_cases WHERE folio=?').bind(folio).first();
  if(!row||!/^\S+@\S+\.\S+$/.test(row.email||''))return 'skipped';
  const message={from:env.RESEND_FROM,to:[row.email],subject:'PLUVIAM | Tu folio '+folio,
   text:['Hola '+row.name+',','Recibimos tu diagnóstico. Tu folio es '+folio+'.',
    'Consulta tu expediente en https://pluviam.pages.dev/mi-proyecto.html con tu folio y la clave privada que se mostró al terminar el diagnóstico.',
    'Por seguridad, no compartas tu clave privada por correo. Si no reconoces esta solicitud, ignora este mensaje.'].join('\n')};
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'lead-folio-'+folio},body:JSON.stringify(message),signal:AbortSignal.timeout(4500)});
  if(!response.ok)throw Error('Proveedor no confirmó la aceptación del folio');
  return 'sent';
 }catch(_){return 'pending'}
}
// Aviso de asignación: webhook configurable + correo al aliado. Ambos canales son opcionales e idempotentes.
async function deliverAllyAssignment(env,folio,allyId){
 if(!externalCommsReady(env)||!env.DB)return 'disabled';
 let ally,lead;
 try{
  ally=await env.DB.prepare('SELECT id,full_name,company,email_normalized,phone FROM aliados WHERE id=? AND is_synthetic=0').bind(allyId).first();
  lead=await env.DB.prepare('SELECT folio,name,city,segment FROM lead_cases WHERE folio=?').bind(folio).first();
 }catch(_){return 'pending'}
 if(!ally)return 'skipped';
 const payload={event:'assignment.created',folio,ally_id:ally.id,ally_name:ally.full_name,company:ally.company,client:lead?.name||null,city:lead?.city||null,panel:'https://pluviam.pages.dev/aliado/portal/'};
 let webhook='disabled';
 if(env.ALLY_ASSIGN_WEBHOOK_URL){
  try{const r=await fetch(env.ALLY_ASSIGN_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json',...(env.ALLY_ASSIGN_WEBHOOK_TOKEN?{Authorization:'Bearer '+env.ALLY_ASSIGN_WEBHOOK_TOKEN}:{})},body:JSON.stringify(payload),signal:AbortSignal.timeout(4000)});webhook=r.ok?'sent':'pending'}catch(_){webhook='pending'}
 }
 let email='disabled';
 if(env.RESEND_API_KEY&&env.RESEND_FROM&&/^\S+@\S+\.\S+$/.test(ally.email_normalized||'')){
  try{const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'ally-assign-'+folio+'-'+ally.id},body:JSON.stringify({from:env.RESEND_FROM,to:[ally.email_normalized],subject:'PLUVIAM | Nuevo trabajo asignado '+folio,text:['Hola '+ally.full_name+',','Se te asignó el folio '+folio+' ('+(lead?.name||'cliente')+', '+(lead?.city||'sin ciudad')+').','Consulta el expediente y confirma disponibilidad en https://pluviam.pages.dev/aliado/portal/'].join('\n')}),signal:AbortSignal.timeout(4500)});email=r.ok?'sent':'pending'}catch(_){email='pending'}
 }
 if(webhook==='disabled'&&email==='disabled')return 'disabled';
 return 'webhook:'+webhook+' email:'+email;
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
async function newLead(request,env,ctx){if(!gate(env)||!(await schemaReady(env)))return respond({error:'La recepción de solicitudes aún no está habilitada.'},503);if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);let s;try{s=await bodyJson(request)}catch{return respond({error:'Formulario inválido.'},400)};
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
 const url=new URL(request.url),requestedSource=norm(s.acquisitionSource||url.searchParams.get('utm_source')||'',40).toLowerCase(),sourceMap={fb:'facebook',facebook:'facebook',meta:'facebook',ref:'referido',referido:'referido',google:'google',organic:'organico',organico:'organico',aliado:'aliado'};
 const acquisitionSource=sourceMap[requestedSource]||'desconocida',acquisitionDetail=norm(s.acquisitionDetail||url.searchParams.get('utm_campaign')||'',120);
 await env.DB.batch([env.DB.prepare('INSERT INTO lead_cases(folio,access_hash,name,email,phone,segment,city,roof,objective,storage,usage,timeframe,rainfall,efficiency,preferred_payment,monthly_expense_mxn,consent_version,consent_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...fields),env.DB.prepare('INSERT INTO lead_diagnostics(folio,answers_json) VALUES(?,?)').bind(folio,JSON.stringify(storedAnswers)),env.DB.prepare("INSERT INTO lead_alerts(folio,status) VALUES(?,'pending')").bind(folio),env.DB.prepare("INSERT INTO crm_prospects(folio,acquisition_source,acquisition_detail,is_synthetic,next_action) VALUES(?,?,?,0,'Revisar diagnóstico y definir primer contacto.')").bind(folio,acquisitionSource,acquisitionDetail)]);
 const alert=await deliverLeadAlert(env,folio);const folioEmail=ctx?.waitUntil?(ctx.waitUntil(deliverLeadFolio(env,folio)),'queued'):await deliverLeadFolio(env,folio);await aggregateEvent(env,'cotizacion_solicitada');return respond({folio,accessToken,stage:'recibida',alert,folio_email:folioEmail},201)
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
async function crmReady(env){
 try{await env.DB.prepare('SELECT folio FROM crm_prospects LIMIT 1').first();return true}catch(_){return false}
}
async function adminCrmList(request,env){
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 if(!await crmReady(env))return respond({error:'Migración CRM pendiente.'},503);
 const url=new URL(request.url),includeSynthetic=url.searchParams.get('includeSynthetic')==='true',stage=norm(url.searchParams.get('stage'),40),source=norm(url.searchParams.get('source'),30),query=norm(url.searchParams.get('q'),100);
 const where=[],bind=[];if(!includeSynthetic)where.push('c.is_synthetic=0');if(CRM_STAGES.has(stage)){where.push('c.pipeline_stage=?');bind.push(stage)}if(CRM_SOURCES.has(source)){where.push('c.acquisition_source=?');bind.push(source)}if(query){where.push('(lower(l.folio) LIKE ? OR lower(l.name) LIKE ? OR lower(l.email) LIKE ? OR lower(l.city) LIKE ?)');const q='%'+query.toLowerCase()+'%';bind.push(q,q,q,q)}
 const sql=`SELECT l.folio,l.name,l.email,l.phone,l.segment,l.city,l.objective,l.created_at AS lead_created_at,c.acquisition_source,c.acquisition_detail,c.responsible,c.priority,c.pipeline_stage,c.next_action,c.follow_up_at,c.private_notes,c.ally_id,c.ally_assigned_at,c.is_synthetic,c.updated_at FROM crm_prospects c JOIN lead_cases l ON l.folio=c.folio ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY CASE c.priority WHEN 'critica' THEN 0 WHEN 'alta' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,c.follow_up_at IS NULL,c.follow_up_at,c.updated_at DESC LIMIT 100`;
 try{const rows=await env.DB.prepare(sql).bind(...bind).all();await adminEvent(env.DB,'','crm:list');return respond({prospects:rows.results||[],includeSynthetic,limit:100})}catch(_){return respond({error:'No se pudo consultar el CRM; revisa la migración 012.'},503)}
}
async function adminCrmDetail(request,env,folio){
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio))return respond({error:'Folio inválido'},400);
 if(!await crmReady(env))return respond({error:'Migración CRM pendiente.'},503);
 const exists=await env.DB.prepare('SELECT folio FROM lead_cases WHERE folio=?').bind(folio).first();if(!exists)return respond({error:'Caso no encontrado'},404);
 if(request.method==='GET'){
  try{const row=await env.DB.prepare(`SELECT l.folio,l.name,l.email,l.phone,l.segment,l.city,l.roof,l.objective,l.storage,l.usage,l.timeframe,l.monthly_expense_mxn,l.status,l.next_step,l.created_at AS lead_created_at,c.acquisition_source,c.acquisition_detail,c.responsible,c.priority,c.pipeline_stage,c.next_action,c.follow_up_at,c.private_notes,c.ally_id,c.ally_assigned_at,c.is_synthetic,c.updated_at FROM lead_cases l JOIN crm_prospects c ON c.folio=l.folio WHERE l.folio=?`).bind(folio).first();const diag=await env.DB.prepare('SELECT answers_json FROM lead_diagnostics WHERE folio=?').bind(folio).first();const history=await env.DB.prepare('SELECT id,actor,action,from_stage,to_stage,detail_json,created_at FROM crm_activity_log WHERE folio=? ORDER BY created_at DESC LIMIT 100').bind(folio).all();await adminEvent(env.DB,folio,'crm:view');return respond({prospect:row,diagnostic:diag?JSON.parse(diag.answers_json):null,history:history.results||[]})}catch(_){return respond({error:'No se pudo abrir la ficha CRM.'},503)}
 }
 let d;try{d=await bodyJson(request,6000)}catch{return respond({error:'Solicitud inválida'},400)}
 const current=await env.DB.prepare('SELECT pipeline_stage,acquisition_source,acquisition_detail,responsible,priority,next_action,follow_up_at,private_notes,ally_id,ally_assigned_at FROM crm_prospects WHERE folio=?').bind(folio).first();if(!current)return respond({error:'Prospecto CRM no encontrado'},404);
 const hasAllyId=Object.prototype.hasOwnProperty.call(d,'allyId');
 if(hasAllyId&&d.allyId!==null&&typeof d.allyId!=='string')return respond({error:'Aliado inválido'},422);
 const nextAlly=hasAllyId?(d.allyId===null?null:norm(d.allyId,80)||null):current.ally_id||null;
 if(hasAllyId&&nextAlly){
  const ally=await env.DB.prepare('SELECT id,status,capacity_month,availability FROM aliados WHERE id=?').bind(nextAlly).first();
  if(!ally)return respond({error:'Aliado no encontrado'},404);
  if(ally.status!=='G0_APROBADO')return respond({error:'NO ASIGNABLE: Falta G0'},403);
  const monthlyCapacity=Number(ally.capacity_month)||0;
  if(monthlyCapacity<=0||ally.availability==='saturado')return respond({error:'NO ASIGNABLE: Sin cupo'},403);
  const used=await env.DB.prepare("SELECT COUNT(*) AS assigned_count FROM crm_prospects WHERE ally_id=? AND strftime('%Y-%m',ally_assigned_at)=strftime('%Y-%m','now') AND folio<>?").bind(nextAlly,folio).first();
  if(Number(used?.assigned_count||0)>=monthlyCapacity)return respond({error:'NO ASIGNABLE: Sin cupo'},403);
 }
 const nextStage=d.pipelineStage===undefined?current.pipeline_stage:norm(d.pipelineStage,40),nextSource=d.acquisitionSource===undefined?current.acquisition_source:norm(d.acquisitionSource,30).toLowerCase(),nextPriority=d.priority===undefined?current.priority:norm(d.priority,20).toLowerCase();if(!CRM_STAGES.has(nextStage)||!CRM_SOURCES.has(nextSource)||!CRM_PRIORITIES.has(nextPriority))return respond({error:'Etapa, fuente o prioridad inválida'},422);
 const responsible=d.responsible===undefined?current.responsible:norm(d.responsible,120),nextAction=d.nextAction===undefined?current.next_action:norm(d.nextAction,300),followUp=d.followUpAt===undefined?current.follow_up_at:norm(d.followUpAt,40),detail=d.acquisitionDetail===undefined?current.acquisition_detail:norm(d.acquisitionDetail,120),note=norm(d.note,1200);if(followUp&&!/^\d{4}-\d{2}-\d{2}(T|$)/.test(followUp))return respond({error:'Fecha de seguimiento inválida'},422);
 const notes=note?(current.private_notes?current.private_notes+'\n':'')+'['+new Date().toISOString()+'] '+note:current.private_notes;const changed=current.pipeline_stage!==nextStage||current.acquisition_source!==nextSource||current.responsible!==responsible||current.priority!==nextPriority||current.next_action!==nextAction||current.follow_up_at!==followUp;
 try{
  const activityAction=hasAllyId?(nextAlly?'crm:ally_assigned':'crm:ally_unassigned'):'crm:update',adminAction=hasAllyId?activityAction:changed?'crm:updated:'+nextStage:'crm:note';
  const activityDetail={source:nextSource,responsible,priority:nextPriority,nextAction,followUp,note:!!note,allyId:hasAllyId?nextAlly:current.ally_id||null};
  await env.DB.batch([
   env.DB.prepare('UPDATE crm_prospects SET acquisition_source=?,acquisition_detail=?,responsible=?,priority=?,pipeline_stage=?,next_action=?,follow_up_at=?,private_notes=?,ally_id=CASE WHEN ?=1 THEN ? ELSE ally_id END,ally_assigned_at=CASE WHEN ?=0 THEN ally_assigned_at WHEN ? IS NULL THEN NULL WHEN ally_id IS ? THEN COALESCE(ally_assigned_at,CURRENT_TIMESTAMP) ELSE CURRENT_TIMESTAMP END,updated_at=CURRENT_TIMESTAMP WHERE folio=?').bind(nextSource,detail,responsible||null,nextPriority,nextStage,nextAction||null,followUp||null,notes,hasAllyId?1:0,nextAlly,hasAllyId?1:0,nextAlly,nextAlly,folio),
   env.DB.prepare('INSERT INTO crm_activity_log(id,folio,actor,action,from_stage,to_stage,detail_json) VALUES(?,?,?,?,?,?,?)').bind(crypto.randomUUID(),folio,'admin',activityAction,current.pipeline_stage,nextStage,JSON.stringify(activityDetail)),
   env.DB.prepare('INSERT INTO admin_events(event_id,folio,action) VALUES(?,?,?)').bind(crypto.randomUUID(),folio,adminAction)
  ]);
  return respond({ok:true,folio,pipelineStage:nextStage,source:nextSource,responsible,priority:nextPriority,nextAction,followUpAt:followUp,noteSaved:!!note,allyId:hasAllyId?nextAlly:current.ally_id||null})
 }catch(_){return respond({error:'No se pudo guardar el prospecto CRM.'},503)}
}
async function adminAllies(request,env){
 // Admin API requests use the same bearer token as the rest of /api/admin/*.
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 try{
  const includeSynthetic=new URL(request.url).searchParams.get('includeSynthetic')==='true';
  const rows=await env.DB.prepare(`SELECT id,historical_a_id,client_request_id,full_name,company,email_normalized,phone,city,role,services_json,coverage_json,capacity_month,availability,status,logo_permission_interest,is_synthetic,created_at,updated_at FROM aliados ${includeSynthetic?'':'WHERE is_synthetic=0'} ORDER BY created_at DESC,id DESC LIMIT 100`).all();
  await adminEvent(env.DB,'','allies:list');
  const synthetic=await env.DB.prepare('SELECT COUNT(*) AS total FROM aliados WHERE is_synthetic=1').first();
  return respond({allies:rows.results||[],limit:100,syntheticExcluded:!includeSynthetic,syntheticCount:synthetic?.total||0});
 }catch(_){return respond({error:'Esquema de aliados pendiente de migración.'},503)}
}
async function adminAllyDetail(request,env,id){
 const actor='admin';
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 if(!/^[A-Za-z0-9_-]{1,80}$/.test(id))return respond({error:'Identificador de aliado inválido'},400);
 let current;try{current=await env.DB.prepare('SELECT id,full_name,company,city,role,services_json,coverage_json,capacity_month,availability,status,created_at,updated_at,is_synthetic FROM aliados WHERE id=? AND is_synthetic=0').bind(id).first()}catch(_){return respond({error:'Esquema de aliados pendiente de migración.'},503)}
 if(!current)return respond({error:'Ficha de aliado no encontrada'},404);
 if(request.method==='GET')return respond({ally:current});
 if(request.method!=='PATCH')return respond({error:'Método no permitido'},405);
 let d;try{d=await bodyJson(request,6000)}catch{return respond({error:'Solicitud inválida'},400)}
 const role=d.role===undefined?current.role:norm(d.role,20),availability=d.availability===undefined?current.availability:norm(d.availability,20),capacity=d.capacityMonth===undefined?Number(current.capacity_month):d.capacityMonth;
 const allowedStatuses=new Set(['PENDIENTE_G0','G0_PENDIENTE','EN_REVISION','RECHAZADO','SUSPENDIDO']),status=d.status===undefined?current.status:norm(d.status,30);
 const asList=(value,fallback)=>value===undefined?fallback:[...new Set((Array.isArray(value)?value:[]).map(x=>norm(x,80)).filter(Boolean))].slice(0,12);
 let oldServices=[],oldCoverage=[];try{oldServices=JSON.parse(current.services_json||'[]');oldCoverage=JSON.parse(current.coverage_json||'[]')}catch{}
 const services=asList(d.services,oldServices),coverage=asList(d.coverage,oldCoverage),company=d.company===undefined?current.company:norm(d.company,160),city=d.city===undefined?current.city:norm(d.city,100),reason=norm(d.reason,300);
 if(!['REFERIDOR','EJECUTOR','AMBOS'].includes(role)||!['ahora','semana','mes','saturado'].includes(availability)||!validNumber(capacity,0,100)||!city)return respond({error:'Rol, región, capacidad o disponibilidad inválidos'},422);
 if(d.status!==undefined&&(!allowedStatuses.has(status)||['G0_APROBADO','APROBADO_REFERIDOR'].includes(current.status)))return respond({error:'El estado solicitado requiere una revisión G0 o aprobación independiente'},403);
 if(reason.length<10)return respond({error:'Registra el motivo del cambio (10–300 caracteres)'},422);
 try{
  await env.DB.prepare('UPDATE aliados SET company=?,city=?,role=?,services_json=?,coverage_json=?,capacity_month=?,availability=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND is_synthetic=0').bind(company||null,city,role,JSON.stringify(services),JSON.stringify(coverage),capacity,availability,status,id).run();
  await env.DB.prepare('INSERT INTO aliados_admin_logs(id,aliado_id,actor_email,accion,estado_anterior,estado_nuevo,detalle_json,timestamp_utc) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,actor,'actualizar_ficha_interna',current.status,status,JSON.stringify({company:company||null,city,role,services,coverage,capacityMonth:capacity,availability,reason}),new Date().toISOString()).run();
  return respond({ok:true,id,status,access:'unchanged',assignment:'unchanged'});
 }catch(_){return respond({error:'No se pudo guardar la ficha interna.'},503)}
}
let accessJwksCache={team:'',expiresAt:0,keys:[]};
const accessCryptoKeys=new Map();
function accessBase64UrlBytes(value){const base64=value.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(value.length/4)*4,'=');return Uint8Array.from(atob(base64),c=>c.charCodeAt(0))}
function accessBase64UrlJson(value){return JSON.parse(new TextDecoder().decode(accessBase64UrlBytes(value)))}
function accessAssertions(request){const candidates=[],add=(source,value)=>{let token=String(value||'').trim();if(!token)return;if(token.startsWith('"')&&token.endsWith('"'))token=token.slice(1,-1);const push=value=>{if(value&&!candidates.some(candidate=>candidate.token===value))candidates.push({source,token:value})};push(token);try{push(decodeURIComponent(token))}catch{}};add('Cf-Access-Jwt-Assertion',request.headers.get('Cf-Access-Jwt-Assertion'));for(const part of (request.headers.get('Cookie')||'').split(';')){const separator=part.indexOf('=');if(separator>=0&&part.slice(0,separator).trim()==='CF_Authorization')add('CF_Authorization',part.slice(separator+1))}return candidates}
async function accessPublicKeys(team,refresh=false){
 if(!refresh&&accessJwksCache.team===team&&accessJwksCache.expiresAt>Date.now())return accessJwksCache.keys;
 const response=await fetch(team+'/cdn-cgi/access/certs',{headers:{Accept:'application/json'},redirect:'error'});if(!response.ok)throw new Error('Access signing keys unavailable');
 const body=await response.json();if(!Array.isArray(body.keys)||!body.keys.length||body.keys.length>8)throw new Error('Access signing keys invalid');
 accessJwksCache={team,expiresAt:Date.now()+15*60*1000,keys:body.keys.filter(key=>key?.kty==='RSA'&&key?.alg==='RS256'&&key?.use==='sig'&&typeof key.kid==='string')};return accessJwksCache.keys;
}
async function accessIdentity(request,env){
 const path=new URL(request.url).pathname,jwtHeader=request.headers.get('Cf-Access-Jwt-Assertion')||'',cookieHeader=request.headers.get('Cookie')||'',hasAccessCookie=cookieHeader.split(';').some(part=>part.slice(0,part.indexOf('=')).trim()==='CF_Authorization');
 if(path==='/api/beehive/invitations/accept')console.log('[BEEHIVE_ACCESS_DIAGNOSTIC]',{path,hasJwtHeader:!!jwtHeader.trim(),hasAccessCookie});
 const configuredTeam=norm(env.CF_ACCESS_TEAM_DOMAIN||env.TEAM_DOMAIN,220).replace(/\/$/,''),team=configuredTeam?(configuredTeam.includes('://')?configuredTeam:'https://'+configuredTeam):'',audience=norm(env.CF_ACCESS_AUDIENCE||env.POLICY_AUD,180),tokens=accessAssertions(request);
 if(!tokens.length){const missing=[];if(!jwtHeader.trim())missing.push('Cf-Access-Jwt-Assertion');if(!hasAccessCookie)missing.push('cookie CF_Authorization');return {email:'',reason:'No llegó '+missing.join(' ni ')+'.'}}
 if(!team||!audience)return {email:'',reason:'Falta configuración de Cloudflare Access: TEAM_DOMAIN o POLICY_AUD.'};
 try{
  const teamUrl=new URL(team);if(teamUrl.protocol!=='https:'||!teamUrl.hostname.endsWith('.cloudflareaccess.com')||teamUrl.pathname!=='/'||teamUrl.username||teamUrl.password)return {email:'',reason:'TEAM_DOMAIN no es un dominio válido de Cloudflare Access.'};
 }catch{return {email:'',reason:'TEAM_DOMAIN no es un dominio válido de Cloudflare Access.'}}
 const failures=new Map();
 for(const candidate of tokens){const {token,source}=candidate;let reason='JWT rechazado por Cloudflare Access.';try{
  if(token.length>8192){reason='JWT demasiado largo.';failures.set(source,reason);continue}
  const parts=token.split('.');if(parts.length!==3){reason='JWT malformado: se esperaban tres segmentos.';failures.set(source,reason);continue}
  let header,payload;try{header=accessBase64UrlJson(parts[0]);payload=accessBase64UrlJson(parts[1])}catch{reason='JWT malformado: no se pudo decodificar el encabezado o contenido.';failures.set(source,reason);continue}
  if(header.alg!=='RS256'||typeof header.kid!=='string'){reason='JWT rechazado: algoritmo o identificador de clave no válido.';failures.set(source,reason);continue}
  if(String(payload.iss||'').replace(/\/$/,'')!==team){reason='JWT rechazado: issuer no coincide con TEAM_DOMAIN.';failures.set(source,reason);continue}
  const audiences=Array.isArray(payload.aud)?payload.aud:[payload.aud];if(!audiences.includes(audience)){reason='JWT rechazado: audience no coincide con POLICY_AUD.';failures.set(source,reason);continue}
  const nowSeconds=Math.floor(Date.now()/1000),clockSkewSeconds=120;if(!Number.isFinite(payload.exp)||payload.exp<nowSeconds-clockSkewSeconds||Number.isFinite(payload.nbf)&&payload.nbf>nowSeconds+clockSkewSeconds||Number.isFinite(payload.iat)&&payload.iat>nowSeconds+clockSkewSeconds){reason='JWT rechazado: exp, nbf o iat fuera de la ventana permitida.';failures.set(source,reason);continue}
  const email=norm(payload.email,180).toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)){reason='JWT rechazado: falta un email válido en el claim.';failures.set(source,reason);continue}
  let jwk=(await accessPublicKeys(team)).find(key=>key.kid===header.kid);if(!jwk)jwk=(await accessPublicKeys(team,true)).find(key=>key.kid===header.kid);if(!jwk){reason='JWT rechazado: no se encontró la clave de firma en Cloudflare Access.';failures.set(source,reason);continue}
  const cacheKey=team+'|'+jwk.kid;let publicKey=accessCryptoKeys.get(cacheKey);if(!publicKey){publicKey=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);accessCryptoKeys.set(cacheKey,publicKey)}
  const valid=await crypto.subtle.verify({name:'RSASSA-PKCS1-v1_5'},publicKey,accessBase64UrlBytes(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));if(valid)return {email,reason:''};reason='JWT rechazado: firma no válida.';failures.set(source,reason);
 }catch{reason='No se pudo cargar o verificar la clave pública de Cloudflare Access.';failures.set(source,reason)}}
 const detail=[...failures].map(([source,reason])=>source+': '+reason);return {email:'',reason:detail.length?detail.join(' '):'No se pudo validar la identidad de Cloudflare Access.'};
}
async function accessEmail(request,env){return (await accessIdentity(request,env)).email}
async function beehiveMember(request,env,email){
 email=email===undefined?await accessEmail(request,env):email;if(!email||!env.DB)return null;
 try{return await env.DB.prepare("SELECT member_id,access_email,display_name,organization,role,ally_id,status FROM beehive_memberships WHERE lower(access_email)=? AND status='ACTIVE'").bind(email).first()}catch(_){return null}
}
async function waternetSession(request,env){
 if(!env.DB)return null;let token='';
 for(const part of (request.headers.get('Cookie')||'').split(';')){const separator=part.indexOf('=');if(separator>=0&&part.slice(0,separator).trim()==='WATERNET_SESSION'){token=part.slice(separator+1).trim();try{token=decodeURIComponent(token)}catch{}break}}
 if(!token)return null;
 try{return await env.DB.prepare("SELECT m.member_id,m.access_email,m.display_name,m.organization,m.role,m.ally_id,m.status FROM beehive_portal_sessions s JOIN beehive_memberships m ON m.member_id=s.member_id WHERE s.session_hash=? AND julianday(s.expires_at)>julianday('now') AND m.status='ACTIVE'").bind(await hash(token)).first()}catch(_){return null}
}
async function beehiveApi(request,env,path){
 if(!env.DB)return respond({error:'D1 no configurada'},503);
 const member=await beehiveMember(request,env);if(!member)return respond({error:'Identidad BeeHive no autorizada'},await accessEmail(request,env)?403:401);
 if(path==='/api/beehive/me'&&request.method==='GET'){
  const ally=member.ally_id?await env.DB.prepare('SELECT id,full_name,company,city,role,services_json,coverage_json,capacity_month,availability,status FROM aliados WHERE id=?').bind(member.ally_id).first():null;
  const events=await env.DB.prepare('SELECT event_type,detail_json,created_at FROM beehive_events WHERE member_id=? ORDER BY created_at DESC LIMIT 50').bind(member.member_id).all();
  return respond({member,ally,events:events.results||[],externalActions:false});
 }
 if(path==='/api/beehive/organization'&&request.method==='GET'){
  if(!member.ally_id)return respond({member,projects:[],documents:[],message:'La identidad no tiene un expediente de aliado asignado.'});
  const ally=await env.DB.prepare('SELECT id,full_name,company,city,role,services_json,coverage_json,capacity_month,availability,status FROM aliados WHERE id=?').bind(member.ally_id).first();
  const review=await env.DB.prepare('SELECT status,evidence_ref,notes,reviewed_at FROM beehive_g0_reviews WHERE ally_id=?').bind(member.ally_id).first();
  const events=await env.DB.prepare('SELECT event_type,detail_json,created_at FROM beehive_events WHERE ally_id=? ORDER BY created_at DESC LIMIT 50').bind(member.ally_id).all();
  return respond({member,ally,g0:review||{status:'PENDING'},projects:[],documents:[],events:events.results||[],externalActions:false});
 }
 return respond({error:'Ruta BeeHive no encontrada'},404);
}
async function adminBeehive(request,env,path){
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 if(path==='/api/admin/beehive/memberships'&&request.method==='GET'){
  try{const rows=await env.DB.prepare('SELECT member_id,access_email,display_name,organization,role,ally_id,status,created_at,activated_at,revoked_at,updated_at FROM beehive_memberships ORDER BY created_at DESC').all();return respond({memberships:rows.results||[]})}catch(_){return respond({error:'Migración BeeHive pendiente.'},503)}
 }
 if(path==='/api/admin/beehive/invites'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,5000)}catch{return respond({error:'Solicitud inválida'},400)}
  const email=norm(d.accessEmail,180).toLowerCase(),name=norm(d.displayName,120),organization=norm(d.organization,140),role=norm(d.role,30),allyId=norm(d.allyId,80);if(!/^\S+@\S+\.\S+$/.test(email)||name.length<2||organization.length<2||!['internal_admin','ally_executor','ally_referrer'].includes(role))return respond({error:'Datos de invitación inválidos'},422);
  if((role==='ally_executor'||role==='ally_referrer')&&!allyId)return respond({error:'Un aliado necesita expediente asignado'},422);
  if(allyId){const ally=await env.DB.prepare('SELECT id,status FROM aliados WHERE id=?').bind(allyId).first();if(!ally)return respond({error:'Aliado no encontrado'},404);if(ally.status!=='G0_APROBADO')return respond({error:'El aliado debe tener G0 aprobado antes de invitar'},409)}
  const raw=crypto.randomUUID()+'-'+crypto.randomUUID(),inviteId='INV-'+crypto.randomUUID().slice(0,12).toUpperCase(),expires=new Date(Date.now()+48*3600000).toISOString();try{await env.DB.prepare('INSERT INTO beehive_invites(invite_id,access_email,display_name,organization,role,ally_id,token_hash,expires_at,created_by) VALUES(?,?,?,?,?,?,?,?,?)').bind(inviteId,email,name,organization,role,allyId||null,await hash(raw),expires,'admin').run();await env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),allyId||null,'admin','invite_created',JSON.stringify({inviteId,email,role,expiresAt:expires,delivery:'MANUAL_ONLY'})).run();return respond({ok:true,inviteId,accessEmail:email,expiresAt:expires,delivery:'MANUAL_ONLY',tokenReturnedOnce:true,token:raw,externalActions:false},201)}catch(_){return respond({error:'No se pudo crear la invitación.'},503)}
 }
 if(path==='/api/admin/beehive/review'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,5000)}catch{return respond({error:'Solicitud inválida'},400)}const allyId=norm(d.allyId,80),status=norm(d.status,20).toUpperCase(),evidence=norm(d.evidenceRef,220),notes=norm(d.notes,1200);if(!allyId||!['APPROVED','REJECTED','REVOKED','PENDING'].includes(status))return respond({error:'Revisión G0 inválida'},422);const ally=await env.DB.prepare('SELECT id FROM aliados WHERE id=?').bind(allyId).first();if(!ally)return respond({error:'Aliado no encontrado'},404);const mapped=status==='APPROVED'?'G0_APROBADO':status==='REJECTED'?'RECHAZADO':status==='REVOKED'?'SUSPENDIDO':'PENDIENTE_G0';await env.DB.batch([env.DB.prepare("INSERT INTO beehive_g0_reviews(review_id,ally_id,status,reviewer,evidence_ref,notes,reviewed_at) VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(ally_id) DO UPDATE SET status=excluded.status,reviewer=excluded.reviewer,evidence_ref=excluded.evidence_ref,notes=excluded.notes,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP").bind('G0-'+crypto.randomUUID().slice(0,12),allyId,status,'admin',evidence,notes),env.DB.prepare('UPDATE aliados SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(mapped,allyId),env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),allyId,'admin','g0_reviewed',JSON.stringify({status,evidenceRef:evidence,notes}))]);return respond({ok:true,allyId,g0Status:status,allyStatus:mapped,externalActions:false});
 }
 if(path==='/api/admin/beehive/revoke'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const memberId=norm(d.memberId,80);if(!memberId)return respond({error:'Membresía inválida'},422);const r=await env.DB.prepare("UPDATE beehive_memberships SET status='REVOKED',revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE member_id=? AND status!='REVOKED'").bind(memberId).run();if(!r.meta?.changes)return respond({error:'Membresía no encontrada o ya revocada'},404);await env.DB.prepare('INSERT INTO beehive_events(event_id,member_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),memberId,'admin','membership_revoked','{}').run();return respond({ok:true,memberId,status:'REVOKED'});
 }
 return respond({error:'Ruta BeeHive admin no encontrada'},404)
}
async function acceptBeehiveInvite(request,env){
 if(!env.DB)return respond({error:'D1 no configurada'},503);const email=await accessEmail(request,env);if(!email)return respond({error:'Cloudflare Access requerido'},401);let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const token=norm(d.token,150);if(token.length<50)return respond({error:'Invitación inválida'},422);const invite=await env.DB.prepare("SELECT invite_id,access_email,display_name,organization,role,ally_id,expires_at,status FROM beehive_invites WHERE token_hash=?").bind(await hash(token)).first();if(!invite||invite.status!=='READY'||invite.access_email!==email)return respond({error:'Invitación inválida, revocada o no corresponde a tu identidad'},403);if(new Date(invite.expires_at)<=new Date()){await env.DB.prepare("UPDATE beehive_invites SET status='EXPIRED' WHERE invite_id=?").bind(invite.invite_id).run();return respond({error:'Invitación expirada'},410)}const memberId='MBR-'+crypto.randomUUID().slice(0,12).toUpperCase();await env.DB.batch([env.DB.prepare('INSERT INTO beehive_memberships(member_id,access_email,display_name,organization,role,ally_id,status,activated_at) VALUES(?,?,?,?,?,?,\'ACTIVE\',CURRENT_TIMESTAMP) ON CONFLICT(access_email) DO UPDATE SET status=\'ACTIVE\',role=excluded.role,ally_id=excluded.ally_id,updated_at=CURRENT_TIMESTAMP').bind(memberId,email,invite.display_name,invite.organization,invite.role,invite.ally_id),env.DB.prepare("UPDATE beehive_invites SET status='USED',used_at=CURRENT_TIMESTAMP WHERE invite_id=? AND status='READY'").bind(invite.invite_id),env.DB.prepare('INSERT INTO beehive_events(event_id,member_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),memberId,invite.ally_id,email,'membership_activated',JSON.stringify({inviteId:invite.invite_id}))]);return respond({ok:true,member:{memberId,email,organization:invite.organization,role:invite.role,allyId:invite.ally_id},externalActions:false});
}
async function waternetProfile(request,env,member){
 if(request.method==='GET'){
  if(!member.ally_id)return respond({error:'La identidad no tiene un perfil asignado.'},409);
  const ally=await env.DB.prepare('SELECT id,full_name,company,email_normalized,phone,city,role,services_json,coverage_json,capacity_month,availability,status,logo_permission_interest FROM aliados WHERE id=? AND is_synthetic=0').bind(member.ally_id).first();if(!ally)return respond({error:'La organización no está disponible.'},404);
  const profile=await env.DB.prepare('SELECT professional_title,professional_bio,website,photo_data_url,logo_data_url,logo_permission_requested,profile_status,review_notes,updated_at FROM beehive_profiles WHERE ally_id=?').bind(member.ally_id).first();
  let services=[],coverage=[];try{services=JSON.parse(ally.services_json||'[]');coverage=JSON.parse(ally.coverage_json||'[]')}catch(_){services=[];coverage=[]}
  const logo=await env.DB.prepare('SELECT granted,public_approved FROM bee_logo_licenses WHERE aliado_id=?').bind(member.ally_id).first(),g0=await env.DB.prepare('SELECT status FROM beehive_g0_reviews WHERE ally_id=?').bind(member.ally_id).first();
  return respond({member,ally:{...ally,services,coverage},profile:profile||null,logoAuthorized:!!(logo?.granted&&logo?.public_approved),g0:g0||{status:'PENDING'}});
 }
 if(request.method!=='PUT')return respond({error:'Método no permitido'},405);
 if(!member.ally_id)return respond({error:'La identidad no tiene un perfil asignado.'},409);
 let d;try{d=await bodyJson(request,600000)}catch{return respond({error:'Perfil inválido o demasiado grande.'},400)}
 const fullName=norm(d.fullName,120),company=norm(d.company,140),phone=norm(d.phone,30),city=norm(d.city,80),role=norm(d.role,20).toUpperCase(),services=listInput(d.services),coverage=listInput(d.coverage),capacity=Number(d.capacityMonth),availability=norm(d.availability,20).toLowerCase(),title=norm(d.professionalTitle,120),bio=norm(d.professionalBio,1200),website=httpsUrl(d.website,300),photo=profileImage(d.photoDataUrl),logo=profileImage(d.logoDataUrl),logoRequest=d.logoPermissionRequested===true;
 if(fullName.length<2||phone.length<7||city.length<2||!['REFERIDOR','EJECUTOR','AMBOS'].includes(role)||!services.length||services.length>8||!coverage.length||coverage.length>8||!Number.isInteger(capacity)||capacity<0||capacity>100||!['ahora','semana','mes','saturado'].includes(availability)||website===null||photo===null||logo===null)return respond({error:'Revisa los datos profesionales y el formato de las imágenes.'},422);
 const previous=await env.DB.prepare('SELECT photo_data_url,logo_data_url FROM beehive_profiles WHERE ally_id=?').bind(member.ally_id).first(),now=new Date().toISOString(),photoValue=d.clearPhoto===true?'':photo||previous?.photo_data_url||'',logoValue=d.clearLogo===true?'':logo||previous?.logo_data_url||'';
 try{const statements=[
  env.DB.prepare('UPDATE aliados SET full_name=?,company=?,phone=?,city=?,role=?,services_json=?,coverage_json=?,capacity_month=?,availability=?,logo_permission_interest=?,updated_at=? WHERE id=? AND is_synthetic=0').bind(fullName,company,phone,city,role,JSON.stringify(services),JSON.stringify(coverage),capacity,availability,logoRequest?1:0,now,member.ally_id),
  env.DB.prepare(`INSERT INTO beehive_profiles(ally_id,professional_title,professional_bio,website,photo_data_url,logo_data_url,logo_permission_requested,profile_status,review_notes,reviewed_by,reviewed_at,updated_at) VALUES(?,?,?,?,?,?,?,'PENDING_REVIEW','','',NULL,?) ON CONFLICT(ally_id) DO UPDATE SET professional_title=excluded.professional_title,professional_bio=excluded.professional_bio,website=excluded.website,photo_data_url=excluded.photo_data_url,logo_data_url=excluded.logo_data_url,logo_permission_requested=excluded.logo_permission_requested,profile_status='PENDING_REVIEW',review_notes='',reviewed_by=NULL,reviewed_at=NULL,updated_at=excluded.updated_at`).bind(member.ally_id,title,bio,website,photoValue,logoValue,logoRequest?1:0,now),
  env.DB.prepare('INSERT INTO beehive_events(event_id,member_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),member.member_id,member.ally_id,member.access_email,'profile_updated',JSON.stringify({profileReview:'PENDING_REVIEW'}))
 ];if(logoValue!==(previous?.logo_data_url||'')||!logoRequest)statements.push(env.DB.prepare('UPDATE bee_logo_licenses SET granted=0,public_approved=0,revoked_at=?,updated_at=? WHERE aliado_id=?').bind(now,now,member.ally_id));await env.DB.batch(statements);return respond({ok:true,profileStatus:'PENDING_REVIEW',g0Status:'UNCHANGED',projectAccess:'UNCHANGED'})}catch(_){return respond({error:'No se pudo guardar el perfil.'},503)}
}
async function waternetApi(request,env,path){
 if(!env.DB)return respond({error:'D1 no configurada'},503);
 const waternetPath=new URL(request.url).pathname.startsWith('/api/waternet/'),member=waternetPath?await waternetSession(request,env):await beehiveMember(request,env);
 if(!member)return respond({error:waternetPath?'Sesión WATERNET inválida o expirada.':'Identidad WATERNET no autorizada'},401);
 if(path==='/api/beehive/me'&&request.method==='GET')return await waternetProfile(request,env,member);
 if(path==='/api/beehive/profile')return await waternetProfile(request,env,member);
 if(path==='/api/beehive/news'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT news_id,title,body,created_at,published_at FROM beehive_news WHERE published=1 AND (ally_id IS NULL OR ally_id=?) ORDER BY COALESCE(published_at,created_at) DESC LIMIT 100').bind(member.ally_id||'').all();return respond({news:rows.results||[]});
 }
 if(path==='/api/beehive/resources'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT resource_id,title,description,resource_url,created_at FROM beehive_resources WHERE authorized=1 AND published=1 AND (ally_id IS NULL OR ally_id=?) ORDER BY updated_at DESC LIMIT 100').bind(member.ally_id||'').all();return respond({resources:rows.results||[]});
 }
 if(path==='/api/beehive/organization'&&request.method==='GET'){
  if(!member.ally_id)return respond({member,projects:[],documents:[],message:'No hay una organización asignada.'});
  const g0=await env.DB.prepare('SELECT status,evidence_ref,reviewed_at FROM beehive_g0_reviews WHERE ally_id=?').bind(member.ally_id).first();return respond({member,g0:g0||{status:'PENDING'},projects:[],documents:[]});
 }
 return respond({error:'Ruta no encontrada'},404);
}
async function targetAlly(db,id){return await db.prepare('SELECT id FROM aliados WHERE id=? AND is_synthetic=0').bind(id).first()}
async function waternetAdmin(request,env,path){
 if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 if(path==='/api/admin/beehive/memberships'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT member_id,access_email,display_name,organization,role,ally_id,status,created_at,activated_at,revoked_at,updated_at FROM beehive_memberships ORDER BY created_at DESC').all();return respond({memberships:rows.results||[]});
 }
 if(path==='/api/admin/beehive/invites'&&request.method==='GET'){
  const rows=await env.DB.prepare("SELECT invite_id,access_email,display_name,organization,role,ally_id,CASE WHEN status='READY' AND julianday(expires_at)<=julianday('now') THEN 'EXPIRED' ELSE status END AS status,expires_at,created_at,used_at FROM beehive_invites ORDER BY created_at DESC LIMIT 100").all();return respond({invites:rows.results||[]});
 }
 if(path==='/api/admin/beehive/existing-ally'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,6000)}catch{return respond({error:'Solicitud inválida'},400)}
  const historicalAId=norm(d.historicalAId,24).toUpperCase(),email=norm(d.accessEmail,180).toLowerCase(),requestedName=norm(d.displayName,120),requestedOrganization=norm(d.organization,140),role=norm(d.role,30),authorizationRef=norm(d.authorizationRef,240),actor='admin';
  if(!/^A-[A-Z0-9]{1,10}$/.test(historicalAId)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['ally_executor','ally_referrer'].includes(role))return respond({error:'Revisa A-ID histórico, correo y rol.'},422);
  if(d.founderAuthorized!==true||authorizationRef.length<8)return respond({error:'Registra la autorización expresa del fundador y su referencia antes de preparar una invitación.'},403);
  if(await env.DB.prepare("SELECT member_id FROM beehive_memberships WHERE lower(access_email)=? AND status='ACTIVE'").bind(email).first())return respond({error:'Esta identidad ya tiene acceso activo.'},409);
  if(await env.DB.prepare("SELECT invite_id FROM beehive_invites WHERE lower(access_email)=? AND status='READY' AND julianday(expires_at)>julianday('now') LIMIT 1").bind(email).first())return respond({error:'Ya existe una invitación pendiente para esta identidad.'},409);
  const byHistoricalId=await env.DB.prepare('SELECT id,full_name,company,status,is_synthetic,historical_a_id FROM aliados WHERE historical_a_id=?').bind(historicalAId).first();
  const byEmail=await env.DB.prepare('SELECT id,full_name,company,status,is_synthetic,historical_a_id FROM aliados WHERE lower(email_normalized)=?').bind(email).first();
  if(byHistoricalId&&byEmail&&byHistoricalId.id!==byEmail.id)return respond({error:'El A-ID y el correo ya pertenecen a expedientes distintos. Revisa el registro antes de continuar.'},409);
  let ally=byHistoricalId||byEmail,createdAlly=false;
  const legacyDefaults={'A-01':{name:'Contacto Isla Urbana',organization:'Isla Urbana'},'A-02':{name:'Fernando',organization:'Rain Colecta'}};
  const name=requestedName||norm(ally?.full_name,120)||legacyDefaults[historicalAId]?.name||'',organization=requestedOrganization||norm(ally?.company,140)||legacyDefaults[historicalAId]?.organization||'';
  if(name.length<2||organization.length<2)return respond({error:'Completa el nombre y la organización para este A-ID antes de crear el expediente.'},422);
  if(ally?.is_synthetic)return respond({error:'Los registros sintéticos no pueden convertirse en perfiles reales.'},409);
  if(ally&&ally.historical_a_id&&ally.historical_a_id!==historicalAId)return respond({error:'Este correo ya está asociado a otro A-ID histórico.'},409);
  if(ally&&['RECHAZADO','SUSPENDIDO'].includes(ally.status))return respond({error:'El expediente no admite una invitación nueva.'},409);
  if(!ally){
   ally={id:'ALY-HIST-'+crypto.randomUUID().slice(0,12).toUpperCase(),full_name:name,company:organization,status:'PENDIENTE_G0',is_synthetic:0,historical_a_id:historicalAId};createdAlly=true;
  }
  const raw=crypto.randomUUID()+'-'+crypto.randomUUID(),inviteId='INV-'+crypto.randomUUID().slice(0,12).toUpperCase(),expires=new Date(Date.now()+48*3600000).toISOString(),now=new Date().toISOString(),allyRole=role==='ally_executor'?'EJECUTOR':'REFERIDOR';
  const statements=[];
  if(createdAlly)statements.push(env.DB.prepare("INSERT INTO aliados(id,client_request_id,full_name,company,email_normalized,phone,city,role,services_json,coverage_json,capacity_month,availability,status,logo_permission_interest,is_synthetic,created_at,updated_at,historical_a_id) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(ally.id,'ADMIN-HIST-'+crypto.randomUUID(),name,organization,email,'Pendiente de actualizar','Por confirmar',allyRole,'[]','[]',0,'saturado','PENDIENTE_G0',0,0,now,now,historicalAId));
  else if(!ally.historical_a_id)statements.push(env.DB.prepare('UPDATE aliados SET historical_a_id=?,updated_at=? WHERE id=? AND historical_a_id IS NULL').bind(historicalAId,now,ally.id));
  statements.push(
   env.DB.prepare('INSERT INTO beehive_invites(invite_id,access_email,display_name,organization,role,ally_id,token_hash,expires_at,created_by) VALUES(?,?,?,?,?,?,?,?,?)').bind(inviteId,email,name,organization,role,ally.id,await hash(raw),expires,actor),
   env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),ally.id,actor,'existing_ally_invited',JSON.stringify({inviteId,email,role,historicalAId,expiresAt:expires,delivery:'MANUAL_ONLY',authorizationRef,createdAlly})),
   env.DB.prepare('INSERT INTO aliados_admin_logs(id,aliado_id,actor_email,accion,estado_anterior,estado_nuevo,detalle_json,timestamp_utc) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),ally.id,actor,createdAlly?'crear_expediente_aliado_historico':'vincular_a_id_historico',null,ally.status,JSON.stringify({historicalAId,email,role,inviteId,createdAlly,authorizationRef}),now)
  );
  try{await env.DB.batch(statements)}catch(error){if(/unique constraint failed: aliados\.(?:email_normalized|historical_a_id)/i.test(String(error?.message||'')))return respond({error:'Ya existe un expediente con ese correo o A-ID. Actualiza la bandeja y revisa el registro antes de continuar.'},409);throw error}
  const inviteUrl=new URL('/waternet/portal/',request.url);inviteUrl.hash='invite='+encodeURIComponent(raw);
  return respond({ok:true,createdAlly,historicalAId,allyId:ally.id,inviteId,accessEmail:email,expiresAt:expires,delivery:'MANUAL_ONLY',inviteUrl:inviteUrl.toString(),tokenReturnedOnce:true,externalActions:false},201);
 }
 if(path==='/api/admin/beehive/invites'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,5000)}catch{return respond({error:'Solicitud inválida'},400)}
  const authorizationRef=norm(d.authorizationRef,240);if(d.founderAuthorized!==true||authorizationRef.length<8)return respond({error:'Registra la autorización expresa del fundador y su referencia antes de preparar una invitación.'},403);
  const email=norm(d.accessEmail,180).toLowerCase(),name=norm(d.displayName,120),organization=norm(d.organization,140),role=norm(d.role,30),allyId=norm(d.allyId,80);
  if(!/^\S+@\S+\.\S+$/.test(email)||name.length<2||organization.length<2||!['ally_executor','ally_referrer'].includes(role)||!allyId)return respond({error:'Revisa identidad, organización, rol y expediente.'},422);
  const ally=await env.DB.prepare('SELECT id,status,is_synthetic FROM aliados WHERE id=?').bind(allyId).first();if(!ally||ally.is_synthetic)return respond({error:'Expediente de organización no encontrado.'},404);if(['RECHAZADO','SUSPENDIDO'].includes(ally.status))return respond({error:'El expediente no admite una nueva invitación.'},409);
  if(await env.DB.prepare("SELECT member_id FROM beehive_memberships WHERE lower(access_email)=? AND status='ACTIVE'").bind(email).first())return respond({error:'Esta identidad ya tiene acceso activo.'},409);
  if(await env.DB.prepare("SELECT invite_id FROM beehive_invites WHERE lower(access_email)=? AND status='READY' AND julianday(expires_at)>julianday('now') LIMIT 1").bind(email).first())return respond({error:'Ya existe una invitación pendiente para esta identidad.'},409);
  const raw=crypto.randomUUID()+'-'+crypto.randomUUID(),inviteId='INV-'+crypto.randomUUID().slice(0,12).toUpperCase(),expires=new Date(Date.now()+48*3600000).toISOString();
  try{await env.DB.batch([
   env.DB.prepare('INSERT INTO beehive_invites(invite_id,access_email,display_name,organization,role,ally_id,token_hash,expires_at,created_by) VALUES(?,?,?,?,?,?,?,?,?)').bind(inviteId,email,name,organization,role,allyId,await hash(raw),expires,'admin'),
   env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),allyId,'admin','invite_created',JSON.stringify({inviteId,email,role,expiresAt:expires,delivery:'MANUAL_ONLY',authorizationRef}))
  ]);return respond({ok:true,inviteId,accessEmail:email,expiresAt:expires,delivery:'MANUAL_ONLY',tokenReturnedOnce:true,token:raw,externalActions:false},201)}catch(_){return respond({error:'No se pudo preparar la invitación.'},503)}
 }
 if(path==='/api/admin/beehive/invites/revoke'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const id=norm(d.inviteId,80);if(!id)return respond({error:'Invitación inválida'},422);
  const result=await env.DB.prepare("UPDATE beehive_invites SET status='REVOKED' WHERE invite_id=? AND status='READY'").bind(id).run();if(!result.meta?.changes)return respond({error:'Invitación no encontrada o ya utilizada'},404);
  await env.DB.prepare('INSERT INTO beehive_events(event_id,actor,event_type,detail_json) VALUES(?,?,?,?)').bind(crypto.randomUUID(),'admin','invite_revoked',JSON.stringify({inviteId:id})).run();return respond({ok:true,inviteId:id,status:'REVOKED'});
 }
 if(path==='/api/admin/beehive/revoke'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const id=norm(d.memberId,80);if(!id)return respond({error:'Membresía inválida'},422);
  const result=await env.DB.prepare("UPDATE beehive_memberships SET status='REVOKED',revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE member_id=? AND status='ACTIVE'").bind(id).run();if(!result.meta?.changes)return respond({error:'Membresía no encontrada o ya revocada'},404);
  await env.DB.prepare('INSERT INTO beehive_events(event_id,member_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,'admin','membership_revoked','{}').run();return respond({ok:true,memberId:id,status:'REVOKED'});
 }
 if(path==='/api/admin/beehive/profiles'&&request.method==='GET'){
  const rows=await env.DB.prepare(`SELECT a.id AS ally_id,a.full_name,a.company,a.email_normalized,a.city,a.status AS ally_status,p.professional_title,p.profile_status,p.logo_permission_requested,p.updated_at AS profile_updated_at,g.status AS g0_status FROM aliados a LEFT JOIN beehive_profiles p ON p.ally_id=a.id LEFT JOIN beehive_g0_reviews g ON g.ally_id=a.id WHERE a.is_synthetic=0 ORDER BY COALESCE(p.updated_at,a.updated_at) DESC LIMIT 100`).all();return respond({profiles:rows.results||[]});
 }
 if(path==='/api/admin/beehive/profile'&&request.method==='GET'){
  const id=norm(new URL(request.url).searchParams.get('allyId'),80);if(!id)return respond({error:'Organización inválida'},422);
  const row=await env.DB.prepare(`SELECT a.id AS ally_id,a.full_name,a.company,a.email_normalized,a.phone,a.city,a.role,a.services_json,a.coverage_json,a.capacity_month,a.availability,a.status AS ally_status,p.professional_title,p.professional_bio,p.website,p.photo_data_url,p.logo_data_url,p.logo_permission_requested,p.profile_status,p.review_notes,p.updated_at,COALESCE(l.granted,0) AS logo_granted,COALESCE(l.public_approved,0) AS logo_public_approved FROM aliados a LEFT JOIN beehive_profiles p ON p.ally_id=a.id LEFT JOIN bee_logo_licenses l ON l.aliado_id=a.id WHERE a.id=? AND a.is_synthetic=0`).bind(id).first();if(!row)return respond({error:'Perfil no encontrado'},404);return respond({profile:row});
 }
 if(path==='/api/admin/beehive/profile/review'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,5000)}catch{return respond({error:'Solicitud inválida'},400)}const id=norm(d.allyId,80),status=norm(d.profileStatus,24).toUpperCase(),notes=norm(d.notes,1200),logoAuthorized=d.logoAuthorized===true,ref=norm(d.authorizationRef,220);
  if(!id||!['PENDING_REVIEW','APPROVED','NEEDS_CHANGES','REJECTED'].includes(status)||logoAuthorized&&ref.length<8)return respond({error:'Revisión inválida.'},422);
  const ally=await env.DB.prepare('SELECT id,company,logo_permission_interest FROM aliados WHERE id=? AND is_synthetic=0').bind(id).first();if(!ally)return respond({error:'Organización no encontrada.'},404);
  const profile=await env.DB.prepare('SELECT logo_data_url FROM beehive_profiles WHERE ally_id=?').bind(id).first();if(!profile)return respond({error:'El candidato todavía no ha guardado su perfil.'},409);if(logoAuthorized&&(!ally.logo_permission_interest||!profile.logo_data_url))return respond({error:'Se requiere logotipo cargado y solicitud de autorización.'},409);
  const now=new Date().toISOString(),slug=(ally.company||id).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||id;
  try{await env.DB.batch([
   env.DB.prepare('UPDATE beehive_profiles SET profile_status=?,review_notes=?,reviewed_by=?,reviewed_at=?,updated_at=? WHERE ally_id=?').bind(status,notes,'admin',now,now,id),
   logoAuthorized?env.DB.prepare(`INSERT INTO bee_logo_licenses(aliado_id,slug,license_version,granted,public_approved,authorized_by,granted_at,revoked_at,updated_at) VALUES(?,?,?,1,1,'admin',?,NULL,?) ON CONFLICT(aliado_id) DO UPDATE SET slug=excluded.slug,license_version=excluded.license_version,granted=1,public_approved=1,authorized_by='admin',granted_at=excluded.granted_at,revoked_at=NULL,updated_at=excluded.updated_at`).bind(id,slug,'WATERNET-AUTHORIZATION-v1',now,now):env.DB.prepare("UPDATE bee_logo_licenses SET granted=0,public_approved=0,revoked_at=?,updated_at=? WHERE aliado_id=?").bind(now,now,id),
   env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,'admin','profile_reviewed',JSON.stringify({profileStatus:status,logoAuthorized,authorizationRef:ref,notes}))
  ]);return respond({ok:true,allyId:id,profileStatus:status,logoAuthorized,g0Status:'UNCHANGED'})}catch(_){return respond({error:'No se pudo guardar la revisión.'},503)}
 }
 if(path==='/api/admin/beehive/news'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT news_id,ally_id,title,body,published,created_at,published_at,updated_at FROM beehive_news ORDER BY updated_at DESC LIMIT 100').all();return respond({news:rows.results||[]});
 }
 if(path==='/api/admin/beehive/news'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,8000)}catch{return respond({error:'Novedad inválida'},400)}const id=norm(d.newsId,80)||'WNA-'+crypto.randomUUID().slice(0,12).toUpperCase(),allyId=norm(d.allyId,80),title=norm(d.title,160),body=norm(d.body,5000),published=d.published===true;
  if(title.length<3||body.length<3||allyId&&!(await targetAlly(env.DB,allyId)))return respond({error:'Completa título, contenido y una organización válida.'},422);
  await env.DB.prepare(`INSERT INTO beehive_news(news_id,ally_id,title,body,published,created_by,published_at) VALUES(?,?,?,?,?,'admin',CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END) ON CONFLICT(news_id) DO UPDATE SET ally_id=excluded.ally_id,title=excluded.title,body=excluded.body,published=excluded.published,updated_at=CURRENT_TIMESTAMP,published_at=CASE WHEN excluded.published=1 THEN COALESCE(beehive_news.published_at,CURRENT_TIMESTAMP) ELSE NULL END`).bind(id,allyId||null,title,body,published?1:0,published?1:0).run();return respond({ok:true,newsId:id,published},201);
 }
 if(path==='/api/admin/beehive/resources'&&request.method==='GET'){
  const rows=await env.DB.prepare('SELECT resource_id,ally_id,title,description,resource_url,authorization_ref,authorized,published,created_at,updated_at FROM beehive_resources ORDER BY updated_at DESC LIMIT 100').all();return respond({resources:rows.results||[]});
 }
 if(path==='/api/admin/beehive/resources'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,8000)}catch{return respond({error:'Recurso inválido'},400)}const id=norm(d.resourceId,80)||'WNR-'+crypto.randomUUID().slice(0,12).toUpperCase(),allyId=norm(d.allyId,80),title=norm(d.title,160),description=norm(d.description,1000),url=httpsUrl(d.resourceUrl),ref=norm(d.authorizationRef,240),authorized=d.authorized===true&&ref.length>=3,published=d.published===true;
  if(title.length<3||!url||allyId&&!(await targetAlly(env.DB,allyId))||published&&!authorized)return respond({error:'Se requiere título, enlace HTTPS y referencia de autorización antes de publicar.'},422);
  await env.DB.prepare(`INSERT INTO beehive_resources(resource_id,ally_id,title,description,resource_url,authorization_ref,authorized,published,created_by) VALUES(?,?,?,?,?,?,?,?, 'admin') ON CONFLICT(resource_id) DO UPDATE SET ally_id=excluded.ally_id,title=excluded.title,description=excluded.description,resource_url=excluded.resource_url,authorization_ref=excluded.authorization_ref,authorized=excluded.authorized,published=excluded.published,updated_at=CURRENT_TIMESTAMP`).bind(id,allyId||null,title,description,url,ref,authorized?1:0,published?1:0).run();return respond({ok:true,resourceId:id,authorized,published},201);
 }
 if(path==='/api/admin/beehive/review'&&request.method==='POST'){
  let d;try{d=await bodyJson(request,5000)}catch{return respond({error:'Solicitud inválida'},400)}const id=norm(d.allyId,80),status=norm(d.status,20).toUpperCase(),evidence=norm(d.evidenceRef,220),notes=norm(d.notes,1200);if(!id||!['APPROVED','REJECTED','REVOKED','PENDING'].includes(status))return respond({error:'Revisión inválida'},422);if(status==='APPROVED'&&evidence.length<8)return respond({error:'G0 requiere referencia verificable de evidencia técnica.'},422);const ally=await env.DB.prepare('SELECT id,is_synthetic FROM aliados WHERE id=?').bind(id).first();if(!ally||ally.is_synthetic)return respond({error:'Organización no encontrada'},404);const mapped=status==='APPROVED'?'G0_APROBADO':status==='REJECTED'?'RECHAZADO':status==='REVOKED'?'SUSPENDIDO':'PENDIENTE_G0';await env.DB.batch([env.DB.prepare("INSERT INTO beehive_g0_reviews(review_id,ally_id,status,reviewer,evidence_ref,notes,reviewed_at) VALUES(?,?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(ally_id) DO UPDATE SET status=excluded.status,reviewer=excluded.reviewer,evidence_ref=excluded.evidence_ref,notes=excluded.notes,reviewed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP").bind('G0-'+crypto.randomUUID().slice(0,12),id,status,'admin',evidence,notes),env.DB.prepare('UPDATE aliados SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(mapped,id),env.DB.prepare('INSERT INTO beehive_events(event_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),id,'admin','g0_reviewed',JSON.stringify({status,evidenceRef:evidence,notes}))]);return respond({ok:true,allyId:id,g0Status:status,workAuthorization:'unchanged'});
 }
 return respond({error:'Ruta de administración no encontrada'},404);
}
async function acceptWaternetInvite(request,env){
 if(!env.DB)return respond({error:'D1 no configurada'},503);let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const token=norm(d.invite_token||d.token,150);if(token.length<50)return respond({error:'Folio de invitación inválido.'},422);
 const tokenHash=await hash(token),invite=await env.DB.prepare("SELECT invite_id,access_email,display_name,organization,role,ally_id,expires_at,status FROM beehive_invites WHERE token_hash=? AND status='READY'").bind(tokenHash).first();if(!invite)return respond({error:'Invitación inválida o ya utilizada.'},403);
 const now=new Date().toISOString();if(!Number.isFinite(Date.parse(invite.expires_at))||Date.parse(invite.expires_at)<=Date.now()){await env.DB.prepare("UPDATE beehive_invites SET status='EXPIRED' WHERE invite_id=? AND status='READY'").bind(invite.invite_id).run();return respond({error:'La invitación expiró.'},410)}
 if(invite.ally_id){const ally=await env.DB.prepare('SELECT id,is_synthetic,status FROM aliados WHERE id=?').bind(invite.ally_id).first();if(!ally||ally.is_synthetic||['RECHAZADO','SUSPENDIDO'].includes(ally.status))return respond({error:'La organización invitada no está disponible.'},403)}
 const memberId='MBR-'+crypto.randomUUID().slice(0,12).toUpperCase(),sessionToken=crypto.randomUUID()+'-'+crypto.randomUUID(),sessionHash=await hash(sessionToken),sessionExpiresAt=new Date(Date.now()+WATERNET_SESSION_SECONDS*1000).toISOString(),email=String(invite.access_email).toLowerCase(),results=await env.DB.batch([
  env.DB.prepare(`INSERT INTO beehive_memberships(member_id,access_email,display_name,organization,role,ally_id,status,activated_at) SELECT ?,lower(access_email),display_name,organization,role,ally_id,'ACTIVE',? FROM beehive_invites WHERE invite_id=? AND token_hash=? AND status='READY' AND expires_at>? ON CONFLICT(access_email) DO UPDATE SET display_name=excluded.display_name,organization=excluded.organization,role=excluded.role,ally_id=excluded.ally_id,status='ACTIVE',activated_at=excluded.activated_at,revoked_at=NULL,updated_at=CURRENT_TIMESTAMP`).bind(memberId,now,invite.invite_id,tokenHash,now),
  env.DB.prepare("UPDATE beehive_invites SET status='USED',used_at=? WHERE invite_id=? AND token_hash=? AND status='READY' AND expires_at>?").bind(now,invite.invite_id,tokenHash,now)
 ]);if(!results[1]?.meta?.changes)return respond({error:'La invitación ya fue usada o expiró.'},403);
 const member=await env.DB.prepare('SELECT member_id,access_email,display_name,organization,role,ally_id,status FROM beehive_memberships WHERE lower(access_email)=? AND status=\'ACTIVE\'').bind(email).first();if(!member)return respond({error:'No se pudo activar la membresía de la invitación.'},503);
 await env.DB.prepare('INSERT INTO beehive_portal_sessions(session_hash,member_id,expires_at) VALUES(?,?,?)').bind(sessionHash,member.member_id,sessionExpiresAt).run();await env.DB.prepare('INSERT INTO beehive_events(event_id,member_id,ally_id,actor,event_type,detail_json) VALUES(?,?,?,?,?,?)').bind(crypto.randomUUID(),member.member_id,invite.ally_id,email,'membership_activated',JSON.stringify({inviteId:invite.invite_id})).run();
 const response=respond({ok:true,member,sessionExpiresAt,externalActions:false}),headers=new Headers(response.headers);headers.append('Set-Cookie',`WATERNET_SESSION=${encodeURIComponent(sessionToken)}; Path=/api/waternet/; Max-Age=${WATERNET_SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`);return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
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
async function mpWebhook(request,env){if(!env.DB)return respond({error:'D1 no configurada'},503);const url=new URL(request.url),id=url.searchParams.get('data.id')||url.searchParams.get('id')||'',header=request.headers.get('x-signature')||'',rid=request.headers.get('x-request-id')||'';const parts=Object.fromEntries(header.split(',').map(s=>s.trim().split('=')));const ts=parts.ts||'';
 if(!/^\d{1,30}$/.test(id)||!rid||!ts||!parts.v1)return respond({error:'Notificación inválida'},403);const millis=Number(ts)<1e11?Number(ts)*1000:Number(ts);if(Math.abs(Date.now()-millis)>300000)return respond({error:'Tiempo inválido'},403);
 if(!env.MP_WEBHOOK_SECRET)return respond({error:'Firma inválida'},403);const check=await hmacHex(env.MP_WEBHOOK_SECRET,`id:${id.toLowerCase()};request-id:${rid};ts:${ts};`);if(!safeSame(check,parts.v1.toLowerCase()))return respond({error:'Firma inválida'},403);if(!env.MP_ACCESS_TOKEN)return respond({error:'No configurado'},503);
 const r=await fetch('https://api.mercadopago.com/v1/payments/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN}});if(!r.ok)return respond({error:'No se pudo confirmar con pasarela'},502);const p=await r.json();if(p.status==='approved'){let productSettlementFailed=false;try{await settleProductPedido(env,p)}catch(_){productSettlementFailed=true}const ref=norm(p.external_reference,90);const pay=await env.DB.prepare('SELECT id,expected_cents,state FROM payment_attempts WHERE id=? AND provider=?').bind(ref,'mercadopago').first();if(pay&&pay.expected_cents===Math.round(Number(p.transaction_amount)*100)&&p.currency_id==='MXN'&&['created','redirected'].includes(pay.state)){const cas=await env.DB.prepare("UPDATE payment_attempts SET state='paid',provider_payment_id=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state IN ('created','redirected')").bind(id,ref).run();if(cas.meta?.changes){await adminEvent(env.DB,'','mp-paid:'+ref);await paidOutbox(env,ref)}}if(productSettlementFailed)return respond({error:'El pedido de producto requiere reintento de conciliación.'},503)}return respond({received:true})}

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
const PLUVIAM3_HOME = `<style>
#pluviam3-escalera .pl3-card{position:relative;overflow:hidden;min-height:245px;background-color:#0d3033;background-size:cover;background-position:center;color:#fff}
#pluviam3-escalera .pl3-card:before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,24,31,.12),rgba(5,24,31,.94) 86%);z-index:0}
#pluviam3-escalera .pl3-card>*{position:relative;z-index:1}
#pluviam3-escalera .pl3-card:nth-child(1){background-image:url('/store/assets/under-sink.webp')}
#pluviam3-escalera .pl3-card:nth-child(2){background-image:url('/store/assets/cartridge.webp')}
#pluviam3-escalera .pl3-card:nth-child(3){background-image:url('/store/assets/rain-home.webp')}
#pluviam3-escalera .pl3-card:nth-child(4){background-image:url('/store/assets/hero-editorial.webp')}
#pluviam3-escalera .pl3-card:nth-child(5){background-image:url('/store/assets/tank.webp')}
#pluviam3-escalera .pl3-card:nth-child(6){background-image:url('/store/assets/pump.webp')}
.pluviam3-network{background:linear-gradient(135deg,#071c29,#0c3037)!important}
.pluviam3-network-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:25px}
.pluviam3-network-card{display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(120,226,213,.25);border-radius:18px;background:linear-gradient(180deg,rgba(15,59,70,.92),rgba(7,31,43,.96));box-shadow:0 16px 40px rgba(0,0,0,.18)}
.pluviam3-network-image{display:grid;place-items:center;min-height:126px;padding:23px;background:radial-gradient(circle at 50% 10%,rgba(171,255,235,.3),transparent 54%),#eaf6f2}
.pluviam3-network-image img{display:block;max-width:185px;width:78%;max-height:76px;object-fit:contain}
.pluviam3-network-card>div:last-child{padding:20px;display:flex;flex:1;flex-direction:column}.pluviam3-network-card h3{font-size:22px;margin:8px 0 5px;color:#f1fffb}.pluviam3-network-card p{color:#b9d9d5;line-height:1.55;margin:0 0 16px}.pluviam3-network-card a{margin-top:auto;color:#8ff3da;font-weight:800;text-decoration:underline;text-underline-offset:4px}.pluviam3-network-card .ally-status{color:#83e8d2;font-size:10px;font-weight:800;letter-spacing:.1em}
.pluviam3-audiences{padding:clamp(34px,5vw,72px) 18px;background:#071624;color:#edfafa;border-top:1px solid rgba(127,214,212,.18)}.pluviam3-audiences>div{max-width:1180px;margin:0 auto}.pluviam3-audiences h2{font:600 clamp(31px,4.3vw,58px)/1.08 system-ui;margin:12px 0;color:#fff;letter-spacing:-.05em}.pluviam3-audiences h2 em{font-weight:350;color:#87e8dc}.pluviam3-audiences p{color:#b9d4d3;max-width:700px;line-height:1.6}.audience-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:27px}.audience-grid a{display:flex;flex-direction:column;gap:8px;min-height:142px;padding:18px;border:1px solid rgba(91,177,178,.3);border-radius:15px;background:linear-gradient(145deg,#0d303b,#0a2431);color:inherit;text-decoration:none;transition:transform .2s,border-color .2s}.audience-grid a:hover,.audience-grid a:focus-visible{transform:translateY(-3px);border-color:#89efe1}.audience-grid i{font-style:normal;color:#84efdf;font-size:24px}.audience-grid strong{font-size:16px}.audience-grid span{color:#a9c8ca;font-size:12px;line-height:1.45}.pluviam3-network+.pluviam3-audiences{margin-top:0}
@media(max-width:820px){.pluviam3-network-grid{grid-template-columns:1fr}.audience-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:500px){.audience-grid{grid-template-columns:1fr}.pluviam3-network-image{min-height:110px}}
</style><section class="network-section pluviam3-network" id="red-especialistas" aria-labelledby="network-title">
  <div class="network-heading"><span class="eyebrow blue">PLUVIAM / RED DE ESPECIALISTAS</span><h2 id="network-title">Una red para que cada solución <em>llegue más lejos.</em></h2><p>Conoce las capacidades que PLUVIAM coordina para proyectos residenciales, profesionales y de infraestructura.</p></div>
  <div class="pluviam3-network-grid">
    <article class="pluviam3-network-card"><div class="pluviam3-network-image"><img src="/ally-isla-urbana.svg" alt="Isla Urbana"></div><div><span class="ally-status">TECNOLOGÍA DE CAPTACIÓN</span><h3>Isla Urbana</h3><p>Soluciones de captación y cultura del agua para proyectos urbanos.</p><a href="/colaborar/">Conocer la red ↗</a></div></article>
    <article class="pluviam3-network-card"><div class="pluviam3-network-image"><img src="/ally-raincolecta.svg" alt="Rain Colecta"></div><div><span class="ally-status">ESPECIALISTA TÉCNICO</span><h3>Fernando / Rain Colecta</h3><p>Diagnóstico, cobertura e instalación para soluciones residenciales y comerciales.</p><a href="/colaborar/">Conocer la red ↗</a></div></article>
    <article class="pluviam3-network-card"><div class="pluviam3-network-image"><img src="/ally-345-ingenieria.svg" alt="345 Ingeniería"></div><div><span class="ally-status">INGENIERÍA E INSTALACIÓN</span><h3>345 Ingeniería</h3><p>Ingeniería de campo y coordinación de instalaciones por proyecto.</p><a href="/colaborar/">Conocer la red ↗</a></div></article>
  </div>
</section>
<section class="pluviam3-audiences" aria-labelledby="audience-title"><div><span class="eyebrow blue">PLUVIAM 3.0 / ENTRADAS</span><h2 id="audience-title">La misma infraestructura para <em>cuatro formas de participar.</em></h2><p>Elige el camino que corresponde a tu propiedad, operación o especialidad.</p></div><div class="audience-grid"><a href="#experience"><i aria-hidden="true">⌂</i><strong>Hogar</strong><span>Diagnóstico, soluciones y reserva hídrica.</span></a><a href="/industrial/"><i aria-hidden="true">◒</i><strong>PyME / Industrial</strong><span>Diseño por inmueble y operación continua.</span></a><a href="/colaborar/"><i aria-hidden="true">⌘</i><strong>Arquitectos / Profesionales</strong><span>Diseño, referencias y coordinación técnica.</span></a><a href="/hi-care/"><i aria-hidden="true">✦</i><strong>HI Care / Property OS</strong><span>Equipos, documentos, incidencias y mantenimiento.</span></a></div></section>`;
// The wrapper below injects the shared Avianny UI, network cards and audience entry points while preserving the asset binding.
function htmlEsc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function htmlResponse(body,status=200){return new Response(body,{status,headers:{'Content-Type':'text/html; charset=UTF-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'}})}
const PLUVIAM_COMMERCE_STYLE=`<style>
.plv-page{max-width:1180px;min-height:62vh;margin:0 auto;padding:clamp(38px,7vw,92px) clamp(18px,4vw,48px);position:relative;z-index:1}
.plv-page h1{font-size:clamp(42px,7vw,76px);line-height:1.02;letter-spacing:-.045em;margin:10px 0 18px;max-width:900px}
.plv-page h2{font-size:clamp(25px,4vw,40px);line-height:1.12;letter-spacing:-.025em}
.plv-kicker{color:#69e0d2;font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}
.plv-lead{color:#bed0d7;max-width:740px;font-size:17px}
.plv-panel{border:1px solid rgba(150,203,223,.2);border-radius:20px;background:rgba(9,31,44,.78);padding:clamp(20px,3vw,34px);box-shadow:0 18px 52px rgba(0,0,0,.2)}
.plv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:16px;margin:26px 0}
.plv-card{display:flex;flex-direction:column;gap:12px;min-height:230px;padding:23px;border:1px solid rgba(150,203,223,.2);border-radius:18px;background:linear-gradient(155deg,rgba(15,59,70,.86),rgba(7,31,43,.96))}
.plv-card h2,.plv-card h3{margin:0}.plv-card p{color:#bed0d7;margin:0}.plv-price{font-size:20px;font-weight:800;margin-top:auto}
.plv-badge{display:inline-flex;width:max-content;padding:6px 10px;border-radius:99px;background:rgba(105,224,210,.12);color:#8be9dc;font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.plv-button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border:1px solid rgba(105,224,210,.55);border-radius:12px;background:#117c90;color:#fff;font-weight:800;cursor:pointer}
.plv-button:hover{filter:brightness(1.1)}.plv-link{color:#8be9dc;text-decoration:underline;text-underline-offset:3px}
.plv-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.plv-form label{display:grid;gap:7px;color:#d9e8ec;font-weight:700}.plv-form input,.plv-form select,.plv-form textarea{width:100%;min-height:48px;padding:12px;border:1px solid rgba(150,203,223,.28);border-radius:10px;background:#071824;color:#effbff}.plv-form textarea{min-height:120px;resize:vertical}.plv-form .wide{grid-column:1/-1}.plv-form-actions{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:12px}
.plv-message{padding:18px;border:1px solid rgba(105,224,210,.25);border-radius:14px;background:rgba(17,124,144,.12);color:#eafafa}.plv-error{border-color:rgba(255,160,145,.5);color:#ffd3c8}.plv-table-wrap{overflow:auto}.plv-table{width:100%;border-collapse:collapse;text-align:left}.plv-table th,.plv-table td{padding:12px;border-bottom:1px solid rgba(150,203,223,.16);vertical-align:top}.plv-table th{color:#8be9dc;font-size:11px;letter-spacing:.08em;text-transform:uppercase}.plv-muted{color:#a0b7c0;font-size:13px}
@media(max-width:640px){.plv-form{grid-template-columns:1fr}.plv-form .wide,.plv-form-actions{grid-column:1}.plv-page{padding-top:36px}.plv-table{min-width:760px}}
@media(prefers-reduced-motion:reduce){.plv-button{transition:none}}
</style>`;
async function sharedPage(request,env,title,description,main,status=200){
 if(!env.ASSETS)return htmlResponse('<main><h1>Página no disponible</h1></main>',503);
 const source=await env.ASSETS.fetch(new Request(new URL('/index.html',request.url),{method:'GET',headers:{Accept:'text/html'}}));if(!source.ok)return htmlResponse('<main><h1>Página no disponible</h1></main>',503);
 let html=await source.text(),pattern=/<main\b[^>]*>[\s\S]*?<\/main>/i;if(!pattern.test(html))return htmlResponse('<main><h1>Plantilla no disponible</h1></main>',503);
 html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+htmlEsc(title)+'</title>');
 html=html.replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\/?>/i,'<meta name="description" content="'+htmlEsc(description)+'"/>');
 html=html.replace('</head>',PLUVIAM_COMMERCE_STYLE+'</head>');
 html=html.replace(pattern,()=>'<main id="main" class="plv-page">'+main+'</main>');
 return htmlResponse(html,status)
}
function referralCodeFor(oficio){const prefix=oficio.slice(0,3).toUpperCase(),n=crypto.getRandomValues(new Uint32Array(1))[0]%10000;return 'PLV-'+prefix+'-'+String(n).padStart(4,'0')}
function randomReferralFolio(){const n=crypto.getRandomValues(new Uint32Array(1))[0]%10000;return 'REF-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+String(n).padStart(4,'0')}
function formatCents(cents,currency='MXN'){try{return new Intl.NumberFormat('es-MX',{style:'currency',currency}).format(Number(cents)/100)}catch{return (Number(cents)/100).toFixed(2)+' '+currency}}
async function tiendaApi(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);if(!env.DB)return respond({error:'D1 no configurada'},503);try{const rows=await env.DB.prepare('SELECT id,nombre,descripcion,precio_cents,moneda,tipo FROM productos WHERE activo=1 ORDER BY nombre').all();const productos=(rows.results||[]).map(p=>({...p,activo:1,precio_formateado:formatCents(p.precio_cents,p.moneda),precio:formatCents(p.precio_cents,p.moneda)}));return respond({productos,pagos_habilitados:env.PAYMENTS_ENABLED==='true'})}catch(_){return respond({error:'Catálogo no disponible'},503)}}
async function tiendaPage(request,env){
 const main=`<div class="plv-kicker">PLUVIAM · Catálogo</div><h1>Soluciones para gestionar el agua.</h1><p class="plv-lead">Consulta el catálogo aprobado por PLUVIAM. Los precios y la disponibilidad se cargan desde el catálogo vigente.</p><div id="catalog-message" class="plv-message">Catálogo en preparación. Escríbenos por <a class="plv-link" href="https://wa.me/?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20PLUVIAM" rel="noopener" target="_blank">WhatsApp</a>.</div><div id="catalog-products" class="plv-grid" aria-live="polite"></div><section class="plv-panel" aria-labelledby="checkout-title"><h2 id="checkout-title">Datos para iniciar una compra</h2><p class="plv-muted">Para comprar se requiere un expediente autenticado o autorización administrativa. Los productos con pago pendiente de configuración se muestran sin botón de compra.</p><div class="plv-form"><label>Correo electrónico<input id="buyer-email" type="email" autocomplete="email" maxlength="180" required></label><label>Teléfono (opcional)<input id="buyer-phone" type="tel" autocomplete="tel" maxlength="30"></label><label>Folio del expediente (si aplica)<input id="buyer-folio" maxlength="70"></label><label>Clave del expediente (si aplica)<input id="buyer-token" type="password" maxlength="200"></label><div id="checkout-message" class="plv-form-actions plv-muted" role="status"></div></div></section><script>(()=>{const grid=document.getElementById('catalog-products'),message=document.getElementById('catalog-message'),checkoutMessage=document.getElementById('checkout-message');const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));async function load(){try{const response=await fetch('/api/tienda',{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo cargar el catálogo.');const items=Array.isArray(data.productos)?data.productos:[];if(!items.length){message.hidden=false;return}message.hidden=true;grid.innerHTML=items.map(item=>{const active=Number(item.activo)===1;const purchase=active&&data.pagos_habilitados===true&&item.tipo==='diagnostico';const action=!active?'<span class="plv-badge">Próximamente</span>':item.tipo==='diagnostico'&&!data.pagos_habilitados?'<span class="plv-badge">Pago pendiente de configuración</span>':purchase?'<button class="plv-button" type="button" data-buy="'+esc(item.id)+'">Comprar</button>':'<a class="plv-button" href="/cotizacion.html?producto='+encodeURIComponent(item.id)+'">Solicitar cotización</a>';return '<article class="plv-card"><span class="plv-badge">'+esc(item.tipo)+'</span><h2>'+esc(item.nombre)+'</h2><p>'+esc(item.descripcion||'')+'</p><div class="plv-price">'+esc(item.precio_formateado||item.precio||'')+'</div>'+action+'</article>'}).join('')}catch(error){message.hidden=false;message.textContent=error.message||'Catálogo en preparación. Escríbenos por WhatsApp.'}}grid.addEventListener('click',async event=>{const button=event.target.closest('[data-buy]');if(!button)return;const email=document.getElementById('buyer-email').value.trim();if(!email){checkoutMessage.textContent='Ingresa tu correo para continuar.';return}button.disabled=true;checkoutMessage.textContent='Iniciando solicitud...';try{const response=await fetch('/api/pagos/crear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({producto_id:button.dataset.buy,cliente_email:email,cliente_telefono:document.getElementById('buyer-phone').value.trim(),referido_id:new URLSearchParams(location.search).get('ref')||undefined,folio:document.getElementById('buyer-folio').value.trim(),token:document.getElementById('buyer-token').value})});const data=await response.json();if(response.ok&&data.init_point){location.assign(data.init_point);return}checkoutMessage.textContent=data.error||'No fue posible iniciar el pago.'}catch(_){checkoutMessage.textContent='No fue posible conectar con el servicio de pagos.'}finally{button.disabled=false}});load()})();</script>`;
 return await sharedPage(request,env,'Tienda PLUVIAM','Catálogo de soluciones hídricas PLUVIAM.',main)
}
async function allyRegistrationPage(request,env){
 const main=`<div class="plv-kicker">Red PLUVIAM</div><h1>Registra tu perfil de aliado.</h1><p class="plv-lead">Comparte tus datos profesionales y zona de atención. La incorporación queda pendiente de validación.</p><section class="plv-panel"><form id="ally-registration-form" class="plv-form"><label>Nombre completo<input name="nombre" autocomplete="name" minlength="2" maxlength="120" required></label><label>Teléfono<input name="telefono" type="tel" autocomplete="tel" minlength="7" maxlength="30" required></label><label>Correo electrónico<input name="email" type="email" autocomplete="email" maxlength="180" required></label><label>Oficio<select name="oficio" required><option value="">Selecciona un oficio</option><option value="plomero">Plomero</option><option value="electricista">Electricista</option><option value="tecnico">Técnico</option></select></label><label class="wide">Zona de atención<input name="zona" autocomplete="address-level2" minlength="2" maxlength="80" required></label><div class="plv-form-actions"><button class="plv-button" type="submit">Enviar registro</button><span class="plv-muted">Consulta el <a class="plv-link" href="/privacidad.html">aviso de privacidad</a>.</span></div></form><div id="ally-registration-result" class="plv-message" role="status" hidden></div></section><script>(()=>{const form=document.getElementById('ally-registration-form'),result=document.getElementById('ally-registration-result'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));form.addEventListener('submit',async event=>{event.preventDefault();result.hidden=false;result.textContent='Enviando...';const body=Object.fromEntries(new FormData(form).entries());try{const response=await fetch('/api/aliados/registro',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo completar el registro.');const share='https://wa.me/?text='+encodeURIComponent('Te invito a compartir un proyecto con PLUVIAM. Usa mi código '+data.referral_code+': '+location.origin+'/referir?code='+data.referral_code);result.innerHTML='<strong>Tu código de referido</strong><div style="font-size:clamp(26px,5vw,40px);font-weight:900;margin:10px 0">'+esc(data.referral_code)+'</div><p>Tu registro quedó pendiente de validación.</p><a class="plv-button" rel="noopener" target="_blank" href="'+share+'">Compartir por WhatsApp</a>';form.reset()}catch(error){result.classList.add('plv-error');result.textContent=error.message||'No se pudo completar el registro.'}})})();</script>`;
 return await sharedPage(request,env,'Registro de aliados PLUVIAM','Registro público de aliados PLUVIAM.',main)
}
async function referralPage(request,env){
 const url=new URL(request.url),code=norm(url.searchParams.get('code'),50);if(!env.DB)return await sharedPage(request,env,'Referir un proyecto · PLUVIAM','Formulario de referido PLUVIAM.','<div class="plv-message">Servicio temporalmente no disponible.</div>',503);
 if(!code)return await sharedPage(request,env,'Código de referido no válido · PLUVIAM','El código de referido no es válido.','<div class="plv-message plv-error"><h1>Enlace no disponible</h1><p>Verifica el enlace con la persona que te lo compartió.</p></div>',404);
 const ally=await env.DB.prepare('SELECT id,full_name FROM aliados WHERE referral_code=?').bind(code).first();if(!ally)return await sharedPage(request,env,'Código de referido no válido · PLUVIAM','El código de referido no es válido.','<div class="plv-message plv-error"><h1>Enlace no disponible</h1><p>Verifica el enlace con la persona que te lo compartió.</p></div>',404);
 const main=`<div class="plv-kicker">Conexión PLUVIAM</div><h1>Cuéntanos sobre tu proyecto.</h1><p class="plv-lead">Referido por: <strong>${htmlEsc(ally.full_name)}</strong></p><section class="plv-panel"><form id="referral-form" class="plv-form" data-code="${htmlEsc(code)}"><label>Nombre del cliente<input name="cliente_nombre" autocomplete="name" minlength="2" maxlength="120" required></label><label>Teléfono<input name="cliente_telefono" type="tel" autocomplete="tel" minlength="7" maxlength="30" required></label><label class="wide">Necesidad<textarea name="necesidad" minlength="3" maxlength="1000" required></textarea></label><label class="wide">Zona (opcional)<input name="zona" maxlength="100"></label><div class="plv-form-actions"><button class="plv-button" type="submit">Enviar referido</button></div></form><div id="referral-result" class="plv-message" role="status" hidden></div></section><script>(()=>{const form=document.getElementById('referral-form'),result=document.getElementById('referral-result'),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));form.addEventListener('submit',async event=>{event.preventDefault();result.hidden=false;result.textContent='Enviando...';const body=Object.fromEntries(new FormData(form).entries());body.referral_code=form.dataset.code;try{const response=await fetch('/api/referidos/crear',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await response.json();if(!response.ok)throw new Error(data.error||'No se pudo registrar el referido.');result.innerHTML='<strong>Folio: '+esc(data.folio)+'</strong><p>Te contactamos en menos de 24h.</p><a class="plv-link" href="/tienda?ref='+encodeURIComponent(data.id)+'">Ver soluciones PLUVIAM</a>';form.reset()}catch(error){result.classList.add('plv-error');result.textContent=error.message||'No se pudo registrar el referido.'}})})();</script>`;
 return await sharedPage(request,env,'Referir un proyecto · PLUVIAM','Formulario para registrar un referido PLUVIAM.',main)
}
const REFERRAL_ROWS_SQL=`SELECT r.id,r.folio,r.aliado_id,r.cliente_nombre,r.cliente_telefono,r.necesidad,r.zona,r.estado,r.pedido_id,r.comision_monto_cents,r.created_at,r.cerrado_at,a.full_name AS aliado_nombre,a.referral_code,p.estado AS pedido_estado,p.monto_cents,c.monto_cents AS comision_cents,c.estado AS comision_estado FROM referidos r LEFT JOIN aliados a ON a.id=r.aliado_id LEFT JOIN pedidos p ON p.id=r.pedido_id LEFT JOIN comisiones c ON c.pedido_id=p.id ORDER BY r.created_at DESC LIMIT 200`;
async function adminReferralRows(env){const result=await env.DB.prepare(REFERRAL_ROWS_SQL).all();return result.results||[]}
async function adminReferralsApi(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);if(!admin(request,env))return respond({error:'No autorizado'},401);if(!env.DB)return respond({error:'D1 no configurada'},503);try{return respond({referidos:await adminReferralRows(env)})}catch(_){return respond({error:'No se pudo consultar la trazabilidad de referidos'},503)}}
async function adminReferralPage(request,env){if(request.method!=='GET')return htmlResponse('Método no permitido',405);if(!admin(request,env))return htmlResponse('No autorizado',401);if(!env.DB)return htmlResponse('D1 no configurada',503);try{const rows=await adminReferralRows(env),table=rows.map(r=>'<tr><td>'+htmlEsc(r.folio)+'</td><td>'+htmlEsc(r.aliado_nombre||'—')+'</td><td>'+htmlEsc(r.cliente_nombre)+'</td><td>'+htmlEsc(r.necesidad)+'</td><td>'+htmlEsc(r.estado)+'</td><td>'+htmlEsc(r.comision_estado||'—')+'</td><td>'+htmlEsc(r.comision_cents==null?'—':formatCents(r.comision_cents))+'</td></tr>').join('');const main='<div class="plv-kicker">Administración PLUVIAM</div><h1>Referidos</h1><p class="plv-lead">Trazabilidad de aliados, clientes, pedidos y comisiones.</p><section class="plv-panel plv-table-wrap"><table class="plv-table"><thead><tr><th>Folio</th><th>Aliado</th><th>Cliente</th><th>Necesidad</th><th>Estado</th><th>Comisión</th><th>Monto</th></tr></thead><tbody>'+(table||'<tr><td colspan="7">Sin referidos registrados.</td></tr>')+'</tbody></table></section>';return await sharedPage(request,env,'Referidos · Administración PLUVIAM','Panel administrativo de referidos PLUVIAM.',main)}catch(_){return htmlResponse('No se pudo consultar la trazabilidad de referidos.',503)}}
async function allyRegistrationApi(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB)return respond({error:'D1 no configurada'},503);if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const nombre=norm(d.nombre,120),telefono=norm(d.telefono,30),email=norm(d.email,180).toLowerCase(),oficio=norm(d.oficio,20).toLowerCase(),zona=norm(d.zona,80);if(nombre.length<2||telefono.replace(/\D/g,'').length<7||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!['plomero','electricista','tecnico'].includes(oficio)||zona.length<2)return respond({error:'Completa nombre, teléfono, correo, oficio y zona válidos.'},422);const duplicate=await env.DB.prepare('SELECT id FROM aliados WHERE email_normalized=?').bind(email).first();if(duplicate)return respond({error:'Ya existe un perfil de aliado con ese correo.'},409);const id=crypto.randomUUID(),clientRequestId=crypto.randomUUID(),now=new Date().toISOString(),services=JSON.stringify([oficio]),coverage=JSON.stringify({zona});for(let attempt=0;attempt<10;attempt++){const referralCode=referralCodeFor(oficio);if(await env.DB.prepare('SELECT id FROM aliados WHERE referral_code=?').bind(referralCode).first())continue;try{await env.DB.prepare("INSERT INTO aliados(id,client_request_id,full_name,email_normalized,phone,city,role,services_json,coverage_json,capacity_month,availability,status,logo_permission_interest,created_at,updated_at,is_synthetic,referral_opt_in,referral_code) VALUES(?,?,?,?,?,?,'REFERIDOR',?,?,0,'mes','EN_REVISION',0,?,?,0,1,?)").bind(id,clientRequestId,nombre,email,telefono,zona,services,coverage,now,now,referralCode).run();return respond({id,referral_code:referralCode,status:'EN_REVISION'},201)}catch(error){const message=String(error?.message||error);if(/UNIQUE constraint failed: aliados\.email_normalized/i.test(message))return respond({error:'Ya existe un perfil de aliado con ese correo.'},409);if(/referral_code/i.test(message))continue;throw error}}return respond({error:'No se pudo generar un código único. Inténtalo de nuevo.'},503)}
async function referralCreateApi(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB)return respond({error:'D1 no configurada'},503);let d;try{d=await bodyJson(request,4000)}catch{return respond({error:'Solicitud inválida'},400)}const code=norm(d.referral_code,50).toUpperCase(),name=norm(d.cliente_nombre,120),phone=norm(d.cliente_telefono,30),need=norm(d.necesidad,1000),zone=norm(d.zona,100);if(!code||name.length<2||phone.replace(/\D/g,'').length<7||need.length<3)return respond({error:'Completa nombre, teléfono y necesidad válidos.'},422);const ally=await env.DB.prepare('SELECT id,full_name FROM aliados WHERE referral_code=?').bind(code).first();if(!ally)return respond({error:'Código de referido no encontrado.'},404);for(let attempt=0;attempt<10;attempt++){const id=crypto.randomUUID(),folio=randomReferralFolio();try{await env.DB.prepare("INSERT INTO referidos(id,folio,aliado_id,cliente_nombre,cliente_telefono,necesidad,zona,estado) VALUES(?,?,?,?,?,?,?,'recibido')").bind(id,folio,ally.id,name,phone,need,zone).run();return respond({id,folio,aliado_nombre:ally.full_name},201)}catch(error){const message=String(error?.message||error);if(/UNIQUE constraint failed: referidos\.folio/i.test(message))continue;throw error}}return respond({error:'No se pudo generar un folio único. Inténtalo de nuevo.'},503)}
async function productOrderApi(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(env.PAYMENTS_ENABLED!=='true')return respond({error:'Los pagos de producto no están habilitados.'},503);let d;try{d=await bodyJson(request,4000)}catch{return respond({error:'Solicitud inválida'},400)}if(!env.DB)return respond({error:'D1 no configurada'},503);if(!env.MP_ACCESS_TOKEN||!env.MP_WEBHOOK_SECRET)return respond({error:'Mercado Pago no configurado: faltan MP_ACCESS_TOKEN o MP_WEBHOOK_SECRET.'},500);const email=norm(d.cliente_email,180).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return respond({error:'Correo electrónico inválido.'},422);const token=request.headers.get('X-Admin-Token')||'',adminHeader=env.ADMIN_TOKEN&&safeSame(token,env.ADMIN_TOKEN);let clientAuthorized=false;if(!admin(request,env)&&!adminHeader){const folio=norm(d.folio,70),accessToken=norm(d.token,200),person=await identity(env.DB,folio,accessToken);if(person){const customer=await env.DB.prepare('SELECT email FROM lead_cases WHERE folio=?').bind(folio).first();clientAuthorized=!!customer&&String(customer.email||'').toLowerCase()===email}}if(!admin(request,env)&&!adminHeader&&!clientAuthorized)return respond({error:'Autenticación administrativa o de cliente requerida.'},401);const productId=norm(d.producto_id,80);if(!productId)return respond({error:'Producto inválido.'},422);const product=await env.DB.prepare('SELECT id,nombre,precio_cents,moneda FROM productos WHERE id=? AND activo=1').bind(productId).first();if(!product)return respond({error:'Producto no encontrado o inactivo.'},404);if(!Number.isInteger(product.precio_cents)||product.precio_cents<=0)return respond({error:'El precio del producto aún no está aprobado.'},409);const currency=norm(product.moneda,3).toUpperCase();if(!/^[A-Z]{3}$/.test(currency))return respond({error:'Moneda del producto inválida.'},409);const referidoId=norm(d.referido_id,80);let allyId=null;if(referidoId){const referral=await env.DB.prepare('SELECT id,aliado_id FROM referidos WHERE id=?').bind(referidoId).first();if(!referral)return respond({error:'Referido no encontrado.'},404);allyId=referral.aliado_id}const orderId=crypto.randomUUID(),phone=norm(d.cliente_telefono,30)||null;try{await env.DB.prepare("INSERT INTO pedidos(id,producto_id,monto_cents,moneda,estado,cliente_email,cliente_telefono,gateway,referido_id,aliado_id) VALUES(?,?,?,?,'pendiente',?,?,'mercadopago',?,?)").bind(orderId,product.id,product.precio_cents,currency,email,phone,referidoId||null,allyId).run()}catch(_){return respond({error:'No se pudo crear el pedido.'},503)}const origin=new URL(request.url).origin,payload={items:[{title:product.nombre,quantity:1,unit_price:product.precio_cents/100,currency_id:currency}],payer:{email},external_reference:orderId,notification_url:origin+'/api/webhooks/mercadopago',back_urls:{success:origin+'/gracias',failure:origin+'/tienda',pending:origin+'/tienda'},auto_return:'approved'};let preference;try{const response=await fetch('https://api.mercadopago.com/checkout/preferences',{method:'POST',headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN,'Content-Type':'application/json','X-Idempotency-Key':orderId},body:JSON.stringify(payload),signal:AbortSignal.timeout(8000)});preference=await response.json();if(!response.ok||!preference.id||!preference.init_point)throw new Error('Preferencia rechazada por Mercado Pago')}catch(_){return respond({error:'No fue posible crear la preferencia Mercado Pago.',pedido_id:orderId},502)}try{await env.DB.prepare("UPDATE pedidos SET gateway_session_id=? WHERE id=? AND estado='pendiente'").bind(String(preference.id),orderId).run()}catch(_){return respond({error:'La preferencia se creó, pero no se pudo asociar al pedido.',pedido_id:orderId},503)}return respond({pedido_id:orderId,init_point:preference.init_point},201)}
async function settleProductPedido(env,payment){
 if(!env.DB||payment?.status!=='approved')return false;
 const orderId=norm(payment.external_reference,80);if(!orderId)return false;
 const order=await env.DB.prepare('SELECT id,monto_cents,moneda,estado,gateway,referido_id,aliado_id FROM pedidos WHERE id=?').bind(orderId).first();
 if(!order||order.gateway!=='mercadopago'||!['pendiente','pagado'].includes(order.estado))return false;
 if(Math.round(Number(payment.transaction_amount)*100)!==order.monto_cents||payment.currency_id!==order.moneda)return false;
 let allyId=order.aliado_id,commissionCents=0,referral=null;
 if(order.referido_id){
  referral=await env.DB.prepare('SELECT id,aliado_id FROM referidos WHERE id=?').bind(order.referido_id).first();
  if(!referral)throw new Error('Pedido referido sin referido asociado');
  allyId=allyId||referral.aliado_id;
  if(allyId){
   const ally=await env.DB.prepare('SELECT commission_rate_bps FROM aliados WHERE id=?').bind(allyId).first();
   const rate=Number(ally?.commission_rate_bps);
   if(!ally||!Number.isInteger(rate)||rate<0||rate>10000)throw new Error('commission_rate_bps inválido');
   commissionCents=Math.round(order.monto_cents*rate/10000);
   const prior=await env.DB.prepare('SELECT aliado_id,referido_id,monto_cents FROM comisiones WHERE pedido_id=?').bind(order.id).first();
   if(prior&&(prior.aliado_id!==allyId||prior.referido_id!==order.referido_id||prior.monto_cents!==commissionCents))throw new Error('Comisión existente no coincide con el pedido');
  }
 }
 const statements=[env.DB.prepare("UPDATE pedidos SET estado='pagado',pagado_at=COALESCE(pagado_at,CURRENT_TIMESTAMP),aliado_id=COALESCE(aliado_id,?) WHERE id=? AND estado IN ('pendiente','pagado')").bind(allyId,order.id)];
 if(referral&&allyId)statements.push(env.DB.prepare("INSERT INTO comisiones(id,aliado_id,referido_id,pedido_id,monto_cents,moneda,estado,liberada_at) SELECT ?,?,?,?,?,?,'liberada',CURRENT_TIMESTAMP WHERE EXISTS(SELECT 1 FROM pedidos WHERE id=? AND estado='pagado') ON CONFLICT(pedido_id) DO NOTHING").bind(crypto.randomUUID(),allyId,order.referido_id,order.id,commissionCents,order.moneda,order.id));
 if(referral)statements.push(env.DB.prepare("UPDATE referidos SET estado='cerrado',cerrado_at=COALESCE(cerrado_at,CURRENT_TIMESTAMP),pedido_id=?,comision_monto_cents=? WHERE id=? AND EXISTS(SELECT 1 FROM pedidos WHERE id=? AND estado='pagado')").bind(order.id,commissionCents,order.referido_id,order.id));
 await env.DB.batch(statements);
 if(referral)await ensurePostSaleSurvey(env,order.id);
 const current=await env.DB.prepare('SELECT estado FROM pedidos WHERE id=?').bind(order.id).first();return current?.estado==='pagado'
}
async function verifyProductPedido(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);if(!admin(request,env))return respond({error:'No autorizado'},401);if(!env.DB)return respond({error:'D1 no configurada'},503);if(!env.MP_ACCESS_TOKEN)return respond({error:'MP_ACCESS_TOKEN no configurado en Preview.'},503);const orderId=norm(new URL(request.url).searchParams.get('pedido_id'),80);if(!orderId)return respond({error:'pedido_id requerido.'},400);const order=await env.DB.prepare('SELECT id,estado,gateway,monto_cents,moneda FROM pedidos WHERE id=?').bind(orderId).first();if(!order)return respond({error:'Pedido no encontrado.'},404);if(order.gateway!=='mercadopago')return respond({error:'El pedido no pertenece a Mercado Pago.'},409);const searchUrl=new URL('https://api.mercadopago.com/v1/payments/search');searchUrl.searchParams.set('external_reference',order.id);searchUrl.searchParams.set('sort','date_created');searchUrl.searchParams.set('criteria','desc');searchUrl.searchParams.set('range','date_created');searchUrl.searchParams.set('begin_date','NOW-364DAYS');searchUrl.searchParams.set('end_date','NOW');searchUrl.searchParams.set('limit','10');searchUrl.searchParams.set('offset','0');let result;try{const response=await fetch(searchUrl,{headers:{Authorization:'Bearer '+env.MP_ACCESS_TOKEN,Accept:'application/json'},signal:AbortSignal.timeout(8000)});result=await response.json();if(!response.ok)throw new Error('Búsqueda Mercado Pago falló')}catch(_){return respond({error:'No se pudo verificar el pedido con Mercado Pago.'},502)}const payments=Array.isArray(result.results)?result.results.filter(p=>p.external_reference===order.id):[];if(!payments.length)return respond({pedido_id:order.id,estado:order.estado,found:false});const approved=payments.find(p=>p.status==='approved');if(approved){const settled=await settleProductPedido(env,approved);if(!settled)return respond({error:'El pago aprobado no coincide con el importe o estado del pedido.'},409)}const refreshed=await env.DB.prepare('SELECT id,estado,monto_cents,moneda,pagado_at FROM pedidos WHERE id=?').bind(order.id).first();return respond({pedido:refreshed,found:true,paymentStatus:approved?'approved':payments[0].status})}
const FOUNDER_OS_NEED_TERMS={
 hidraulica:['plom','hidraul','agua','lluvia','captaci','cisterna','bomba','sanitari','tuber','fuga','drenaje','riego'],
 wifi:['wifi','wi-fi','internet','red','router','conectividad','cableado']
};
function founderFold(value){return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function founderPhone(value){return String(value??'').replace(/\D/g,'').slice(0,15)}
function parseJsonValue(value){try{return JSON.parse(value)}catch{return value}}
function jsonStrings(value,out=[]){if(typeof value==='string'){out.push(value);return out}if(Array.isArray(value)){for(const item of value)jsonStrings(item,out);return out}if(value&&typeof value==='object'){for(const item of Object.values(value))jsonStrings(item,out)}return out}
function classifyIntake(text){const value=founderFold(text),hydraulic=FOUNDER_OS_NEED_TERMS.hidraulica.some(term=>value.includes(term)),wifi=FOUNDER_OS_NEED_TERMS.wifi.some(term=>value.includes(term));return hydraulic!==wifi?(hydraulic?'hidraulica':'wifi'):'otro'}
function extractIntakeName(suppliedValue,text){const supplied=norm(suppliedValue,120);if(supplied)return supplied;const match=String(text??'').match(/\b(?:soy|me llamo|mi nombre es)\s+([\p{L}][\p{L}\p{M}'-]*(?:\s+[\p{L}][\p{L}\p{M}'-]*){0,2})/iu);return match?norm(match[1],120):'No proporcionado'}
function extractIntakeZone(value){const match=String(value??'').match(/\b(?:zona|colonia|ubicaci[oó]n|c[oó]digo postal|cp)\s*[:\-]?\s*([^\n,;.!?]{2,80})/i);return match?norm(match[1],100):''}
function intakeUrgency(text){return /\b(urgente|emergencia|ahora|hoy|inundaci[oó]n|fuga activa)\b/i.test(String(text??''))?'urgente':'normal'}
function randomFolio(){return 'PLV-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()}
async function findAttributedAlly(db,phone,verifiedSender){if(!verifiedSender||!phone)return null;const rows=await db.prepare('SELECT id,phone FROM aliados WHERE referral_opt_in=1').all();const digits=founderPhone(phone);return (rows.results||[]).find(row=>founderPhone(row.phone)===digits)?.id||null}
async function createFounderIntakeRecord(db,input,{verifiedSender=false,sourceMessageId=null}={}){
 const canal=norm(input.canal,20).toLowerCase(),texto=norm(input.texto||input.transcripcion,1000),rawPhone=norm(input.remitente||input.telefono,30),digits=founderPhone(rawPhone);
 if(!['whatsapp','web','voz'].includes(canal)||texto.length<3)return {error:'Canal o mensaje inválido.',status:422};
 if(canal!=='voz'&&digits.length<7)return {error:'Se requiere un teléfono válido.',status:422};
 if(rawPhone&&digits.length>0&&digits.length<7&&canal!=='voz')return {error:'Se requiere un teléfono válido.',status:422};
 const phone=digits?('+'+digits):'',cliente=extractIntakeName(input.cliente||input.nombre,texto),zona=norm(input.zona,100)||extractIntakeZone(texto),categoria=classifyIntake(texto),urgencia=intakeUrgency(texto),allyId=await findAttributedAlly(db,phone,verifiedSender),id=crypto.randomUUID(),folio=randomFolio(),projectId=crypto.randomUUID(),sourceKey=sourceMessageId?canal+':'+norm(sourceMessageId,180):null;
 const statements=[
  db.prepare("INSERT INTO referidos(id,folio,aliado_id,cliente_nombre,cliente_telefono,necesidad,zona,estado) VALUES(?,?,?,?,?,?,?,'recibido')").bind(id,folio,allyId,cliente,phone,texto,zona),
  db.prepare('INSERT INTO referral_intake_metadata(referido_id,canal,categoria,urgencia,source_message_id,verified_sender) VALUES(?,?,?,?,?,?)').bind(id,canal,categoria,urgencia,sourceKey,verifiedSender?1:0),
  db.prepare("INSERT INTO referral_projects(id,referido_id,state) VALUES(?,?,'recibido')").bind(projectId,id)
 ];
 try{await db.batch(statements);return {id,folio,aliado_id:allyId,canal,categoria,urgencia,duplicate:false,status:201}}
 catch(error){if(sourceKey&&/UNIQUE constraint failed: referral_intake_metadata\.source_message_id/i.test(String(error?.message||error))){const prior=await db.prepare('SELECT r.id,r.folio,r.aliado_id,m.canal,m.categoria,m.urgencia FROM referral_intake_metadata m JOIN referidos r ON r.id=m.referido_id WHERE m.source_message_id=?').bind(sourceKey).first();if(prior)return {...prior,duplicate:true,status:200}}throw error}
}
async function intakeApi(request,env){
 if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB)return respond({error:'D1 no configurada'},503);if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);
 let d;try{d=await bodyJson(request,7000)}catch{return respond({error:'Solicitud inválida'},400)}const canal=norm(d.canal,20).toLowerCase();
 if(canal==='web'){if(!env.TURNSTILE_SECRET||!env.TURNSTILE_SITE_KEY)return respond({error:'La recepción web requiere Turnstile configurado.'},503);if(!(await validateTurnstile(request,env,norm(d.turnstile_token,300))))return respond({error:'No se pudo validar la comprobación anti-spam.'},403)}
 else{const supplied=request.headers.get('X-Intake-Token')||request.headers.get('Authorization')||'',candidate=supplied.startsWith('Bearer ')?supplied.slice(7):supplied;if(!env.INTAKE_API_TOKEN)return respond({error:'La integración de entrada no está configurada.'},503);if(!safeSame(candidate,env.INTAKE_API_TOKEN))return respond({error:'No autorizado'},401)}
 const result=await createFounderIntakeRecord(env.DB,{...d,canal},{verifiedSender:canal==='whatsapp',sourceMessageId:norm(d.source_message_id,180)});if(result.error)return respond({error:result.error},result.status);const {status,...payload}=result;return respond(payload,status)
}
async function verifyMetaRequest(request,env,verifyTokenName,appSecretName){
 const url=new URL(request.url);
 if(request.method==='GET'){
  const expected=env[verifyTokenName],mode=url.searchParams.get('hub.mode')||'',token=url.searchParams.get('hub.verify_token')||'',challenge=url.searchParams.get('hub.challenge')||'';
  if(!expected)return respond({error:'Token de verificación no configurado.'},503);if(mode!=='subscribe'||!safeSame(token,expected)||!challenge)return respond({error:'Verificación rechazada.'},403);return new Response(challenge,{status:200,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}})
 }
 if(request.method!=='POST')return respond({error:'Método no permitido'},405);
 const secret=env[appSecretName];if(!secret)return respond({error:'Firma de WhatsApp no configurada.'},503);const raw=await request.text();if(raw.length>100000)return respond({error:'Webhook demasiado grande.'},413);
 const signature=request.headers.get('x-hub-signature-256')||'',expected='sha256='+await hmacHex(secret,raw);if(!safeSame(signature,expected))return respond({error:'Firma de WhatsApp inválida.'},401);
 let payload;try{payload=JSON.parse(raw)}catch{return respond({error:'JSON inválido.'},400)}return {payload}
}
function metaMessages(payload){const messages=[];for(const entry of Array.isArray(payload?.entry)?payload.entry:[])for(const change of Array.isArray(entry?.changes)?entry.changes:[])for(const message of Array.isArray(change?.value?.messages)?change.value.messages:[])if(message?.type==='text'&&typeof message?.text?.body==='string')messages.push({from:String(message.from||''),id:String(message.id||''),text:message.text.body});return messages.slice(0,10)}
async function whatsappWebhook(request,env){
 if(!env.DB)return respond({error:'D1 no configurada.'},503);const verified=await verifyMetaRequest(request,env,'PLUVIAM_WHATSAPP_TOKEN','PLUVIAM_WHATSAPP_APP_SECRET');if(verified instanceof Response)return verified;
 const messages=metaMessages(verified.payload);let processed=0;for(const message of messages){const result=await createFounderIntakeRecord(env.DB,{canal:'whatsapp',remitente:message.from,texto:message.text},{verifiedSender:true,sourceMessageId:message.id||null});if(result.error)return respond({error:result.error},result.status);processed++}return respond({received:true,processed})
}
async function hihomeWebhook(request,env){
 const expectedToken=env.HI_HOME_WHATSAPP_TOKEN;
 if(request.method==='GET'){
  if(!expectedToken)return respond({error:'Token WhatsApp de HI Home no configurado.'},503);const url=new URL(request.url),mode=url.searchParams.get('hub.mode')||'',token=url.searchParams.get('hub.verify_token')||'',challenge=url.searchParams.get('hub.challenge')||'';if(mode!=='subscribe'||!safeSame(token,expectedToken)||!challenge)return respond({error:'Verificación rechazada.'},403);if(!env.DB_HIHOME)return respond({error:'D1_HIHOME no conectada; HI Home sigue aislado y desactivado.'},501);return new Response(challenge,{status:200,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}})
 }
 if(request.method!=='POST')return respond({error:'Método no permitido'},405);const secret=env.HI_HOME_WHATSAPP_APP_SECRET;if(!secret)return respond({error:'Firma WhatsApp de HI Home no configurada.'},503);const raw=await request.text();if(raw.length>100000)return respond({error:'Webhook demasiado grande.'},413);const signature=request.headers.get('x-hub-signature-256')||'',expected='sha256='+await hmacHex(secret,raw);if(!safeSame(signature,expected))return respond({error:'Firma WhatsApp de HI Home inválida.'},401);if(!env.DB_HIHOME)return respond({error:'D1_HIHOME no conectada; HI Home sigue aislado y desactivado.'},501);return respond({error:'Rutas de operación HI Home preparadas; falta activar su D1 y flujo aislado.'},501)
}
async function hihomeApi(request,env,path){if(path==='/api/hihome/webhooks/whatsapp')return hihomeWebhook(request,env);if(!env.DB_HIHOME)return respond({error:'D1_HIHOME no conectada; HI Home sigue aislado y desactivado.'},501);return respond({error:'Endpoint HI Home preparado pero no activado en este preview.'},501)}
async function twilioSignature(token,url,form){const keys=[...new Set([...form.keys()])].sort(),parts=[url];for(const key of keys)for(const value of form.getAll(key).sort())parts.push(key+value);const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(token),{name:'HMAC',hash:'SHA-1'},false,['sign']),sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(parts.join(''))));let binary='';for(const byte of sig)binary+=String.fromCharCode(byte);return btoa(binary)}
function twiml(body){return new Response(body,{status:200,headers:{'Content-Type':'text/xml; charset=utf-8','Cache-Control':'no-store'}})}
async function twilioWebhook(request,env){
 if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.TWILIO_AUTH_TOKEN)return respond({error:'Twilio no está configurado; usa /api/intake/voz-mock solo en entorno autorizado.'},501);if(!env.DB)return respond({error:'D1 no configurada.'},503);
 const raw=await request.text();if(raw.length>12000)return respond({error:'Webhook demasiado grande.'},413);const form=new URLSearchParams(raw),url=new URL(request.url),signature=request.headers.get('x-twilio-signature')||'',expected=await twilioSignature(env.TWILIO_AUTH_TOKEN,url.href,form);if(!safeSame(signature,expected))return respond({error:'Firma de Twilio inválida.'},401);
 const speech=norm(form.get('SpeechResult')||'',1000),from=norm(form.get('From')||'',30);if(!speech)return twiml('<Response><Gather input="speech" action="/api/webhooks/twilio" method="POST" language="es-MX" timeout="5"><Say language="es-MX">Cuéntanos brevemente qué necesitas y en qué zona.</Say></Gather><Say language="es-MX">No recibimos una respuesta. Gracias.</Say></Response>');
 const result=await createFounderIntakeRecord(env.DB,{canal:'voz',remitente:from,texto:speech},{verifiedSender:true,sourceMessageId:form.get('CallSid')||null});if(result.error)return twiml('<Response><Say language="es-MX">No pudimos registrar tu solicitud. Intenta más tarde.</Say></Response>');return twiml('<Response><Say language="es-MX">Gracias. Registramos tu solicitud con folio '+htmlEsc(result.folio)+'.</Say></Response>')
}
async function voiceMockApi(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!admin(request,env))return respond({error:'No autorizado'},401);if(env.MOCK_INTAKE_ENABLED!=='true'||!['test','local','preview'].includes(env.APP_ENV))return respond({error:'La simulación de voz está deshabilitada en este entorno.'},501);let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const transcript=norm(d.transcripcion,1000);if(transcript.length<3)return respond({error:'Transcripción requerida.'},422);const result=await createFounderIntakeRecord(env.DB,{canal:'voz',remitente:norm(d.telefono,30),texto:transcript});if(result.error)return respond({error:result.error},result.status);const {status,...payload}=result;return respond(payload,status)}
function bearerSession(request){const cookie=request.headers.get('cookie')||'',match=cookie.match(/(?:^|;\s*)plv_ally_session=([A-Za-z0-9-]{20,80})(?:;|$)/);return match?match[1]:''}
async function validAllySession(request,env){const token=bearerSession(request);if(!token||!env.ALLY_PORTAL_OTP_PEPPER||!env.DB)return null;const session=await env.DB.prepare("SELECT s.ally_id FROM ally_portal_sessions s JOIN aliados a ON a.id=s.ally_id WHERE s.session_hash=? AND s.revoked_at IS NULL AND datetime(s.expires_at)>datetime('now') AND a.status IN ('G0_APROBADO','APROBADO_REFERIDOR') AND a.referral_opt_in=1").bind(await hash(env.ALLY_PORTAL_OTP_PEPPER+':'+token)).first();return session?.ally_id||null}
async function sendAllyOtp(env,email,code){if(env.ALLY_PORTAL_EMAIL_OTP!=='true'||!env.RESEND_API_KEY||!env.RESEND_FROM)return false;const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.RESEND_FROM,to:[email],subject:'Código de acceso al portal de aliados PLUVIAM',text:'Tu código de acceso temporal es '+code+'. Vence en 10 minutos. Si no solicitaste acceso, ignora este correo.'}),signal:AbortSignal.timeout(8000)});return response.ok}
async function requestAllyOtp(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB)return respond({error:'D1 no configurada'},503);if(!(await limited(request,env)))return respond({error:'Demasiadas solicitudes.'},429);let d;try{d=await bodyJson(request,1500)}catch{return respond({error:'Solicitud inválida'},400)}const code=norm(d.code,50).toUpperCase();if(!/^PLV-[A-Z0-9-]{4,40}$/.test(code))return respond({ok:true,message:'Si la cuenta está habilitada, recibirás instrucciones de acceso.'});const ally=await env.DB.prepare("SELECT id,email_normalized FROM aliados WHERE referral_code=? AND status IN ('G0_APROBADO','APROBADO_REFERIDOR') AND referral_opt_in=1").bind(code).first();if(!ally)return respond({ok:true,message:'Si la cuenta está habilitada, recibirás instrucciones de acceso.'});const recent=await env.DB.prepare("SELECT COUNT(*) AS total FROM ally_portal_otps WHERE ally_id=? AND datetime(created_at)>datetime('now','-15 minutes')").bind(ally.id).first();if(Number(recent?.total||0)>=3)return respond({error:'Espera antes de solicitar otro código.'},429);if(!env.ALLY_PORTAL_OTP_PEPPER)return respond({error:'El acceso al portal no está configurado.'},503);const n=crypto.getRandomValues(new Uint32Array(1))[0]%1000000,otp=String(n).padStart(6,'0'),otpId=crypto.randomUUID(),codeHash=await hash(env.ALLY_PORTAL_OTP_PEPPER+':'+ally.id+':'+otp),expiresAt=new Date(Date.now()+10*60*1000).toISOString();await env.DB.prepare("INSERT INTO ally_portal_otps(id,ally_id,code_hash,expires_at) VALUES(?,?,?,?)").bind(otpId,ally.id,codeHash,expiresAt).run();
 if(env.APP_ENV==='test'&&env.ALLY_PORTAL_OTP_TEST_MODE==='true')return respond({ok:true,message:'Código de prueba local.',test_code:otp},202);const sent=await sendAllyOtp(env,ally.email_normalized,otp);if(!sent)return respond({error:'La entrega OTP no está configurada; no se emitió ningún código.'},503);return respond({ok:true,message:'Si la cuenta está habilitada, recibirás instrucciones de acceso.'},202)}
async function loginAllyPortal(request,env){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB||!env.ALLY_PORTAL_OTP_PEPPER)return respond({error:'El acceso al portal no está configurado.'},503);let d;try{d=await bodyJson(request,1500)}catch{return respond({error:'Solicitud inválida'},400)}const code=norm(d.code,50).toUpperCase(),otp=norm(d.otp,10);if(!/^PLV-[A-Z0-9-]{4,40}$/.test(code)||!/^[0-9]{6}$/.test(otp))return respond({error:'Código inválido o vencido.'},401);const ally=await env.DB.prepare("SELECT id FROM aliados WHERE referral_code=? AND status IN ('G0_APROBADO','APROBADO_REFERIDOR') AND referral_opt_in=1").bind(code).first();if(!ally)return respond({error:'Código inválido o vencido.'},401);const record=await env.DB.prepare("SELECT id,code_hash FROM ally_portal_otps WHERE ally_id=? AND consumed_at IS NULL AND attempts<5 AND datetime(expires_at)>datetime('now') ORDER BY created_at DESC LIMIT 1").bind(ally.id).first();if(!record||!safeSame(record.code_hash,await hash(env.ALLY_PORTAL_OTP_PEPPER+':'+ally.id+':'+otp))){if(record)await env.DB.prepare('UPDATE ally_portal_otps SET attempts=attempts+1 WHERE id=?').bind(record.id).run();return respond({error:'Código inválido o vencido.'},401)}const token=crypto.randomUUID(),sessionHash=await hash(env.ALLY_PORTAL_OTP_PEPPER+':'+token),expiresAt=new Date(Date.now()+60*60*1000).toISOString();await env.DB.batch([env.DB.prepare("UPDATE ally_portal_otps SET consumed_at=CURRENT_TIMESTAMP WHERE id=? AND consumed_at IS NULL AND attempts<5").bind(record.id),env.DB.prepare('INSERT INTO ally_portal_sessions(session_hash,ally_id,expires_at) VALUES(?,?,?)').bind(sessionHash,ally.id,expiresAt)]);const secure=new URL(request.url).protocol==='https:'?'; Secure':'';return new Response(JSON.stringify({ok:true}),{status:200,headers:{...JSON_HEADERS,'Set-Cookie':'plv_ally_session='+token+'; Path=/api/aliado; Max-Age=3600; HttpOnly; SameSite=Strict'+secure}})}
async function allyDashboardApi(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);const allyId=await validAllySession(request,env);if(!allyId)return respond({error:'Autenticación de aliado requerida.'},401);try{const clients=await env.DB.prepare("SELECT r.folio,r.cliente_nombre,r.cliente_telefono,r.necesidad,r.zona,r.estado,p.state AS project_state FROM referidos r LEFT JOIN referral_projects p ON p.referido_id=r.id WHERE r.aliado_id=? OR p.assigned_ally_id=? ORDER BY r.created_at DESC LIMIT 100").bind(allyId,allyId).all();const jobs=await env.DB.prepare("SELECT r.folio,r.necesidad,r.zona,p.state,p.assigned_at,p.completed_at FROM referral_projects p JOIN referidos r ON r.id=p.referido_id WHERE p.assigned_ally_id=? ORDER BY p.created_at DESC LIMIT 100").bind(allyId).all();const money=await env.DB.prepare("SELECT c.id,r.folio,c.monto_cents,c.moneda,c.estado,c.liberada_at,c.pagada_at FROM comisiones c LEFT JOIN referidos r ON r.id=c.referido_id WHERE c.aliado_id=? ORDER BY c.created_at DESC LIMIT 100").bind(allyId).all();return respond({clientes:clients.results||[],trabajos:jobs.results||[],dinero:money.results||[]})}catch{return respond({error:'El tablero de aliado requiere la migración Founder OS.'},503)}}
async function allyPortalPage(request,env){const main=`<div class="plv-kicker">Portal seguro de aliados</div><h1>Tu operación PLUVIAM.</h1><p class="plv-lead">Solicita un código temporal al correo registrado. El código de referido público no da acceso a datos del portal.</p><section class="plv-panel"><form id="ally-login" class="plv-form"><label class="wide">Código de aliado<input name="code" autocomplete="off" maxlength="50" required></label><label class="wide">Código temporal<input name="otp" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code"></label><div class="plv-form-actions"><button class="plv-button" type="button" id="ally-otp-request">Enviar código</button><button class="plv-button" type="submit">Entrar</button></div></form><p id="ally-message" class="plv-message" role="status" aria-live="polite"></p></section><section id="ally-dashboard" class="plv-grid" hidden><article class="plv-card"><h2>Mis clientes</h2><div id="ally-clients"></div></article><article class="plv-card"><h2>Mis trabajos</h2><div id="ally-jobs"></div></article><article class="plv-card"><h2>Mi dinero</h2><div id="ally-money"></div></article></section><script>(()=>{const form=document.getElementById('ally-login'),message=document.getElementById('ally-message'),dash=document.getElementById('ally-dashboard'),esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));async function load(){const r=await fetch('/api/aliado/dashboard',{cache:'no-store'}),d=await r.json();if(!r.ok)throw new Error(d.error||'No fue posible cargar el tablero.');const render=(rows,fields)=>rows.length?rows.map(row=>'<p><strong>'+esc(row.folio||row.id)+'</strong><br>'+fields.map(key=>esc(row[key]||'')).filter(Boolean).join(' · ')+'</p>').join(''):'<p class="plv-muted">Sin registros.</p>';document.getElementById('ally-clients').innerHTML=render(d.clientes||[],['cliente_nombre','cliente_telefono','project_state']);document.getElementById('ally-jobs').innerHTML=render(d.trabajos||[],['state','zona']);document.getElementById('ally-money').innerHTML=render(d.dinero||[],['monto_cents','moneda','estado']);dash.hidden=false}document.getElementById('ally-otp-request').addEventListener('click',async()=>{message.textContent='Solicitando código...';try{const r=await fetch('/api/aliado/portal/otp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:form.elements.code.value.trim()})}),d=await r.json();message.textContent=d.message||d.error||'Solicitud procesada.'}catch{message.textContent='No fue posible solicitar el código.'}});form.addEventListener('submit',async event=>{event.preventDefault();message.textContent='Validando...';try{const r=await fetch('/api/aliado/portal/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:form.elements.code.value.trim(),otp:form.elements.otp.value.trim()})}),d=await r.json();if(!r.ok)throw new Error(d.error||'Acceso denegado.');message.textContent='Acceso confirmado.';await load()}catch(error){message.textContent=error.message||'No fue posible autenticarte.'}})})();</script>`;return await sharedPage(request,env,'Portal de aliados PLUVIAM','Acceso temporal seguro al portal de aliados.',main)}
function monthCapacitySql(){return "((SELECT COUNT(*) FROM crm_prospects c WHERE c.ally_id=a.id AND date(c.ally_assigned_at)>=date('now','start of month'))+(SELECT COUNT(*) FROM referral_projects rp WHERE rp.assigned_ally_id=a.id AND date(rp.assigned_at)>=date('now','start of month')))"}
async function adminMatchApi(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);const folio=norm(new URL(request.url).searchParams.get('folio'),60);if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio))return respond({error:'Folio inválido.'},400);const referral=await env.DB.prepare('SELECT r.id,r.folio,r.necesidad,r.zona,m.categoria,m.urgencia FROM referidos r LEFT JOIN referral_intake_metadata m ON m.referido_id=r.id WHERE r.folio=?').bind(folio).first();if(!referral)return respond({error:'Referido no encontrado.'},404);const rows=await env.DB.prepare("SELECT a.id,a.full_name,a.city,a.services_json,a.coverage_json,a.capacity_month,a.availability,a.commission_rate_bps, "+monthCapacitySql()+" AS assigned_month FROM aliados a WHERE a.status IN ('G0_APROBADO','APROBADO_REFERIDOR') AND a.referral_opt_in=1 AND a.capacity_month>0 ORDER BY a.full_name LIMIT 500").all(),zone=founderFold(referral.zona),need=founderFold(referral.necesidad),category=referral.categoria||classifyIntake(need),suggestions=[];
 for(const ally of rows.results||[]){const services=jsonStrings(parseJsonValue(ally.services_json)).map(founderFold),coverage=jsonStrings(parseJsonValue(ally.coverage_json)).map(founderFold),city=founderFold(ally.city),availability=founderFold(ally.availability);if(/no disponible|ocupad|saturad/.test(availability))continue;const capacity=Number(ally.capacity_month)||0,assigned=Number(ally.assigned_month)||0;if(assigned>=capacity)continue;let serviceScore=0;if(category==='hidraulica'&&services.some(s=>FOUNDER_OS_NEED_TERMS.hidraulica.some(t=>s.includes(t))))serviceScore=40;else if(category==='wifi'&&services.some(s=>FOUNDER_OS_NEED_TERMS.wifi.some(t=>s.includes(t))))serviceScore=40;else if(category==='otro'&&services.some(s=>need.includes(s)&&s.length>2))serviceScore=25;if(category!=='otro'&&serviceScore===0)continue;let zoneScore=0;if(zone){if(coverage.some(c=>c===zone||c.includes(zone)||zone.includes(c)))zoneScore=60;else if(city&&(city===zone||city.includes(zone)||zone.includes(city)))zoneScore=35;else continue}else if(city)zoneScore=10;suggestions.push({id:ally.id,nombre:ally.full_name,ciudad:ally.city,servicios:parseJsonValue(ally.services_json),capacidad_disponible:capacity-assigned,commission_rate_bps:Number(ally.commission_rate_bps)||0,score:serviceScore+zoneScore})}
 suggestions.sort((a,b)=>b.score-a.score||b.capacidad_disponible-a.capacidad_disponible||String(a.nombre).localeCompare(String(b.nombre),'es'));return respond({referido:{folio:referral.folio,necesidad:referral.necesidad,zona:referral.zona,categoria:category,urgencia:referral.urgencia||intakeUrgency(referral.necesidad)},especialistas:suggestions.slice(0,3),requiere_aprobacion_humana:true})}
async function adminAssignApi(request,env,ctx){if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);let d;try{d=await bodyJson(request,1500)}catch{return respond({error:'Solicitud inválida'},400)}const folio=norm(d.folio,60),allyId=norm(d.aliado_id,80);if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio)||!allyId)return respond({error:'Folio y aliado son requeridos.'},422);const referral=await env.DB.prepare('SELECT id FROM referidos WHERE folio=?').bind(folio).first();if(!referral)return respond({error:'Referido no encontrado.'},404);const gateSql="EXISTS (SELECT 1 FROM aliados a WHERE a.id=? AND a.status IN ('G0_APROBADO','APROBADO_REFERIDOR') AND a.referral_opt_in=1 AND a.capacity_month > ((SELECT COUNT(*) FROM crm_prospects c WHERE c.ally_id=a.id AND date(c.ally_assigned_at)>=date('now','start of month'))+(SELECT COUNT(*) FROM referral_projects p WHERE p.assigned_ally_id=a.id AND date(p.assigned_at)>=date('now','start of month'))))",update=env.DB.prepare("UPDATE referral_projects SET state='asignado',assigned_ally_id=?,assigned_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE referido_id=? AND state='recibido' AND assigned_ally_id IS NULL AND "+gateSql).bind(allyId,referral.id,allyId),mark=env.DB.prepare("UPDATE referidos SET estado='contactado' WHERE id=? AND estado='recibido' AND EXISTS(SELECT 1 FROM referral_projects WHERE referido_id=? AND state='asignado' AND assigned_ally_id=?)").bind(referral.id,referral.id,allyId),event=env.DB.prepare("INSERT INTO admin_events(event_id,folio,action,recorded_at) SELECT ?,?,'referral:assigned',CURRENT_TIMESTAMP WHERE EXISTS(SELECT 1 FROM referral_projects WHERE referido_id=? AND state='asignado' AND assigned_ally_id=?)").bind(crypto.randomUUID(),folio,referral.id,allyId),results=await env.DB.batch([update,mark,event]);if(!Number(results?.[0]?.meta?.changes))return respond({error:'El referido ya fue asignado, el aliado requiere G0 y consentimiento, o no tiene cupo.'},409);const notify=ctx?.waitUntil?(ctx.waitUntil(deliverAllyAssignment(env,folio,allyId)),'queued'):await deliverAllyAssignment(env,folio,allyId);return respond({folio,aliado_id:allyId,state:'asignado',notify})}
async function ensurePostSaleSurvey(env,pedidoId){if(!env.DB)return null;const order=await env.DB.prepare("SELECT p.id,p.referido_id,rp.id AS project_id FROM pedidos p JOIN referral_projects rp ON rp.referido_id=p.referido_id WHERE p.id=? AND p.estado='pagado' AND rp.state='terminado'").bind(pedidoId).first();if(!order)return null;const id=crypto.randomUUID(),tokenHash=await hash(crypto.randomUUID());await env.DB.prepare("INSERT INTO postventa_encuestas(id,project_id,pedido_id,survey_token_hash) VALUES(?,?,?,?) ON CONFLICT DO NOTHING").bind(id,order.project_id,order.id,tokenHash).run();const survey=await env.DB.prepare('SELECT id FROM postventa_encuestas WHERE pedido_id=?').bind(order.id).first();return survey?.id||null}
async function adminProjectStateApi(request,env){
 if(request.method!=='POST')return respond({error:'Método no permitido'},405);if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);
 let d;try{d=await bodyJson(request,1500)}catch{return respond({error:'Solicitud inválida'},400)}
 const folio=norm(d.folio,60),next=norm(d.estado,30);
 if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio)||!['en_proceso','terminado'].includes(next))return respond({error:'Estado o folio inválido.'},422);
 const project=await env.DB.prepare('SELECT p.id,p.state,p.assigned_ally_id,r.id AS referido_id FROM referral_projects p JOIN referidos r ON r.id=p.referido_id WHERE r.folio=?').bind(folio).first();
 if(!project)return respond({error:'Proyecto no encontrado.'},404);
 const allowed={asignado:['en_proceso'],en_proceso:['terminado']};
 if(!(allowed[project.state]||[]).includes(next)||!project.assigned_ally_id)return respond({error:'Transición de estado no permitida.'},409);
 const results=await env.DB.batch([
  env.DB.prepare("UPDATE referral_projects SET state=?,completed_at=CASE WHEN ?='terminado' THEN CURRENT_TIMESTAMP ELSE completed_at END,updated_at=CURRENT_TIMESTAMP WHERE id=? AND state=?").bind(next,next,project.id,project.state),
  env.DB.prepare("INSERT INTO admin_events(event_id,folio,action,recorded_at) SELECT ?,?,?,CURRENT_TIMESTAMP WHERE changes()>0").bind(crypto.randomUUID(),folio,'project:'+next)
 ]);
 if(!Number(results?.[0]?.meta?.changes))return respond({error:'El estado del proyecto cambió en otra operación.'},409);
 let surveyId=null;if(next==='terminado'){const paid=await env.DB.prepare("SELECT id FROM pedidos WHERE referido_id=? AND estado='pagado' ORDER BY pagado_at DESC LIMIT 1").bind(project.referido_id).first();if(paid)surveyId=await ensurePostSaleSurvey(env,paid.id)}
 return respond({folio,estado:next,encuesta_id:surveyId})
}
async function adminQuoteApi(request,env){if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);if(request.method==='GET'){const folio=norm(new URL(request.url).searchParams.get('folio'),60);if(folio&&!/^PLV-[A-Z0-9-]{8,46}$/.test(folio))return respond({error:'Folio inválido.'},400);const rows=await env.DB.prepare('SELECT id,folio,amount_cents,currency,concept,status,created_at,approved_at,sent_at FROM quote_drafts'+(folio?' WHERE folio=?':'')+' ORDER BY created_at DESC LIMIT 100').bind(...(folio?[folio]:[])).all();return respond({cotizaciones:rows.results||[]})}if(request.method!=='POST')return respond({error:'Método no permitido'},405);let d;try{d=await bodyJson(request,3000)}catch{return respond({error:'Solicitud inválida'},400)}const folio=norm(d.folio,60),amount=Number(d.amount_cents),concept=norm(d.concepto,240);if(!/^PLV-[A-Z0-9-]{8,46}$/.test(folio)||!Number.isSafeInteger(amount)||amount<100||amount>100000000000||concept.length<3)return respond({error:'Folio, importe en centavos y concepto son requeridos.'},422);const exists=await env.DB.prepare('SELECT id FROM referidos WHERE folio=?').bind(folio).first();if(!exists)return respond({error:'Referido no encontrado.'},404);const id=crypto.randomUUID(),batch=await env.DB.batch([env.DB.prepare("INSERT INTO quote_drafts(id,folio,amount_cents,currency,concept,status,created_by) VALUES(?,? ,?,'MXN',?,'borrador','admin')").bind(id,folio,amount,concept),env.DB.prepare("UPDATE referidos SET estado='cotizado' WHERE folio=? AND estado IN ('recibido','contactado')").bind(folio),env.DB.prepare("INSERT INTO admin_events(event_id,folio,action,recorded_at) VALUES(?,?, 'quote:draft_created',CURRENT_TIMESTAMP)").bind(crypto.randomUUID(),folio)]);if(!batch)return respond({error:'No se pudo guardar el borrador.'},503);return respond({id,folio,amount_cents:amount,currency:'MXN',concept,status:'borrador',sent:false},201)}
async function adminAnalyticsApi(request,env){if(request.method!=='GET')return respond({error:'Método no permitido'},405);if(!env.DB||!admin(request,env))return respond({error:'No autorizado'},403);try{const totals=await env.DB.prepare("SELECT COUNT(*) AS referidos,COUNT(DISTINCT CASE WHEN p.estado='pagado' THEN r.id END) AS conversiones FROM referidos r LEFT JOIN pedidos p ON p.referido_id=r.id").first(),commissions=await env.DB.prepare('SELECT estado,COUNT(*) AS total,SUM(monto_cents) AS monto_cents FROM comisiones GROUP BY estado ORDER BY estado').all(),zones=await env.DB.prepare("SELECT zona,COUNT(*) AS referidos,COUNT(DISTINCT CASE WHEN p.estado='pagado' THEN r.id END) AS conversiones FROM referidos r LEFT JOIN pedidos p ON p.referido_id=r.id WHERE trim(zona)<>'' GROUP BY zona ORDER BY referidos DESC LIMIT 20").all(),allies=await env.DB.prepare("SELECT a.id,a.full_name,(SELECT COUNT(*) FROM referidos r WHERE r.aliado_id=a.id) AS referidos,(SELECT COUNT(*) FROM referidos r JOIN pedidos p ON p.id=r.pedido_id WHERE r.aliado_id=a.id AND p.estado='pagado') AS conversiones,(SELECT COALESCE(SUM(c.monto_cents),0) FROM comisiones c WHERE c.aliado_id=a.id) AS comisiones_cents FROM aliados a ORDER BY referidos DESC,conversiones DESC LIMIT 10").all(),total=Number(totals?.referidos)||0,converted=Number(totals?.conversiones)||0;return respond({as_of:new Date().toISOString(),total_referidos:total,conversiones:converted,tasa_conversion:total?Math.round(converted*10000/total)/100:0,comisiones:commissions.results||[],por_zona:zones.results||[],top_aliados:allies.results||[]})}catch{return respond({error:'Esquema Founder OS pendiente; ejecuta la migración Preview 018.'},503)}}
function portalStyleList(rows,fields){return rows.map(row=>'<p><strong>'+htmlEsc(row.folio||row.id)+'</strong><br>'+fields.map(field=>htmlEsc(row[field]??'')).filter(Boolean).join(' · ')+'</p>').join('')||'<p class="plv-muted">Sin registros.</p>'}
function founderOsPagePath(path){return path==='/aliado/portal'||path==='/aliado/portal/'}
const founderOsApiPaths=new Set(['/api/intake','/api/intake/voz-mock','/api/webhooks/whatsapp','/api/webhooks/twilio','/api/admin/match','/api/admin/asignar','/api/admin/proyectos/estado','/api/admin/cotizar','/api/admin/analytics','/api/aliado/portal/otp','/api/aliado/portal/login','/api/aliado/dashboard']);
async function founderOsSchemaReady(env){if(!env.DB)return false;try{for(const [table,column] of [['referral_intake_metadata','source_message_id'],['referral_projects','assigned_ally_id'],['quote_drafts','status'],['ally_portal_otps','code_hash'],['ally_portal_sessions','session_hash'],['postventa_encuestas','survey_token_hash']])await env.DB.prepare('SELECT '+column+' FROM '+table+' LIMIT 0').all();return true}catch{return false}}
function betaPreviewEnabled(env){return (env?.BETA_MODE==='true'&&env?.BETA_ISOLATED==='true'&&!!env?.DB_BETA)||(env?.BEEHIVE_ENABLED==='true'&&!!env?.DB)}
async function privateAdminPage(request,env){if(new URL(request.url).pathname==='/admin/referidos')return !!admin(request,env);return !!(await accessEmail(request,env))}
// Pages owns canonical trailing-slash handling for directory index.html files.
// Do not rewrite clean URLs to .html: that creates a redirect loop in ASSETS.fetch.
async function serveAsset(request,env){
 const url=new URL(request.url),path=url.pathname,portalShell=path==='/waternet/portal'||path==='/waternet/portal/';
  if(path==='/tienda')return await tiendaPage(request,env);
  if(path==='/aliados/registro'||path==='/aliados/registro/')return await allyRegistrationPage(request,env);
  if(founderOsPagePath(path))return await allyPortalPage(request,env);
  if(path==='/referir')return await referralPage(request,env);
  if(path==='/admin/referidos')return await adminReferralPage(request,env);
 // Pages asset fallback can miss nested directory indexes when a Worker handles the request.
 // Resolve the portal shell explicitly; all private data still comes from authenticated APIs.
 const assetRequest=portalShell?new Request(new URL('/waternet/portal/index.html',url),{method:'GET',headers:request.headers}):request;
 const response=await env.ASSETS.fetch(assetRequest);
 if(portalShell&&response.ok){const headers=new Headers(response.headers);headers.set('Cache-Control','private, no-store');return new Response(await response.arrayBuffer(),{status:response.status,statusText:response.statusText,headers})}
 if(path==='/'&&response.ok){const html=await response.text();const headers=new Headers(response.headers);headers.set('Content-Type','text/html; charset=UTF-8');headers.set('Cache-Control','no-store');return new Response(html.replace(/<\/body>/i,PLUVIAM3_HOME+'<script defer src="/avianny.js"></script></body>'),{status:response.status,headers})}
 if(path==='/industrial/'&&response.ok){const html=await response.text();const headers=new Headers(response.headers);headers.set('Content-Type','text/html; charset=UTF-8');const visual='<section class="industry-visual" aria-label="Componentes de infraestructura hídrica"><img src="/store/assets/hero-editorial.webp" alt="Infraestructura hídrica para operaciones de mayor escala" loading="lazy"><img src="/store/assets/tank.webp" alt="Almacenamiento de agua" loading="lazy"><img src="/store/assets/pump.webp" alt="Bombeo y control de presión" loading="lazy"></section><style>.industry-visual{display:grid;grid-template-columns:2fr 1fr 1fr;gap:12px;margin:28px 0 6px;max-width:980px}.industry-visual img{width:100%;height:170px;object-fit:cover;border-radius:16px;border:1px solid rgba(190,244,226,.28);box-shadow:0 18px 45px rgba(0,0,0,.18)}.industry-visual img:first-child{height:220px}@media(max-width:650px){.industry-visual{grid-template-columns:1fr 1fr}.industry-visual img:first-child{grid-column:1/-1;height:190px}.industry-visual img{height:130px}}</style>';return new Response(html.replace('</div></div></div></main>', '</div>'+visual+'</div></div></main>'),{status:response.status,headers})}
 return response
}


// ===========================================================================
// VIGKRAKEN v0 · capa de SOLO LECTURA sobre la D1 existente.
// No crea tablas, no escribe, no encola. Solo SELECT.
// ===========================================================================
function vkAuth(request,env){
 const header=request.headers.get('Authorization')||'';
 const expected=env.VIGKRAKEN_READ_TOKEN||env.ADMIN_TOKEN||'';
 return !!expected&&safeSame(header,'Bearer '+expected);
}
async function vkQuery(env,sql,params){
 const stmt=params&&params.length?env.DB.prepare(sql).bind(...params):env.DB.prepare(sql);
 const result=await stmt.all();
 return result.results||[];
}
async function vigkrakenApi(request,env,path){
 if(request.method!=='GET')return respond({error:'Solo lectura'},405);
 if(!env.DB)return respond({error:'D1_NO_DISPONIBLE'},503);
 if(!vkAuth(request,env))return respond({error:'No autorizado'},403);
 const url=new URL(request.url),limit=Math.min(Math.max(parseInt(url.searchParams.get('limit')||'50',10)||50,1),100);
 const base={generated_at:new Date().toISOString(),brand:'PLUVIAM',source:{db:'production',schema_ready:true}};
 try{
  if(path==='/api/vgk/health'){
   const tables=await vkQuery(env,"SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('lead_cases','crm_prospects','field_visits','aliados','admin_events')");
   const counts=(await vkQuery(env,"SELECT (SELECT COUNT(*) FROM lead_cases) AS leads,(SELECT COUNT(*) FROM crm_prospects) AS crm,(SELECT COUNT(*) FROM field_visits) AS visits,(SELECT COUNT(*) FROM aliados) AS allies"))[0]||{};
   const last=(await vkQuery(env,'SELECT MAX(recorded_at) AS last_event FROM admin_events'))[0]||{};
   return respond({...base,schema_ready:Number(tables?.[0]?.n||0)>=5,counts,last_event:last.last_event||null});
  }
  if(path==='/api/vgk/overview'){
   const row=(await vkQuery(env,`SELECT
     (SELECT COUNT(*) FROM lead_cases WHERE status NOT IN ('cerrada','cerrado','cancelada','cancelado')) AS casos_abiertos,
     (SELECT COUNT(*) FROM crm_prospects WHERE is_synthetic=0 AND (responsible IS NULL OR responsible='')) AS sin_responsable,
     (SELECT COUNT(*) FROM crm_prospects WHERE is_synthetic=0 AND ally_id IS NOT NULL) AS asignados,
     (SELECT COUNT(*) FROM referral_projects WHERE state='asignado') AS proyectos_asignados,
     (SELECT COUNT(*) FROM referral_projects WHERE state='en_proceso') AS en_obra,
     (SELECT COUNT(*) FROM field_visits WHERE status NOT IN ('REALIZADA','CANCELADA','NO_VIABLE')) AS excepciones_abiertas,
     (SELECT COUNT(*) FROM aliados WHERE status='G0_APROBADO' AND is_synthetic=0) AS g0_acreditados,
     (SELECT COALESCE(SUM(amount_cents),0) FROM approved_quotes WHERE accepted_by_customer=1 AND status NOT IN ('paid','cancelled','cancelada')) AS dinero_pendiente_cents`))[0]||{};
   return respond({...base,kpis:{...row,dinero_pendiente_mxn:Number(row.dinero_pendiente_cents||0)/100}});
  }
  if(path==='/api/vgk/cases'){
   const estado=norm(url.searchParams.get('estado')||'',30);
   const rows=estado?await vkQuery(env,`SELECT l.folio,l.city,l.segment,l.status,l.next_step,l.created_at,
       c.responsible,c.next_action,c.pipeline_stage,c.priority,c.follow_up_at,c.is_synthetic
     FROM lead_cases l LEFT JOIN crm_prospects c ON c.folio=l.folio
     WHERE l.status=? ORDER BY l.created_at DESC LIMIT ?`,[estado,limit])
    :await vkQuery(env,`SELECT l.folio,l.city,l.segment,l.status,l.next_step,l.created_at,
       c.responsible,c.next_action,c.pipeline_stage,c.priority,c.follow_up_at,c.is_synthetic
     FROM lead_cases l LEFT JOIN crm_prospects c ON c.folio=l.folio
     WHERE COALESCE(c.is_synthetic,0)=0 AND l.status NOT IN ('cerrada','cerrado','cancelada','cancelado')
     ORDER BY l.created_at DESC LIMIT ?`,[limit]);
   return respond({...base,count:rows.length,cases:rows});
  }
  if(path==='/api/vgk/exceptions'){
   const visits=await vkQuery(env,`SELECT id,lead_folio,status,priority,city,next_action,created_at,assigned_ally_id
     FROM field_visits WHERE status NOT IN ('REALIZADA','CANCELADA','NO_VIABLE')
     ORDER BY CASE priority WHEN 'critica' THEN 0 WHEN 'alta' THEN 1 ELSE 2 END, created_at ASC LIMIT ?`,[limit]);
   const alerts=await vkQuery(env,`SELECT folio,status,attempts,last_error,created_at FROM lead_alerts
     WHERE status!='delivered' ORDER BY created_at ASC LIMIT ?`,[limit]);
   return respond({...base,visits,alerts});
  }
  if(path==='/api/vgk/money'){
   const quotes=await vkQuery(env,`SELECT id,folio,amount_cents,currency,status,accepted_by_customer,approved_at
     FROM approved_quotes ORDER BY COALESCE(approved_at,updated_at) DESC LIMIT ?`,[limit]);
   const attempts=await vkQuery(env,`SELECT state,COUNT(*) AS n FROM payment_attempts GROUP BY state`);
   return respond({...base,quotes,payment_attempts:attempts});
  }
  if(path==='/api/vgk/network'){
   const rows=await vkQuery(env,`SELECT a.id,a.full_name,a.company,a.status,a.capacity_month,a.availability,
     (SELECT COUNT(*) FROM referral_projects p WHERE p.assigned_ally_id=a.id
       AND date(p.assigned_at)>=date('now','start of month')) AS usados
     FROM aliados a WHERE a.is_synthetic=0 ORDER BY a.full_name LIMIT ?`,[limit]);
   return respond({...base,count:rows.length,allies:rows});
  }
  if(path==='/api/vgk/audit'){
   const folio=norm(url.searchParams.get('folio')||'',60);
   const rows=folio?await vkQuery(env,`SELECT event_id,folio,action,recorded_at FROM admin_events
       WHERE folio=? ORDER BY recorded_at DESC LIMIT ?`,[folio,limit])
    :await vkQuery(env,`SELECT event_id,folio,action,recorded_at FROM admin_events
       ORDER BY recorded_at DESC LIMIT ?`,[limit]);
   return respond({...base,count:rows.length,events:rows});
  }
  return respond({error:'Ruta VIGKRAKEN no encontrada'},404);
 }catch(error){
  return respond({error:'VIGKRAKEN_QUERY_FAILED',detail:String(error&&error.message||error).slice(0,140)},503);
 }
}



// ===========================================================================
// ENDPOINTS: 7 ETAPAS (1,2,3,4,6,7,8) + STUBS 5 Y 9
// Marcas aisladas: PLUVIAM / HI_HOME
// ===========================================================================

// --- Helpers de auditoría ---
async function auditLog(env, { marca, folio, componenteId, etapa, accion, actorTipo, actorId, detalle, prevHash }) {
  if (!env.DB) return;
  const payload = `${folio || ''}|${accion}|${new Date().toISOString()}|${prevHash || 'GENESIS'}`;
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(payload));
  const h = Array.from(new Uint8Array(hashBuf), x => x.toString(16).padStart(2, '0')).join('');
  await env.DB.prepare(
    `INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash)
     VALUES(?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(crypto.randomUUID(), marca, folio, componenteId, etapa, accion, actorTipo, actorId, JSON.stringify(detalle), prevHash || 'GENESIS', h).run();
  return h;
}

function requireMarca(body, headers) {
  const marca = (body?.marca || headers.get('x-marca') || '').toUpperCase();
  if (!['PLUVIAM', 'HI_HOME'].includes(marca)) {
    return { error: 'Marca requerida: PLUVIAM o HI_HOME (header x-marca o body.marca)' };
  }
  return { marca };
}

// ===========================================================================
// EVENT BUS · SYSTEM VIGKRAKEN · Event-Driven Architecture
// ===========================================================================

// Emitir evento al system_events (source of truth para Event-Driven)
async function emitEvent(env, ctx, { event_type, aggregate_type, aggregate_id, marca, payload_json, correlation_id, causation_id }) {
  if (!env.DB) return;
  const eventId = crypto.randomUUID();
  const now = new Date().toISOString();
  const prevHash = 'GENESIS'; // Simplificado - en producción usar hash del evento anterior
  
  // Insertar evento en system_events
  await env.DB.prepare(
    `INSERT INTO system_events(id, event_type, aggregate_type, aggregate_id, marca, payload_json, correlation_id, causation_id, status, created_at)
     VALUES(?,?,?,?,?,?,?,?,'PENDING',?)`
  ).bind(crypto.randomUUID(), event_type, aggregate_type, aggregate_id, marca, 
         JSON.stringify(payload_json), correlation_id || aggregate_id, correlation_id || aggregate_id, new Date().toISOString()).run();
  
  // Disparar procesamiento asíncrono de agentes (fire-and-forget)
  ctx?.waitUntil?.(processEvents(env).catch(() => {}));
  return eventId;
}

// Procesar eventos pendientes y ejecutar agentes autónomos
async function processEvents(env) {
  if (!env.DB) return;
  
  // Obtener eventos pendientes
  const events = await env.DB.prepare(
    `SELECT id, event_type, aggregate_type, aggregate_id, marca, payload_json, correlation_id
     FROM system_events 
     WHERE status = 'PENDING' 
     ORDER BY created_at ASC 
     LIMIT 50`
  ).all();
  
  for (const event of (events.results || [])) {
    const eventId = event.id;
    const eventType = event.event_type;
    
    // Marcar como procesando
    await env.DB.prepare("UPDATE system_events SET status = 'PROCESSING', processed_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), eventId).run();
    
    try {
      // Ejecutar agentes según el tipo de evento
      await Promise.all([
        runAgentB_CRM(env, event),
        runAgentC_Operaciones(env, event),
        runAgentD_Finanzas(env, event),
        runAgentE_Nocturno(env, event)
      ]);
      
      await env.DB.prepare("UPDATE system_events SET status = 'COMPLETED', processed_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), eventId).run();
    } catch (error) {
      await env.DB.prepare("UPDATE system_events SET status = 'FAILED', error_message = ?, retry_count = retry_count + 1 WHERE id = ?")
        .bind(String(error), eventId).run();
    }
  }
}

// ===========================================================================
// AGENTES AUTÓNOMOS · SYSTEM VIGKRAKEN
// ===========================================================================

// AGENT_B · CRM: Escucha LEAD_CREADO
async function runAgentB_CRM(env, event) {
  if (event.event_type !== 'LEAD_CREADO') return;
  
  const payload = JSON.parse(event.payload_json);
  const folio = event.aggregate_id;
  const marca = event.marca;
  
  // Verificar completitud del lead
  const lead = await env.DB.prepare("SELECT folio, telefono_norm, email FROM crm_prospects WHERE folio = ?").bind(event.aggregate_id).first();
  
  if (!lead || !lead.telefono_norm || !lead.email) {
    // Lead incompleto - generar tarea de seguimiento
    await env.DB.prepare(
      `INSERT INTO agent_tasks(id, agent_id, event_id, task_type, payload_json, status, priority, created_at)
       VALUES(?,?,?,?,?,'PENDING',50,?)`
    ).bind(crypto.randomUUID(), 'AGENT_B_CRM', event.id, 'VERIFICAR_DATOS_LEAD', 
           JSON.stringify({ folio, missing: !lead.telefono_norm ? 'telefono' : 'email' }), 
           new Date().toISOString()).run();
    
    // Registrar en bitacora
    await env.DB.prepare(
      `INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), event.marca, event.aggregate_id, 2, 1, 'ALERTA_DATOS_INCOMPLETOS', 'AGENT_B_CRM', 'AGENT_B_CRM', 
           JSON.stringify({ folio, missing: !lead.telefono_norm ? 'telefono' : 'email' }), 'GENESIS', 'PENDING', new Date().toISOString()).run();
  }
}

// AGENT_C · OPERACIONES: Escucha DIAGNOSTICO_LISTO
async function runAgentC_Operaciones(env, event) {
  if (event.event_type !== 'DIAGNOSTICO_LISTO') return;
  
  const payload = JSON.parse(event.payload_json);
  const folio = event.aggregate_id;
  const marca = event.marca;
  
  // Obtener diagnóstico para obtener zona/ciudad
  const diagnostico = await env.DB.prepare("SELECT * FROM diagnosticos WHERE folio = ? ORDER BY creado_at DESC LIMIT 1").bind(folio).first();
  if (!diagnostico) return;
  
  const diagData = JSON.parse(diagnostico.alcance_json || '{}');
  const ciudad = diagData.ciudad || payload?.ciudad || 'CDMX';
  
  // Buscar mejor aliado G0 en la ciudad con cupo
  const mes = new Date().toISOString().slice(0, 7);
  const aliado = await env.DB.prepare(
    `SELECT a.id, a.full_name, a.company, a.city, a.capacity_month, a.availability,
            (SELECT COUNT(*) FROM crm_prospects c WHERE c.ally_id=a.id AND date(c.ally_assigned_at)>=date('now','start of month'))+
            (SELECT COUNT(*) FROM referral_projects p WHERE p.assigned_ally_id=a.id AND date(p.assigned_at)>=date('now','start of month')) AS usados
     FROM aliados a 
     WHERE a.status IN ('G0_APROBADO','APROBADO_REFERIDOR') 
       AND a.referral_opt_in=1 
       AND a.capacity_month > 0
       AND a.availability != 'saturado'
       AND (a.city = ? OR a.city LIKE '%' || ? || '%')
       AND a.capacity_month > usados
     ORDER BY a.full_name LIMIT 1`
  ).bind(ciudad, ciudad).first();
  
  if (aliado) {
    // Asignar automáticamente
    const folio = event.aggregate_id;
    const ordenId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    await env.DB.batch([
      env.DB.prepare("INSERT INTO ordenes_trabajo(id, folio, marca, aliado_id, estado, creado_por, creado_at) VALUES(?,?,?,?,?,?,?)")
        .bind(crypto.randomUUID(), folio, event.marca, aliado.id, 'ASIGNADA', 'AGENT_C_AUTO', new Date().toISOString()),
      env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 6), ally_id = ?, ally_assigned_at = CURRENT_TIMESTAMP, updated_at = ? WHERE folio = ?")
        .bind(aliado.id, new Date().toISOString(), folio),
      env.DB.prepare("UPDATE aliados SET capacidad_usada_mes = capacidad_usada_mes + 1, mes_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(new Date().toISOString().slice(0,7), aliado.id),
      env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'asignacion:auto', new Date().toISOString()),
      env.DB.prepare("INSERT INTO capacidad_mensual(aliado_id, mes, capacidad_total, asignados) VALUES(?,?,?,1) ON CONFLICT(aliado_id, mes) DO UPDATE SET asignados = asignados + 1")
        .bind(aliado.id, new Date().toISOString().slice(0,7), 1)
    ]);
    
    // Disparar evento de asignación para que Finanzas continúe
    await emitEvent(env, {
      event_type: 'TRABAJO_ASIGNADO',
      aggregate_type: 'ORDER',
      aggregate_id: folio,
      marca: event.marca,
      payload_json: JSON.stringify({ folio, aliado_id: aliado.id, aliado_nombre: aliado.full_name }),
      correlation_id: folio
    });
  } else {
    // No hay aliado disponible - alerta Teléfono Rojo
    await env.DB.prepare(
      `INSERT INTO system_events(id, event_type, aggregate_type, aggregate_id, marca, payload_json, correlation_id, status, created_at)
       VALUES(?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), 'ALERTA_SIN_ALIADO', 'CASE', folio, event.marca, 
           JSON.stringify({ folio, ciudad, mensaje: 'No hay aliado G0 disponible con cupo' }), 
           folio, 'PENDING', new Date().toISOString()).run();
    
    // Log en Teléfono Rojo
    await env.DB.prepare(
      `INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), event.marca, folio, 11, 3, 'ALERTA_SIN_ALIADO', 'AGENT_C_OPERACIONES', 'AGENT_C_OPERACIONES', 
           JSON.stringify({ folio, ciudad, mensaje: 'No hay aliado G0 disponible con cupo' }), 'GENESIS', 'PENDING', new Date().toISOString()).run();
  }
}

// AGENT_D · FINANZAS: Escucha QA_APROBADO
async function runAgentD_Finanzas(env, event) {
  if (event.event_type !== 'QA_APROBADO') return;
  
  const payload = JSON.parse(event.payload_json);
  const folio = event.aggregate_id;
  const marca = event.marca;
  
  // Calcular comisión y actualizar estado financiero
  const qa = await env.DB.prepare("SELECT * FROM qa_instalacion WHERE folio = ? ORDER BY creado_at DESC LIMIT 1").bind(folio).first();
  if (!qa || qa.resultado !== 'APROBADO') return;
  
  const orden = await env.DB.prepare("SELECT * FROM ordenes_trabajo WHERE folio = ?").bind(folio).first();
  if (!orden) return;
  
  const aliado = await env.DB.prepare("SELECT id, full_name, commission_rate_bps FROM aliados WHERE id = ?").bind(orden.aliado_id).first();
  if (!aliado) return;
  
  const cotizacion = await env.DB.prepare("SELECT * FROM cotizaciones WHERE folio = ? ORDER BY creado_at DESC LIMIT 1").bind(folio).first();
  if (!cotizacion) return;
  
  const totalComisiones = Math.round(cotizacion.total_cents * (aliado.commission_rate_bps || 0) / 10000);
  
  // Registrar comisión
  await env.DB.prepare(
    `INSERT INTO comisiones(id, folio, marca, tipo, beneficiario_id, monto_cents, moneda, base_calculo_cents, porcentaje_pct, estado, creado_at)
     VALUES(?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(crypto.randomUUID(), folio, event.marca, 'ALIADO', aliado.id, totalComisiones, 'MXN', cotizacion.total_cents, aliado.commission_rate_bps || 0, 'PENDIENTE', new Date().toISOString()).run();
  
  // Cerrar expediente si todo está listo
  const cierreId = crypto.randomUUID();
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO cierres(id, folio, marca, qa_aprobado, cobro_id, total_comisiones_cents, estado, cerrado_por, cerrado_at)
       VALUES(?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), folio, event.marca, 1, null, 0, 'CERRADA', 'AGENT_D_AUTO', new Date().toISOString()),
    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = 8, status = 'CERRADA', updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), folio),
    env.DB.prepare("UPDATE ordenes_trabajo SET estado = 'APROBADA', fecha_fin = ?, updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), new Date().toISOString(), folio),
    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'cierre:auto', new Date().toISOString()),
    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), event.marca, folio, 20, 8, 'CIERRE_FINANCIERO_AUTO', 'AGENT_D_FINANZAS', 'AGENT_D_FINANZAS', JSON.stringify({ folio, comisiones_cents: 0 }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);
}

// AGENT_E_NOCTURNO: Respuesta automática 21:00-09:00
async function runAgentE_Nocturno(env, event) {
  if (event.event_type !== 'LEAD_CREADO') return;
  
  const now = new Date();
  const hora = now.getHours();
  
  // Solo actuar en horario nocturno (21:00 - 09:00)
  if (hora >= 9 && hora < 21) return;
  
  const payload = JSON.parse(event.payload_json);
  const folio = event.aggregate_id;
  
  // Verificar si ya hay respuesta automática
  const existing = await env.DB.prepare("SELECT 1 FROM system_events WHERE event_type = 'RESPUESTA_NOCTURNA' AND correlation_id = ?").bind(event.correlation_id).first();
  if (existing) return;
  
  // Enviar respuesta automática (simulada - en producción enviaría WhatsApp/Email)
  await env.DB.prepare(
    `INSERT INTO system_events(id, event_type, aggregate_type, aggregate_id, marca, payload_json, correlation_id, status, created_at)
     VALUES(?,?,?,?,?,?,?,?,?)`
  ).bind(crypto.randomUUID(), 'RESPUESTA_NOCTURNA', 'LEAD', event.aggregate_id, event.marca, 
         JSON.stringify({ folio: event.aggregate_id, mensaje: 'Hemos recibido tu solicitud. Un humano te contactará a las 9 AM.' }), 
         event.correlation_id, 'COMPLETED', new Date().toISOString()).run();
  
  // Log
  await env.DB.prepare(
    `INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at)
     VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(crypto.randomUUID(), event.marca, event.aggregate_id, 1, 1, 'RESPUESTA_NOCTURNA', 'AGENT_E_NOCTURNO', 'AGENT_E_NOCTURNO', 
         JSON.stringify({ folio: event.aggregate_id, mensaje: 'Respuesta automática enviada' }), 'GENESIS', 'PENDING', new Date().toISOString()).run();
}
// POST /api/v1/intake
// ===========================================================================
async function intakeV1(request, env, ctx) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);
  if (!(await limited(request, env))) return respond({ error: 'Demasiadas solicitudes' }, 429);

  let d; try { d = await bodyJson(request, 8000) } catch { return respond({ error: 'JSON inválido' }, 400) }

  const marcaCheck = requireMarca(d, request.headers);
  if (marcaCheck.error) return respond({ error: marcaCheck.error }, 400);
  const marca = marcaCheck.marca;

  const canal = norm(d.canal, 20).toLowerCase();
  if (!['web', 'whatsapp', 'telefono'].includes(canal)) return respond({ error: 'Canal inválido' }, 422);

  if (canal === 'web') {
    if (!env.TURNSTILE_SECRET || !env.TURNSTILE_SITE_KEY) return respond({ error: 'Turnstile no configurado' }, 503);
    if (!(await validateTurnstile(request, env, norm(d.turnstile_token, 300)))) return respond({ error: 'Turnstile inválido' }, 403);
  } else {
    const supplied = request.headers.get('X-Intake-Token') || request.headers.get('Authorization') || '';
    const candidate = supplied.startsWith('Bearer ') ? supplied.slice(7) : supplied;
    if (!env.INTAKE_API_TOKEN) return respond({ error: 'Integración no configurada' }, 503);
    if (!safeSame(candidate, env.INTAKE_API_TOKEN)) return respond({ error: 'No autorizado' }, 401);
  }

  const telefono_raw = norm(d.telefono, 30);
  const telefono_norm = telefono_raw.replace(/\D/g, '');
  if (telefono_norm.length < 7 && d.canal !== 'voz') return respond({ error: 'Teléfono inválido' }, 422);

  const nombre = norm(d.nombre, 120);
  if (nombre.length < 2) return respond({ error: 'Nombre requerido' }, 422);

  const necesidad = norm(d.necesidad, 1000);
  if (necesidad.length < 3) return respond({ error: 'Necesidad requerida' }, 422);

  const consentimiento_dado = d.consentimiento === true;
  if (!consentimiento_dado) return respond({ error: 'Consentimiento requerido' }, 422);

  // Deduplicación por teléfono + marca (telefono_norm ya definido arriba)
  const existing = await env.DB.prepare(
    `SELECT folio FROM crm_prospects WHERE telefono_norm = ? AND marca = ? AND estado NOT IN ('CERRADA','CANCELADA') LIMIT 1`
  ).bind(telefono_norm, marca).first();

  if (existing) {
    await env.DB.prepare(
      `UPDATE crm_prospects SET consentimiento_id = ?, updated_at = CURRENT_TIMESTAMP WHERE folio = ?`
    ).bind(d.consentimiento_id || null, existing.folio).run();
    await auditLog(env, { marca, folio: existing.folio, componenteId: 2, etapa: 2, accion: 'INTAKE_DEDUP', actorTipo: 'SISTEMA', actorId: 'INTAKE_V1', detalle: { canal, deduplicado: true } });
    return respond({ folio: existing.folio, deduplicado: true, etapa: 1 });
  }

  const folio = `${marca === 'PLUVIAM' ? 'PLV' : 'HME'}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
  const accessToken = crypto.randomUUID() + '-' + crypto.randomUUID();
  const consentId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO lead_cases(folio, access_hash, name, email, phone, segment, city, roof, objective, storage, usage, timeframe, rainfall, efficiency, preferred_payment, monthly_expense_mxn, consent_version, consent_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(folio, await hash(accessToken), d.nombre || 'Cliente', d.email || null, d.telefono || null, d.segment || 'general', d.city || 'CDMX', d.roof || 100, d.necesidad || 'Necesidad no especificada', d.storage || 'cisterna', d.uses || 'riego', d.timing || 'flexible', 800, 0.75, d.payment || 'por_definir', 0, env.CONSENT_VERSION || 'v1', new Date().toISOString()),

    env.DB.prepare(
      `INSERT INTO consentimientos(id, folio, marca, canal_id, telefono_normalizado, nombre, necesidad, consentimiento_dado, version_consentimiento, created_at)
       VALUES(?,?,?,?,?,?,?,1,?,?)`
    ).bind(crypto.randomUUID(), folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', d.canal, telefono_norm, d.nombre || 'Cliente', d.necesidad || 'Necesidad no especificada', env.CONSENT_VERSION || 'v1', new Date().toISOString()),

    env.DB.prepare(
      `INSERT INTO crm_prospects(folio, marca, acquisition_source, acquisition_detail, is_synthetic, next_action, etapa_actual, canal_origen, telefono_norm, consentimiento_id)
       VALUES(?,?,?,?,0,'Registro inicial',1,?,?,?)`
    ).bind(folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', d.source || d.canal, d.detail || null, 1, d.canal, d.telefono ? d.telefono.replace(/\D/g, '') : '', crypto.randomUUID()),

    env.DB.prepare(`INSERT INTO memoria_relacion(id, telefono_norm, marca, ultimo_folio, total_interacciones, ultima_interaccion, created_at, updated_at)
       VALUES(?,?,?,?,1,?,?,?)
       ON CONFLICT(telefono_norm, marca) DO UPDATE SET ultimo_folio=excluded.folio, total_interacciones=total_interacciones+1, ultima_interaccion=excluded.ultima_interaccion, updated_at=excluded.updated_at`)
      .bind(crypto.randomUUID(), telefono_norm, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()),

    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'intake:created', new Date().toISOString())
  ]);

  // Emitir evento LEAD_CREADO para activar agentes autónomos
  await emitEvent(env, ctx, {
    event_type: 'LEAD_CREADO',
    aggregate_type: 'LEAD',
    aggregate_id: folio,
    marca: marca,
    payload_json: JSON.stringify({ folio, marca, canal, nombre: d.nombre, telefono: telefono_norm, necesidad: d.necesidad }),
    correlation_id: folio
  });

  return respond({ folio, accessToken: crypto.randomUUID() + '-' + crypto.randomUUID(), etapa: 1, deduplicado: false }, 201);
}

// ===========================================================================
// ETAPA 3: DIAGNÓSTICO (Sistemas B + C)
// POST /api/v1/cases/:folio/diagnostico
// ===========================================================================
async function diagnosticoV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/diagnostico')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 5000).catch(() => ({}));

  const tecnico_id = norm(d.tecnico_id, 80);
  const notas = norm(d.notas, 5000);
  const alcance = d.alcance ? JSON.stringify(d.alcance) : null;
  const evidencias = d.evidencias ? JSON.stringify(d.evidencias) : null;
  const creado_por = norm(d.creado_por, 50) || 'tecnico';

  if (!d.tecnico_id) return respond({ error: 'tecnico_id requerido' }, 422);

  const diagId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO diagnosticos(id, folio, marca, tecnico_id, notas, alcance_json, evidencias_json, creado_por, creado_at, actualizado_at)
       VALUES(?,?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', d.tecnico_id, d.notas || null, d.alcance ? JSON.stringify(d.alcance) : null, d.evidencias ? JSON.stringify(d.evidencias) : null, d.creado_por || 'tecnico', now, now),

    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 3), updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), folio),

    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'diagnostico:created', new Date().toISOString()),

    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 6, 3, 'DIAGNOSTICO', 'TECNICO', d.tecnico_id, JSON.stringify({ notas: d.notas, alcance: d.alcance }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);

  // Emitir evento DIAGNOSTICO_LISTO para activar agente de operaciones
  await emitEvent(env, ctx, {
    event_type: 'DIAGNOSTICO_LISTO',
    aggregate_type: 'CASE',
    aggregate_id: folio,
    marca: marca,
    payload_json: JSON.stringify({ folio, tecnico_id: d.tecnico_id, notas: d.notas, alcance: d.alcance }),
    correlation_id: folio
  });

  return respond({ ok: true, diagnostico_id: crypto.randomUUID() });
}

// ===========================================================================
// ETAPA 4: COTIZACIÓN (Sistemas B + D)
// POST /api/v1/cases/:folio/cotizacion
// ===========================================================================
async function cotizacionV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/cotizacion')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 5000).catch(() => ({}));

  const items = Array.isArray(d.items) ? d.items : [];
  if (!items.length) return respond({ error: 'Al menos un item requerido' }, 422);

  let subtotal = 0;
  for (const it of d.items) {
    const cat = await env.DB.prepare('SELECT id, costo_unitario_cents FROM catalog_items WHERE id = ? AND marca = ? AND activo = 1').bind(it.catalog_id, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME').first();
    if (!cat) return respond({ error: `Ítem no encontrado: ${it.catalog_id}` }, 422);
    const qty = Math.max(1, Number(it.qty) || 1);
    const costo = cat.costo_unitario_cents * qty;
    const precio = Math.round(costo * 1.30);
    subtotal += precio;
  }

  const total = subtotal;
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO cotizaciones(id, folio, marca, version, items_json, subtotal_cents, margen_pct, total_cents, moneda, estado, creado_por, creado_at)
       VALUES(?,?,?,1,?,?,0.30,?,'MXN','BORRADOR','admin',?)`
    ).bind(crypto.randomUUID(), folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', '[]', subtotal, subtotal, new Date().toISOString()),

    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 4), updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), folio),

    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'cotizacion:created', new Date().toISOString()),

    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 9, 4, 'COTIZACION', 'ADMIN', 'admin', JSON.stringify({ items: 0, total: subtotal }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);

  return respond({ ok: true, cotizacion_id: crypto.randomUUID(), total_cents: subtotal, items: 0 });
}

// ===========================================================================
// ETAPA 5: AUTORIZACIÓN (STUB)
// POST /api/v1/cases/:folio/autorizacion
// ===========================================================================
async function autorizacionV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/autorizacion')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 3000).catch(() => ({}));

  const aceptacionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const cotizacionId = d.cotizacion_id || crypto.randomUUID();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO aceptaciones(id, cotizacion_id, folio, metodo_pago, referencia_pago, estado, webhook_stripe_id, creado_at)
       VALUES(?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), cotizacionId, folio, d.metodo_pago || 'stripe', d.referencia || null, 'PENDIENTE', d.webhook_id || null, now),

    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 5), updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), folio),
    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 10, 5, 'AUTORIZACION_STUB', 'SISTEMA', 'stub', JSON.stringify({ metodo_pago: d.metodo_pago }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);

  return respond({ ok: true, aceptacion_id: crypto.randomUUID(), mensaje: 'STUB: Autorización pendiente de integración con Stripe (Etapa 5)' });
}

// ===========================================================================
// ETAPA 6: ORDEN Y ASIGNACIÓN (Sistema C)
// POST /api/v1/cases/:folio/asignar
// ===========================================================================
async function asignarV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/asignar')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 3000).catch(() => ({}));

  const aliado_id = norm(d.aliado_id, 80);
  const suplente_id = norm(d.suplente_id, 80) || null;

  if (!d.aliado_id) return respond({ error: 'aliado_id requerido' }, 422);

  const aliado = await env.DB.prepare("SELECT id, status, capacity_month, availability FROM aliados WHERE id = ? AND is_synthetic = 0").bind(d.aliado_id).first();
  if (!aliado) return respond({ error: 'Aliado no encontrado' }, 404);
  if (!['G0_APROBADO', 'APROBADO_REFERIDOR'].includes(aliado.status)) return respond({ error: 'Aliado sin G0 aprobado' }, 403);
  if ((aliado.capacity_month || 0) <= 0 || aliado.availability === 'saturado') return respond({ error: 'Aliado sin cupo' }, 403);

  const mes = new Date().toISOString().slice(0, 7);
  const capacidad = await env.DB.prepare("SELECT capacidad_total, asignados FROM capacidad_mensual WHERE aliado_id = ? AND mes = ?").bind(d.aliado_id, new Date().toISOString().slice(0,7)).first();
  const totalCap = Number(capacidad?.capacidad_total) || 0;
  const asignados = Number(capacidad?.asignados) || 0;
  if (totalCap > 0 && asignados >= totalCap) return respond({ error: 'Aliado sin cupo este mes' }, 403);

  if (d.suplente_id) {
    const sup = await env.DB.prepare("SELECT id, status FROM aliados WHERE id = ? AND is_synthetic = 0").bind(d.suplente_id).first();
    if (!sup) return respond({ error: 'Suplente no encontrado' }, 404);
    if (!['G0_APROBADO', 'APROBADO_REFERIDOR'].includes(sup.status)) return respond({ error: 'Suplente sin G0 aprobado' }, 403);
  }

  const ordenId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO ordenes_trabajo(id, folio, marca, aliado_id, suplente_id, estado, checkpoints_json, creado_por, creado_at)
       VALUES(?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', d.aliado_id, d.suplente_id || null, 'ASIGNADA', d.checkpoints ? JSON.stringify(d.checkpoints) : null, 'admin', new Date().toISOString()),

    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 6), ally_id = ?, ally_assigned_at = CURRENT_TIMESTAMP, updated_at = ? WHERE folio = ?").bind(d.aliado_id, new Date().toISOString(), folio),

    env.DB.prepare("UPDATE aliados SET capacidad_usada_mes = capacidad_usada_mes + 1, mes_actual = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(new Date().toISOString().slice(0,7), d.aliado_id),

    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'asignacion:created', new Date().toISOString()),

    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 13, 6, 'ASIGNACION', 'ADMIN', 'admin', JSON.stringify({ aliado_id: d.aliado_id, suplente_id: d.suplente_id }), 'GENESIS', 'PENDING', new Date().toISOString()),

    env.DB.prepare("INSERT INTO capacidad_mensual(aliado_id, mes, capacidad_total, asignados) VALUES(?,?,?,1) ON CONFLICT(aliado_id, mes) DO UPDATE SET asignados = asignados + 1")
      .bind(d.aliado_id, new Date().toISOString().slice(0,7), 1)
  ]);

  return respond({ ok: true, orden_id: crypto.randomUUID(), aliado_id: d.aliado_id, estado: 'ASIGNADA' });
}

// ===========================================================================
// ETAPA 7: INSTALACIÓN + QA (Sistemas C + D)
// POST /api/v1/cases/:folio/qa
// ===========================================================================
async function qaV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/qa')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 5000).catch(() => ({}));

  const orden = await env.DB.prepare("SELECT id, aliado_id FROM ordenes_trabajo WHERE folio = ? AND estado IN ('ASIGNADA','EN_CURSO','QA_PENDIENTE')").bind(folio).first();
  if (!orden) return respond({ error: 'No hay orden activa para este folio' }, 404);

  const resultado = norm(d.resultado, 30).toUpperCase();
  if (!['APROBADO', 'RECHAZADO', 'PENDIENTE_REVISION'].includes(d.resultado?.toUpperCase())) return respond({ error: 'Resultado inválido' }, 422);

  const observaciones = norm(d.observaciones, 1200);
  const revisado_por = norm(d.revisado_por, 50) || 'aliado';

  const qaId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Secuencial para evitar límite CPU (error 1101)
  await env.DB.prepare(
    `INSERT INTO qa_instalacion(id, folio, orden_id, aliado_id, evidencias_json, resultado, observaciones, revisado_por, creado_at, revisado_at)
     VALUES(?,?,?,?,?,?,?,?,?,?)`
  ).bind(crypto.randomUUID(), folio, orden.id, orden.aliado_id, d.evidencias ? JSON.stringify(d.evidencias) : null, d.resultado?.toUpperCase(), norm(d.observaciones, 1200), d.revisado_por || 'aliado', now, d.resultado === 'APROBADO' ? now : null).run();

  await env.DB.prepare("UPDATE ordenes_trabajo SET estado = ?, updated_at = ? WHERE id = ?").bind(d.resultado === 'APROBADO' ? 'APROBADA' : 'QA_PENDIENTE', now, orden.id).run();

  await env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 7), updated_at = ? WHERE folio = ?").bind(now, folio).run();

  await env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'qa:' + d.resultado.toLowerCase(), now).run();

  await env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(crypto.randomUUID(), marca, folio, 18, 7, 'QA_INSTALACION', 'ALIADO', d.aliado_id || 'desconocido', JSON.stringify({ resultado: d.resultado, observaciones: d.observaciones }), 'GENESIS', 'PENDING', now).run();

  if (d.resultado === 'APROBADO') {
    await env.DB.prepare("UPDATE crm_prospects SET etapa_actual = MAX(etapa_actual, 8), updated_at = ? WHERE folio = ?").bind(now, folio).run();
  }

  // Emitir evento para activar agentes autónomos
  await emitEvent(env, ctx, {
    event_type: 'QA_APROBADO',
    aggregate_type: 'CASE',
    aggregate_id: folio,
    marca: marca,
    payload_json: JSON.stringify({ folio, resultado: d.resultado, qa_id: qaId }),
    correlation_id: folio
  });

  return respond({ ok: true, qa_id: crypto.randomUUID(), resultado: d.resultado, folio });
}

// ===========================================================================
// ETAPA 8: CIERRE FINANCIERO (Sistema D)
// POST /api/v1/cases/:folio/cierre
// ===========================================================================
async function cierreV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/cierre')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 3000).catch(() => ({}));

  const qa = await env.DB.prepare("SELECT resultado FROM qa_instalacion WHERE folio = ? ORDER BY creado_at DESC LIMIT 1").bind(folio).first();
  if (!qa || qa.resultado !== 'APROBADO') return respond({ error: 'QA no aprobado. No se puede cerrar sin QA aprobado.' }, 409);

  const cobro = d.cobro_id ? await env.DB.prepare("SELECT id, monto_cents, estado FROM cobros WHERE id = ? AND folio = ?").bind(d.cobro_id, folio).first() : null;
  if (!cobro || cobro.estado !== 'CONCILIADO') return respond({ error: 'Cobro no conciliado. Registre y concilie el cobro antes de cerrar.' }, 409);

  const comisiones = await env.DB.prepare("SELECT id, tipo, beneficiario_id, monto_cents, estado FROM comisiones WHERE folio = ? AND estado = 'PENDIENTE'").bind(folio).all();
  let totalComisiones = 0;
  for (const c of (comisiones.results || [])) {
    totalComisiones += Number(c.monto_cents) || 0;
    await env.DB.prepare("UPDATE comisiones SET estado = 'APROBADA', pagado_at = CURRENT_TIMESTAMP WHERE id = ?").bind(c.id).run();
  }

  const cierreId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO cierres(id, folio, marca, qa_aprobado, cobro_id, total_comisiones_cents, estado, cerrado_por, cerrado_at)
       VALUES(?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), folio, folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', 1, d.cobro_id, totalComisiones, 'CERRADA', 'admin', new Date().toISOString()),

    env.DB.prepare("UPDATE crm_prospects SET etapa_actual = 8, status = 'CERRADA', updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), folio),

    env.DB.prepare("UPDATE ordenes_trabajo SET estado = 'APROBADA', fecha_fin = ?, updated_at = ? WHERE folio = ?").bind(new Date().toISOString(), new Date().toISOString(), folio),

    env.DB.prepare("INSERT INTO admin_events(event_id, folio, action, recorded_at) VALUES(?,?,?,?)").bind(crypto.randomUUID(), folio, 'cierre:financiero', new Date().toISOString()),

    env.DB.prepare("INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)")
      .bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 20, 8, 'CIERRE_FINANCIERO', 'ADMIN', 'admin', JSON.stringify({ cobro_id: d.cobro_id, total_comisiones_cents: totalComisiones }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);

  return respond({ ok: true, cierre_id: crypto.randomUUID(), folio, total_comisiones_mxn: totalComisiones / 100 });
}

// ===========================================================================
// ETAPA 9: CARE / POSVENTA (STUB)
// POST /api/v1/cases/:folio/care
// ===========================================================================
async function careV1(request, env) {
  if (request.method !== 'POST') return respond({ error: 'Método no permitido' }, 405);
  if (!env.DB) return respond({ error: 'D1 no configurada' }, 503);

  const path = new URL(request.url).pathname;
  const folio = path.split('/cases/')[1]?.split('/care')[0];
  if (!/^(PLV|HME)-[A-Z0-9-]{8,46}$/.test(folio)) return respond({ error: 'Folio inválido' }, 422);

  const marca = folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME';
  const d = await bodyJson(request, 3000).catch(() => ({}));

  const careId = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO bitacora_auditoria(id, marca, folio, componente_id, etapa, accion, actor_tipo, actor_id, detalle_json, prev_hash, hash, creado_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(crypto.randomUUID(), folio.startsWith('PLV') ? 'PLUVIAM' : 'HI_HOME', folio, 22, 9, 'CARE_STUB', 'SISTEMA', 'stub', JSON.stringify({ tipo: d.tipo || 'garantia', descripcion: d.descripcion }), 'GENESIS', 'PENDING', new Date().toISOString())
  ]);

  return respond({ ok: true, care_id: crypto.randomUUID(), mensaje: 'STUB: Care/Posventa preparado para Etapa 9 (garantías, mantenimientos, encuestas)' });
}

export default {async fetch(request,env,ctx){const path=new URL(request.url).pathname;if(path==='/_worker.js'||path==='/_worker.js.map')return new Response('Not found',{status:404});/* Cloudflare Pages canoniza contacto.html a /contacto. Nunca redirigir /contacto de regreso a .html o crearía un bucle. */const legacy={'/calculadora/':'/#experience','/calculadora':'/#experience','/nosotros/':'/','/nosotros':'/','/recorrido/':'/academia.html','/recorrido':'/academia.html','/empresas/':'/industrial/','/empresas':'/industrial/','/arquitectos/':'/colaborar/','/arquitectos':'/colaborar/','/revive/':'/hi-care/','/revive':'/hi-care/','/colaborar':'/waternet/','/colaborar/':'/waternet/','/store':'/store/'};if(Object.hasOwn(legacy,path))return Response.redirect(new URL(legacy[path],request.url).href,301);if((path==='/admin.html'||path.startsWith('/admin/'))&&!(await privateAdminPage(request,env)))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});/* Serve only the static portal shell here. The API checks the signed Access identity and active membership before returning profile data or accepting writes. */if(path.startsWith('/waternet/portal')&&!betaPreviewEnabled(env))return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});if(path==='/colaborar/mi-beehive/')return Response.redirect(new URL('/waternet/portal/',request.url).href,302);if(!path.startsWith('/api/'))return serveAsset(request,env);if(!originAllowed(request))return respond({error:'Origen no autorizado'},403);
 if(path.startsWith('/api/vgk/'))return await vigkrakenApi(request,env,path);

  // --- 7 ETAPAS endpoints ---
  if(path.startsWith('/api/v1/')) {
    const p = new URL(request.url).pathname;
    if(p.startsWith('/api/v1/intake') && request.method==='POST') return await intakeV1(request,env,ctx);
    const m = p.match(/^\/api\/v1\/cases\/([^\/]+)\/(diagnostico|cotizacion|asignar|qa|cierre|care|autorizacion)$/);
    if(m && request.method==='POST') {
      const folio = m[1];
      const action = m[2];
      if(action==='diagnostico') return await diagnosticoV1(request,env);
      if(action==='cotizacion') return await cotizacionV1(request,env);
      if(action==='asignar') return await asignarV1(request,env);
      if(action==='qa') return await qaV1(request,env);
      if(action==='cierre') return await cierreV1(request,env);
      if(action==='care') return await careV1(request,env);
      if(action==='autorizacion') return await autorizacionV1(request,env);
      return respond({error:'Acción no soportada'},404);
    }
  }


 try{
  if(founderOsApiPaths.has(path)&&!(await founderOsSchemaReady(env)))return respond({error:'Migración Preview Founder OS pendiente; las rutas están desactivadas hasta aplicar 018_founder_os_intake_operations.sql.'},503);
  const avianyResponse=await handleAvianyRequest(request,env,path,{admin,bodyJson,norm,respond,validateTurnstile,limited});
  if(avianyResponse)return avianyResponse;
  if(path.startsWith('/api/hihome/'))return await hihomeApi(request,env,path);
  if(path==='/api/webhooks/whatsapp')return await whatsappWebhook(request,env);
  if(path==='/api/webhooks/twilio')return await twilioWebhook(request,env);
  if(path==='/api/intake'&&request.method==='POST')return await intakeApi(request,env);
  if(path==='/api/intake/voz-mock')return await voiceMockApi(request,env);
  if(path==='/api/admin/match')return await adminMatchApi(request,env);
  if(path==='/api/admin/asignar')return await adminAssignApi(request,env,ctx);
  if(path==='/api/admin/proyectos/estado')return await adminProjectStateApi(request,env);
  if(path==='/api/admin/cotizar')return await adminQuoteApi(request,env);
  if(path==='/api/admin/analytics')return await adminAnalyticsApi(request,env);
  if(path==='/api/aliado/portal/otp')return await requestAllyOtp(request,env);
  if(path==='/api/aliado/portal/login')return await loginAllyPortal(request,env);
  if(path==='/api/aliado/dashboard')return await allyDashboardApi(request,env);
  if(path==='/api/tienda'&&request.method==='GET')return await tiendaApi(request,env);
  if(path==='/api/aliados/registro'&&request.method==='POST')return await allyRegistrationApi(request,env);
  if(path==='/api/referidos/crear'&&request.method==='POST')return await referralCreateApi(request,env);
  if(path==='/api/admin/referidos'&&request.method==='GET')return await adminReferralsApi(request,env);
  if(path==='/api/pagos/crear'&&request.method==='POST')return await productOrderApi(request,env);
  if(path==='/api/admin/verificar-pago'&&request.method==='GET')return await verifyProductPedido(request,env);
  if(path.startsWith('/api/beta/'))return await handleBetaRequest(request,env,path);
  if(path==='/api/waternet/invitations/accept'&&request.method==='POST')return await acceptWaternetInvite(request,env);
  if(path==='/api/beehive/invitations/accept'&&request.method==='POST')return await acceptBeeehiveInvite(request,env);
  if(path.startsWith('/api/waternet/'))return await waternetApi(request,env,'/api/beehive/'+path.slice('/api/waternet/'.length));if(path.startsWith('/api/beehive/'))return await waternetApi(request,env,path);
  if(path==='/api/estado'&&request.method==='GET'){const databaseReady=await schemaReady(env),accepting=gate(env)&&databaseReady,alliesAccepting=allyGate(env)&&await allySchemaReady(env),payments=payGate(env)&&databaseReady&&await paymentSchemaReady(env);return respond({backend:true,accepting,turnstile:!!env.TURNSTILE_SITE_KEY,turnstileSiteKey:accepting?env.TURNSTILE_SITE_KEY:null,alliesAccepting,alliesTurnstileSiteKey:alliesAccepting?env.TURNSTILE_SITE_KEY:null,payments,crypto:payments&&cryptoConfigured(env),drafts:!!(env.DB&&privacyReady(env)&&env.DRAFTS_ENABLED==='true'),whatsAppNumber:/^[1-9]\d{9,14}$/.test(env.PUBLIC_WHATSAPP_NUMBER||'')?env.PUBLIC_WHATSAPP_NUMBER:null})}
  if(path==='/api/jobs/reintentar-alertas'&&request.method==='POST'){const auth=request.headers.get('Authorization')||'';if(!env.JOBS_TOKEN||!safeSame(auth,'Bearer '+env.JOBS_TOKEN))return respond({error:'No autorizado'},403);return respond({ok:true,...await retryLeadAlerts(env)});}
  if(path==='/api/borrador'&&request.method==='POST')return await saveDraft(request,env);
  if(path==='/api/borrador/borrar'&&request.method==='POST')return await deleteDraft(request,env);
  if(path==='/api/diagnostico'&&request.method==='POST')return await publicDiagnosis(request);
  if(path==='/api/solicitudes'&&request.method==='POST')return await newLead(request,env,ctx);
  if(path==='/api/aliados'&&request.method==='POST')return await newAlly(request,env);
  if(path==='/api/proyecto'&&request.method==='POST')return await project(request,env);
  if(path==='/api/contrato/aceptar'&&request.method==='POST')return await acceptOffer(request,env);
  if(path==='/api/propuesta/pdf'&&request.method==='POST')return await proposalPdf(request,env);
  if(path==='/api/lead-abandonment'&&request.method==='POST')return await retellCustomerApi(request,env,{identity,quoteExpired});
  if(path==='/api/admin/salud'&&request.method==='GET'){
   if(!admin(request,env))return respond({error:'No autorizado'},403);
   const schemaInfo=await schemaDiagnostic(env),schema=schemaInfo.state==='operational';
   const turnstileConfigured=!!(env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY),emailConfigured=!!(env.RESEND_API_KEY&&env.RESEND_FROM&&env.OPERATIONS_EMAIL),paymentSchema=!!(env.DB&&await paymentSchemaReady(env)),payments=payGate(env)&&paymentSchema,bbva=await bankReady(env),customerEmail=env.CUSTOMER_EMAIL_ENABLED==='true'&&env.CUSTOMER_EMAIL_GO_APPROVED==='true';
   const checks={baseD1:!!env.DB,esquemaD1:schema,turnstile:turnstileConfigured,avisoAprobado:privacyReady(env),recepcionActiva:gate(env)&&schema,correoConfigurado:emailConfigured,reintentoCorreo:!!env.JOBS_TOKEN,pagosHabilitados:payments,goComercialAprobado:env.COMMERCE_GO_APPROVED==='true',bbvaVerificado:bbva,notificacionClienteHabilitada:customerEmail};
   const diagnostics={
    baseD1:schemaInfo,esquemaD1:schemaInfo,
    turnstile:turnstileConfigured?{state:'configured',label:'Configurado; se valida al recibir',reason:'La validación server-side ocurre con cada solicitud.'}:{state:'missing',label:'Ausente',reason:'Faltan las variables efectivas de Turnstile.'},
    avisoAprobado:privacyReady(env)?{state:'approved',label:'Aprobado',reason:'LEGAL_APPROVED está activo en este entorno.'}:{state:'founder_review',label:'Requiere aprobación',reason:'No se habilita recepción sin aprobación legal registrada.'},
    recepcionActiva:checks.recepcionActiva?{state:'operational',label:'Operativa',reason:'D1, esquema, Turnstile, aviso y recepción están listos.'}:env.LEADS_ENABLED!=='true'?{state:'disabled',label:'Desactivada',reason:'LEADS_ENABLED no está activo.'}:{state:'blocked',label:'Bloqueada por dependencias',reason:'Una o más conexiones obligatorias no están listas.'},
    correoConfigurado:emailConfigured?{state:'configured',label:'Configurado',reason:'Proveedor, remitente y correo operativo están presentes; no implica entregabilidad validada.'}:{state:'missing',label:'Ausente o incompleto',reason:'Falta proveedor, remitente o correo operativo.'},
    reintentoCorreo:env.JOBS_TOKEN?{state:'configured',label:'Configurado',reason:'Existe autorización para reintentos controlados.'}:{state:'disabled',label:'Desactivado',reason:'No se reanudan reintentos salientes sin autorización.'},
    pagosHabilitados:payments?{state:'operational',label:'Habilitados',reason:'Las aprobaciones, esquema y proveedor requerido están listos.'}:env.PAYMENTS_ENABLED!=='true'?{state:'disabled',label:'Desactivados por política',reason:'No se crean cobros mientras PAYMENTS_ENABLED esté OFF.'}:{state:'blocked',label:'Bloqueados por dependencias',reason:'Faltan aprobaciones, esquema contractual o credenciales verificadas.'},
    goComercialAprobado:env.COMMERCE_GO_APPROVED==='true'?{state:'approved',label:'Aprobado',reason:'Aprobación comercial presente en este entorno.'}:{state:'founder_review',label:'Requiere aprobación',reason:'No se habilitan cobros por la sola presencia de credenciales.'},
    bbvaVerificado:bbva?{state:'operational',label:'Verificado',reason:'Cuenta, titular, CLABE y migración de conciliación responden.'}:env.BANK_PAYMENT_ENABLED==='true'?{state:'founder_review',label:'Requiere verificación',reason:'La cuenta bancaria no puede darse por validada sin evidencia independiente.'}:{state:'disabled',label:'Desactivado',reason:'El método bancario está OFF.'},
    notificacionClienteHabilitada:customerEmail?{state:'configured',label:'Configurada',reason:'La política de correo a cliente está habilitada.'}:{state:'disabled',label:'Desactivada',reason:'No se reanudan notificaciones salientes sin aprobación y proveedor verificado.'}
   };
   return respond({registroListo:gate(env)&&schema,checks,diagnostics});
  }
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
  if(path==='/api/admin/aliados'&&request.method==='GET')return await adminAllies(request,env);
  if(path.startsWith('/api/admin/aliados/'))return await adminAllyDetail(request,env,decodeURIComponent(path.slice('/api/admin/aliados/'.length)));
  if(path.startsWith('/api/admin/waternet/'))return await waternetAdmin(request,env,'/api/admin/beehive/'+path.slice('/api/admin/waternet/'.length));if(path.startsWith('/api/admin/beehive/'))return await waternetAdmin(request,env,path);
  if(path==='/api/admin/crm/prospects'&&request.method==='GET')return await adminCrmList(request,env);
  if(path.startsWith('/api/admin/crm/prospects/')){const folio=decodeURIComponent(path.slice('/api/admin/crm/prospects/'.length));if(request.method==='GET'||request.method==='POST')return await adminCrmDetail(request,env,folio)}
  if(path.startsWith('/api/admin/')&&request.method==='POST')return await adminUpdate(request,env,path);
  if(path==='/api/checkout'&&request.method==='POST')return await checkout(request,env);
  if(path==='/api/brick/setup'&&request.method==='POST')return await brickSetup(request,env);
  if(path==='/api/brick/pay'&&request.method==='POST')return await brickPay(request,env);
  if(path==='/api/webhooks/stripe'&&request.method==='POST')return await stripeWebhook(request,env);
  if(path==='/api/webhooks/mercadopago'&&request.method==='POST')return await mpWebhook(request,env);
  if(path==='/api/webhooks/nowpayments'&&request.method==='POST')return await nowpaymentsWebhook(request,env);
  return respond({error:'Ruta API no encontrada'},404)
  }catch(e){if(path==='/api/aliados'||path.startsWith('/api/waternet/'))console.error('WATERNET API failure',{path,method:request.method,errorName:e?.name||'Error'});return respond({error:'No se pudo procesar la solicitud. Intenta más tarde.'},500)}
 }};
