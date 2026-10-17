import assert from 'node:assert/strict';
import test from 'node:test';
import { OCCUPATIONS, OCCUPATION_BANK_VERSION } from './occupationBank.js';
import { findOccupation, matchOccupations, matchOccupationsByCollar } from './occupationMatching.js';


const TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
// A student whose interests are clearly hands-on, and one who is clearly people-facing.
const HANDS_ON = { R: 20, I: 6, A: 3, S: 8, E: 5, C: 12 };
const PEOPLE_FACING = { R: 5, I: 10, A: 8, S: 19, E: 14, C: 7 };

test('the bank holds every ISCO-08 unit group exactly once', () => {
  assert.equal(OCCUPATIONS.length, 436, 'ISCO-08 defines 436 unit groups');
  assert.equal(new Set(OCCUPATIONS.map((occupation) => occupation.isco)).size, 436);
  for (const occupation of OCCUPATIONS) {
    assert.match(occupation.isco, /^\d{4}$/, `${occupation.title} needs a 4-digit ISCO code`);
    assert.ok(occupation.title.trim(), `${occupation.isco} needs a title`);
  }
});

test('all ten ISCO major groups are represented, managers through elementary occupations', () => {
  const majors = new Set(OCCUPATIONS.map((occupation) => occupation.major));
  assert.deepEqual([...majors].sort(), ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
});

test('every occupation has a usable interest code and a graded confidence', () => {
  for (const occupation of OCCUPATIONS) {
    // A null code would make the occupation invisible to matching without any error.
    assert.match(occupation.riasec, /^[RIASEC]-[RIASEC]$/, `${occupation.title} has code ${occupation.riasec}`);
    assert.notEqual(occupation.riasec[0], occupation.riasec[2], `${occupation.title} repeats a type`);
    assert.ok(['high', 'medium', 'low'].includes(occupation.confidence), occupation.title);
    assert.ok(occupation.evidence.length > 0, `${occupation.title} must record where its code came from`);
  }
});

test('the bank spans white collar to blue collar', () => {
  const counts = OCCUPATIONS.reduce((totals, occupation) =>
    ({ ...totals, [occupation.collar]: (totals[occupation.collar] || 0) + 1 }), {});
  assert.deepEqual(Object.keys(counts).sort(), ['blue', 'service', 'uniformed', 'white']);
  // The point of this bank: manual and service work must be more than a token presence.
  assert.ok(counts.blue > 100, `expected substantial blue-collar coverage, got ${counts.blue}`);
  assert.ok(counts.service > 20, `expected service-work coverage, got ${counts.service}`);
});

test('ranking separates occupations that share an interest code', () => {
  // The reason this bank ranks on the whole profile: ~100 occupations are coded "R-C", and the
  // two-letter formula scores every one of them identically, so the list came back alphabetical.
  const { top } = matchOccupations(HANDS_ON, { limit: 30 });
  const sameCode = top.filter((occupation) => occupation.riasec === 'R-C');
  assert.ok(sameCode.length > 3, 'this profile should surface several R-C occupations');
  assert.ok(new Set(sameCode.map((occupation) => occupation.fit)).size > 1,
    'occupations sharing a code must not all score the same');
});

test('fit measures profile shape, not how generously the student answered', () => {
  // Doubling every answer changes elevation but not shape, so the ranking must not move.
  const doubled = Object.fromEntries(Object.entries(HANDS_ON).map(([type, value]) => [type, value * 2]));
  assert.deepEqual(
    matchOccupations(doubled, { limit: 10 }).top.map((occupation) => occupation.isco),
    matchOccupations(HANDS_ON, { limit: 10 }).top.map((occupation) => occupation.isco));
});

test('a flat answer sheet produces no confident ranking', () => {
  const flat = Object.fromEntries(TYPES.map((type) => [type, 10]));
  const { top } = matchOccupations(flat, { limit: 5 });
  assert.ok(top.every((occupation) => occupation.fit === 0.5), 'no shape means no preference');
});

test('a hands-on student is shown hands-on work, not only office jobs', () => {
  const { top } = matchOccupations(HANDS_ON, { limit: 10 });
  // The regression this guards: grounding on the 46-job curated bank alone, which is almost
  // entirely professional and technical, told every Realistic student to go and sit at a desk.
  const manual = top.filter((occupation) => occupation.collar === 'blue');
  assert.ok(manual.length >= 3, `expected skilled trades in the top 10, got ${manual.map((o) => o.title)}`);
  assert.equal(top[0].riasec[0], 'R', 'the closest match should lead with the student\'s strongest interest');
});

test('a people-facing student is not pushed towards manual work', () => {
  const { top } = matchOccupations(PEOPLE_FACING, { limit: 10 });
  assert.equal(top[0].riasec[0], 'S');
  assert.ok(top.every((occupation) => occupation.fit <= 1 && occupation.fit >= 0));
});

test('every kind of work is offered, so no student sees a single-track list', () => {
  const byCollar = matchOccupationsByCollar(HANDS_ON, { perCollar: 3 });
  assert.deepEqual(Object.keys(byCollar).sort(), ['blue', 'service', 'white']);
  for (const [collar, list] of Object.entries(byCollar)) {
    assert.ok(list.length > 0 && list.length <= 3, collar);
    assert.ok(list.every((occupation) => occupation.collar === collar));
  }
  // Armed forces are deliberately excluded: nobody should be nudged to enlist by a score.
  assert.ok(!('uniformed' in byCollar));
});

test('a kind of work that does not suit the student is left out, not padded', () => {
  for (const scores of [HANDS_ON, PEOPLE_FACING]) {
    for (const list of Object.values(matchOccupationsByCollar(scores, { perCollar: 4 }))) {
      // Every suggestion shown under a heading must be a real fit, not the least-bad option.
      assert.ok(list.every((occupation) => occupation.fit >= 0.6),
        `weak match offered: ${list.filter((o) => o.fit < 0.6).map((o) => `${o.title} ${o.fit}`)}`);
    }
  }
});

test('equal-fit matches span different occupation groups instead of listing near-duplicates', () => {
  const { top } = matchOccupations(HANDS_ON, { limit: 6 });
  const tied = top.filter((occupation) => occupation.fit === top[0].fit);
  assert.ok(tied.length > 1, 'this profile should produce ties for the test to be meaningful');
  assert.equal(new Set(tied.map((occupation) => occupation.group)).size, tied.length,
    `tied matches repeat an occupation group: ${tied.map((o) => o.group)}`);
});

test('results are deterministic: the same scores always give the same list', () => {
  const once = matchOccupations(HANDS_ON, { limit: 12 });
  const twice = matchOccupations(HANDS_ON, { limit: 12 });
  assert.deepEqual(once, twice);
  assert.equal(once.of, 436);
  assert.equal(once.bank, OCCUPATION_BANK_VERSION);
});

test('fit never leaves the 0 to 1 range, whatever the answer sheet looks like', () => {
  for (const scores of [
    Object.fromEntries(TYPES.map((type) => [type, 0])),          // nothing appealed
    Object.fromEntries(TYPES.map((type) => [type, 20])),         // everything appealed
    { R: 20, I: 0, A: 0, S: 0, E: 0, C: 0 },                     // one interest only
    { R: 0, I: 0, A: 0, S: 0, E: 0, C: 20 },
    HANDS_ON,
    PEOPLE_FACING,
  ]) {
    for (const occupation of matchOccupations(scores, { limit: 436 }).top) {
      assert.ok(occupation.fit >= 0 && occupation.fit <= 1, `${occupation.title}: ${occupation.fit}`);
    }
  }
});

test('an occupation can be looked up by ISCO code or exact title', () => {
  assert.equal(findOccupation('7212').title, 'Welders and Flame Cutters');
  assert.equal(findOccupation('Welders and Flame Cutters').isco, '7212');
  assert.equal(findOccupation('welders and flame cutters').isco, '7212');
  assert.equal(findOccupation('no such occupation'), null);
  assert.equal(findOccupation(''), null);
});

test('occupations people name in everyday life are all present and findable', () => {
  // Spot-checks across the collar range, with the interest code O*NET gives their US counterpart.
  for (const [isco, title, riasec] of [
    ['2512', 'Software Developers', 'I-C'],
    ['2611', 'Lawyers', 'E-C'],
    ['2221', 'Nursing Professionals', 'S-I'],
    ['2411', 'Accountants', 'C-E'],
    ['7411', 'Building and Related Electricians', 'R-C'],
    ['7126', 'Plumbers and Pipe Fitters', 'R-C'],
    ['7212', 'Welders and Flame Cutters', 'R-C'],
    ['8332', 'Heavy Truck and Lorry Drivers', 'R-C'],
    ['5120', 'Cooks', 'R-C'],
    ['5414', 'Security Guards', 'R-C'],
    ['6111', 'Field Crop and Vegetable Growers', 'R-C'],
    ['9112', 'Cleaners and Helpers in Offices, Hotels and Other Establishments', 'R-C'],
  ]) {
    const occupation = findOccupation(isco);
    assert.equal(occupation.title, title);
    assert.equal(occupation.riasec, riasec, `${title} interest code`);
  }
});
