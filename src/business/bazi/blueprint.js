// Character blueprint: what each reading GIVES you at work, and what it COSTS.
//
// Two-sided by construction. A blueprint that lists only strengths is flattery,
// and flattery is the failure mode this whole product exists to avoid. Every
// entry below has both halves, and neither half is optional.
//
// Written for the workplace, not for life in general: what a manager would
// notice, what a team would feel, what tends to go wrong under load. Nothing
// here is a verdict, and nothing here may touch a score.

const DRIVER = {
  'Stability': {
    strength: 'Dependable output. People can plan around you because your pace does not swing.',
    watchOut: 'Change announced late reads as disruption rather than news. You may hold a working method past the point it still works.',
  },
  'Stability under load': {
    strength: 'You keep delivering when the pressure is on, and rarely drop what you have picked up.',
    watchOut: 'You absorb more than you show. The cost surfaces late, and usually all at once.',
  },
  'Autonomy and results': {
    strength: 'Give you the outcome and room to reach it, and you will find a route others did not see.',
    watchOut: 'You may route around process that other people actually depend on, and tell them afterwards.',
  },
  'Responsibility': {
    strength: 'You hold the standard when nobody is checking, and others calibrate to it.',
    watchOut: 'You can carry accountability that was never assigned to you, and resent it quietly.',
  },
  'Challenge': {
    strength: 'Hard targets focus you. You are at your best where the stakes are real.',
    watchOut: 'Without a worthy problem you may manufacture one. Calm periods can feel like stalling.',
  },
  'Craft': {
    strength: 'The quality of the work itself matters to you, so the last ten percent actually gets done.',
    watchOut: 'Knowing when it is finished is harder for you than knowing how to make it good.',
  },
  'Originality': {
    strength: 'You see the version nobody has tried, and you are willing to say the method is wrong.',
    watchOut: 'The way you raise it can land as a challenge to the person, not the method.',
  },
  'Depth': {
    strength: 'You understand before you act, so your decisions hold up when questioned.',
    watchOut: 'Enough information is never quite enough. Speed can be the thing you trade away.',
  },
  'Insight': {
    strength: 'You notice the pattern before it becomes visible to anyone else.',
    watchOut: 'What is obvious to you is not obvious to them. Skipping the explanation costs you support.',
  },
  'Independence': {
    strength: 'You need very little management, and you finish without being chased.',
    watchOut: 'Working alone becomes a preference rather than a choice, and your visibility drops with it.',
  },
  'Competition': {
    strength: 'A clear benchmark lifts your performance. You measure, and you improve.',
    watchOut: 'Colleagues can become the benchmark, which turns teammates into a scoreboard.',
  },
};

const ARCHETYPE = {
  'Institutional operator': {
    strength: 'You make structures work, and you are trusted with things that must not go wrong.',
    watchOut: 'An environment with no clear lines leaves you spending energy on who decides what.',
  },
  'Pressure converter': {
    strength: 'You get sharper when the stakes rise. Crises find you useful.',
    watchOut: 'Steady-state work can feel flat, and you may escalate things that did not need it.',
  },
  'Creative producer': {
    strength: 'You generate the thing itself: output, not just coordination.',
    watchOut: 'Being asked to enforce other people’s rules drains you faster than hard work does.',
  },
  'Reformer': {
    strength: 'You improve what you join, because you can see what is wrong with it.',
    watchOut: 'Places that treat questions as insubordination will cost you more than the fix is worth.',
  },
  'Steady builder': {
    strength: 'Compounding is your advantage. Small reliable gains, held over time.',
    watchOut: 'Opportunities that require moving before the evidence is complete tend to pass you by.',
  },
  'Deal maker': {
    strength: 'You read what each side needs and bring them together. Value moves when you are in the room.',
    watchOut: 'Patient solo work with a distant payoff is where your attention leaks.',
  },
  'Knowledge authority': {
    strength: 'Expertise others rely on. You are the one people check with.',
    watchOut: 'Knowing can quietly replace doing. The gap between the two can widen unnoticed.',
  },
  'Specialist': {
    strength: 'Depth in a narrow place, where few others are willing to go.',
    watchOut: 'Uniform corporate environments fit badly, and translating your work to generalists is real effort.',
  },
};

// 食傷生財, 財官 and the rest, read as ways of WORKING rather than ways of
// earning. The money framing belongs to a personal reading, not to anything
// touching employment.
const VALUE_CREATION = {
  'Producer': {
    strength: 'You create value directly through skill and output, not through position.',
    watchOut: 'Your contribution is visible in what you made; it is less visible in meetings.',
  },
  'Systems operator': {
    strength: 'You turn effort into results through structure, which is how work survives scale.',
    watchOut: 'When the structure is wrong you may optimise it instead of questioning it.',
  },
  'Connector': {
    strength: 'Your network is a working asset. You know who closes the gap.',
    watchOut: 'Relationships need maintenance. Yours can go quiet exactly when you need them.',
  },
  'Opportunity scout': {
    strength: 'You pick where effort should go, which beats working harder in the wrong place.',
    watchOut: 'Choosing is not finishing. Follow-through is the part to protect.',
  },
  'Compounder': {
    strength: 'Methodical accumulation. Consistency is doing the work for you.',
    watchOut: 'Step changes need a different mode than the one that got you here.',
  },
  'Steward': {
    strength: 'You create value by keeping order and owning the process end to end.',
    watchOut: 'Ownership can shade into control, and control slows the people around you.',
  },
  'Maker': {
    strength: 'What you produce is the point, and you are judged on something real.',
    watchOut: 'Output without a route to the people who need it stays invisible.',
  },
  'Scholar': {
    strength: 'Depth of expertise is your contribution, and it compounds.',
    watchOut: 'Applying it matters as much as holding it. Translation is part of the job.',
  },
  'Solo operator': {
    strength: 'Full self-reliance. You do not wait to be unblocked.',
    watchOut: 'Work that genuinely needs a team will feel slower than doing it yourself, and sometimes it is not.',
  },
  'Over-extended': {
    strength: 'Considerable capacity. You take on what others would decline.',
    watchOut: 'Intake is outrunning completion. The limit is not ability, it is recovery.',
  },
};

const COLLABORATION = {
  'Expressive collaborator': {
    strength: 'You put ideas into the room and bring people with you.',
    watchOut: 'Quieter colleagues may stop contributing without you noticing the room went one-way.',
  },
  'Front-facing, works independently': {
    strength: 'Comfortable representing the work externally, and you do not need company to do it.',
    watchOut: 'Being visible outside and independent inside can read as distance to your own team.',
  },
  'Peer-oriented, speaks sparingly': {
    strength: 'Steady, reliable presence. People take you at your word because you use few of them.',
    watchOut: 'Contributions that are never voiced get credited elsewhere.',
  },
  'Works through proper channels': {
    strength: 'You respect structure, so your communication is predictable and traceable.',
    watchOut: 'Urgent things sometimes need a shortcut, and waiting for the channel can cost the moment.',
  },
  'Processes first, speaks after': {
    strength: 'What you say has been thought through, so it carries weight.',
    watchOut: 'Fast-moving discussions can close before you are ready to enter them.',
  },
  'Low-broadcast specialist': {
    strength: 'Deep focus, little noise. Your output speaks for itself.',
    watchOut: 'Work that nobody can see is work that is easy to under-value.',
  },
  'Situational': {
    strength: 'You adapt to the room rather than forcing one style on it.',
    watchOut: 'Adapting to everyone can leave people unsure what you actually think.',
  },
};

const PACE = {
  'Sustains load': {
    strength: 'You can hold a demanding pace over long stretches without degrading.',
    watchOut: 'Because you can, you may be given more. Capacity attracts load.',
  },
  'Steady, with real recovery needs': {
    strength: 'A sustainable rhythm, and you generally know where your limit is.',
    watchOut: 'Recovery has to be scheduled. Skipped twice in a row, it shows in the work.',
  },
  'Sprints, then recovers': {
    strength: 'High intensity in bursts. You can produce a great deal in a short window.',
    watchOut: 'The trough after the sprint is real, and planning that ignores it will break.',
  },
  'Recovery depends on conditions': {
    strength: 'With the right support in place you deliver fully.',
    watchOut: 'Your output is more sensitive to environment than most. The wrong setting costs you disproportionately.',
  },
};

const PRESSURE = {
  'Works best with real stakes': {
    strength: 'Pressure focuses you rather than scattering you.',
    watchOut: 'Low-stakes work gets less of you than it needs.',
  },
  'Carries load when support exists': {
    strength: 'Considerable staying power, provided the backing is there.',
    watchOut: 'Remove the support and the same load lands very differently. That dependency is worth naming early.',
  },
  'Pressure accumulates without a release': {
    strength: 'You keep going, and you rarely let the outside see the strain.',
    watchOut: 'Nothing is currently discharging it. A deliberate outlet is a structural need, not a luxury.',
  },
  'Prepares before acting': {
    strength: 'You reduce pressure by knowing more, so you are rarely caught out.',
    watchOut: 'Preparation can become the place you hide from the decision.',
  },
  'Releases pressure by making things': {
    strength: 'You work through tension by producing, which converts strain into output.',
    watchOut: 'Blocked from making, the tension has nowhere to go.',
  },
  'Sets own standards': {
    strength: 'Internally driven. You do not need external pressure to perform.',
    watchOut: 'Your standard may exceed the one being asked of you, and nobody will tell you to stop.',
  },
  'Even response to load': {
    strength: 'Pressure neither derails nor particularly drives you. Steady either way.',
    watchOut: 'In a crisis you may not escalate your own urgency when the moment calls for it.',
  },
};

// Reading -> {strength, watchOut}. Anything missing returns null rather than a
// generic sentence: a placeholder here would read exactly like a real finding.
function look(table, key) {
  const found = key ? table[key] : null;
  return found ? { ...found } : null;
}

export function buildBlueprint(reflection) {
  const rows = [
    { id: 'driver', label: 'What moves you', value: reflection.driver.primary, ...look(DRIVER, reflection.driver.primary) },
    { id: 'archetype', label: 'Where you fit', value: reflection.archetype?.name ?? null, ...look(ARCHETYPE, reflection.archetype?.name) },
    { id: 'value', label: 'How you create value', value: reflection.valueCreation.style, ...look(VALUE_CREATION, reflection.valueCreation.style) },
    { id: 'collaboration', label: 'How you work with others', value: reflection.collaboration.style, provisional: true, ...look(COLLABORATION, reflection.collaboration.style) },
    { id: 'pace', label: 'Your pace and recovery', value: reflection.pace.pattern, provisional: true, ...look(PACE, reflection.pace.pattern) },
    { id: 'pressure', label: 'How pressure lands', value: reflection.pressure.response, provisional: true, ...look(PRESSURE, reflection.pressure.response) },
  ].filter((row) => row.value && row.strength);

  return {
    rows,
    strengths: rows.map((row) => ({ from: row.label, text: row.strength, provisional: Boolean(row.provisional) })),
    watchOuts: rows.map((row) => ({ from: row.label, text: row.watchOut, provisional: Boolean(row.provisional) })),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The written reading, composed DETERMINISTICALLY from the values above.
// ─────────────────────────────────────────────────────────────────────────────
// Not written by Gemini. Gemini may add a warmer pass on top, but the reading
// itself must exist without it: an optional feature that silently produces
// nothing whenever an API is slow is worse than one that never had it.
//
// Length is checked, not hoped for. 250-300 words is the target, and the
// assembly below is tested across every archetype to confirm it lands there.

const AXIS_PHRASE = {
  Wealth: 'converting effort into finished outcomes',
  Officer: 'holding structure, standards and accountability',
  Output: 'producing and expressing what you make',
  Resource: 'understanding something properly before you move',
  Peer: 'operating on your own terms',
};

const STRENGTH_WORD = {
  strong: 'You have the footing to carry what this structure attracts',
  moderate: 'You have enough footing to work this structure without being run by it',
  weak: 'This structure currently asks more of you than your footing comfortably supplies',
};

const countWords = (text) => text.trim().split(/\s+/).filter(Boolean).length;

export function composeReading(reflection) {
  const { blueprint, archetype, dayMaster, shares } = reflection;
  const by = (id) => blueprint.rows.find((row) => row.id === id);
  const driver = by('driver');
  const value = by('value');
  const collaboration = by('collaboration');
  const pace = by('pace');
  const pressure = by('pressure');

  const dominant = Object.entries(shares).sort((a, b) => b[1] - a[1])[0];
  const [dominantKey, dominantShare] = dominant;

  const opening = archetype
    ? `Your chart sits in the shape of a ${archetype.name.toLowerCase()}. ${archetype.environment} ${archetype.note} `
      + `${STRENGTH_WORD[dayMaster.strength]}. The structure leans hardest on `
      + `${AXIS_PHRASE[dominantKey]}: about ${Math.round(dominantShare * 100)} per cent of its weight sits there.`
    : `Your chart does not fall into one of the eight classical structures, which is itself worth knowing: `
      + `it tends to mean you are not easily placed in a single role shape. `
      + `${STRENGTH_WORD[dayMaster.strength]}, and the structure leans hardest on ${AXIS_PHRASE[dominantKey]}.`;

  const motive = driver && value
    ? `What actually moves you is ${driver.value.toLowerCase()}. ${driver.strength} The cost is the other half of `
      + `the same trait: ${driver.watchOut.charAt(0).toLowerCase()}${driver.watchOut.slice(1)} `
      + `You create value as a ${value.value.toLowerCase()}. ${value.strength} ${value.watchOut}`
    : '';

  const working = [collaboration, pace, pressure].filter(Boolean).length === 3
    ? `In a team you read as ${collaboration.value.toLowerCase()}. ${collaboration.strength} ${collaboration.watchOut} `
      + `Your working rhythm: ${pace.value.toLowerCase()}. ${pace.watchOut} `
      + `Under pressure, ${pressure.value.toLowerCase()}. ${pressure.watchOut} `
      + `Those last three are the least certain readings here: treat them as questions, not conclusions.`
    : '';

  const conclusion = `In short: the quality that makes you effective is the same one that costs you, `
    + `in the specific way described above rather than in general. None of it is a limit — these are `
    + `defaults, and defaults can be worked against once named. The most useful line here is probably `
    + `whichever one you disagreed with.`;

  const paragraphs = [opening, motive, working, conclusion].filter(Boolean);
  const text = paragraphs.join('\n\n');
  return { text, paragraphs, conclusion, words: countWords(text) };
}
