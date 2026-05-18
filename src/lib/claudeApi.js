const API_URL = "http://localhost:3001/api/claude";

/**
 * Thin wrapper around the local Claude proxy.
 * Never puts API keys in frontend code — the proxy handles auth.
 *
 * @param {object[]} messages   - Anthropic messages array
 * @param {number}   max_tokens - Max tokens for this call
 * @returns {Promise<string>}   - First text content block
 */
export async function claudeCall(messages, max_tokens = 1000) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

/**
 * Extract the first JSON object from a Claude response string.
 * More robust than a simple greedy regex — finds balanced braces.
 */
export function extractJson(text) {
  let depth = 0, start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") { if (start === -1) start = i; depth++; }
    else if (text[i] === "}") { depth--; if (depth === 0 && start !== -1) return text.slice(start, i + 1); }
  }
  return null;
}

/**
 * Extract the first JSON array from a Claude response string.
 */
export function extractJsonArray(text) {
  const m = text.match(/\[[\s\S]*\]/);
  return m ? m[0] : null;
}
