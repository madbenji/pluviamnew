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
  assert.ok(ui.includes("Solicitud para Operaciones"));
  assert.ok(ui.includes("name=\\\"consent\\\" type=\\\"checkbox\\\" required"));
  assert.ok(ui.includes("name=\\\"requestType\\\""));
  assert.ok(ui.includes("data-turnstile"));
  assert.ok(ui.includes("fetch('/api/visitas'"));
  assert.ok(!ui.includes("data-close-visit"));
  assert.ok(!ui.includes("avianny-visit-panel"));
});

test("commercial actions expose safe WhatsApp, callback, visit, and project routes", () => {
  assert.ok(ui.includes("Solicitar llamada"));
  assert.ok(ui.includes("Solicitar visita"));
  assert.ok(ui.includes("/mi-proyecto.html"));
  assert.ok(ui.includes("WhatsApp no configurado"));
  assert.ok(ui.includes("/^[1-9]\\d{9,14}$/"));
  assert.ok(ui.includes("https://wa.me/"));
  assert.ok(!/href=[\"']tel:/i.test(ui));
});

test("Spanish dictation remains explicit, editable, and never auto-submits", () => {
  assert.ok(ui.includes("window.SpeechRecognition||window.webkitSpeechRecognition"));
  assert.ok(ui.includes("recognition.lang='es-MX'"));
  assert.ok(ui.includes("recognition.start()"));
  assert.ok(ui.includes("Transcripción editable"));
  assert.ok(ui.includes("form.requestSubmit()"));
  assert.ok(!ui.includes("recognition.onresult=.*requestSubmit"));
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
  assert.ok(ui.includes("dialog.querySelector('.avianny-minimize').addEventListener('click',()=>{state.opened=false;dialog.close()})"));
  assert.ok(ui.includes("dialog.addEventListener('close',()=>{state.opened=false})"));
  assert.ok(styles.includes("object-fit:cover!important;object-position:center!important"));
  assert.ok(!styles.includes("object-fit:contain!important;object-position:center!important"));
});
