/**
 * Concordat loading scene: an island coast drawn on the table, pawns dropped on it
 * @return {JSX.Element}
 */

export const ConcordatLoadScene = () => (
  <svg viewBox="0 0 220 150" className="h-36 w-52" aria-hidden="true">
    <rect x="6" y="14" width="208" height="128" rx="10" style={{ fill: 'var(--concordat-sea)' }} />
    <rect x="14" y="22" width="192" height="112" rx="6" style={{ fill: 'var(--concordat-card)' }} />
    <path
      className="concordat-load-coast"
      d="M40 96 C34 70 58 48 84 54 C100 34 138 38 146 60 C174 58 192 80 178 102 C164 122 120 124 98 116 C72 124 46 118 40 96 Z"
      fill="none"
      stroke="var(--concordat-ink)"
      strokeWidth="3"
      strokeLinejoin="round"
    />
    {[
      [86, 84, 'var(--play-concordat)'],
      [126, 76, 'var(--concordat-grass)'],
      [148, 100, 'var(--concordat-sea-lit)'],
    ].map(([x, y, fill], index) => (
      <g
        key={String(fill)}
        className="concordat-load-pawn"
        style={{ animationDelay: `${index * 420}ms` }}
      >
        <circle
          cx={x}
          cy={y}
          r="8"
          style={{ fill: String(fill) }}
          stroke="var(--concordat-card)"
          strokeWidth="2.5"
        />
      </g>
    ))}
  </svg>
)
