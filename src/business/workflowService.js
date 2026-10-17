const STORAGE_KEY = 'wejian.completed-processes';
const QUESTIONNAIRE_RESULT_KEY = 'wejian.questionnaire-result';
const SIMULATION_RESULT_KEY = 'wejian.simulation-result';
const CV_PROFILE_KEY = 'wejian.cv-profile';
// Kept apart from the CV profile on purpose: the profile is what gets posted to the server
// for the AI steps, and the student's name has no business being in it.
const LEARNER_NAME_KEY = 'wejian.learner-name';
const CAREER_DIRECTIONS_KEY = 'wejian.career-directions';
const TARGET_DIRECTION_KEY = 'wejian.target-direction';
const SKILL_GAP_PLAN_KEY = 'wejian.skill-gap-plan';

export const PROCESS_ORDER = [
  'sample-questionnaire',
  'work-simulation',
  'career-directions',
  'skill-gap-plan',
];

function read(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); the current session still works.
  }
}

function readCompletedProcesses() {
  const stored = read(STORAGE_KEY);
  return Array.isArray(stored) ? stored : [];
}

export function isProcessComplete(processId) {
  return readCompletedProcesses().includes(processId);
}

export function completeProcess(processId) {
  const completed = new Set(readCompletedProcesses());
  completed.add(processId);
  write(STORAGE_KEY, [...completed]);
}

export const saveQuestionnaireResult = (result) => write(QUESTIONNAIRE_RESULT_KEY, result);
export const getQuestionnaireResult = () => read(QUESTIONNAIRE_RESULT_KEY);
export const saveSimulationResult = (result) => write(SIMULATION_RESULT_KEY, result);
export const getSimulationResult = () => read(SIMULATION_RESULT_KEY);
export const saveCvProfile = (profile) => write(CV_PROFILE_KEY, profile);
export const getCvProfile = () => read(CV_PROFILE_KEY);
export const saveLearnerName = (name) => write(LEARNER_NAME_KEY, name);
export const getLearnerName = () => read(LEARNER_NAME_KEY) || '';
export const saveCareerDirections = (recommendations) => write(CAREER_DIRECTIONS_KEY, recommendations);
export const getCareerDirections = () => read(CAREER_DIRECTIONS_KEY);
export const getTargetDirection = () => read(TARGET_DIRECTION_KEY);
export const getSkillGapPlan = () => read(SKILL_GAP_PLAN_KEY);
export const saveSkillGapPlan = (plan) => write(SKILL_GAP_PLAN_KEY, plan);

// Choosing a different direction invalidates the plan built for the previous one.
export function saveTargetDirection(title) {
  if (getTargetDirection() !== title) {
    try {
      localStorage.removeItem(SKILL_GAP_PLAN_KEY);
    } catch {
      // Nothing to remove.
    }
  }
  write(TARGET_DIRECTION_KEY, title);
  completeProcess('career-directions');
}

export function resetJourney() {
  for (const key of [
    STORAGE_KEY,
    QUESTIONNAIRE_RESULT_KEY,
    SIMULATION_RESULT_KEY,
    CV_PROFILE_KEY,
    LEARNER_NAME_KEY,
    CAREER_DIRECTIONS_KEY,
    TARGET_DIRECTION_KEY,
    SKILL_GAP_PLAN_KEY,
    'wejian.work-simulation-draft',
  ]) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore unavailable storage.
    }
  }
}

// Each quest unlocks only after the previous one is complete.
export function canAccessProcess(processId) {
  const index = PROCESS_ORDER.indexOf(processId);
  if (index === -1 || !getCvProfile()) return false;
  return PROCESS_ORDER.slice(0, index).every(isProcessComplete);
}
