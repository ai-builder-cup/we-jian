import { QUESTIONNAIRE_ITEMS, questionnaireItemsFor, scoreQuestionnaire } from '../src/business/questionnaireBank.js';
import { matchOccupations, matchOccupationsByCollar } from '../src/business/occupationMatching.js';
import { getStore } from './store.js';

const sessionLifetimeMs = 30 * 60 * 1000;
const maxEssayLength = 2000;

function questionnaireError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

// Items come from the fixed bank; the client never receives scoring keys.
export async function createQuestionnaireSession(userType) {
  const store = await getStore();
  const sessionId = await store.create('questionnaire', {}, sessionLifetimeMs);
  // Only wording differs by audience: same ids, same options, same scoring keys.
  return {
    sessionId,
    questions: questionnaireItemsFor(userType).map(({ scoring, ...question }) => question),
    isDemo: false,
  };
}

export async function getQuestionnaireSession(sessionId) {
  const store = await getStore();
  const session = await store.get('questionnaire', sessionId);
  if (!session) {
    throw questionnaireError('This questionnaire session has expired. Please start the questionnaire again.', 410);
  }
  return session;
}

export async function removeQuestionnaireSession(sessionId) {
  const store = await getStore();
  await store.remove('questionnaire', sessionId);
}

export function getAnswerMap(payload) {
  if (!Array.isArray(payload?.answers) || payload.answers.length !== QUESTIONNAIRE_ITEMS.length) {
    throw questionnaireError('Please submit an answer for every questionnaire item.', 400);
  }
  const answerMap = new Map();
  for (const item of payload.answers) {
    const question = QUESTIONNAIRE_ITEMS.find((candidate) => candidate.id === item?.questionId);
    if (!question || answerMap.has(item.questionId)) {
      throw questionnaireError('The questionnaire contains a duplicate, missing, or invalid answer.', 400);
    }
    if (question.type === 'essay') {
      if (typeof item.answer !== 'string' || !item.answer.trim() || item.answer.length > maxEssayLength) {
        throw questionnaireError('A written questionnaire answer is empty or too long.', 400);
      }
    } else if (question.type === 'multi_select') {
      const allowed = question.options.map((option) => option.value);
      if (!Array.isArray(item.answer) || item.answer.length !== question.maxSelections
        || new Set(item.answer).size !== item.answer.length || item.answer.some((value) => !allowed.includes(value))) {
        throw questionnaireError(`Choose exactly ${question.maxSelections} different options for question ${question.id}.`, 400);
      }
    } else if (!question.options.some((option) => String(option.value) === String(item.answer))) {
      throw questionnaireError(`Choose a valid option for question ${question.id}.`, 400);
    }
    const value = question.type === 'essay' || question.type === 'multi_select' ? item.answer : Number(item.answer);
    answerMap.set(item.questionId, value);
  }
  return answerMap;
}

export function calculateQuestionnaireResult(answerMap) {
  const scored = scoreQuestionnaire(answerMap);
  const scores = Object.fromEntries(scored.chart.map(({ id, value }) => [id, value]));
  // Added here rather than in scoreQuestionnaire() because the 436-group occupation map is a
  // server-side file: questionnaireBank.js is bundled for the browser and must stay small.
  return {
    ...scored,
    worldOfWork: {
      ...matchOccupations(scores, { limit: 8 }),
      byKindOfWork: matchOccupationsByCollar(scores, { perCollar: 3 }),
    },
  };
}
