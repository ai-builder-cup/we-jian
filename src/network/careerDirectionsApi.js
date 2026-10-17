import { isMockDataEnabled, mockResponse, request } from './httpClient.js';
import { MOCK_CAREER_DIRECTIONS } from './mockData.js';

export const careerDirectionsApi = {
  getRecommendations(questionnaireResult, simulationResult, cvProfile) {
    if (isMockDataEnabled) return mockResponse(MOCK_CAREER_DIRECTIONS, 1200);
    return request('/career-directions/recommendations', {
      method: 'POST',
      body: JSON.stringify({ questionnaireResult, simulationResult, cvProfile }),
    });
  },
};
