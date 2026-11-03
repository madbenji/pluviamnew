import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import worker from '../site/_worker.js';

const root = new URL('../site/', import.meta.url);
const file = (name) => new URL(name, root);

test('beta static routes and isolation markers exist', () => {
  for (const route of ['colaborar/index.html', 'colaborar/mi-beehive/index.html', 'store/index.html', 'admin/index.html', 'beta.css', 'beta.js', 'beta-overdrive.js']) assert.ok(existsSync(file(route)), route);
  const worker = readFileSync(file('_worker.js'), 'utf8');
  assert.match(worker, /api\/beta/);
  assert.match(worker, /\/store\//);
  assert.match(worker, /\/colaborar\//);
  assert.match(readFileSync(new URL('../site/beta-overdrive.js', import.meta.url), 'utf8'), /DB_BETA/);
  const pages = ['colaborar/index.html', 'colaborar/mi-beehive/index.html', 'store/index.html', 'admin/index.html'];
  for (const page of pages) {
    const html = readFileSync(file(page), 'utf8');
    assert.match(html, /noindex,nofollow/);
    assert.match(html, /BETA/);
  }
});

test('beta route aliases keep legacy paths reachable', async () => {
  const env = { ASSETS: { fetch: async (request) => new Response(new URL(request.url).pathname) } };
  for (const path of ['/colaborar', '/store', '/admin']) {
    const response = await worker.fetch(new Request(`https://beta.example${path}`), env);
    assert.equal(response.status, 301);
    assert.match(response.headers.get('location'), new RegExp(`${path.slice(1)}/$`));
  }
});
