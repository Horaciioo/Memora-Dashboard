// Squares of the chart, a side
const CELLS = 8
const STEP = 20
const SIZE = CELLS * STEP
const MIDDLE = SIZE / 2

// Ships showing up on the sweep, in chart squares
const BLIPS = [
  { x: 2, y: 2, delay: '0s' },
  { x: 5, y: 3, delay: '0.9s' },
  { x: 3, y: 6, delay: '1.8s' },
] as const

const LINES = Array.from({ length: CELLS + 1 }, (_, index) => index * STEP)

/**
 * Naval loading scene: a chart under a sonar sweep, tinted by the map being played
 * @return {JSX.Element}
 */

export const NavalLoadScene = () => (
  <span data-hud="naval" className="block text-[var(--hud-value)]">
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-44 sm:size-52" aria-hidden="true">
      <rect width={SIZE} height={SIZE} rx="8" fill="var(--hud-bg)" />
      <g stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.6">
        {LINES.map((line) => (
          <g key={line}>
            <line x1={line} y1="0" x2={line} y2={SIZE} />
            <line x1="0" y1={line} x2={SIZE} y2={line} />
          </g>
        ))}
      </g>
      <circle
        cx={MIDDLE}
        cy={MIDDLE}
        r={MIDDLE - 6}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.4"
      />
      <circle
        cx={MIDDLE}
        cy={MIDDLE}
        r={MIDDLE / 2}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.3"
      />
      <g className="naval-sonar-sweep" style={{ transformOrigin: '50% 50%' }}>
        <path
          d={`M${MIDDLE} ${MIDDLE} L${MIDDLE} 6 A${MIDDLE - 6} ${MIDDLE - 6} 0 0 1 ${MIDDLE + 46} 11 Z`}
          fill="currentColor"
          opacity="0.35"
        />
        <line x1={MIDDLE} y1={MIDDLE} x2={MIDDLE} y2="6" stroke="currentColor" strokeWidth="1.4" />
      </g>
      {BLIPS.map((blip) => (
        <circle
          key={`${blip.x}-${blip.y}`}
          className="naval-sonar-blip"
          style={{ animationDelay: blip.delay }}
          cx={blip.x * STEP + STEP / 2}
          cy={blip.y * STEP + STEP / 2}
          r="3.2"
          fill="currentColor"
        />
      ))}
    </svg>
  </span>
)
