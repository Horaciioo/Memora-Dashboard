import { Avatar } from '@/components/elements/display/Avatar'
import type { NavalCaptainView } from '@/composites/play/naval/captains'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD, NAVAL_RESULT } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Standings of a melee, the fleets still afloat first
 * @param {Object} props - Side panel
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {(seat: number) => number} props.afloatOf - Ships afloat of a captain
 * @return {JSX.Element}
 */

export const NavalSide = ({
  captains,
  afloatOf,
}: {
  captains: NavalCaptainView[]
  afloatOf: (seat: number) => number
}) => (
  <div className={cn(NAVAL_BOARD.panel, NAVAL_RESULT.list)}>
    <span className={NAVAL_BOARD.title}>{NAVAL_BOARD_COPY.standings}</span>
    {captains
      .toSorted(
        (a, b) => Number(a.isOut) - Number(b.isOut) || afloatOf(b.index) - afloatOf(a.index)
      )
      .map((captain) => (
        <div
          key={captain.accountId}
          className={cn(NAVAL_RESULT.row, captain.isOut && 'opacity-45')}
        >
          <Avatar name={captain.name} src={captain.avatarUrl} size="xs" />
          <span className={NAVAL_RESULT.name}>{captain.name}</span>
          <span className={NAVAL_RESULT.note}>
            {captain.isOut
              ? NAVAL_BOARD_COPY.eliminated
              : fillPlayMessage(NAVAL_BOARD_COPY.shipsLeft, { count: afloatOf(captain.index) })}
          </span>
        </div>
      ))}
  </div>
)
