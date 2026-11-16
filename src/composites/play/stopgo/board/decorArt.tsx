import type { ReactNode } from 'react'

import type { StopGoDecorItem } from '@/core/lib/play/stopgo'
import type { StopGoDecorKind } from '@/declarations/play/stopgo/track'

const shade = (token: string, share: number) => `color-mix(in srgb, var(${token}) ${share}%, black)`

const tone = (share: number, light: number) =>
  `color-mix(in srgb, color-mix(in srgb, var(--stopgo-grass-deep) ${share}%, black) ${100 - light}%, white)`

// Points of a regular polygon
const ring = (sides: number, radius: number, turn = 0) =>
  Array.from({ length: sides }, (_, index) => {
    const angle = turn + (index / sides) * Math.PI * 2

    return `${(Math.cos(angle) * radius).toFixed(1)},${(Math.sin(angle) * radius).toFixed(1)}`
  }).join(' ')

// Leaf marks scattered on a crown, offsets in radius shares
const LEAVES = [
  [-0.38, -0.34],
  [0.1, -0.5],
  [-0.1, -0.05],
  [0.42, -0.12],
  [-0.46, 0.2],
  [0.2, 0.3],
] as const

/**
 * Broadleaf tree, a trunk under a crown of lobes cut in a lit side and a shaded side
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Broadleaf = ({ radius }: StopGoDecorItem) => (
  <g>
    <ellipse
      cx={radius * 0.34}
      cy={radius * 0.4}
      rx={radius * 1.05}
      ry={radius * 0.88}
      fill="black"
      opacity="0.22"
    />
    <rect
      x={-radius * 0.12}
      y={radius * 0.1}
      width={radius * 0.24}
      height={radius * 0.7}
      rx={radius * 0.05}
      style={{ fill: 'color-mix(in srgb, var(--stopgo-asphalt-deep) 70%, #8a5a2b)' }}
    />
    {[
      [-0.48, 0.1, 0.52],
      [0.48, 0.12, 0.5],
      [0, -0.4, 0.56],
      [0, 0.22, 0.64],
    ].map(([x, y, size]) => (
      <circle
        key={`${x}-${y}`}
        cx={radius * x}
        cy={radius * y}
        r={radius * size}
        style={{ fill: tone(78, 0) }}
      />
    ))}
    <circle
      cx={-radius * 0.1}
      cy={-radius * 0.08}
      r={radius * 0.7}
      style={{ fill: tone(100, 0) }}
    />
    <path
      d={`M0 ${-radius * 0.78}A${radius * 0.78} ${radius * 0.78} 0 0 0 ${-radius * 0.1} ${radius * 0.7}A${radius * 0.45} ${radius * 0.78} 0 0 1 0 ${-radius * 0.78}z`}
      style={{ fill: tone(100, 22) }}
      opacity="0.8"
      transform={`translate(${-radius * 0.1} ${-radius * 0.08}) scale(0.9)`}
    />
    <circle
      cx={-radius * 0.3}
      cy={-radius * 0.34}
      r={radius * 0.28}
      style={{ fill: tone(100, 42) }}
      opacity="0.75"
    />
    {LEAVES.map(([x, y]) => (
      <path
        key={`${x}-${y}`}
        d={`M0 ${-radius * 0.1}L${radius * 0.08} ${radius * 0.05}L${-radius * 0.08} ${radius * 0.05}z`}
        transform={`translate(${radius * x} ${radius * y})`}
        fill="white"
        opacity="0.3"
      />
    ))}
  </g>
)

/**
 * Pine, stacked layers of a star seen from above, left half lit and right half shaded
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Pine = ({ radius }: StopGoDecorItem) => (
  <g>
    <ellipse
      cx={radius * 0.34}
      cy={radius * 0.4}
      rx={radius * 0.95}
      ry={radius * 0.85}
      fill="black"
      opacity="0.22"
    />
    {[
      [1, 62],
      [0.74, 80],
      [0.48, 100],
    ].map(([size, share], layer) => (
      <g key={layer} transform={`translate(${-radius * 0.04 * layer} ${-radius * 0.08 * layer})`}>
        <polygon points={ring(9, radius * size, layer * 0.35)} style={{ fill: tone(share, 0) }} />
        <polygon
          points={`0,0 ${ring(9, radius * size, layer * 0.35)
            .split(' ')
            .slice(5, 8)
            .join(' ')}`}
          style={{ fill: tone(share, 20) }}
          opacity="0.75"
        />
        <polygon
          points={ring(9, radius * size * 0.5, layer * 0.35 + 0.2)}
          style={{ fill: tone(share, 12) }}
          opacity="0.55"
        />
      </g>
    ))}
    <circle
      cx={-radius * 0.12}
      cy={-radius * 0.18}
      r={radius * 0.1}
      style={{ fill: tone(100, 55) }}
    />
  </g>
)

/**
 * Tree, one of two kinds by the tilt of the piece
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Tree = (item: StopGoDecorItem) => (item.tilt < 0.4 ? Pine(item) : Broadleaf(item))

/**
 * Bush
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Bush = ({ radius }: StopGoDecorItem) => (
  <g>
    <ellipse
      cx={radius * 0.2}
      cy={radius * 0.3}
      rx={radius}
      ry={radius * 0.7}
      fill="black"
      opacity="0.18"
    />
    <circle
      cx={-radius * 0.3}
      r={radius * 0.7}
      style={{ fill: shade('--stopgo-grass-deep', 88) }}
    />
    <circle
      cx={radius * 0.32}
      cy={radius * 0.05}
      r={radius * 0.64}
      style={{ fill: shade('--stopgo-grass-deep', 80) }}
    />
    <circle
      cx={-radius * 0.1}
      cy={-radius * 0.18}
      r={radius * 0.52}
      style={{ fill: 'var(--stopgo-grass)' }}
    />
  </g>
)

/**
 * Rock
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Rock = ({ radius, tilt }: StopGoDecorItem) => (
  <g transform={`rotate(${tilt * 90})`}>
    <ellipse
      cx={radius * 0.25}
      cy={radius * 0.3}
      rx={radius}
      ry={radius * 0.7}
      fill="black"
      opacity="0.2"
    />
    <path
      d={`M${-radius} ${radius * 0.2}L${-radius * 0.5} ${-radius * 0.7}L${radius * 0.4} ${-radius * 0.8}L${radius} ${radius * 0.1}L${radius * 0.3} ${radius * 0.7}z`}
      style={{ fill: 'var(--stopgo-asphalt-lit)' }}
    />
    <path
      d={`M${-radius * 0.5} ${-radius * 0.7}L${radius * 0.4} ${-radius * 0.8}L${radius * 0.1} ${-radius * 0.1}L${-radius * 0.7} ${radius * 0.05}z`}
      fill="white"
      opacity="0.2"
    />
  </g>
)

/**
 * Grandstand with a roof and rows of seats
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Stand = ({ radius }: StopGoDecorItem) => (
  <g>
    <rect
      x={-radius}
      y={-radius * 0.5}
      width={radius * 2.1}
      height={radius * 1.1}
      rx="6"
      fill="black"
      opacity="0.2"
    />
    <rect
      x={-radius}
      y={-radius * 0.5}
      width={radius * 2}
      height={radius}
      rx="6"
      style={{ fill: 'var(--stopgo-kerb-white)' }}
    />
    {[0.1, 0.34, 0.58, 0.82].map((row) => (
      <rect
        key={row}
        x={-radius * 0.9}
        y={-radius * 0.5 + radius * row}
        width={radius * 1.8}
        height={radius * 0.12}
        rx="3"
        style={{ fill: 'var(--play-stopgo)', opacity: 0.55 + row * 0.4 }}
      />
    ))}
    <rect
      x={-radius}
      y={-radius * 0.58}
      width={radius * 2}
      height={radius * 0.16}
      rx="4"
      style={{ fill: 'var(--play-stopgo-deep)' }}
    />
  </g>
)

/**
 * Pit building with garage doors
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Pit = ({ radius }: StopGoDecorItem) => (
  <g>
    <rect
      x={-radius}
      y={-radius * 0.45}
      width={radius * 2.1}
      height={radius * 0.95}
      rx="6"
      fill="black"
      opacity="0.2"
    />
    <rect
      x={-radius}
      y={-radius * 0.45}
      width={radius * 2}
      height={radius * 0.9}
      rx="6"
      style={{ fill: 'var(--stopgo-asphalt-lit)' }}
    />
    <rect
      x={-radius}
      y={-radius * 0.45}
      width={radius * 2}
      height={radius * 0.22}
      rx="6"
      style={{ fill: 'var(--play-stopgo)' }}
    />
    {[-0.62, -0.2, 0.22, 0.64].map((door) => (
      <rect
        key={door}
        x={radius * (door - 0.16)}
        y={-radius * 0.1}
        width={radius * 0.32}
        height={radius * 0.5}
        rx="3"
        style={{ fill: 'var(--stopgo-asphalt-deep)' }}
      />
    ))}
  </g>
)

/**
 * Lake with a pale rim
 * @param {StopGoDecorItem} item - Piece
 * @return {JSX.Element}
 */

const Lake = ({ radius }: StopGoDecorItem) => (
  <g>
    <ellipse
      rx={radius}
      ry={radius * 0.72}
      style={{ fill: 'var(--stopgo-kerb-white)' }}
      opacity="0.7"
    />
    <ellipse rx={radius * 0.93} ry={radius * 0.65} style={{ fill: 'var(--stopgo-sky)' }} />
    <ellipse
      cx={-radius * 0.25}
      cy={-radius * 0.18}
      rx={radius * 0.4}
      ry={radius * 0.12}
      fill="white"
      opacity="0.5"
    />
  </g>
)

/**
 * Drawing per scenery kind
 * @type {Record<StopGoDecorKind, (item: StopGoDecorItem) => ReactNode>}
 */

export const DECOR_ART: Record<StopGoDecorKind, (item: StopGoDecorItem) => ReactNode> = {
  tree: Tree,
  bush: Bush,
  rock: Rock,
  stand: Stand,
  pit: Pit,
  lake: Lake,
}
