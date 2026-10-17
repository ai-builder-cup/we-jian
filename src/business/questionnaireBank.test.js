import test from 'node:test';
import assert from 'node:assert/strict';
import { QUESTIONNAIRE_ITEMS, scoreQuestionnaire } from './questionnaireBank.js';
import { JOBS } from './jobBank.js';

// Default answer: 2 ("Unsure") for interests, 3 ("Strong") for readiness.
function answersWith(overrides = {}) {
  return Object.fromEntries(QUESTIONNAIRE_ITEMS.map((item) => [
    item.id,
    overrides[item.id] ?? (item.type === 'essay' ? 'Customer success'
      : item.type === 'multi_select' ? ['achievement', 'support', 'working_conditions']
        : item.scoring.scale === 'riasec' ? 2 : 3),
  ]));
}
const byKey = (key, value) => Object.fromEntries(
  QUESTIONNAIRE_ITEMS.filter((item) => item.scoring.key === key).map((item) => [item.id, value]),
);

test('item bank is the official 30-item Mini-IP, 12-item CAAS-SF and 4 goals, in order', () => {
  const sections = QUESTIONNAIRE_ITEMS.map((item) => item.section);
  assert.equal(sections.filter((section) => section === 'Interest').length, 30);
  assert.equal(sections.filter((section) => section === 'Readiness').length, 12);
  assert.equal(sections.filter((section) => section === 'Goals').length, 4);
  assert.deepEqual([...new Set(sections)], ['Interest', 'Readiness', 'Goals']);
  const interest = QUESTIONNAIRE_ITEMS.filter((item) => item.section === 'Interest');
  for (const type of 'RIASEC') assert.equal(interest.filter((item) => item.scoring.key === type).length, 5);
  assert.equal(interest[5].prompt, 'Install software across computers on a large network');
  assert.deepEqual(interest.slice(0, 6).map((item) => item.scoring.key), [...'RIASEC']);
  assert.ok(QUESTIONNAIRE_ITEMS.every((item) => item.source && !item.source.includes('CC BY 4.0')));
});

test('RIASEC sums are 0–20 per type and the code is computed by formula', () => {
  const result = scoreQuestionnaire(answersWith({ ...byKey('S', 4), ...byKey('E', 3), ...byKey('R', 0) }));
  assert.equal(result.interestCode, 'S-E');
  assert.deepEqual(result.chart.find((item) => item.id === 'S'), { id: 'S', label: 'Social', value: 20, max: 20 });
  assert.equal(result.chart.find((item) => item.id === 'R').value, 0);
  assert.deepEqual(result.topTypes, ['S']);
  assert.deepEqual(result.flags, []);
});

test('ties are reported, never turned into a false first place', () => {
  const result = scoreQuestionnaire(answersWith({ ...byKey('A', 4), ...byKey('S', 4) }));
  assert.equal(result.interestCode, 'A-S');
  assert.deepEqual(result.topTypes, ['A', 'S']);
  assert.ok(result.flags.includes('tie_first'));
});

test('flat, low and straight-lined profiles are flagged', () => {
  const result = scoreQuestionnaire(answersWith());           // every interest answer = 2
  assert.ok(result.flags.includes('flat_profile'));
  assert.ok(result.flags.includes('straight_lined'));
  assert.ok(result.jobs.lowConfidence);
  const low = scoreQuestionnaire(answersWith(Object.fromEntries(
    QUESTIONNAIRE_ITEMS.filter((item) => item.section === 'Interest').map((item, i) => [item.id, i % 2]),
  )));
  assert.ok(low.flags.includes('low_interest_overall'));
});

test('readiness averages each CAAS dimension and reports every lowest dimension', () => {
  const result = scoreQuestionnaire(answersWith({ ...byKey('curiosity', 5), ...byKey('control', 2), ...byKey('confidence', 2) }));
  assert.equal(result.readiness.dimensions.find((item) => item.id === 'curiosity').value, 5);
  assert.deepEqual(result.readiness.lowest, ['control', 'confidence']);
  assert.equal(result.goals.targetJob, 'Customer success');
});

test('job matching ranks the sourced bank by interest fit with an evidence tie-break', () => {
  const result = scoreQuestionnaire(answersWith({ ...byKey('S', 4), ...byKey('E', 3), ...byKey('R', 1), ...byKey('I', 1), ...byKey('A', 2), ...byKey('C', 0) }));
  const { top, of } = result.jobs;
  assert.equal(of, JOBS.filter((job) => job.riasec).length);
  assert.deepEqual(new Set(top.slice(0, 2).map((job) => job.key)), new Set(['fitness_wellness_coordinator', 'sports_coach']));
  assert.equal(top[0].fit, Math.round(((2 * 20 + 15) / 60) * 100) / 100);
  assert.equal(top[0].match, 'strong');
  assert.notEqual(top[2].confidence, 'low');
});

test('missing or out-of-scale answers are rejected', () => {
  const answers = answersWith();
  delete answers['interest-1'];
  assert.throws(() => scoreQuestionnaire(answers), /no answer/i);
  assert.throws(() => scoreQuestionnaire(answersWith({ 'readiness-1': 9 })), /1–5/);
  assert.throws(() => scoreQuestionnaire(answersWith({ 'interest-1': 5 })), /0–4/);
});

test('work values: exactly three different known values, kept as goals and never scored', () => {
  const result = scoreQuestionnaire(answersWith());
  assert.deepEqual(result.goals.workValues, ['achievement', 'support', 'working_conditions']);
  assert.throws(() => scoreQuestionnaire(answersWith({ 'goals-work-values': ['achievement', 'support'] })), /exactly 3/);
  assert.throws(() => scoreQuestionnaire(answersWith({ 'goals-work-values': ['achievement', 'achievement', 'support'] })), /exactly 3/);
  assert.throws(() => scoreQuestionnaire(answersWith({ 'goals-work-values': ['achievement', 'support', 'money'] })), /exactly 3/);
});
