from pathlib import Path
import hashlib,subprocess,json,re,sqlite3,zipfile
p=Path(__file__).resolve().parent.parent; site=p/'site'; original=Path('/mnt/data/PLUVIAM_V50_FUENTE_COMPLETA/site');
changed=[];unchanged=[]; added=[]; errors=[]
for f in site.rglob('*'):
 if not f.is_file():continue
 r=f.relative_to(site);o=original/r
 if not o.exists():added.append(r.as_posix())
 elif hashlib.sha256(f.read_bytes()).digest()==hashlib.sha256(o.read_bytes()).digest():unchanged.append(r.as_posix())
 else:changed.append(r.as_posix())
for r in sorted([f.relative_to(original) for f in original.rglob('*') if f.is_file()]):
 if not (site/r).exists():errors.append('missing:'+r.as_posix())
assert not errors,errors
assert set(changed)=={'_worker.js','project-docs.js','project-v50.css','mi-proyecto.js'},changed
assert all(x in unchanged for x in ['app.js','engine.js','water.js','modelo-3d.js','admin.js','index.html','admin.html','mi-proyecto.html','styles.css','roi-r7.js'])
for f in list(site.glob('*.js'))+[p/'retell-worker/index.js',p/'backend/retell-pages.module.js']:
 r=subprocess.run(['node','--check',str(f)],capture_output=True,text=True)
 assert r.returncode==0,(f,r.stderr)
js=sorted(f.name for f in site.glob('*.js'))
worker=(site/'_worker.js').read_text();cron=(p/'retell-worker/index.js').read_text();pdf=(site/'project-docs.js').read_text();
assert 'retellOnPaid(env,attemptId)' in worker
assert '/api/lead-abandonment' in worker
assert '/api/admin/retell' in worker
assert "const RETELL_CONSENT_VERSION='retell-followup-v1-2026-10-24'" in worker
assert 'Guardar mi propuesta y pagar después' in pdf
assert "consentCheckbox.checked=false" in pdf
assert "RETELL_ENABLED==='true'" in cron
assert 'setTimeout(' not in cron
assert "status='uncertain'" in cron
conn=sqlite3.connect(':memory:');conn.execute('PRAGMA foreign_keys=ON');conn.executescript('CREATE TABLE lead_cases(folio TEXT PRIMARY KEY);CREATE TABLE approved_quotes(id TEXT PRIMARY KEY);');sql=(p/'migraciones/002_retell_v51.sql').read_text();conn.executescript(sql);conn.executescript(sql);tbls={r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")};assert {'retell_consents_v51','retell_followups_v51'}<=tbls
z=zipfile.ZipFile(p/'baseline/V50_CODIGO_FUENTE_COMPLETO_ORIGINAL.zip');assert len(z.namelist())>25
report={'version':'PLUVIAM V51','source':'V50 preserved','original_site_files_unchanged':len(unchanged),'modified':sorted(changed),'new_static_files':sorted(added),'javascript_syntax_checked':len(js)+2,'d1_migration':'idempotent, additive','site_files_total':sum(1 for f in site.rglob('*') if f.is_file()),'retell_disabled_by_default':True,'retell_live_test':'NOT RUN - no credentials/approval','browser_real_E2E':'NOT RUN - environment blocks','actual_calls_placed':0,'baseline_archived':True};(p/'tests/QA_V51.json').write_text(json.dumps(report,indent=2,ensure_ascii=False));print(json.dumps(report,indent=2,ensure_ascii=False))
