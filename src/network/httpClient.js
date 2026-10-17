const baseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

// Explicit opt-in: serve dummy data while the API is not ready.
export const isMockDataEnabled = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function mockResponse(data, delayMs = 600) {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), delayMs));
}

export async function request(path, options = {}) {
  const { timeoutMs = 120_000, ...fetchOptions } = options;
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...fetchOptions,
      signal: fetchOptions.signal || AbortSignal.timeout(timeoutMs),
      headers: {
        Accept: 'application/json',
        ...(fetchOptions.body ? { 'Content-Type': 'application/json' } : {}),
        ...fetchOptions.headers,
      },
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
      throw new Error(`The We.Jian API request timed out after ${timeoutMs / 1000} seconds.`);
    }
    throw new Error(`Unable to reach the We.Jian API. ${error.message}`);
  }

  if (!response.ok) {
    const detail = await response.text();
    let message = detail || `The We.Jian API returned an error (${response.status}).`;
    try {
      const payload = JSON.parse(detail);
      if (typeof payload.error === 'string') message = payload.error;
    } catch {
      // Keep non-JSON API error details visible to the user.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    throw new Error('The We.Jian API returned an invalid JSON response.');
  }
}
