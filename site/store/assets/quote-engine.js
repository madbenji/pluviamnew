/* Pluviam D05 quote draft, v1.0.0. No payment link, no client-supplied PVP.
 * Pricebook is server-authoritative in production; this client code is a demo only. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./motor-kits.js'):root.PLUVIAM_KITS);if(typeof module==='object'&&module.exports)module.exports=api;else root.PLUVIAM_QUOTES=api;})(typeof globalThis!=='undefined'?globalThis:this,function(DB){'use strict';
const kits=new Map(DB.kits.map(k=>[k.id,k]));
function draft(cart,pricebook,technicalApproval){
 const fail=(code,details)=>({status:code,amountMXN:null,checkoutEligible:false,details:details||[]});
 if(!cart||typeof cart!=='object'||Array.isArray(cart)||Object.keys(cart).length===0)return fail('carrito_vacio');
 const items=Object.entries(cart);if(items.some(([id,q])=>!id||!Number.isSafeInteger(q)||q<1||q>20))return fail('carrito_invalido');
 if(!pricebook?.approved||!pricebook?.signedByFinance||!pricebook.active||typeof pricebook.validUntil!=='string'||!Number.isFinite(Date.parse(pricebook.validUntil))||Date.parse(pricebook.validUntil)<Date.now())return fail('tarifario_no_validado');
 if(!pricebook.taxApproved)return fail('impuestos_no_validados');
 const kitIds=items.map(([id])=>id).filter(id=>kits.has(id));
 const bundled=new Set(kitIds.flatMap(id=>kits.get(id).components));
 const overlapping=items.map(([id])=>id).filter(id=>bundled.has(id));
 if(overlapping.length)return fail('traslape_kit_componente',overlapping);
 const lines=[];let subtotal=0,taxes=0;
 for(const [id,qty] of items){const sku=pricebook.skus?.[id];if(!sku||sku.approved!==true||sku.stockConfirmed!==true||!Number.isSafeInteger(sku.unitSaleExTaxCents)||sku.unitSaleExTaxCents<0||!Number.isFinite(sku.taxRate)||sku.taxRate<0||sku.taxRate>1)return fail('sku_sin_precio_inventario_o_iva',[id]);
  const kit=kits.get(id);if(kit?.requiresSite&&technicalApproval?.siteValidated!==true)return fail('proyecto_sin_validacion_tecnica',[id]);if(kit?.design&&technicalApproval?.engineerApproved!==true)return fail('ingenieria_no_aprobada',[id]);
  const net=qty*sku.unitSaleExTaxCents;const tax=Math.round(net*sku.taxRate);if(!Number.isSafeInteger(net)||!Number.isSafeInteger(tax)||!Number.isSafeInteger(subtotal+net+taxes+tax))return fail('monto_no_valido');
  subtotal+=net;taxes+=tax;lines.push({id,quantity:qty,netMXN:net/100,taxMXN:tax/100});
 }
 // This is still only an indicative snapshot; payable price must be frozen and signed on the server.
 return {status:'precio_interno_calculado_no_vinculante',netMXN:subtotal/100,taxMXN:taxes/100,amountMXN:(subtotal+taxes)/100,currency:'MXN',pricebookVersion:pricebook.version,lines,checkoutEligible:false,serverQuoteRequired:true};
}
return Object.freeze({VERSION:'1.0.0',draft});});
