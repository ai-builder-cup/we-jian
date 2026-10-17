// Four Pillars chart facts. Tables only: what the chart IS, never what it means.
// Ported from the audited UnlockMyBazi engine (index.html: SE, SP, HIDDEN_SI,
// getTenGodCode). The tables are COPIED, not re-derived — two sources of truth
// for hidden stems disagree only on edge dates, where nobody is looking.
//
// Interpretation (weights, Day Master strength) lives in weighting.js so it can
// be recalibrated without touching anything audited.

export const STEMS = ['Jia', 'Yi', 'Bing', 'Ding', 'Wu', 'Ji', 'Geng', 'Xin', 'Ren', 'Gui'];
export const BRANCHES = ['Zi', 'Chou', 'Yin', 'Mao', 'Chen', 'Si', 'Wu', 'Wei', 'Shen', 'You', 'Xu', 'Hai'];
export const ELEMENTS = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
export const TEN_GODS = [
  'ZhengCai', 'PianCai', 'ZhengGuan', 'QiSha', 'ShiShen',
  'ShangGuan', 'ZhengYin', 'PianYin', 'BiJian', 'JieCai',
];
export const GOD_FAMILIES = ['Wealth', 'Officer', 'Output', 'Resource', 'Peer'];

export const STEM_ELEMENT = {
  Jia: 'Wood', Yi: 'Wood', Bing: 'Fire', Ding: 'Fire', Wu: 'Earth',
  Ji: 'Earth', Geng: 'Metal', Xin: 'Metal', Ren: 'Water', Gui: 'Water',
};

export const STEM_POLARITY = {
  Jia: 'yang', Yi: 'yin', Bing: 'yang', Ding: 'yin', Wu: 'yang',
  Ji: 'yin', Geng: 'yang', Xin: 'yin', Ren: 'yang', Gui: 'yin',
};

// Hidden stems per branch. Array ORDER is the layer: primary, middle, residual.
// Pure branches (Zi, Mao, You) carry one stem only — that is correct, not a gap:
// a pure branch is the least ambiguous signal there is.
export const HIDDEN_STEMS = {
  Zi: ['Ren'],
  Chou: ['Ji', 'Gui', 'Xin'],
  Yin: ['Jia', 'Bing', 'Wu'],
  Mao: ['Yi'],
  Chen: ['Wu', 'Yi', 'Gui'],
  Si: ['Bing', 'Geng', 'Wu'],
  Wu: ['Ding', 'Ji'],
  Wei: ['Ji', 'Ding', 'Yi'],
  Shen: ['Geng', 'Ren', 'Wu'],
  You: ['Xin'],
  Xu: ['Wu', 'Xin', 'Ding'],
  Hai: ['Ren', 'Jia'],
};

export const LAYERS = ['primary', 'middle', 'residual'];

export const PRODUCES = { Wood: 'Fire', Fire: 'Earth', Earth: 'Metal', Metal: 'Water', Water: 'Wood' };
export const CONTROLS = { Wood: 'Earth', Fire: 'Metal', Earth: 'Water', Metal: 'Wood', Water: 'Fire' };
export const PRODUCED_BY = { Wood: 'Water', Fire: 'Wood', Earth: 'Fire', Metal: 'Earth', Water: 'Metal' };
export const CONTROLLED_BY = { Wood: 'Metal', Fire: 'Water', Earth: 'Wood', Metal: 'Fire', Water: 'Earth' };

// Branch main qi, derived from HIDDEN_STEMS rather than written out again, so a
// second table can never drift from the first.
export const BRANCH_MAIN_ELEMENT = Object.fromEntries(
  BRANCHES.map((branch) => [branch, STEM_ELEMENT[HIDDEN_STEMS[branch][0]]]),
);

// Same-polarity pairs produce the eccentric god, opposite polarity the orthodox one.
const GOD_BY_RELATION = {
  same: { same: 'BiJian', opposite: 'JieCai' },
  produces: { same: 'ShiShen', opposite: 'ShangGuan' },
  controls: { same: 'PianCai', opposite: 'ZhengCai' },
  producedBy: { same: 'PianYin', opposite: 'ZhengYin' },
  controlledBy: { same: 'QiSha', opposite: 'ZhengGuan' },
};

export function elementRelation(dm, other) {
  if (dm === other) return 'same';
  if (PRODUCES[dm] === other) return 'produces';
  if (CONTROLS[dm] === other) return 'controls';
  if (PRODUCES[other] === dm) return 'producedBy';
  if (CONTROLS[other] === dm) return 'controlledBy';
  // Five elements, five relations, both exhausted. Unreachable on valid input,
  // so it throws instead of quietly returning 'same' like the source engine did:
  // a silent fallback there would hide a broken element table.
  throw new Error(`elementRelation: ${dm} vs ${other} is undefined`);
}

// Which god `other` is, relative to the day stem.
export function tenGodOf(dayStem, other) {
  const relation = elementRelation(STEM_ELEMENT[dayStem], STEM_ELEMENT[other]);
  const samePolarity = STEM_POLARITY[dayStem] === STEM_POLARITY[other];
  return GOD_BY_RELATION[relation][samePolarity ? 'same' : 'opposite'];
}

export function hiddenStemsOf(branch) {
  return HIDDEN_STEMS[branch].map((stem, index) => ({
    stem,
    element: STEM_ELEMENT[stem],
    layer: LAYERS[index],
  }));
}

export const mainHiddenStem = (branch) => HIDDEN_STEMS[branch][0];

export const PILLAR_NAMES = ['year', 'month', 'day', 'hour'];

export const allBranches = (pillars) => PILLAR_NAMES.map((name) => pillars[name].branch);

export const isRooted = (element, branches) =>
  branches.some((branch) => hiddenStemsOf(branch).some((hidden) => hidden.element === element));

// Every element appears, including the ones at zero: a missing key reads as
// undefined downstream and turns into NaN without a word.
export function elementCounts(pillars) {
  const counts = Object.fromEntries(ELEMENTS.map((element) => [element, 0]));
  for (const name of PILLAR_NAMES) {
    counts[STEM_ELEMENT[pillars[name].stem]] += 1;
    for (const hidden of hiddenStemsOf(pillars[name].branch)) counts[hidden.element] += 1;
  }
  return counts;
}
