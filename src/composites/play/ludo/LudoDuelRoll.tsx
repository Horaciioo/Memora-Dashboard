import { LudoDie } from '@/composites/play/ludo/LudoDie'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_DUEL } from '@/declarations/ui/variants'

/**
 * Own die of a duel, thrown by tapping it
 * @param {Object} props - Duel throw
 * @param {() => void} props.onRoll - Throw it
 * @return {JSX.Element}
 */

export const LudoDuelRoll = ({ onRoll }: { onRoll: () => void }) => (
  <div className={LUDO_DUEL.roll} role="alertdialog" aria-label={LUDO_CHAOS_UI.duelRoll}>
    <LudoDie face={null} isRolling={false} canRoll onRoll={onRoll} />
    <span className={LUDO_DUEL.rollHint}>{LUDO_CHAOS_UI.duelRoll}</span>
  </div>
)
