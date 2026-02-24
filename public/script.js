async function sendMessage() {
  const input = document.getElementById("input");
  const messages = document.getElementById("messages");

  const userText = input.value.trim();
  if (!userText) return;

  messages.innerHTML += `<div><strong>Tu:</strong> ${userText}</div>`;
  input.value = "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userText })
  });

  const data = await response.json();

  messages.innerHTML += `<div><strong>Bot:</strong> ${data.reply}</div>`;
}
