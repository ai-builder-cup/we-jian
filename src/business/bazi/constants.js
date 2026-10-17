// Every calibration number for the BaZi reflection, in one file.
//
// STATUS: inherited from the UnlockMyBazi engine and from classical hierarchy.
// Internally coherent, and that is all. None of it is validated against real
// people yet, so nothing here may be presented as a finding about someone.
//
// Changing any number here changes every reflection the app has ever produced.
// Do it only with calibration records behind it.

// Position weight. The month branch carries the most: it is the firmest upstream
// rule in the whole theory.
export const POSITION_WEIGHT = {
  monthBranch: 3.0,
  monthStem: 2.0,
  dayBranch: 1.8,
  hourStem: 1.2,
  hourBranch: 1.2,
  yearStem: 1.0,
  yearBranch: 1.0,
};

// Hidden stem layers. Always below 1.0 — that is what keeps visible stems ranked
// above branch contents.
export const HIDDEN_LAYER = { primary: 1.0, middle: 0.5, residual: 0.3 };

// A stem with no root is a claim with no support. One bonus per stem; rooting in
// several branches does not stack, because what is measured is rooted or not.
export const ROOTING_BONUS = 1.3;

// Seasonal strength.
//
// CORRECTION WORTH KNOWING: the spec table this came from had 相 swapped with 休
// and 囚 with 死 on every row, contradicting its own prose and the classical rule
// (當令者旺，我生者相，生我者休，剋我者囚，我剋者死). The skew was uniform, so it
// would never have looked odd on any single chart. season state is DERIVED from
// element relations in weighting.js rather than transcribed, so it cannot recur.
export const SEASON_FACTOR = {
  prime: 1.3,      // 旺 the season's own element
  supported: 1.15, // 相 what the season generates
  resting: 1.0,    // 休 what generates the season
  trapped: 0.85,   // 囚 what controls the season
  dead: 0.7,       // 死 what the season controls
};

export const DM_COMPONENT_WEIGHT = { rooting: 0.35, monthOrder: 0.4, supportDrain: 0.25 };

export const MONTH_ORDER_SCORE = {
  sameElement: 1.0,
  generatesDm: 0.85,
  generatedByDm: 0.4,
  controlledByDm: 0.3,
  controlsDm: 0.1,
};

export const DM_THRESHOLD = { strong: 0.55, moderate: 0.4 };

// Cluster thresholds, from the 8 archetype charts the original spec validated on.
export const CAL = {
  WEALTH_NEGLIGIBLE: 0.15,
  WEALTH_SALIENT: 0.3,
  OUTPUT_TO_PRODUCER: 0.2,
  PEER_CONNECTOR: 0.15,
};

// Thresholds for the reflections that have NO validated table behind them.
// Kept separate from CAL on purpose: CAL has 8 archetype charts of history,
// these have none. The two sets must never be treated as equally trustworthy.
export const CAL_PROVISIONAL = {
  OFFICER_HEAVY: 0.3,
  OFFICER_PRESENT: 0.2,
  OFFICER_MINIMAL: 0.1,
  BUFFER_PRESENT: 0.15,
  RESOURCE_LED: 0.3,
  OUTPUT_LED: 0.3,
  OUTPUT_EXPRESSIVE: 0.25,
  PEER_COLLEGIAL: 0.25,
  PEER_MINIMAL: 0.1,
  SUPPORT_RATIO_RESILIENT: 0.55,
  SUPPORT_RATIO_DEPLETED: 0.3,
};

// Element points for the favourable-element engine (Cantian scheme):
// stem 2, branch main qi 2, hidden stem 1.
export const ELEMENT_POINTS = { stem: 2, branchPrimary: 2, branchHidden: 1 };
export const EXCESS_POINTS = 6;

// How many sectors the field-affinity list returns, split across favourable elements.
export const FIELD_TARGET_TOTAL = 12;

export const BAZI_ENGINE_VERSION = 'wejian-bazi@1.0.0';
