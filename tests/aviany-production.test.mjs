import assert from "node:assert/strict";
import test from "node:test";
import { handleAvianyRequest } from "../site/aviany-production.js";

function deps() {
  return {
    bodyJson: async (request) => request.json(),
    respond: (payload, status = 200) => new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
    admin: () => false,
    limited: async () => true,
    validateTurnstile: async () => false,
  };
}

function chatRequest(message, messages = []) {
  return new Request("https://pluviam.test/api/aviany/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, messages }),
  });
}

function visitDb({ raceOnInsert = false } = {}) {
  const state = { record: null, event: null, batches: 0, raceOnInsert };
  const db = {
    prepare(sql) {
      return {
        sql,
        values: [],
        bind(...values) { this.values = values; return this; },
        async first() {
          if (sql.includes("WHERE idempotency_key=?")) return state.record;
          if (sql.includes("FROM field_visit_events WHERE visit_id=?")) return state.event;
          return null;
        },
        async all() { return { results: [] }; },
      };
    },
    async batch(statements) {
      state.batches += 1;
      if (state.raceOnInsert && state.batches === 1) {
        const values = statements[0].values;
        state.record = { id: values[0], lead_folio: values[1], status: values[3], next_action: values[22] };
        state.event = { event_type: statements[1].values[2], detail_json: statements[1].values[7] };
        throw new Error("UNIQUE constraint failed: field_visits.idempotency_key");
      }
      const values = statements[0].values;
      state.record = { id: values[0], lead_folio: values[1], status: values[3], next_action: values[22] };
      state.event = { event_type: statements[1].values[2], detail_json: statements[1].values[7] };
      return [];
    },
  };
  return { db, state };
}

function visitRequest(body, key = "avianny-request-test-key") {
  return new Request("https://pluviam.test/api/visitas", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Idempotency-Key": key },
    body: JSON.stringify(body),
  });
}

function validVisitBody(overrides = {}) {
  return {
    name: "María Prueba",
    contactMethod: "phone",
    phone: "3312345678",
    city: "Guadalajara",
    propertyType: "residencial",
    serviceType: "Captación de lluvia",
    availability: ["Martes por la mañana"],
    consent: true,
    consentVersion: "pluviam-intake-test-v1",
    turnstile: "valid-test-token",
    requestType: "visit",
    sourceChannel: "avianny_web_chat",
    ...overrides,
  };
}

test("POST /api/aviany/chat returns a validated Workers AI reply without touching D1", async () => {
  let usedModel = "";
  let d1Reads = 0;
  const env = {
    AVIANY_AI_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8",
    AI: {
      run: async (model, input) => {
        usedModel = model;
        assert.equal(input.messages.at(-1).content, "¿Cómo empiezo un sistema para mi casa?");
        return {
          response: JSON.stringify({
            reply: "Primero revisamos la superficie, el uso y la continuidad del agua.",
            intent: "diagnostico",
            segment: "residencial",
            nextAction: "Compartir el área aproximada de la cubierta",
            suggestions: ["Cotizar sistema residencial"],
          }),
        };
      },
    },
    DB: { prepare() { d1Reads += 1; throw new Error("chat must not access D1"); } },
  };

  const response = await handleAvianyRequest(
    chatRequest("¿Cómo empiezo un sistema para mi casa?"),
    env,
    "/api/aviany/chat",
    deps(),
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.available, true);
  assert.equal(body.assistant.reply, "Primero revisamos la superficie, el uso y la continuidad del agua.");
  assert.equal(body.assistant.segment, "residencial");
  assert.equal(body.model, usedModel);
  assert.equal(typeof body.traceId, "string");
  assert.equal(body.traceId.length, 36);
  assert.equal(Number.isInteger(body.elapsedMs), true);
  assert.equal(d1Reads, 0);
});

test("POST /api/aviany/chat reports bounded diagnostics without echoing the prompt on AI failure", async () => {
  const originalWarn = console.warn;
  const logs = [];
  console.warn = (...parts) => logs.push(parts.join(" "));
  try {
    const secretPrompt = "PROMPT_PRIVATE_DO_NOT_LOG_9a3c";
    const response = await handleAvianyRequest(
      chatRequest(secretPrompt),
      {
        AVIANY_AI_MODEL: "@cf/meta/llama-3.1-8b-instruct-fp8",
        AI: { run: async () => { throw new Error("AI_TIMEOUT"); } },
      },
      "/api/aviany/chat",
      deps(),
    );
    const body = await response.json();
    const logText = logs.join("\n");

    assert.equal(response.status, 503);
    assert.equal(body.errorCode, "AI_TIMEOUT");
    assert.equal(body.model, "@cf/meta/llama-3.1-8b-instruct-fp8");
    assert.equal(typeof body.traceId, "string");
    assert.equal(Number.isInteger(body.elapsedMs), true);
    assert.equal(JSON.stringify(body).includes(secretPrompt), false);
    assert.equal(logText.includes(secretPrompt), false);
    assert.match(logText, /aviany_ai_failure/);
    assert.match(logText, /AI_TIMEOUT/);
  } finally {
    console.warn = originalWarn;
  }
});

test("POST /api/aviany/chat keeps empty-message validation", async () => {
  const response = await handleAvianyRequest(
    chatRequest("   "),
    { AI: { run: async () => { throw new Error("must not run"); } } },
    "/api/aviany/chat",
    deps(),
  );
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, "Escribe una pregunta para Aviany.");
});

test("callback request writes its folio, source channel, preferred time, and next action to the existing D1 flow", async () => {
  const { db, state } = visitDb();
  const response = await handleAvianyRequest(
    visitRequest(validVisitBody({ requestType: "callback", propertyType: "", sourceChannel: "avianny_web_chat" })),
    { DB: db, TURNSTILE_SECRET: "configured-in-test" },
    "/api/visitas",
    { ...deps(), validateTurnstile: async () => true },
  );
  const body = await response.json();
  const metadata = JSON.parse(state.event.detail_json);

  assert.equal(response.status, 201);
  assert.equal(body.status, "SOLICITADA");
  assert.equal(body.requestType, "callback");
  assert.equal(body.sourceChannel, "avianny_web_chat");
  assert.equal(body.requestFolio, body.id);
  assert.equal(body.callbackConfirmed, false);
  assert.equal(body.appointmentConfirmed, false);
  assert.equal(metadata.requestFolio, body.id);
  assert.equal(metadata.requestType, "callback");
  assert.equal(state.event.event_type, "VISITA_SOLICITADA");
  assert.equal(metadata.sourceChannel, "avianny_web_chat");
  assert.deepEqual(metadata.availability, ["Martes por la mañana"]);
  assert.match(state.record.next_action, /no está confirmada/);
  assert.equal(state.batches, 1);
});

test("retries with the same idempotency key return the same request without another D1 insert", async () => {
  const { db, state } = visitDb();
  const request = () => visitRequest(validVisitBody({ requestType: "callback" }), "stable-retry-key");
  const dependencies = { ...deps(), validateTurnstile: async () => true };
  const env = { DB: db, TURNSTILE_SECRET: "configured-in-test" };

  const created = await handleAvianyRequest(request(), env, "/api/visitas", dependencies);
  const createdBody = await created.json();
  const repeated = await handleAvianyRequest(request(), env, "/api/visitas", dependencies);
  const repeatedBody = await repeated.json();

  assert.equal(created.status, 201);
  assert.equal(repeated.status, 200);
  assert.equal(repeatedBody.idempotent, true);
  assert.equal(repeatedBody.id, createdBody.id);
  assert.equal(repeatedBody.requestFolio, createdBody.requestFolio);
  assert.equal(repeatedBody.requestType, "callback");
  assert.equal(repeatedBody.sourceChannel, "avianny_web_chat");
  assert.equal(state.batches, 1);
});

test("idempotency unique-key races read back the already committed D1 request", async () => {
  const { db, state } = visitDb({ raceOnInsert: true });
  const response = await handleAvianyRequest(
    visitRequest(validVisitBody(), "race-key"),
    { DB: db, TURNSTILE_SECRET: "configured-in-test" },
    "/api/visitas",
    { ...deps(), validateTurnstile: async () => true },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.idempotent, true);
  assert.equal(body.requestType, "visit");
  assert.equal(body.id, state.record.id);
  assert.equal(state.batches, 1);
});

test("callback request rejects missing consent and never writes D1", async () => {
  const { db, state } = visitDb();
  const response = await handleAvianyRequest(
    visitRequest(validVisitBody({ requestType: "callback", consent: false })),
    { DB: db, TURNSTILE_SECRET: "configured-in-test" },
    "/api/visitas",
    { ...deps(), validateTurnstile: async () => true },
  );

  assert.equal(response.status, 422);
  assert.equal(state.batches, 0);
});
