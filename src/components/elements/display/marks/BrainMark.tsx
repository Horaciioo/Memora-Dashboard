import type { CSSProperties } from 'react'

import { BRAIN_PIECES, BRAIN_REACH } from '@/declarations/ui/brain'
import { cn } from '@/utils/classnames'

/**
 * How the lobes move
 * @type {'loop' | 'idle'}
 */

export type BrainMotion = 'loop' | 'idle'

export interface BrainMarkProps {
  className?: string
  // Stretches nonstop or now and then
  motion?: BrainMotion
}

/**
 * Memora brain, lobe by lobe
 * @param {string} [className] - Size classes
 * @param {BrainMotion} [motion] - Lobe motion
 * @return {JSX.Element}
 */

export const BrainMark = ({ className, motion = 'loop' }: BrainMarkProps) => (
  <span className={cn('brain-mark', className)} data-motion={motion} aria-hidden="true">
    {BRAIN_PIECES.map((piece, index) => (
      <span
        key={piece.src}
        className="brain-lobe"
        style={
          {
            left: `${piece.left}%`,
            top: `${piece.top}%`,
            width: `${piece.width}%`,
            height: `${piece.height}%`,
            backgroundImage: `url(${piece.src})`,
            '--x': BRAIN_REACH[index].x,
            '--y': BRAIN_REACH[index].y,
            '--o': BRAIN_REACH[index].order,
          } as CSSProperties
        }
      />
    ))}
  </span>
)
