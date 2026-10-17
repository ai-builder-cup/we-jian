// Public API for the BaZi reflection.
//
// Runs ENTIRELY IN THE BROWSER. That is a privacy decision, not an accident:
// the birth date never reaches the server, never reaches Firestore, and never
// reaches Gemini. Only the finished labels below are sent anywhere, and those
// cannot be reversed into a date of birth.
//
// Everything here is deterministic. The same birth details always produce the
// same reflection, and no AI participates in producing it.

import pkg from 'lunar-javascript';
import { STEM_ELEMENT, elementCounts } from './chart.js';
import { BAZI_ENGINE_VERSION } from './constants.js';
import { computeWeighting } from './weighting.js';
import {
  coreDriver, valueCreation, pressureResponse, collaborationStyle,
  paceAndLoad, workArchetype, favourableElements, fieldAffinity,
} from './reflection.js';
import { buildBlueprint, composeReading } from './blueprint.js';

const { Solar } = pkg;

const STEM_OF = {
  甲: 'Jia', 乙: 'Yi', 丙: 'Bing', 丁: 'Ding', 戊: 'Wu',
  己: 'Ji', 庚: 'Geng', 辛: 'Xin', 壬: 'Ren', 癸: 'Gui',
};
const BRANCH_OF = {
  子: 'Zi', 丑: 'Chou', 寅: 'Yin', 卯: 'Mao', 辰: 'Chen', 巳: 'Si',
  午: 'Wu', 未: 'Wei', 申: 'Shen', 酉: 'You', 戌: 'Xu', 亥: 'Hai',
};

function parsePillar(ganZhi, label) {
  const stem = STEM_OF[ganZhi.charAt(0)];
  const branch = BRANCH_OF[ganZhi.charAt(1)];
  // A default pillar here would produce a reflection that looks perfectly valid
  // for the wrong person. Fail loudly instead.
  if (!stem || !branch) throw new Error(`The ${label} pillar could not be read.`);
  return { stem, branch };
}

// Birth date and local time to Four Pillars, using the same calendar library the
// audited engine uses. Solar terms (節氣) decide the month pillar, so the month
// changes mid-calendar-month, not on the 1st.
//
// TIME ZONE: the time is taken as local time at the place of birth, with no
// conversion. For an Indonesia-first release that is correct; quietly guessing a
// zone would shift the hour pillar without anyone noticing.
export function pillarsFromBirth({ date, time }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date ?? '')) || !/^\d{2}:\d{2}$/.test(String(time ?? ''))) {
    throw new Error('Enter the date as YYYY-MM-DD and the time as HH:MM.');
  }
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new Error('That date or time is outside the valid range.');
  }
  const eightChar = Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar().getEightChar();
  return {
    year: parsePillar(eightChar.getYear(), 'year'),
    month: parsePillar(eightChar.getMonth(), 'month'),
    day: parsePillar(eightChar.getDay(), 'day'),
    hour: parsePillar(eightChar.getTime(), 'hour'),
  };
}

export function reflectionFromPillars(pillars) {
  const { weights, shares, dmElement, dm, flags } = computeWeighting(pillars);
  const favourable = favourableElements(dmElement, dm.strength);

  const base = {
    version: BAZI_ENGINE_VERSION,
    // Confidence drops a step when combinations or clashes are present, because
    // v1 detects them without applying them. Saying so is more honest than
    // presenting an incomplete reading at full confidence.
    confidence: flags.length > 0 ? 'moderate' : 'strong',
    archetype: workArchetype(pillars, dm.strength),
    driver: coreDriver(weights, dm.strength),
    valueCreation: valueCreation(weights, shares, dm.strength),
    pressure: pressureResponse(weights, shares, dm.strength),
    collaboration: collaborationStyle(shares),
    pace: paceAndLoad(shares, dm.strength),
    favourableElements: favourable,
    sectors: fieldAffinity(favourable),
    elements: elementCounts(pillars),
    dayMaster: { element: dmElement, strength: dm.strength },
    shares,
  };

  // Built last: both read the finished values rather than recomputing anything.
  const blueprint = buildBlueprint(base);
  const withBlueprint = { ...base, blueprint };
  return { ...withBlueprint, reading: composeReading(withBlueprint) };
}

export function computeBaziReflection({ date, time }) {
  return reflectionFromPillars(pillarsFromBirth({ date, time }));
}

// What may be sent to the server for a written explanation. Deliberately narrow:
// no pillars, no stems, no branches, no weights, no Day Master strength, no date.
// Four Pillars can be reversed into a birth date, so none of them travel.
export function narrationPayload(reflection) {
  return {
    archetype: reflection.archetype?.name ?? null,
    driver: reflection.driver.primary,
    driverSecondary: reflection.driver.secondary,
    valueCreation: reflection.valueCreation.style,
    pressure: reflection.pressure.response,
    collaboration: reflection.collaboration.style,
    pace: reflection.pace.pattern,
    confidence: reflection.confidence,
    provisional: ['pressure', 'collaboration', 'pace'],
  };
}

export { STEM_ELEMENT };
