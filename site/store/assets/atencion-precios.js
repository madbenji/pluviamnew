(()=>{'use strict';
const db=window.PLUVIAM_CATALOG||{products:[]};const byId=Object.fromEntries(db.products.map(p=>[p.id,p]));
const KEY='pluviam_store_cart_demo_v2';const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'{}');return v&&typeof v==='object'&&!Array.isArray(v)?v:{}}catch{return {}}};
const lines=()=>{const entries=Object.entries(read()).filter(([id,n])=>byId[id]&&Number.isInteger(n)&&n>0&&n<=20);return {entries,body:['Solicitud de propuesta PLUVIAM:','Quisiera recibir una propuesta para la siguiente selección:','',...entries.map(([id,n])=>`${n} × ${byId[id].name} (precio por validar)`),'','Precio, impuestos, cobertura, envío, alcance y disponibilidad: por confirmar por escrito.','Sin cobro ni envío automático desde esta página.'].join('\n')}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function update(){
const c=lines();const subtotal=document.getElementById('pl-guide-subtotal');if(subtotal)subtotal.textContent='Precio por validar';
for(const id of ['pl-gmail-request','request-mail']){const link=document.getElementById(id);if(link){link.removeAttribute('href');link.removeAttribute('target');link.setAttribute('aria-disabled','true');link.textContent='Solicitud preparada · sin envío automático';link.addEventListener('click',e=>{e.preventDefault();navigator.clipboard?.writeText(c.body).catch(()=>{});})}}
const summary=document.getElementById('pl-guide-cart-note');if(summary)summary.textContent=c.entries.length?'Selección guardada localmente. Precio y condiciones se confirman por escrito; no se envía ni cobra nada.':'Agrega productos para preparar una solicitud sin envío automático.';
}
function init(){update();document.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&(b.dataset.add||b.dataset.qty||b.dataset.remove||b.dataset.detailAdd||b.dataset.clearCart))setTimeout(update,0);if(b&&b.dataset.plCopyRequest){const c=lines();navigator.clipboard?.writeText(c.body).then(()=>{b.textContent='Solicitud copiada ✓';setTimeout(()=>b.textContent='Copiar solicitud',2500)}).catch(()=>{const a=document.createElement('a');a.href='data:text/plain;charset=utf-8,'+encodeURIComponent(c.body);a.download='pluviam-solicitud.txt';a.click()})}});window.addEventListener('storage',update)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
