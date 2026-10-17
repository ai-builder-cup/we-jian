import { useRef, useState } from 'react';
import {
  MAX_CV_SIZE_BYTES,
  MAX_MAJOR_LENGTH,
  MAX_NAME_LENGTH,
  STUDY_STATUSES,
  USER_TYPES,
  findStudyStatus,
} from '../business/cvService.js';
import { useCvUploadPresenter } from '../presenter/useCvUploadPresenter.js';

// The two people this app serves ask different questions, so they get different first screens
// rather than one screen that half-fits both. A student should never have to scroll past a CV
// uploader they cannot use to find their own way in.
const INTRO = {
  none: {
    heading: <>Start with your<br /><span className="title-highlight">story.</span></>,
    lede: 'Two kinds of people come here: students working out what to aim for, and people already working who want to go somewhere new. Tell us which you are and the journey adapts.',
    note: 'First, where are you starting from?',
  },
  student: {
    heading: <>Start with your<br /><span className="title-highlight">story.</span></>,
    lede: 'No CV needed. Your questionnaire and work simulation do the work, and we match what you show against every kind of job there is.',
    note: 'First, let’s get to know you',
  },
  professional: {
    heading: <>Start with what you’ve<br /><span className="title-highlight">already done.</span></>,
    lede: 'Your CV is the starting point, not the verdict. We read it for what transfers, then show you where it could take you next and what you would need to add.',
    note: 'First, let’s read your experience',
  },
};

export function CvUploadScreen({ onSuccess }) {
  const inputRef = useRef(null);
  const [userType, setUserType] = useState('');
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [name, setName] = useState('');
  const [studyStatus, setStudyStatus] = useState('');
  const [major, setMajor] = useState('');
  const [addCv, setAddCv] = useState(false);
  const presenter = useCvUploadPresenter(onSuccess);
  const busy = presenter.status === 'uploading';

  const intake = { userType, name, studyStatus, major };
  const status = findStudyStatus(studyStatus);
  const isStudent = userType === 'student';
  const intro = INTRO[userType] || INTRO.none;
  // Grade 12 students may not have picked a major yet; university students already have one.
  const detailsReady = Boolean(name.trim()) && (isStudent
    ? Boolean(status) && (studyStatus !== 'university' || Boolean(major.trim()))
    : true);
  const cvReady = Boolean(file) && consent;

  function chooseFile(selected) {
    setFile(selected?.[0] || null);
  }

  function handleDrop(event) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files);
  }

  function choosePath(value) {
    setUserType(value);
    // Someone switching paths should not carry the other path's half-filled answers with them.
    setStudyStatus('');
    setMajor('');
    setFile(null);
    setConsent(false);
    setAddCv(false);
  }

  const dropzone = (
    <>
      <button
        className={`cv-dropzone${file ? ' has-file' : ''}`}
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        disabled={busy}
      >
        <span className="upload-arrow" aria-hidden="true">↑</span>
        {file ? (
          <>
            <strong>{file.name}</strong>
            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB · Click to choose another file</span>
          </>
        ) : (
          <>
            <strong>Choose a file or drag it here</strong>
            <span>PDF only · {(MAX_CV_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB maximum</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept="application/pdf,.pdf"
        aria-label="Choose a CV PDF"
        onChange={(event) => chooseFile(event.target.files)}
      />
      <label className="cv-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={busy}
        />
        <span>
          I agree to have my CV processed by Google Gemini on Google Cloud (Vertex AI) to extract
          career-related information. I will not upload confidential information.
        </span>
      </label>
      <div className="cv-privacy-note">
        <span aria-hidden="true">⌑</span>
        <p>We only save the extracted career profile in this browser. Your original CV is not stored by this app after parsing.</p>
      </div>
    </>
  );

  return (
    <section className="cv-onboarding">
      <div className="cv-intro">
        <span className="eyebrow">YOUR FIRST QUEST</span>
        <h1>{intro.heading}</h1>
        <p>{intro.lede}</p>
        <div className="cv-step-note"><span>01</span> {intro.note}</div>
      </div>

      <div className="cv-cards">
        <div className="cv-upload-card">
          <div className="cv-card-heading">
            <span className="cv-file-icon" aria-hidden="true">01</span>
            <div>
              <span className="eyebrow">WHERE YOU ARE STARTING</span>
              <h2>Which one is you?</h2>
            </div>
          </div>
          <div className="path-options">
            {USER_TYPES.map((option) => (
              <button
                type="button"
                key={option.value}
                className={`path-option${userType === option.value ? ' is-selected' : ''}`}
                aria-pressed={userType === option.value}
                onClick={() => choosePath(option.value)}
                disabled={busy}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        {isStudent && (
          <div className="cv-upload-card">
            <div className="cv-card-heading">
              <span className="cv-file-icon" aria-hidden="true">02</span>
              <div>
                <span className="eyebrow">STUDENT</span>
                <h2>Where you are now</h2>
              </div>
            </div>
            <p className="cv-about-lede">
              Choosing what to study and choosing how to start working are different questions.
              Telling us which one you are facing changes what we suggest.
            </p>

            <label className="cv-field">
              <span>Your name</span>
              <input
                type="text"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                autoComplete="given-name"
                placeholder="What should we call you?"
                onChange={(event) => setName(event.target.value)}
                disabled={busy}
              />
            </label>

            <fieldset className="cv-status">
              <legend>Your status</legend>
              <div className="cv-status-options">
                {STUDY_STATUSES.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`cv-status-option${studyStatus === option.value ? ' is-selected' : ''}`}
                    aria-pressed={studyStatus === option.value}
                    onClick={() => setStudyStatus(option.value)}
                    disabled={busy}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="cv-field">
              <span>
                {status ? status.majorLabel : 'Your major'}
                {status?.majorHint && <small> {status.majorHint}</small>}
              </span>
              <input
                type="text"
                value={major}
                maxLength={MAX_MAJOR_LENGTH}
                placeholder={status ? status.majorPlaceholder : 'Choose your status first'}
                onChange={(event) => setMajor(event.target.value)}
                disabled={busy || !status}
              />
            </label>

            {presenter.error && <p className="error-message cv-error" role="alert">{presenter.error}</p>}

            <button
              className="button button-primary cv-submit"
              disabled={!detailsReady || busy || (addCv && !cvReady)}
              onClick={() => (addCv ? presenter.upload(file, consent, intake) : presenter.start(intake))}
            >
              {busy ? <><span className="button-spinner" /> Reading your story…</> : 'Start my journey →'}
            </button>
            {!detailsReady && <p className="cv-skip-hint">Fill in your name and status to continue.</p>}

            {/* Optional, and visibly secondary: most students have no CV, but a university
                student with internships should not have to pretend otherwise. */}
            <div className="cv-skip">
              {addCv ? (
                <>
                  <h3>Your CV</h3>
                  {dropzone}
                  <button type="button" className="text-button" onClick={() => { setAddCv(false); setFile(null); setConsent(false); }} disabled={busy}>
                    ← Continue without a CV instead
                  </button>
                </>
              ) : (
                <>
                  <h3>Already have a CV?</h3>
                  <p>Most students don’t, and you don’t need one. If you have internships or part-time work on paper, adding it gives us more to work with.</p>
                  <button type="button" className="button button-secondary cv-skip-button" onClick={() => setAddCv(true)} disabled={busy}>
                    Add my CV
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {userType === 'professional' && (
          <div className="cv-upload-card">
            <div className="cv-card-heading">
              <span className="cv-file-icon" aria-hidden="true">02</span>
              <div>
                <span className="eyebrow">CAREER CHANGE IN THE AI ERA</span>
                <h2>Your next move</h2>
              </div>
            </div>
            <p className="cv-about-lede">
              Your CV tells us what you can already do. The questionnaire and simulation tell us
              what you would enjoy and what you show under pressure. The directions come from all three.
            </p>

            <label className="cv-field">
              <span>Your name</span>
              <input
                type="text"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                autoComplete="given-name"
                placeholder="What should we call you?"
                onChange={(event) => setName(event.target.value)}
                disabled={busy}
              />
            </label>

            {dropzone}
            {presenter.error && <p className="error-message cv-error" role="alert">{presenter.error}</p>}
            <button
              className="button button-primary cv-submit"
              disabled={!detailsReady || !cvReady || busy}
              onClick={() => presenter.upload(file, consent, intake)}
            >
              {busy ? <><span className="button-spinner" /> Reading your story…</> : 'Upload CV & continue →'}
            </button>
            {!detailsReady && <p className="cv-skip-hint">Enter your name to continue.</p>}
            <p className="cv-powered">Secure server-side parsing · Gemini on Google Cloud</p>
          </div>
        )}
      </div>
    </section>
  );
}
