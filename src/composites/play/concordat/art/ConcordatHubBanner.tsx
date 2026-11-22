import { ConcordatCapital, ConcordatPlate } from '@/composites/play/concordat/art/concordatMap'
import { CONCORDAT_BANNER } from '@/declarations/play/concordat/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'concordat-hub'
const MAP = CONCORDAT_BANNER.frames.banner
const DUR = `${CONCORDAT_BANNER.cycle}s`

/**
 * Hub ground of Concordat: an engraved staff map where three factions spread over the land
 * @return {JSX.Element}
 */

export const ConcordatHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <ConcordatPlate id={ID} width={1600} height={900} frame={MAP} />

    {/* Each faction claims land ring by ring, then the map is wiped clean */}
    <g clipPath={`url(#${ID}-land)`}>
      {MAP.factions.map((faction, index) => {
        const start = faction.delay / CONCORDAT_BANNER.cycle

        return (
          <g key={faction.token}>
            <circle
              cx={faction.x}
              cy={faction.y}
              r="0"
              fill={`url(#${ID}-hatch-${index})`}
              opacity="0.55"
            >
              <animate
                attributeName="r"
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0 0 1 1;0.3 0 0.4 1;0 0 1 1;0 0 1 1"
                values={`0;0;${faction.reach};${faction.reach};0`}
                keyTimes={`0;${start.toFixed(3)};0.7;0.94;1`}
              />
            </circle>
            <circle
              cx={faction.x}
              cy={faction.y}
              r="0"
              fill="none"
              style={{ stroke: `var(${faction.token})` }}
              strokeWidth="3"
              strokeDasharray="14 8"
            >
              <animate
                attributeName="r"
                dur={DUR}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0 0 1 1;0.3 0 0.4 1;0 0 1 1;0 0 1 1"
                values={`0;0;${faction.reach};${faction.reach};0`}
                keyTimes={`0;${start.toFixed(3)};0.7;0.94;1`}
              />
              <animate
                attributeName="opacity"
                dur={DUR}
                repeatCount="indefinite"
                values="0.9;0.9;0"
                keyTimes="0;0.9;1"
              />
            </circle>
          </g>
        )
      })}
    </g>

    {/* Marching order drawn across the plate */}
    <path
      d={MAP.march}
      pathLength="100"
      fill="none"
      style={{ stroke: 'var(--concordat-faction-a)' }}
      strokeWidth="4"
      strokeLinecap="round"
      strokeDasharray="100 100"
    >
      <animate
        attributeName="stroke-dashoffset"
        dur={DUR}
        repeatCount="indefinite"
        values="100;100;0;0;100"
        keyTimes="0;0.3;0.6;0.94;1"
      />
    </path>
    {MAP.factions.map((faction) => (
      <ConcordatCapital key={faction.token} {...faction} scale={1.4} />
    ))}
  </svg>
)
