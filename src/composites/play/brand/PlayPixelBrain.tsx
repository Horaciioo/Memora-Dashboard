import { PIXEL_BRAIN } from '@/declarations/play/pixelArt'

// Colour steps, top to bottom
const BANDS = ['--color-brand-300', '--color-brand-400', '--color-brand-500', '--color-brand-600']

export interface PlayPixelBrainProps {
  className?: string
}

/**
 * Official Memora Play logo: the pixel brain, shaded in bands
 * @param {PlayPixelBrainProps} props - Size classes
 * @return {JSX.Element}
 */

export const PlayPixelBrain = ({ className }: PlayPixelBrainProps) => (
  <svg
    viewBox={`0 0 ${PIXEL_BRAIN[0].length} ${PIXEL_BRAIN.length}`}
    className={className}
    shapeRendering="crispEdges"
    aria-hidden="true"
  >
    {PIXEL_BRAIN.flatMap((row, y) => {
      const band = Math.min(BANDS.length - 1, Math.floor((y / PIXEL_BRAIN.length) * BANDS.length))

      return [...row].map((cell, x) =>
        cell === 'X' ? (
          <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={`var(${BANDS[band]})`} />
        ) : null
      )
    })}
  </svg>
)
