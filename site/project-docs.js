/* V50 · Documentation PDF and customer-owned status; no token in files, URLs, analytics or console. */
(()=>{'use strict';
const input=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,' ').slice(0,250);
const money=c=>(Number(c||0)/100).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
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
function buildPdf(lines){const text=Array.isArray(lines)?lines.map(x=>String(x||'')):[];const get=(prefix)=>{const found=text.find(x=>x.startsWith(prefix));return found?found.slice(prefix.length).trim():''};const folio=get('Folio: ');const info=text.find(x=>x.startsWith('Inversion aprobada: '));const amount=info?Number((info.split('$')[1]||'').replace(/[^0-9.]/g,''))*100:0;return new Blob([brandedPdf({kind:'ficha',folio,issuedAt:get('Fecha de consulta: '),status:get('Estado: '),approved:!!info,amountCents:amount,paymentPlan:get('Plan contractual: '),deposit:get('Anticipo: '),final:get('Saldo: ')})],{type:'application/pdf'});}
const statuses={recibida:'Diagnostico recibido',calificacion:'Evaluacion inicial',visita:'Visita por coordinar',diseno:'Ingenieria y presupuesto',propuesta:'Propuesta en revision',contrato:'Contrato y anticipo',instalacion:'Instalacion',qa:'Pruebas y control de calidad',entregado:'Entrega',mantenimiento:'Posventa y mantenimiento',cancelado:'Solicitud cerrada'};
window.addEventListener('pluviam:proyecto',event=>{
 const {data:d,folio,token}=event.detail,zone=document.getElementById('project-result');if(!zone)return;
 const q=d.quote||{},p=d.paymentStates||{};
 const box=document.createElement('section');box.className='project-v50';
 const heading=document.createElement('h3');heading.textContent='Tu propuesta y pagos';box.append(heading);
 const detail=document.createElement('p');const isApproved=q.approved===true;
 detail.textContent=isApproved?'Inversión aprobada: '+money(q.amountCents)+' · '+(q.milestones||[]).map(m=>m.label+': '+money(m.amountCents)).join(' · '):'La propuesta contractual sigue pendiente de validación. El diagnóstico por sí solo no autoriza un cobro.';box.append(detail);
 if(isApproved){
  const terms=document.createElement('section');terms.className='project-document';
  const ht=document.createElement('h4');ht.textContent='Propuesta y aceptación contractual';terms.append(ht);
  const scope=document.createElement('p');scope.textContent='Alcance acordado: '+String(q.summary||'');terms.append(scope);
  const text=document.createElement('p');text.textContent=String(q.contractText||'');terms.append(text);
  const approval=document.createElement('p');approval.textContent=q.contractAccepted?'Esta versión de propuesta y condiciones está aceptada.':'Antes de pagar, revisa y acepta estas condiciones. El pago no se habilita antes de la aceptación.';terms.append(approval);
  const pdfButton=document.createElement('button');pdfButton.type='button';pdfButton.className='button';pdfButton.textContent='Descargar propuesta contractual PDF';pdfButton.addEventListener('click',async()=>{pdfButton.disabled=true;try{const r=await fetch('/api/propuesta/pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,token})});if(!r.ok){const j=await r.json();throw Error(j.error||'No disponible')}const blob=await r.blob();const url=URL.createObjectURL(blob);const anchor=document.createElement('a');anchor.href=url;anchor.download='PLUVIAM_'+folio+'_propuesta.pdf';anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}catch(err){approval.textContent=String(err.message||'Documento no disponible')}finally{pdfButton.disabled=false;}});terms.append(pdfButton);
  if(!q.contractAccepted&&q.offerDigest&&q.contractText){
   const label=document.createElement('label');const check=document.createElement('input');check.type='checkbox';check.checked=false;
   const msg=document.createElement('span');msg.textContent=' He leído el alcance, el calendario de pagos y las condiciones de esta versión. Las acepto de forma expresa.';label.append(check,msg);terms.append(label);
   const accept=document.createElement('button');accept.type='button';accept.className='button button-primary';accept.disabled=true;accept.textContent='Aceptar esta propuesta y sus condiciones';check.addEventListener('change',()=>{accept.disabled=!check.checked});accept.addEventListener('click',async()=>{if(!check.checked)return;accept.disabled=true;try{const r=await fetch('/api/contrato/aceptar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,token,offerDigest:q.offerDigest,termsVersion:q.termsVersion,agree:true})});const j=await r.json();if(!r.ok)throw Error(j.error||'No disponible');approval.textContent='Aceptación registrada; se actualizará tu expediente para mostrar opciones de pago.';check.checked=false;label.hidden=true;accept.hidden=true;document.getElementById('lookup-form')?.requestSubmit?.();}catch(err){approval.textContent='No se pudo registrar: '+err.message;accept.disabled=false}});terms.append(accept)
  }box.append(terms);
 }
 const pay=document.createElement('p');pay.textContent='Anticipo: '+(p.deposit==='paid'?'Confirmado':p.deposit?'En proceso / revisar conciliacion':'Pendiente')+' · Saldo: '+(p.final==='paid'?'Liquidado':p.final?'En proceso / revisar conciliacion':'Pendiente');box.append(pay);
 if(q.expired){const warn=document.createElement('p');warn.className='project-warning';warn.textContent='Cotizacion vencida: solicita revalidacion antes de pagar.';box.append(warn);}
 const actions=document.createElement('div');actions.className='project-actions';
 const follow=d.retellFollowup||{};
 let consentCheckbox=null,followMsg=null;
 if(follow.enabled&&follow.eligible&&!follow.consent){
  const consentLabel=document.createElement('label');consentLabel.className='project-retell-consent';
  consentCheckbox=document.createElement('input');consentCheckbox.type='checkbox';consentCheckbox.checked=false;
  const consentText=document.createElement('span');consentText.textContent='Deseo que Valeria, asistente virtual con inteligencia artificial de PLUVIAM, me llame para dar seguimiento a mi propuesta aprobada. Es opcional y puedo retirar el permiso desde este expediente.';
  consentLabel.append(consentCheckbox,consentText);box.append(consentLabel);
  followMsg=document.createElement('p');followMsg.className='project-disclaimer';followMsg.setAttribute('role','status');box.append(followMsg);
 }
 let revokeShown=false;
 const showRevoke=()=>{if(revokeShown)return;revokeShown=true;
  const revoke=document.createElement('button');revoke.type='button';revoke.className='button';revoke.textContent='Revocar autorización de llamada automática';
  const status=document.createElement('p');status.className='project-disclaimer';
  revoke.addEventListener('click',async()=>{revoke.disabled=true;status.textContent='Revocando autorización…';try{const r=await fetch('/api/lead-abandonment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,token,action:'revoke'})});if(!r.ok)throw Error('No se pudo revocar; inténtalo otra vez');status.textContent='Autorización revocada. No quedan llamadas pendientes de este seguimiento.';revoke.hidden=true;}catch(e){status.textContent=e.message;revoke.disabled=false;}});
  box.append(revoke,status);
 };
 const save=document.createElement('button');save.type='button';save.className='button button-primary';save.textContent='Descargar ficha de mi proyecto (PDF)';save.addEventListener('click',async()=>{
  const rows=['PLUVIAM | FICHA DE PROYECTO', 'Folio: '+folio,'Fecha de consulta: '+new Date().toLocaleDateString('es-MX'),'Estado: '+(statuses[d.stage]||d.stageLabel||'Pendiente'),'',
  isApproved?'Inversion aprobada: '+money(q.amountCents):'Monto: pendiente de aprobacion',isApproved?'Hitos: '+(q.milestones||[]).map(m=>m.label+' '+money(m.amountCents)).join('; '):'No hay cobro autorizado',q.expired?'Cotizacion vencida - revalidacion requerida':'',
  'Plan contractual: '+(q.paymentPlan||'50-50'),'Anticipo: '+(p.deposit==='paid'?'confirmado':'no confirmado'),'Hito de instalación: '+(p.installation==='paid'?'confirmado':'no confirmado / no aplica'),'Saldo: '+(p.final==='paid'?'liquidado':'pendiente'),'',
  'Antes de pagar verifica contrato, alcance y condiciones.','Este comprobante de consulta NO es factura ni recibo de pago.','La clave privada de acceso nunca se incluye en este documento.'];
  const url=URL.createObjectURL(buildPdf(rows));const a=document.createElement('a');a.href=url;a.download='PLUVIAM_'+folio.replace(/[^A-Z0-9-]/g,'')+'_propuesta.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  // Esta acción descarga la ficha únicamente. Nunca registra consentimiento ni inicia llamadas.
 });actions.append(save);
 const advisor=document.createElement('a');advisor.className='project-advisor';advisor.href='/contacto.html';advisor.textContent='Prefiero hablar con un asesor ↗';actions.append(advisor);
 const note=document.createElement('p');note.className='project-disclaimer';note.textContent='Esta ficha es informativa y no sustituye el contrato, la factura ni un comprobante de pago. Nunca incluye tu clave privada.';
 box.append(actions,note);
 if(consentCheckbox){
  const consentButton=document.createElement('button');consentButton.type='button';consentButton.className='button project-consent-action';consentButton.textContent='Autorizar seguimiento de Valeria';consentButton.disabled=true;consentCheckbox.addEventListener('change',()=>{consentButton.disabled=!consentCheckbox.checked;});
  consentButton.addEventListener('click',async()=>{if(!consentCheckbox.checked||!token)return;consentButton.disabled=true;followMsg.textContent='Guardando tu autorización…';try{const r=await fetch('/api/lead-abandonment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({folio,token,action:'consent',consent:true,consentVersion:follow.version})});const j=await r.json();if(!r.ok)throw Error(j.error||'No disponible');followMsg.textContent=j.alreadyRegistered?'Ya existe un seguimiento: no se programó otra llamada.':'Autorización registrada. El seguimiento queda sujeto a las condiciones vigentes.';consentCheckbox.checked=false;consentButton.disabled=true;showRevoke();}catch(e){followMsg.textContent='No se registró la autorización: '+(e.message||'error');consentButton.disabled=!consentCheckbox.checked;}});box.append(consentButton);
 }
 zone.append(box);
 if(follow.consent&&['scheduled','deferred','claimed'].includes(follow.status))showRevoke();
 if(d.recordsAvailable){
   const rec=document.createElement('section');rec.className='project-records';const heading=document.createElement('h3');heading.textContent='Documentación y seguimiento';rec.append(heading);
   const docs=Array.isArray(d.documents)?d.documents:[];
   if(!docs.length){const p=document.createElement('p');p.textContent='Todavía no hay documentos compartidos con este proyecto.';rec.append(p)}
   for(const doc of docs){const detail=document.createElement('details');const summary=document.createElement('summary');summary.textContent=String(doc.title||'Documento').slice(0,150)+' · '+String(doc.kind||'Registro').slice(0,45);const text=document.createElement('p');text.textContent=String(doc.body||'').slice(0,12000);detail.className='project-document';detail.append(summary,text);rec.append(detail)}
   // El historial autenticado se muestra en project-timeline.js; evitar duplicados.
   zone.append(rec);
 }

});
})();
