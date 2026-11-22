import type { CSSProperties } from 'react'

export interface PixelArtProps {
  rows: string[]
  className?: string
  style?: CSSProperties
}

/**
 * Square-block art in the current colour
 * @param {PixelArtProps} props - Rows of X and dots
 * @return {JSX.Element}
 */

export const PixelArt = ({ rows, className, style }: PixelArtProps) => (
  <svg
    viewBox={`0 0 ${rows[0].length} ${rows.length}`}
    className={className}
    style={style}
    fill="currentColor"
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {rows.flatMap((row, y) =>
      [...row].map((cell, x) =>
        cell === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" /> : null
      )
    )}
  </svg>
)
