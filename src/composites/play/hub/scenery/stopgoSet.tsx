import type { ScenerySet } from '@/composites/play/hub/scenery/sets'
import {
  NEAR_CIRCUITS,
  StopGoCircuits,
  TOP_CIRCUITS,
} from '@/composites/play/hub/scenery/stopgoCircuits'

// Flag colours along the bunting
const FLAGS = ['--play-stopgo', '--stopgo-kerb-white', '--stopgo-gold']

// Bunting flags, one every 64 units
const BUNTING = Array.from({ length: 26 }, (_, index) => ({
  x: 24 + index * 64,
  sag: Math.sin((index / 25) * Math.PI) * 26,
  fill: FLAGS[index % FLAGS.length],
}))

// Tree clumps on the horizon
const TREES = [90, 250, 430, 660, 880, 1090, 1280, 1490].map((x, index) => ({
  x,
  y: 790 - (index % 3) * 14,
  r: 46 + (index % 4) * 9,
}))

/**
 * Round speed sign on its post
 * @param {object} props - Place and limit
 * @return {JSX.Element}
 */

const Sign = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect
      x="-5"
      y="40"
      width="10"
      height="90"
      rx="3"
      style={{ fill: 'var(--stopgo-asphalt-deep)' }}
    />
    <circle r="50" style={{ fill: 'var(--play-stopgo)' }} />
    <circle r="36" style={{ fill: 'var(--stopgo-kerb-white)' }} />
    <text
      y="13"
      textAnchor="middle"
      fontSize="36"
      fontWeight="900"
      style={{ fill: 'var(--stopgo-asphalt-deep)' }}
    >
      100
    </text>
  </g>
)

/**
 * Hub scenery of Stop & Go
 * @type {ScenerySet}
 */

export const STOPGO_SET: ScenerySet = {
  halo: '--stopgo-sky',
  far: TREES.map((tree) => (
    <g key={tree.x}>
      <circle cx={tree.x} cy={tree.y} r={tree.r} style={{ fill: 'var(--stopgo-grass-deep)' }} />
      <circle
        cx={tree.x - tree.r * 0.25}
        cy={tree.y - tree.r * 0.3}
        r={tree.r * 0.6}
        style={{ fill: 'var(--stopgo-grass)' }}
      />
    </g>
  )),
  near: (
    <>
      <StopGoCircuits circuits={NEAR_CIRCUITS} />
      <g className="play-scenery-bob">
        <Sign x={1420} y={560} />
      </g>
    </>
  ),
  top: (
    <>
      <StopGoCircuits circuits={TOP_CIRCUITS} />
      <g className="play-road-bunting">
        <path
          d={`M0 8Q800 62 1600 8`}
          strokeWidth="3"
          fill="none"
          style={{ stroke: 'var(--stopgo-asphalt-deep)' }}
        />
        {BUNTING.map((flag) => (
          <path
            key={flag.x}
            d={`M${flag.x} ${10 + flag.sag}h44l-22 40z`}
            style={{ fill: `var(${flag.fill})` }}
          />
        ))}
      </g>
    </>
  ),
}
