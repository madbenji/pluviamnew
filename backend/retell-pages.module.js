/* PLUVIAM V51. Módulo adicional aislado; desactivado por defecto.
   Todos los datos de importes/cotización se consultan en backend, jamás del navegador. */
const VERSION='retell-followup-v1-2026-10-24';
const json=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const str=(v,n=200)=>typeof v==='string'?v.trim().slice(0,n):'';
function enabled(e){return e.RETELL_ENABLED==='true' && e.RETELL_LAUNCH_APPROVED==='true' && e.RETELL_PRIVACY_APPROVED==='true' && e.RETELL_COST_APPROVED==='true' && e.RETELL_MX_OUTBOUND_APPROVED==='true' && Number(e.RETELL_MAX_CALLS_PER_DAY)>0 && e.RETELL_API_KEY && e.RETELL_AGENT_ID && e.RETELL_PHONE_NUMBER && e.DB;}
async function exists(e){try{await e.DB.prepare('SELECT folio FROM retell_consents_v51 LIMIT 1').first();await e.DB.prepare('SELECT id FROM retell_followups_v51 LIMIT 1').first();return true;}catch{return false;}}
function phoneValid(v){return /^(?:\+52[1-9]\d{9}|[1-9]\d{9}|52[1-9]\d{9})$/.test(String(v||'').replace(/[ ()-]/g,''));} // enfoque inicial: México, no asumir códigos de país
async function read(req){const raw=await req.text();if(raw.length>3500)throw Error('Too large');return JSON.parse(raw);}
async function paid(e,quoteId){return !!(await e.DB.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid' LIMIT 1").bind(quoteId).first());}
export async function retellEligibility(env,folio,quote,expired){
 const base={enabled:false,eligible:false,consent:false,status:null,version:VERSION};
 if(!enabled(env)||!quote?.approved||expired||!quote.id||!await exists(env))return base;
 try{const consent=await env.DB.prepare('SELECT granted,revoked_at FROM retell_consents_v51 WHERE folio=?').bind(folio).first();const f=await env.DB.prepare('SELECT status FROM retell_followups_v51 WHERE quote_id=?').bind(quote.id).first();const hasPhone=await env.DB.prepare('SELECT phone FROM lead_cases WHERE folio=?').bind(folio).first();return {enabled:true,eligible:phoneValid(hasPhone?.phone)&&!await paid(env,quote.id),consent:consent?.granted===1&&!consent.revoked_at,status:f?.status||null,version:VERSION};}catch{return base;}
}
export async function retellCustomerApi(req,env,helpers){
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
 if(action!=='consent'||d.consent!==true||str(d.consentVersion)!==VERSION)return json({error:'Autorización expresa y versión vigente requeridas.'},422);
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
   env.DB.prepare("INSERT INTO retell_consents_v51(folio,granted,consent_version,granted_at,revoked_at,updated_at) VALUES(?,1,?,CURRENT_TIMESTAMP,NULL,CURRENT_TIMESTAMP) ON CONFLICT(folio) DO UPDATE SET granted=1,consent_version=excluded.consent_version,granted_at=CURRENT_TIMESTAMP,revoked_at=NULL,updated_at=CURRENT_TIMESTAMP").bind(folio,VERSION),
   env.DB.prepare("INSERT OR IGNORE INTO retell_followups_v51(id,folio,quote_id,status,scheduled_at) VALUES(?,?,?,'scheduled',?)").bind(id,folio,q.id,when)
  ]);
  const saved=await env.DB.prepare('SELECT id,status,scheduled_at FROM retell_followups_v51 WHERE quote_id=?').bind(q.id).first();return json({ok:true,status:saved.status,scheduledAt:saved.scheduled_at});
 }catch{return json({error:'No se pudo registrar la autorización; puedes conservar el PDF.'},503);}
}
// Cancelar llamadas pendientes cuando una conciliación REAL confirma el anticipo (operación idempotente).
export async function retellOnPaid(env,paymentAttemptId){
 if(!env.DB)return;
 try{await env.DB.prepare("UPDATE retell_followups_v51 SET status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE quote_id IN (SELECT quote_id FROM payment_attempts WHERE id=? AND stage='deposit' AND state='paid') AND status IN ('scheduled','deferred','claimed')").bind(paymentAttemptId).run();}catch(_){/* Si faltó la migración, la función de pagos permanece intacta. Cron vuelve a revisar el pago. */}
}
