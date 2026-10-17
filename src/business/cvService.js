export const MAX_CV_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_NAME_LENGTH = 80;
export const MAX_MAJOR_LENGTH = 120;

// Two people arrive here with different questions. A student asks "what should I aim at?";
// someone already working asks "where can I go from here, and what do I need to add?".
// Everything downstream - the goals questions, the ranked directions, the plan - reads better
// when it knows which one it is talking to, so the choice is made before anything else.
export const USER_TYPES = [
  {
    value: 'student',
    label: 'I am a student',
    description: 'At school or university, working out what to aim for',
    cta: 'Start my journey',
  },
  {
    value: 'professional',
    label: 'I want to change direction',
    description: 'Already working or graduated, looking for where to go next',
    cta: 'Upload CV & continue',
  },
];

export const findUserType = (value) => USER_TYPES.find((type) => type.value === value) || null;

// Where the student is now. This changes what a useful recommendation looks like: a Grade 12
// student is choosing what to study, a university student is choosing how to enter the work.
export const STUDY_STATUSES = [
  {
    value: 'grade12',
    label: 'Student · Grade 12',
    description: 'Still at school, choosing what to study next',
    majorLabel: 'Major you plan to study',
    majorHint: 'Leave this blank if you have not decided yet',
    majorPlaceholder: 'e.g. Mechanical Engineering, Nursing, Accounting',
  },
  {
    value: 'university',
    label: 'University student',
    description: 'Already on a programme',
    majorLabel: 'Major you are taking',
    majorHint: '',
    majorPlaceholder: 'e.g. Informatics, Communication, Civil Engineering',
  },
];

export const findStudyStatus = (value) => STUDY_STATUSES.find((status) => status.value === value) || null;

// The student's own words about where they are. Validated here so both routes into the app -
// uploading a CV and starting without one - ask for the same things and fail the same way.
export function validateIntake({ userType, name, studyStatus, major } = {}) {
  if (!findUserType(userType)) throw new Error('Please choose whether you are a student or changing direction.');
  if (!String(name || '').trim()) throw new Error('Please enter your name.');
  if (String(name).trim().length > MAX_NAME_LENGTH) {
    throw new Error(`Your name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }
  if (String(major || '').trim().length > MAX_MAJOR_LENGTH) {
    throw new Error(`Your major must be ${MAX_MAJOR_LENGTH} characters or fewer.`);
  }
  // Only students are asked where they are studying. Someone changing direction is not at
  // school, and asking them to pick Grade 12 or university would have no honest answer.
  if (userType !== 'student') return;
  if (!findStudyStatus(studyStatus)) throw new Error('Please choose whether you are in Grade 12 or at university.');
  // A Grade 12 student may genuinely not have chosen yet, and being made to invent an answer
  // is how a questionnaire starts collecting fiction. University students have one already.
  if (studyStatus === 'university' && !String(major || '').trim()) {
    throw new Error('Please enter the major you are taking.');
  }
}

export function normalizeIntake(intake) {
  validateIntake(intake);
  const isStudent = intake.userType === 'student';
  const status = isStudent ? findStudyStatus(intake.studyStatus) : null;
  return {
    userType: intake.userType,
    name: String(intake.name).trim().slice(0, MAX_NAME_LENGTH),
    studyStatus: status ? status.value : '',
    studyStatusLabel: status ? status.label : '',
    major: isStudent ? String(intake.major || '').trim().slice(0, MAX_MAJOR_LENGTH) : '',
  };
}

export function validateCvFile(file) {
  if (!file) throw new Error('Choose a CV PDF to continue.');
  if (
    !file.name.toLowerCase().endsWith('.pdf') ||
    (file.type && file.type !== 'application/pdf')
  ) {
    throw new Error('Please upload a PDF file.');
  }
  if (file.size === 0) throw new Error('The selected PDF is empty.');
  if (file.size > MAX_CV_SIZE_BYTES) {
    throw new Error('Your PDF must be 10 MB or smaller.');
  }
}

export function normalizeCvProfile(payload) {
  const profile = payload?.profile || payload;
  if (
    !profile ||
    typeof profile.summary !== 'string' ||
    !Array.isArray(profile.skills) ||
    !Array.isArray(profile.experience) ||
    !Array.isArray(profile.education) ||
    !Array.isArray(profile.careerInterests)
  ) {
    throw new Error('The CV parser returned an incomplete career profile.');
  }
  const normalized = {
    summary: profile.summary.trim().slice(0, 1000),
    skills: profile.skills.filter((value) => typeof value === 'string').slice(0, 20),
    experience: profile.experience.filter((value) => typeof value === 'string').slice(0, 8),
    education: profile.education.filter((value) => typeof value === 'string').slice(0, 6),
    careerInterests: profile.careerInterests.filter((value) => typeof value === 'string').slice(0, 12),
    parsedAt: new Date().toISOString(),
  };
  if (
    !normalized.summary &&
    normalized.skills.length === 0 &&
    normalized.experience.length === 0 &&
    normalized.education.length === 0 &&
    normalized.careerInterests.length === 0
  ) {
    throw new Error('We could not find career information in this PDF. Please try a text-based CV PDF.');
  }
  return normalized;
}

// Students without a CV (no work experience yet) continue with a minimal profile.
// Nothing is sent to Gemini for this step; later agents are told the student has no CV.
export const NO_CV_SUMMARY = 'No CV yet.';
export function buildNoCvProfile(intake) {
  const { userType, studyStatus, studyStatusLabel, major } = normalizeIntake(intake);
  const studying = major
    ? `${studyStatusLabel}, ${studyStatus === 'grade12' ? 'planning to study' : 'taking'} ${major}.`
    : `${studyStatusLabel}, major not chosen yet.`;
  return {
    summary: `${NO_CV_SUMMARY} ${studying}`,
    skills: [],
    experience: [],
    education: major ? [major] : [],
    careerInterests: [],
    userType,
    studyStatus,
    major,
    source: 'no-cv',
    parsedAt: new Date().toISOString(),
  };
}

// The CV profile carries where the student is studying, because that changes which paths are
// realistic. It deliberately does NOT carry their name: the name is kept in the browser for
// greeting them, and never travels to the model, which has no use for it and every opportunity
// to read things into it that the guardrails forbid.
export function withIntake(profile, intake) {
  const { userType, studyStatus, major } = normalizeIntake(intake);
  return { ...profile, userType, studyStatus, major };
}
