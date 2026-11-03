import fs from 'node:fs';import vm from 'node:vm';
const content=fs.readFileSync(new URL('../site/project-docs.js',import.meta.url),'utf8');
const begin=content.indexOf('function buildPdf(lines){'),end=content.indexOf('const statuses=',begin);
const context={Blob, input:(x)=>String(x).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,' ')};
const generate=vm.runInNewContext('(function(){'+content.slice(begin,end)+'return buildPdf})()',context);
const blob=generate(['PLUVIAM - PROPUESTA', 'Folio: PLV-20261024-12345678','Anticipo: $50,000 MXN','Pendiente de aprobación contractual']);
const out=new URL('./sample-propuesta.pdf',import.meta.url).pathname;fs.writeFileSync(out,new Uint8Array(await blob.arrayBuffer()));console.log(out,blob.size);
