import { BaziCard, DemoBadge, QuestComplete, ScoreBar } from './components.jsx';
import { INTEREST_ATTRIBUTION, READINESS_ATTRIBUTION, WORK_VALUES } from '../business/questionnaireBank.js';

const TYPE_NAMES = { R: 'Realistic', I: 'Investigative', A: 'Artistic', S: 'Social', E: 'Enterprising', C: 'Conventional' };
const MATCH_LABEL = { strong: 'Strong match', good: 'Good match', some: 'Some match' };
const HORIZON = { now: 'Hiring now', 2030: 'Growing to 2030', 2035: 'Emerging by 2035' };
const SCOPE = { global: 'Global', US: 'US projection', ID: 'Indonesia' };
const REGION = { ID: 'Indonesia' };
// ISCO-08 major groups in plain words. The order is deliberate: showing professional work
// first and trades last would repeat the ranking this section exists to avoid.
const KINDS_OF_WORK = [
  ['blue', 'Hands-on and skilled trades', 'Building, repairing, growing, driving, operating'],
  ['white', 'Professional, technical and office', 'Analysing, designing, advising, administering'],
  ['service', 'Service and people-facing', 'Caring, hosting, selling, protecting'],
];
const joinNames = (ids) => ids.map((id) => TYPE_NAMES[id] || id).join(', ').replace(/, ([^,]*)$/, ' and $1');

export function ResultScreen({ result, onFinish, onBack, onOpenBazi }) {
  if (!result) {
    return (
      <section className="page page-narrow">
        <div className="error-state">
          <span className="eyebrow">YOUR RESULTS</span>
          <p>Complete the questionnaire to see your results.</p>
          <button className="button button-secondary" onClick={onBack}>Return to questionnaire</button>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-narrow">
      <div className="page-topline">
        <QuestComplete number="01" label="Sample questionnaire" />
        <DemoBadge show={result.isDemo} />
      </div>
      <h1 className="page-title">Results · your interests</h1>
      {(() => {
        const flags = result.flags || [];
        const tied = result.topTypes || [];
        if (flags.includes('flat_profile') || flags.includes('low_interest_overall')) {
          return (
            <p className="result-note">
              Your interest pattern isn’t clear yet. That’s common: try a short course, an internship or a club,
              then take the questionnaire again.
            </p>
          );
        }
        if (tied.length > 1) {
          return (
            <p className="interest-code">
              Equally strong: <strong>{tied.join(' = ')}</strong> · {joinNames(tied)}. No single one comes first.
            </p>
          );
        }
        return <p className="interest-code">Interest code: <strong>{result.interestCode}</strong></p>;
      })()}
      {(result.flags || []).includes('straight_lined') && (
        <p className="result-note">
          You gave the same answer to every activity, so this profile may say more about the format than about you.
          Consider retaking it with your first instinct on each one.
        </p>
      )}

      <div className="card">
        <div className="bar-chart">
          {result.chart.map((item) => (
            <div className="bar-row" key={item.label}>
              <span className="bar-label">
                <b>{item.id || item.label.charAt(0)}</b> {item.label}
              </span>
              <ScoreBar value={item.value} max={item.max} label={`${item.label}: ${item.value} of ${item.max}`} />
              <span className="bar-value">{item.value}<span>/{item.max}</span></span>
            </div>
          ))}
        </div>
      </div>

      {result.explanation && (
        <div className="card explanation-card">
          <span className="eyebrow">GEMINI EXPLANATION</span>
          <p>{result.explanation}</p>
          <small>Gemini explains results; it does not pass verdicts.</small>
        </div>
      )}

      {result.readiness && (
        <div className="card">
          <div className="card-heading">
            <span className="eyebrow">CAREER READINESS (CAAS)</span>
            <strong>{result.readiness.average.toFixed(1)}<span>/5 average</span></strong>
          </div>
          <div className="bar-chart">
            {result.readiness.dimensions.map((dimension) => (
              <div className={`bar-row${(result.readiness.lowest || []).includes(dimension.id) ? ' is-lowest' : ''}`} key={dimension.id}>
                <span className="bar-label">{dimension.label}</span>
                <ScoreBar value={dimension.value} max={dimension.max} label={`${dimension.label}: ${dimension.value} of 5`} />
                <span className="bar-value">{dimension.value.toFixed(1)}<span>/5</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(result.goals?.workValues) && result.goals.workValues.length > 0 && (
        <p className="result-note">
          What matters most to you in a job:{' '}
          <strong>{result.goals.workValues.map((value) => WORK_VALUES.find((item) => item.value === value)?.label || value).join(', ')}</strong>.
          Your career directions will use this to choose between similar options.
        </p>
      )}

      {result.readiness?.lowest?.length > 0 && (
        <p className="result-note">
          Grow first: {result.readiness.lowest.map((id) => result.readiness.dimensions.find((d) => d.id === id)?.label.toLowerCase()).join(' and ')}.
        </p>
      )}

      {result.jobs?.top?.length > 0 && (
        <div className="card">
          <div className="card-heading">
            <span className="eyebrow">AI-ERA JOBS THAT FIT YOUR INTERESTS</span>
          </div>
          {result.jobs.lowConfidence && (
            <p className="result-note">Your interest pattern isn’t clear yet, so treat these as starting points to explore.</p>
          )}
          <ul className="job-list">
            {result.jobs.top.map((job) => (
              <li className="job-item" key={job.key}>
                <div className="job-head">
                  <strong>{job.title}</strong>
                  <span className="job-match">{MATCH_LABEL[job.match]}</span>
                </div>
                <p className="job-meta">
                  {HORIZON[job.horizon]}, {job.confidence} confidence. Interest code <span className="nowrap">{job.riasec}</span>.
                </p>
                {job.why && <p className="job-why">{job.why}</p>}
                <details>
                  <summary>Majors and sources</summary>
                  {job.majors?.length > 0 && <p><b>Majors to look at:</b> {job.majors.join(', ')}</p>}
                  {job.regionalNotes?.map((note) => (
                    <p key={note.region}><b>{REGION[note.region] || note.region}:</b> {note.text}</p>
                  ))}
                  <ul>
                    {job.sources?.map((source) => (
                      <li key={source.url}>
                        <span className="muted">{SCOPE[source.scope] || ''}</span>{' · '}
                        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              </li>
            ))}
          </ul>
          <small className="muted">
            Match is about what you’d enjoy, not what you’re able to do. Ranked by a fixed formula over {result.jobs.of} sourced jobs.
          </small>
        </div>
      )}

      {result.worldOfWork?.byKindOfWork && (
        <div className="card world-of-work">
          <div className="card-heading">
            <span className="eyebrow">WHERE YOU FIT IN THE WHOLE WORLD OF WORK</span>
          </div>
          <p className="result-note">
            The list above is AI-era jobs that are growing. This one is every kind of work there is:
            all {result.worldOfWork.of} occupation groups in the ILO’s international standard, from
            surgeons to welders. Each column is the closest fit of its kind — not a ranking between them.
          </p>
          <div className="kind-grid">
            {KINDS_OF_WORK.map(([collar, label, examples]) => {
              const matches = result.worldOfWork.byKindOfWork[collar] || [];
              if (matches.length === 0) return null;
              return (
                <section className="kind-column" key={collar}>
                  <h3>{label}</h3>
                  <p className="kind-examples">{examples}</p>
                  <ul>
                    {matches.map((occupation) => (
                      <li key={occupation.isco}>
                        <strong>{occupation.title}</strong>
                        <span className="kind-meta">
                          {MATCH_LABEL[occupation.match]} · <span className="nowrap">{occupation.riasec}</span>
                          {/* The interest code for this group was inferred from neighbouring
                              occupations rather than measured, so it is marked instead of
                              being quietly presented as the same quality of evidence. */}
                          {occupation.confidence === 'low' && <em className="kind-check"> · to check</em>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
          <small className="muted">
            Ranked over all {result.worldOfWork.of} ISCO-08 occupation groups by comparing your
            interest profile with each occupation’s, derived from O*NET interest data. Anything
            marked <em>to check</em> was inferred from neighbouring occupations rather than measured.
            Treat a single title as a prompt to look into, not a verdict.
          </small>
        </div>
      )}

      <BaziCard title="BaZi reflection · optional, separate">
        A cultural reflection on how you tend to work. It is never used in your scores or
        recommendations, and it is calculated in your browser only.
        {onOpenBazi && (
          <>
            {' '}
            <button type="button" className="text-button" onClick={onOpenBazi}>
              Open the reflection →
            </button>
          </>
        )}
      </BaziCard>

      <button className="button button-primary button-wide" onClick={onFinish}>
        Finish →
      </button>

      <footer className="attribution">
        <p>{INTEREST_ATTRIBUTION}</p>
        <p>{READINESS_ATTRIBUTION}</p>
        <p>
          Job growth evidence: World Economic Forum Future of Jobs Report 2025 (global), US Bureau of Labor Statistics
          and O*NET (US projections), LinkedIn, plus country sources where noted.
          Occupation coverage: ILO ISCO-08 (436 unit groups) with interest codes derived from O*NET 29.1.
          {result.scoringVersion ? ` Scoring version ${result.scoringVersion}.` : ''}
        </p>
      </footer>
    </section>
  );
}
