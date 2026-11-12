import type { ReactNode } from 'react'

import { LudoPlate } from '@/composites/play/ludo/LudoPlate'
import type { LudoRanked } from '@/composites/play/ludo/LudoResult'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_SLOTS } from '@/declarations/ui/variants'

// Screen corners on the right edge
const RIGHT_SLOTS = new Set([1, 2])

/**
 * Colour with its face and crown
 * @typedef {Object} LudoSeatFace
 */

export interface LudoSeatFace extends LudoRanked {
  isHost: boolean
}

export interface LudoPlatesProps {
  seats: LudoSeatFace[]
  // View turn
  turns: number
  // Player holding the die, null during the countdown
  turnId: string | null
  viewerId: string
  clock: { clock: number; isAlert: boolean }
  die: ReactNode
}

/**
 * A plate at each screen corner holding a colour
 * @param {LudoPlatesProps} props - Plates
 * @return {JSX.Element}
 */

export const LudoPlates = ({ seats, turns, turnId, viewerId, clock, die }: LudoPlatesProps) => (
  <>
    {LUDO_SLOTS.map((place, slot) => {
      const seat = seats.find((entry) => (entry.corner + turns) % LUDO_CORNERS.length === slot)
      if (!seat) return null
      const isTurn = seat.accountId === turnId

      return (
        <div key={slot} className={place}>
          <LudoPlate
            colour={LUDO_CORNERS[seat.corner]}
            isRight={RIGHT_SLOTS.has(slot)}
            face={seat}
            turn={isTurn ? clock : null}
            isMine={seat.accountId === viewerId}
            die={isTurn && die}
          />
        </div>
      )
    })}
  </>
)
