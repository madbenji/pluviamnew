from pathlib import Path
import json,re,base64,mimetypes
from playwright.sync_api import sync_playwright
site=Path('/mnt/data/PLUVIAM_CIERRE_COHERENCIA_2026-10-25_CANDIDATO/site')
shots=Path('/mnt/data/PLUVIAM_CIERRE_COHERENCIA_2026-10-25_CANDIDATO/qa_coherencia/capturas');shots.mkdir(exist_ok=True)
reports=[]
def markup(filename):
 s=(site/filename).read_text()
 def repl_link(m):
  href=m.group(1)
  if not href.endswith('.css'):return m.group(0)
  cssfile=site/href.lstrip('/')
  return '<style>'+cssfile.read_text().replace('</style>','<\\/style>')+'</style>' if cssfile.exists() else ''
 s=re.sub(r'<link\b[^>]*?href="([^"]+)"[^>]*>',repl_link,s,flags=re.I)
 def repl_img(m):
  path=m.group(2)
  file=site/path.lstrip('/')
  if not file.is_file():return m.group(0)
  typ=mimetypes.guess_type(str(file))[0] or 'image/png'
  return m.group(1)+'data:'+typ+';base64,'+base64.b64encode(file.read_bytes()).decode()+'"'
 s=re.sub(r'((?:src|href)=")(/[^"\s]+\.(?:png|jpg|jpeg|svg|webp))"',repl_img,s,flags=re.I)
 s=re.sub(r'<script\b[^>]*>.*?</script>','',s,flags=re.I|re.S)
 return s
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-gpu'])
 for w in [390,768,1280]:
  page=b.new_page(viewport={'width':w,'height':844},device_scale_factor=1)
  for fn in ['index.html','academia.html','cotizacion.html','contacto.html','mi-proyecto.html','privacidad.html','modelo-3d.html','404.html']:
   try:
    page.set_content(markup(fn),wait_until='domcontentloaded',timeout=12000)
    page.wait_for_timeout(90)
    data=page.evaluate('''() => ({viewport:window.innerWidth, scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,title:document.title,h1:document.querySelector('h1')?.textContent?.slice(0,75)||''})''')
    data['page']=fn;data['overflow']=data['scrollWidth']>w+2
    if w==390 and fn in ['cotizacion.html','contacto.html','modelo-3d.html','mi-proyecto.html','privacidad.html']:
     data['coherenceNavVisible']=page.locator('.pluviam-coherence-nav').is_visible()
     data['contactLinkVisible']=page.locator('.pluviam-coherence-nav a[href="/contacto.html"]').is_visible()
    if w in [390,768] and fn in ['index.html','academia.html']:
     nav=page.locator('.pluviam-mobile-menu summary');data['menuVisible']=nav.is_visible()
     nav.click();data['menuOpen']=page.locator('.pluviam-mobile-menu details').evaluate('(x)=>x.open')
     data['menuQuoteVisible']=page.locator('.pluviam-mobile-menu-links a[href="/cotizacion.html"]').is_visible();nav.click()
    reports.append(data)
    if w in [390,1280] and fn in ['index.html','academia.html','cotizacion.html','contacto.html','modelo-3d.html','mi-proyecto.html','privacidad.html']:
     page.screenshot(path=str(shots/f'{fn[:-5]}_{w}.png'),full_page=False)
   except Exception as e:reports.append({'page':fn,'viewport':w,'error':str(e)[:400]})
  page.close()
 b.close()
(site.parent/'qa_visual_offline.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False))
for x in reports:print(json.dumps(x,ensure_ascii=False))
print('total',len(reports),'overflows',sum(x.get('overflow',False) for x in reports),'errors',sum(bool(x.get('error')) for x in reports))
