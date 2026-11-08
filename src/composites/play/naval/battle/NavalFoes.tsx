import { Avatar } from '@/components/elements/display/Avatar'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_FOES } from '@/declarations/ui/variants/games/naval'
import { cn } from '@/utils/classnames'

/**
 * Captain as a chip
 * @typedef {Object} NavalFoeChip
 */

export interface NavalFoeChip {
  captain: NavalCaptainView
  // Ships afloat in this match
  afloat: number
  isOut: boolean
  isTurn: boolean
  isHit: boolean
}

/**
 * Chips of the captains facing the viewer: pick the sea to aim at
 * @param {Object} props - Foes
 * @param {NavalFoeChip[]} props.chips - Captains
 * @param {number} props.total - Ships per fleet
 * @param {number | null} props.selected - Captain aimed at
 * @param {boolean} props.canPick - Chips act as buttons
 * @param {(index: number) => void} props.onPick - Pick a sea
 * @return {JSX.Element}
 */

export const NavalFoes = ({
  chips,
  total,
  selected,
  canPick,
  onPick,
}: {
  chips: NavalFoeChip[]
  total: number
  selected: number | null
  canPick: boolean
  onPick: (index: number) => void
}) => (
  <div className={NAVAL_FOES.row}>
    {chips.map(({ captain, afloat, isOut, isTurn, isHit }) => (
      <button
        key={captain.accountId}
        type="button"
        disabled={!canPick || isOut}
        aria-pressed={selected === captain.index}
        className={cn(
          NAVAL_FOES.chip,
          selected === captain.index && NAVAL_FOES.chipOn,
          isOut && NAVAL_FOES.chipOut,
          isTurn && NAVAL_FOES.chipTurn,
          isHit && NAVAL_FOES.chipHit
        )}
        onClick={() => onPick(captain.index)}
      >
        <Avatar name={captain.name} src={captain.avatarUrl} size="sm" />
        <span className={NAVAL_FOES.text}>
          <span className={NAVAL_FOES.name}>{captain.name}</span>
          <span className={NAVAL_FOES.note}>
            {isOut
              ? captain.hasLeft
                ? NAVAL_BOARD_COPY.left
                : NAVAL_BOARD_COPY.eliminated
              : fillPlayMessage(NAVAL_BOARD_COPY.shipsLeft, { count: afloat })}
          </span>
          {!isOut && (
            <span className={NAVAL_FOES.pips} aria-hidden="true">
              {Array.from({ length: total }, (_, ship) => (
                <i key={ship} className={cn(NAVAL_FOES.pip, ship >= afloat && NAVAL_FOES.pipOff)} />
              ))}
            </span>
          )}
        </span>
      </button>
    ))}
  </div>
)
