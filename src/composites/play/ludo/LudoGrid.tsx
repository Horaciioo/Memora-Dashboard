import { memo, useId } from 'react'

import {
  chaosKindOf,
  LUDO_MAPS,
  polarPoint,
  squareOf,
  STAR_PARTS,
  turnPoint,
} from '@/core/lib/play/ludo'
import type { LudoMap } from '@/core/lib/play/ludo'
import { LUDO_CORNERS, LUDO_LAYOUT, LUDO_STAR } from '@/declarations/play/ludo/board'
import { LUDO_BOARD, LUDO_CHAOS_PIECES } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

// Grid stroke, cell units
const LINE = 0.025
// Rounded tile of each board: side and corner radius, cell units
const TILES = {
  cross: { gap: 0.05, radius: 0.24 },
  star: { gap: LUDO_STAR.tile.gap / 2, radius: LUDO_STAR.tile.radius },
}
// Action marks shrink on the star, whose tiles are smaller
const MARK_SCALE = { cross: 1, star: 0.88 }
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
// Same arrow around its own middle, pointing right
const ARROW_CENTRED = 'M-0.34 -0.1H0.02V-0.28L0.35 0L0.02 0.28V0.1H-0.34Z'

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
  const middle = LUDO_LAYOUT.size / 2
  const tile = TILES.cross

  return (
    <g transform={`rotate(${corner * 90} ${middle} ${middle})`}>
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
          x={column + tile.gap}
          y={row + tile.gap}
          width={1 - tile.gap * 2}
          height={1 - tile.gap * 2}
          rx={tile.radius}
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill: tone(colour) }}
        />
      ))}

      {/* Centre triangle */}
      <polygon
        points={`${size},${size} ${size},${LUDO_LAYOUT.size - size} ${middle},${middle}`}
        className={LUDO_CHAOS_PIECES.recolor}
        style={{ fill: tone(colour) }}
      />
    </g>
  )
}

/**
 * Square tile centred on a point, turned to face along the track
 * @param {Object} props - Tile
 * @param {LudoCell} props.at - Centre
 * @param {number} props.angle - Degrees
 * @param {LudoMap['name']} props.board - Board drawn
 * @param {string} [props.fill] - Fill token
 * @return {JSX.Element}
 */

const Tile = ({
  at: [y, x],
  angle,
  board,
  fill,
}: {
  at: readonly [number, number]
  angle: number
  board: LudoMap['name']
  fill?: string
}) => {
  const { gap, radius } = TILES[board]
  const side = 1 - gap * 2

  return (
    <rect
      x={-side / 2}
      y={-side / 2}
      width={side}
      height={side}
      rx={radius}
      transform={`translate(${x} ${y}) rotate(${angle})`}
      {...(fill
        ? { className: LUDO_CHAOS_PIECES.recolor, style: { fill } }
        : { fill: 'var(--play-ludo-board)', stroke: 'var(--play-ludo-line)', strokeWidth: LINE })}
    />
  )
}

/**
 * One arm of the star as the first one draws it, turned into place: yard, start, lane and centre wedge
 * @param {Object} props - Arm
 * @param {number} props.corner - Arm index
 * @param {number} props.shown - Colour drawn there
 * @return {JSX.Element}
 */

const ArmArt = ({ corner, shown }: { corner: number; shown: number }) => {
  const map = LUDO_MAPS.star
  const { size, yard, yardGap, wedge } = LUDO_STAR
  const colour = LUDO_CORNERS[shown]
  const axis = STAR_PARTS.axisOf(0)
  const middle = size / 2
  const [yardY, yardX] = polarPoint(size, STAR_PARTS.apothem + 0.5 + yardGap + yard / 2, axis)
  // The wedge points where the lane ends, which lies a square off the axis
  const [laneY, laneX] = map.lane[map.lane.length - 1]
  const aim = (Math.atan2(laneX - middle, middle - laneY) * 180) / Math.PI
  const [baseY, baseX] = polarPoint(size, wedge.base, aim)
  const [sideY, sideX] = polarPoint(size, wedge.half, aim + 90)
  const [offsetY, offsetX] = [sideY - middle, sideX - middle]
  const inset = 0.5
  const fill = tone(colour)

  return (
    <g transform={`rotate(${corner * (360 / map.corners)} ${middle} ${middle})`}>
      {/* Yard and its holes */}
      <g transform={`translate(${yardX} ${yardY}) rotate(${axis})`}>
        <rect
          x={-yard / 2}
          y={-yard / 2}
          width={yard}
          height={yard}
          rx="0.45"
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill }}
        />
        <rect
          x={-yard / 2 + inset}
          y={-yard / 2 + inset}
          width={yard - inset * 2}
          height={yard - inset * 2}
          rx="0.3"
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill: tone(colour, '-deep') }}
        />
      </g>
      {map.yardSpots.map(([y, x]) => (
        <circle
          key={`${y}:${x}`}
          cx={x}
          cy={y}
          r={HOLE}
          className={LUDO_CHAOS_PIECES.recolor}
          style={{ fill: tone(colour, '-hole') }}
        />
      ))}

      {/* Start square, coloured lane and centre wedge */}
      <Tile at={map.branch!.points[0]!} angle={map.angles[0]} board="star" fill={fill} />
      {map.lane.map((at) => (
        <Tile key={`${at[0]}:${at[1]}`} at={at} angle={axis} board="star" fill={fill} />
      ))}
      <polygon
        points={`${middle},${middle} ${baseX + offsetX},${baseY + offsetY} ${baseX - offsetX},${baseY - offsetY}`}
        className={LUDO_CHAOS_PIECES.recolor}
        style={{ fill }}
      />
    </g>
  )
}

/**
 * Board drawn in cell units: yards, track, lanes, centre, arrows and stars
 * @param {Object} props - Board
 * @param {LudoMap} props.map - Board drawn
 * @param {number} props.turns - Corner steps toward the viewer
 * @param {number} props.lit - Stars with a pawn, one bit per corner
 * @param {number[]} props.palette - Colour drawn at each corner
 * @param {boolean} props.isChaos - Action squares shown
 * @return {JSX.Element}
 */

export const LudoBoardDrawing = ({
  map,
  turns,
  lit,
  palette,
  isChaos,
}: {
  map: LudoMap
  turns: number
  lit: number
  palette: readonly number[]
  isChaos: boolean
}) => {
  const [entryRow, entryColumn] = LUDO_LAYOUT.entry
  const gold = useId()
  const middle = map.size / 2
  const turnDegrees = 360 / map.corners
  const isStar = map.name === 'star'
  const corners = Array.from({ length: map.corners }, (_, corner) => corner)
  // The star's lane leaves from the square just behind the first corner's start
  const [entryY, entryX] = map.track[map.length - 1]
  const tile = TILES[map.name]

  return (
    <>
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map(([offset, token]) => (
            <stop key={offset} offset={offset} style={{ stopColor: `var(${token})` }} />
          ))}
        </linearGradient>
      </defs>
      <g transform={`rotate(${turns * turnDegrees} ${middle} ${middle})`}>
        {/* Soft plate under the star's track, so the white squares read on the white frame */}
        {isStar && (
          <polygon
            points={corners
              .map((corner) =>
                polarPoint(
                  map.size,
                  (STAR_PARTS.apothem + LUDO_STAR.plate) / Math.cos(Math.PI / map.corners),
                  corner * turnDegrees
                )
                  .toReversed()
                  .join(',')
              )
              .join(' ')}
            fill="var(--play-ludo-line)"
            fillOpacity="0.55"
            stroke="var(--play-ludo-line)"
            strokeOpacity="0.55"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        )}
        {/* Detours inside the track */}
        {map.branch?.points.map((at, square) =>
          at ? <Tile key={`b${square}`} at={at} angle={map.angles[square]} board="star" /> : null
        )}
        {/* Arrow in front of each detour, pointing to its first square */}
        {map.branch?.forks.map(({ point, angle }, arm) => (
          <g key={`f${arm}`}>
            <Tile at={point} angle={angle} board="star" />
            <path
              d={ARROW_CENTRED}
              transform={`translate(${point[1]} ${point[0]}) rotate(${angle}) scale(0.9)`}
              fill="var(--play-ludo-board)"
              className={LUDO_CHAOS_PIECES.recolor}
              style={{ stroke: tone(LUDO_CORNERS[palette[arm]]) }}
              strokeWidth="0.07"
              strokeLinejoin="round"
            />
          </g>
        ))}
        {/* Plain track squares */}
        {map.track.map((at, square) => (
          <Tile key={square} at={at} angle={map.angles[square]} board={map.name} />
        ))}
        {corners.map((corner) =>
          isStar ? (
            <ArmArt key={corner} corner={corner} shown={palette[corner]} />
          ) : (
            <CornerArt key={corner} corner={corner} shown={palette[corner]} />
          )
        )}

        {/* Arrows into each lane */}
        {!isStar &&
          corners.map((corner) => (
            <path
              key={corner}
              d={isStar ? ARROW_CENTRED : ARROW}
              transform={
                isStar
                  ? `rotate(${corner * turnDegrees} ${middle} ${middle}) translate(${entryX} ${entryY}) rotate(${STAR_PARTS.axisOf(0) + 90})`
                  : `rotate(${corner * turnDegrees} ${middle} ${middle}) translate(${entryColumn} ${entryRow})`
              }
              fill="var(--play-ludo-board)"
              className={LUDO_CHAOS_PIECES.recolor}
              style={{ stroke: tone(LUDO_CORNERS[palette[corner]]) }}
              strokeWidth="0.05"
              strokeLinejoin="round"
            />
          ))}
      </g>

      {/* Stars stay upright whatever the turn */}
      {corners.map((corner) => {
        const square = squareOf(map, corner, map.starOffset)
        const [y, x] = turnPoint(map, map.track[square], turns)
        const isLit = Boolean(lit & (1 << corner))
        const side = isStar ? 1 - tile.gap * 2 : 1 - LINE

        return (
          <g key={corner}>
            {/* Inside the grid lines, so the square keeps its size */}
            <rect
              x={-side / 2}
              y={-side / 2}
              width={side}
              height={side}
              transform={`translate(${x} ${y}) rotate(${isStar ? map.angles[square] + turns * turnDegrees : 0})`}
              rx={isStar ? tile.radius : 0}
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
        [
          ...map.track.map((at, square) => ({ at, square, kind: chaosKindOf(map, square) })),
          ...(map.branch?.points ?? []).map((at, square) => ({
            at,
            square,
            kind: at ? chaosKindOf(map, square, true) : null,
          })),
        ].map(({ at, kind }, index) => {
          if (!kind || !at) return null
          const [y, x] = turnPoint(map, at, turns)

          return (
            <g
              key={index}
              transform={`translate(${x} ${y}) scale(${MARK_SCALE[map.name]})`}
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
 * @param {LudoMap['name']} props.board - Board drawn
 * @param {number} props.turns - Corner steps toward the viewer
 * @param {number} props.lit - Stars with a pawn, one bit per corner
 * @param {string} props.palette - Colours per corner, joined
 * @param {boolean} props.isChaos - Action squares shown
 * @return {JSX.Element}
 */

const Grid = ({
  board,
  turns,
  lit,
  palette,
  isChaos,
}: {
  board: LudoMap['name']
  turns: number
  lit: number
  palette: string
  isChaos: boolean
}) => {
  const map = LUDO_MAPS[board]

  return (
    <svg viewBox={`0 0 ${map.size} ${map.size}`} className={LUDO_BOARD.grid} aria-hidden="true">
      <LudoBoardDrawing
        map={map}
        turns={turns}
        lit={lit}
        palette={palette.split(',').map(Number)}
        isChaos={isChaos}
      />
    </svg>
  )
}

/**
 * Board drawing, redrawn only when the view turns or a star lights
 * @type {React.MemoExoticComponent}
 */

export const LudoGrid = memo(Grid)
