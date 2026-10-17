import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONNAIRE_ITEMS } from '../src/business/questionnaireBank.js';
import {
  calculateQuestionnaireResult,
  createQuestionnaireSession,
  getAnswerMap,
  getQuestionnaireSession,
  removeQuestionnaireSession,
} from './questionnaire.js';

const validAnswers = () => QUESTIONNAIRE_ITEMS.map((item) => ({
  questionId: item.id,
  answer: item.type === 'essay' ? 'An honest answer'
    : item.type === 'multi_select' ? ['independence', 'recognition', 'relationships']
      : item.section === 'Interest' ? 0 : 4,
}));

test('sessions serve the fixed item bank without scoring keys', async () => {
  const session = await createQuestionnaireSession();
  assert.equal(session.questions.length, QUESTIONNAIRE_ITEMS.length);
  assert.ok(session.questions.every((question) => !('scoring' in question)));
  assert.ok(await getQuestionnaireSession(session.sessionId));
  await removeQuestionnaireSession(session.sessionId);
  await assert.rejects(() => getQuestionnaireSession(session.sessionId), /expired/i);
  await assert.rejects(() => getQuestionnaireSession('not-a-session'), /expired/i);
});

test('answers are validated and scored by formula', () => {
  const result = calculateQuestionnaireResult(getAnswerMap({ answers: validAnswers() }));
  assert.equal(result.chart.length, 6);
  assert.equal(result.readiness.average, 4);
  assert.ok(result.chart.every((item) => item.value === 0 && item.max === 20));  // 0 = "Strongly dislike" is a real answer
});

test('invalid, duplicate, or missing answers are rejected', () => {
  const answers = validAnswers();
  assert.throws(() => getAnswerMap({ answers: answers.slice(1) }), /every questionnaire item/i);
  assert.throws(
    () => getAnswerMap({ answers: [answers[0], ...answers.slice(0, -1)] }),
    /duplicate/i,
  );
  assert.throws(
    () => getAnswerMap({ answers: answers.map((item, index) => (index === 0 ? { ...item, answer: 7 } : item)) }),
    /valid option/i,
  );
  assert.throws(
    () => getAnswerMap({
      answers: answers.map((item) => (item.questionId === 'goals-reasons' ? { ...item, answer: '  ' } : item)),
    }),
    /empty or too long/i,
  );
});

test('work values must be exactly three different allowed options', () => {
  const answers = validAnswers();
  const swap = (answer) => answers.map((item) => (item.questionId === 'goals-work-values' ? { ...item, answer } : item));
  assert.doesNotThrow(() => getAnswerMap({ answers }));
  assert.throws(() => getAnswerMap({ answers: swap(['independence']) }), /exactly 3/);
  assert.throws(() => getAnswerMap({ answers: swap('independence') }), /exactly 3/);
  assert.throws(() => getAnswerMap({ answers: swap(['independence', 'recognition', 'salary']) }), /exactly 3/);
});
