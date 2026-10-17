import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAnswerComplete,
  normalizeQuestions,
  normalizeResult,
} from './questionnaireService.js';

test('questions are ordered by Interest, Readiness, then Goals', () => {
  const questions = normalizeQuestions([
    { id: 'goal', section: 'Goals', prompt: 'Goal?', type: 'essay' },
    { id: 'interest', section: 'Interest', prompt: 'Interest?', type: 'radio', options: ['A'] },
    { id: 'readiness', section: 'Readiness', prompt: 'Ready?', type: 'multiple-choice', options: [1, 2, 3, 4, 5] },
  ]);

  assert.deepEqual(questions.map((question) => question.id), [
    'interest',
    'readiness',
    'goal',
  ]);
  assert.deepEqual(questions[1].options[0], { value: 1, label: '1' });
});

test('essay answers require non-whitespace text and choice answers require a selection', () => {
  const essay = { type: 'essay' };
  const choice = { type: 'radio' };

  assert.equal(isAnswerComplete(essay, '  '), false);
  assert.equal(isAnswerComplete(essay, 'A thoughtful response'), true);
  assert.equal(isAnswerComplete(choice, undefined), false);
  assert.equal(isAnswerComplete(choice, 0), true);
});

test('result payloads support a result envelope and validate chart values', () => {
  const result = normalizeResult({
    result: {
      interestCode: 'S-E',
      chart: [{ label: 'Social', value: 4, max: 5 }],
      explanation: 'A concise explanation.',
    },
  });

  assert.deepEqual(result, {
    interestCode: 'S-E',
    chart: [{ label: 'Social', value: 4, max: 5 }],
    explanation: 'A concise explanation.',
  });
  assert.throws(
    () => normalizeResult({ interestCode: 'S', chart: [{ label: 'Social', value: 'high' }] }),
    /invalid result chart/i,
  );
});
