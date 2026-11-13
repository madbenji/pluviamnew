/* Pluviam project readiness · v3 exploratory browser-only, no PII, no backend.
   Production qualification/routing must live on the authenticated server with consent evidence. */
(function(){'use strict';
const root=document.getElementById('qual-root');if(!root)return;
const Q=[
{phase:'01 / CONTEXTO',title:'¿Dónde está tu propiedad?',choices:[['Guadalajara o Zapopan','gdl'],['Ciudad de México','cdmx'],['Estado de México','edomex'],['Otra localidad','other']]},
{phase:'01 / CONTEXTO',title:'¿Qué tipo de inmueble es?',choices:[['Casa o residencia','casa'],['Condominio o conjunto','condo'],['Negocio u oficina','comercial'],['Industrial / desarrollo','industrial']]},
{phase:'01 / CONTEXTO',title:'¿Qué te gustaría resolver?',choices:[['Aprovechar el agua de lluvia','lluvia'],['Disponer de mayor reserva','reserva'],['Reducir dependencia del suministro','continuidad'],['Integrar agua al proyecto nuevo','obra']]},
{phase:'01 / CONTEXTO',title:'¿Para qué usarías el agua?',choices:[['Riego, limpieza y exteriores','exterior'],['Sanitarios y usos no potables','no-potable'],['Procesos / servicios del inmueble','procesos'],['Quiero analizar usos, incluso consumo','evaluar']]},
{phase:'02 / INTENCIÓN',title:'¿En qué etapa estás?',choices:[['Todavía estoy explorando','explorando'],['Comparando soluciones','comparando'],['Buscando evaluación técnica','evaluacion'],['Listo para decidir con una propuesta','listo']]},
{phase:'02 / INTENCIÓN',title:'¿Puedes autorizar el proyecto?',choices:[['Soy propietario/a o decisor/a','dueno'],['Tengo autorización para gestionarlo','autorizado'],['Asesoro a quien decide','asesor'],['Todavía no tengo autorización','sin-permiso']]},
{phase:'02 / INTENCIÓN',title:'¿Qué sabes de la infraestructura?',choices:[['Techo y espacio de almacenamiento identificados','espacio'],['Ya tengo tinaco o cisterna','cisterna'],['Proyecto en planos / diseño','planos'],['Todavía necesito revisar si es viable','incierto']]},
{phase:'03 / INVERSIÓN',title:'¿En qué plazo quieres avanzar?',choices:[['Durante los próximos 3 meses','3m'],['En 3 a 6 meses','6m'],['Más adelante','later'],['Aún no lo sé','unknown']]},
{phase:'03 / INVERSIÓN',title:'¿Qué tan definido tienes el presupuesto?',choices:[['Tengo un presupuesto aprobado','aprobado'],['Tengo un rango reservado','rango'],['Necesito una evaluación para decidir','evaluar'],['Solo estoy investigando precios','curioso']]},
{phase:'03 / INVERSIÓN',title:'Si hace falta una visita profesional, ¿cómo prefieres avanzar?',choices:[['Estoy dispuesto/a a pagar el diagnóstico si conozco alcance y precio','si'],['Primero quiero una orientación remota y conocer el costo','orientacion'],['Solo contrataría si el diagnóstico fuera gratuito','gratis'],['No tengo previsto avanzar a visita','no-visita']]}
];
let step=0,answers=new Array(Q.length).fill(null);const back=document.getElementById('qual-back'),next=document.getElementById('qual-next'),stepLabel=document.getElementById('qual-step'),phase=document.getElementById('qual-phase'),progress=document.getElementById('qual-progress');
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function determine(){
  const decider=['dueno','autorizado'].includes(answers[5]);
  const budget=['aprobado','rango'].includes(answers[8]);
  const paid=answers[9]==='si';
  const intent=['evaluacion','listo'].includes(answers[4]);
  const near=['3m','6m'].includes(answers[7]);
  if(!decider||answers[9]==='gratis'||answers[9]==='no-visita'||answers[8]==='curioso'||answers[4]==='explorando')return 'explorar';
  if(paid && intent && near && budget)return 'evaluacion';
  return 'orientacion';
}
function summary(){const lines=['PLUVIAM · RESUMEN DE PRECALIFICACIÓN (SIN DATOS DE CONTACTO)','Respuestas declaradas voluntariamente; no equivalen a diagnóstico o cotización.',''];Q.forEach((q,i)=>{const c=q.choices.find(x=>x[1]===answers[i]);lines.push((i+1)+'. '+q.title+' — '+(c?c[0]:'Sin respuesta'))});lines.push('','Solicito revisión de próximos pasos conforme a condiciones, disponibilidad y privacidad publicadas.');return lines.join('\n')}
function result(){
 const tier=determine();const isA=tier==='evaluacion',isB=tier==='orientacion';const name=isA?'Tu proyecto merece una revisión profesional.':isB?'Empecemos con orientación remota.':'Explora alternativas sin presión.';
 const detail=isA?'Tus respuestas sugieren intención, autorización y disposición para considerar un diagnóstico pagado. Primero Pluviam debe verificar cobertura, técnico habilitado, disponibilidad y alcance.':isB?'Hay potencial, pero conviene resolver primero aspectos de presupuesto, decisión o viabilidad en una conversación remota breve, según disponibilidad.':'Por ahora la mejor ruta es investigar y preparar los datos necesarios. No hace falta reservar ni pagar una visita.';
 const icon=isA?'✓':isB?'⌂':'◌';const actions=isA?'<a class="btn primary" id="qual-contact" href="#">Solicitar revisión de diagnóstico ↗</a><a class="btn outline" href="proyectos">Entender el proceso</a>':isB?'<a class="btn primary" id="qual-contact" href="#">Solicitar orientación inicial ↗</a><a class="btn outline" href="descubre">Ver test de soluciones</a>':'<a class="btn primary" href="catalogo">Explorar la colección ↗</a><a class="btn outline" id="qual-contact" href="#">Enviar mi consulta ↗</a>';
 return `<div class="qual-result"><div class="result-mark">${icon}</div><div class="eyebrow" style="margin-top:20px">RUTA SUGERIDA · NO RESERVA VISITA</div><h2>${name}</h2><p class="muted">${detail}</p>${isA?'<div class="qual-price">Visita profesional: servicio pagado, precio y entregables por confirmar</div>':''}<div class="result-bullets"><div><strong>Sin compromiso</strong> Este resultado es orientativo.</div><div><strong>Siguiente paso</strong> Revisión humana antes de cualquier visita o pago.</div></div><div class="result-buttons">${actions}</div><p class="footnote">No calculamos tu capacidad de pago a partir de la zona. Usamos únicamente la información que elegiste y no enviamos respuestas automáticamente.</p></div>`
}
function render(){const resultMode=step===Q.length;stepLabel.textContent=resultMode?'TU SIGUIENTE PASO':`PREGUNTA ${String(step+1).padStart(2,'0')} / 10`;phase.textContent=resultMode?'ORIENTACIÓN INICIAL':Q[step].phase;progress.style.width=(resultMode?100:((step+1)/Q.length*100))+'%';if(resultMode){root.innerHTML=result();back.textContent='← Revisar respuestas';next.textContent='Volver a empezar ↻';next.disabled=false;const buttons=document.querySelector('.result-buttons');if(buttons&&!buttons.querySelector('[data-call-advisor]'))buttons.insertAdjacentHTML('beforeend','<a class="btn outline" data-call-advisor href="/agendar?desde=/store/diagnostico">Solicitar llamada con asesor ↗</a>');const a=document.getElementById('qual-contact');if(a)a.href='mailto:pluviammx@gmail.com?subject='+encodeURIComponent('Pluviam · Solicitud de revisión de proyecto')+'&body='+encodeURIComponent(summary());return}
 const q=Q[step];root.innerHTML=`<div class="eyebrow" style="margin-bottom:13px">${q.phase}</div><h2>${escapeHtml(q.title)}</h2><div class="qual-options">${q.choices.map(([label,value])=>`<button type="button" class="qual-choice" data-choice="${escapeHtml(value)}" aria-pressed="${answers[step]===value?'true':'false'}"><span>${escapeHtml(label)}</span><span class="radio"></span></button>`).join('')}</div>`;
 next.textContent=step===Q.length-1?'Conocer mi ruta ↗':'Continuar →';next.disabled=!answers[step];back.disabled=step===0;back.textContent='← Atrás';}
root.addEventListener('click',e=>{const b=e.target.closest('[data-choice]');if(!b)return;answers[step]=b.dataset.choice;render()});
back.addEventListener('click',()=>{if(step>0)step--;render()});next.addEventListener('click',()=>{if(step===Q.length){step=0;answers=Array(Q.length).fill(null);render();return}if(!answers[step])return;step++;render()});render();
})();
