import { BombBody, BombPrintDefs, BombRays, BombStamp } from '@/composites/play/bomb/art/bombPrint'
import { BOMB_PRINT } from '@/declarations/play/bomb/art'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'bomb-hub'
const { bomb, fuse, cycle, rays, stamps } = BOMB_PRINT.banner
const DUR = `${cycle}s`
// Burn, shake, blast and rebirth along one cycle
const TIMES = { burnt: 0.84, shake: [0.82, 0.88], blast: [0.88, 0.95], back: 0.97 }
const STAR = 'M0 -26L6 -6L26 0L6 6L0 26L-6 6L-26 0L-6 -6Z'

/**
 * Hub ground of Bomb Party: a two-ink concert poster whose fuse burns down to a blast
 * @return {JSX.Element}
 */

export const BombHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <defs>
      <BombPrintDefs id={ID} />
    </defs>
    <rect width="1600" height="900" style={{ fill: 'var(--play-bomb-stock)' }} />
    <BombRays x={bomb.x} y={bomb.y} reach={1900} count={rays} />
    {stamps.map((stamp) => (
      <BombStamp key={stamp.text} {...stamp} />
    ))}

    {/* Ash left behind */}
    <path
      d={fuse}
      fill="none"
      style={{ stroke: 'var(--play-bomb-cream)' }}
      strokeOpacity="0.16"
      strokeWidth="3"
      strokeDasharray="2 14"
      strokeLinecap="round"
    />
    {/* Cord, shortened from its loose end */}
    <path
      d={fuse}
      pathLength="1000"
      fill="none"
      style={{ stroke: 'var(--play-bomb-cord)' }}
      strokeWidth="11"
      strokeLinecap="round"
      strokeDasharray="1000 1000"
    >
      <animate
        attributeName="stroke-dashoffset"
        dur={DUR}
        repeatCount="indefinite"
        values="0;1000;1000;0"
        keyTimes={`0;${TIMES.burnt};${TIMES.back};1`}
      />
    </path>
    <path
      d={fuse}
      pathLength="1000"
      fill="none"
      style={{ stroke: 'var(--play-bomb-deep)' }}
      strokeWidth="11"
      strokeDasharray="6 10"
      strokeOpacity="0.55"
    >
      <animate
        attributeName="stroke-dasharray"
        dur={DUR}
        repeatCount="indefinite"
        calcMode="discrete"
        values="6 10;0 1000;6 10"
        keyTimes={`0;${TIMES.burnt};${TIMES.back}`}
      />
    </path>

    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        dur={DUR}
        repeatCount="indefinite"
        values="0 0;0 0;-7 3;6 -4;-6 2;7 -3;-4 4;0 0;0 0"
        keyTimes={`0;${TIMES.shake[0]};0.83;0.84;0.85;0.86;0.87;${TIMES.shake[1]};1`}
      />
      <animate
        attributeName="opacity"
        dur={DUR}
        repeatCount="indefinite"
        values="1;1;0;0;1"
        keyTimes={`0;${TIMES.blast[0]};0.89;${TIMES.back};1`}
      />
      <BombBody id={ID} {...bomb} />
    </g>

    {/* Spark riding the cord towards the cap */}
    <g>
      <animateMotion
        dur={DUR}
        repeatCount="indefinite"
        path={fuse}
        keyPoints="1;0;0;1"
        keyTimes={`0;${TIMES.burnt};${TIMES.back};1`}
        calcMode="linear"
      />
      <animate
        attributeName="opacity"
        dur={DUR}
        repeatCount="indefinite"
        values="1;1;0;0;1"
        keyTimes={`0;${TIMES.blast[0]};0.885;${TIMES.back};1`}
      />
      <circle r="34" style={{ fill: 'var(--play-bomb)' }} opacity="0.35">
        <animate attributeName="r" dur="0.5s" repeatCount="indefinite" values="26;40;30;36;26" />
      </circle>
      <path d={STAR} style={{ fill: 'var(--play-bomb-glow)' }}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="0.9s"
          repeatCount="indefinite"
          values="0;45;90"
        />
      </path>
    </g>

    {/* Blast: a printed shockwave */}
    <circle
      cx={bomb.x}
      cy={bomb.y}
      r="0"
      fill="none"
      style={{ stroke: 'var(--play-bomb-glow)' }}
      strokeWidth="60"
      opacity="0"
    >
      <animate
        attributeName="r"
        dur={DUR}
        repeatCount="indefinite"
        values="0;0;1500;1500"
        keyTimes={`0;${TIMES.blast[0]};${TIMES.blast[1]};1`}
      />
      <animate
        attributeName="opacity"
        dur={DUR}
        repeatCount="indefinite"
        values="0;0;0.8;0;0"
        keyTimes={`0;${TIMES.blast[0]};0.885;${TIMES.blast[1]};1`}
      />
    </circle>
    <circle cx={bomb.x} cy={bomb.y} r="0" fill={`url(#${ID}-dots)`} opacity="0">
      <animate
        attributeName="r"
        dur={DUR}
        repeatCount="indefinite"
        values="0;0;900;900"
        keyTimes={`0;${TIMES.blast[0]};${TIMES.blast[1]};1`}
      />
      <animate
        attributeName="opacity"
        dur={DUR}
        repeatCount="indefinite"
        values="0;0;1;0;0"
        keyTimes={`0;${TIMES.blast[0]};0.89;${TIMES.blast[1]};1`}
      />
    </circle>
  </svg>
)
