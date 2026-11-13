/* Aviany Production: Workers AI orientation plus D1 field-visit workflow.
 * The AI may propose an intent; only this module validates and executes actions.
 * It never creates a lead, visit, assignment, or notification from chat alone.
 */
const VISIT_STATES=['SOLICITADA','EN_REVISION','PENDIENTE_ASIGNACION','ASIGNADA','PENDIENTE_CONFIRMACION','CONFIRMADA','REALIZADA','CANCELADA','NO_VIABLE'];
const PROPERTY_TYPES=['residencial','comercial','industrial','institucional','condominio','otro'];
const ALLOWED_INTENTS=['orientacion','diagnostico','cotizacion_preliminar','visita_tecnica','mantenimiento_garantia','cobertura','contacto_operaciones'];
const ALLOWED_SUGGESTIONS=['Cotizar sistema residencial','Agendar evaluación técnica','Dudas sobre mantenimiento y garantías','Cotizar proyecto comercial'];
const TRANSITIONS={
  SOLICITADA:new Set(['EN_REVISION','PENDIENTE_ASIGNACION','CANCELADA','NO_VIABLE']),
  EN_REVISION:new Set(['PENDIENTE_ASIGNACION','CANCELADA','NO_VIABLE']),
  PENDIENTE_ASIGNACION:new Set(['ASIGNADA','CANCELADA','NO_VIABLE']),
  ASIGNADA:new Set(['PENDIENTE_CONFIRMACION','PENDIENTE_ASIGNACION','CANCELADA','NO_VIABLE']),
  PENDIENTE_CONFIRMACION:new Set(['CONFIRMADA','ASIGNADA','CANCELADA','NO_VIABLE']),
  CONFIRMADA:new Set(['REALIZADA','CANCELADA','NO_VIABLE']),
  REALIZADA:new Set(),CANCELADA:new Set(),NO_VIABLE:new Set()
};
const SYSTEM_KNOWLEDGE=`Eres Aviany, la orientadora integral de PLUVIAM. Atiendes en español y puedes adaptar el idioma del visitante. Orienta sobre captación pluvial, tratamiento, almacenamiento, sistemas residenciales, condominios, comercios, industria e instituciones, mantenimiento y garantías. Distingue orientación general, estimación preliminar, diagnóstico, solicitud de visita y cita confirmada. Nunca inventes precios, ahorros, capacidades, coberturas, aliados, horarios ni garantías. Una visita solicitada no es una cita confirmada. El siguiente paso de un diagnóstico suele ser solicitar una visita técnica en campo; Operaciones revisa cobertura y asigna personal operativo externo cuando corresponde. No pidas identificaciones, presupuesto, ingresos, capacidad de pago, datos bancarios ni ningún dato financiero. Para orientar, pregunta únicamente por contexto técnico no sensible: ciudad, tipo de inmueble, superficie aproximada, uso del agua, continuidad, almacenamiento, servicio requerido y disponibilidad. No pidas dirección exacta en la conversación exploratoria. Sé breve, no hagas más de tres preguntas a la vez y no bloquees el siguiente paso. No crees registros ni contactes a terceros desde el chat. Devuelve únicamente JSON válido con reply, intent, segment, nextAction y suggestions.`;

function clean(value,max=500){return typeof value==='string'?value.trim().slice(0,max):''}
function json(value){try{return JSON.parse(value)}catch{return null}}
function responseText(result){if(typeof result==='string')return result;if(typeof result?.response==='string')return result.response;if(typeof result?.result==='string')return result.result;return ''}
function parseModel(result){
  const raw=responseText(result).replace(/^```(?:json)?/i,'').replace(/```$/,'').trim();
  let value=json(raw);
  if(!value){const start=raw.indexOf('{'),end=raw.lastIndexOf('}');if(start>=0&&end>start)value=json(raw.slice(start,end+1))}
  const reply=clean(value?.reply||raw||'Puedo orientarte y ayudarte a preparar el siguiente paso.',900);
  const intent=ALLOWED_INTENTS.includes(value?.intent)?value.intent:'orientacion';
  const segment=['residencial','comercial','mantenimiento'].includes(value?.segment)?value.segment:'';
  const nextRaw=clean(value?.nextAction||'',180);
  const nextAction=/[_{}<>]/.test(nextRaw)?(intent==='visita_tecnica'?'Solicitar evaluación técnica en campo':'Continuar con las preguntas técnicas del inmueble.'):nextRaw||'Definir el siguiente paso con Operaciones.';
  const suggestions=Array.isArray(value?.suggestions)?value.suggestions.map(v=>clean(v,80)).filter(v=>ALLOWED_SUGGESTIONS.includes(v)).slice(0,4):ALLOWED_SUGGESTIONS.slice(0,3);
  return {reply,intent,segment,nextAction,suggestions:suggestions.length?suggestions:ALLOWED_SUGGESTIONS.slice(0,3)};
}
function boundedMessages(value){
  if(!Array.isArray(value))return [];
  return value.slice(-8).map(item=>({role:item?.role==='assistant'?'assistant':'user',content:clean(item?.content,500)})).filter(item=>item.content);
}
async function withTimeout(promise,ms){
  let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('AI_TIMEOUT')),ms)})])}finally{clearTimeout(timer)}
}
function actor(request){return clean(request.headers.get('Cf-Access-Authenticated-User-Email')||request.headers.get('X-Admin-Actor')||'admin-token',180)}
function availability(value){const list=Array.isArray(value)?value:[value];return list.map(v=>clean(v,80)).filter(Boolean).slice(0,8)}
function visitSchema(env){return !!env.DB}
async function visitsReady(env){if(!env.DB)return false;try{await env.DB.prepare('SELECT id FROM field_visits LIMIT 1').first();await env.DB.prepare('SELECT id FROM field_visit_events LIMIT 1').first();return true}catch{return false}}
async function chat(request,env,deps){
  let body;try{body=await deps.bodyJson(request,9000)}catch{return deps.respond({error:'Mensaje inválido.'},400)}
  const message=clean(body.message,500);if(!message)return deps.respond({error:'Escribe una pregunta para Aviany.'},422);
  if(!env.AI)return deps.respond({ok:false,available:false,serviceStatus:'unavailable',fallback:'traditional-contact',reply:'La orientación inteligente está temporalmente fuera de servicio. Puedes continuar con una solicitud tradicional y el equipo de Operaciones la revisará.',suggestions:ALLOWED_SUGGESTIONS},200);
  const messages=[{role:'system',content:SYSTEM_KNOWLEDGE},...boundedMessages(body.messages),{role:'user',content:message}];
  const model=clean(env.AVIANY_AI_MODEL,120)||'@cf/meta/llama-3.1-8b-instruct-fp8';
  const traceId=crypto.randomUUID();
  const startedAt=Date.now();
  try{
    const result=await withTimeout(env.AI.run(model,{messages,max_tokens:260,temperature:0.2}),25000);
    const elapsedMs=Date.now()-startedAt;
    console.log('aviany_ai_success',JSON.stringify({traceId,model,elapsedMs}));
    return deps.respond({ok:true,available:true,serviceStatus:'operational',source:'workers-ai',model,traceId,elapsedMs,assistant:parseModel(result)},200);
  }catch(error){
    const elapsedMs=Date.now()-startedAt;
    const errorCode=error?.message==='AI_TIMEOUT'?'AI_TIMEOUT':'AI_ERROR';
    console.warn('aviany_ai_failure',JSON.stringify({traceId,model,elapsedMs,errorCode}));
    return deps.respond({ok:false,available:false,serviceStatus:'error',fallback:'traditional-contact',errorCode,traceId,elapsedMs,model,reply:'No pude completar la orientación inteligente en este momento. Puedes solicitar una evaluación técnica o dejar tus datos por el canal tradicional.',suggestions:ALLOWED_SUGGESTIONS},503);
  }
}
async function health(request,env,deps){
  const model=clean(env.AVIANY_AI_MODEL,120)||'@cf/meta/llama-3.1-8b-instruct-fp8';
  return deps.respond({service:'aviany',name:'Aviany',ai:{configured:!!env.AI,model},database:{configured:!!env.DB,visitsSchema:await visitsReady(env)},turnstile:{configured:!!(env.TURNSTILE_SECRET&&env.TURNSTILE_SITE_KEY)},externalCommunications:{enabled:false,reason:'Deshabilitadas hasta validación operativa.'}},200)
}
function validContact(email,phone){return !!((email&&/^\S+@\S+\.\S+$/.test(email))||(phone&&phone.replace(/\D/g,'').length>=8))}
async function idempotentVisitResponse(env,deps,row,requestType,sourceChannel){
  let detail={};
  try{const event=await env.DB.prepare('SELECT detail_json FROM field_visit_events WHERE visit_id=? ORDER BY created_at DESC LIMIT 1').bind(row.id).first();detail=JSON.parse(event?.detail_json||'{}')}catch{}
  const storedType=['visit','callback'].includes(detail.requestType)?detail.requestType:requestType;
  const nextAction=row.next_action||'Operaciones revisará la solicitud antes de confirmar una acción.';
  return deps.respond({ok:true,id:row.id,requestFolio:row.id,folio:row.lead_folio||null,status:row.status,idempotent:true,requestType:storedType,sourceChannel:detail.sourceChannel||sourceChannel,nextAction,appointmentConfirmed:false,callbackConfirmed:false,externalCommunications:false},200);
}
async function createVisit(request,env,deps){
  if(!env.DB)return deps.respond({error:'El registro de visitas no está configurado.'},503);
  if(!(await visitsReady(env)))return deps.respond({error:'Migración de visitas pendiente.'},503);
  if(!(await deps.limited(request,env)))return deps.respond({error:'Demasiadas solicitudes. Inténtalo más tarde.'},429);
  let body;try{body=await deps.bodyJson(request,12000)}catch{return deps.respond({error:'Solicitud de visita inválida.'},400)}
  const name=clean(body.name,120),contactMethod=clean(body.contactMethod,20).toLowerCase(),email=clean(body.email,180).toLowerCase(),phone=clean(body.phone,35),city=clean(body.city,80),requestedPropertyType=clean(body.propertyType,20).toLowerCase(),requestTypeInput=clean(body.requestType,20).toLowerCase(),requestType=requestTypeInput||'visit',propertyType=requestType==='callback'?'otro':requestedPropertyType,serviceType=clean(body.serviceType,120),availabilityList=availability(body.availability),postalCode=clean(body.postalCode,12),neighborhood=clean(body.neighborhood,100),address=clean(body.address,220),context=clean(body.context,900),leadFolio=clean(body.leadFolio,70),diagnosticId=clean(body.diagnosticId,90),turnstile=clean(body.turnstile,5000),consentVersion=clean(body.consentVersion,100)||clean(env.CONSENT_VERSION,100)||'pluviam-intake-v1',consent=body.consent===true,approxSurface=body.approximateSurfaceM2===undefined||body.approximateSurfaceM2===''?null:Number(body.approximateSurfaceM2),idempotency=clean(request.headers.get('Idempotency-Key')||body.idempotencyKey,100)||crypto.randomUUID(),sourceChannel=['avianny_web_chat','web_form'].includes(clean(body.sourceChannel,40))?clean(body.sourceChannel,40):'web';
  if(!['visit','callback'].includes(requestType)||name.length<2||!['phone','email','whatsapp'].includes(contactMethod)||!validContact(email,phone)||city.length<2||requestType==='visit'&&!PROPERTY_TYPES.includes(propertyType)||serviceType.length<3||!availabilityList.length||!consent||!turnstile||approxSurface!==null&&(!Number.isFinite(approxSurface)||approxSurface<0||approxSurface>100000))return deps.respond({error:'Revisa nombre, teléfono o correo, ciudad, servicio, horario preferido, consentimiento y comprobación de seguridad.'},422);
  if(!env.TURNSTILE_SECRET)return deps.respond({error:'La verificación de seguridad no está configurada.'},503);
  if(!(await deps.validateTurnstile(request,env,turnstile)))return deps.respond({error:'No se pudo validar la comprobación anti-spam. Solicita una nueva verificación.'},403);
  const duplicate=await env.DB.prepare('SELECT id,lead_folio,status,next_action FROM field_visits WHERE idempotency_key=?').bind(idempotency).first();if(duplicate)return idempotentVisitResponse(env,deps,duplicate,requestType,sourceChannel);
  if(leadFolio){const lead=await env.DB.prepare('SELECT folio FROM lead_cases WHERE folio=?').bind(leadFolio).first();if(!lead)return deps.respond({error:'El folio de diagnóstico no existe.'},422)}
  const id='VIS-'+new Date().toISOString().slice(0,10).replaceAll('-','')+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),now=new Date().toISOString(),nextAction=requestType==='callback'?'Operaciones revisará la solicitud para coordinar un intento de llamada según el horario preferido; la llamada no está confirmada.':'Operaciones revisará cobertura y disponibilidad antes de proponer una cita.',detail={requestFolio:id,requestType,sourceChannel,city,propertyType,serviceType,availability:availabilityList,leadFolio:leadFolio||null,diagnosticId:diagnosticId||null,appointmentConfirmed:false,callbackConfirmed:false};
  try{
    await env.DB.batch([
      env.DB.prepare('INSERT INTO field_visits(id,lead_folio,diagnostic_id,status,priority,name,contact_method,email,phone,city,postal_code,neighborhood,address,property_type,service_type,availability_json,approximate_surface_m2,project_context,consent_version,consent_at,turnstile_at,assigned_role,next_action,idempotency_key,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,leadFolio||null,diagnosticId||null,'SOLICITADA','normal',name,contactMethod,email||null,phone||null,city,postalCode||null,neighborhood||null,address||null,propertyType,serviceType,JSON.stringify(availabilityList),approxSurface,context||null,consentVersion,now,now,'OPERACIONES',nextAction,idempotency,now,now),
      env.DB.prepare('INSERT INTO field_visit_events(id,visit_id,event_type,from_status,to_status,actor,reason,detail_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,'VISITA_SOLICITADA',null,'SOLICITADA','public',requestType==='callback'?'Solicitud explícita de llamada':'Solicitud explícita de visita',JSON.stringify(detail),now)
    ]);
    return deps.respond({ok:true,id,requestFolio:id,status:'SOLICITADA',requestType,sourceChannel,folio:leadFolio||null,nextAction,appointmentConfirmed:false,callbackConfirmed:false,externalCommunications:false},201);
  }catch(error){
    if(/unique constraint failed: field_visits\.idempotency_key/i.test(error?.message||'')){
      const raced=await env.DB.prepare('SELECT id,lead_folio,status,next_action FROM field_visits WHERE idempotency_key=?').bind(idempotency).first().catch(()=>null);
      if(raced)return idempotentVisitResponse(env,deps,raced,requestType,sourceChannel);
    }
    return deps.respond({error:'No fue posible registrar la solicitud. Inténtalo nuevamente.'},500);
  }
}
function filters(request){const url=new URL(request.url);return {state:clean(url.searchParams.get('state'),40),city:clean(url.searchParams.get('city'),80),priority:clean(url.searchParams.get('priority'),20),limit:Math.min(100,Math.max(1,Number(url.searchParams.get('limit')||50)||50))}}
async function listVisits(request,env,deps){if(!deps.admin(request,env)||!env.DB)return deps.respond({error:'No autorizado'},403);const f=filters(request);let sql='SELECT id,lead_folio,diagnostic_id,status,priority,name,contact_method,email,phone,city,postal_code,neighborhood,address,property_type,service_type,availability_json,approximate_surface_m2,project_context,assigned_role,assigned_ally_id,assigned_by,assigned_at,scheduled_date,scheduled_window,responsible_name,responsible_contact,confirmation_at,no_viable_reason,next_action,created_at,updated_at FROM field_visits WHERE 1=1',args=[];if(f.state){sql+=' AND status=?';args.push(f.state)}if(f.city){sql+=' AND city LIKE ?';args.push('%'+f.city+'%')}if(f.priority){sql+=' AND priority=?';args.push(f.priority)}sql+=' ORDER BY CASE priority WHEN \'critica\' THEN 0 WHEN \'alta\' THEN 1 ELSE 2 END,created_at DESC LIMIT '+f.limit;try{const rows=await env.DB.prepare(sql).bind(...args).all();return deps.respond({visits:rows.results||[],limit:f.limit,filters:f})}catch{return deps.respond({error:'Esquema de visitas pendiente de migración.'},503)}}
async function visitDetail(request,env,deps,id){if(!deps.admin(request,env)||!env.DB)return deps.respond({error:'No autorizado'},403);const row=await env.DB.prepare('SELECT * FROM field_visits WHERE id=?').bind(id).first();if(!row)return deps.respond({error:'Visita no encontrada.'},404);const events=await env.DB.prepare('SELECT id,event_type,from_status,to_status,actor,reason,detail_json,created_at FROM field_visit_events WHERE visit_id=? ORDER BY created_at DESC').bind(id).all();const assignments=await env.DB.prepare('SELECT id,ally_id,assigned_by,assignment_reason,state,created_at,updated_at FROM field_visit_assignments WHERE visit_id=? ORDER BY created_at DESC').bind(id).all();return deps.respond({visit:row,events:events.results||[],assignments:assignments.results||[]})}
async function verifiedAlly(env,allyId){return env.DB.prepare(`SELECT a.id,a.full_name,a.company,a.city,a.role,a.services_json,a.coverage_json,a.status,e.habilitado FROM aliados a JOIN enlaces_aliado e ON e.aliado_id=a.id WHERE a.id=? AND a.status='G0_APROBADO' AND e.habilitado=1 AND a.role IN ('EJECUTOR','AMBOS')`).bind(allyId).first()}
async function updateVisit(request,env,deps,id){
  if(!deps.admin(request,env)||!env.DB)return deps.respond({error:'No autorizado'},403);let body;try{body=await deps.bodyJson(request,6000)}catch{return deps.respond({error:'Actualización inválida.'},400)}
  const current=await env.DB.prepare('SELECT * FROM field_visits WHERE id=?').bind(id).first();if(!current)return deps.respond({error:'Visita no encontrada.'},404);
  const next=clean(body.status,40).toUpperCase()||current.status;if(!VISIT_STATES.includes(next))return deps.respond({error:'Estado de visita inválido.'},422);if(next!==current.status&&!(TRANSITIONS[current.status]||new Set()).has(next))return deps.respond({error:'Transición de estado no permitida.'},409);
  const reason=clean(body.reason,400),allyId=clean(body.allyId,100),scheduledDate=clean(body.scheduledDate,20),scheduledWindow=clean(body.scheduledWindow,80),responsibleName=clean(body.responsibleName,120),responsibleContact=clean(body.responsibleContact,80),priority=clean(body.priority,20)||current.priority,nextAction=clean(body.nextAction,300)||current.next_action;
  if(!['normal','alta','critica'].includes(priority))return deps.respond({error:'Prioridad inválida.'},422);
  if((next==='CANCELADA'||next==='NO_VIABLE')&&!reason)return deps.respond({error:'Una cancelación o no viabilidad requiere motivo.'},422);
  if(next==='CONFIRMADA'&&(!scheduledDate||!scheduledWindow||!responsibleName||!responsibleContact))return deps.respond({error:'No se puede confirmar sin fecha, ventana horaria y responsable verificables.'},422);
  let ally=null;if(allyId){ally=await verifiedAlly(env,allyId);if(!ally)return deps.respond({error:'El aliado no está habilitado, homologado y validado como ejecutor.'},409)}if(next==='ASIGNADA'&&!allyId&&!current.assigned_ally_id)return deps.respond({error:'Asignar una visita requiere un aliado ejecutor habilitado.'},422);
  const now=new Date().toISOString(),assigned=allyId||current.assigned_ally_id||null,assignedAt=allyId?now:current.assigned_at,assignedBy=allyId?actor(request):current.assigned_by,confirmationAt=next==='CONFIRMADA'?(current.confirmation_at||now):current.confirmation_at;
  const statements=[env.DB.prepare('UPDATE field_visits SET status=?,priority=?,assigned_ally_id=?,assigned_by=?,assigned_at=?,scheduled_date=?,scheduled_window=?,responsible_name=?,responsible_contact=?,confirmation_at=?,no_viable_reason=?,next_action=?,updated_at=? WHERE id=?').bind(next,priority,assigned,assignedBy,assignedAt,scheduledDate||current.scheduled_date,scheduledWindow||current.scheduled_window,responsibleName||current.responsible_name,responsibleContact||current.responsible_contact,confirmationAt,next==='NO_VIABLE'?reason:current.no_viable_reason,nextAction,now,id),env.DB.prepare('INSERT INTO field_visit_events(id,visit_id,event_type,from_status,to_status,actor,reason,detail_json,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,allyId?'VISITA_ASIGNADA':'CAMBIO_ESTADO',current.status,next,actor(request),reason||null,JSON.stringify({allyId:allyId||null,scheduledDate:scheduledDate||null,scheduledWindow:scheduledWindow||null}),now)];
  if(allyId)statements.push(env.DB.prepare('INSERT INTO field_visit_assignments(id,visit_id,ally_id,assigned_by,assignment_reason,state,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),id,allyId,actor(request),reason||'Asignación manual validada por Operaciones','PROPUESTA',now,now));
  try{await env.DB.batch(statements);return deps.respond({ok:true,id,status:next,assignedAllyId:assigned,nextAction:next==='CONFIRMADA'?'Cita confirmada con fecha, ventana y responsable registrados.':nextAction,externalCommunications:false})}catch{return deps.respond({error:'No fue posible actualizar la visita.'},500)}
}
export async function handleAvianyRequest(request,env,path,deps){
  if(path==='/api/aviany/health'&&request.method==='GET')return health(request,env,deps);
  if(path==='/api/aviany/chat'&&request.method==='POST')return chat(request,env,deps);
  if(path==='/api/visitas'&&request.method==='POST')return createVisit(request,env,deps);
  if(path==='/api/admin/visitas'&&request.method==='GET')return listVisits(request,env,deps);
  if(path.startsWith('/api/admin/visitas/')){const id=clean(path.split('/').pop(),100);if(request.method==='GET')return visitDetail(request,env,deps,id);if(request.method==='PATCH')return updateVisit(request,env,deps,id)}
  return null;
}
