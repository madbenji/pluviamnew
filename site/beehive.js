(()=>{'use strict';
const $=q=>document.querySelector(q),status=$('#beehive-status');
async function api(path){const r=await fetch(path,{cache:'no-store'}),j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.error||'No se pudo consultar el espacio privado.');return j}
function text(el,v){if(el)el.textContent=String(v??'—')}
async function load(){try{const me=await api('/api/beehive/me');text($('#member-name'),me.member.display_name);text($('#member-org'),me.member.organization);text($('#member-role'),me.member.role);text($('#member-status'),me.member.status);if(me.ally){text($('#ally-name'),me.ally.full_name);text($('#ally-company'),me.ally.company);text($('#ally-status'),me.ally.status);text($('#ally-coverage'),(()=>{try{return JSON.parse(me.ally.coverage_json||'[]').join(', ')}catch(_){return '—'}})())}const org=await api('/api/beehive/organization');text($('#g0-status'),org.g0?.status||'PENDING');text(status,'Identidad verificada por Cloudflare Access. Solo se muestran tu organización y proyectos autorizados.');$('#private-content').hidden=false}catch(e){text(status,e.message);$('#private-content').hidden=true}}
load();
})();
