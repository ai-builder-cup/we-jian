import { isMockDataEnabled, mockResponse, request } from './httpClient.js';
import { MOCK_SKILL_GAP_PLAN } from './mockData.js';

export const skillGapPlanApi = {
  getPlan({ targetJob, questionnaireResult, simulationResult, cvProfile }) {
    if (isMockDataEnabled) return mockResponse({ result: { ...MOCK_SKILL_GAP_PLAN, targetJob } }, 1200);
    return request('/skill-gap-plan', {
      method: 'POST',
      body: JSON.stringify({ targetJob, questionnaireResult, simulationResult, cvProfile }),
    });
  },
};
