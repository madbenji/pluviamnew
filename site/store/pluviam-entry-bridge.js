/* Pluviam original: preserve layout and backend; add tienda link; normalise broken internal .html routes. */
(()=>{'use strict';
const PAGES=new Set(['agendar','cotizacion','modelo-3d','academia','mi-proyecto','contacto','privacidad','pagar','colaborar']);
function fix(a){try{const u=new URL(a.getAttribute('href'),location.href);if(u.origin!==location.origin)return;const parts=u.pathname.split('/');const name=parts.at(-1)||'';if(name.endsWith('.html')&&PAGES.has(name.slice(0,-5))){u.pathname=u.pathname.slice(0,-5);if(name==='agendar.html')u.searchParams.delete('desde');a.href=u.pathname+u.search+u.hash;}}catch{}}
function init(){document.querySelectorAll('a[href]').forEach(fix);const nav=document.querySelector('header nav, nav[aria-label*=principal], nav');if(!nav)return;if([...nav.querySelectorAll('a')].some(a=>a.pathname==='/store/' || a.textContent.trim().toLowerCase()==='tienda'))return;const a=document.createElement('a');a.href='/store/';a.textContent='Tienda';a.dataset.pluviamTienda='';a.setAttribute('aria-label','Tienda Pluviam, kits y diseño de soluciones');const anchor=[...nav.querySelectorAll('a')].find(n=>/cotizaci[oó]n/i.test(n.textContent||''));if(anchor)anchor.after(a);else nav.append(a);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
