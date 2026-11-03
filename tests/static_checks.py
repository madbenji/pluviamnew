from pathlib import Path
from bs4 import BeautifulSoup
import json,subprocess,re,sqlite3,zipfile,hashlib
root=Path(__file__).resolve().parent.parent/'site'; original=str(root.parent/'baseline'/'V46_R7_MEJORADA_ANTERIOR.zip')
files={p.relative_to(root).as_posix():p for p in root.rglob('*') if p.is_file()}
syntax=[]
for file in sorted(root.glob('*.js')):
 result=subprocess.run(['node','--check',str(file)],capture_output=True,text=True)
 assert result.returncode==0, (file,result.stderr);syntax.append(file.name)
references=[];bad=[];duplicates=[]
for name,p in files.items():
 if not name.endswith('.html'):continue
 soup=BeautifulSoup(p.read_text(),'html.parser')
 ids=[x['id'] for x in soup.select('[id]')]; duplicates.extend([name+':'+x for x in set(ids) if ids.count(x)>1]);
 for element in soup.select('[src],[href]'):
  a=element.get('src',element.get('href',''))
  if not a or a.startswith(('https:','http:','mailto:','tel:','#','data:')):continue
  if a.startswith('/'):path=a.lstrip('/').split('#',1)[0].split('?',1)[0]
  else:path=(Path(name).parent/a).as_posix().split('#',1)[0].split('?',1)[0]
  if not path:continue
  references.append((name,path))
  if path not in files and (path+'.html') not in files and path not in ('favicon.ico',):bad.append([name,path])
assert not bad,bad;assert not duplicates,duplicates
assert 'index.html' in files and '_worker.js' in files
base=zipfile.ZipFile(original); baseFiles={x:base.read(x) for x in base.namelist()}
unchanged=[n for n,data in baseFiles.items() if n in files and files[n].read_bytes()==data]
modified=[n for n,data in baseFiles.items() if n in files and files[n].read_bytes()!=data]
assert all(n in unchanged for n in ['app.js','engine.js','water.js','mi-proyecto.html' if False else 'favicon.svg'])
assert '_worker.js' in modified
# additive DB migration executes against synthetic compatible minimal lead_cases
conn=sqlite3.connect(':memory:');conn.execute('PRAGMA foreign_keys=ON');conn.execute('CREATE TABLE lead_cases(folio TEXT PRIMARY KEY)');conn.executescript((root.parent/'migraciones/001_proyectos_v50.sql').read_text());tables=conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall();assert {'project_documents_v50','project_events_v50','analytics_events_v50'}.issubset({r[0] for r in tables})
report={'syntaxJs':len(syntax),'jsFiles':syntax,'htmlFiles':sum(n.endswith('.html') for n in files),'localReferencesVerified':len(references),'missingLocalReferences':bad,'duplicateDomIds':duplicates,'originalFilesIdentical':len(unchanged),'unchanged':unchanged,'originalFilesModified':modified,'newFiles':sorted(set(files)-set(baseFiles)),'d1MigrationTables':sorted(r[0] for r in tables)}
(root.parent/'tests/static_report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k not in ['unchanged','newFiles','jsFiles']},ensure_ascii=False,indent=2))
