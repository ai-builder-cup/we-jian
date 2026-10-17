import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_CV_SIZE_BYTES,
  normalizeCvProfile,
  validateCvFile,
} from './cvService.js';

test('CV upload accepts only PDFs within the 10 MB limit', () => {
  assert.throws(
    () => validateCvFile({ name: 'resume.docx', type: 'application/pdf', size: 12 }),
    /PDF/i,
  );
  assert.throws(
    () => validateCvFile({ name: 'resume.pdf', type: 'application/pdf', size: MAX_CV_SIZE_BYTES + 1 }),
    /10 MB/i,
  );
  assert.throws(
    () => validateCvFile({ name: 'resume.pdf', type: 'application/pdf', size: 0 }),
    /empty/i,
  );
  assert.doesNotThrow(
    () => validateCvFile({ name: 'resume.pdf', type: 'application/pdf', size: MAX_CV_SIZE_BYTES }),
  );
});

test('CV parser output is restricted to concise career profile fields', () => {
  const profile = normalizeCvProfile({
    summary: '  Product design graduate.  ',
    skills: ['Research', 5, 'Writing'],
    experience: ['Internship'],
    education: ['BA Design'],
    careerInterests: ['User research'],
    email: 'not-retained@example.com',
  });

  assert.deepEqual(
    Object.keys(profile).sort(),
    ['careerInterests', 'education', 'experience', 'parsedAt', 'skills', 'summary'].sort(),
  );
  assert.deepEqual(profile.skills, ['Research', 'Writing']);
  assert.equal(profile.summary, 'Product design graduate.');
});

test('students without a CV get a minimal profile the later steps accept', async () => {
  const { buildNoCvProfile } = await import('./cvService.js');
  const studying = buildNoCvProfile({ userType: 'student', name: 'Rina', studyStatus: 'university', major: '  Accounting  ' });
  assert.equal(studying.summary, 'No CV yet. University student, taking Accounting.');
  assert.deepEqual(studying.education, ['Accounting']);
  assert.equal(studying.source, 'no-cv');
  assert.equal(studying.major, 'Accounting');
  assert.equal(studying.studyStatus, 'university');

  // A Grade 12 student who has not chosen yet still gets a usable profile.
  const undecided = buildNoCvProfile({ userType: 'student', name: 'Adi', studyStatus: 'grade12', major: '' });
  assert.equal(undecided.summary, 'No CV yet. Student · Grade 12, major not chosen yet.');
  assert.deepEqual([undecided.skills, undecided.experience, undecided.education], [[], [], []]);

  // The name is for greeting the student in their browser; it must never ride along to the model.
  for (const profile of [studying, undecided]) {
    assert.ok(!('name' in profile), 'the CV profile must not carry the student\'s name');
    assert.ok(!JSON.stringify(profile).includes('Rina'));
    assert.ok(!JSON.stringify(profile).includes('Adi'));
  }
});

test('the intake asks a student what it needs and refuses what it cannot use', async () => {
  const { normalizeIntake, validateIntake } = await import('./cvService.js');
  const student = (extra) => ({ userType: 'student', name: 'Rina', ...extra });
  assert.throws(() => validateIntake(student({ name: '  ', studyStatus: 'grade12' })), /enter your name/);
  assert.throws(() => validateIntake(student({ studyStatus: '' })), /Grade 12 or at university/);
  assert.throws(() => validateIntake(student({ studyStatus: 'postgrad' })), /Grade 12 or at university/);
  // A university student has a major already; a Grade 12 student may not.
  assert.throws(() => validateIntake(student({ studyStatus: 'university', major: ' ' })), /major you are taking/);
  assert.doesNotThrow(() => validateIntake(student({ name: 'Adi', studyStatus: 'grade12', major: '' })));
  assert.throws(() => validateIntake(student({ name: 'R'.repeat(81), studyStatus: 'grade12' })), /80 characters/);

  assert.deepEqual(normalizeIntake({ userType: 'student', name: '  Rina  ', studyStatus: 'grade12', major: '  Nursing ' }), {
    userType: 'student', name: 'Rina', studyStatus: 'grade12', studyStatusLabel: 'Student · Grade 12', major: 'Nursing',
  });
});

test('someone changing direction is never asked which school year they are in', async () => {
  const { normalizeIntake, validateIntake, withIntake } = await import('./cvService.js');
  // They are not at school, so there is no honest answer to give.
  assert.doesNotThrow(() => validateIntake({ userType: 'professional', name: 'Budi' }));
  assert.throws(() => validateIntake({ userType: 'professional', name: '' }), /enter your name/);
  assert.throws(() => validateIntake({ name: 'Budi', studyStatus: 'grade12' }), /student or changing direction/);

  const intake = normalizeIntake({ userType: 'professional', name: 'Budi', studyStatus: 'grade12', major: 'Law' });
  // Study fields are dropped rather than carried: they would be fiction for this person.
  assert.deepEqual(intake, { userType: 'professional', name: 'Budi', studyStatus: '', studyStatusLabel: '', major: '' });

  const merged = withIntake({ summary: 'Parsed CV', skills: [] }, { userType: 'professional', name: 'Budi' });
  assert.equal(merged.summary, 'Parsed CV');
  assert.equal(merged.userType, 'professional');
  assert.ok(!('name' in merged), 'the name must never reach the profile that is posted to the server');
});

test('the CV profile carries the audience and study stage, never the name', async () => {
  const { withIntake } = await import('./cvService.js');
  const merged = withIntake({ summary: 'Parsed CV', skills: [] }, { userType: 'student', name: 'Rina', studyStatus: 'grade12', major: 'Nursing' });
  assert.equal(merged.userType, 'student');
  assert.equal(merged.studyStatus, 'grade12');
  assert.equal(merged.major, 'Nursing');
  assert.ok(!JSON.stringify(merged).includes('Rina'));
});
