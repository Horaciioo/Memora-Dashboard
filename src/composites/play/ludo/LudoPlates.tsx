import type { ReactNode } from 'react'

import { LudoPlate } from '@/composites/play/ludo/LudoPlate'
import type { LudoRanked } from '@/composites/play/ludo/LudoResult'
import type { LudoMap } from '@/core/lib/play/ludo/maps'
import { isHomeStep } from '@/core/lib/play/ludo/track'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_SLOTS, LUDO_STAR_SLOTS } from '@/declarations/ui/variants'

// Screen places on the right edge, per board
const RIGHT_SLOTS: Record<string, Set<number>> = {
  cross: new Set([1, 2]),
  star: new Set([1, 2, 3]),
}
const SLOTS: Record<string, readonly string[]> = { cross: LUDO_SLOTS, star: LUDO_STAR_SLOTS }

/**
 * Colour with its face and crown
 * @typedef {Object} LudoSeatFace
 */

export interface LudoSeatFace extends LudoRanked {
  isHost: boolean
}

// Effects of a colour worth a chip on its plate
const effectsOf = (seat: LudoSeatFace, isMine: boolean): LudoEffectName[] =>
  (
    [
      seat.effects.ghost && 'ghost',
      seat.effects.chameleon && 'chameleon',
      seat.effects.faulty && 'faulty',
      seat.effects.blind && 'blind',
      seat.effects.skip && 'stall',
      seat.effects.double && 'double',
      isMine && seat.effects.boost && 'boost',
    ] as (LudoEffectName | 0 | false | null)[]
  ).filter((effect): effect is LudoEffectName => Boolean(effect))

export interface LudoPlatesProps {
  map: LudoMap
  seats: LudoSeatFace[]
  // View turn
  turns: number
  // Player holding the die, null during the countdown
  turnId: string | null
  viewerId: string
  clock: { clock: number; isAlert: boolean }
  die: ReactNode
  // Colour each player is drawn in, null outside Chaos mode
  looks: Record<string, number>
  isChaos: boolean
  // Player losing a turn
  stalledId: string | null
}

/**
 * A plate at each screen corner holding a colour
 * @param {LudoPlatesProps} props - Plates
 * @return {JSX.Element}
 */

export const LudoPlates = ({
  map,
  seats,
  turns,
  turnId,
  viewerId,
  clock,
  die,
  looks,
  isChaos,
  stalledId,
}: LudoPlatesProps) => (
  <>
    {SLOTS[map.name].map((place, slot) => {
      const seat = seats.find((entry) => (entry.corner + turns) % map.corners === slot)
      if (!seat) return null
      const isTurn = seat.accountId === turnId

      return (
        <div key={slot} className={place}>
          <LudoPlate
            colour={LUDO_CORNERS[looks[seat.accountId] ?? seat.corner]}
            isRight={RIGHT_SLOTS[map.name].has(slot)}
            face={seat}
            turn={isTurn ? clock : null}
            isMine={seat.accountId === viewerId}
            die={isTurn && die}
            home={seat.pawns.filter((step) => isHomeStep(map, step)).length}
            joker={isChaos ? seat.joker : null}
            effects={isChaos ? effectsOf(seat, seat.accountId === viewerId) : []}
            isStalled={seat.accountId === stalledId}
          />
        </div>
      )
    })}
  </>
)
