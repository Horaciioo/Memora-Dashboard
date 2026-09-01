import { SEAL_BLOCK } from '@/declarations/ui/blocks'
import { cn } from '@/utils/classnames'

export interface SealGlyphProps {
  open?: boolean
  className?: string
}

// Shared stroke, geometry never travelling through a class
const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

// Drawing width, the right chain mirroring the left one across it
const SPAN = 96

// A link lies flat or stands on its edge, alternating down the pull
const FLAT_LINK = { width: 10, height: 6.4, y: 8.8 }
const EDGE_LINK = { width: 6.4, height: 10, y: 7 }

// Left edge of each link, overlapping its neighbour so the chain reads as one piece
const LINK_STARTS = [1.4, 9.2, 13.4, 21.2, 25.4]

// Shackle shut, then swung off its right leg
const SHACKLE_SHUT = 'M41.6 10.8V7.4a6.4 6.4 0 0 1 12.8 0v3.4'
const SHACKLE_OPEN = 'M41.6 10.8V7.4a6.4 6.4 0 0 1 11.8-3.6'

/**
 * Draw the links of one side of the chain
 * @param {boolean} mirrored - Runs to the right of the lock
 * @return {JSX.Element[]} - Chain links
 */

const chainLinks = (mirrored: boolean) =>
  LINK_STARTS.map((start, index) => {
    const link = index % 2 === 0 ? FLAT_LINK : EDGE_LINK

    return (
      <rect
        key={start}
        x={mirrored ? SPAN - start - link.width : start}
        y={link.y}
        width={link.width}
        height={link.height}
        rx={link.height / 2}
        {...LINE}
      />
    )
  })

/**
 * What a sealed value wears
 * @param {boolean} [open] - Seal has been lifted
 * @param {string} [className] - Extra classes merged onto the svg
 * @return {JSX.Element}
 */

export const SealGlyph = ({ open, className }: SealGlyphProps) => (
  <svg
    viewBox="0 0 96 24"
    className={cn(SEAL_BLOCK.glyph, className)}
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g className={cn(SEAL_BLOCK.chain, open && SEAL_BLOCK.chainOpen)}>
      <g className={cn(SEAL_BLOCK.chainSide, open && SEAL_BLOCK.chainSlackLeft)}>
        {chainLinks(false)}
      </g>
      <g className={cn(SEAL_BLOCK.chainSide, open && SEAL_BLOCK.chainSlackRight)}>
        {chainLinks(true)}
      </g>
    </g>

    <g className={SEAL_BLOCK.lock}>
      <path d={open ? SHACKLE_OPEN : SHACKLE_SHUT} {...LINE} />
      <rect
        x="36.6"
        y="10.8"
        width="22.8"
        height="11.4"
        rx="3"
        {...LINE}
        className={SEAL_BLOCK.body}
      />
      <circle cx="48" cy="15.2" r="1.7" {...LINE} />
      <path d="M48 16.9v2.5" {...LINE} />
    </g>
  </svg>
)
