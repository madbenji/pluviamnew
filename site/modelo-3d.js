/* PLUVIAM · Visor 3D original sin bibliotecas externas. Modelo explicativo NO ingeniería. */
(()=>{'use strict';
const canvas=document.getElementById('model-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx){document.querySelector('.model-canvas-wrap').insertAdjacentHTML('afterbegin','<p>Tu navegador no admite la visualización. Usa la explicación por etapas a la derecha.</p>');return;}
const desc={
roof:['01 · CAPTACIÓN','Techo apto, agua aprovechable','Se inspeccionan superficie, pendiente, canaletas y bajantes. La captación útil depende de cubierta y clima.'],
first:['02 · PRIMERAS LLUVIAS','Separación del arrastre inicial','El desviador inicial, cuando el diseño lo requiere, aparta parte del agua que arrastra polvo y suciedad superficial.'],
filter:['03 · FILTRACIÓN','Tratamiento según destino','Mallas y filtros seleccionados para el uso y la calidad requeridos. El agua NO es potable por pasar por un filtro ilustrado.'],
tank:['04 · ALMACENAMIENTO','Reserva que se adapta al espacio','Tanque o cisterna con volumen, accesos, rebosadero, estructura y limpieza sujetos a revisión técnica.'],
distribution:['05 · DISTRIBUCIÓN','Agua a los puntos permitidos','Una bomba y tuberías separadas pueden conducir el agua a sanitarios, riego o limpieza según el proyecto aprobado.'],
maintenance:['06 · MANTENIMIENTO','Diseño para durar','Se inspeccionan canaletas, filtros, tanque, válvulas y bomba. La frecuencia depende de lluvia, uso y componentes.']
};
const worldHotspots={roof:[0,3.1,0],first:[-2.75,1.2,0],filter:[-1.85,.5,1.9],tank:[0.1,.7,2.2],distribution:[1.9,1.4,.55],maintenance:[2.95,.28,1.7]};
const labels={roof:'TECHO',first:'PRIMERA LLUVIA',filter:'FILTRO',tank:'CISTERNA',distribution:'DISTRIBUCIÓN',maintenance:'SERVICIO'};
let yaw=-.64,pitch=.31,zoom=1,paused=false,spinning=false,part='roof',elapsed=0,last=0,raf=0,drag=null,screenHotspots=[],pixelRatio=1,width=1100,height=700;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t;
const V=(x,y,z)=>[x,y,z],mix=(a,b,t)=>a.map((v,i)=>lerp(v,b[i],t));
function proj(p){const xx=p[0],yy=p[1]-1.1,zz=p[2];const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);const rx=xx*cy-zz*sy;const rz=xx*sy+zz*cy;const ry=yy*cp-rz*sp,depth=yy*sp+rz*cp;const scale=Math.min(width/10.5,height/7.8)*zoom*8/(8+depth*.35);return {x:width*.50+rx*scale,y:height*.56-ry*scale,depth};}
let drawCalls=[];
function poly(points,fill,stroke='#6dc9da',line=1.2,alpha=1){const p=points.map(proj);const d=p.reduce((a,b)=>a+b.depth,0)/p.length;drawCalls.push({d,paint(){ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke()}ctx.restore()}})}
function line(points,color='#4cebd9',thick=5,alpha=1){let p=points.map(proj),d=p.reduce((a,b)=>a+b.depth,0)/p.length;drawCalls.push({d,paint(){ctx.save();ctx.beginPath();ctx.moveTo(p[0].x,p[0].y);for(let i=1;i<p.length;i++)ctx.lineTo(p[i].x,p[i].y);ctx.strokeStyle=color;ctx.lineWidth=thick;ctx.globalAlpha=alpha;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();ctx.restore()}})}
function box(x,y,z,sx,sy,sz,face,highlight=false,alpha=1){const p=[V(x-sx/2,y-sy/2,z-sz/2),V(x+sx/2,y-sy/2,z-sz/2),V(x+sx/2,y+sy/2,z-sz/2),V(x-sx/2,y+sy/2,z-sz/2),V(x-sx/2,y-sy/2,z+sz/2),V(x+sx/2,y-sy/2,z+sz/2),V(x+sx/2,y+sy/2,z+sz/2),V(x-sx/2,y+sy/2,z+sz/2)];const edge=highlight?'#8fffee':'#499fb3';poly([p[0],p[1],p[2],p[3]],face,edge,highlight?2.5:1,alpha);poly([p[4],p[5],p[6],p[7]],face,edge,highlight?2.5:1,alpha);poly([p[3],p[2],p[6],p[7]],face,edge,highlight?2.5:1,alpha);poly([p[0],p[3],p[7],p[4]],face,edge,highlight?2.5:1,alpha);poly([p[1],p[2],p[6],p[5]],face,edge,highlight?2.5:1,alpha)}
function cylinder(x,y,z,r,h,color,active=false){const N=14;for(let j=0;j<N;j++){const a=2*Math.PI*j/N,b=2*Math.PI*(j+1)/N;poly([V(x+r*Math.cos(a),y,z+r*Math.sin(a)),V(x+r*Math.cos(b),y,z+r*Math.sin(b)),V(x+r*Math.cos(b),y+h,z+r*Math.sin(b)),V(x+r*Math.cos(a),y+h,z+r*Math.sin(a))],color,active?'#b8fff7':'#32a5c5',active?2:1,.9)}let top=[];for(let j=0;j<N;j++){const a=2*Math.PI*j/N;top.push(V(x+r*Math.cos(a),y+h,z+r*Math.sin(a)))}poly(top,'#1c6f8a',active?'#b9fff6':'#55c3d2',active?2:1)}
function moveWater(path,t){const n=path.length-1,segment=clamp(t,0,.999)*n,i=Math.floor(segment);return mix(path[i],path[i+1],segment-i)}
const lines={roof:[V(-2.55,2.73,-1.9),V(-2.55,2.55,1.55)],first:[V(-2.55,2.55,1.55),V(-2.70,.55,1.55)],filter:[V(-2.70,.55,1.55),V(-1.8,.55,1.8)],tank:[V(-1.8,.55,1.8),V(-.1,.8,2.1)],distribution:[V(.2,.7,2.1),V(1.95,.7,2.1),V(1.95,1.64,.45)]};
function drawScene(t){drawCalls=[];screenHotspots=[];const active=k=>part===k;
// Plan base y huella en escala ilustrativa
poly([V(-3.55,-.1,-3.25),V(3.55,-.1,-3.25),V(3.55,-.1,3.35),V(-3.55,-.1,3.35)],'#102b3c','#2b7891',1.3,.9);
for(let a=-3;a<=3;a++){line([V(a,-.095,-3),V(a,-.095,3)],'#1a4b60',.8,.6);line([V(-3,-.095,a),V(3,-.095,a)],'#1a4b60',.8,.6)}
// Casa en sección: estructura translúcida, frente abierto
poly([V(-2.55,0,-1.6),V(2.55,0,-1.6),V(2.55,2.4,-1.6),V(-2.55,2.4,-1.6)],'rgba(26,71,86,.53)','#6cb7c6',1.2,.75);
poly([V(-2.55,0,-1.6),V(-2.55,0,1.6),V(-2.55,2.4,1.6),V(-2.55,2.4,-1.6)],'rgba(20,64,81,.49)','#6cb7c6',1.2,.75);
poly([V(2.55,0,-1.6),V(2.55,0,1.6),V(2.55,2.4,1.6),V(2.55,2.4,-1.6)],'rgba(20,64,81,.42)','#6cb7c6',1.2,.72);
// Aguas inclinadas 3D
poly([V(-2.95,2.45,-2.00),V(0,3.50,-2.00),V(0,3.50,2.00),V(-2.95,2.45,2.00)],active('roof')?'#21b8c6':'#255069',active('roof')?'#a6fff9':'#4dabca',active('roof')?3:1.2,.9);
poly([V(0,3.50,-2),V(2.95,2.45,-2),V(2.95,2.45,2),V(0,3.50,2)],active('roof')?'#207d95':'#183b54',active('roof')?'#a6fff9':'#4dabca',active('roof')?3:1.2,.83);
line([V(-2.95,2.43,-2.05),V(-2.95,2.43,2.05)],active('roof')?'#b6fff2':'#44e3cb',8);
line([V(0,3.5,-2),V(0,3.5,2)],'#72d7ee',2,0.5);
for(let x of [-1.25,.1,1.45]){line([V(x,0,-1.61),V(x,2.25,-1.61)],'#60aabf',2,.8)}
// Medidores/filtro, desviador, tanque, bomba, distribución
cylinder(-2.72,.25,1.65,.28,1.4,active('first')?'#16857d':'#194963',active('first'));
cylinder(-1.80,.14,1.82,.32,.8,active('filter')?'#1b988f':'#1b6374',active('filter'));
for(let y of [.35,.52,.7])line([V(-2.05,y,1.82),V(-1.55,y,1.82)],active('filter')?'#bbfff0':'#76cbd7',2);
cylinder(-.1,0,2.18,.77,1.35,active('tank')?'#176b86':'#14516e',active('tank'));
// Agua visible en cisterna, nivel ilustrativo
poly([V(-.7,.33,1.78),V(.5,.33,1.78),V(.5,.33,2.65),V(-.7,.33,2.65)],'#22bce0','#a2faff',1.7,.6);
box(1.15,.35,2.18,.72,.60,.66,active('distribution')?'#257e92':'#193b53',active('distribution'));
box(2.05,1.10,.15,.5,1.65,.48,'#203e56',active('distribution'),.8);
const paths=[...Object.entries(lines)];for(const [k,path] of paths){line(path,k===part?'#d4fff0':'#18cfca',k===part?9:6,k===part?1:.7)}
line([V(-2.75,.9,1.58),V(-2.75,.35,1.58)],'#bff9ec',2);
box(2.74,.18,1.95,.48,.35,.48,active('maintenance')?'#20a48f':'#17354c',active('maintenance'));
// Component water-motion globules
if(!paused){for(const [k,path] of paths){for(let i=0;i<3;i++){const q=moveWater(path,((t*.00014+i/3)%1));drawCalls.push({d:proj(q).depth-.01,paint(){const p=proj(q);ctx.fillStyle=k===part?'#e6fff9':'#67e7ef';ctx.shadowBlur=16;ctx.shadowColor='#43f1db';ctx.beginPath();ctx.arc(p.x,p.y,clamp(3.5*zoom,2,6),0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}})}}}
// Glow hotspot 3d centers -> screen 2d
for(const [key,point] of Object.entries(worldHotspots)){const p=proj(point);screenHotspots.push({key,x:p.x,y:p.y});}
// Neater shadows come from painter order
const gradient=ctx.createRadialGradient(width*.5,height*.57,30,width*.5,height*.58,width*.6);gradient.addColorStop(0,'rgba(14,55,75,.18)');gradient.addColorStop(1,'rgba(4,18,31,.01)');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
drawCalls.sort((a,b)=>b.d-a.d);drawCalls.forEach(p=>p.paint());
// Animated rain: 3D local positions, explicitly not sensor-driven
if(!paused){const count=reduced?0:85;for(let i=0;i<count;i++){const x=((i*1.618+1)%1)*5.7-2.85,z=((i*.7548+1)%1)*3.8-1.9;const y=3.95-((t*.00048+i*.083)%1)*1.65;const a=proj(V(x,y,z)),b=proj(V(x-.06,y-.18,z));ctx.strokeStyle='rgba(132,242,255,.52)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
for(const h of screenHotspots){const current=h.key===part;ctx.save();ctx.shadowColor=current?'#58fff0':'#1abdc3';ctx.shadowBlur=current?24:7;ctx.beginPath();ctx.arc(h.x,h.y,current?14:11,0,Math.PI*2);ctx.fillStyle=current?'#d4fff2':'#145771';ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle=current?'#fff':'#a3f5f4';ctx.stroke();ctx.fillStyle=current?'#003647':'#e2fbff';ctx.font='800 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(Object.keys(desc).indexOf(h.key)+1),h.x,h.y+.5);ctx.restore();}
}
function frame(now){if(!last)last=now;let dt=clamp(now-last,0,100);last=now;if(!paused&&!reduced)elapsed+=dt;if(spinning&&!reduced)yaw+=dt*.00022;resize();ctx.clearRect(0,0,width,height);drawScene(elapsed);document.getElementById('model-angle').textContent=`${Math.round(yaw*180/Math.PI)}° / ${Math.round(pitch*180/Math.PI)}°`;raf=requestAnimationFrame(frame)}
function resize(){const rect=canvas.getBoundingClientRect(),w=Math.max(280,Math.round(rect.width)),h=Math.max(250,Math.round(rect.height));pixelRatio=Math.min(2,window.devicePixelRatio||1);if(canvas.width!==Math.round(w*pixelRatio)||canvas.height!==Math.round(h*pixelRatio)){canvas.width=Math.round(w*pixelRatio);canvas.height=Math.round(h*pixelRatio)}width=w;height=h;ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0)}
function show(id){if(!desc[id])return;part=id;document.querySelectorAll('[data-model-part]').forEach(b=>{const act=b.dataset.modelPart===id;b.classList.toggle('is-current',act);b.setAttribute('aria-pressed',String(act))});const d=desc[id];document.getElementById('model-info-tag').textContent=d[0];document.getElementById('model-info-title').textContent=d[1];document.getElementById('model-info-text').textContent=d[2];}
document.querySelectorAll('[data-model-part]').forEach(b=>b.addEventListener('click',()=>show(b.dataset.modelPart)));
canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false}});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>3)drag.moved=true;yaw=clamp(yaw+dx*.009,-Math.PI*2,Math.PI*2);pitch=clamp(pitch-dy*.006,-.10,.90);drag.x=e.clientX;drag.y=e.clientY});
canvas.addEventListener('pointerup',e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(moved)return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;const match=screenHotspots.find(h=>Math.hypot(h.x-x,h.y-y)<19);if(match)show(match.key)});
canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){yaw+=(e.key==='ArrowLeft'?-1:1)*.11;e.preventDefault()}if(e.key==='ArrowUp'||e.key==='ArrowDown'){pitch=clamp(pitch+(e.key==='ArrowUp'?1:-1)*.10,-.1,.9);e.preventDefault()}});
canvas.addEventListener('wheel',e=>{zoom=clamp(zoom+Math.sign(-e.deltaY)*.06,.7,1.5);document.getElementById('model-zoom').value=Math.round(zoom*100);e.preventDefault()},{passive:false});
document.getElementById('model-zoom').addEventListener('input',e=>{zoom=Number(e.target.value)/100});
document.getElementById('model-rain').addEventListener('click',e=>{paused=!paused;e.currentTarget.setAttribute('aria-pressed',String(!paused));e.currentTarget.textContent=paused?'▶ Lluvia':'⏸ Lluvia'});
document.getElementById('model-spin').addEventListener('click',e=>{spinning=!spinning;e.currentTarget.setAttribute('aria-pressed',String(spinning))});
document.getElementById('model-reset').addEventListener('click',()=>{yaw=-.64;pitch=.31;zoom=1;document.getElementById('model-zoom').value=100;show('roof')});
if(document.hidden)paused=true;document.addEventListener('visibilitychange',()=>{if(document.hidden)last=0});
show('roof');resize();raf=requestAnimationFrame(frame);
})();
