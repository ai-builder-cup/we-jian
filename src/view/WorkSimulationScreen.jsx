import { useWorkSimulationPresenter } from '../presenter/useWorkSimulationPresenter.js';
import { DemoBadge, QuestComplete, ScoreBar } from './components.jsx';

export function WorkSimulationScreen({ onBack }) {
  const presenter = useWorkSimulationPresenter();

  if (presenter.phase === 'results' && presenter.result) {
    return <SimulationResults result={presenter.result} onFinish={onBack} />;
  }
  if (presenter.phase === 'active' && presenter.task) {
    return <SimulationTask presenter={presenter} onPause={onBack} />;
  }
  return <SimulationIntro presenter={presenter} onBack={onBack} />;
}

// PDF p.20: user intro screen.
function SimulationIntro({ presenter, onBack }) {
  return (
    <section className="page page-narrow">
      <div className="page-topline">
        <button className="text-button" onClick={onBack}>← Back to journey</button>
      </div>
      <span className="eyebrow">QUEST 02 · WORK SIMULATION</span>
      <h1 className="page-title">AI Quality Evaluator</h1>
      <p className="lede">
        A customer-support chatbot has made some mistakes. Review its work, decide what to do, and explain it to your manager.
      </p>
      <div className="card intro-promise">
        <p>“There is no pass or fail here. The more honest your answers, the better your learning plan.”</p>
        <ul className="fact-list">
          <li>◷ Takes about 15 minutes</li>
          <li>⌑ Your results are yours, never shared without consent</li>
          <li>❚❚ Pause anytime</li>
          <li>✎ Work in your own way</li>
        </ul>
      </div>
      {presenter.error && <p className="error-message">{presenter.error}</p>}
      <button className="button button-primary button-wide" onClick={presenter.begin} disabled={presenter.status === 'loading'}>
        {presenter.status === 'loading'
          ? 'Preparing your simulation…'
          : presenter.hasDraft ? 'Resume simulation →' : 'Start simulation →'}
      </button>
    </section>
  );
}

function SimulationTask({ presenter, onPause }) {
  const { session, task, step, conversation, answers, stepIndex, totalSteps } = presenter;
  const response = answers[task.id];
  const isLast = stepIndex === totalSteps - 1;
  const busy = presenter.status === 'submitting' || presenter.status === 'asking';

  return (
    <section className="page page-wide">
      <div className="page-topline">
        <button className="text-button" onClick={onPause}>← Pause &amp; save</button>
        <DemoBadge show={presenter.isDemo} />
      </div>
      <div className="progress-heading">
        <span className="section-progress">
          Simulation · task {step.taskIndex + 1} of {session.tasks.length}
          {conversation && ` · conversation ${step.conversationIndex + 1} of ${session.conversations.length}`}
        </span>
        <span><strong>{stepIndex}</strong>/{totalSteps} steps</span>
      </div>
      <div className="progress-track" role="progressbar" aria-label="Simulation progress" aria-valuemin="0" aria-valuemax={totalSteps} aria-valuenow={stepIndex}>
        <span style={{ width: `${(stepIndex / totalSteps) * 100}%` }} />
      </div>

      <div className="split-layout">
        <div className="card simulation-card slide-forward" key={stepIndex}>
          <h1 className="card-title">{task.title}</h1>
          <p className="lede">{task.instruction}</p>

          {conversation && (
            <ConversationStep
              policy={session.policy}
              conversation={conversation}
              value={response[conversation.id] || ''}
              onChange={(value) => presenter.updateAnswer(task.id, { [conversation.id]: value })}
            />
          )}
          {task.id === 'escalation-decision' && (
            <EscalationStep
              conversations={session.conversations}
              response={response}
              onChange={(update) => presenter.updateAnswer(task.id, update)}
            />
          )}
          {task.id === 'rewrite-instructions' && (
            <>
              <PolicyBox policy={session.policy} />
              <TextField
                label="Your improved chatbot instructions"
                placeholder="Before offering a refund, check… When an order is more than 3 days late…"
                value={response.instructions}
                onChange={(value) => presenter.updateAnswer(task.id, { instructions: value })}
                rows={6}
              />
            </>
          )}
          {task.id === 'manager-explanation' && (
            <ManagerStep task={task} response={response} presenter={presenter} />
          )}

          {presenter.error && <p className="error-message">{presenter.error}</p>}
          <div className="action-row">
            <button className="button button-secondary" onClick={presenter.back} disabled={busy}>
              ← {stepIndex === 0 ? 'Intro' : 'Previous'}
            </button>
            <button className="button button-primary" onClick={presenter.next} disabled={!presenter.canContinue || busy}>
              {presenter.status === 'submitting'
                ? 'Scoring 3 times for consistency…'
                : isLast ? 'Submit simulation →' : 'Next →'}
            </button>
          </div>
        </div>

        <aside className="side-panel">
          <div className="card">
            <span className="eyebrow">4 TASKS</span>
            <ol className="task-list">
              {session.tasks.map((item, index) => (
                <li key={item.id} className={`task-${presenter.taskStates[index]}`}>
                  <span aria-hidden="true">{presenter.taskStates[index] === 'done' ? '✓' : index + 1}</span>
                  {item.title}
                </li>
              ))}
            </ol>
          </div>
          <div className="card">
            <span className="eyebrow">SKILLS ASSESSED</span>
            <ul className="plain-list">
              {session.skills.map((skill) => <li key={skill.id}>{skill.label}</li>)}
            </ul>
            <small className="fine-print">
              1–5 scores from a fixed rubric, with required evidence quotes, checked 3 times for consistency.
            </small>
          </div>
        </aside>
      </div>
    </section>
  );
}

function PolicyBox({ policy }) {
  return (
    <div className="policy-box">
      <span className="eyebrow">POLICY INFO</span>
      <p>{policy.join(' ')}</p>
    </div>
  );
}

function ConversationStep({ policy, conversation, value, onChange }) {
  return (
    <>
      <PolicyBox policy={policy} />
      <div className="chat">
        <div className="bubble bubble-customer"><b>Customer:</b> {conversation.customer}</div>
        <div className="bubble bubble-bot"><b>Chatbot:</b> {conversation.chatbot}</div>
      </div>
      <TextField
        label="Error you found"
        placeholder="What did the chatbot get wrong, and what should it have done?"
        value={value}
        onChange={onChange}
      />
    </>
  );
}

function EscalationStep({ conversations, response, onChange }) {
  const toggle = (id) => {
    const escalate = response.escalate.includes(id)
      ? response.escalate.filter((item) => item !== id)
      : [...response.escalate, id];
    onChange({ escalate });
  };
  return (
    <>
      <div className="choice-list">
        {conversations.map((conversation, index) => {
          const checked = response.escalate.includes(conversation.id);
          return (
            <button
              key={conversation.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              className={`choice-option${checked ? ' is-selected' : ''}`}
              onClick={() => toggle(conversation.id)}
            >
              <span className="check-indicator">{checked ? '✓' : ''}</span>
              <span><b>Conversation {index + 1}.</b> {conversation.customer}</span>
            </button>
          );
        })}
      </div>
      <p className="fine-print">Select none if no conversation needs a human.</p>
      <TextField
        label="Why these (or none)?"
        placeholder="Explain how your choice protects the customer and follows the policy…"
        value={response.rationale}
        onChange={(value) => onChange({ rationale: value })}
      />
    </>
  );
}

function ManagerStep({ task, response, presenter }) {
  const asking = presenter.status === 'asking';
  return (
    <div className="chat">
      <div className="bubble bubble-manager"><b>Manager (Gemini):</b> {task.managerOpening}</div>
      <TextField
        label="Your reply"
        placeholder="A clear, calm answer in everyday language…"
        value={response.explanation}
        onChange={(value) => presenter.updateAnswer(task.id, { explanation: value, followUp: null, followUpReply: '' })}
        disabled={asking}
      />
      {!response.followUp && (
        <button
          className="button button-secondary"
          onClick={presenter.askManager}
          disabled={!response.explanation.trim() || asking}
        >
          {asking ? 'Manager is typing…' : 'Send to manager →'}
        </button>
      )}
      {response.followUp && (
        <>
          <div className="bubble bubble-manager">
            <b>Manager (Gemini):</b> {response.followUp.message}
          </div>
          <TextField
            label="Your follow-up reply"
            placeholder="Answer the manager’s follow-up…"
            value={response.followUpReply}
            onChange={(value) => presenter.updateAnswer(task.id, { followUpReply: value })}
          />
        </>
      )}
    </div>
  );
}

function TextField({ label, placeholder, value, onChange, rows = 3, disabled = false }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <textarea
        className="text-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={3000}
        disabled={disabled}
      />
    </label>
  );
}

function SimulationResults({ result, onFinish }) {
  // Strengths first (PDF p.33).
  const skills = [...result.skills].sort((a, b) => b.score - a.score);
  return (
    <section className="page page-narrow">
      <div className="page-topline">
        <QuestComplete number="02" label="Work simulation" />
        <DemoBadge show={result.isDemo} />
      </div>
      <h1 className="page-title">Your simulation snapshot</h1>
      {result.summary && <p className="lede">{result.summary}</p>}

      {result.distressConcern && (
        <div className="card support-card" role="note">
          It sounds like this may be a stressful time. Your campus counseling service is a good place to talk it through.
        </div>
      )}

      <div className="card">
        <div className="card-heading">
          <span className="eyebrow">SKILL SCORES · FIXED RUBRIC</span>
          <strong>{Number(result.overallScore).toFixed(1)}<span>/5 overall</span></strong>
        </div>
        <div className="skill-list">
          {skills.map((skill) => (
            <article className="skill-row" key={skill.id}>
              <div className="skill-topline">
                <strong>{skill.label}</strong>
                <span>{skill.score}/5</span>
              </div>
              <ScoreBar value={skill.score} max={5} label={`${skill.label}: ${skill.score} of 5`} />
              {skill.evidenceMissing
                ? <p className="evidence-missing">Not enough in your answers to show this skill.</p>
                : <blockquote className="evidence-quote">“{skill.evidence}”</blockquote>}
              {skill.rationale && <p className="skill-rationale">{skill.rationale}</p>}
              <small className="fine-print">
                3 reviews: {skill.ratingChecks.join(' · ')} → {skill.evidenceMissing ? 'no quotable evidence, scored 1' : `median ${skill.score}`}
              </small>
            </article>
          ))}
        </div>
      </div>

      <button className="button button-primary button-wide" onClick={onFinish}>
        Finish &amp; continue →
      </button>
    </section>
  );
}
