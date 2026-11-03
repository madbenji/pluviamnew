/* PLUVIAM: premium authenticated timeline. Never writes or changes project status. */
(()=>{'use strict';
 const steps=[
  {key:'recibida',title:'Solicitud recibida',help:'Conservamos tu diagnóstico.'},
  {key:'calificacion',title:'Evaluación inicial',help:'Revisamos los datos y el alcance preliminar.'},
  {key:'visita',title:'Evaluación técnica',help:'La visita o revisión se coordina cuando corresponda.'},
  {key:'diseno',title:'Diseño y presupuesto',help:'Se prepara la solución con alcance verificable.'},
  {key:'propuesta',title:'Propuesta formal',help:'Se revisan los términos comerciales.'},
  {key:'contrato',title:'Contrato y condiciones',help:'Firma y anticipo sujetos a aprobación.'},
  {key:'instalacion',title:'Instalación',help:'Ejecución conforme a calendario confirmado.'},
  {key:'qa',title:'Control de calidad',help:'Pruebas y verificaciones de entrega.'},
  {key:'entregado',title:'Entrega',help:'Hito de entrega registrado.'},
  {key:'mantenimiento',title:'Mantenimiento',help:'Atención posterior conforme al contrato.'}
 ];
 const dateLabel=raw=>{
   if(typeof raw!=='string')return '';
   const iso=raw.includes('T')?raw:raw.replace(' ','T')+'Z';const value=new Date(iso);
   return Number.isNaN(value.getTime())?'':new Intl.DateTimeFormat('es-MX',{year:'numeric',month:'short',day:'numeric'}).format(value);
 };
 const el=(name,className,text)=>{const v=document.createElement(name);if(className)v.className=className;if(text!==undefined)v.textContent=text;return v;};
 window.addEventListener('pluviam:proyecto',ev=>{
   const target=document.getElementById('project-result'),d=ev.detail?.data;
   if(!target||!d)return;
   target.querySelector('#project-timeline')?.remove();
   const wrapper=el('section','project-timeline');wrapper.id='project-timeline';wrapper.setAttribute('aria-label','Etapas de tu proyecto');
   const header=el('div','project-timeline-head');header.append(el('span','section-kicker','SEGUIMIENTO DE TU EXPEDIENTE'),el('h3','','Así va tu proyecto'));wrapper.append(header);
   if(d.stage==='cancelado'){
     const msg=el('p','project-cancelled','Este expediente figura como cerrado. Si deseas reactivarlo, contacta al equipo indicando solo tu folio.');wrapper.append(msg);
   }else{
     const index=steps.findIndex(s=>s.key===d.stage);
     const currentIndex=index<0?0:index;
     if(index<0)wrapper.append(el('p','project-footnote','La etapa actual no coincide con el recorrido estándar; consulta la descripción del estado mostrada arriba.'));
     const ol=el('ol','project-steps');
     for(let i=0;i<steps.length;i++){
       const s=steps[i],cls=i===currentIndex?'is-current':i<currentIndex?'is-prior':'is-next';
       const li=el('li','project-step '+cls);if(i===currentIndex)li.setAttribute('aria-current','step');
       li.append(el('span','project-step-indicator',String(i+1).padStart(2,'0')));
       const copy=el('div','project-step-copy');copy.append(el('h4','',s.title));
       if(i===currentIndex)copy.append(el('p','',d.nextStep||s.help));
       else if(i<currentIndex)copy.append(el('p','','Etapa anterior según el estado actual del expediente.'));
       li.append(copy);ol.append(li);
     }
     wrapper.append(ol);
     wrapper.append(el('p','project-footnote','El orden representa el proceso habitual. No confirma citas, firmas, pagos ni instalaciones: solo el estado registrado en el expediente.'));
   }
   const activity=el('section','project-activity');activity.setAttribute('aria-label','Actualizaciones registradas');
   activity.append(el('h4','','Actualizaciones documentadas'));
   if(d.recordsAvailable===true){
      const events=Array.isArray(d.events)?d.events:[];
      if(events.length){const list=el('ol','project-activity-list');events.forEach(item=>{
        const li=el('li','');const date=dateLabel(item.created_at);
        if(date)li.append(el('time','',date));li.append(el('p','',String(item.description||item.event_type||'Actualización registrada').slice(0,650)));list.append(li);
      });activity.append(list);}
      else activity.append(el('p','project-muted','Aún no se han compartido actualizaciones adicionales.'));
   }else activity.append(el('p','project-muted','El historial documental aún no está habilitado para consulta. El estado actual que ves arriba proviene de tu expediente.'));
   wrapper.append(activity);target.append(wrapper);
 });
})();
