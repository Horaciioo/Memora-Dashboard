import { memo, useId } from 'react'

import { squareOf, TRACK, turnPoint } from '@/core/lib/play/ludo'
import { LUDO_CORNERS, LUDO_LAYOUT } from '@/declarations/play/ludo/board'
import { LUDO_BOARD } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Middle of the board, cell units
const MIDDLE = LUDO_LAYOUT.size / 2
// Grid stroke, cell units
const LINE = 0.025
// Yard inset and hole size, cell units
const YARD_INSET = 0.55
const HOLE = 0.48
// Star radii, cell units
const STAR = { outer: 0.32, inner: 0.14 }

// Gold sheen of a held star, light to deep
const GOLD_STOPS = [
  ['0', '--play-ludo-gold-light'],
  ['0.45', '--play-ludo-gold'],
  ['1', '--play-ludo-gold-deep'],
] as const

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
 * @return {JSX.Element}
 */

const CornerArt = ({ corner }: { corner: number }) => {
  const colour = LUDO_CORNERS[corner]
  const size = LUDO_LAYOUT.yard
  const [startRow, startColumn] = LUDO_LAYOUT.quarter[0]

  return (
    <g transform={`rotate(${corner * 90} ${MIDDLE} ${MIDDLE})`}>
      {/* Yard and its holes */}
      <rect width={size} height={size} fill={tone(colour)} />
      <rect
        x={YARD_INSET}
        y={YARD_INSET}
        width={size - YARD_INSET * 2}
        height={size - YARD_INSET * 2}
        rx="0.22"
        fill={tone(colour, '-deep')}
      />
      {LUDO_LAYOUT.yardSpots.map(([y, x]) => (
        <circle key={`${y}:${x}`} cx={x} cy={y} r={HOLE} fill={tone(colour, '-hole')} />
      ))}

      {/* Start square and coloured lane */}
      {[[startRow, startColumn] as const, ...LUDO_LAYOUT.lane].map(([row, column]) => (
        <rect
          key={`${row}:${column}`}
          x={column}
          y={row}
          width="1"
          height="1"
          fill={tone(colour)}
          stroke="var(--play-ludo-line)"
          strokeWidth={LINE}
        />
      ))}

      {/* Centre triangle */}
      <polygon
        points={`${size},${size} ${size},${LUDO_LAYOUT.size - size} ${MIDDLE},${MIDDLE}`}
        fill={tone(colour)}
      />
    </g>
  )
}

/**
 * Board drawn in cell units: yards, track, lanes, centre, arrows and stars
 * @param {Object} props - Board
 * @param {number} props.turns - Quarter turns toward the viewer
 * @param {number} props.lit - Stars with a pawn, one bit per corner
 * @return {JSX.Element}
 */

export const LudoBoardDrawing = ({ turns, lit }: { turns: number; lit: number }) => {
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
            x={column}
            y={row}
            width="1"
            height="1"
            fill="var(--play-ludo-board)"
            stroke="var(--play-ludo-line)"
            strokeWidth={LINE}
          />
        ))}
        {LUDO_CORNERS.map((_, corner) => (
          <CornerArt key={corner} corner={corner} />
        ))}

        {/* Arrows into each lane */}
        {LUDO_CORNERS.map((colour, corner) => (
          <path
            key={colour}
            d={ARROW}
            transform={`rotate(${corner * 90} ${MIDDLE} ${MIDDLE}) translate(${entryColumn} ${entryRow})`}
            fill="var(--play-ludo-board)"
            stroke={tone(colour)}
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
            <polygon
              points={starPoints(x, y)}
              fill="none"
              stroke={isLit ? 'var(--play-ludo-star-lit-line)' : 'var(--play-ludo-star)'}
              strokeWidth="0.045"
              strokeLinejoin="round"
            />
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
 * @return {JSX.Element}
 */

const Grid = ({ turns, lit }: { turns: number; lit: number }) => (
  <svg
    viewBox={`0 0 ${LUDO_LAYOUT.size} ${LUDO_LAYOUT.size}`}
    className={LUDO_BOARD.grid}
    aria-hidden="true"
  >
    <LudoBoardDrawing turns={turns} lit={lit} />
  </svg>
)

/**
 * Board drawing, redrawn only when the view turns or a star lights
 * @type {React.MemoExoticComponent}
 */

export const LudoGrid = memo(Grid)
