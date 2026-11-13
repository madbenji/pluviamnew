(()=>{
  'use strict';
  if(document.getElementById('avianny-launcher'))return;

  const state={beta:false,aiAvailable:false,busy:false,opened:false,hasInteracted:false,segment:'',messages:[],turnstileToken:'',turnstileWidget:null};
  const avatarHtml='<img class="avianny-avatar" src="/assets/tlaloq.png" alt="Aviany, guía visual de Pluviam" width="78" height="78" loading="lazy">';
  const sessions=()=>sessionStorage.getItem('pluviam-beta-session')||'';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=(label,url)=>'<a href="'+url+'">'+label+' ↗</a>';
  const visitButton=(label='Agendar evaluación técnica')=>'<button type="button" data-open-visit="true">'+label+' ↗</button>';
  const fieldVisitHref=(segment)=>'/cotizacion.html?segmento='+encodeURIComponent(segment||'general')+'&origen=aviany&next=visita-campo';
  const preliminaryQuoteHref=(segment)=>'/cotizacion.html?segmento='+encodeURIComponent(segment||'general')+'&origen=aviany&next=cotizacion-preliminar';

  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/avianny.css';
  document.head.append(css);
  const productionCss=document.createElement('link');
  productionCss.rel='stylesheet';
  productionCss.href='/avianny-production.css';
  document.head.append(productionCss);

  const button=document.createElement('button');
  button.id='avianny-launcher';
  button.className='avianny-launcher';
  button.type='button';
  button.setAttribute('aria-label','Abrir orientación de Aviany');
  button.innerHTML='<span class="avianny-avatar-wrap">'+avatarHtml+'</span><span class="avianny-launcher-content"><span class="avianny-bubble">Hola, soy Aviany 👋 ¿Calculamos tu sistema?</span><span class="avianny-launcher-label">Aviany · orientación integral</span></span>';

  const visitFormMarkup="<form class=\"avianny-visit-form\" aria-label=\"Solicitud de evaluación técnica\"><div class=\"avianny-visit-grid\"><label>Nombre<input name=\"name\" autocomplete=\"name\" required maxlength=\"120\"></label><label>Contacto preferido<select name=\"contactMethod\" required><option value=\"phone\">Teléfono</option><option value=\"whatsapp\">WhatsApp</option><option value=\"email\">Correo</option></select></label><label>Teléfono<input name=\"phone\" autocomplete=\"tel\" maxlength=\"35\"></label><label>Correo<input name=\"email\" type=\"email\" autocomplete=\"email\" maxlength=\"180\"></label><label>Ciudad / municipio<input name=\"city\" autocomplete=\"address-level2\" required maxlength=\"80\" placeholder=\"Zapopan, Guadalajara…\"></label><label>Tipo de inmueble<select name=\"propertyType\" required><option value=\"residencial\">Residencial</option><option value=\"condominio\">Condominio</option><option value=\"comercial\">Comercial</option><option value=\"industrial\">Industrial</option><option value=\"institucional\">Institucional</option></select></label><label>Servicio que buscas<input name=\"serviceType\" required maxlength=\"120\" placeholder=\"Captación, filtración, mantenimiento…\"></label><label>Disponibilidad aproximada<input name=\"availability\" required maxlength=\"120\" placeholder=\"Días y ventanas de horario\"></label><label>Superficie aproximada (m²)<input name=\"approximateSurfaceM2\" type=\"number\" min=\"0\" max=\"100000\" step=\"1\"></label></div><label>Contexto del proyecto<textarea name=\"context\" rows=\"2\" maxlength=\"900\" placeholder=\"Usos, continuidad, etapa o restricciones relevantes\"></textarea></label><label class=\"avianny-consent\"><input name=\"consent\" type=\"checkbox\" required> Autorizo a PLUVIAM a registrar esta solicitud para revisión operativa y acepto el aviso de privacidad vigente.</label><div class=\"avianny-turnstile\" data-turnstile></div><p class=\"avianny-visit-message\" role=\"status\" aria-live=\"polite\"></p><div class=\"avianny-visit-actions\"><button type=\"submit\">Enviar solicitud</button></div></form>";
  const dialog=document.createElement('dialog');
  dialog.id='avianny-dialog';
  dialog.className='avianny-dialog';
  dialog.setAttribute('aria-labelledby','avianny-title');
  dialog.innerHTML="<div class=\"avianny-head\"><div class=\"avianny-head-brand\">"+avatarHtml+"<div><strong id=\"avianny-title\">Aviany</strong><small><span class=\"avianny-status-dot\" aria-hidden=\"true\"></span>Orientación integral · conectada con Operaciones</small></div></div><button class=\"avianny-close\" type=\"button\" aria-label=\"Cerrar Aviany\">×</button></div><div class=\"avianny-body\"><div class=\"avianny-history\" role=\"log\" aria-live=\"polite\"></div><div class=\"avianny-suggestions\" aria-label=\"Acciones rápidas\"></div><form class=\"avianny-form\"><div class=\"avianny-input-wrap\"><textarea maxlength=\"500\" required rows=\"2\" placeholder=\"Cuéntame qué necesitas resolver…\"></textarea><span>Enter para enviar · Shift + Enter para saltar línea</span></div><button type=\"submit\"><span>Enviar</span><b>↗</b></button></form></div>";
  document.body.append(button,dialog);
  button.querySelector('.avianny-launcher-label').textContent='Aviany · Asistente de Agua';
  const statusDot=dialog.querySelector('.avianny-status-dot');
  const statusWrap=dialog.querySelector('.avianny-head small');
  const statusText=document.createElement('span');
  statusText.className='avianny-status-text';
  statusWrap.replaceChildren(statusDot,statusText);
  const setServiceStatus=(available)=>{statusDot.classList.toggle('is-ready',!!available);statusDot.classList.toggle('is-fallback',!available);statusText.textContent=available?'IA disponible · Operaciones':'Orientación manual disponible'};
  setServiceStatus(false);

  const form=dialog.querySelector('.avianny-form');
  const textarea=form.querySelector('textarea');
  const submit=form.querySelector('button[type="submit"]');
  const history=dialog.querySelector('.avianny-history');
  const suggestions=dialog.querySelector('.avianny-suggestions');
  let visitForm=null;
  let visitMessage=null;
  let turnstileBox=null;
  const bubble=button.querySelector('.avianny-bubble');
  const bubbleMessages=['Hola, soy Aviany 👋 ¿Calculamos tu sistema?','¿Es para tu hogar o un proyecto comercial?','¿Agendamos una evaluación técnica en campo?'];
  let bubbleIndex=0;

  const priorityPrompts=['Cotizar sistema residencial','Agendar evaluación técnica','Dudas sobre mantenimiento y garantías','Cotizar proyecto comercial'];
  const betaPrompts=priorityPrompts;
  const addMessage=(role,html)=>{const item=document.createElement('div');item.className='avianny-message '+role;item.innerHTML=html;history.append(item);history.scrollTop=history.scrollHeight;return item};
  const setPrompts=(items)=>{const visible=state.hasInteracted?[]:items;suggestions.innerHTML=visible.map((prompt)=>'<button type="button" data-prompt="'+esc(prompt)+'">'+esc(prompt)+'</button>').join('');suggestions.hidden=!visible.length;suggestions.querySelectorAll('[data-prompt]').forEach((quick)=>quick.addEventListener('click',()=>ask(quick.dataset.prompt)))};
  const inferSegment=(value)=>{
    const v=value.toLowerCase();
    if(/residencial|hogar|casa|vivienda/.test(v))return'residencial';
    if(/comercial|empresa|industrial|negocio|hotel|escuela|condominio|desarroll/.test(v))return'comercial';
    if(/manteni|garant[ií]a|repara|fuga|bomba|repuesto/.test(v))return'mantenimiento';
    return state.segment||'';
  };
  const applyIntent=(value)=>{const segment=inferSegment(value);if(segment)state.segment=segment;return segment};
  const nextStepHtml=(segment)=>{
    if(segment==='mantenimiento')return'<div class="avianny-next-step"><span class="avianny-next-kicker">Siguiente paso</span><strong>Solicitar revisión y validar garantía</strong><p>Recabamos el contexto del sistema y el equipo de Operaciones coordina la atención correspondiente.</p><div class="avianny-actions">'+link('Solicitar atención','/cotizacion.html?segmento=mantenimiento&origen=aviany&next=revision')+link('Conocer HI Care','/hi-care/')+'</div></div>';
    if(segment==='residencial'||segment==='comercial')return'<div class="avianny-next-step"><span class="avianny-next-kicker">Siguiente paso</span><strong>Agendar visita técnica en campo</strong><p>Después del diagnóstico, coordinamos internamente la asignación con personal operativo externo para validar el inmueble y preparar una cotización preliminar.</p><div class="avianny-actions">'+visitButton()+link('Cotización preliminar',preliminaryQuoteHref(segment))+'</div></div>';
    return'<div class="avianny-next-step"><span class="avianny-next-kicker">Siguiente paso</span><strong>Elige la ruta del proyecto</strong><p>Indica si se trata de una vivienda o de una operación comercial y te llevo a la visita técnica correcta.</p><div class="avianny-actions">'+visitButton('Ruta residencial')+visitButton('Ruta comercial')+'</div></div>';
  };

  const publicReply=(message)=>{
    const v=message.toLowerCase();
    const segment=applyIntent(message);
    if(/cotizar sistema residencial|ruta residencial/.test(v))return'<strong>Ruta residencial activada.</strong><p>Empezamos con cinco preguntas sobre superficie, uso, almacenamiento y continuidad. Al terminar, el siguiente paso es validar el inmueble con una visita técnica en campo.</p>'+nextStepHtml('residencial');
    if(/cotizar proyecto comercial|ruta comercial/.test(v))return'<strong>Ruta comercial activada.</strong><p>Para un negocio, condominio o proyecto de mayor escala revisamos demanda, superficie, almacenamiento y etapas de implementación antes de definir el alcance.</p>'+nextStepHtml('comercial');
    if(/agendar evaluaci[oó]n t[eé]cnica/.test(v))return'<strong>Coordinemos la evaluación.</strong><p>¿La visita es para una vivienda o para una operación comercial? La selección define la ruta y la asignación interna al personal operativo externo.</p>'+nextStepHtml(segment);
    if(/dudas sobre mantenimiento y garant[ií]as|manteni|repara|fuga|bomba|incidencia|garant[ií]a|repuesto/.test(v))return'<strong>La continuidad también cuenta.</strong><p>Aviany puede orientarte sobre mantenimiento, consumibles, bombas, almacenamiento y garantías sujetas al alcance, compatibilidad y cobertura de cada sistema.</p>'+nextStepHtml('mantenimiento');
    if(/diagn[oó]stic|casa|hogar|lluvia|techo|captaci/.test(v))return'<strong>Empecemos por tu propiedad.</strong><p>Te haré cinco preguntas y, al finalizar, te mostraré una ruta orientativa con el siguiente paso listo para agendar una visita técnica en campo.</p>'+nextStepHtml(segment);
    if(/precio|costo|compr|filtro|jarra|producto|kit|tienda|carrito/.test(v))return'<strong>Te ayudo a elegir.</strong><p>Puedes explorar filtros, jarras, consumibles, kits de lluvia y accesorios. Si buscas un sistema completo, te llevo a una cotización preliminar y a la evaluación técnica.</p><div class="avianny-actions">'+link('Explorar tienda','/store/')+link('Cotización preliminar',preliminaryQuoteHref(segment||'residencial'))+'</div>'+nextStepHtml(segment||'residencial');
    if(/empresa|industrial|negocio|hotel|escuela|gobierno|desarroll/.test(v))return'<strong>Diseñemos el alcance correcto.</strong><p>Para una operación profesional conviene revisar demanda, superficie, almacenamiento, usos y etapas de implementación. La visita técnica en campo activa la coordinación con Operaciones.</p>'+nextStepHtml('comercial');
    if(/aliad|arquitect|instalad|colabor|rain|isla|345/.test(v))return'<strong>Conectemos capacidades.</strong><p>PLUVIAM coordina especialistas de diseño, captación, ingeniería e instalación. Puedes conocer la red o solicitar incorporación con el contexto de tu especialidad.</p><div class="avianny-actions">'+link('Conocer aliados','/colaborar/')+link('Solicitar incorporación','/cotizacion.html?segmento=aliados&origen=aviany')+'</div>'+nextStepHtml('comercial');
    if(/hola|buenas|ayuda|qu[eé] puedes/.test(v))return'<strong>Estoy aquí para orientarte.</strong><p>Puedo ayudarte a cotizar un sistema residencial, preparar una evaluación técnica, revisar mantenimiento y garantías o encaminar un proyecto comercial.</p>'+nextStepHtml('');
    return'<strong>Vamos paso a paso.</strong><p>Puedo orientarte sobre hogar, proyectos comerciales, captación de lluvia, filtros o mantenimiento. También puedo llevarte directamente a una visita técnica en campo.</p>'+nextStepHtml(segment);
  };

  const actionHtml=(action)=>{if(!action)return'';if(action.type==='quote_draft')return'<div class="avianny-action"><strong>Borrador '+esc(action.id)+'</strong><br>Folio: '+esc(action.folio)+'<ul>'+action.offers.map((offer)=>'<li>'+esc(offer.name)+' · '+esc(offer.priceStatus)+'</li>').join('')+'</ul></div>';if(action.type==='maintenance_request')return'<div class="avianny-action"><strong>Solicitud de mantenimiento</strong><br>'+esc(action.id)+' · '+esc(action.serviceType)+' · '+esc(action.status)+'</div>';if(action.type==='catalog_lookup')return'<div class="avianny-action"><strong>Catálogo consultado</strong><br>'+action.items.map((item)=>esc(item.name)).join(' · ')+'</div>';if(action.type==='dossier_lookup')return'<div class="avianny-action"><strong>Expedientes visibles: '+action.records.length+'</strong><br>'+action.records.map((row)=>esc(row.folio)+' · '+esc(row.status)).join('<br>')+'</div>';return''};

  const ask=async(message)=>{
    const value=String(message||'').trim();
    if(!value||state.busy)return;
    state.hasInteracted=true;
    setPrompts([]);
    applyIntent(value);
    textarea.value='';
    addMessage('user','<p>'+esc(value)+'</p>');
    state.messages.push({role:'user',content:value});
    const typing=addMessage('assistant','<span class="avianny-author">Aviany</span><div class="avianny-typing"><i></i><i></i><i></i></div>');
    state.busy=true;
    submit.disabled=true;
    if(!state.beta&&state.aiAvailable){
      try{
        const res=await fetch('/api/aviany/chat',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({message:value,messages:state.messages,context:{segment:state.segment,pathname:location.pathname}})});
        const data=await res.json().catch(()=>({}));
        if(!res.ok||!data.ok||!data.assistant)throw Error('AI_UNAVAILABLE');
        typing.remove();const assistant=data.assistant;if(assistant.segment)state.segment=assistant.segment;state.messages.push({role:'assistant',content:assistant.reply});const followUp=assistant.segment?nextStepHtml(assistant.segment):nextStepHtml(state.segment);addMessage('assistant','<span class="avianny-author">Aviany · IA operativa</span><p>'+esc(assistant.reply)+'</p><div class="avianny-ai-next"><span>Siguiente paso</span><strong>'+esc(assistant.nextAction||'Continuar con la evaluación')+'</strong></div>'+followUp);wireVisitActions();state.busy=false;submit.disabled=false;return;
      }catch(_){state.aiAvailable=false}
    }
    if(!state.beta){window.setTimeout(()=>{typing.remove();addMessage('assistant',publicReply(value));state.busy=false;submit.disabled=false;wireVisitActions()},260);return}
    const headers={'Content-Type':'application/json'};
    if(sessions())headers['X-Beta-Session']=sessions();
    try{
      const res=await fetch('/api/beta/assistant',{method:'POST',headers,credentials:'same-origin',body:JSON.stringify({channel:location.pathname.startsWith('/admin')?'admin':'web',message:value})});
      const data=await res.json().catch(()=>({error:'No recibí respuesta del servicio.'}));
      if(!res.ok)throw Error(data.error||'No autorizado');
      typing.remove();
      const followUp=/cotizar sistema residencial|cotizar proyecto comercial|agendar evaluaci[oó]n t[eé]cnica|mantenimiento|garant[ií]a/i.test(value)?nextStepHtml(state.segment):'';
      addMessage('assistant','<span class="avianny-author">'+esc(data.label||'Aviany')+'</span><p>'+esc(data.message||'Listo.')+'</p>'+actionHtml(data.action)+followUp);wireVisitActions();
    }catch(error){typing.remove();addMessage('assistant','<span class="avianny-author">Aviany</span><p>'+esc(error.message)+'</p>'+nextStepHtml(state.segment))}
    finally{state.busy=false;submit.disabled=false}
  };

  function openVisit(){
    if(!visitForm){
      const item=addMessage('assistant','<span class="avianny-author">Aviany · coordinación técnica</span><p>Para solicitar la evaluación, comparte estos datos. Operaciones revisará cobertura y te confirmará el siguiente paso.</p>'+visitFormMarkup);
      visitForm=item.querySelector('.avianny-visit-form');
      visitMessage=visitForm.querySelector('.avianny-visit-message');
      turnstileBox=visitForm.querySelector('[data-turnstile]');
      const contactMethod=visitForm.elements.contactMethod;
      const syncContactRequirements=()=>{visitForm.elements.phone.required=contactMethod.value!=='email';visitForm.elements.email.required=contactMethod.value==='email'};
      contactMethod.addEventListener('change',syncContactRequirements);
      syncContactRequirements();
      visitForm.addEventListener('submit',submitVisit);
    }
    visitForm.hidden=false;
    history.scrollTo({top:history.scrollHeight,behavior:'smooth'});
    ensureTurnstile();
  }
  function wireVisitActions(){history.querySelectorAll('[data-open-visit]').forEach((quick)=>{quick.onclick=openVisit})}
  async function ensureTurnstile(){if(!turnstileBox||turnstileBox.dataset.ready||turnstileBox.dataset.loading)return;turnstileBox.dataset.loading='true';try{const status=await fetch('/api/estado',{credentials:'same-origin',cache:'no-store'}).then(r=>r.json());const siteKey=status.turnstileSiteKey;if(!siteKey)throw Error('TURNSTILE_UNAVAILABLE');if(!window.turnstile){await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.onload=resolve;script.onerror=reject;document.head.append(script)})}state.turnstileWidget=window.turnstile.render(turnstileBox,{sitekey:siteKey,theme:'dark',callback:(token)=>{state.turnstileToken=token},'expired-callback':()=>{state.turnstileToken=''},'error-callback':()=>{state.turnstileToken=''}});turnstileBox.dataset.ready='true'}catch(_){visitMessage.textContent='No se pudo cargar la comprobación de seguridad. Intenta nuevamente.'}finally{delete turnstileBox.dataset.loading}}
  async function submitVisit(e){
    e.preventDefault();
    if(!visitForm.reportValidity())return;
    if(!state.turnstileToken){visitMessage.textContent='Completa la comprobación de seguridad antes de enviar.';ensureTurnstile();return}
    const values=Object.fromEntries(new FormData(visitForm).entries());
    const submitButton=visitForm.querySelector('button[type="submit"]');
    submitButton.disabled=true;
    visitMessage.textContent='Registrando la solicitud…';
    try{
      const res=await fetch('/api/visitas',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':(crypto.randomUUID?crypto.randomUUID():'aviany-'+Date.now())},credentials:'same-origin',body:JSON.stringify({...values,consent:values.consent==='on',turnstile:state.turnstileToken,consentVersion:'pluviam-intake-v1-2026-11-04',availability:[values.availability]})});
      const data=await res.json().catch(()=>({}));
      if(!res.ok)throw Error(data.error||'No fue posible registrar la solicitud.');
      visitMessage.textContent='Solicitud recibida · '+data.id+'. Operaciones revisará cobertura y te confirmará el siguiente paso; todavía no es una cita.';
      visitForm.reset();
      visitForm.elements.phone.required=true;
      visitForm.elements.email.required=false;
      state.turnstileToken='';
      if(window.turnstile&&state.turnstileWidget!==null)window.turnstile.reset(state.turnstileWidget);
    }catch(error){visitMessage.textContent=error.message}
    finally{submitButton.disabled=false}
  }
  button.addEventListener('click',()=>{state.opened=true;button.classList.remove('is-attention');dialog.showModal();textarea.focus()});
  dialog.querySelector('.avianny-close').addEventListener('click',()=>{state.opened=false;dialog.close()});
  dialog.addEventListener('click',(e)=>{if(e.target===dialog){state.opened=false;dialog.close()}});
  form.addEventListener('submit',(e)=>{e.preventDefault();ask(textarea.value)});
  textarea.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();form.requestSubmit()}});

  const setMode=(beta)=>{
    state.beta=beta;
    if(!history.children.length)addMessage('assistant','<span class="avianny-author">Aviany</span><p>'+(beta?'Cuéntame qué quieres revisar y trabajaremos con las herramientas autorizadas.':'Hola. Soy Aviany. Puedo ayudarte a encontrar la mejor ruta para tu hogar, negocio o proyecto. ¿Qué te gustaría resolver?')+'</p>');
    setPrompts(beta?betaPrompts:priorityPrompts);
  };

  setMode(false);
  wireVisitActions();
  window.setTimeout(()=>button.classList.add('is-attention'),3400);
  window.setInterval(()=>{if(!state.opened){bubbleIndex=(bubbleIndex+1)%bubbleMessages.length;bubble.textContent=bubbleMessages[bubbleIndex]}},7200);
  const checkPreviewAssistant=()=>fetch('/api/beta/status',{credentials:'same-origin',cache:'no-store'}).then(async(res)=>{if(!res.ok)return false;const data=await res.json();return data.enabled===true&&data.environment==='isolated-preview'}).then((beta)=>{if(!state.aiAvailable&&!state.hasInteracted)setMode(beta)}).catch(()=>{if(!state.hasInteracted)setMode(false)});
  fetch('/api/aviany/health',{credentials:'same-origin',cache:'no-store'}).then((res)=>res.json()).then((data)=>{state.aiAvailable=data?.ai?.configured===true;setServiceStatus(state.aiAvailable);if(state.aiAvailable)setMode(false);else checkPreviewAssistant()}).catch(()=>{state.aiAvailable=false;setServiceStatus(false);checkPreviewAssistant()});
})();
