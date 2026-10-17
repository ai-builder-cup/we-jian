import { SIMULATION_SCENARIO, SIMULATION_SKILLS, SIMULATION_TASK_IDS } from './simulationScenario.js';

const STORAGE_KEY = 'wejian.work-simulation-draft';
const CONVERSATION_IDS = SIMULATION_SCENARIO.conversations.map((conversation) => conversation.id);
const MAX_ANSWER_LENGTH = 3000;

export const emptySimulationAnswers = () => ({
  'review-conversations': Object.fromEntries(CONVERSATION_IDS.map((id) => [id, ''])),
  'escalation-decision': { escalate: [], rationale: '' },
  'rewrite-instructions': { instructions: '' },
  'manager-explanation': { explanation: '', followUp: null, followUpReply: '' },
});

const filled = (value) => typeof value === 'string' && value.trim().length > 0;

export function isConversationReviewed(response, conversationId) {
  return filled(response?.[conversationId]);
}

export function isSimulationTaskComplete(taskId, response) {
  if (!response || typeof response !== 'object') return false;
  if (taskId === 'review-conversations') {
    return CONVERSATION_IDS.every((id) => filled(response[id]));
  }
  if (taskId === 'escalation-decision') return Array.isArray(response.escalate) && filled(response.rationale);
  if (taskId === 'rewrite-instructions') return filled(response.instructions);
  if (taskId === 'manager-explanation') {
    return filled(response.explanation) && Boolean(response.followUp?.message) && filled(response.followUpReply);
  }
  return false;
}

export function validateSimulationAnswers(answers) {
  if (!answers || typeof answers !== 'object') {
    throw new Error('Please complete each simulation task before submitting.');
  }
  for (const taskId of SIMULATION_TASK_IDS) {
    if (!isSimulationTaskComplete(taskId, answers[taskId])) {
      throw new Error('Please complete each simulation task before submitting.');
    }
  }
  const escalate = answers['escalation-decision'].escalate;
  if (escalate.some((id) => !CONVERSATION_IDS.includes(id)) || new Set(escalate).size !== escalate.length) {
    throw new Error('The escalation decision contains an unknown conversation.');
  }
  if (learnerAnswerTexts(answers).some((text) => text.length > MAX_ANSWER_LENGTH)) {
    throw new Error('A simulation answer exceeds the 3,000-character limit.');
  }
}

// Only the learner's own words: evidence quotes must come from these.
export function learnerAnswerTexts(answers) {
  return [
    ...CONVERSATION_IDS.map((id) => answers['review-conversations'][id]),
    answers['escalation-decision'].rationale,
    answers['rewrite-instructions'].instructions,
    answers['manager-explanation'].explanation,
    answers['manager-explanation'].followUpReply,
  ].filter(filled);
}

function normalizeQuote(value) {
  return String(value)
    .toLowerCase()
    .replace(/[“”"‘’'`…]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,;:!?-]+|[\s.,;:!?-]+$/g, '')
    .trim();
}

export function isVerbatimQuote(quote, answerTexts) {
  const normalized = normalizeQuote(quote);
  if (normalized.split(' ').length < 3) return false;
  return answerTexts.some((text) => normalizeQuote(text).includes(normalized));
}

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

// Combines three independent grader passes: median score per skill, plus a quote verified
// against the learner's own answers (PDF p.12: "checked 3 times for consistency").
export function aggregateAssessments(passes, answers) {
  if (!Array.isArray(passes) || passes.length !== 3) {
    throw new Error('Three assessment passes are required.');
  }
  const answerTexts = learnerAnswerTexts(answers);
  const skills = SIMULATION_SKILLS.map(({ id, label }) => {
    const ratings = passes.map((pass) => {
      const rating = pass?.skills?.find((skill) => skill?.id === id);
      const score = Number(rating?.score);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new Error(`The assessor returned an invalid score for ${label}.`);
      }
      return { score, evidence: rating.evidence, rationale: rating.rationale };
    });
    const score = median(ratings.map((rating) => rating.score));
    const supported = ratings
      .filter((rating) => typeof rating.evidence === 'string' && isVerbatimQuote(rating.evidence, answerTexts))
      .sort((left, right) => Math.abs(left.score - score) - Math.abs(right.score - score));
    // No credit without evidence: if no pass could quote the learner's own words, the skill scores 1.
    if (supported.length === 0) {
      return {
        id,
        label,
        score: 1,
        max: 5,
        evidence: '',
        evidenceMissing: true,
        rationale: 'Your answers were too short to show this skill. Write full sentences to get credit next time.',
        ratingChecks: ratings.map((rating) => rating.score),
      };
    }
    return {
      id,
      label,
      score,
      max: 5,
      evidence: supported[0].evidence.trim().replace(/^["“]|["”]$/g, ''),
      rationale: typeof supported[0].rationale === 'string' ? supported[0].rationale.trim() : '',
      ratingChecks: ratings.map((rating) => rating.score),
    };
  });

  return {
    skills,
    overallScore: Math.round((skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length) * 10) / 10,
    strongestSkills: skills.filter((skill) => skill.score >= 4).sort((a, b) => b.score - a.score).map((skill) => skill.label),
    developmentAreas: skills.filter((skill) => skill.score <= 3).sort((a, b) => a.score - b.score).map((skill) => skill.label),
    distressConcern: passes.some((pass) => pass?.distressConcern === true),
  };
}

export function normalizeSimulationResult(payload) {
  const result = payload?.result || payload;
  if (!result || !Array.isArray(result.skills) || result.skills.length === 0) {
    throw new Error('The simulation API returned no scored skills.');
  }
  const skills = result.skills.map((skill) => {
    const score = Number(skill.score);
    if (!skill.label || !Number.isFinite(score) || score < 1 || score > 5) {
      throw new Error('The simulation API returned an invalid skill score.');
    }
    if (!skill.evidence && !skill.evidenceMissing) {
      throw new Error(`The simulation API returned no evidence for ${skill.label}.`);
    }
    if (!Array.isArray(skill.ratingChecks) || skill.ratingChecks.length !== 3) {
      throw new Error(`The simulation API must provide three consistency ratings for ${skill.label}.`);
    }
    const ratings = skill.ratingChecks.map(Number);
    if (ratings.some((rating) => !Number.isFinite(rating) || rating < 1 || rating > 5)) {
      throw new Error(`The simulation API returned invalid consistency ratings for ${skill.label}.`);
    }
    if (skill.evidenceMissing ? score !== 1 : score !== median(ratings)) {
      throw new Error(`The reported score for ${skill.label} does not match its three-review median.`);
    }
    return { ...skill, score, max: 5, ratingChecks: ratings };
  });
  return {
    ...result,
    overallScore: Math.round((skills.reduce((sum, skill) => sum + skill.score, 0) / skills.length) * 10) / 10,
    skills,
    strongestSkills: Array.isArray(result.strongestSkills) ? result.strongestSkills : [],
    developmentAreas: Array.isArray(result.developmentAreas) ? result.developmentAreas : [],
    summary: String(result.summary || ''),
    distressConcern: result.distressConcern === true,
  };
}

// PDF p.15: required = round(1 + level × 4/7); gap = required − shown; priority = gap × importance.
// Skills with importance below 3 are left out of the plan, and strengths are not retrained.
export function buildSkillGapTable(skills, requirements) {
  if (!Array.isArray(skills) || !Array.isArray(requirements)) {
    throw new Error('Skill scores and job requirements must be arrays.');
  }
  const rows = SIMULATION_SKILLS.map(({ id, label, onetElement }) => {
    const skill = skills.find((item) => item.id === id);
    const requirement = requirements.find((item) => item.skillId === id);
    const shown = Number(skill?.score);
    const importance = Number(requirement?.importance);
    const level = Number(requirement?.level);
    if (
      !Number.isFinite(shown) ||
      !Number.isFinite(importance) || importance < 1 || importance > 5 ||
      !Number.isFinite(level) || level < 0 || level > 7
    ) {
      throw new Error(`The skill-gap data for ${label} is incomplete or out of range.`);
    }
    const required = Math.round(1 + (level * 4) / 7);
    const gap = Math.max(0, required - shown);
    const inPlan = importance >= 3;
    return {
      skillId: id,
      label,
      onetElement: requirement.onetElement || onetElement,
      importance,
      level,
      required,
      shown,
      gap,
      priority: inPlan ? Math.round(gap * importance * 10) / 10 : 0,
      status: !inPlan ? 'not-in-plan' : gap > 0 ? 'priority' : shown >= 4 ? 'strength' : 'met',
      priorityRank: null,
    };
  });
  rows
    .filter((row) => row.status === 'priority')
    .sort((left, right) => right.priority - left.priority)
    .forEach((row, index) => { row.priorityRank = index + 1; });
  return rows;
}

export function saveSimulationDraft(draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Drafts are a convenience; the simulation still works without storage.
  }
}

export function getSimulationDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (draft && draft.session?.id && draft.answers && Number.isInteger(draft.stepIndex)) {
      return draft;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearSimulationDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
