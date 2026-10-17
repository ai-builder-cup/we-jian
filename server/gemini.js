// Gemini client.
// Production (Cloud Run): Vertex AI with the service account's own identity. No API key; usage is billed to the
//   Google Cloud project, and Vertex AI does not use prompts or CVs to train Google's models.
// Local development only: set GEMINI_API_KEY to use Google AI Studio instead.
const DEFAULT_MODEL = 'gemini-3.8-flash';
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUSES = new Set([429, 500, 503, 504]);
const METADATA_TOKEN_URL =
  'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

let cachedToken = null;

export function geminiBackend() {
  if (process.env.GEMINI_API_KEY) return 'ai-studio';
  return 'vertex';
}

export async function generateJson(options) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await generateJsonOnce(options);
    } catch (error) {
      if (!error.retryable || attempt >= MAX_ATTEMPTS) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
    }
  }
}

function setupError(message) {
  const error = new Error(message);
  error.statusCode = 503;
  return error;
}

async function vertexAccessToken() {
  if (process.env.GOOGLE_ACCESS_TOKEN) return process.env.GOOGLE_ACCESS_TOKEN; // local testing: gcloud auth print-access-token
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;
  let response;
  try {
    response = await fetch(METADATA_TOKEN_URL, {
      headers: { 'Metadata-Flavor': 'Google' },
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw setupError('Vertex AI is not available here. Run on Cloud Run, or set GOOGLE_ACCESS_TOKEN for local testing.');
  }
  if (!response.ok) throw setupError(`Could not get a Google Cloud access token (HTTP ${response.status}).`);
  const payload = await response.json();
  cachedToken = { token: payload.access_token, expiresAt: Date.now() + Number(payload.expires_in || 0) * 1000 };
  return cachedToken.token;
}

async function endpoint(model) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    return {
      url: `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      headers: { 'x-goog-api-key': apiKey },
      secret: apiKey,
    };
  }
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) throw setupError('Gemini is not configured. Set GOOGLE_CLOUD_PROJECT for Vertex AI.');
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'global';
  const host = location === 'global' ? 'aiplatform.googleapis.com' : `${location}-aiplatform.googleapis.com`;
  const token = await vertexAccessToken();
  return {
    url: `https://${host}/v1/projects/${encodeURIComponent(project)}/locations/${encodeURIComponent(location)}`
      + `/publishers/google/models/${encodeURIComponent(model)}:generateContent`,
    headers: { Authorization: `Bearer ${token}` },
    secret: token,
  };
}

async function generateJsonOnce({ systemPrompt, userPrompt, pdfBase64, maxOutputTokens = 1024 }) {
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const target = await endpoint(model);
  const parts = [{ text: userPrompt }];
  if (pdfBase64) {
    parts.unshift({ inlineData: { mimeType: 'application/pdf', data: pdfBase64 } });
  }

  let response;
  try {
    response = await fetch(target.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...target.headers },
      signal: AbortSignal.timeout(120_000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          maxOutputTokens,
          // Short, structured tasks: keep reasoning light so output tokens go to the answer.
          thinkingConfig: { thinkingLevel: 'low' },
        },
      }),
    });
  } catch (error) {
    const failure = new Error(`Could not reach Gemini. ${error.message}`);
    failure.statusCode = 502;
    failure.retryable = error.name !== 'TimeoutError';
    throw failure;
  }

  if (!response.ok) {
    let apiMessage = '';
    try {
      const errorPayload = await response.json();
      if (typeof errorPayload?.error?.message === 'string') {
        apiMessage = errorPayload.error.message.replaceAll(target.secret, '[redacted]').slice(0, 400);
      }
    } catch {
      apiMessage = '';
    }
    if (response.status === 401 || response.status === 403) cachedToken = null;
    const statusCode = response.status === 429 ? 429 : 502;
    const message = response.status === 429
      ? `Gemini is busy right now. Please wait a moment and try again.${apiMessage ? ` ${apiMessage}` : ''}`
      : `Gemini could not complete this request.${apiMessage ? ` ${apiMessage}` : ''}`;
    const failure = new Error(message);
    failure.statusCode = statusCode;
    failure.retryable = RETRYABLE_STATUSES.has(response.status);
    throw failure;
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    const failure = new Error('Gemini returned an invalid response.');
    failure.statusCode = 502;
    throw failure;
  }

  const text = payload?.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text || '')
    .join('')
    .trim();
  if (!text) {
    const failure = new Error('Gemini returned no content for this request.');
    failure.statusCode = 502;
    failure.retryable = true;
    throw failure;
  }

  try {
    return JSON.parse(text);
  } catch {
    const failure = new Error('Gemini returned data in an unexpected format.');
    failure.statusCode = 502;
    failure.retryable = true;
    throw failure;
  }
}
