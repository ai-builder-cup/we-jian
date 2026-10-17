import { getLearnerName } from '../business/workflowService.js';

const QUESTS = [
  {
    id: 'sample-questionnaire',
    title: 'Sample questionnaire',
    description: 'Interests, readiness, and goals: what you say.',
    meta: '46 questions · about 10 min',
  },
  {
    id: 'work-simulation',
    title: 'Work simulation: AI Quality Evaluator',
    description: '4 short tasks: what you show.',
    meta: '4 tasks · about 15 min',
  },
  {
    id: 'career-directions',
    title: 'Ranked career directions',
    description: 'Top 5 directions plus 15 to explore, each backed by your evidence.',
    meta: 'Pick one direction',
  },
  {
    id: 'skill-gap-plan',
    title: 'Skill gap + 30-day plan',
    description: 'What your chosen job needs, and a plan for your biggest gaps.',
    meta: '30-day plan',
  },
];

export function HomeScreen({ isComplete, canAccess, onOpen, onOpenBazi }) {
  const completedCount = QUESTS.filter((quest) => isComplete(quest.id)).length;
  // Read straight from the browser: the name never leaves it, so there is nothing to fetch.
  const name = getLearnerName();
  return (
    <section className="page page-narrow">
      <span className="eyebrow">{name ? `YOUR JOURNEY, ${name.toUpperCase()}` : 'YOUR JOURNEY'}</span>
      <h1 className="page-title">Find your path, <span className="title-highlight">one quest at a time.</span></h1>
      <div className="journey-meter">
        <span>{completedCount}/{QUESTS.length} quests complete</span>
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${(completedCount / QUESTS.length) * 100}%` }} />
        </div>
      </div>

      <div className="quest-list">
        {QUESTS.map((quest, index) => {
          const enabled = canAccess(quest.id);
          const complete = isComplete(quest.id);
          return (
            <button
              key={quest.id}
              className={`quest-card${enabled ? '' : ' is-locked'}${complete ? ' is-complete' : ''}`}
              disabled={!enabled}
              onClick={() => onOpen(quest.id)}
            >
              <span className="quest-number">{complete ? '✓' : index + 1}</span>
              <span className="quest-copy">
                <strong>{quest.title}</strong>
                <span>{quest.description}</span>
                <small>{complete ? 'Completed · open again' : enabled ? quest.meta : 'Locked · finish the previous quest'}</small>
              </span>
              <span className="quest-arrow" aria-hidden="true">{enabled ? '→' : '🔒'}</span>
            </button>
          );
        })}
      </div>

      {/* Outside the quest list and outside the meter, on purpose. It is never
          locked, never required, and completing it changes nothing about the
          journey, so it must not look like a step. */}
      {onOpenBazi && (
        <button className="quest-card is-optional" onClick={onOpenBazi}>
          <span className="quest-number quest-number-optional" aria-hidden="true">☯</span>
          <span className="quest-copy">
            <strong>BaZi reflection</strong>
            <span>A cultural reflection on how you tend to work.</span>
            <small>Optional · never used in your scores or recommendations</small>
          </span>
          <span className="quest-arrow" aria-hidden="true">→</span>
        </button>
      )}
    </section>
  );
}
