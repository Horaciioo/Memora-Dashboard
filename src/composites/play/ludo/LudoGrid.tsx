import { memo, useId } from 'react'

import { chaosKindOf, squareOf, TRACK, turnPoint } from '@/core/lib/play/ludo'
import { LUDO_CORNERS, LUDO_LAYOUT } from '@/declarations/play/ludo/board'
import { LUDO_BOARD, LUDO_CHAOS_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Middle of the board, cell units
const MIDDLE = LUDO_LAYOUT.size / 2
// Grid stroke, cell units
const LINE = 0.025
// Rounded tile: gap round it and corner radius, cell units
const TILE = { gap: 0.05, radius: 0.24 }
// Yard inset and hole size, cell units
const YARD_INSET = 0.55
const HOLE = 0.48
// Star radii, cell units
const STAR = { outer: 0.34, inner: 0.17 }

// Gold sheen of a held star, light to deep
const GOLD_STOPS = [
  ['0', '--play-ludo-gold-light'],
  ['0.45', '--play-ludo-gold'],
  ['1', '--play-ludo-gold-deep'],
] as const

// Marks of the action squares, drawn around their centre
const SPARKLE = 'M0 -0.3L0.08 -0.08L0.3 0L0.08 0.08L0 0.3L-0.08 0.08L-0.3 0L-0.08 -0.08Z'
const BOLT = 'M0.08 -0.3L-0.18 0.05H-0.02L-0.08 0.3L0.18 -0.07H0.02Z'

// Arrow into the lane, drawn in its cell
const ARROW = 'M0.16 0.4H0.52V0.22L0.85 0.5L0.52 0.78V0.6H0.16Z'

/**
 * Five point star around a point
 * @param {number} x - Centre x
 * @param {number} y - Centre y
 * @return {string} - Points
 */

const starPoints = (x: number, y: number): string =>
  Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 ? STAR.inner : STAR.outer
    const angle = (Math.PI / 5) * index - Math.PI / 2

    return `${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`
  }).join(' ')

/**
 * Colour token of a corner
 * @param {string} colour - Corner colour
 * @param {string} [shade] - Token suffix
 * @return {string} - CSS value
 */

const tone = (colour: string, shade = ''): string => `var(--play-ludo-${colour}${shade})`

/**
 * One corner as the top left one draws it, turned into place
 * @param {Object} props - Corner
 * @param {number} props.corner - Corner index
 * @param {number} props.shown - Colour drawn there
 * @return {JSX.Element}
 */

const CornerArt = ({ corner, shown }: { corner: number; shown: number }) => {
  const colour = LUDO_CORNERS[shown]
  const size = LUDO_LAYOUT.yard
  const [startRow, startColumn] = LUDO_LAYOUT.quarter[0]

  return (
    <g transform={`rotate(${corner * 90} ${MIDDLE} ${MIDDLE})`}>
      {/* Yard and its holes */}
      <rect
        width={size}
        height={size}
        className={LUDO_CHAOS_PIECES.recolor}
        style={{ fill: tone(colour) }}
      />
      <rect
        x={YARD_INSET}
        y={YARD_INSET}
        width={size - YARD_INSET * 2}
        height={size - YARD_INSET * 2}
        rx="0.22"
        className={LUDO_CHAOS_PIECES.recolor}
        style={{ fill: tone(colour, '-deep') }}
      />
      {LUDO_LAYOUT.yardSpots.map(([y, x]) => (
        <circle
          key={`${y}:${x}`}
          cx={x}
          cy={y}
          r={HOLE}
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill: tone(colour, '-hole') }}
        />
      ))}

      {/* Start square and coloured lane */}
      {[[startRow, startColumn] as const, ...LUDO_LAYOUT.lane].map(([row, column]) => (
        <rect
          key={`${row}:${column}`}
          x={column + TILE.gap}
          y={row + TILE.gap}
          width={1 - TILE.gap * 2}
          height={1 - TILE.gap * 2}
          rx={TILE.radius}
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill: tone(colour) }}
        />
      ))}

      {/* Centre triangle */}
      <polygon
        points={`${size},${size} ${size},${LUDO_LAYOUT.size - size} ${MIDDLE},${MIDDLE}`}
        className={LUDO_CHAOS_PIECES.recolor}
        style={{ fill: tone(colour) }}
      />
    </g>
  )
}

/**
 * Board drawn in cell units: yards, track, lanes, centre, arrows and stars
 * @param {Object} props - Board
 * @param {number} props.turns - Quarter turns toward the viewer
 * @param {number} props.lit - Stars with a pawn, one bit per corner
 * @param {number[]} props.palette - Colour drawn at each corner
 * @param {boolean} props.isChaos - Action squares shown
 * @return {JSX.Element}
 */

export const LudoBoardDrawing = ({
  turns,
  lit,
  palette,
  isChaos,
}: {
  turns: number
  lit: number
  palette: readonly number[]
  isChaos: boolean
}) => {
  const [entryRow, entryColumn] = LUDO_LAYOUT.entry
  const gold = useId()

  return (
    <>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map(([offset, token]) => (
            <stop key={offset} offset={offset} style={{ stopColor: `var(${token})` }} />
          ))}
        </linearGradient>
      </defs>
      <g transform={`rotate(${turns * 90} ${MIDDLE} ${MIDDLE})`}>
        {/* Plain track squares */}
        {TRACK.map(([row, column]) => (
          <rect
            key={`${row}:${column}`}
            x={column + TILE.gap}
            y={row + TILE.gap}
            width={1 - TILE.gap * 2}
            height={1 - TILE.gap * 2}
            rx={TILE.radius}
            fill="var(--play-ludo-board)"
            stroke="var(--play-ludo-line)"
            strokeWidth={LINE}
          />
        ))}
        {LUDO_CORNERS.map((_, corner) => (
          <CornerArt key={corner} corner={corner} shown={palette[corner]} />
        ))}

        {/* Arrows into each lane */}
        {LUDO_CORNERS.map((colour, corner) => (
          <path
            key={colour}
            d={ARROW}
            transform={`rotate(${corner * 90} ${MIDDLE} ${MIDDLE}) translate(${entryColumn} ${entryRow})`}
            fill="var(--play-ludo-board)"
            className={LUDO_CHAOS_PIECES.recolor}
            style={{ stroke: tone(LUDO_CORNERS[palette[corner]]) }}
            strokeWidth="0.05"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* Stars stay upright whatever the turn */}
      {LUDO_CORNERS.map((colour, corner) => {
        const [row, column] = TRACK[squareOf(corner, LUDO_LAYOUT.starOffset)]
        const [y, x] = turnPoint([row + 0.5, column + 0.5], turns)

        const isLit = Boolean(lit & (1 << corner))

        return (
          <g key={colour}>
            {/* Inside the grid lines, so the square keeps its size */}
            <rect
              x={x - 0.5 + LINE / 2}
              y={y - 0.5 + LINE / 2}
              width={1 - LINE}
              height={1 - LINE}
              fill={`url(#${gold})`}
              className={cn(LUDO_BOARD.starCell, isLit && LUDO_BOARD.starLit)}
            />
            {/* Soft rounded star: pale when free, gilded and swollen when held, its points left showing around the pawn */}
            <polygon
              points={starPoints(x, y)}
              fill={isLit ? `url(#${gold})` : 'var(--play-ludo-star)'}
              stroke={isLit ? 'var(--play-ludo-star-lit-line)' : 'var(--play-ludo-star)'}
              strokeWidth={isLit ? 0.05 : 0.1}
              strokeLinejoin="round"
              className={cn(LUDO_BOARD.starShape, isLit && LUDO_BOARD.starShapeLit)}
            />
          </g>
        )
      })}

      {/* Action squares stay upright whatever the turn */}
      {isChaos &&
        TRACK.map(([row, column], square) => {
          const kind = chaosKindOf(square)
          if (!kind) return null
          const [y, x] = turnPoint([row + 0.5, column + 0.5], turns)

          return (
            <g
              key={square}
              transform={`translate(${x} ${y})`}
              className={cn(
                LUDO_CHAOS_PIECES.mark,
                kind === 'bonus' ? 'ludo-mark-bonus' : 'ludo-mark-malus'
              )}
            >
              {/* Bonus is a round violet disc, malus a red diamond: shape and tone both differ */}
              {kind === 'bonus' ? (
                <circle r="0.43" />
              ) : (
                <rect
                  x="-0.31"
                  y="-0.31"
                  width="0.62"
                  height="0.62"
                  rx="0.12"
                  transform="rotate(45)"
                />
              )}
              <path d={kind === 'bonus' ? SPARKLE : BOLT} />
            </g>
          )
        })}
    </>
  )
}

/**
 * Board on screen, scaled to its frame
 * @param {Object} props - Board
 * @param {number} props.turns - Quarter turns toward the viewer
 * @param {number} props.lit - Stars with a pawn, one bit per corner
 * @param {string} props.palette - Colours per corner, joined
 * @param {boolean} props.isChaos - Action squares shown
 * @return {JSX.Element}
 */

const Grid = ({
  turns,
  lit,
  palette,
  isChaos,
}: {
  turns: number
  lit: number
  palette: string
  isChaos: boolean
}) => (
  <svg
    viewBox={`0 0 ${LUDO_LAYOUT.size} ${LUDO_LAYOUT.size}`}
    className={LUDO_BOARD.grid}
    aria-hidden="true"
  >
    <LudoBoardDrawing
      turns={turns}
      lit={lit}
      palette={palette.split(',').map(Number)}
      isChaos={isChaos}
    />
  </svg>
)

/**
 * Board drawing, redrawn only when the view turns or a star lights
 * @type {React.MemoExoticComponent}
 */

export const LudoGrid = memo(Grid)
