// Fixed item bank (PDF p.19): AI never writes or edits items, and scores are computed by formula.
//
// Interests: the official 30-item O*NET Mini Interest Profiler (Rounds, Ming, Cao, Song & Lewis, 2016,
//   Appendix A), items in the suggested order, scored 0–4 and summed per type (0–20).
//   English items are used verbatim under CC BY-ND 4.0 (https://www.onetcenter.org/license_tools.html).
// Readiness: the 12-item CAAS-SF (Maggiori, Rossier & Savickas, 2017), items © M. L. Savickas & E. J. Porfeli.
//   Demo use; get written permission before any commercial use.
// Team rules (thresholds) are at the bottom of this file. Change them there only.
import { matchJobs } from './jobMatching.js';

export const SCORING_VERSION = 'q-1.2';

export const RIASEC_TYPES = [
  { id: 'R', label: 'Realistic' },
  { id: 'I', label: 'Investigative' },
  { id: 'A', label: 'Artistic' },
  { id: 'S', label: 'Social' },
  { id: 'E', label: 'Enterprising' },
  { id: 'C', label: 'Conventional' },
];

export const CAAS_DIMENSIONS = [
  { id: 'concern', label: 'Concern' },
  { id: 'control', label: 'Control' },
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'confidence', label: 'Confidence' },
];

export const INTEREST_ATTRIBUTION =
  'This product includes information from the O*NET Career Exploration Tools by the U.S. Department of Labor, '
  + 'Employment and Training Administration (USDOL/ETA). Used under the CC BY-ND 4.0 license. '
  + 'O*NET® is a trademark of USDOL/ETA.';
export const READINESS_ATTRIBUTION =
  'Career Adapt-Abilities Scale – Short Form (Maggiori, Rossier & Savickas, 2017); items © Mark L. Savickas & '
  + 'Erik J. Porfeli. Demo use.';

const INTEREST_SOURCE = 'O*NET Mini Interest Profiler · CC BY-ND 4.0';
const READINESS_SOURCE = 'CAAS-SF (Maggiori, Rossier & Savickas, 2017) · demo use';
const GOALS_SOURCE = 'Team question · not scored';

const INTEREST_OPTIONS = [
  { value: 0, label: 'Strongly dislike' },
  { value: 1, label: 'Dislike' },
  { value: 2, label: 'Unsure' },
  { value: 3, label: 'Like' },
  { value: 4, label: 'Strongly like' },
];

// Anchors from the developer's published CAAS form, lowest to highest like the interest scale.
const READINESS_OPTIONS = [
  { value: 1, label: 'Not strong' },
  { value: 2, label: 'Somewhat strong' },
  { value: 3, label: 'Strong' },
  { value: 4, label: 'Very strong' },
  { value: 5, label: 'Strongest' },
];

// Official Mini-IP items in their suggested positions 1–30 (Appendix A).
const INTEREST_ITEMS = [
  ['R', 'Build kitchen cabinets'],
  ['I', 'Develop a new medicine'],
  ['A', 'Write books or plays'],
  ['S', 'Help people with personal or emotional problems'],
  ['E', 'Manage a department within a large company'],
  ['C', 'Install software across computers on a large network'],
  ['R', 'Repair household appliances'],
  ['I', 'Study ways to reduce water pollution'],
  ['A', 'Compose or arrange music'],
  ['S', 'Give career guidance to people'],
  ['E', 'Start your own business'],
  ['C', 'Operate a calculator'],
  ['R', 'Assemble electronic parts'],
  ['I', 'Conduct chemical experiments'],
  ['A', 'Create special effects for movies'],
  ['S', 'Perform rehabilitation therapy'],
  ['E', 'Negotiate business contracts'],
  ['C', 'Keep shipping and receiving records'],
  ['R', 'Drive a truck to deliver packages to offices and homes'],
  ['I', 'Examine blood samples using a microscope'],
  ['A', 'Paint sets for plays'],
  ['S', 'Do volunteer work at a non-profit organization'],
  ['E', 'Market a new line of clothing'],
  ['C', 'Inventory supplies using a hand-held computer'],
  ['R', 'Test the quality of parts before shipment'],
  ['I', 'Develop a way to better predict the weather'],
  ['A', 'Write scripts for movies or television shows'],
  ['S', 'Teach a high-school class'],
  ['E', 'Sell merchandise at a department store'],
  ['C', 'Stamp, sort, and distribute mail for an organization'],
];

// CAAS-SF items, verbatim (cross-checked with the developer's published CAAS form).
const READINESS_ITEMS = [
  ['concern', 'Thinking about what my future will be like'],
  ['concern', 'Preparing for the future'],
  ['concern', 'Becoming aware of the educational and vocational choices that I must make'],
  ['control', 'Making decisions by myself'],
  ['control', 'Taking responsibility for my actions'],
  ['control', 'Counting on myself'],
  ['curiosity', 'Looking for opportunities to grow as a person'],
  ['curiosity', 'Investigating options before making a choice'],
  ['curiosity', 'Observing different ways of doing things'],
  ['confidence', 'Taking care to do things well'],
  ['confidence', 'Learning new skills'],
  ['confidence', 'Working up to my ability'],
];

// O*NET Work Values (O*NET Content Model), described in plain language by the We.Jian team.
// Not scored: passed to the career-directions agent and shown back to the student.
export const WORK_VALUES = [
  { value: 'achievement', label: 'Achievement', description: 'Using your strongest abilities and seeing results you can be proud of.' },
  { value: 'independence', label: 'Independence', description: 'Working on your own and making your own decisions.' },
  { value: 'recognition', label: 'Recognition', description: 'Room to advance, lead, and be respected for your work.' },
  { value: 'relationships', label: 'Relationships', description: 'Friendly co-workers and work that helps other people.' },
  { value: 'support', label: 'Support', description: 'Managers who back you up and train you well.' },
  { value: 'working_conditions', label: 'Security & conditions', description: 'Stable job, fair pay, and good working conditions.' },
];
export const WORK_VALUES_PICK = 3;

const GOAL_ITEMS = [
  {
    id: 'goals-target-job',
    key: 'targetJob',
    prompt: 'What job do you most want after graduating?',
    placeholder: 'e.g. Data analyst, nurse, marketing at a startup',
  },
  {
    id: 'goals-work-values',
    key: 'workValues',
    prompt: `What matters most to you in a job? Pick your top ${WORK_VALUES_PICK}.`,
    type: 'multi_select',
  },
  {
    id: 'goals-reasons',
    key: 'reasons',
    prompt: 'Why does that job appeal to you?',
    placeholder: 'What draws you to it?',
  },
  {
    id: 'goals-ai-concerns',
    key: 'aiConcerns',
    prompt: 'What concerns you most about how AI might change that job?',
    placeholder: 'It is fine to say you are not sure yet.',
  },
];

// Someone who came here to change direction is not graduating from anything, so the one
// Goals prompt that assumes they are gets reworded for them. Only We.Jian's own unscored
// questions may be touched this way: the 30 Mini-IP and 12 CAAS items are licensed
// instruments and are never reworded, and no scoring key changes, so results stay comparable.
const PROFESSIONAL_PROMPTS = {
  'goals-target-job': {
    prompt: 'What job do you most want to move into?',
    placeholder: 'e.g. Data analyst, project manager, something hands-on',
  },
};

export function questionnaireItemsFor(userType) {
  if (userType !== 'professional') return QUESTIONNAIRE_ITEMS;
  return QUESTIONNAIRE_ITEMS.map((item) => (
    PROFESSIONAL_PROMPTS[item.id] ? { ...item, ...PROFESSIONAL_PROMPTS[item.id] } : item
  ));
}

export const QUESTIONNAIRE_ITEMS = [
  ...INTEREST_ITEMS.map(([riasec, activity], index) => ({
    id: `interest-${index + 1}`,
    section: 'Interest',
    sectionLabel: 'A · Interests',
    stem: 'How much would you like doing this activity? Don’t think about pay or training.',
    prompt: activity,
    type: 'multiple_choice',
    layout: 'vertical',
    options: INTEREST_OPTIONS,
    scoring: { scale: 'riasec', key: riasec },
    source: INTEREST_SOURCE,
  })),
  ...READINESS_ITEMS.map(([dimension, ability], index) => ({
    id: `readiness-${index + 1}`,
    section: 'Readiness',
    sectionLabel: 'B · Readiness',
    stem: 'How strongly have you developed this ability?',
    prompt: ability,
    type: 'multiple_choice',
    layout: 'vertical',
    options: READINESS_OPTIONS,
    scoring: { scale: 'caas', key: dimension },
    source: READINESS_SOURCE,
  })),
  ...GOAL_ITEMS.map(({ id, key, prompt, placeholder, type = 'essay' }) => ({
    id,
    section: 'Goals',
    sectionLabel: 'C · Goals',
    prompt,
    ...(type === 'multi_select'
      ? { type, options: WORK_VALUES, maxSelections: WORK_VALUES_PICK, source: 'O*NET Work Values · not scored' }
      : { type, placeholder, source: GOALS_SOURCE }),
    scoring: { scale: 'goals', key },
  })),
];

// --- Team rules --------------------------------------------------------------
const INTEREST_MAX_PER_ITEM = 4;
const FLAT_PROFILE_MAX_SPREAD = 4; // top − bottom RIASEC sum ≤ this → "flat_profile"
const LOW_INTEREST_MAX_TOP = 8; // top RIASEC sum ≤ this → "low_interest_overall"
// -----------------------------------------------------------------------------

const SCALE_RANGE = { riasec: [0, INTEREST_MAX_PER_ITEM], caas: [1, 5] };
const round1 = (value) => Math.round(value * 10) / 10;

function answerValue(answers, id) {
  return answers instanceof Map ? answers.get(id) : answers?.[id];
}

// Interest: sum of 0–4 ratings per RIASEC type (0–20). Readiness: CAAS mean per dimension and overall.
export function scoreQuestionnaire(answers, items = QUESTIONNAIRE_ITEMS) {
  const interestSums = new Map(RIASEC_TYPES.map(({ id }) => [id, { sum: 0, count: 0 }]));
  const caasScores = new Map(CAAS_DIMENSIONS.map(({ id }) => [id, []]));
  const goals = {};
  const interestRaw = [];
  const readinessRaw = [];

  for (const item of items) {
    const raw = answerValue(answers, item.id);
    if (raw === undefined || raw === null || raw === '') {
      throw new Error(`Question ${item.id} has no answer.`);
    }
    if (item.scoring.scale === 'goals') {
      if (item.type === 'multi_select') {
        const allowed = item.options.map((option) => option.value);
        if (!Array.isArray(raw) || raw.length !== item.maxSelections || new Set(raw).size !== raw.length
          || raw.some((value) => !allowed.includes(value))) {
          throw new Error(`Question ${item.id} needs exactly ${item.maxSelections} different choices.`);
        }
        goals[item.scoring.key] = [...raw];
      } else {
        goals[item.scoring.key] = String(raw).trim();
      }
      continue;
    }
    const value = Number(raw);
    const [low, high] = SCALE_RANGE[item.scoring.scale];
    if (!Number.isInteger(value) || value < low || value > high) {
      throw new Error(`Question ${item.id} has an answer outside the ${low}–${high} scale.`);
    }
    if (item.scoring.scale === 'riasec') {
      const entry = interestSums.get(item.scoring.key);
      entry.sum += value;
      entry.count += 1;
      interestRaw.push(value);
    } else {
      caasScores.get(item.scoring.key).push(value);
      readinessRaw.push(value);
    }
  }

  const chart = RIASEC_TYPES.map(({ id, label }) => {
    const { sum, count } = interestSums.get(id);
    return { id, label, value: sum, max: count * INTEREST_MAX_PER_ITEM };
  });
  // Ties keep RIASEC order so the same answers always give the same code.
  const ranked = [...chart].sort((left, right) => right.value - left.value);
  const interestCode = ranked.slice(0, 2).map((item) => item.id).join('-');
  const top = ranked[0].value;
  const topTypes = ranked.filter((item) => item.value === top).map((item) => item.id);

  const flags = [];
  if (top - ranked[ranked.length - 1].value <= FLAT_PROFILE_MAX_SPREAD) flags.push('flat_profile');
  if (top <= LOW_INTEREST_MAX_TOP) flags.push('low_interest_overall');
  if (ranked[0].value === ranked[1].value) flags.push('tie_first');
  if (ranked[1].value === ranked[2].value) flags.push('tie_second');
  if (interestRaw.length && new Set(interestRaw).size === 1) flags.push('straight_lined');

  const dimensions = CAAS_DIMENSIONS.map(({ id, label }) => {
    const values = caasScores.get(id);
    const value = values.length ? round1(values.reduce((sum, item) => sum + item, 0) / values.length) : 0;
    return { id, label, value, max: 5 };
  });
  const lowestValue = Math.min(...dimensions.map((dimension) => dimension.value));
  const allCaas = [...caasScores.values()].flat();
  const readiness = {
    average: allCaas.length ? round1(allCaas.reduce((sum, item) => sum + item, 0) / allCaas.length) : 0,
    max: 5,
    dimensions,
    lowest: dimensions.filter((dimension) => dimension.value === lowestValue).map((dimension) => dimension.id),
    straightLined: readinessRaw.length > 0 && new Set(readinessRaw).size === 1,
  };

  const scores = Object.fromEntries(chart.map(({ id, value }) => [id, value]));
  const unclear = flags.includes('flat_profile') || flags.includes('low_interest_overall');
  const jobs = matchJobs(scores, 5 * INTEREST_MAX_PER_ITEM, { lowConfidence: unclear });

  return { scoringVersion: SCORING_VERSION, interestCode, topTypes, flags, chart, readiness, jobs, goals };
}
