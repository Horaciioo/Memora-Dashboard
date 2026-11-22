import { NavalHull, NavalRose, NavalSea } from '@/composites/play/naval/art/navalChart'
import { NAVAL_BANNER } from '@/declarations/play/naval/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'naval-hub'
const CHART = NAVAL_BANNER.frames.banner
const { x, y } = CHART.rose
const SWEEP = NAVAL_BANNER.sweep
// Trace width behind the beam, in radians
const TRAIL = 0.9

/**
 * Hub ground of Bataille navale: a brass night chart, a sonar beam turning and ships pinging as it passes
 * @return {JSX.Element}
 */

export const NavalHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <defs>
      <linearGradient
        id={`${ID}-trace`}
        gradientUnits="userSpaceOnUse"
        x1={x + CHART.reach}
        y1={y}
        x2={x + CHART.reach * Math.cos(-TRAIL)}
        y2={y + CHART.reach * Math.sin(-TRAIL)}
      >
        <stop offset="0" style={{ stopColor: 'var(--naval-sonar)' }} stopOpacity="0.38" />
        <stop offset="1" style={{ stopColor: 'var(--naval-sonar)' }} stopOpacity="0" />
      </linearGradient>
      <pattern id={`${ID}-swell`} width="240" height="60" patternUnits="userSpaceOnUse">
        <path
          d="M0 30c30 -10 60 -10 90 0s60 10 90 0 45 -8 60 -4"
          fill="none"
          style={{ stroke: 'var(--play-naval-glow)' }}
          strokeWidth="1"
          opacity="0.12"
        />
        <animateTransform
          attributeName="patternTransform"
          type="translate"
          dur={`${NAVAL_BANNER.swell}s`}
          repeatCount="indefinite"
          values="0 0;-240 12;0 0"
        />
      </pattern>
    </defs>
    <NavalSea width={1600} height={900} soundings />
    <rect width="1600" height="900" fill={`url(#${ID}-swell)`} />
    <NavalRose {...CHART} />

    {/* Beam and its fading trace */}
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        dur={`${SWEEP}s`}
        repeatCount="indefinite"
        from={`0 ${x} ${y}`}
        to={`360 ${x} ${y}`}
      />
      <path
        d={`M${x} ${y}L${x + CHART.reach} ${y}A${CHART.reach} ${CHART.reach} 0 0 0 ${x + CHART.reach * Math.cos(-TRAIL)} ${y + CHART.reach * Math.sin(-TRAIL)}Z`}
        fill={`url(#${ID}-trace)`}
      />
      <path
        d={`M${x} ${y}H${x + CHART.reach}`}
        style={{ stroke: 'var(--naval-sonar)' }}
        strokeWidth="2"
        opacity="0.8"
      />
    </g>

    {/* A ship lights up as the beam crosses it, then sinks back into the dark */}
    {CHART.ships.map((ship) => {
      const angle = (Math.atan2(ship.y - y, ship.x - x) * 180) / Math.PI
      const begin = ((((angle % 360) + 360) % 360) / 360) * SWEEP

      return (
        <g key={`${ship.x}-${ship.y}`} opacity="0.08">
          <animate
            attributeName="opacity"
            dur={`${SWEEP}s`}
            begin={`${begin.toFixed(2)}s`}
            repeatCount="indefinite"
            values="1;0.08;0.08"
            keyTimes="0;0.6;1"
          />
          <circle
            cx={ship.x}
            cy={ship.y}
            r="0"
            fill="none"
            style={{ stroke: 'var(--naval-sonar)' }}
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              dur={`${SWEEP}s`}
              begin={`${begin.toFixed(2)}s`}
              repeatCount="indefinite"
              values="8;80;80"
              keyTimes="0;0.25;1"
            />
            <animate
              attributeName="opacity"
              dur={`${SWEEP}s`}
              begin={`${begin.toFixed(2)}s`}
              repeatCount="indefinite"
              values="0.9;0;0"
              keyTimes="0;0.25;1"
            />
          </circle>
          <NavalHull ship={ship} />
        </g>
      )
    })}
  </svg>
)
