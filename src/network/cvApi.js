import { isMockDataEnabled, mockResponse, request } from './httpClient.js';
import { MOCK_CV_PROFILE } from './mockData.js';

export const cvApi = {
  parsePdf(fileName, base64) {
    if (isMockDataEnabled) return mockResponse({ profile: MOCK_CV_PROFILE, isDemo: true }, 1200);
    return request('/cv/parse', {
      method: 'POST',
      body: JSON.stringify({ fileName, base64 }),
    });
  },
};
