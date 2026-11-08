import { Avatar } from '@/components/elements/display/Avatar'
import type { NavalCaptainView } from '@/composites/play/naval/setup/captains'
import type { NavalBoardState } from '@/core/lib/play/naval/state'
import { fillPlayMessage } from '@/declarations/play/copy'
import { NAVAL_BOARD_COPY, NAVAL_ROUND_COPY } from '@/declarations/play/naval/copy'
import { NAVAL_BRACKET } from '@/declarations/ui/variants/naval'
import { cn } from '@/utils/classnames'

/**
 * Name of a round counting back from the final
 * @param {number} round - Round, from zero
 * @param {number} rounds - Rounds of the bracket
 * @return {string} - Name
 */

const roundName = (round: number, rounds: number): string => {
  const left = rounds - round
  if (left === 1) return NAVAL_ROUND_COPY.final
  if (left === 2) return NAVAL_ROUND_COPY.semi
  if (left === 3) return NAVAL_ROUND_COPY.quarter

  return fillPlayMessage(NAVAL_ROUND_COPY.round, { number: round + 1 })
}

/**
 * Bracket of a tournament: rounds from the first to the final, live matches lit
 * @param {Object} props - Bracket
 * @param {NavalBoardState} props.board - Board
 * @param {NavalCaptainView[]} props.captains - Captains
 * @param {number} props.watched - Match on screen
 * @param {number} props.viewer - Seat of the viewer
 * @param {(match: number) => void} props.onWatch - Watch a match
 * @return {JSX.Element}
 */

export const NavalBracket = ({
  board,
  captains,
  watched,
  viewer,
  onWatch,
}: {
  board: NavalBoardState
  captains: NavalCaptainView[]
  watched: number
  viewer: number
  onWatch: (match: number) => void
}) => {
  const rounds = Math.max(...board.matches.map((match) => match.round), 0) + 1
  const total = Math.ceil(
    Math.log2(Math.max(2, board.matches.filter((m) => m.round === 0).length * 2))
  )

  return (
    <div className={NAVAL_BRACKET.root}>
      {Array.from({ length: rounds }, (_, round) => (
        <div key={round} className={NAVAL_BRACKET.round}>
          <span className={NAVAL_BRACKET.roundTitle}>
            {roundName(round, Math.max(total, rounds))}
          </span>
          {board.matches.map((match, index) =>
            match.round !== round ? null : (
              <button
                key={match.id}
                type="button"
                className={cn(
                  NAVAL_BRACKET.match,
                  match.status === 'LIVE' && NAVAL_BRACKET.matchLive,
                  match.fighters.includes(viewer) && NAVAL_BRACKET.matchMine,
                  index === watched && 'ring-1 ring-[var(--play-naval-reticle)]'
                )}
                disabled={match.fighters.length < 2}
                onClick={() => onWatch(index)}
              >
                {match.fighters.map((seat) => {
                  const captain = captains[seat]

                  return (
                    <span
                      key={seat}
                      className={cn(
                        NAVAL_BRACKET.side,
                        match.winner === seat && NAVAL_BRACKET.sideWon,
                        match.status === 'DONE' && match.winner !== seat && NAVAL_BRACKET.sideLost
                      )}
                    >
                      <Avatar name={captain.name} src={captain.avatarUrl} size="xs" />
                      <span className={NAVAL_BRACKET.name}>{captain.name}</span>
                    </span>
                  )
                })}
                {match.fighters.length < 2 && (
                  <span className={NAVAL_BRACKET.note}>{NAVAL_BOARD_COPY.bye}</span>
                )}
              </button>
            )
          )}
        </div>
      ))}
    </div>
  )
}
