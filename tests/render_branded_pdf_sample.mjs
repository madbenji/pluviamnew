import fs from 'node:fs';import vm from 'node:vm';
const src=fs.readFileSync(new URL('../site/_worker.js',import.meta.url),'utf8');
const begin=src.indexOf('function brandedPdf(data){');
const end=src.indexOf('function quotePdf(',begin);
if(begin<0||end<0)throw Error('missing');
const builder=vm.runInNewContext('(()=>{'+src.slice(begin,end)+'return brandedPdf})()',{});
const raw=builder({kind:'propuesta',folio:'PLV-DEMO-2026-123456',quoteId:'COT-DEMO-2026',approvedAt:'25 oct 2026',amountCents:10000000,currency:'MXN',paymentPlan:'50-50',milestones:[{label:'Anticipo antes de ejecutar',amountCents:5000000},{label:'Entrega y conformidad',amountCents:5000000}],summary:'Ingeniería e instalación de captación de agua pluvial para una casa, sujeta a visita técnica, verificación de cubierta, redes separadas y usos permitidos.',contractText:'Contrato para evaluación comercial. Se aclara la obra civil oculta, el acceso a la propiedad, los permisos del condominio, el volumen de lluvia no garantizado, mantenimiento, cambios por escrito, cancelaciones y garantías legales. No se retienen módulos de seguridad para asegurar pagos. Comisionamiento técnico transparente y seguro.',termsVersion:'DEMO-NO-VINCULANTE',offerDigest:'ejemplo-sintetico-no-firma-no-comercial',acceptedAt:'PENDIENTE'});
const out=new URL('../EJEMPLO_PDF_PLUVIAM_BRANDED_NO_VINCULANTE.pdf',import.meta.url).pathname;fs.writeFileSync(out,Buffer.from(raw));console.log('PDF real',out,raw.length);
