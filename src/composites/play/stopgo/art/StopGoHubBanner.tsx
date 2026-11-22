import {
  StopGoLight,
  StopGoRoad,
  StopGoSign,
  StopGoStone,
} from '@/composites/play/stopgo/art/stopgoRoad'
import { STOPGO_BANNER } from '@/declarations/play/stopgo/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'stopgo-hub'
const PLACE = STOPGO_BANNER.frames.banner
const HORIZON = 900 * STOPGO_BANNER.horizon
// Lamp on-time shares: red, amber, green over one light cycle
const LAMPS = [
  { y: 20, token: '--play-stopgo', values: '1;1;0;0;0;1', times: '0;0.38;0.4;0.9;0.98;1' },
  { y: 76, token: '--stopgo-amber', values: '0;0;0;1;0;0', times: '0;0.4;0.86;0.88;0.98;1' },
  { y: 132, token: '--stopgo-go', values: '0;0;1;1;0;0', times: '0;0.38;0.4;0.86;0.88;1' },
]

/**
 * Hub ground of Stop & Go: a road at dusk rushing under the wheels, a light cycling, a kilometre stone
 * @return {JSX.Element}
 */

export const StopGoHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <StopGoRoad
      id={ID}
      width={1600}
      height={900}
      vanish={PLACE.vanish}
      lane={
        <>
          {/* Dashes grow as they come closer: three lanes of perspective strips */}
          {Array.from({ length: 7 }, (_, index) => {
            const from = index / 7
            const to = (index + 1) / 7
            const y = (share: number) => HORIZON + (900 - HORIZON) * share * share

            return (
              <path
                key={index}
                d={`M${PLACE.vanish} ${y(from)}L${PLACE.vanish} ${y(to)}`}
                style={{ stroke: 'var(--stopgo-line)' }}
                strokeWidth={2 + to * 14}
                strokeDasharray={`${(y(to) - y(from)) / 2} ${(y(to) - y(from)) / 2}`}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  dur={`${STOPGO_BANNER.rush}s`}
                  repeatCount="indefinite"
                  values={`0;${-(y(to) - y(from))}`}
                />
              </path>
            )
          })}
        </>
      }
    />
    <StopGoSign place={PLACE.sign} />
    <StopGoLight
      place={PLACE.light}
      lamps={LAMPS.map((lamp) => (
        <g key={lamp.y}>
          <animate
            attributeName="opacity"
            dur={`${STOPGO_BANNER.light}s`}
            repeatCount="indefinite"
            calcMode="discrete"
            values={lamp.values}
            keyTimes={lamp.times}
          />
          <circle cy={lamp.y} r="44" style={{ fill: `var(${lamp.token})` }} opacity="0.25" />
          <circle cy={lamp.y} r="22" style={{ fill: `var(${lamp.token})` }} />
        </g>
      ))}
    />
    <StopGoStone place={PLACE.stone} />
  </svg>
)
