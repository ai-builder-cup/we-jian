// The reflection itself: structured work-domain values derived from the chart.
//
// ─────────────────────────────────────────────────────────────────────────────
// NONE OF THIS MAY EVER REACH A SCORE, A RANKING, OR A RECOMMENDATION.
// ─────────────────────────────────────────────────────────────────────────────
// It is derived from a birth date, and a birth date is an age. The moment any
// of it touches job matching, career directions, or the skill-gap plan, age has
// entered a hiring-adjacent decision. The app's agent guardrails say the same
// thing in different words; this module is the other half of that promise.
//
// Two tiers of trust live here, and they are labelled, not blended:
//   status 'validated'   — ported from tables that passed 8-of-8 discriminant
//                          testing in the source spec.
//   status 'provisional' — mapped from classical structure but NEVER validated
//                          against real people. Shown as questions to check
//                          about yourself, never as findings.

import { CONTROLLED_BY, CONTROLS, PRODUCED_BY, PRODUCES, mainHiddenStem, tenGodOf } from './chart.js';
import { CAL, CAL_PROVISIONAL, FIELD_TARGET_TOTAL } from './constants.js';
import { dominantFamily, rankGods, weightOf } from './weighting.js';

const WEALTH_GODS = ['ZhengCai', 'PianCai'];

const DRIVER_OF = {
  ZhengCai: 'Stability', PianCai: 'Autonomy and results',
  ZhengGuan: 'Responsibility', QiSha: 'Challenge',
  ShiShen: 'Craft', ShangGuan: 'Originality',
  ZhengYin: 'Depth', PianYin: 'Insight',
  BiJian: 'Independence', JieCai: 'Competition',
};

// W3 · what moves this person at work.
export function coreDriver(weights, dmStrength) {
  const ranked = rankGods(weights);
  const top = ranked[0];
  if (!top) throw new Error('coreDriver: no weighted gods, input is invalid');
  const second = ranked[1] ?? null;

  let primary = DRIVER_OF[top];
  let expression = dmStrength === 'strong' ? 'outward' : 'measured';

  // 財多身弱: pursuing results while the load of results outruns recovery.
  // The single most sensitive reading in the whole mapping. It is a signal about
  // workload design, and must never be read as "this person is fragile".
  if (dmStrength === 'weak' && WEALTH_GODS.includes(top)) {
    primary = 'Stability under load';
    expression = 'load-sensitive';
  }

  return {
    status: 'validated',
    primary,
    secondary: second ? DRIVER_OF[second] : null,
    expression,
  };
}

// W7 · how this person turns effort into outcomes. Check order is load-bearing:
// in the source spec this exact sequence is what fixed three earlier bugs.
export function valueCreation(weights, shares, dmStrength) {
  if (shares.Wealth < CAL.WEALTH_NEGLIGIBLE) {
    const dominant = dominantFamily(shares);
    const style = { Officer: 'Steward', Output: 'Maker', Resource: 'Scholar', Peer: 'Solo operator' }[dominant];
    return { status: 'validated', style: style ?? 'Compounder' };
  }
  if (dmStrength === 'weak' && shares.Wealth >= CAL.WEALTH_SALIENT) {
    // Produces plenty, retains little. NOT a signal of low ability.
    return { status: 'validated', style: 'Over-extended' };
  }
  if (shares.Output >= CAL.OUTPUT_TO_PRODUCER) return { status: 'validated', style: 'Producer' };
  if (weightOf(weights, 'ZhengGuan') > 0 && dmStrength !== 'weak') {
    return { status: 'validated', style: 'Systems operator' };
  }
  if (weightOf(weights, 'PianCai') >= weightOf(weights, 'ZhengCai')) {
    return {
      status: 'validated',
      style: shares.Peer >= CAL.PEER_CONNECTOR ? 'Connector' : 'Opportunity scout',
    };
  }
  return { status: 'validated', style: 'Compounder' };
}

// W5 · how pressure lands. Officer is the pressure axis, Resource the buffer,
// Output the release valve, Day Master strength decides whether pressure gets
// used or simply accumulates.
export function pressureResponse(weights, shares, dmStrength) {
  const hasResource = shares.Resource >= CAL_PROVISIONAL.BUFFER_PRESENT;
  const hasOutput = shares.Output >= CAL_PROVISIONAL.BUFFER_PRESENT;
  const buffer = hasResource && hasOutput ? 'both' : hasResource ? 'resource' : hasOutput ? 'output' : 'none';
  const officerHeavy = shares.Officer >= CAL_PROVISIONAL.OFFICER_HEAVY;
  const base = { status: 'provisional', buffer };

  if (dmStrength === 'weak' && officerHeavy && buffer === 'none') {
    return { ...base, response: 'Pressure accumulates without a release' };
  }
  if (dmStrength === 'weak' && officerHeavy) return { ...base, response: 'Carries load when support exists' };
  if (dmStrength === 'strong' && weightOf(weights, 'QiSha') > 0
    && shares.Officer >= CAL_PROVISIONAL.OFFICER_PRESENT) {
    return { ...base, response: 'Works best with real stakes' };
  }
  if (shares.Resource >= CAL_PROVISIONAL.RESOURCE_LED) return { ...base, response: 'Prepares before acting' };
  if (shares.Output >= CAL_PROVISIONAL.OUTPUT_LED) return { ...base, response: 'Releases pressure by making things' };
  if (shares.Officer < CAL_PROVISIONAL.OFFICER_MINIMAL) return { ...base, response: 'Sets own standards' };
  return { ...base, response: 'Even response to load' };
}

// W6 · communicating and socialising at work. TWO INDEPENDENT AXES, reported
// separately on purpose. Expressive does not imply collegial, and collapsing
// both into one "good with people" scale is exactly what makes relationship
// constructs fail calibration.
export function collaborationStyle(shares) {
  const level = (share, high) => (share >= high ? 'high' : share < CAL_PROVISIONAL.PEER_MINIMAL ? 'low' : 'moderate');
  const expression = level(shares.Output, CAL_PROVISIONAL.OUTPUT_EXPRESSIVE);
  const collegiality = level(shares.Peer, CAL_PROVISIONAL.PEER_COLLEGIAL);
  const base = { status: 'provisional', expression, collegiality };

  if (expression === 'high' && collegiality === 'high') return { ...base, style: 'Expressive collaborator' };
  if (expression === 'high') return { ...base, style: 'Front-facing, works independently' };
  if (collegiality === 'high') return { ...base, style: 'Peer-oriented, speaks sparingly' };
  if (shares.Officer >= CAL_PROVISIONAL.OFFICER_HEAVY) return { ...base, style: 'Works through proper channels' };
  if (shares.Resource >= CAL_PROVISIONAL.RESOURCE_LED) return { ...base, style: 'Processes first, speaks after' };
  if (expression === 'low' && collegiality === 'low') return { ...base, style: 'Low-broadcast specialist' };
  return { ...base, style: 'Situational' };
}

// W4 · pace and recovery. Deliberately NOT called "resilience": resilience as a
// label claims a moral trait, and a moral trait derived from a birth date cannot
// be defended. What the structure actually shows is the ratio of support to
// drain, which is a statement about load patterns and can be argued with.
export function paceAndLoad(shares, dmStrength) {
  const ratio = shares.Resource + shares.Peer;
  const base = { status: 'provisional', supportRatio: Math.round(ratio * 100) / 100 };

  if (dmStrength === 'weak' && ratio <= CAL_PROVISIONAL.SUPPORT_RATIO_DEPLETED) {
    return { ...base, pattern: 'Recovery depends on conditions' };
  }
  if (ratio <= CAL_PROVISIONAL.SUPPORT_RATIO_DEPLETED) return { ...base, pattern: 'Sprints, then recovers' };
  if (ratio >= CAL_PROVISIONAL.SUPPORT_RATIO_RESILIENT && dmStrength !== 'weak') {
    return { ...base, pattern: 'Sustains load' };
  }
  return { ...base, pattern: 'Steady, with real recovery needs' };
}

// 格局, read from the month branch's main qi. This is a DIFFERENT question from
// coreDriver — that one asks what moves you, this one asks what structure you
// occupy — so the two can disagree, and are reported separately rather than
// reconciled by picking one.
const ARCHETYPE_OF = {
  ZhengGuan: {
    name: 'Institutional operator',
    environment: 'Clear reporting lines, visible accountability, advancement by rank.',
    dm: {
      strong: 'Enough standing to lead the structure, not only to serve inside it.',
      moderate: 'Authority and adaptability in balance: able to lead or collaborate equally well.',
      weak: 'The mandate feels heavy without mentorship or backing. Support structures come first.',
    },
  },
  QiSha: {
    name: 'Pressure converter',
    environment: 'Real stakes and real deadlines, where consequences are immediate.',
    dm: {
      strong: 'Able to absorb pressure and to apply it.',
      moderate: 'Pressure stays manageable: carried without breaking, and without dominating.',
      weak: 'Pressure currently outruns recovery. Buffers matter more than bigger targets.',
    },
  },
  ShiShen: {
    name: 'Creative producer',
    environment: 'Work whose output is something you made yourself.',
    dm: {
      strong: 'Output with stamina behind it: volume and quality together.',
      moderate: 'Making and sustaining in balance; steady production without running dry.',
      weak: 'The urge to make outruns the capacity to sustain it. Focus beats expansion.',
    },
  },
  ShangGuan: {
    name: 'Reformer',
    environment: 'Places that reward questions and tolerate changing how things are done.',
    dm: {
      strong: 'Able to challenge a system from a position of strength.',
      moderate: 'Calibrated: enough footing to question convention without burning position.',
      weak: 'Ideas outrun the base to execute them. Backing first, confrontation after.',
    },
  },
  ZhengCai: {
    name: 'Steady builder',
    environment: 'Predictable outcomes and measurable process.',
    dm: {
      strong: 'Consistent accumulation, with the capacity to hold what is earned.',
      moderate: 'Solid footing: earning and keeping in roughly equal measure.',
      weak: 'Results arrive but are hard to hold. Stability of load before growth.',
    },
  },
  PianCai: {
    name: 'Deal maker',
    environment: 'Roles whose value comes from moving value between parties.',
    dm: {
      strong: 'Draws opportunities AND has the base to hold them.',
      moderate: 'Deal-making with discipline: strong enough for most of it, so selectivity is the skill.',
      weak: 'Opportunities arrive and pass straight through. What is missing is filters and footing, not more opportunities.',
    },
  },
  ZhengYin: {
    name: 'Knowledge authority',
    environment: 'Expertise applied for other people: teaching, advising, curating standards.',
    dm: {
      strong: 'Risk of over-resourcing: knowing a great deal, acting on it late.',
      moderate: 'Absorbs and applies in the right measure; mentor and practitioner at once.',
      weak: 'Grows slowly, then overtakes peers through accumulated understanding. Time, not pressure.',
    },
  },
  PianYin: {
    name: 'Specialist',
    environment: 'Niche expertise with room to work independently.',
    dm: {
      strong: 'Capacity for unusual depth.',
      moderate: 'A specialist who can execute: deep enough to go far without drowning.',
      weak: 'Gathering knowledge outpaces finishing. Completion matters more than more input.',
    },
  },
};

// 格局 answers a DIFFERENT question from coreDriver, and the two often disagree.
// coreDriver reads the heaviest god across the whole chart: what moves someone.
// 格局 reads the month branch alone: what structure they occupy. Reconciling them
// by picking one throws away a real signal, so both are reported.
//
// Day Master strength is NOT optional here. The same structure with a strong and
// a weak Day Master describes opposite situations: 偏财格 strong draws and holds
// opportunity, 偏财格 weak watches it pass through. Stating the structure without
// the strength prints the strong reading for everyone.
export function workArchetype(pillars, dmStrength) {
  const god = tenGodOf(pillars.day.stem, mainHiddenStem(pillars.month.branch));
  const spec = ARCHETYPE_OF[god];
  // Peer-family months have no validated archetype in the source, which filled
  // the gap with a generated sentence. A generated sentence is a guess, so the
  // gap is carried honestly instead.
  if (!spec) return null;
  return {
    status: 'validated',
    name: spec.name,
    environment: spec.environment,
    note: spec.dm[dmStrength],
  };
}

const RELATION_FN = {
  same: (element) => element,
  produces: (element) => PRODUCES[element],
  controls: (element) => CONTROLS[element],
  producedBy: (element) => PRODUCED_BY[element],
  controlledBy: (element) => CONTROLLED_BY[element],
};

// 用神 by Day Master strength: strong is drained and directed, weak is fed and
// supported, balanced is channelled outward.
const YONG_SHEN = {
  strong: ['controlledBy', 'produces'],
  moderate: ['produces', 'controls'],
  weak: ['producedBy', 'same'],
};

export function favourableElements(dmElement, dmStrength) {
  const out = [];
  for (const relation of YONG_SHEN[dmStrength]) {
    const element = RELATION_FN[relation](dmElement);
    if (!out.includes(element)) out.push(element);
  }
  return out;
}

// Sector families per element. A REFLECTION LIST, never an input to job matching:
// the app's ranked directions come from the questionnaire, the simulation, the CV
// and the sourced job bank, and nothing here may touch them.
const SECTORS = {
  Wood: ['Education', 'Publishing and media', 'Training and coaching', 'Research and academia',
    'Health and wellness', 'Environment and sustainability', 'Fashion and textiles', 'Agriculture',
    'Non-profit and foundations', 'Writing and content', 'Translation', 'Interior and furniture'],
  Fire: ['Marketing and branding', 'Advertising', 'Sales and business development', 'Media and entertainment',
    'Film and video', 'Music and performing arts', 'Gaming and esports', 'Sport', 'Digital content',
    'Public speaking', 'Energy and electricity', 'Food and beverage'],
  Earth: ['Property and real estate', 'Construction', 'Architecture', 'Land development',
    'Warehousing and storage', 'Building materials', 'Insurance', 'Wealth management',
    'Museums and heritage', 'Notary and mediation', 'Ceramics', 'Agriculture at scale'],
  Metal: ['Finance', 'Banking', 'Accounting and audit', 'Law', 'Consulting', 'Technology',
    'AI and software', 'Data and analytics', 'Cybersecurity', 'Engineering', 'Manufacturing',
    'Government and public service'],
  Water: ['Logistics', 'Shipping and maritime', 'Aviation', 'Tourism and hospitality',
    'Communication and telecom', 'Public relations', 'Broadcasting', 'Trade and commerce',
    'Import and export', 'E-commerce', 'Strategic consulting', 'Fisheries'],
};

export function fieldAffinity(favourable) {
  if (favourable.length === 0) return [];
  const perElement = Math.ceil(FIELD_TARGET_TOTAL / favourable.length);
  const out = [];
  for (const element of favourable) {
    for (const sector of SECTORS[element].slice(0, perElement)) {
      if (!out.includes(sector)) out.push(sector);
    }
  }
  return out.slice(0, FIELD_TARGET_TOTAL);
}
