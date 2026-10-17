const SECTION_ORDER = ['interest', 'readiness', 'goals'];

function normalizeSection(section) {
  const normalized = String(section || '').trim().toLowerCase();
  if (normalized.startsWith('interest')) return 'Interest';
  if (normalized.startsWith('readiness')) return 'Readiness';
  if (normalized.startsWith('goal')) return 'Goals';
  return section || 'Questionnaire';
}

function normalizeType(type) {
  const normalized = String(type || '').toLowerCase().replace(/[-\s]/g, '_');
  if (['multiple_choice', 'multiplechoice', 'scale'].includes(normalized)) {
    return 'multiple_choice';
  }
  if (normalized === 'radio') return 'radio';
  if (normalized === 'multi_select') return 'multi_select';
  if (normalized === 'essay' || normalized === 'text') return 'essay';
  throw new Error(`Unsupported question type: ${type || '(missing)'}.`);
}

function normalizeOptions(options, questionId) {
  if (!Array.isArray(options) || options.length === 0) {
    throw new Error(`Question ${questionId} must include at least one option.`);
  }
  return options.map((option) => {
    if (typeof option === 'string' || typeof option === 'number') {
      return { value: option, label: String(option) };
    }
    if (option && option.value !== undefined && option.label !== undefined) {
      return option;
    }
    throw new Error(`Question ${questionId} has an invalid option.`);
  });
}

export function normalizeQuestions(payload) {
  const questions = Array.isArray(payload) ? payload : payload?.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('The API did not return any questionnaire questions.');
  }

  const normalized = questions.map((question, index) => {
    if (!question?.id || !question?.prompt) {
      throw new Error(`Question ${index + 1} is missing its id or prompt.`);
    }
    const type = normalizeType(question.type);
    return {
      ...question,
      id: String(question.id),
      section: normalizeSection(question.section),
      prompt: String(question.prompt),
      type,
      options: type === 'essay' ? [] : normalizeOptions(question.options, question.id),
      source: question.source || '',
    };
  });

  return normalized.sort((a, b) => {
    const aIndex = SECTION_ORDER.indexOf(a.section.toLowerCase());
    const bIndex = SECTION_ORDER.indexOf(b.section.toLowerCase());
    const aRank = aIndex === -1 ? SECTION_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? SECTION_ORDER.length : bIndex;
    return aRank - bRank;
  });
}

export function isAnswerComplete(question, answer) {
  if (question.type === 'essay') return typeof answer === 'string' && answer.trim().length > 0;
  if (question.type === 'multi_select') {
    return Array.isArray(answer) && answer.length === Number(question.maxSelections || 1);
  }
  return answer !== undefined && answer !== null && answer !== '';
}

export function normalizeResult(payload) {
  const result = payload?.result || payload;
  if (!result?.interestCode || !Array.isArray(result.chart)) {
    throw new Error('The API returned an invalid questionnaire result.');
  }
  return {
    interestCode: String(result.interestCode),
    chart: result.chart.map((item) => {
      if (!item?.label || !Number.isFinite(Number(item.value))) {
        throw new Error('The API returned an invalid result chart.');
      }
      const value = Number(item.value);
      const max = Number(item.max ?? Math.max(value, 5));
      if (!Number.isFinite(max) || max <= 0) {
        throw new Error('The API returned an invalid result chart scale.');
      }
      return { ...(item.id ? { id: String(item.id) } : {}), label: String(item.label), value, max };
    }),
    ...(result.readiness ? { readiness: normalizeReadiness(result.readiness) } : {}),
    ...(result.goals ? { goals: result.goals } : {}),
    ...(Array.isArray(result.topTypes) ? { topTypes: result.topTypes.map(String) } : {}),
    ...(Array.isArray(result.flags) ? { flags: result.flags.map(String) } : {}),
    ...(result.jobs && Array.isArray(result.jobs.top) ? { jobs: result.jobs } : {}),
    ...(result.worldOfWork ? { worldOfWork: normalizeWorldOfWork(result.worldOfWork) } : {}),
    ...(result.scoringVersion ? { scoringVersion: String(result.scoringVersion) } : {}),
    explanation: String(result.explanation || ''),
  };
}

// Interest fit across the full ISCO-08 occupation map, computed on the server (the bank is far
// too large to ship to the browser). Optional: an older server simply will not send it.
function normalizeWorldOfWork(worldOfWork) {
  const normalizeMatch = (occupation) => ({
    isco: String(occupation.isco || ''),
    title: String(occupation.title || ''),
    riasec: String(occupation.riasec || ''),
    collar: String(occupation.collar || ''),
    match: String(occupation.match || ''),
    fit: Number(occupation.fit),
    confidence: String(occupation.confidence || ''),
  });
  const kinds = worldOfWork.byKindOfWork && typeof worldOfWork.byKindOfWork === 'object'
    ? worldOfWork.byKindOfWork
    : {};
  return {
    of: Number(worldOfWork.of) || 0,
    top: Array.isArray(worldOfWork.top) ? worldOfWork.top.map(normalizeMatch) : [],
    byKindOfWork: Object.fromEntries(Object.entries(kinds)
      .filter(([, list]) => Array.isArray(list) && list.length > 0)
      .map(([collar, list]) => [String(collar), list.map(normalizeMatch)])),
  };
}

function normalizeReadiness(readiness) {
  const average = Number(readiness.average);
  if (!Number.isFinite(average) || !Array.isArray(readiness.dimensions)) {
    throw new Error('The API returned an invalid readiness result.');
  }
  return {
    average,
    max: Number(readiness.max ?? 5),
    dimensions: readiness.dimensions.map((dimension) => ({
      id: String(dimension.id),
      label: String(dimension.label),
      value: Number(dimension.value),
      max: Number(dimension.max ?? 5),
    })),
    lowest: Array.isArray(readiness.lowest) ? readiness.lowest.map(String) : [],
    straightLined: Boolean(readiness.straightLined),
  };
}

// Position of a question inside its own section, for "A · Interests · 3/12" labels.
export function sectionProgress(questions, index) {
  const current = questions[index];
  if (!current) return { position: 0, total: 0 };
  const sectionQuestions = questions.filter((question) => question.section === current.section);
  return {
    position: sectionQuestions.indexOf(current) + 1,
    total: sectionQuestions.length,
  };
}
