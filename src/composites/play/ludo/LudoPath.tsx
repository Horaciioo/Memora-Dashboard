import type { CSSProperties } from 'react'

import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import { pawnPoint, turnPoint, walkSteps } from '@/core/lib/play/ludo'
import type { LudoMap } from '@/core/lib/play/ludo'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_PIECES } from '@/declarations/ui/variants'

export interface LudoPathProps {
  map: LudoMap
  corner: number
  pawn: number
  from: number
  to: number
  // View turn
  turns: number
  // The landing can be chosen
  onPick?: () => void
}

/**
 * Footprints from the aimed pawn to its square, a ghost pawn where it lands, for its player only
 * @param {LudoPathProps} props - Move
 * @return {JSX.Element}
 */

export const LudoPath = ({ map, corner, pawn, from, to, turns, onPick }: LudoPathProps) => {
  const steps = walkSteps(map, corner, from, to)
  const colour = LUDO_CORNERS[corner]

  return (
    <>
      {steps.map((step, index) => {
        const [y, x] = turnPoint(map, pawnPoint(map, corner, step, pawn), turns)
        const isLast = step === to
        const place = {
          '--x': x,
          '--y': y,
          '--rank': index,
          '--pawn-tone': `var(--play-ludo-${colour})`,
        } as CSSProperties

        return isLast ? (
          <span key={step} className={LUDO_PIECES.ghost} style={place}>
            {onPick ? (
              <button type="button" className={LUDO_PIECES.ghostButton} onClick={onPick}>
                <LudoPawn colour={colour} />
              </button>
            ) : (
              <LudoPawn colour={colour} />
            )}
          </span>
        ) : (
          <span key={step} className={LUDO_PIECES.trail} style={place} />
        )
      })}
    </>
  )
}
