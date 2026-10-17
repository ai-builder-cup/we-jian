export function LoadingState({ label }) {
  return (
    <div className="loading-state" aria-live="polite">
      <span className="loading-indicator" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title, message, onRetry, onBack, backLabel = 'Back to journey' }) {
  return (
    <div className="error-state" role="alert">
      <span className="eyebrow">{title}</span>
      <p className="error-message">{message}</p>
      <div className="button-row">
        {onBack && <button className="button button-secondary" onClick={onBack}>{backLabel}</button>}
        {onRetry && <button className="button button-primary" onClick={onRetry}>Try again</button>}
      </div>
    </div>
  );
}

export function DemoBadge({ show, label = 'DEMO DATA' }) {
  return show ? <span className="demo-badge">{label}</span> : null;
}

export function QuestComplete({ number, label }) {
  return (
    <div className="quest-complete" role="status">
      <span className="quest-complete-star" aria-hidden="true">★</span>
      <span>Quest {number} complete</span>
      {label && <small>{label}</small>}
    </div>
  );
}

export function ScoreBar({ value, max, marker, label }) {
  const percent = (amount) => `${Math.max(0, Math.min(100, (amount / max) * 100))}%`;
  return (
    <div className="bar-track" role="img" aria-label={label}>
      <span style={{ width: percent(value) }} />
      {marker != null && <i className="bar-marker" style={{ left: percent(marker) }} aria-hidden="true" />}
    </div>
  );
}

export function BaziCard({ title = 'BaZi reflection', children }) {
  return (
    <aside className="bazi-card">
      <span className="bazi-icon" aria-hidden="true">☯</span>
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}
