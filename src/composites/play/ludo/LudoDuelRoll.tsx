import { LudoDie } from '@/composites/play/ludo/LudoDie'
import { LUDO_CHAOS_UI } from '@/declarations/play/ludo/copy'
import { LUDO_DUEL } from '@/declarations/ui/variants'

/**
 * Own die of a duel or a storm, thrown by tapping it
 * @param {Object} props - Throw
 * @param {() => void} props.onRoll - Throw it
 * @param {string} [props.label] - Words over the die
 * @return {JSX.Element}
 */

export const LudoDuelRoll = ({
  onRoll,
  label = LUDO_CHAOS_UI.duelRoll,
}: {
  onRoll: () => void
  label?: string
}) => (
  <div className={LUDO_DUEL.roll} role="alertdialog" aria-label={label}>
    <LudoDie face={null} isRolling={false} canRoll onRoll={onRoll} />
    <span className={LUDO_DUEL.rollHint}>{label}</span>
  </div>
)
