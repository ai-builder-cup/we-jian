import { isMockDataEnabled, mockResponse, request } from './httpClient.js';

const MOCK_EXPLANATION =
  'You tend to move toward work where the result is visible and yours. That same pull makes it '
  + 'hard to stop, so the thing worth watching is not whether you can carry load, but whether you '
  + 'notice when you are carrying too much.';

export const baziApi = {
  explain(reflection) {
    if (isMockDataEnabled) return mockResponse({ explanation: MOCK_EXPLANATION }, 900);
    // Only finished labels travel. The birth date never leaves the browser.
    return request('/bazi/explanation', { method: 'POST', body: JSON.stringify({ reflection }) });
  },
};

export async function explainBaziReflection(reflection) {
  const payload = await baziApi.explain(reflection);
  // Accept either shape. The server sends { explanation }, but a bare string
  // once slipped through here and the reading silently fell back to the
  // composed version with no error raised anywhere.
  if (typeof payload === 'string') return payload.trim() || null;
  return payload?.explanation ?? null;
}
