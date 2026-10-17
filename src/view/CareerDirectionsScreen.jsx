import { useCareerDirectionsPresenter } from '../presenter/useCareerDirectionsPresenter.js';
import { BaziCard, DemoBadge, ErrorState, LoadingState } from './components.jsx';

export function CareerDirectionsScreen({ onBack, onContinue }) {
  const presenter = useCareerDirectionsPresenter();

  return (
    <section className="page page-wide">
      <div className="page-topline">
        <button className="text-button" onClick={onBack}>← Back to journey</button>
        <DemoBadge show={presenter.recommendations?.isDemo} />
      </div>
      <span className="eyebrow">QUEST 03 · RANKED CAREER DIRECTIONS</span>
      <h1 className="page-title">Your career directions · top 5</h1>

      {presenter.status === 'loading' && <LoadingState label="Matching your interests and evidence to real jobs…" />}
      {presenter.status === 'error' && (
        <ErrorState title="WE COULDN’T LOAD YOUR DIRECTIONS" message={presenter.error} onBack={onBack} onRetry={presenter.retry} />
      )}
      {presenter.status === 'ready' && (
        <CareerReport
          presenter={presenter}
          onContinue={() => {
            presenter.confirmSelection();
            onContinue();
          }}
        />
      )}
    </section>
  );
}

function CareerReport({ presenter, onContinue }) {
  const { recommendations, selected } = presenter;
  return (
    <div className="split-layout">
      <div>
        <p className="lede">Pick the direction you want to explore. Your skill gap and 30-day plan will be built for it.</p>
        <div className="direction-list" role="radiogroup" aria-label="Career directions">
          {recommendations.directions.map((direction) => {
            const isSelected = selected === direction.title;
            return (
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`card direction-card${isSelected ? ' is-selected' : ''}`}
                key={direction.rank}
                onClick={() => presenter.select(direction.title)}
              >
                <span className="direction-rank">{direction.rank}</span>
                <span className="direction-body">
                  <span className="direction-topline">
                    <strong>{direction.title}</strong>
                    <span className={`match-badge match-${direction.match.toLowerCase()}`}>{direction.match}</span>
                  </span>
                  <span className="direction-reason">
                    {direction.interestFit}: <q>{direction.evidence}</q>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <details className="card explore-more">
          <summary>+ {recommendations.exploreMore.length} more directions to explore</summary>
          <div className="chip-list">
            {recommendations.exploreMore.map((title) => <span className="chip" key={title}>{title}</span>)}
          </div>
        </details>

        <button className="button button-primary button-wide" onClick={onContinue} disabled={!selected}>
          See skill gap for {selected || 'this direction'} →
        </button>
      </div>

      <aside className="side-panel">
        <div className="card">
          <span className="eyebrow">HOW THE RANKING IS BUILT</span>
          <ul className="plain-list">
            {recommendations.rankingBasis.map((reason) => <li key={reason}>{reason}</li>)}
          </ul>
          <small className="fine-print">Every direction must have a reason and evidence from your own answers.</small>
        </div>
        <BaziCard>{recommendations.baziNote || 'Shown alongside; never affects the ranking.'}</BaziCard>
      </aside>
    </div>
  );
}
