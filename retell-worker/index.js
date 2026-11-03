/* PLUVIAM V51 · Worker CRON separado (sin dependencias).
 * Usa la misma D1 de PLUVIAM, RETELL_ENABLED=false por defecto.
 * Nunca crea folios, cotizaciones ni modifica payment_attempts.
 */
const reMexico=/^\+52[1-9]\d{9}$/;
function toMexicoPhone(value){const s=String(value||'').replace(/[ ()-]/g,'');if(/^\+52[1-9]\d{9}$/.test(s))return s;if(/^[1-9]\d{9}$/.test(s))return '+52'+s;if(/^52[1-9]\d{9}$/.test(s))return '+'+s;return null;}
function active(env){return env.RETELL_ENABLED==='true' && env.RETELL_LAUNCH_APPROVED==='true' && env.RETELL_COST_APPROVED==='true' && env.RETELL_MX_OUTBOUND_APPROVED==='true' && env.RETELL_PRIVACY_APPROVED==='true' && Boolean(env.DB && env.RETELL_API_KEY && env.RETELL_AGENT_ID && env.RETELL_PHONE_NUMBER) && /^\+[1-9]\d{7,14}$/.test(env.RETELL_PHONE_NUMBER);}
function localWindow(now){const f=new Intl.DateTimeFormat('en-US',{timeZone:'America/Mexico_City',weekday:'short',hour:'2-digit',hour12:false});const parts=Object.fromEntries(f.formatToParts(now).map(x=>[x.type,x.value]));return !['Sat','Sun'].includes(parts.weekday)&&Number(parts.hour)>=10&&Number(parts.hour)<18;}
function nextSlot(now){for(let i=1;i<=60*24*8;i++){const d=new Date(now.getTime()+i*60000);if(localWindow(d))return d.toISOString();}return new Date(now.getTime()+86400000).toISOString();}
function expired(env,date){if(env.QUOTE_VALIDITY_APPROVED!=='true')return false;const days=Number(env.QUOTE_VALID_DAYS);if(!Number.isInteger(days)||days<1||days>365||!date)return false;const raw=String(date),iso=raw.includes('T')?raw:raw.replace(' ','T')+'Z';const ms=Date.parse(iso);return Number.isFinite(ms)&&Date.now()>ms+days*86400000;}
// Contrato de variables acordado con el agente Valeria (Retell AI, español mexicano).
// Solo fuentes verificadas en D1. Nunca reutilizar una estimación del test como anticipo.
function buildRetellCallBody(state,env){
 const customerName=String(state.name||'').trim().replace(/\s+/g,' ').slice(0,80)||'la persona que solicitó una cotización';
 const cents=Number(state.amount_cents);
 if(!Number.isSafeInteger(cents)||cents<1)throw Error('Importe contractual inválido');
 const depositCents=Math.round(cents/2);
 const variables={
  customer_name:customerName,
  // Alias heredado para compatibilidad con guiones anteriores, NO usar en el nuevo agente.
  nombre_cliente:customerName,
  quote_status:'propuesta_aprobada', // aprobado_technical/legal/accepted_by_customer verificados antes de llamar
  folio:String(state.folio||'').slice(0,70),
  ciudad:String(state.city||'').trim().slice(0,75),
  monto_anticipo:(depositCents/100).toFixed(2),
  moneda:'MXN'
 };
 return {
  from_number:env.RETELL_PHONE_NUMBER,
  to_number:toMexicoPhone(state.phone),
  override_agent_id:env.RETELL_AGENT_ID,
  honor_internal_dnc:true,
  idempotency_key:'pluviam-followup-'+String(state.id).slice(0,90),
  metadata:{folio:String(state.folio||'').slice(0,70),followup_id:String(state.id).slice(0,90)},
  retell_llm_dynamic_variables:variables
 };
}
const cancelled=async(db,id,reason)=>{await db.prepare("UPDATE retell_followups_v51 SET status='cancelled',last_error=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('scheduled','deferred','claimed')").bind(reason,id).run();};
async function evaluate(env,item){const db=env.DB;
 const state=await db.prepare(`SELECT f.id,f.status,f.quote_id,f.folio,f.scheduled_at,c.granted,c.revoked_at,c.consent_version,l.name,l.phone,l.city,q.status AS quote_status,q.approved_at,q.approved_technical,q.approved_legal,q.accepted_by_customer,q.amount_cents
  FROM retell_followups_v51 f JOIN retell_consents_v51 c ON c.folio=f.folio JOIN lead_cases l ON l.folio=f.folio JOIN approved_quotes q ON q.id=f.quote_id WHERE f.id=?`).bind(item.id).first();
 if(!state || !['scheduled','deferred'].includes(state.status))return;
 const pay=await db.prepare("SELECT id FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid' LIMIT 1").bind(state.quote_id).first();
 if(pay || state.granted!==1 || state.revoked_at || state.consent_version!=='retell-followup-v1-2026-10-24' || state.quote_status!=='approved' || state.approved_technical!==1 || state.approved_legal!==1 || state.accepted_by_customer!==1 || expired(env,state.approved_at) || !toMexicoPhone(state.phone)){await cancelled(db,state.id,'No elegible: pago, autorización, vigencia o teléfono');return;}
 if(!localWindow(new Date())){await db.prepare("UPDATE retell_followups_v51 SET status='deferred',scheduled_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('scheduled','deferred')").bind(nextSlot(new Date()),state.id).run();return;}
 const max=Number(env.RETELL_MAX_CALLS_PER_DAY||0);
 if(!Number.isInteger(max)||max<1||max>1000){await cancelled(db,state.id,'Límite diario no aprobado');return;}
 const count=await db.prepare("SELECT COUNT(*) AS n FROM retell_followups_v51 WHERE date(claimed_at)=date('now') AND status IN ('claimed','sent','completed','uncertain','failed')").first();
 if(Number(count?.n||0)>=max){await db.prepare("UPDATE retell_followups_v51 SET status='deferred',scheduled_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status IN ('scheduled','deferred')").bind(nextSlot(new Date(Date.now()+86400000)),state.id).run();return;}
 // Claim atómico + segunda verificación de consentimiento/cotización/pago dentro de SQL.
 const claimed=await db.prepare(`UPDATE retell_followups_v51 SET status='claimed',claimed_at=CURRENT_TIMESTAMP,attempts=attempts+1,updated_at=CURRENT_TIMESTAMP
 WHERE id=? AND status IN ('scheduled','deferred')
 AND EXISTS(SELECT 1 FROM retell_consents_v51 WHERE folio=? AND granted=1 AND revoked_at IS NULL)
 AND EXISTS(SELECT 1 FROM approved_quotes WHERE id=? AND status='approved' AND approved_technical=1 AND approved_legal=1 AND accepted_by_customer=1)
 AND NOT EXISTS(SELECT 1 FROM payment_attempts WHERE quote_id=? AND stage='deposit' AND state='paid')`).bind(state.id,state.folio,state.quote_id,state.quote_id).run();
 if(Number(claimed.meta?.changes||0)!==1)return;
 // Segunda lectura antes de llamar, incluyendo posibles pagos y revocaciones concurrentes.
 const finalCheck=await db.prepare(`SELECT f.status,c.granted,c.revoked_at,(SELECT COUNT(*) FROM payment_attempts WHERE quote_id=f.quote_id AND stage='deposit' AND state='paid') AS payments
 FROM retell_followups_v51 f JOIN retell_consents_v51 c ON c.folio=f.folio WHERE f.id=?`).bind(state.id).first();
 if(!finalCheck||finalCheck.status!=='claimed'||finalCheck.granted!==1||finalCheck.revoked_at||Number(finalCheck.payments)!==0){await cancelled(db,state.id,'Cancelado antes de llamar');return;}
 const body=buildRetellCallBody(state,env);
 try{
  const response=await fetch('https://api.retellai.com/v2/create-phone-call',{method:'POST',headers:{'Authorization':'Bearer '+env.RETELL_API_KEY,'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(12000)});
  if(!response.ok){
   // Un 400 de DNC se convierte en exclusión local; otras fallas 4xx no se reintentan.
   const details=response.status===400?String(await response.text()).slice(0,1200):'';
   const isDnc=response.status===400 && /do[_\s-]?not[_\s-]?call|\bdnc\b/i.test(details);
   if(isDnc){
    await db.prepare("UPDATE retell_consents_v51 SET granted=0,revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE folio=?").bind(state.folio).run();
   }
   await db.prepare("UPDATE retell_followups_v51 SET status=?,last_error=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='claimed'").bind(isDnc?'cancelled':response.status>=500?'uncertain':'failed',isDnc?'Contacto excluido por Retell DNC':'Retell HTTP '+response.status,state.id).run();return;
  }
  const data=await response.json();if(!data?.call_id){await db.prepare("UPDATE retell_followups_v51 SET status='uncertain',last_error='Respuesta de llamada sin ID',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='claimed'").bind(state.id).run();return;}
  await db.prepare("UPDATE retell_followups_v51 SET status='sent',retell_call_id=?,call_status=?,last_error=NULL,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='claimed'").bind(String(data.call_id).slice(0,120),String(data.call_status||'registered').slice(0,65),state.id).run();
 }catch(_){ // Timeout ambiguo: NO repetir automáticamente; se puede haber iniciado la llamada y facturado.
  await db.prepare("UPDATE retell_followups_v51 SET status='uncertain',last_error='Respuesta no verificada; conciliar en Retell antes de reintentar',updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='claimed'").bind(state.id).run();
 }
}
async function reconcile(env){if(!active(env))return;const rows=await env.DB.prepare("SELECT id,retell_call_id FROM retell_followups_v51 WHERE status='sent' AND retell_call_id IS NOT NULL AND datetime(created_at)>datetime('now','-3 days') LIMIT 8").all();for(const row of rows.results||[]){try{const r=await fetch('https://api.retellai.com/v2/get-call/'+encodeURIComponent(row.retell_call_id),{headers:{Authorization:'Bearer '+env.RETELL_API_KEY},signal:AbortSignal.timeout(5000)});if(!r.ok)continue;const data=await r.json();const st=String(data.call_status||'').slice(0,65);if(!st)continue;const isDone=st==='ended'||st==='error';if(data.disconnection_reason==='user_requested_dnc'){await env.DB.prepare("UPDATE retell_consents_v51 SET granted=0,revoked_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE folio=(SELECT folio FROM retell_followups_v51 WHERE id=?)").bind(row.id).run();}const outcomeRaw=String(data.call_analysis?.custom_analysis_data?.lead_status||'').toLowerCase();const allowed=['qualified','not_interested','followup_requested','human_requested','not_connected'];const outcome=allowed.includes(outcomeRaw)?outcomeRaw:null;await env.DB.prepare("UPDATE retell_followups_v51 SET status=CASE WHEN ? THEN 'completed' ELSE status END,call_status=?,call_outcome=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND status='sent'").bind(isDone?1:0,st,outcome,row.id).run();}catch(_){/* no modifica expedientes, pagos, ni reintenta llamadas */}}}
export default {
 async fetch(req,env){return new Response(JSON.stringify({service:'pluviam-retell-v51',enabled:active(env),message:'Worker separado, sin endpoint público de envío'}),{headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});},
 async scheduled(controller,env,ctx){if(!active(env))return;try{const due=await env.DB.prepare("SELECT id FROM retell_followups_v51 WHERE status IN ('scheduled','deferred') AND scheduled_at<=? ORDER BY scheduled_at LIMIT 12").bind(new Date().toISOString()).all();for(const f of due.results||[])await evaluate(env,f);await reconcile(env);}catch(_){console.error('PLUVIAM Retell: cron pendiente de revisión. No se modificaron pagos.');}}
};
// Helpers exportados ÚNICAMENTE para tests offline; sin rutas de ejecución en navegador.
export const __test={active,localWindow,nextSlot,expired,evaluate,toMexicoPhone,buildRetellCallBody};
