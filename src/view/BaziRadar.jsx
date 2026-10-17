// Structural signature as a radar. Hand-drawn SVG, no chart library: this is
// five numbers and a polygon, and pulling in a dependency for that would cost
// more than it returns.
//
// The five axes are the Ten God families, relabelled for work. The MONEY
// vocabulary is deliberately absent — 財 becomes "Execution", because what the
// structure actually describes is how effort converts into finished outcomes,
// and a hiring-adjacent product has no business profiling anyone's finances.

const AXES = [
  { key: 'Wealth', label: 'Execution', hint: 'turning effort into finished outcomes' },
  { key: 'Officer', label: 'Structure', hint: 'standards, accountability, process' },
  { key: 'Output', label: 'Creation', hint: 'producing and expressing' },
  { key: 'Resource', label: 'Depth', hint: 'knowing before acting' },
  { key: 'Peer', label: 'Autonomy', hint: 'working on your own terms' },
];

// Outer ring is 50%. Five shares sum to 1, so half the chart in one dimension is
// already heavy concentration. Scaling to each chart's own maximum would make
// every profile look equally extreme, which is the opposite of informative.
const FULL_SCALE = 0.5;
const SIZE = 300;
const CENTRE = SIZE / 2;
const RADIUS = 96;

const pointAt = (index, fraction) => {
  const angle = (Math.PI * 2 * index) / AXES.length - Math.PI / 2;
  const r = RADIUS * Math.max(0, Math.min(1, fraction));
  return [CENTRE + r * Math.cos(angle), CENTRE + r * Math.sin(angle)];
};

const polygon = (fractions) => fractions.map((f, i) => pointAt(i, f).join(',')).join(' ');

export function BaziRadar({ shares, dayMaster }) {
  const fractions = AXES.map((axis) => (shares[axis.key] ?? 0) / FULL_SCALE);
  const ranked = AXES
    .map((axis, index) => ({ ...axis, share: shares[axis.key] ?? 0, index }))
    .sort((a, b) => b.share - a.share);
  const dominant = ranked[0];

  return (
    <div className="bazi-radar-wrap">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="bazi-radar"
        role="img"
        aria-label={`Work structure: ${ranked.map((a) => `${a.label} ${Math.round(a.share * 100)}%`).join(', ')}`}
      >
        {/* Rings at 10/20/30/40/50%. */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((ring) => (
          <polygon
            key={ring}
            points={polygon(AXES.map(() => ring))}
            className={ring === 1 ? 'radar-ring radar-ring-outer' : 'radar-ring'}
          />
        ))}
        {AXES.map((axis, index) => {
          const [x, y] = pointAt(index, 1);
          return <line key={axis.key} x1={CENTRE} y1={CENTRE} x2={x} y2={y} className="radar-spoke" />;
        })}

        <polygon points={polygon(fractions)} className="radar-shape" />
        {fractions.map((fraction, index) => {
          const [x, y] = pointAt(index, fraction);
          return <circle key={AXES[index].key} cx={x} cy={y} r="3.5" className="radar-dot" />;
        })}

        {/* Day Master at the centre, the way the source engine renders it. */}
        <circle cx={CENTRE} cy={CENTRE} r="20" className="radar-core" />
        <text x={CENTRE} y={CENTRE + 4} className="radar-core-text">{dayMaster.element}</text>

        {AXES.map((axis, index) => {
          const [x, y] = pointAt(index, 1.3);
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              className="radar-label"
              textAnchor={x < CENTRE - 10 ? 'end' : x > CENTRE + 10 ? 'start' : 'middle'}
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      <ul className="radar-legend">
        {ranked.map((axis, position) => (
          <li key={axis.key} className={position === 0 ? 'is-dominant' : ''}>
            <span className="radar-legend-value">{Math.round(axis.share * 100)}%</span>
            <span className="radar-legend-label">
              <strong>{axis.label}</strong>
              <small>{axis.hint}</small>
            </span>
          </li>
        ))}
      </ul>

      <p className="fine-print radar-note">
        Your structure leans hardest on <strong>{dominant.label}</strong>. The shape matters more
        than any single point: a balanced pentagon and a sharp spike describe very different ways of
        working, and neither is better than the other.
      </p>
    </div>
  );
}
