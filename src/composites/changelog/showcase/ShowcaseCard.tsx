import type { CSSProperties } from 'react'

import { BrainMark } from '@/components/elements/display/marks/BrainMark'
import { SHOWCASE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface ShowcaseCardProps {
  isOn: boolean
  // Sparks thrown around the mark
  sparks?: number
  isFinale?: boolean
}

// Distance the sparks fly
const REACH = '9rem'

/**
 * Wordless stage card
 * @param {boolean} isOn - Card showing
 * @param {number} [sparks] - Burst size
 * @param {boolean} [isFinale] - Closing look
 * @return {JSX.Element}
 */

export const ShowcaseCard = ({ isOn, sparks = 0, isFinale }: ShowcaseCardProps) => (
  <div
    className={cn(
      SHOWCASE.card,
      isFinale ? SHOWCASE.finaleCard : SHOWCASE.introCard,
      !isOn && SHOWCASE.cardOff
    )}
  >
    <BrainMark className={SHOWCASE.cardBrain} motion="idle" />
    {isOn && sparks > 0 && (
      <span className={SHOWCASE.finaleBurst} aria-hidden="true">
        {Array.from({ length: sparks }, (_, index) => (
          <span
            key={index}
            className={cn(SHOWCASE.spark, SHOWCASE.sparkTones[index % 3])}
            style={{ '--angle': `${(360 / sparks) * index}deg`, '--reach': REACH } as CSSProperties}
          />
        ))}
      </span>
    )}
  </div>
)
