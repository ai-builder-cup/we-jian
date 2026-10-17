import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STEMS, BRANCHES, HIDDEN_STEMS, STEM_ELEMENT, BRANCH_MAIN_ELEMENT,
  elementCounts, hiddenStemsOf, mainHiddenStem, tenGodOf,
} from './chart.js';
import { computeWeighting, contributions, familyShares, seasonState } from './weighting.js';
import { coreDriver, favourableElements, fieldAffinity, workArchetype } from './reflection.js';
import { computeBaziReflection, narrationPayload, pillarsFromBirth, reflectionFromPillars } from './index.js';
import { composeReading } from './blueprint.js';

const pillars = (ys, yb, ms, mb, ds, db, hs, hb) => ({
  year: { stem: ys, branch: yb }, month: { stem: ms, branch: mb },
  day: { stem: ds, branch: db }, hour: { stem: hs, branch: hb },
});

// 戊辰 丙辰 甲午 辛未 — 1988-04-09 14:30. Labels below come from an INDEPENDENT
// BaZi engine, not from this code, so this is a genuine cross-check rather than
// this file agreeing with itself.
const REFERENCE = pillars('Wu', 'Chen', 'Bing', 'Chen', 'Jia', 'Wu', 'Xin', 'Wei');

// ─────────────────────────────────────────────────────────────── chart facts

// The original engine's own function, copied verbatim so the port can be
// compared against it. One mix-up between orthodox and eccentric gods inverts
// the meaning of every label downstream, and reading the table will not show it.
const SE = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const SP = ['Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin', 'Yang', 'Yin'];
function sourceTenGod(dmIndex, otherIndex) {
  const dm = SE[dmIndex];
  const other = SE[otherIndex];
  const same = SP[dmIndex] === SP[otherIndex];
  const order = ['Wood', 'Fire', 'Earth', 'Metal', 'Water'];
  const d = order.indexOf(dm);
  const o = order.indexOf(other);
  let relation = 'same';
  if (dm !== other) {
    if ((d + 1) % 5 === o) relation = 'gen';
    else if ((d + 2) % 5 === o) relation = 'ctrl';
    else if ((o + 1) % 5 === d) relation = 'genby';
    else if ((o + 2) % 5 === d) relation = 'ctrlby';
  }
  return {
    'same,true': 'BiJian', 'same,false': 'JieCai',
    'gen,true': 'ShiShen', 'gen,false': 'ShangGuan',
    'ctrl,true': 'PianCai', 'ctrl,false': 'ZhengCai',
    'genby,true': 'PianYin', 'genby,false': 'ZhengYin',
    'ctrlby,true': 'QiSha', 'ctrlby,false': 'ZhengGuan',
  }[`${relation},${same}`];
}

test('ten gods: all 100 stem pairs match the source engine', () => {
  let checked = 0;
  const differences = [];
  for (let d = 0; d < 10; d += 1) {
    for (let o = 0; o < 10; o += 1) {
      checked += 1;
      const expected = sourceTenGod(d, o);
      const actual = tenGodOf(STEMS[d], STEMS[o]);
      if (expected !== actual) differences.push(`${STEMS[d]}/${STEMS[o]}: ${expected} vs ${actual}`);
    }
  }
  // Without this the loop could silently never run and still report no differences.
  assert.equal(checked, 100);
  assert.deepEqual(differences, []);
});

test('a deliberately inverted mapping IS detected', () => {
  // Proves the comparison above can fail at all.
  let differences = 0;
  for (let d = 0; d < 10; d += 1) {
    for (let o = 0; o < 10; o += 1) {
      const flipped = { PianCai: 'ZhengCai', ZhengCai: 'PianCai' }[sourceTenGod(d, o)] ?? sourceTenGod(d, o);
      if (flipped !== tenGodOf(STEMS[d], STEMS[o])) differences += 1;
    }
  }
  assert.ok(differences > 0, 'flipping wealth gods should differ, but nothing was detected');
});

test('hidden stems: 12 branches, valid layers, main qi agrees both ways', () => {
  for (const branch of BRANCHES) {
    const hidden = hiddenStemsOf(branch);
    assert.ok(hidden.length >= 1 && hidden.length <= 3);
    assert.equal(hidden[0].layer, 'primary');
    assert.equal(STEM_ELEMENT[mainHiddenStem(branch)], BRANCH_MAIN_ELEMENT[branch]);
  }
  // Pure branches carry one stem; the rest carry more. Both halves matter: the
  // first alone would pass on an empty table.
  for (const branch of ['Zi', 'Mao', 'You']) assert.equal(hiddenStemsOf(branch).length, 1);
  for (const branch of ['Chou', 'Yin', 'Chen', 'Si', 'Wei', 'Shen', 'Xu']) {
    assert.ok(hiddenStemsOf(branch).length > 1);
  }
  assert.equal(BRANCHES.reduce((sum, b) => sum + HIDDEN_STEMS[b].length, 0), 28);
});

test('reference chart: ten gods match the independent engine', () => {
  const dm = REFERENCE.day.stem;
  assert.equal(tenGodOf(dm, REFERENCE.year.stem), 'PianCai');
  assert.equal(tenGodOf(dm, REFERENCE.month.stem), 'ShiShen');
  assert.equal(tenGodOf(dm, REFERENCE.hour.stem), 'ZhengGuan');
  assert.deepEqual(hiddenStemsOf('Chen').map((h) => tenGodOf(dm, h.stem)), ['PianCai', 'JieCai', 'ZhengYin']);
  assert.deepEqual(hiddenStemsOf('Wu').map((h) => tenGodOf(dm, h.stem)), ['ShangGuan', 'ZhengCai']);
  assert.deepEqual(hiddenStemsOf('Wei').map((h) => tenGodOf(dm, h.stem)), ['ZhengCai', 'ShangGuan', 'JieCai']);
  assert.deepEqual(elementCounts(REFERENCE), { Wood: 4, Fire: 3, Earth: 5, Metal: 1, Water: 2 });
});

// ─────────────────────────────────────────────────────────────── weighting

test('season states follow the classical rule, not a transcribed table', () => {
  // Spring is ruled by Wood: Fire is 相 (what Wood makes), Water is 休 (what made
  // Wood), Metal is 囚, Earth is 死. The spec table this came from had 相/休 and
  // 囚/死 swapped on every row.
  assert.equal(seasonState('Wood', 'Wood'), 'prime');
  assert.equal(seasonState('Fire', 'Wood'), 'supported');
  assert.equal(seasonState('Water', 'Wood'), 'resting');
  assert.equal(seasonState('Metal', 'Wood'), 'trapped');
  assert.equal(seasonState('Earth', 'Wood'), 'dead');
});

test('completeness: 120 day-stem × month-branch combinations, no gaps', () => {
  let checked = 0;
  for (const dayStem of STEMS) {
    for (const monthBranch of BRANCHES) {
      const result = computeWeighting(pillars('Jia', 'Zi', 'Bing', monthBranch, dayStem, 'Wu', 'Gui', 'You'));
      checked += 1;
      assert.ok(['strong', 'moderate', 'weak'].includes(result.dm.strength));
      assert.ok(Number.isFinite(result.dm.score));
      const total = Object.values(result.shares).reduce((a, b) => a + b, 0);
      assert.ok(Math.abs(total - 1) < 1e-9, `shares sum to ${total}`);
    }
  }
  assert.equal(checked, 120);
});

test('zero total weight fails loudly rather than reading as "no signal"', () => {
  assert.throws(() => familyShares({}), /zero/);
});

test('monotonicity: position and layer both rank correctly', () => {
  // Compared per CONTRIBUTION, not per aggregated god: an aggregate can hide a
  // rise when the same god also arrives from somewhere else. Month branch is
  // held fixed throughout so the season cannot confound the comparison.
  let stemsChecked = 0;
  for (const stem of STEMS) {
    if (stem === 'Jia') continue; // the day stem contributes no god
    const parts = contributions(pillars(stem, 'Zi', stem, 'Yin', 'Jia', 'Wu', 'Gui', 'You'));
    const year = parts.find((p) => p.position === 'yearStem');
    const month = parts.find((p) => p.position === 'monthStem');
    assert.ok(year && month, `${stem}: stem contributions missing`);
    assert.ok(month.weight > year.weight, `${stem}: month stem ${month.weight} <= year stem ${year.weight}`);
    stemsChecked += 1;
  }
  assert.equal(stemsChecked, 9);

  // Within one branch, deeper layers must never outrank shallower ones.
  let layerPairs = 0;
  for (const branch of BRANCHES) {
    const parts = contributions(pillars('Gui', branch, 'Gui', 'Yin', 'Jia', 'Wu', 'Gui', 'You'))
      .filter((p) => p.position === 'yearBranch');
    for (let i = 1; i < parts.length; i += 1) {
      assert.ok(parts[i - 1].weight >= parts[i].weight,
        `${branch}: ${parts[i - 1].layer} ranks below ${parts[i].layer}`);
      layerPairs += 1;
    }
  }
  assert.ok(layerPairs >= 12, `only ${layerPairs} layer pairs compared`);
});

test('determinism: identical input gives byte-identical output 50 times', () => {
  const once = JSON.stringify(computeWeighting(REFERENCE));
  for (let i = 0; i < 50; i += 1) {
    assert.equal(JSON.stringify(computeWeighting(REFERENCE)), once, `drifted on run ${i}`);
  }
});

// ─────────────────────────────────────────────────────────────── reflection

test('財多身弱 inverts the driver, and only for wealth gods with a weak Day Master', () => {
  const inverted = coreDriver({ ZhengCai: 8, PianCai: 5 }, 'weak');
  assert.equal(inverted.primary, 'Stability under load');
  assert.equal(inverted.expression, 'load-sensitive');
  // Weak Day Master WITHOUT dominant wealth must not invert.
  assert.notEqual(coreDriver({ ZhengYin: 8, ZhengCai: 2 }, 'weak').primary, 'Stability under load');
});

test('archetype comes from the month branch, so changing it changes the archetype', () => {
  const a = workArchetype(pillars('Jia', 'Zi', 'Bing', 'Yin', 'Geng', 'Wu', 'Gui', 'You'));
  const b = workArchetype(pillars('Jia', 'Zi', 'Bing', 'Hai', 'Geng', 'Wu', 'Gui', 'You'));
  assert.notDeepEqual(a, b);
});

test('a Peer-family month returns null instead of a generated guess', () => {
  assert.equal(workArchetype(pillars('Jia', 'Zi', 'Bing', 'Yin', 'Jia', 'Wu', 'Gui', 'You')), null);
  // Control: a non-Peer day stem on the same month DOES produce one.
  assert.ok(workArchetype(pillars('Jia', 'Zi', 'Bing', 'Yin', 'Geng', 'Wu', 'Gui', 'You')));
});

test('favourable elements are never empty, and sectors stay within the cap', () => {
  for (const strength of ['strong', 'moderate', 'weak']) {
    for (const element of ['Wood', 'Fire', 'Earth', 'Metal', 'Water']) {
      const favourable = favourableElements(element, strength);
      assert.ok(favourable.length >= 1);
      const sectors = fieldAffinity(favourable);
      assert.ok(sectors.length > 0 && sectors.length <= 12);
      assert.equal(new Set(sectors).size, sectors.length, 'duplicate sectors returned');
    }
  }
});

test('different elements give different sector lists', () => {
  const lists = ['Wood', 'Fire', 'Earth', 'Metal', 'Water']
    .map((element) => JSON.stringify(fieldAffinity([element])));
  assert.equal(new Set(lists).size, 5);
});

// ─────────────────────────────────────────────────────────────── pillars + API

test('1988-04-09 14:30 gives 戊辰 丙辰 甲午 辛未', () => {
  assert.deepEqual(pillarsFromBirth({ date: '1988-04-09', time: '14:30' }), REFERENCE);
});

test('solar terms decide the month pillar, not the calendar month', () => {
  // If both halves of February returned the same month pillar, the engine would
  // be using the calendar rather than 節氣, and every month-based reading would
  // be wrong.
  const early = pillarsFromBirth({ date: '1990-02-01', time: '12:00' });
  const late = pillarsFromBirth({ date: '1990-02-20', time: '12:00' });
  assert.notEqual(early.month.branch, late.month.branch);
});

test('the hour pillar moves with the hour, the day pillar does not', () => {
  const morning = pillarsFromBirth({ date: '1988-04-09', time: '06:00' });
  const afternoon = pillarsFromBirth({ date: '1988-04-09', time: '14:30' });
  assert.deepEqual(morning.day, afternoon.day);
  assert.notDeepEqual(morning.hour, afternoon.hour);
});

test('invalid birth details fail loudly instead of defaulting', () => {
  assert.throws(() => pillarsFromBirth({ date: '09-04-1988', time: '14:30' }), /YYYY-MM-DD/);
  assert.throws(() => pillarsFromBirth({ date: '1988-04-09', time: '2.30pm' }), /YYYY-MM-DD/);
  assert.throws(() => pillarsFromBirth({ date: '1988-13-09', time: '14:30' }), /valid range/);
});

test('the reflection is complete, and provisional parts say so', () => {
  const reflection = computeBaziReflection({ date: '1988-04-09', time: '14:30' });
  assert.equal(reflection.driver.status, 'validated');
  assert.equal(reflection.valueCreation.status, 'validated');
  for (const key of ['pressure', 'collaboration', 'pace']) {
    assert.equal(reflection[key].status, 'provisional', `${key} must be marked provisional`);
  }
  assert.ok(reflection.sectors.length > 0);
  assert.ok(['strong', 'moderate'].includes(reflection.confidence));
});

test('the narration payload carries no chart data and no birth date', () => {
  // Four Pillars can be reversed into a birth date, so none of it may travel.
  const payload = narrationPayload(computeBaziReflection({ date: '1988-04-09', time: '14:30' }));
  const serialised = JSON.stringify(payload);
  for (const leak of ['pillars', 'stem', 'branch', 'weights', 'Jia', 'Chen', '1988', 'dmStrength']) {
    assert.ok(!serialised.includes(leak), `narration payload leaks ${leak}`);
  }
  assert.ok(payload.driver && payload.confidence);
});

test('the archetype is modulated by Day Master strength, not stated flat', () => {
  // 偏财格 with a strong vs a weak Day Master describes OPPOSITE situations:
  // one draws opportunity and holds it, the other watches it pass through.
  // Printing the structure without the strength gives everyone the strong
  // reading, which is how this shipped wrong the first time.
  const chart = pillars('Jia', 'Zi', 'Bing', 'Chen', 'Jia', 'Wu', 'Gui', 'You');
  const notes = ['strong', 'moderate', 'weak'].map((s) => workArchetype(chart, s).note);
  assert.equal(new Set(notes).size, 3, 'all three Day Master strengths must read differently');
  for (const note of notes) assert.ok(note && note.length > 20);

  // The name itself comes from the month branch, so it must NOT move with strength.
  const names = ['strong', 'moderate', 'weak'].map((s) => workArchetype(chart, s).name);
  assert.equal(new Set(names).size, 1, 'the archetype name must come from the month branch alone');
});

test('every archetype carries a note for all three Day Master strengths', () => {
  // A missing entry would render as undefined and silently drop the qualifier.
  const months = ['Chen', 'Yin', 'Si', 'Wu', 'Shen', 'You', 'Hai', 'Zi', 'Chou', 'Mao', 'Wei', 'Xu'];
  let checked = 0;
  for (const dayStem of STEMS) {
    for (const month of months) {
      for (const strength of ['strong', 'moderate', 'weak']) {
        const result = workArchetype(pillars('Jia', 'Zi', 'Bing', month, dayStem, 'Wu', 'Gui', 'You'), strength);
        if (result === null) continue; // Peer-family months, reported honestly
        assert.ok(typeof result.note === 'string' && result.note.length > 0,
          `${dayStem}/${month}/${strength}: missing note`);
        checked += 1;
      }
    }
  }
  assert.ok(checked > 200, `only ${checked} archetype readings checked`);
});

test('the written reading lands between 250 and 300 words, for every archetype', () => {
  // Length is a requirement, not an aspiration. Template assembly drifts as soon
  // as any sentence is edited, so it is measured rather than assumed — and
  // measured across every structure, not just one convenient chart.
  const months = ['Chen', 'Yin', 'Si', 'Wu', 'Shen', 'You', 'Hai', 'Zi', 'Chou', 'Mao', 'Wei', 'Xu'];
  const seen = new Set();
  let checked = 0;
  let shortest = Infinity;
  let longest = 0;

  for (const dayStem of STEMS) {
    for (const month of months) {
      const chart = pillars('Wu', 'Chen', 'Bing', month, dayStem, 'Wu', 'Jia', 'Xu');
      const reading = composeReading(reflectionFromPillars(chart));
      shortest = Math.min(shortest, reading.words);
      longest = Math.max(longest, reading.words);
      assert.ok(reading.words >= 250 && reading.words <= 300,
        `${dayStem}/${month}: ${reading.words} words, outside 250-300`);
      assert.ok(reading.conclusion.length > 50, `${dayStem}/${month}: no conclusion`);
      seen.add(reading.text);
      checked += 1;
    }
  }
  assert.equal(checked, 120);
  // Readings must actually differ. One template filled identically every time
  // would pass every length check above and still be worthless.
  assert.ok(seen.size > 40, `only ${seen.size} distinct readings from ${checked} charts`);
  console.log(`      reading length across ${checked} charts: ${shortest}-${longest} words, ${seen.size} distinct`);
});
