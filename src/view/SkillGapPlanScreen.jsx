import { useSkillGapPlanPresenter } from '../presenter/useSkillGapPlanPresenter.js';
import { DemoBadge, ErrorState, LoadingState, ScoreBar } from './components.jsx';

const ORDINALS = ['1st', '2nd', '3rd', '4th'];

function statusText(row) {
  if (row.status === 'priority') return `priority ${ORDINALS[row.priorityRank - 1] || row.priorityRank}`;
  if (row.status === 'not-in-plan') return 'not in plan';
  return row.status;
}

export function SkillGapPlanScreen({ onBack, onChangeDirection }) {
  const state = useSkillGapPlanPresenter();

  return (
    <section className="page page-wide">
      <div className="page-topline">
        <button className="text-button" onClick={onBack}>← Back to journey</button>
        <DemoBadge show={state.plan?.isDemo} />
      </div>
      <span className="eyebrow">QUEST 04 · SKILL GAP + 30-DAY PLAN</span>

      {state.status === 'loading' && <LoadingState label="Comparing your scores with what the job requires…" />}
      {state.status === 'error' && (
        <ErrorState title="WE COULDN’T PREPARE YOUR PLAN" message={state.error} onBack={onBack} onRetry={state.retry} />
      )}
      {state.status === 'ready' && <PlanReport plan={state.plan} onChangeDirection={onChangeDirection} />}
    </section>
  );
}

function PlanReport({ plan, onChangeDirection }) {
  const scoredRows = plan.skills.filter((row) => row.status !== 'not-in-plan');
  return (
    <>
      <h1 className="page-title">Skill gap · {plan.targetJob}</h1>
      <button className="text-button" onClick={onChangeDirection}>Choose a different direction</button>

      <div className="split-layout split-even">
        <div className="card">
          <div className="card-heading">
            <span className="eyebrow">SHOWN · GAP TO REQUIRED LEVEL</span>
            <strong>{plan.priorityCount}<span>/{scoredRows.length} priority</span></strong>
          </div>
          <div className="gap-list">
            {plan.skills.map((row) => (
              <div className={`gap-row gap-${row.status}`} key={row.skillId}>
                <div className="skill-topline">
                  <strong>{row.label}</strong>
                  <span>{row.shown}/{row.required} · {statusText(row)}</span>
                </div>
                <ScoreBar
                  value={row.shown}
                  max={5}
                  marker={row.required}
                  label={`${row.label}: shown ${row.shown}, required ${row.required}`}
                />
              </div>
            ))}
          </div>
          <p className="fine-print legend"><i className="legend-marker" /> required level</p>
          {plan.evidence?.quote && (
            <div className="evidence-box">
              <span className="eyebrow">EVIDENCE · {plan.evidence.skillLabel}</span>
              <blockquote className="evidence-quote">“{plan.evidence.quote}”</blockquote>
              {plan.evidence.note && <p>{plan.evidence.note}</p>}
            </div>
          )}
        </div>

        <div className="card">
          <span className="eyebrow">30-DAY LEARNING PLAN</span>
          <p className="lede">{plan.plan.summary}</p>
          <ol className="plan-list">
            {plan.plan.phases.map((phase) => (
              <li key={phase.label}>
                <strong>{phase.label} · {phase.focus}</strong>
                <ul>
                  {phase.actions.map((action) => <li key={action}>{action}</li>)}
                </ul>
              </li>
            ))}
          </ol>
          {plan.plan.note && <p className="fine-print">{plan.plan.note}</p>}
        </div>
      </div>

      <details className="card requirement-details">
        <summary>Where the “required” level comes from</summary>
        <p className="fine-print">
          {plan.occupation.title && `Closest O*NET occupation: ${plan.occupation.code} ${plan.occupation.title}. `}
          Required = round(1 + Level × 4/7). Gap = Required − Shown. Priority = Gap × Importance.
          Skills with Importance below 3 are left out of the plan; strengths are not retrained.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Simulation skill</th><th>O*NET element</th><th>Importance</th><th>Level</th>
                <th>Required</th><th>Shown</th><th>Gap</th><th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {plan.skills.map((row) => (
                <tr key={row.skillId}>
                  <td>{row.label}</td>
                  <td>{row.onetElement}</td>
                  <td>{row.importance.toFixed(1)}</td>
                  <td>{row.level.toFixed(1)}</td>
                  <td>{row.required}</td>
                  <td>{row.shown}</td>
                  <td>{row.gap}</td>
                  <td>{row.status === 'priority' ? `${row.priority.toFixed(1)} · ${ORDINALS[row.priorityRank - 1]}` : statusText(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {plan.occupation.source && <p className="fine-print">{plan.occupation.source}</p>}
      </details>
    </>
  );
}
