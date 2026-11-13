const STORE_SESSIONS={admin:'beta-admin-synthetic',customer:'beta-customer-synthetic'};
const PUBLIC_CART_KEY='pluviam-public-cart';
const PUBLIC_CATALOG=[
  {id:'public-captacion',name:'Soluciones de captación de lluvia',category:'Captación',description:'Evaluación de techo, canaletas y primeras lluvias según el inmueble.',price_cents:0},
  {id:'public-filtration',name:'Filtración y consumibles',category:'Tratamiento',description:'Componentes seleccionados para el uso autorizado y sujetos a homologación.',price_cents:0},
  {id:'public-storage',name:'Reserva y almacenamiento',category:'Reserva',description:'Tanques, cisternas y bombeo definidos después del diagnóstico técnico.',price_cents:0},
  {id:'public-care',name:'HI Care y mantenimiento',category:'Continuidad',description:'Inspección, filtros y mantenimiento según sistema y disponibilidad.',price_cents:0}
];
const store$=(selector)=>typeof document==='undefined'?null:document.querySelector(selector);
const escapeStore=(value)=>String(value??'').replace(/[&<>"']/g,(character)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const storeSession=()=>sessionStorage.getItem('pluviam-beta-session')||'';
async function storeApi(path,options={}){
  const headers={'Content-Type':'application/json',...(options.headers||{})};
  if(storeSession())headers['X-Beta-Session']=storeSession();
  const response=await fetch(path,{...options,headers,credentials:'same-origin',cache:'no-store'});
  const data=await response.json().catch(()=>({error:'Respuesta inválida'}));
  if(!response.ok)throw Error(data.error||'Solicitud no disponible');
  return data;
}
function storeMessage(value,error=false){const element=store$('#store-status');if(element){element.textContent=value;element.classList.toggle('error',error)}}
function storeAccessControl(){
  const wrap=store$('[data-beta-session]');if(!wrap)return;
  const current=storeSession();
  wrap.innerHTML='<label>Identidad de Preview<select id="store-session"><option value="">Cloudflare Access (recomendado)</option><option value="customer">Cliente sintético</option><option value="admin">Operaciones sintéticas</option></select></label><div data-demo-note>Access se resuelve server-side; las sesiones sintéticas sólo sirven para QA cerrado.</div>';
  const select=store$('#store-session');select.value=Object.keys(STORE_SESSIONS).find((key)=>STORE_SESSIONS[key]===current)||'';
  select.addEventListener('change',()=>{if(select.value)sessionStorage.setItem('pluviam-beta-session',STORE_SESSIONS[select.value]);else sessionStorage.removeItem('pluviam-beta-session');location.reload()});
}
function publicCart(){try{const value=JSON.parse(sessionStorage.getItem(PUBLIC_CART_KEY)||'[]');return Array.isArray(value)?value:[]}catch{return[]}}
function savePublicCart(cart){sessionStorage.setItem(PUBLIC_CART_KEY,JSON.stringify(cart))}
function renderPublicCart(){
  const cart=publicCart(),target=store$('#store-cart-items'),total=store$('#store-cart-total'),order=store$('#store-order');
  if(!cart.length){target.innerHTML='<div class="store-empty">Tu selección está vacía.</div>';total.textContent='Precio tras diagnóstico';order.disabled=true;return}
  target.innerHTML=cart.map((item)=>'<div class="cart-row"><span>'+escapeStore(item.name)+'<small>Cantidad: '+item.quantity+' · precio por homologar</small></span><strong>—</strong></div>').join('');
  total.textContent='Se confirma después del diagnóstico';order.disabled=false;
}
function renderCatalog(catalog,publicMode=false){
  const grid=store$('#store-catalog-grid');
  grid.innerHTML=catalog.map((item)=>'<article class="store-card"><span class="category">'+escapeStore(item.category)+'</span><h3>'+escapeStore(item.name)+'</h3><p>'+escapeStore(item.description)+'</p><div class="price">'+(Number(item.price_cents)>0?new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(item.price_cents/100):'Precio por homologar')+'</div><button class="store-button" type="button" data-add-item="'+escapeStore(item.id)+'">'+(publicMode?'Añadir selección':'Agregar a bolsa')+'</button></article>').join('');
  grid.querySelectorAll('[data-add-item]').forEach((button)=>button.addEventListener('click',async()=>{
    if(publicMode){const item=catalog.find((candidate)=>candidate.id===button.dataset.addItem);const cart=publicCart();const current=cart.find((candidate)=>candidate.id===item.id);if(current)current.quantity+=1;else cart.push({id:item.id,name:item.name,quantity:1});savePublicCart(cart);renderPublicCart();storeMessage('Selección guardada en esta sesión; no se envió ni cobró nada.');return}
    try{await storeApi('/api/beta/cart',{method:'POST',body:JSON.stringify({itemId:button.dataset.addItem,quantity:1})});storeMessage('Selección guardada en DB_BETA como simulación.');await loadCart()}catch(error){storeMessage(error.message,true)}
  }));
}
async function loadCart(){
  const data=await storeApi('/api/beta/cart'),target=store$('#store-cart-items'),total=store$('#store-cart-total');
  if(!data.items.length){target.innerHTML='<div class="store-empty">Tu bolsa está vacía.</div>';total.textContent='Pendiente de homologación';return}
  target.innerHTML=data.items.map((item)=>'<div class="cart-row"><span>'+escapeStore(item.name)+'<small>Cantidad: '+item.quantity+' · sin cobro</small></span><strong>—</strong></div>').join('');total.textContent='No publicado en Preview';store$('#store-order').disabled=false;
}
async function loadPlans(){const data=await storeApi('/api/beta/membership-plans'),select=store$('#membership-plan');select.innerHTML='<option value="">Selecciona un plan…</option>'+data.plans.map((plan)=>'<option value="'+escapeStore(plan.plan_code)+'">'+escapeStore(plan.name)+' · '+escapeStore(plan.price_status)+'</option>').join('')}
async function loadMemberships(){const data=await storeApi('/api/beta/memberships');store$('#membership-list').innerHTML=data.memberships.length?data.memberships.map((membership)=>'<div class="membership-row"><span>'+escapeStore(membership.name)+'<small>'+escapeStore(membership.description)+'</small></span><strong>'+escapeStore(membership.status)+'</strong></div>').join(''):'<div class="store-empty">No hay solicitudes todavía.</div>'}
function storePublicMode(){
  store$('[data-beta-session]')?.remove();
  document.querySelectorAll('.store-lower').forEach((section)=>{section.hidden=true});
  const hero=store$('.store-hero .eyebrow');if(hero)hero.textContent='PLUVIAM · CATÁLOGO Y CONTINUIDAD';
  const copy=store$('.store-hero p');if(copy)copy.textContent='Explora categorías de soluciones y guarda una selección local para continuar con el diagnóstico. No se publican precios sin homologación y esta vista no envía datos ni genera cobros.';
  const tag=store$('.demo-tag');if(tag)tag.textContent='PÚBLICO · SIN COBRO';
  const cartNote=store$('.store-cart .store-muted');if(cartNote)cartNote.textContent='Guarda una selección local y continúa al diagnóstico; no se crea un expediente.';
  const safety=store$('.store-safety');if(safety)safety.innerHTML='<strong>Controles públicos</strong><span>Pagos OFF</span><span>Correo/WhatsApp OFF</span><span>IA externa OFF</span><span>Precios por homologar</span>';
  const footer=store$('.store-footer');if(footer)footer.innerHTML='<span>PLUVIAM · WATER INFRASTRUCTURE</span><span><a href="/privacidad.html">Privacidad</a> · <a href="/contacto.html">Contacto humano</a></span>';
  store$('#store-order')?.addEventListener('click',()=>location.assign('/cotizacion.html'));
}
async function bootStore(){
  try{
    const status=await storeApi('/api/beta/status');
    storeAccessControl();storeMessage('Preview aislada · '+status.identityMode+' · pagos '+(status.paymentsEnabled?'ON':'OFF'));
    const catalog=await storeApi('/api/beta/catalog');renderCatalog(catalog.catalog);
    await Promise.all([loadCart(),loadPlans(),loadMemberships()]);
    store$('#store-order').addEventListener('click',async()=>{try{const cart=await storeApi('/api/beta/cart');for(const item of cart.items)await storeApi('/api/beta/orders',{method:'POST',body:JSON.stringify({itemId:item.item_id,quantity:item.quantity})});storeMessage('Pedido simulado registrado; no se generó cobro.')}catch(error){storeMessage(error.message,true)}});
    store$('#membership-form').addEventListener('submit',async(event)=>{event.preventDefault();try{const planCode=store$('#membership-plan').value;const data=await storeApi('/api/beta/memberships',{method:'POST',body:JSON.stringify({planCode})});storeMessage('Solicitud '+data.status+'; activación humana pendiente.');await loadMemberships()}catch(error){storeMessage(error.message,true)}});
    store$('#care-form').addEventListener('submit',async(event)=>{event.preventDefault();try{const values=Object.fromEntries(new FormData(event.currentTarget));const data=await storeApi('/api/beta/maintenance',{method:'POST',body:JSON.stringify(values)});store$('#care-result').textContent='Solicitud '+data.requestId+' · '+data.status+' · sin cobro';event.currentTarget.reset()}catch(error){store$('#care-result').textContent=error.message;store$('#care-result').classList.add('error')}});
  }catch(error){storePublicMode();renderCatalog(PUBLIC_CATALOG,true);renderPublicCart();storeMessage('Catálogo público · precios por homologar · sin cobro.')}
}
bootStore();
