// api/chat/index.js
// Richiede node-fetch (come nel tuo attuale codice)
const fetch = require("node-fetch");

module.exports = async function (context, req) {
  // --- CORS / Preflight ---
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Se arriva una richiesta OPTIONS (preflight), rispondi subito
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: corsHeaders,
      body: "",
    };
    return;
  }

  // --- Solo POST previsto per la chat ---
  if (req.method !== "POST") {
    context.res = {
      status: 405,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: { error: "Method not allowed. Use POST." },
    };
    return;
  }

  // --- Config ---
  const apiKey = process.env.FOUNDRY_API_KEY;
  if (!apiKey) {
    context.res = {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: { error: "Missing API key (FOUNDRY_API_KEY)." },
    };
    return;
  }

  // --- Input ---
  const userMessage = req.body?.message;
  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    context.res = {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: { error: "Missing or empty 'message' in request body." },
    };
    return;
  }

  // --- Chiamata a Foundry (come nel tuo codice) ---
  const url =
    "https://foundry-expertdays2026.cognitiveservices.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview";

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    // Se Foundry risponde con errore, riportalo chiaramente
    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      context.res = {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        body: {
          error: "Upstream error from Foundry",
          status: upstream.status,
          details: errText || "(no details)",
        },
      };
      return;
    }

    const data = await upstream.json();

    const reply =
      data?.choices?.[0]?.message?.content ?? "(nessuna risposta)";

    context.res = {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      body: { reply },
    };
  } catch (e) {
    context.log("Error calling Foundry:", e);

    context.res = {
