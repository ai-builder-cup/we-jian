// Regenerates src/business/occupationBank.js: every occupation in the world, white collar to
// blue collar, with the interest code the matching formula needs.
//
//   node scripts/build-occupation-bank.mjs
//
// Why this exists: the curated job bank (src/business/jobBank.js) holds 46 AI-era growth jobs,
// and almost all of them are professional or technical. A welder, a driver, a cook or a farmer
// could not find themselves in it. ISCO-08 is the ILO standard that classifies ALL jobs in the
// world into 436 unit groups, from managers (major group 1) to elementary occupations (major
// group 9), so it is the right backbone for complete coverage.
//
// Three public sources are combined, downloaded fresh on every run:
//
//   1. ILO ISCO-08 structure (436 unit groups) ....... the occupation list itself
//   2. O*NET 29.1 Interests ......................... RIASEC profiles for 923 US occupations
//   3. O*NET x ESCO crosswalk ....................... ISCO unit group -> O*NET-SOC
//      (ESCO's top four levels ARE ISCO-08, so its "ESCO/ISCO Code" column keys on the
//       ISCO-08 unit group; the crosswalk itself was AI-built and human-validated by ESCO.)
//
// The interest code is DERIVED, not quoted: for each ISCO unit group we take the O*NET
// occupations it maps to, weight them by how closely their title matches the ISCO title, and
// read the two highest interest dimensions off the weighted average. Every record carries the
// SOC codes it came from and a confidence grade, so any single code can be traced or disputed.
// Nothing here invents a labour-market claim: growth evidence stays in jobBank.js.
import { writeFile } from 'node:fs/promises';
import { inflateRawSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ISCO_CSV = 'https://www.ilo.org/ilostat-files/ISCO/newdocs-08-2021/ISCO-08/ISCO-08%20EN.csv';
const ONET_INTERESTS = 'https://www.onetcenter.org/dl_files/database/db_29_1_text/Interests.txt';
const ONET_OCCUPATIONS = 'https://www.onetcenter.org/dl_files/database/db_29_1_text/Occupation%20Data.txt';
const ESCO_CROSSWALK = 'https://www.onetcenter.org/crosswalks/esco/ESCO_to_ONET-SOC.xlsx';

const TYPES = ['R', 'I', 'A', 'S', 'E', 'C'];
// A title match this good means the ISCO group and the O*NET occupation are the same job.
const STRONG_TITLE_MATCH = 0.5;
// Weight = (similarity + FLOOR) ** EXPONENT. A verbatim title match then outweighs a loose
// one by ~800x, so related-but-different occupations inform the profile without steering it,
// while a group with no close match still averages over everything it maps to.
const WEIGHT_FLOOR = 0.12;
const WEIGHT_EXPONENT = 3;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function download(url, { binary = false } = {}) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  // The ILO CSV is Windows-1252: it has curly apostrophes that are not valid UTF-8.
  return binary ? buffer : new TextDecoder('windows-1252').decode(buffer);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char !== '"') cell += char;
      else if (text[i + 1] === '"') { cell += '"'; i += 1; }
      else quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') {
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = []; cell = '';
    } else if (char !== '\r') cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

// Minimal .xlsx reader: enough to pull one sheet out of the crosswalk without a dependency.
function readXlsxSheet(zipBuffer) {
  const files = new Map();
  // Walk the central directory backwards from the end-of-central-directory record.
  const eocd = zipBuffer.lastIndexOf(Buffer.from('PK\x05\x06', 'binary'));
  if (eocd === -1) throw new Error('The crosswalk download is not a valid .xlsx file.');
  let offset = zipBuffer.readUInt32LE(eocd + 16);
  const count = zipBuffer.readUInt16LE(eocd + 10);
  for (let i = 0; i < count; i += 1) {
    const nameLength = zipBuffer.readUInt16LE(offset + 28);
    const extraLength = zipBuffer.readUInt16LE(offset + 30);
    const commentLength = zipBuffer.readUInt16LE(offset + 32);
    const name = zipBuffer.toString('utf8', offset + 46, offset + 46 + nameLength);
    const localOffset = zipBuffer.readUInt32LE(offset + 42);
    const method = zipBuffer.readUInt16LE(offset + 10);
    const compressedSize = zipBuffer.readUInt32LE(offset + 20);
    // The local header repeats the name and extra fields with its own lengths.
    const localNameLength = zipBuffer.readUInt16LE(localOffset + 26);
    const localExtraLength = zipBuffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = zipBuffer.subarray(dataStart, dataStart + compressedSize);
    files.set(name, method === 0 ? raw : inflateRawSync(raw));
    offset += 46 + nameLength + extraLength + commentLength;
  }
  const textOf = (xml) => [...xml.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)]
    .map((match) => match[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'))
    .join('');
  const sharedXml = files.get('xl/sharedStrings.xml')?.toString('utf8') || '';
  const shared = [...sharedXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) => textOf(match[1]));
  const sheetName = [...files.keys()].find((name) => name.startsWith('xl/worksheets/sheet'));
  const sheetXml = files.get(sheetName).toString('utf8');
  // Match each cell whole, then read its type attribute and value separately: a cell can be
  // self-closing (<c r="B1"/>), and attribute order is not guaranteed.
  const cellPattern = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  return [...sheetXml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)].map((rowMatch) =>
    [...rowMatch[1].matchAll(cellPattern)].map(([, attributes, body = '']) => {
      const value = body.match(/<v>([\s\S]*?)<\/v>/)?.[1];
      if (value == null) return '';
      // t="s" means the value is an index into the shared-string table.
      return /\bt="s"/.test(attributes) ? shared[Number(value)] : value;
    }));
}

// Title similarity. ISCO and O*NET name the same job differently ("Nursing Professionals" vs
// "Registered Nurses"), so compare sets of stemmed content words rather than strings.
const STOP_WORDS = new Set(['and', 'or', 'of', 'the', 'other', 'not', 'elsewhere', 'classified',
  'all', 'nec', 'first', 'line', 'except', 'related', 'general', 'workers', 'worker']);

function stem(word) {
  for (const suffix of ['ists', 'ers', 'ies', 'ing', 'ors', 'es', 's']) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) return word.slice(0, -suffix.length);
  }
  return word;
}

function tokenize(title) {
  return new Set(title.toLowerCase().split(/[^a-z]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .map(stem));
}

function similarity(a, b) {
  const left = tokenize(a);
  const right = tokenize(b);
  if (left.size === 0 || right.size === 0) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / (left.size + right.size - shared);
}

// ISCO-08 major groups, in the ILO's own terms, plus the plain word people actually use.
// "Collar" is a reading aid for the UI, never an input to any score.
const MAJOR_GROUPS = {
  '0': { collar: 'uniformed', skillLevel: null, aggregate: 'Armed forces' },
  '1': { collar: 'white', skillLevel: 4, aggregate: 'Managers, professionals, and technicians' },
  '2': { collar: 'white', skillLevel: 4, aggregate: 'Managers, professionals, and technicians' },
  '3': { collar: 'white', skillLevel: 3, aggregate: 'Managers, professionals, and technicians' },
  '4': { collar: 'white', skillLevel: 2, aggregate: 'Clerical, service and sales workers' },
  '5': { collar: 'service', skillLevel: 2, aggregate: 'Clerical, service and sales workers' },
  '6': { collar: 'blue', skillLevel: 2, aggregate: 'Skilled agricultural and trades workers' },
  '7': { collar: 'blue', skillLevel: 2, aggregate: 'Skilled agricultural and trades workers' },
  '8': { collar: 'blue', skillLevel: 2, aggregate: 'Plant and machine operators, and assemblers' },
  '9': { collar: 'blue', skillLevel: 1, aggregate: 'Elementary occupations' },
};

async function main() {
  console.log('Downloading ILO ISCO-08, O*NET 29.1 interests, and the O*NET x ESCO crosswalk…');
  const [iscoCsv, interestsText, occupationsText, crosswalkZip] = await Promise.all([
    download(ISCO_CSV),
    download(ONET_INTERESTS),
    download(ONET_OCCUPATIONS),
    download(ESCO_CROSSWALK, { binary: true }),
  ]);

  // 1. The occupation list: ISCO-08 only (the file also carries ISCO-88, -68 and -58).
  const [header, ...iscoRows] = parseCsv(iscoCsv);
  const column = Object.fromEntries(header.map((name, index) => [name.trim(), index]));
  const units = iscoRows
    .filter((row) => row[column.ISCO_version] === 'ISCO-08')
    .map((row) => ({
      isco: row[column.unit].trim().padStart(4, '0'),
      title: row[column.description].trim(),
      major: row[column.major].trim(),
      majorLabel: row[column.major_label].trim(),
      subMajor: row[column.sub_major].trim(),
      subMajorLabel: row[column.sub_major_label].trim(),
      minor: row[column.minor].trim(),
      minorLabel: row[column.minor_label].trim(),
    }));
  if (units.length !== 436) throw new Error(`Expected 436 ISCO-08 unit groups, found ${units.length}.`);

  // 2. RIASEC profiles, O*NET's own Occupational Interest (OI) scale, 1-7 per dimension.
  const profileBySoc = new Map();
  for (const line of interestsText.trim().split('\n').slice(1)) {
    const [soc, , element, scale, value] = line.split('\t');
    if (scale !== 'OI') continue;
    const letter = element.trim()[0];
    if (!TYPES.includes(letter)) continue;
    if (!profileBySoc.has(soc)) profileBySoc.set(soc, {});
    profileBySoc.get(soc)[letter] = Number(value);
  }

  const titleBySoc = new Map();
  for (const line of occupationsText.trim().split('\n').slice(1)) {
    const [soc, title] = line.split('\t');
    if (profileBySoc.has(soc)) titleBySoc.set(soc, title);
  }

  // 3. ISCO unit group -> O*NET-SOC, from the "ESCO/ISCO Code" column ("2611.3" -> "2611").
  const socsByIsco = new Map();
  for (const row of readXlsxSheet(crosswalkZip).slice(3)) {
    const [escoCode, , soc] = row;
    if (!escoCode || !soc || !profileBySoc.has(soc)) continue;
    const isco = String(escoCode).split('.')[0].padStart(4, '0');
    if (!/^\d{4}$/.test(isco)) continue;
    if (!socsByIsco.has(isco)) socsByIsco.set(isco, new Set());
    socsByIsco.get(isco).add(soc);
  }

  // Weighted interest profile per unit group. Candidates come from the crosswalk, plus any
  // O*NET occupation whose title is a strong match: the crosswalk misses some obvious pairs
  // (ISCO 2221 "Nursing Professionals" maps to nursing assistants but not Registered Nurses).
  const resolved = new Map();
  const evidence = new Map();
  for (const unit of units) {
    const candidates = new Set(socsByIsco.get(unit.isco) || []);
    for (const [soc, title] of titleBySoc) {
      if (similarity(unit.title, title) >= STRONG_TITLE_MATCH) candidates.add(soc);
    }
    if (candidates.size === 0) continue;
    const scored = [...candidates]
      .map((soc) => ({ soc, score: similarity(unit.title, titleBySoc.get(soc) || '') }))
      .sort((a, b) => b.score - a.score || a.soc.localeCompare(b.soc));
    let total = 0;
    const profile = Object.fromEntries(TYPES.map((type) => [type, 0]));
    for (const { soc, score } of scored) {
      const weight = (score + WEIGHT_FLOOR) ** WEIGHT_EXPONENT;
      total += weight;
      for (const type of TYPES) profile[type] += (profileBySoc.get(soc)[type] ?? 0) * weight;
    }
    for (const type of TYPES) profile[type] /= total;
    resolved.set(unit.isco, profile);
    evidence.set(unit.isco, scored);
  }

  // A handful of unit groups have no US counterpart at all - subsistence farmers, traditional
  // chiefs, water and firewood collectors. ISCO groups by skill specialisation, so the closest
  // honest estimate is the average of their siblings: same minor group, then sub-major, then major.
  const siblingAverage = (unit) => {
    for (const level of ['minor', 'subMajor', 'major']) {
      const siblings = units.filter((other) => other[level] === unit[level] && resolved.has(other.isco));
      if (siblings.length === 0) continue;
      const profile = Object.fromEntries(TYPES.map((type) => [type,
        siblings.reduce((sum, other) => sum + resolved.get(other.isco)[type], 0) / siblings.length]));
      return { profile, level, siblings: siblings.map((other) => other.isco) };
    }
    throw new Error(`No interest evidence anywhere for ISCO ${unit.isco}.`);
  };

  const records = units.map((unit) => {
    const group = MAJOR_GROUPS[unit.major];
    const direct = resolved.get(unit.isco);
    const scored = evidence.get(unit.isco) || [];
    const best = scored[0]?.score ?? 0;
    const { profile, level, siblings } = direct
      ? { profile: direct, level: null, siblings: null }
      : siblingAverage(unit);
    const ranked = [...TYPES].sort((a, b) => profile[b] - profile[a]);
    return {
      isco: unit.isco,
      title: unit.title,
      riasec: `${ranked[0]}-${ranked[1]}`,
      // The full six-dimension profile, on O*NET's 1-7 Occupational Interest scale. A two-letter
      // code cannot separate the ~100 occupations that are all "R-C"; the shape of the whole
      // profile can. occupationMatching.js ranks on this and shows the code.
      interests: Object.fromEntries(TYPES.map((type) => [type, Math.round(profile[type] * 100) / 100])),
      collar: group.collar,
      skillLevel: group.skillLevel,
      major: unit.major,
      majorLabel: unit.majorLabel,
      minorLabel: unit.minorLabel,
      // How much to trust this one code. "high" means an O*NET occupation of the same name.
      confidence: direct ? (best >= STRONG_TITLE_MATCH ? 'high' : best >= 0.2 ? 'medium' : 'low') : 'low',
      basis: direct ? 'onet-crosswalk' : `isco-${level}-siblings`,
      evidence: direct ? scored.slice(0, 4).map(({ soc }) => soc) : siblings.slice(0, 4),
    };
  });

  const counts = records.reduce((totals, record) => ({ ...totals, [record.collar]: (totals[record.collar] || 0) + 1 }), {});
  const file = `// Every occupation in the world, white collar to blue collar: all 436 ISCO-08 unit
// groups (ILO), each with the RIASEC interest code the matching formula needs.
//
// GENERATED FILE - do not edit by hand. Run: node scripts/build-occupation-bank.mjs
// That script documents the three public sources and how the interest code is derived.
//
// What each field means:
//   isco        ISCO-08 unit group code, the international standard occupation id
//   riasec      interest code, DERIVED from O*NET interest profiles (see confidence)
//   interests   the full R/I/A/S/E/C profile on O*NET's 1-7 scale, which is what ranking uses
//   collar      white | service | blue | uniformed, from the ISCO major group. A reading
//               aid for the interface only; it never enters a score.
//   skillLevel  ISCO skill level 1-4, the ILO's own measure of typical preparation
//   confidence  high   = an O*NET occupation with the same name backs this code
//               medium = related O*NET occupations back it
//               low    = inferred from the group's nearest neighbours; treat as a hint
//   evidence    the O*NET-SOC codes (or sibling ISCO codes) the interest code came from
//
// Growth and labour-market evidence is NOT here. That stays in jobBank.js, which carries
// sources per job. This file is coverage: so that a welder, a nurse, a driver, a farmer
// and a software developer can all be found by the same questionnaire.
//
// SERVER-SIDE ONLY. At ~250 KB this must not reach the browser bundle; import it from
// occupationMatching.js, which only the server uses. The browser keeps the small curated
// jobBank.js for the instant result chart.
export const OCCUPATION_BANK_VERSION = 'isco08-onet29.1-v1';
export const OCCUPATION_SOURCES = Object.freeze({
  structure: 'ILO ISCO-08 (436 unit groups)',
  interests: 'O*NET 29.1 Interests (Occupational Interest scale), CC BY 4.0',
  crosswalk: 'O*NET x ESCO crosswalk (ESCO levels 1-4 are ISCO-08)',
});
export const COLLAR_COUNTS = Object.freeze(${JSON.stringify(counts)});
export const OCCUPATIONS = Object.freeze([
${records.map((record) => `  ${JSON.stringify(record)},`).join('\n')}
]);
`;
  await writeFile(path.join(rootDir, 'src/business/occupationBank.js'), file);
  console.log(`Wrote ${records.length} occupations to src/business/occupationBank.js`);
  console.log('By collar:', counts);
  console.log('By confidence:', records.reduce((t, r) => ({ ...t, [r.confidence]: (t[r.confidence] || 0) + 1 }), {}));
}

main().catch((error) => {
  console.error(`Could not build the occupation bank: ${error.message}`);
  process.exitCode = 1;
});
