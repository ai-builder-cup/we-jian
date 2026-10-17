import { isMockDataEnabled, mockResponse, request } from './httpClient.js';
import { MOCK_QUESTIONNAIRE_EXPLANATION } from './mockData.js';
import { questionnaireItemsFor, scoreQuestionnaire } from '../business/questionnaireBank.js';

export const questionnaireApi = {
  getQuestions(userType) {
    if (isMockDataEnabled) {
      return mockResponse({
        sessionId: 'demo-questionnaire',
        questions: questionnaireItemsFor(userType).map(({ scoring, ...question }) => question),
        isDemo: true,
      });
    }
    return request(`/questionnaire/questions?userType=${encodeURIComponent(userType || 'student')}`);
  },

  submitAnswers(answers, sessionId) {
    if (isMockDataEnabled) {
      const answerMap = Object.fromEntries(answers.map(({ questionId, answer }) => [questionId, answer]));
      return mockResponse({
        result: { ...scoreQuestionnaire(answerMap), explanation: MOCK_QUESTIONNAIRE_EXPLANATION, isDemo: true },
      }, 1200);
    }
    return request('/questionnaire/submissions', {
      method: 'POST',
      body: JSON.stringify({ answers, sessionId }),
    });
  },
};
