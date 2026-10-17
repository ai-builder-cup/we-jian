import { useEffect } from 'react';
import { useQuestionnairePresenter } from '../presenter/useQuestionnairePresenter.js';
import { DemoBadge, ErrorState, LoadingState } from './components.jsx';

export function QuestionnaireScreen({ onFinish, onResult }) {
  const presenter = useQuestionnairePresenter();
  useEffect(() => {
    presenter.load();
  }, [presenter.load]);

  useEffect(() => {
    if (presenter.status === 'result') onResult(presenter.result);
  }, [onResult, presenter.result, presenter.status]);

  if (presenter.status === 'loading' || presenter.status === 'idle') {
    return <section className="page page-narrow"><LoadingState label="Preparing your questions…" /></section>;
  }
  if (presenter.status === 'error') {
    return (
      <section className="page page-narrow">
        <ErrorState
          title="WE COULDN’T LOAD THE QUESTIONS"
          message={presenter.error}
          onBack={onFinish}
          backLabel="Back home"
          onRetry={presenter.load}
        />
      </section>
    );
  }

  const question = presenter.currentQuestion;
  const answer = presenter.answers[question.id] ?? '';
  const isLast = presenter.index === presenter.total - 1;

  return (
    <section className="page page-narrow">
      <div className="page-topline">
        <button className="text-button" onClick={onFinish}>← Back to home</button>
        <DemoBadge show={presenter.isDemo} />
      </div>
      <div className="progress-heading">
        <span className="section-progress">
          {question.sectionLabel || question.section} · {presenter.section.position}/{presenter.section.total}
        </span>
        <span><strong>{presenter.progress}</strong>/{presenter.total} questions</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Questionnaire progress"
        aria-valuemin="0"
        aria-valuemax={presenter.total}
        aria-valuenow={presenter.progress}
      >
        <span style={{ width: `${(presenter.progress / presenter.total) * 100}%` }} />
      </div>

      <div className={`card question-panel slide-${presenter.direction}`} key={question.id}>
        {question.stem && <p className="question-stem">{question.stem}</p>}
        <h1 className="question-prompt">{question.prompt}</h1>
        {question.description && <p className="question-description">{question.description}</p>}
        <AnswerInput
          question={question}
          answer={answer}
          onChange={(value) => presenter.setAnswer(question.id, value)}
        />
        {presenter.error && <p className="error-message">{presenter.error}</p>}
        <div className="action-row">
          <button
            className="button button-secondary"
            onClick={presenter.back}
            disabled={presenter.index === 0 || presenter.status === 'submitting'}
          >
            ← Previous
          </button>
          <button
            className="button button-primary"
            onClick={presenter.next}
            disabled={!presenter.canContinue || presenter.status === 'submitting'}
          >
            {presenter.status === 'submitting'
              ? 'Scoring your answers…'
              : isLast ? 'See my results →' : 'Next →'}
          </button>
        </div>
      </div>
      {question.source && <p className="question-source">{question.source}</p>}
    </section>
  );
}

function AnswerInput({ question, answer, onChange }) {
  if (question.type === 'essay') {
    return (
      <label className="essay-label">
        <span className="visually-hidden">Your answer</span>
        <textarea
          className="text-input"
          value={answer}
          onChange={(event) => onChange(event.target.value)}
          placeholder={question.placeholder || 'Write your answer here…'}
          maxLength={2000}
          rows="5"
        />
      </label>
    );
  }

  if (question.type === 'multi_select') {
    const chosen = Array.isArray(answer) ? answer : [];
    const limit = Number(question.maxSelections || 1);
    const toggle = (value) => onChange(chosen.includes(value)
      ? chosen.filter((item) => item !== value)
      : chosen.length < limit ? [...chosen, value] : chosen);
    return (
      <div className="choice-list" role="group" aria-label={question.prompt}>
        <p className="multi-count" aria-live="polite">{chosen.length} of {limit} chosen</p>
        {question.options.map((option) => {
          const on = chosen.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              disabled={!on && chosen.length >= limit}
              className={`choice-option multi-option${on ? ' is-selected' : ''}`}
              onClick={() => toggle(option.value)}
            >
              <span className="check-indicator" aria-hidden="true">{on ? '✓' : ''}</span>
              <span>
                <strong>{option.label}</strong>
                {option.description && <small className="option-description">{option.description}</small>}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  const isSelected = (option) => String(answer) === String(option.value);
  if (question.type === 'multiple_choice' && question.layout === 'horizontal') {
    return (
      <div className="scale-options" role="radiogroup" aria-label={question.prompt}>
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected(option)}
            className={`scale-option${isSelected(option) ? ' is-selected' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="choice-list" role="radiogroup" aria-label={question.prompt}>
      {question.options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={isSelected(option)}
          className={`choice-option${isSelected(option) ? ' is-selected' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span className="radio-indicator" />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
