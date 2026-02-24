import fetch from "node-fetch";

export default async function (context, req) {
  const apiKey = process.env.FOUNDRY_API_KEY;

  if (!apiKey) {
    context.res = { status: 500, body: "Missing API key" };
    return;
  }

  const userMessage = req.body?.message;

  const response = await fetch(
    "https://foundry-expertdays2026.cognitiveservices.azure.com/openai/deployments/gpt-4.1-mini/chat/completions?api-version=2025-01-01-preview",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    }
  );

  const data = await response.json();

  context.res = {
    headers: { "Content-Type": "application/json" },
    body: {
      reply: data.choices?.[0]?.message?.content ?? "(nessuna risposta)"
    }
  };
}
