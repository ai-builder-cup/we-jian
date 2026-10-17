// The one interest-fit formula, shared by the curated job bank and the full ISCO-08
// occupation map so the two can never drift apart. Fixed arithmetic, no AI.
// Same rules as the Python backend (wejian-questionnaire/app/scoring.py, riasec-fit-v1).
export const MATCH_METHOD = 'riasec-fit-v1';

const MATCH_LABELS = [[0.75, 'strong'], [0.5, 'good'], [0, 'some']];

// fit = (2 × student score on the job's 1st letter + score on its 2nd letter) / (3 × max per type)
export function jobFit(scores, code, maxPerType) {
  const [first, second] = code.split('-');
  return Math.round(((2 * scores[first] + scores[second]) / (3 * maxPerType)) * 100) / 100;
}

export const fitLabel = (fit) => MATCH_LABELS.find(([cut]) => fit >= cut)[1];
