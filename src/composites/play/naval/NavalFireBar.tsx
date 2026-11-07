import { squareName } from '@/core/lib/play/naval/sea'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_FIRE } from '@/declarations/ui/variants/naval'

/**
 * Aim readout and the fire key, always on screen so the thumb finds it
 * @param {Object} props - Bar
 * @param {{ x: number; y: number } | null} props.aim - Square aimed at
 * @param {boolean} props.canFire - Key lit
 * @param {boolean} props.isSending - Shell leaving
 * @param {string} props.hint - Sentence when no square is aimed
 * @param {() => void} props.onFire - Fire
 * @return {JSX.Element}
 */

export const NavalFireBar = ({
  aim,
  canFire,
  isSending,
  hint,
  onFire,
}: {
  aim: { x: number; y: number } | null
  canFire: boolean
  isSending: boolean
  hint: string
  onFire: () => void
}) => (
  <div className={NAVAL_FIRE.bar}>
    <div className={NAVAL_FIRE.target}>
      <span className={NAVAL_FIRE.square}>{aim ? squareName(aim.x, aim.y) : '--'}</span>
      <span className={NAVAL_FIRE.hint}>{hint}</span>
    </div>
    <button
      type="button"
      className={NAVAL_FIRE.fire}
      disabled={!canFire || !aim || isSending}
      aria-label={
        aim
          ? fillPlayMessage(NAVAL_BOARD_COPY.fireKey, { square: squareName(aim.x, aim.y) })
          : NAVAL_BOARD_COPY.fire
      }
      onClick={onFire}
    >
      {NAVAL_BOARD_COPY.fire}
    </button>
  </div>
)
