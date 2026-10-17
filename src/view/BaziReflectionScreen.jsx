import { useState } from 'react';
import { BaziCard, ErrorState, LoadingState } from './components.jsx';
import { BaziRadar } from './BaziRadar.jsx';
import { computeBaziReflection, narrationPayload } from '../business/bazi/index.js';
import { explainBaziReflection } from '../network/baziApi.js';

// Optional, separate, and never scored. Three deliberate choices here:
//
// 1. Consent comes BEFORE the form. Birth date is the most sensitive field the
//    app collects, so nobody is asked for it before being told what it is used
//    for and what it is never used for.
// 2. The whole engine runs in this browser. The date is not posted anywhere,
//    not stored in Firestore, and not sent to Gemini. Only finished labels go
//    to the server for an optional written explanation.
// 3. This is NOT a quest. It stays out of the journey and the progress meter,
//    because anything inside the journey reads as something that counts.

const STAGE = { CONSENT: 'consent', FORM: 'form', RESULT: 'result' };

function Row({ label, value, provisional, note }) {
  return (
    <div className="bazi-row">
      <span className="bazi-row-label">
        {label}
        {provisional && <em className="bazi-provisional" title="Not yet validated against real people">to check</em>}
      </span>
      <span className="bazi-row-value">{value}</span>
      {note && <small className="bazi-row-note">{note}</small>}
    </div>
  );
}

export function BaziReflectionScreen({ onBack }) {
  const [stage, setStage] = useState(STAGE.CONSENT);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [reflection, setReflection] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function submit(event) {
    event.preventDefault();
    setError(null);
    let computed;
    try {
      computed = computeBaziReflection({ date, time });
    } catch (problem) {
      setError(problem.message);
      return;
    }
    setReflection(computed);
    setStage(STAGE.RESULT);

    // The written explanation is a bonus. If it fails, the structured reflection
    // still stands on its own, so the failure is shown quietly rather than
    // replacing the result with an error screen.
    setBusy(true);
    explainBaziReflection(narrationPayload(computed))
      .then((text) => setExplanation(text))
      .catch(() => setExplanation(null))
      .finally(() => setBusy(false));
  }

  if (stage === STAGE.CONSENT) {
    return (
      <section className="page page-narrow">
        <span className="eyebrow">OPTIONAL · SEPARATE FROM YOUR RESULTS</span>
        <h1 className="page-title">BaZi reflection</h1>
        <p className="lede">
          A cultural reflection on how you tend to work. It is entirely optional, and you can
          finish your journey without it.
        </p>

        <div className="card">
          <strong>What this is used for</strong>
          <ul className="bazi-consent-list">
            <li>A reflection for you to read, think about, and disagree with.</li>
            <li>Nothing else.</li>
          </ul>
          <strong>What it is never used for</strong>
          <ul className="bazi-consent-list">
            <li>Your questionnaire scores, your simulation grades, or your ranked career directions.</li>
            <li>Your skill gap or your 30-day plan.</li>
            <li>Any recommendation this app makes about you, anywhere.</li>
          </ul>
          <strong>Where your birth details go</strong>
          <ul className="bazi-consent-list">
            <li>Nowhere. The reflection is calculated inside this browser.</li>
            <li>Your birth date is never sent to our server, never saved, and never sent to the AI.</li>
            <li>Only the resulting labels are sent, and only if you want a written explanation.</li>
          </ul>
        </div>

        <BaziCard title="Why this is kept separate">
          A birth date is an age. Anything derived from it is kept away from every score and
          ranking on purpose, so that age can never influence an opportunity.
        </BaziCard>

        <div className="button-row">
          <button className="button button-secondary" onClick={onBack}>Not now</button>
          <button className="button button-primary" onClick={() => setStage(STAGE.FORM)}>
            I understand, continue →
          </button>
        </div>
      </section>
    );
  }

  if (stage === STAGE.FORM) {
    return (
      <section className="page page-narrow">
        <span className="eyebrow">OPTIONAL · STAYS IN THIS BROWSER</span>
        <h1 className="page-title">Your birth details</h1>
        <p className="lede">
          Use local time at your place of birth. If you only know roughly, the hour reading will be
          less reliable, and the rest still works.
        </p>

        <form className="card" onSubmit={submit}>
          <label className="field">
            <span className="field-label">Date of birth</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field">
            <span className="field-label">Time of birth (local)</span>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </label>
          {error && <p className="error-message" role="alert">{error}</p>}
          <div className="button-row">
            <button type="button" className="button button-secondary" onClick={onBack}>Cancel</button>
            <button type="submit" className="button button-primary">Show my reflection →</button>
          </div>
        </form>
      </section>
    );
  }

  if (!reflection) return <ErrorState title="SOMETHING WENT WRONG" message="No reflection was produced." onBack={onBack} />;

  const { archetype, blueprint, reading } = reflection;
  // Gemini writes the same 250-300 word brief when it is reachable; the composed
  // one is not a stub but a full reading, so the page never degrades to nothing.
  const narrative = explanation ?? reading.paragraphs.slice(0, -1).join('\n\n');
  const narrativeSource = explanation ? 'Written by Gemini from your structured results' : 'Composed from your structured results';

  return (
    <section className="page page-narrow">
      <span className="eyebrow">OPTIONAL · NOT PART OF YOUR SCORES</span>
      <h1 className="page-title">Your BaZi reflection</h1>

      {/* ── VISUAL SIGNATURE ───────────────────────────────────────────── */}
      <div className="card">
        <span className="eyebrow">YOUR WORK STRUCTURE</span>
        <BaziRadar shares={reflection.shares} dayMaster={reflection.dayMaster} />
      </div>

      {/* ── THE READING ────────────────────────────────────────────────── */}
      <div className="card">
        <span className="eyebrow">THE READING</span>
        {busy && !explanation && <LoadingState label="Writing your reading…" />}
        {!busy && narrative.split('\n\n').map((para, index) => (
          <p key={index} className="bazi-narration">{para}</p>
        ))}
        {!busy && <small className="fine-print">{narrativeSource} · {reading.words} words</small>}
      </div>

      {/* ── 1. CHARACTER BLUEPRINT ─────────────────────────────────────── */}
      <div className="card">
        <span className="eyebrow">CHARACTER BLUEPRINT · HOW YOU WORK</span>
        {blueprint.rows.map((row) => (
          <div key={row.id} className="bazi-row">
            <span className="bazi-row-label">
              {row.label}
              {row.provisional && <em className="bazi-provisional" title="Not yet validated against real people">to check</em>}
            </span>
            <span className="bazi-row-value">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Strengths and costs shown SEPARATELY and with equal weight. Folding the
          cost into a footnote is how a blueprint quietly becomes flattery. */}
      <div className="bazi-two-col">
        <div className="card bazi-strengths">
          <span className="eyebrow">STRENGTHS AT WORK</span>
          <ul className="bazi-list">
            {blueprint.strengths.map((item) => (
              <li key={item.from}>
                <strong>{item.from}</strong>
                {item.provisional && <em className="bazi-provisional">to check</em>}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card bazi-watchouts">
          <span className="eyebrow">WHAT TO WATCH</span>
          <ul className="bazi-list">
            {blueprint.watchOuts.map((item) => (
              <li key={item.from}>
                <strong>{item.from}</strong>
                {item.provisional && <em className="bazi-provisional">to check</em>}
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── 2. CAREER DIRECTION + INDUSTRIES ───────────────────────────── */}
      {archetype && (
        <div className="card">
          <span className="eyebrow">CAREER DIRECTION</span>
          <h2 className="bazi-archetype">{archetype.name}</h2>
          <p className="bazi-environment">{archetype.environment}</p>
          {archetype.note && <p className="bazi-archetype-note">{archetype.note}</p>}
        </div>
      )}

      <div className="card">
        <span className="eyebrow">INDUSTRIES THAT SUIT THIS PATTERN</span>
        <div className="chip-list">
          {reflection.sectors.map((sector) => <span key={sector} className="chip">{sector}</span>)}
        </div>
        <small className="fine-print">
          A reflection only. Your ranked career directions come from your questionnaire, your
          simulation, and your CV, and are not affected by anything on this page.
        </small>
      </div>

      {/* ── CONCLUSION ──────────────────────────────────────────────── */}
      <div className="card bazi-conclusion">
        <span className="eyebrow">IN CONCLUSION</span>
        <p>{reading.conclusion}</p>
      </div>

      <BaziCard title="How much weight to give this">
        Items marked <em>to check</em> are not yet validated against real people: treat them as
        questions about yourself, not findings. Everything here is a reflection, and you are the
        one who decides whether it fits.
      </BaziCard>

      <div className="button-row">
        <button className="button button-secondary" onClick={() => setStage(STAGE.FORM)}>Change details</button>
        <button className="button button-primary" onClick={onBack}>Back to journey</button>
      </div>
    </section>
  );
}
