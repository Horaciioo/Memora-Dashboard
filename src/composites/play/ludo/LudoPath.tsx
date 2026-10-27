import type { CSSProperties } from 'react'

import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import { pawnPoint, turnPoint, YARD_STEP } from '@/core/lib/play/ludo'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_PIECES } from '@/declarations/ui/variants'

export interface LudoPathProps {
  corner: number
  pawn: number
  from: number
  to: number
  // View turn
  turns: number
}

/**
 * Footprints from the aimed pawn to its square, a ghost pawn where it lands, for its player only
 * @param {LudoPathProps} props - Move
 * @return {JSX.Element}
 */

export const LudoPath = ({ corner, pawn, from, to, turns }: LudoPathProps) => {
  const first = from <= YARD_STEP ? to : from + 1
  const steps = Array.from({ length: to - first + 1 }, (_, index) => first + index)
  const colour = LUDO_CORNERS[corner]

  return (
    <>
      {steps.map((step, index) => {
        const [y, x] = turnPoint(pawnPoint(corner, step, pawn), turns)
        const isLast = step === to
        const place = {
          '--x': x,
          '--y': y,
          '--rank': index,
          '--pawn-tone': `var(--play-ludo-${colour})`,
        } as CSSProperties

        return isLast ? (
          <span key={step} className={LUDO_PIECES.ghost} style={place}>
            <LudoPawn colour={colour} />
          </span>
        ) : (
          <span key={step} className={LUDO_PIECES.trail} style={place} />
        )
      })}
    </>
  )
}
