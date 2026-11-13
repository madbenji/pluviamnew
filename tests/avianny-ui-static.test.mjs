import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const ui = readFileSync(new URL("../site/avianny.js", import.meta.url), "utf8");
const styles = readFileSync(new URL("../site/avianny-production.css", import.meta.url), "utf8");

test("Avianny keeps one opening quick-action group and uses the production AI endpoint", () => {
  assert.ok(ui.includes("/api/aviany/chat"));
  assert.ok(ui.includes("state.hasInteracted=true;"));
  assert.ok(ui.includes("setPrompts([])"));
  assert.ok(!ui.includes("assistant.suggestions"));
  assert.ok(!ui.includes("data.suggestions"));
  assert.ok(!ui.includes("¿En qué puedo ayudarte?"));
  assert.ok(!ui.includes("avianny-welcome"));
});

test("technical visit stays inline and retains consent, Turnstile, and lead capture", () => {
  assert.ok(ui.includes("Solicitud de evaluación técnica"));
  assert.ok(ui.includes("name=\\\"consent\\\" type=\\\"checkbox\\\" required"));
  assert.ok(ui.includes("data-turnstile"));
  assert.ok(ui.includes("fetch('/api/visitas'"));
  assert.ok(!ui.includes("data-close-visit"));
  assert.ok(!ui.includes("avianny-visit-panel"));
});

test("chat scrolls in one history pane and the mobile visit form collapses to one column", () => {
  assert.ok(styles.includes("#avianny-dialog .avianny-history"));
  assert.ok(styles.includes("overflow-y:auto"));
  assert.ok(styles.includes("#avianny-dialog .avianny-body"));
  assert.ok(styles.includes("overflow:hidden"));
  assert.ok(styles.includes("grid-template-columns:minmax(0,1fr)!important"));
  assert.ok(!styles.includes(".avianny-visit-panel"));
});

test("chat dialog stays hidden until opened and the close button closes it", () => {
  assert.ok(styles.includes("#avianny-dialog:not([open]){display:none!important}"));
  assert.ok(styles.includes("#avianny-dialog[open]{display:flex!important;"));
  assert.ok(ui.includes("dialog.querySelector('.avianny-close').addEventListener('click',()=>{state.opened=false;dialog.close()})"));
  assert.ok(styles.includes("object-fit:cover!important;object-position:center!important"));
  assert.ok(!styles.includes("object-fit:contain!important;object-position:center!important"));
});
