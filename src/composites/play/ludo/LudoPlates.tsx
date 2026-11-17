import { LudoPlate } from '@/composites/play/ludo/LudoPlate'
import type { LudoRanked } from '@/composites/play/ludo/LudoResult'
import type { LudoMap } from '@/core/lib/play/ludo/maps'
import { isHomeStep } from '@/core/lib/play/ludo/track'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import type { LudoEffectName } from '@/declarations/play/ludo/chaos'
import { LUDO_PLATE } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Colour with its face and crown
 * @typedef {Object} LudoSeatFace
 */

export interface LudoSeatFace extends LudoRanked {
  isHost: boolean
}

// Effects of a colour worth a chip on its plate
export const effectsOf = (seat: LudoSeatFace, isMine: boolean): LudoEffectName[] =>
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
  // Player holding the die, null during the countdown
  turnId: string | null
  viewerId: string
  clock: { clock: number; isAlert: boolean }
  // Colour each player is drawn in, null outside Chaos mode
  looks: Record<string, number>
  isChaos: boolean
  // Player losing a turn
  stalledId: string | null
  className?: string
}

/**
 * Players in a line, each with the colour they play
 * @param {LudoPlatesProps} props - Players
 * @return {JSX.Element}
 */

export const LudoPlates = ({
  map,
  seats,
  turnId,
  viewerId,
  clock,
  looks,
  isChaos,
  stalledId,
  className,
}: LudoPlatesProps) => (
  <div className={cn(LUDO_PLATE.row, className)}>
    {seats.map((seat) => (
      <LudoPlate
        key={seat.accountId}
        colour={LUDO_CORNERS[looks[seat.accountId] ?? seat.corner]}
        face={seat}
        turn={seat.accountId === turnId ? clock : null}
        home={seat.pawns.filter((step) => isHomeStep(map, step)).length}
        joker={isChaos ? seat.joker : null}
        effects={isChaos ? effectsOf(seat, seat.accountId === viewerId) : []}
        isStalled={seat.accountId === stalledId}
      />
    ))}
  </div>
)
