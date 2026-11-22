import { CroquisDoodle, CroquisPage } from '@/composites/play/croquis/art/croquisPage'
import { CROQUIS_BANNER } from '@/declarations/play/croquis/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'croquis-hub'
const PAGE = CROQUIS_BANNER.frames.banner
const DUR = `${CROQUIS_BANNER.cycle}s`
const DRAWN = CROQUIS_BANNER.drawn
// Pencil drawn tip at 0 0, pointing down left
const PENCIL =
  'M0 0L10 -26L22 -22L12 4Z M10 -26L60 -160L72 -156L22 -22Z M60 -160L64 -172L76 -168L72 -156Z'

/**
 * Hub ground of Croquis: a spiral sketchbook where a pencil draws a rocket, then rubs it out
 * @return {JSX.Element}
 */

export const CroquisHubBanner = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    className={PLAY_HUB.groundArtSheet}
    aria-hidden="true"
  >
    <CroquisPage id={ID} width={1600} height={900} />
    <CroquisDoodle d={CROQUIS_BANNER.sun} place={PAGE.sun} />
    <CroquisDoodle d={CROQUIS_BANNER.star} place={PAGE.star} />
    <CroquisDoodle d={CROQUIS_BANNER.cloud} place={PAGE.cloud} />

    <g transform={`translate(${PAGE.rocket.x} ${PAGE.rocket.y}) scale(${PAGE.rocket.scale})`}>
      <path
        d={CROQUIS_BANNER.rocket}
        pathLength="1000"
        fill="none"
        style={{ stroke: 'var(--croquis-graphite)' }}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000 1000"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur={DUR}
          repeatCount="indefinite"
          values="1000;0;0;0"
          keyTimes={`0;${DRAWN};0.9;1`}
        />
        <animate
          attributeName="opacity"
          dur={DUR}
          repeatCount="indefinite"
          values="1;1;0;0"
          keyTimes="0;0.86;0.94;1"
        />
      </path>
      {/* Pencil riding the stroke */}
      <g>
        <animateMotion
          dur={DUR}
          repeatCount="indefinite"
          path={CROQUIS_BANNER.rocket}
          keyPoints="0;1;1;0"
          keyTimes={`0;${DRAWN};0.9;1`}
          calcMode="linear"
        />
        <g transform={`scale(${(1 / PAGE.rocket.scale) * 1.6})`}>
          <path
            d={PENCIL}
            style={{ fill: 'var(--play-croquis)', stroke: 'var(--croquis-graphite)' }}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M0 0L4 -10L9 -8Z" style={{ fill: 'var(--croquis-graphite)' }} />
        </g>
      </g>
    </g>
  </svg>
)
