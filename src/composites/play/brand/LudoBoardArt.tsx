import { useId } from 'react'

import { LudoBoardDrawing } from '@/composites/play/ludo/LudoGrid'
import { LudoPawnShape } from '@/composites/play/ludo/LudoPawn'
import { squareOf, TRACK, turnPoint } from '@/core/lib/play/ludo'
import { LUDO_LAYOUT } from '@/declarations/play/ludo/board'
import type { LudoCell, LudoCornerName } from '@/declarations/play/ludo/board'

// Board corner radius, cell units
const RADIUS = 1.1
// Pawn width, cell units
const PAWN = 1.5
// Pawn grid and its foot
const PAWN_GRID = { width: 40, footX: 20, footY: 22 }
// Five on the die, 0 to 1
const PIPS = [
  [0.27, 0.27],
  [0.73, 0.27],
  [0.5, 0.5],
  [0.27, 0.73],
  [0.73, 0.73],
]

/**
 * Centre of a cell
 * @param {LudoCell} cell - Grid cell
 * @return {LudoCell} - Point
 */

const centreOf = ([row, column]: LudoCell): LudoCell => [row + 0.5, column + 0.5]

// Pawns of the scene: one on a star, one on the way, one still home
const STAR_CORNER = 1
const SCENE_PAWNS: { colour: LudoCornerName; point: LudoCell }[] = [
  {
    colour: 'red',
    point: centreOf(TRACK[squareOf(STAR_CORNER, LUDO_LAYOUT.starOffset)]),
  },
  { colour: 'blue', point: centreOf(TRACK[squareOf(0, 9)]) },
  { colour: 'yellow', point: turnPoint(LUDO_LAYOUT.yardSpots[0], 3) },
]

/**
 * Place of a piece
 * @typedef {Object} LudoArtSpot
 */

export interface LudoArtSpot {
  x: number
  y: number
  size: number
  angle: number
}

/**
 * Real board tilted on a backdrop, pawns standing on it and a die beside
 * @param {Object} props - Scene
 * @param {LudoArtSpot} props.board - Board centre, side and tilt
 * @param {LudoArtSpot} props.die - Die centre, side and tilt
 * @param {string} props.tone - Game colour token
 * @return {JSX.Element}
 */

export const LudoBoardArt = ({
  board,
  die,
  tone,
}: {
  board: LudoArtSpot
  die: LudoArtSpot
  tone: string
}) => {
  const clip = useId()
  const cells = LUDO_LAYOUT.size
  const scale = board.size / cells
  const half = cells / 2

  return (
    <>
      <g transform={`translate(${board.x} ${board.y}) rotate(${board.angle}) scale(${scale})`}>
        <clipPath id={clip}>
          <rect x={-half} y={-half} width={cells} height={cells} rx={RADIUS} />
        </clipPath>
        <rect
          x={-half + 0.25}
          y={-half + 0.7}
          width={cells}
          height={cells}
          rx={RADIUS}
          style={{ fill: `var(${tone}-deep)` }}
        />
        <g clipPath={`url(#${clip})`}>
          <g transform={`translate(${-half} ${-half})`}>
            <LudoBoardDrawing turns={0} lit={0} />
          </g>
        </g>
        {SCENE_PAWNS.map(({ colour, point: [y, x] }) => (
          <g
            key={colour}
            transform={`translate(${x - half} ${y - half}) rotate(${-board.angle}) scale(${PAWN / PAWN_GRID.width}) translate(${-PAWN_GRID.footX} ${-PAWN_GRID.footY})`}
          >
            <LudoPawnShape colour={colour} />
          </g>
        ))}
      </g>

      <g transform={`translate(${die.x} ${die.y}) rotate(${die.angle})`}>
        <rect
          x={-die.size / 2}
          y={-die.size / 2 + die.size * 0.14}
          width={die.size}
          height={die.size}
          rx={die.size * 0.22}
          fill="var(--play-ludo-die-side)"
        />
        <rect
          x={-die.size / 2}
          y={-die.size / 2}
          width={die.size}
          height={die.size}
          rx={die.size * 0.22}
          fill="var(--play-ludo-die)"
        />
        {PIPS.map(([px, py]) => (
          <circle
            key={`${px}:${py}`}
            cx={(px - 0.5) * die.size}
            cy={(py - 0.5) * die.size}
            r={die.size * 0.085}
            fill="var(--play-ludo-pip)"
          />
        ))}
      </g>
    </>
  )
}
