// Interest matching against the full ISCO-08 occupation map: every occupation in the world,
// white collar to blue collar. Same fixed formula as the curated job bank, no AI involved.
//
// SERVER-SIDE ONLY. occupationBank.js is ~250 KB and must stay out of the browser bundle.
//
// Why this exists alongside matchJobs(): the curated bank answers "which growing jobs fit
// you". This answers "where do you sit in the whole world of work" - which is the only way a
// welder, a driver, a cook or a farmer can be told something true about themselves.
import { OCCUPATIONS, OCCUPATION_BANK_VERSION } from './occupationBank.js';

// Not riasec-fit-v1. That formula reads only an occupation's two leading interest letters,
// which is all the curated job bank has. Here we hold the full six-dimension O*NET profile for
// every occupation, and the two-letter code cannot tell ~100 "R-C" occupations apart: a welder,
// a bartender and a bus driver all score identically, so the list comes back alphabetical.
// Correlating the whole profile shape separates them, and is how interest inventories are
// normally scored. The curated bank keeps riasec-fit-v1 unchanged.
export const PROFILE_MATCH_METHOD = 'riasec-profile-v1';

const TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
const CONFIDENCE_ORDER = { high: 0, medium: 1, low: 2 };
// Labels for the correlation scale, where 0.5 means "no relationship at all". The curated job
// bank's thresholds do not transfer: there, 0.5 is a genuine half-fit.
const PROFILE_LABELS = [[0.9, 'strong'], [0.75, 'good'], [0, 'some']];
// Below this (correlation 0.2) an occupation has little to do with what the student likes.
// Filling a column with those would be padding a page rather than offering an option.
const WORTH_SHOWING = 0.6;
const profileLabel = (fit) => PROFILE_LABELS.find(([cut]) => fit >= cut)[1];
const DEFAULT_LIMIT = 12;
// Blue-collar work is 157 of the 436 unit groups. Ranking the whole map by fit alone would
// still hand a Realistic student a list that is all one kind of job, so the grounding we give
// the direction agent takes the best few from each collar as well as the best overall.
const DEFAULT_PER_COLLAR = 4;

// Pearson correlation between the student's six interest scores and the occupation's.
// Correlation compares the SHAPE of the two profiles, so a student who rated everything
// generously is not pushed towards every occupation at once; only the relative pattern counts.
// Returns -1 (opposite) to 1 (same shape); rescaled to 0-1 so it reads like the other fits.
function profileFit(scores, interests) {
  const studentMean = TYPES.reduce((sum, type) => sum + (scores[type] || 0), 0) / TYPES.length;
  const jobMean = TYPES.reduce((sum, type) => sum + interests[type], 0) / TYPES.length;
  let covariance = 0;
  let studentVariance = 0;
  let jobVariance = 0;
  for (const type of TYPES) {
    const studentDelta = (scores[type] || 0) - studentMean;
    const jobDelta = interests[type] - jobMean;
    covariance += studentDelta * jobDelta;
    studentVariance += studentDelta ** 2;
    jobVariance += jobDelta ** 2;
  }
  // A completely flat answer sheet has no shape to compare; say so rather than inventing a rank.
  if (studentVariance === 0 || jobVariance === 0) return 0.5;
  const correlation = covariance / Math.sqrt(studentVariance * jobVariance);
  return Math.round(((correlation + 1) / 2) * 100) / 100;
}

function rank(scores, pool) {
  return pool
    .map((occupation) => {
      const fit = profileFit(scores, occupation.interests);
      return {
        isco: occupation.isco,
        title: occupation.title,
        riasec: occupation.riasec,
        collar: occupation.collar,
        skillLevel: occupation.skillLevel,
        group: occupation.minorLabel,
        fit,
        match: profileLabel(fit),
        // How far to trust this occupation's interest code (see occupationBank.js).
        confidence: occupation.confidence,
      };
    })
    // Equal fit: better-evidenced occupations first, then alphabetical so results are stable.
    .sort((a, b) => b.fit - a.fit
      || (CONFIDENCE_ORDER[a.confidence] ?? 3) - (CONFIDENCE_ORDER[b.confidence] ?? 3)
      || a.title.localeCompare(b.title));
}

// A two-letter interest code is coarse: every R-C occupation scores exactly the same, so a
// straight sort hands back whichever ones happen to sort first ("Agricultural…", "Air
// Conditioning…", "Assemblers…"). That reads as a machine listing synonyms rather than as a
// set of options. Within one fit score, take turns between occupation groups so the list
// spans different kinds of work. Order within a group, and the fit values, do not change.
function spreadAcrossGroups(ranked) {
  const byFit = new Map();
  for (const occupation of ranked) {
    if (!byFit.has(occupation.fit)) byFit.set(occupation.fit, new Map());
    const groups = byFit.get(occupation.fit);
    if (!groups.has(occupation.group)) groups.set(occupation.group, []);
    groups.get(occupation.group).push(occupation);
  }
  const spread = [];
  for (const groups of byFit.values()) {
    const queues = [...groups.values()];
    while (queues.some((queue) => queue.length > 0)) {
      for (const queue of queues) if (queue.length > 0) spread.push(queue.shift());
    }
  }
  return spread;
}

// Best-fitting occupations across the whole world of work.
export function matchOccupations(scores, { limit = DEFAULT_LIMIT, collar = null } = {}) {
  const pool = collar ? OCCUPATIONS.filter((occupation) => occupation.collar === collar) : OCCUPATIONS;
  return {
    method: PROFILE_MATCH_METHOD,
    bank: OCCUPATION_BANK_VERSION,
    of: pool.length,
    top: spreadAcrossGroups(rank(scores, pool)).slice(0, limit),
  };
}

// The same ranking, but guaranteeing each kind of work is represented. Armed forces are left
// out: three unit groups, and nobody should be nudged into enlisting by an interest score.
export function matchOccupationsByCollar(scores, { perCollar = DEFAULT_PER_COLLAR } = {}) {
  const ranked = spreadAcrossGroups(rank(scores, OCCUPATIONS.filter((occupation) => occupation.collar !== 'uniformed')));
  const byCollar = {};
  for (const occupation of ranked) {
    // A kind of work that genuinely does not suit this student is left out rather than filled
    // with its least-bad option. Showing someone a poor match under a reassuring heading is
    // worse than showing them nothing: it reads as the only door open to them.
    if (occupation.fit < WORTH_SHOWING) continue;
    const bucket = (byCollar[occupation.collar] ||= []);
    if (bucket.length < perCollar) bucket.push(occupation);
  }
  return byCollar;
}

export function findOccupation(iscoOrTitle) {
  const needle = String(iscoOrTitle || '').trim().toLowerCase();
  if (!needle) return null;
  return OCCUPATIONS.find((occupation) => occupation.isco === needle)
    || OCCUPATIONS.find((occupation) => occupation.title.toLowerCase() === needle)
    || null;
}
