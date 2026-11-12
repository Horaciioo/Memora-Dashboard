import { LudoPawn } from '@/composites/play/ludo/LudoPawn'
import type { LudoCornerName } from '@/declarations/play/ludo/board'
import { LUDO_BOARD_COPY } from '@/declarations/play/ludo/copy'
import { LUDO_JOKER } from '@/declarations/ui/variants'

/**
 * Small pawn with the number of pawns home
 * @param {Object} props - Count
 * @param {LudoCornerName} props.colour - Colour
 * @param {number} props.count - Pawns home
 * @return {JSX.Element}
 */

export const LudoHomeCount = ({ colour, count }: { colour: LudoCornerName; count: number }) => (
  <span className={LUDO_JOKER.home} title={LUDO_BOARD_COPY.homeCount}>
    <LudoPawn colour={colour} className={LUDO_JOKER.homePawn} />
    {count}
  </span>
)
