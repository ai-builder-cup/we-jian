import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateAssessments,
  buildSkillGapTable,
  emptySimulationAnswers,
  isSimulationTaskComplete,
  isVerbatimQuote,
  normalizeSimulationResult,
  validateSimulationAnswers,
} from './workSimulationService.js';

function completedAnswers() {
  const answers = emptySimulationAnswers();
  answers['review-conversations'] = {
    'conversation-1': 'The order already shipped so a full refund is not allowed; offer a voucher and priority delivery.',
    'conversation-2': 'Two days late is not over 3 days, so no voucher should be given.',
    'conversation-3': 'Refund is fine because it has not shipped, but it also missed the voucher.',
  };
  answers['escalation-decision'] = {
    escalate: ['conversation-1'],
    rationale: 'A human should call this customer and correct the refund promise.',
  };
  answers['rewrite-instructions'] = { instructions: 'Only offer a refund if the order has not shipped.' };
  answers['manager-explanation'] = {
    explanation: 'Most customers still get fast answers, we just fix the two rules it got wrong.',
    followUp: { trigger: 'time pressure', message: 'How fast can we fix it?' },
    followUpReply: 'We can update the instructions today and review chats daily this week.',
  };
  return answers;
}

const QUOTES = [
  'a full refund is not allowed',
  'Only offer a refund if the order has not shipped',
  'A human should call this customer',
  'we just fix the two rules it got wrong',
];

const pass = (scores, quotes = QUOTES) => ({
  skills: ['evaluation', 'policy', 'problemSolving', 'communication'].map((id, index) => ({
    id,
    score: scores[index],
    evidence: quotes[index],
    rationale: 'Rationale.',
  })),
  distressConcern: false,
});

test('tasks are complete only with every required answer, including the manager follow-up', () => {
  const answers = completedAnswers();
  assert.doesNotThrow(() => validateSimulationAnswers(answers));
  assert.equal(
    isSimulationTaskComplete('manager-explanation', { ...answers['manager-explanation'], followUpReply: '' }),
    false,
  );
  assert.equal(isSimulationTaskComplete('escalation-decision', { escalate: [], rationale: 'None need a human.' }), true);
  assert.throws(
    () => validateSimulationAnswers({
      ...answers,
      'escalation-decision': { escalate: ['conversation-9'], rationale: 'x' },
    }),
    /unknown conversation/i,
  );
});

test('evidence must be a verbatim quote of at least three words from the learner', () => {
  const texts = ['The order already shipped so a full refund is not allowed.'];
  assert.equal(isVerbatimQuote('“a full refund is not allowed”', texts), true);
  assert.equal(isVerbatimQuote('a refund is allowed', texts), false);
  assert.equal(isVerbatimQuote('refund', texts), false);
});

test('three assessor passes are combined by median with verified evidence', () => {
  const result = aggregateAssessments(
    [pass([3, 2, 3, 4]), pass([4, 3, 3, 4]), pass([3, 3, 5, 4])],
    completedAnswers(),
  );
  assert.deepEqual(result.skills.map((skill) => skill.score), [3, 3, 3, 4]);
  assert.deepEqual(result.skills[0].ratingChecks, [3, 4, 3]);
  assert.deepEqual(result.strongestSkills, ['Communicating to non-technical people']);
  assert.equal(result.overallScore, 3.3);
  assert.doesNotThrow(() => normalizeSimulationResult({ result }));
});

test('no credit without evidence: invented or missing quotes score 1 instead of failing', () => {
  const invented = QUOTES.map(() => 'the learner was excellent at everything');
  const result = aggregateAssessments(
    [pass([5, 5, 5, 5], invented), pass([4, 5, 5, 5], invented), pass([5, 5, 4, 5], invented)],
    completedAnswers(),
  );
  assert.deepEqual(result.skills.map((skill) => skill.score), [1, 1, 1, 1]);
  assert.ok(result.skills.every((skill) => skill.evidenceMissing && skill.evidence === ''));
  assert.deepEqual(result.skills[0].ratingChecks, [5, 4, 5]);           // raw reviews stay visible
  assert.equal(result.overallScore, 1);
  assert.doesNotThrow(() => normalizeSimulationResult({ result }));

  const empty = QUOTES.map(() => '');
  const mixed = aggregateAssessments([pass([1, 3, 3, 3], empty), pass([1, 3, 3, 3]), pass([1, 3, 3, 3])], completedAnswers());
  assert.deepEqual(mixed.skills.map((skill) => skill.score), [1, 3, 3, 3]);
  assert.ok(mixed.skills.every((skill) => !skill.evidenceMissing));
  assert.throws(() => aggregateAssessments([pass([3, 3, 3, 3])], completedAnswers()), /three/i);
  assert.throws(
    () => aggregateAssessments([pass([9, 3, 3, 3]), pass([3, 3, 3, 3]), pass([3, 3, 3, 3])], completedAnswers()),
    /invalid score/i,
  );
});

test('skill gap table follows the PDF p.15 formula', () => {
  const skills = [
    { id: 'evaluation', score: 3 },
    { id: 'policy', score: 2 },
    { id: 'problemSolving', score: 3 },
    { id: 'communication', score: 4 },
  ];
  const requirements = [
    { skillId: 'policy', importance: 3.8, level: 4.5 },
    { skillId: 'problemSolving', importance: 3.5, level: 4.4 },
    { skillId: 'evaluation', importance: 3.9, level: 3.6 },
    { skillId: 'communication', importance: 4.2, level: 4.6 },
  ];
  const rows = buildSkillGapTable(skills, requirements);
  const byId = Object.fromEntries(rows.map((row) => [row.skillId, row]));
  assert.deepEqual(
    [byId.policy.required, byId.policy.gap, byId.policy.priority, byId.policy.priorityRank],
    [4, 2, 7.6, 1],
  );
  assert.deepEqual(
    [byId.problemSolving.gap, byId.problemSolving.priority, byId.problemSolving.priorityRank],
    [1, 3.5, 2],
  );
  assert.equal(byId.evaluation.status, 'met');
  assert.equal(byId.communication.status, 'strength');

  const lowImportance = buildSkillGapTable(
    skills,
    requirements.map((item) => (item.skillId === 'policy' ? { ...item, importance: 2.5 } : item)),
  );
  assert.equal(lowImportance.find((row) => row.skillId === 'policy').status, 'not-in-plan');
  assert.throws(() => buildSkillGapTable(skills, requirements.slice(1)), /incomplete/i);
});
