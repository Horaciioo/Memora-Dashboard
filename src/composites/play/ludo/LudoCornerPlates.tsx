import { LudoPlate } from '@/composites/play/ludo/LudoPlate'
import { effectsOf } from '@/composites/play/ludo/LudoPlates'
import type { LudoPlatesProps } from '@/composites/play/ludo/LudoPlates'
import { isHomeStep } from '@/core/lib/play/ludo/track'
import { LUDO_CORNERS } from '@/declarations/play/ludo/board'
import { LUDO_BOARD, LUDO_CORNER_SLOTS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

export interface LudoCornerPlatesProps extends Omit<LudoPlatesProps, 'className'> {
  // View turn
  turns: number
}

/**
 * Each player beside their colour, around the board
 * @param {LudoCornerPlatesProps} props - Players
 * @return {JSX.Element}
 */

export const LudoCornerPlates = ({
  map,
  seats,
  turns,
  turnId,
  viewerId,
  clock,
  looks,
  isChaos,
  stalledId,
}: LudoCornerPlatesProps) => (
  <div className={LUDO_BOARD.corners}>
    {seats.map((seat) => (
      <div
        key={seat.accountId}
        className={cn(
          'absolute z-20',
          LUDO_CORNER_SLOTS[map.name as keyof typeof LUDO_CORNER_SLOTS][
            (seat.corner + turns) % map.corners
          ]
        )}
      >
        <LudoPlate
          colour={LUDO_CORNERS[looks[seat.accountId] ?? seat.corner]}
          face={seat}
          turn={seat.accountId === turnId ? clock : null}
          home={seat.pawns.filter((step) => isHomeStep(map, step)).length}
          joker={isChaos ? seat.joker : null}
          effects={isChaos ? effectsOf(seat, seat.accountId === viewerId) : []}
          isStalled={seat.accountId === stalledId}
        />
      </div>
    ))}
  </div>
)
