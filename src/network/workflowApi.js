import { isMockDataEnabled, mockResponse, request } from './httpClient.js';
import { MOCK_MANAGER_FOLLOW_UP, MOCK_SIMULATION_RESULT } from './mockData.js';
import { SAFETY_POLICY, SIMULATION_SCENARIO, SIMULATION_SKILLS } from '../business/simulationScenario.js';

const sessionPath = (sessionId) => `/work-simulation/sessions/${encodeURIComponent(sessionId)}`;

export const workflowApi = {
  startWorkSimulation(interestCode) {
    if (isMockDataEnabled) {
      return mockResponse({
        ...SIMULATION_SCENARIO,
        id: 'demo-work-simulation',
        skills: SIMULATION_SKILLS.map(({ id, label }) => ({ id, label })),
        safetyPolicy: SAFETY_POLICY,
        interestCode,
        isDemo: true,
      });
    }
    return request('/work-simulation/sessions', {
      method: 'POST',
      body: JSON.stringify({ interestCode }),
    });
  },

  askManager(sessionId, explanation) {
    if (isMockDataEnabled) return mockResponse(MOCK_MANAGER_FOLLOW_UP, 1000);
    return request(`${sessionPath(sessionId)}/manager-turn`, {
      method: 'POST',
      body: JSON.stringify({ explanation }),
    });
  },

  submitWorkSimulation(sessionId, answers) {
    if (isMockDataEnabled) {
      return mockResponse({ completed: true, result: { ...MOCK_SIMULATION_RESULT, isDemo: true } }, 1500);
    }
    return request(`${sessionPath(sessionId)}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};
