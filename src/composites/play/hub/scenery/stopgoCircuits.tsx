import { StopGoCarShape } from '@/composites/play/stopgo/art/StopGoCarShape'
import { StopGoRoadStrip } from '@/composites/play/stopgo/art/StopGoRoadStrip'
import type { StopGoCarColor } from '@/declarations/play/stopgo/art'

export interface StopGoCircuit {
  // Centre line, in at one edge and out at another
  path: string
  // Cars driving it, with their lap length and head start
  cars: { color: StopGoCarColor; seconds: number; delay: number }[]
  // Trees along the road
  trees: { x: number; y: number; r: number }[]
}

// Tarmac width of a hub road
const ROAD = 46

// Bottom circuits, in the sharp layer
export const NEAR_CIRCUITS: StopGoCircuit[] = [
  {
    path: 'M-60 790H170A56 56 0 0 1 226 846V960',
    cars: [{ color: 'red', seconds: 7, delay: 0 }],
    trees: [
      { x: 70, y: 700, r: 34 },
      { x: 150, y: 905, r: 30 },
      { x: 330, y: 850, r: 38 },
      { x: 20, y: 880, r: 26 },
    ],
  },
  {
    path: 'M1660 700H1420A60 60 0 0 0 1360 760V800A50 50 0 0 1 1310 850H1180A50 50 0 0 0 1130 900V960',
    cars: [
      { color: 'blue', seconds: 9, delay: 1.5 },
      { color: 'yellow', seconds: 9, delay: 6 },
    ],
    trees: [
      { x: 1500, y: 620, r: 36 },
      { x: 1570, y: 800, r: 40 },
      { x: 1250, y: 760, r: 30 },
      { x: 1040, y: 840, r: 32 },
    ],
  },
]

// Top circuits, pinned under the bunting
export const TOP_CIRCUITS: StopGoCircuit[] = [
  {
    path: 'M120 -40V90A50 50 0 0 1 70 140H-60',
    cars: [{ color: 'green', seconds: 5, delay: 2 }],
    trees: [
      { x: 230, y: 130, r: 34 },
      { x: 40, y: 250, r: 30 },
    ],
  },
  {
    path: 'M1660 200H1480A60 60 0 0 1 1420 140V-40',
    cars: [{ color: 'red', seconds: 6, delay: 4 }],
    trees: [
      { x: 1330, y: 120, r: 32 },
      { x: 1560, y: 300, r: 36 },
    ],
  },
]

/**
 * Round tree seen from above
 * @param {object} props - Place and radius
 * @return {JSX.Element}
 */

const Tree = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <ellipse cx={x + r * 0.2} cy={y + r * 0.35} rx={r} ry={r * 0.9} fill="black" opacity="0.2" />
    <circle cx={x} cy={y} r={r} style={{ fill: 'var(--stopgo-grass-deep)' }} />
    <circle
      cx={x - r * 0.3}
      cy={y - r * 0.32}
      r={r * 0.58}
      style={{ fill: 'var(--stopgo-grass)' }}
    />
    <circle
      cx={x + r * 0.35}
      cy={y + r * 0.25}
      r={r * 0.3}
      style={{ fill: 'var(--stopgo-grass)', opacity: 0.7 }}
    />
  </g>
)

/**
 * Small circuits with their trees and cars driving them in a loop
 * @param {object} props - Circuits
 * @return {JSX.Element}
 */

export const StopGoCircuits = ({ circuits }: { circuits: StopGoCircuit[] }) => (
  <>
    {circuits.map((circuit) => (
      <g key={circuit.path}>
        <StopGoRoadStrip path={circuit.path} width={ROAD} />
        {circuit.trees.map((tree) => (
          <Tree key={`${tree.x}-${tree.y}`} {...tree} />
        ))}
        {circuit.cars.map((car) => (
          <g
            key={car.color}
            className="play-road-car"
            style={{
              offsetPath: `path('${circuit.path}')`,
              animationDuration: `${car.seconds}s`,
              animationDelay: `${car.delay}s`,
            }}
          >
            <g transform="scale(0.48)">
              <StopGoCarShape color={car.color} />
            </g>
          </g>
        ))}
      </g>
    ))}
  </>
)
