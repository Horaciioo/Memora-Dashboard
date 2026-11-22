import { GolfLinks } from '@/composites/play/golf/art/golfLinks'
import { GOLF_BANNER } from '@/declarations/play/golf/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'golf-hub'
const DUR = `${GOLF_BANNER.cycle}s`
const { flight, flag } = GOLF_BANNER
// Flight, hold on the landing, fade, wait
const LANDED = 0.42

/**
 * Hub ground of Golf: sunset links, a TV shot tracer drawing the ball's arc onto the green
 * @return {JSX.Element}
 */

export const GolfHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArt}
    aria-hidden="true"
  >
    <GolfLinks
      id={ID}
      tracer={
        <>
          <path
            d={flight}
            pathLength="100"
            fill="none"
            style={{ stroke: 'var(--golf-tracer)' }}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="100 100"
            filter={`url(#${ID}-glow)`}
          >
            <animate
              attributeName="stroke-dashoffset"
              dur={DUR}
              repeatCount="indefinite"
              values="100;100;0;0"
              keyTimes={`0;0.08;${LANDED};1`}
              calcMode="spline"
              keySplines="0 0 1 1;0.2 0.4 0.6 1;0 0 1 1"
            />
            <animate
              attributeName="opacity"
              dur={DUR}
              repeatCount="indefinite"
              values="1;1;0;0"
              keyTimes="0;0.7;0.85;1"
            />
          </path>
          <circle r="7" fill="white">
            <animateMotion
              dur={DUR}
              repeatCount="indefinite"
              path={flight}
              keyPoints="0;0;1;1"
              keyTimes={`0;0.08;${LANDED};1`}
              calcMode="spline"
              keySplines="0 0 1 1;0.2 0.4 0.6 1;0 0 1 1"
            />
            <animate
              attributeName="opacity"
              dur={DUR}
              repeatCount="indefinite"
              values="0;0;1;1;0;0"
              keyTimes={`0;0.07;0.09;0.7;0.85;1`}
            />
          </circle>
          {/* Landing ring on the green */}
          <ellipse
            cx={flag.x - 10}
            cy={flag.y - 10}
            rx="0"
            ry="0"
            fill="none"
            style={{ stroke: 'var(--golf-tracer)' }}
            strokeWidth="3"
          >
            <animate
              attributeName="rx"
              dur={DUR}
              repeatCount="indefinite"
              values="0;0;70;70"
              keyTimes={`0;${LANDED};0.58;1`}
            />
            <animate
              attributeName="ry"
              dur={DUR}
              repeatCount="indefinite"
              values="0;0;12;12"
              keyTimes={`0;${LANDED};0.58;1`}
            />
            <animate
              attributeName="opacity"
              dur={DUR}
              repeatCount="indefinite"
              values="0;0;0.9;0;0"
              keyTimes={`0;${LANDED};${LANDED + 0.01};0.58;1`}
            />
          </ellipse>
        </>
      }
    />
  </svg>
)
