import { iso, LudoDieArt, LudoPawnArt, LudoTable } from '@/composites/play/ludo/art/ludoBoard'
import { LUDO_BANNER } from '@/declarations/play/ludo/banner'
import { PLAY_HUB } from '@/declarations/ui/variants'

const ID = 'ludo-hub'
const VIEW = LUDO_BANNER.frames.banner
const DUR = `${LUDO_BANNER.cycle}s`
// Share of the loop the die tumbles before the walk
const ROLL = 0.18
const WALK = 0.8

/**
 * Hop keyframes: each cell reached through a lifted midpoint
 * @return {{ values: string; keyTimes: string }} - SMIL values
 */

const hopPath = () => {
  const points = LUDO_BANNER.hops.map(([u, v]) => iso(VIEW, u + 0.5, v + 0.5))
  const values = [points[0], points[0]]
  const times = [0, ROLL]
  const step = (WALK - ROLL) / (points.length - 1)
  points.slice(1).forEach((point, index) => {
    const from = points[index]
    values.push([(from[0] + point[0]) / 2, (from[1] + point[1]) / 2 - VIEW.cell * 0.9], point)
    times.push(ROLL + step * (index + 0.5), ROLL + step * (index + 1))
  })
  values.push(points[points.length - 1], points[0])
  times.push(0.97, 1)

  return {
    values: values.map((point) => point.join(' ')).join(';'),
    keyTimes: times.map((time) => time.toFixed(4)).join(';'),
  }
}

/**
 * Hub ground of Ludo: a lacquered board on a wooden table, the die tumbling then a pawn hopping its count
 * @return {JSX.Element}
 */

export const LudoHubBanner = () => {
  const { values, keyTimes } = hopPath()

  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className={PLAY_HUB.groundArt}
      aria-hidden="true"
    >
      <LudoTable view={VIEW} id={ID} width={1600} height={900} />
      {LUDO_BANNER.pawns.slice(1).map((pawn) => {
        const [x, y] = iso(VIEW, pawn.u + 0.5, pawn.v + 0.5)

        return (
          <LudoPawnArt
            key={`${pawn.u}-${pawn.v}`}
            x={x}
            y={y}
            token={pawn.token}
            cell={VIEW.cell}
          />
        )
      })}
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          dur={DUR}
          repeatCount="indefinite"
          values={values}
          keyTimes={keyTimes}
          calcMode="spline"
          keySplines={Array.from(
            { length: keyTimes.split(';').length - 1 },
            () => '0.3 0 0.7 1'
          ).join(';')}
        />
        <LudoPawnArt x={0} y={0} token="--play-ludo-red" cell={VIEW.cell * 1.15} />
      </g>

      {/* Die thrown on the table, tumbling then settling */}
      <g transform={`translate(${VIEW.die.x} ${VIEW.die.y})`}>
        <ellipse
          cy={VIEW.cell * 1.6}
          rx={VIEW.cell * 1.4}
          ry={VIEW.cell * 0.4}
          fill="black"
          opacity="0.3"
        />
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            dur={DUR}
            repeatCount="indefinite"
            values={`-260 -200;-120 -20;-60 -70;0 0;0 0;-260 -200`}
            keyTimes={`0;0.07;0.12;${ROLL};0.97;1`}
            additive="sum"
          />
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              dur={DUR}
              repeatCount="indefinite"
              values="-200;-60;-20;0;0;-200"
              keyTimes={`0;0.07;0.12;${ROLL};0.97;1`}
            />
            <LudoDieArt size={VIEW.cell * 1.3} />
          </g>
        </g>
      </g>
    </svg>
  )
}
