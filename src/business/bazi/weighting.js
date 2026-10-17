// Ten God weights and Day Master strength. No AI involved.
//
// This is the integrity bottleneck: every label further down is only as good as
// the weights computed here. Validated on its own in bazi.test.js — completeness
// across 120 day-stem × month-branch combinations, conservation, monotonicity,
// discriminant spread, and byte-identical determinism.

import {
  BRANCH_MAIN_ELEMENT, CONTROLLED_BY, CONTROLS, GOD_FAMILIES, PILLAR_NAMES,
  PRODUCED_BY, PRODUCES, STEM_ELEMENT, TEN_GODS,
  allBranches, hiddenStemsOf, isRooted, tenGodOf,
} from './chart.js';
import {
  ELEMENT_POINTS, HIDDEN_LAYER, POSITION_WEIGHT, ROOTING_BONUS, SEASON_FACTOR,
} from './constants.js';

export const FAMILY_OF = {
  ZhengCai: 'Wealth', PianCai: 'Wealth',
  ZhengGuan: 'Officer', QiSha: 'Officer',
  ShiShen: 'Output', ShangGuan: 'Output',
  ZhengYin: 'Resource', PianYin: 'Resource',
  BiJian: 'Peer', JieCai: 'Peer',
};

export const weightOf = (weights, god) => weights[god] ?? 0;

// Which element rules a month. Transitional branches (Chen, Wei, Xu, Chou) count
// as Earth months — an acknowledged simplification, flagged for calibration:
// schools disagree on how much of the previous season they still hold.
export const seasonRuler = (monthBranch) => BRANCH_MAIN_ELEMENT[monthBranch];

// 旺相休囚死, derived from relations rather than from a transcribed table.
export function seasonState(element, ruler) {
  if (element === ruler) return 'prime';
  if (PRODUCES[ruler] === element) return 'supported';
  if (PRODUCES[element] === ruler) return 'resting';
  if (CONTROLS[element] === ruler) return 'trapped';
  if (CONTROLS[ruler] === element) return 'dead';
  throw new Error(`seasonState: ${element} under ${ruler} is undefined`);
}

export const seasonFactor = (element, monthBranch) =>
  SEASON_FACTOR[seasonState(element, seasonRuler(monthBranch))];

const VISIBLE_STEMS = [
  { pillar: 'year', position: 'yearStem' },
  { pillar: 'month', position: 'monthStem' },
  { pillar: 'hour', position: 'hourStem' },
];
const BRANCH_POSITIONS = [
  { pillar: 'year', position: 'yearBranch' },
  { pillar: 'month', position: 'monthBranch' },
  { pillar: 'day', position: 'dayBranch' },
  { pillar: 'hour', position: 'hourBranch' },
];

// One contribution per stem, visible or hidden:
//   weight = position × layer × season × rooting
// The day stem is the Day Master itself and contributes no god: a stem is not a
// god to itself. Its branch still counts, being its house rather than itself.
export function contributions(pillars) {
  const dayStem = pillars.day.stem;
  const monthBranch = pillars.month.branch;
  const branches = allBranches(pillars);
  const out = [];

  for (const { pillar, position } of VISIBLE_STEMS) {
    const { stem } = pillars[pillar];
    const element = STEM_ELEMENT[stem];
    const rooted = isRooted(element, branches);
    out.push({
      god: tenGodOf(dayStem, stem),
      stem,
      element,
      position,
      layer: 'stem',
      rooted,
      weight: POSITION_WEIGHT[position] * seasonFactor(element, monthBranch) * (rooted ? ROOTING_BONUS : 1),
    });
  }

  for (const { pillar, position } of BRANCH_POSITIONS) {
    for (const hidden of hiddenStemsOf(pillars[pillar].branch)) {
      out.push({
        god: tenGodOf(dayStem, hidden.stem),
        stem: hidden.stem,
        element: hidden.element,
        position,
        layer: hidden.layer,
        rooted: false,
        weight: POSITION_WEIGHT[position] * HIDDEN_LAYER[hidden.layer] * seasonFactor(hidden.element, monthBranch),
      });
    }
  }

  return out;
}

export function godWeights(pillars) {
  const out = {};
  for (const contribution of contributions(pillars)) {
    out[contribution.god] = (out[contribution.god] ?? 0) + contribution.weight;
  }
  return out;
}

export function familyShares(weights) {
  const totals = Object.fromEntries(GOD_FAMILIES.map((family) => [family, 0]));
  // Iterate TEN_GODS, not Object.keys(weights): a forced order is what makes the
  // output byte-identical for identical input.
  for (const god of TEN_GODS) totals[FAMILY_OF[god]] += weightOf(weights, god);

  const total = GOD_FAMILIES.reduce((sum, family) => sum + totals[family], 0);
  if (total <= 0) throw new Error('familyShares: total weight is zero, input is invalid');

  return Object.fromEntries(GOD_FAMILIES.map((family) => [family, totals[family] / total]));
}

export function rankGods(weights) {
  return [...TEN_GODS]
    .filter((god) => weightOf(weights, god) > 0)
    .sort((a, b) => weightOf(weights, b) - weightOf(weights, a)
      || TEN_GODS.indexOf(a) - TEN_GODS.indexOf(b));
}

export function dominantFamily(shares) {
  return GOD_FAMILIES.reduce((best, family) => {
    if (shares[family] > shares[best]) return family;
    if (shares[family] === shares[best]) {
      return GOD_FAMILIES.indexOf(family) < GOD_FAMILIES.indexOf(best) ? family : best;
    }
    return best;
  }, GOD_FAMILIES[0]);
}

// Day Master strength, Cantian / Zi Ping method — the SAME formula the
// UnlockMyBazi production engine uses (getFavorableElements steps 2-7).
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS REPLACED THE EARLIER FORMULA
// ─────────────────────────────────────────────────────────────────────────────
// The first version scored the month by its MAIN qi alone. That is wrong often
// enough to matter, and it is wrong in the worst possible way: silently.
//
// Worked example, 戊辰 丙辰 甲午 甲戌 (甲 Wood born in 辰):
//   辰 main qi is 戊 Earth, so the old formula read the month as pure Earth and
//   scored Wood as "controlled by the month" — its second-lowest value. Result:
//   WEAK, favourable elements Water and Wood.
//   But 辰 also holds 乙 Wood as its MIDDLE qi, which roots the Day Master
//   inside its own season. Counting that gives season +2 (相) and a total of
//   4.5 — STRONG, favourable elements Metal and Fire.
//
// Strong and weak select OPPOSITE favourable elements, so this is not a nudge:
// it inverts the entire reading, and the output still looks perfectly plausible.
// The month branch's secondary and residual qi are therefore counted here.
//
// Scores are additive and unnormalised, unlike the earlier weighted average.
// That is deliberate: it is the shape the source engine was validated in, and
// renormalising it would be a second unvalidated change on top of the first.
const SEASON = { PRIME: 3, DM_SECONDARY: 2, RESOURCE_MAIN: 2, RESOURCE_SECONDARY: 1, OUTPUT_MAIN: -1, CONTROLLER_MAIN: -2, CONTROLLER_SECONDARY: -1, NEUTRAL: 0 };
const ROOT = { MAIN: 2, SECONDARY: 1, SEASON_RESONANCE: 1 };
const CANTIAN_THRESHOLD = { strong: 3, moderate: -2 };

// Weighted element presence: stem 2, branch main qi 2, each hidden stem 1.
export function elementPoints(pillars) {
  const points = Object.fromEntries(['Wood', 'Fire', 'Earth', 'Metal', 'Water'].map((e) => [e, 0]));
  for (const name of PILLAR_NAMES) {
    points[STEM_ELEMENT[pillars[name].stem]] += ELEMENT_POINTS.stem;
    hiddenStemsOf(pillars[name].branch).forEach((hidden, index) => {
      points[hidden.element] += index === 0 ? ELEMENT_POINTS.branchPrimary : ELEMENT_POINTS.branchHidden;
    });
  }
  return points;
}

// How the month treats the Day Master. Checked most-specific first, and the
// month's secondary qi is counted, not just its main qi.
function seasonWeight(monthBranch, dmElement) {
  const hidden = hiddenStemsOf(monthBranch);
  const main = hidden[0].element;
  const resource = PRODUCED_BY[dmElement];
  const controller = CONTROLLED_BY[dmElement];
  const output = PRODUCES[dmElement];
  const inSecondary = (element) => hidden.some((h, i) => h.element === element && i > 0);

  if (main === dmElement) return { score: SEASON.PRIME, state: 'prime', resonance: true };
  if (inSecondary(dmElement)) return { score: SEASON.DM_SECONDARY, state: 'rooted_in_season', resonance: false };
  if (main === resource) return { score: SEASON.RESOURCE_MAIN, state: 'resourced', resonance: false };
  if (inSecondary(resource)) return { score: SEASON.RESOURCE_SECONDARY, state: 'resourced_weakly', resonance: false };
  if (main === controller) return { score: SEASON.CONTROLLER_MAIN, state: 'controlled', resonance: false };
  if (inSecondary(controller)) return { score: SEASON.CONTROLLER_SECONDARY, state: 'controlled_weakly', resonance: false };
  if (main === output) return { score: SEASON.OUTPUT_MAIN, state: 'draining', resonance: false };
  return { score: SEASON.NEUTRAL, state: 'neutral', resonance: false };
}

// 通根 across every branch. Unlike the earlier version this SUMS layers rather
// than taking the strongest per branch, because the additive scale expects it.
function rootWeight(pillars, dmElement, resonance) {
  let total = 0;
  for (const name of PILLAR_NAMES) {
    hiddenStemsOf(pillars[name].branch).forEach((hidden, index) => {
      if (hidden.element === dmElement) total += index === 0 ? ROOT.MAIN : ROOT.SECONDARY;
    });
  }
  return total + (resonance ? ROOT.SEASON_RESONANCE : 0);
}

export function dayMasterStrength(pillars, dmElement) {
  const points = elementPoints(pillars);
  const season = seasonWeight(pillars.month.branch, dmElement);
  const rooting = rootWeight(pillars, dmElement, season.resonance);
  const support = (points[dmElement] + points[PRODUCED_BY[dmElement]]) / 2;
  const control = points[CONTROLLED_BY[dmElement]];
  const drain = points[PRODUCES[dmElement]] / 2;

  const score = season.score + rooting + support - control - drain;
  const strength = score >= CANTIAN_THRESHOLD.strong
    ? 'strong'
    : score >= CANTIAN_THRESHOLD.moderate ? 'moderate' : 'weak';

  return {
    strength,
    score,
    evidence: { season: season.score, seasonState: season.state, rooting, support, control, drain, points },
  };
}

// Combinations and clashes: DETECTED, never applied to the weights. Adding them
// before the base weights are calibrated means calibrating two unknowns at once,
// and never knowing which one was wrong. Their only effect is to lower stated
// confidence, which is the honest way to say "incomplete".
const SIX_HARMONY = [['Zi', 'Chou'], ['Yin', 'Hai'], ['Mao', 'Xu'], ['Chen', 'You'], ['Si', 'Shen'], ['Wu', 'Wei']];
const CLASH = [['Zi', 'Wu'], ['Chou', 'Wei'], ['Yin', 'Shen'], ['Mao', 'You'], ['Chen', 'Xu'], ['Si', 'Hai']];
const HARM = [['Zi', 'Wei'], ['Chou', 'Wu'], ['Yin', 'Si'], ['Mao', 'Chen'], ['Shen', 'Hai'], ['You', 'Xu']];
const SELF_PUNISH = ['Chen', 'Wu', 'You', 'Hai'];
const THREE_HARMONY = [
  { branches: ['Shen', 'Zi', 'Chen'], element: 'Water' },
  { branches: ['Hai', 'Mao', 'Wei'], element: 'Wood' },
  { branches: ['Yin', 'Wu', 'Xu'], element: 'Fire' },
  { branches: ['Si', 'You', 'Chou'], element: 'Metal' },
];

const matches = (a, b, [x, y]) => (a === x && b === y) || (a === y && b === x);

export function detectFlags(pillars) {
  const out = [];
  const present = allBranches(pillars);

  for (let i = 0; i < PILLAR_NAMES.length; i += 1) {
    for (let j = i + 1; j < PILLAR_NAMES.length; j += 1) {
      const a = pillars[PILLAR_NAMES[i]].branch;
      const b = pillars[PILLAR_NAMES[j]].branch;
      const tag = `${PILLAR_NAMES[i]}_${PILLAR_NAMES[j]}`;
      if (CLASH.some((pair) => matches(a, b, pair))) out.push(`clash:${tag}`);
      if (SIX_HARMONY.some((pair) => matches(a, b, pair))) out.push(`six_harmony:${tag}`);
      if (HARM.some((pair) => matches(a, b, pair))) out.push(`harm:${tag}`);
      if (a === b && SELF_PUNISH.includes(a)) out.push(`self_punishment:${tag}`);
    }
  }
  for (const trio of THREE_HARMONY) {
    if (trio.branches.every((branch) => present.includes(branch))) {
      out.push(`three_harmony:${trio.element}`);
    }
  }
  return out;
}

export function computeWeighting(pillars) {
  const dmElement = STEM_ELEMENT[pillars.day.stem];
  const weights = godWeights(pillars);
  const shares = familyShares(weights);
  const dm = dayMasterStrength(pillars, dmElement);
  return { weights, shares, dmElement, dm, flags: detectFlags(pillars) };
}
