/* Pluviam Rules Engine - deterministic, conservative, versioned v1.0.0.
   No anonymous test can confirm safety, potability, sizing, eligibility, or price.
   All checkout gates default to CLOSED. Server-side revalidation required. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./motor-kits.js'):root.PLUVIAM_KITS);if(typeof module==='object'&&module.exports)module.exports=api;else root.PLUVIAM_MOTOR=api;})(typeof globalThis!=='undefined'?globalThis:this,function(DB){'use strict';
const VERSION='1.0.0';const ids=new Map(DB.kits.map(k=>[k.id,k]));
function makeInput(raw){if(!raw||typeof raw!=='object'||Array.isArray(raw))return {ok:false,errors:['Falta una evaluación con opciones válidas']};
 const ans={};const errors=[];
 for(const [field,allowed] of Object.entries(DB.choices)){const val=raw[field]; if(!allowed.includes(val))errors.push('Respuesta inválida o ausente: '+field); else ans[field]=val;}
 ans.waterSource=DB.sourceValues.includes(raw.waterSource)?raw.waterSource:'unknown';
 ans.roofArea=DB.roofValues.includes(raw.roofArea)?raw.roofArea:'unknown';
 ans.waterTest=raw.waterTest===true;
 ans.technicalSiteApproved=raw.technicalSiteApproved===true;
 ans.g0Confirmed=raw.g0Confirmed===true;
 ans.legalApproved=raw.legalApproved===true;
 ans.finalQuoteApproved=raw.finalQuoteApproved===true;
 ans.paymentIntegrationApproved=raw.paymentIntegrationApproved===true;
 return {ok:errors.length===0,errors,value:ans};
}
const unique=xs=>[...new Set(xs)];
function evaluate(raw){const normalized=makeInput(raw); if(!normalized.ok)return {engineVersion:VERSION,result:'invalid',kit:null,products:[],reasons:normalized.errors,requirements:[],quote:{status:'no_disponible',amountMXN:null},checkoutEligible:false,reviewRequired:true};
 const a=normalized.value; const reasons=[];const requirements=[];let kitId=null;let status='exploratoria';
 const specialist=a.space==='industry'||a.space==='business'||a.use==='project';
 const potable=a.use==='drink';
 // Never route rain/well/mixed water for consumption to a consumer filter or a rainwater-only kit.
 if(potable&&['rain','well','mixed','unknown'].includes(a.waterSource)){
   status='sanitaria';kitId=null; reasons.push('El origen del agua y la calidad sanitaria no permiten recomendar un equipo para consumo sin evaluación profesional');
   requirements.push('Identificar fuente y analizar calidad conforme a requisitos aplicables','Revisión de potabilización, contaminantes y certificación de equipos por responsable competente');
 }else if(specialist){
   kitId='plu-proyecto-especial';status='especial';reasons.push('El inmueble, escala o uso requiere diseño profesional; no corresponde un kit residencial automático');
 }else if(a.goal==='captacion'&&potable){
   status='sanitaria'; reasons.push('No es válido sugerir que la lluvia captada se pueda beber directamente');requirements.push('Proyecto de tratamiento y pruebas sanitarias específicas');
 }else if(a.goal==='captacion'){
   kitId=(a.roofArea==='gt300'?'plu-inmueble-l':a.roofArea==='lt60'?'plu-lluvia-s':'plu-lluvia-m');
   status='tecnica'; reasons.push('Captación pluvial para usos no potables: configuración preliminar según espacio informado');
   if(a.roofArea==='unknown')requirements.push('Medir área útil de cubierta para dimensionar captación y almacenamiento');
   if(a.storage==='unknown')requirements.push('Confirmar cisterna, tinaco y espacio de reserva');
 }else if(a.goal==='almacenamiento'){
   if(potable){status='sanitaria';reasons.push('No se recomienda automáticamente un depósito para consumo humano sin comprobar materiales y calidad del agua');requirements.push('Definir material apto para contacto con agua potable y condiciones sanitarias');}
   else {kitId=(a.storage==='has'||a.roofArea==='lt60')?'plu-reserva-s':'plu-reserva-m'; status='tecnica'; reasons.push('Reserva preliminar por definir según demanda, capacidad y lugar de instalación');}
 }else if(a.goal==='cocina'){
   if(potable){kitId='plu-cocina';status='sanitaria';reasons.push('Posible solución de filtración de punto de uso; no se garantiza potabilidad sin analizar el agua');requirements.push('Verificar calidad del agua y alegaciones certificadas del modelo exacto');}
   else {kitId='plu-mesa';reasons.push('Accesorios de servicio como punto de partida; sin afirmaciones de tratamiento o aptitud no verificada');}
 }else {kitId='plu-mesa';reasons.push('Selección básica de artículos del hogar; confirmar el uso permitido y la ficha del producto');}
 // Nonpotable rain kits may not be sold installed from this assessment, even if all demo booleans are true.
 if(kitId){const kit=ids.get(kitId); requirements.push(...kit.requirements);if(kit.requiresSite&&!a.technicalSiteApproved)requirements.push('Visita o revisión técnica de inmueble antes de cerrar alcance');if(kit.requiresWaterTest&&!a.waterTest)requirements.push('Análisis de calidad del agua antes de prescribir tratamiento');}
 if(a.stage==='explore')reasons.push('Interés exploratorio: no corresponde reservar una visita técnica');
 const kit=kitId?ids.get(kitId):null;
 return {engineVersion:VERSION,inputVersion:'quiz-5q-v3',result:status,kit:kit?{id:kit.id,name:kit.name,tier:kit.tier,family:kit.family,img:kit.img,tagline:kit.tagline}:null,
 products:kit?kit.components.slice():[],optionals:kit?kit.optionals.slice():[],reasons:unique(reasons),requirements:unique(requirements),
 quote:{status:'sin_precio_autorizado',amountMXN:null,vatMXN:null,currency:'MXN',description:'Costo sujeto a proveedor, componentes exactos, instalación, envío, IVA y autorización D05'},
 // No production payment can be enabled by spoofing client-provided boolean flags.
 checkoutEligible:false,reviewRequired:status!=='exploratoria'||!!kit?.requiresSite,
 nextStep:status==='sanitaria'?'evaluacion-sanitaria':status==='especial'?'estudio-profesional':status==='tecnica'?'revision-tecnica':'explorar-catalogo',
 policy:{noPotabilityClaim:true,noGuaranteedSavings:true,noProviderConfirmed:true,noCheckout:true}};
}
function estimate(kitId,pricebook){ // Server-oriented helper; NEVER use localStorage as proof of price.
 const kit=ids.get(kitId);if(!kit)return {status:'invalid',amountMXN:null};
 if(!pricebook||!pricebook.approved||!pricebook.signedByFinance||!pricebook.active||!pricebook.validUntil||Date.parse(pricebook.validUntil)<Date.now())return {status:'sin_precio_autorizado',amountMXN:null};
 if(kit.requiresSite&&!pricebook.siteApproved||kit.design&&!pricebook.engineeringApproved||!pricebook.stockConfirmed||!pricebook.legalApproved)return {status:'requiere_validacion',amountMXN:null};
 const rows=kit.components.map(id=>pricebook.items&&pricebook.items[id]);
 if(rows.some(x=>!x||!Number.isSafeInteger(x.netMXNCents)||x.netMXNCents<0))return {status:'incompleto',amountMXN:null};
 const extras=pricebook.items?.installation;
 if(kit.requiresSite&&(!extras||!Number.isSafeInteger(extras.netMXNCents)))return {status:'incompleto',amountMXN:null};
 const netCents=rows.reduce((s,x)=>s+x.netMXNCents,0)+(kit.requiresSite?extras.netMXNCents:0);
 const taxRate=pricebook.taxRate;
 if(!Number.isFinite(taxRate)||taxRate<0||taxRate>1)return {status:'tasa_impuesto_no_validada',amountMXN:null};
 const taxCents=Math.round(netCents*taxRate),total=netCents+taxCents;
 if(!Number.isSafeInteger(total))return {status:'monto_invalido',amountMXN:null};
 return {status:'orientativo_interno_no_cobrable',netMXN:netCents/100,vatMXN:taxCents/100,amountMXN:total/100,pricebookVersion:pricebook.version,checkoutEligible:false};
}
return Object.freeze({VERSION,evaluate,estimate,choices:DB.choices,kitById:id=>ids.get(id)||null});
});
