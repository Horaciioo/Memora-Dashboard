import { Avatar } from '@/components/elements/display/Avatar'
import type { NavalCaptainView } from '@/composites/play/naval/captains'
import { squareName } from '@/core/lib/play/naval/sea'
import type { NavalShotView } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_FEED_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BOARD, NAVAL_RESULT } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

// Lines kept in the log
const FEED_SIZE = 8

// Feed template of each result code
const LINES = [
  NAVAL_FEED_COPY.MISS,
  NAVAL_FEED_COPY.HIT,
  NAVAL_FEED_COPY.SUNK,
  NAVAL_FEED_COPY.SPOTTED,
  NAVAL_FEED_COPY.CLEAR,
] as const

/**
 * Line of the log for a shot
 * @param {NavalShotView} shot - Shot
 * @param {NavalCaptainView[]} captains - Captains
 * @return {string} - Sentence
 */

const lineOf = (shot: NavalShotView, captains: NavalCaptainView[]): string =>
  `${captains[shot.shooter]?.name ?? ''} ${fillPlayMessage(LINES[shot.code], {
    square: squareName(shot.x, shot.y),
    victim: captains[shot.target]?.name ?? '',
  }).replaceAll('*', '')}`

/**
 * Standings and log of the shots, for tables without a bracket
 * @param {Object} props - Side panel
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {NavalShotView[]} props.shown - Shots shown
 * @param {number} props.match - Match on screen
 * @param {number} props.total - Ships per fleet
 * @param {(seat: number) => number} props.afloatOf - Ships afloat of a captain
 * @return {JSX.Element}
 */

export const NavalSide = ({
  captains,
  shown,
  match,
  afloatOf,
}: {
  captains: NavalCaptainView[]
  shown: NavalShotView[]
  match: number
  afloatOf: (seat: number) => number
}) => {
  const log = shown
    .filter((shot) => shot.match === match)
    .slice(-FEED_SIZE)
    .toReversed()

  return (
    <>
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
      {log.length > 0 && (
        <div className={NAVAL_BOARD.panel}>
          <ul
            className="flex flex-col gap-1 text-xs font-semibold text-[var(--play-naval-ink-soft)]"
            aria-live="off"
          >
            {log.map((shot) => (
              <li key={shot.rev}>{lineOf(shot, captains)}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
