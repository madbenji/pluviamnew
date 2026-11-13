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
