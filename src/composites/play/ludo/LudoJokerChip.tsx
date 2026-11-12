import { LudoJokerArt } from '@/composites/play/ludo/LudoJokerArt'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_JOKER } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'

/**
 * Small joker card with the number left
 * @param {Object} props - Chip
 * @param {number} props.count - Jokers left
 * @return {JSX.Element}
 */

export const LudoJokerChip = ({ count }: { count: number }) => (
  <span
    className={cn(LUDO_JOKER.chip, count === 0 && LUDO_JOKER.chipEmpty)}
    title={LUDO_CHAOS_UI.jokerCount}
  >
    <span className={LUDO_JOKER.chipCount}>{count}</span>
    <span className={LUDO_JOKER.chipCard}>
      <LudoJokerArt />
    </span>
  </span>
)
