import { fillPlayMessage, PLAY_GAMES } from '@/declarations/play'
import { PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import { PLAY_MEMBER } from '@/declarations/ui/variants'
import type { PlayTotalsView } from '@/types/play'

export interface PlayProgressListProps {
  global: PlayTotalsView
  games: (PlayTotalsView & { game: string })[]
}

/**
 * One progression line
 * @param {Object} props - Line
 * @param {string} props.label - Game name
 * @param {PlayTotalsView} props.totals - Totals
 * @return {JSX.Element}
 */

const ProgressRow = ({ label, totals }: { label: string; totals: PlayTotalsView }) => (
  <div className={PLAY_MEMBER.row}>
    <span className={PLAY_MEMBER.game}>{label}</span>
    <span className={PLAY_MEMBER.figure}>
      {fillPlayMessage(PLAY_MEMBER_COPY.level, { level: totals.level.level })}
    </span>
    <span className={PLAY_MEMBER.muted}>
      {fillPlayMessage(PLAY_MEMBER_COPY.xp, { xp: totals.xp })}
    </span>
    <span className={PLAY_MEMBER.muted}>
      {fillPlayMessage(PLAY_MEMBER_COPY.record, {
        wins: totals.wins,
        draws: totals.draws,
        losses: totals.losses,
      })}
    </span>
  </div>
)

/**
 * Levels of a moderator, global then per game
 * @param {PlayProgressListProps} props - Totals
 * @return {JSX.Element}
 */

export const PlayProgressList = ({ global, games }: PlayProgressListProps) => (
  <div className={PLAY_MEMBER.rows}>
    <ProgressRow label={PLAY_MEMBER_COPY.global} totals={global} />
    {games
      .filter(
        (entry) =>
          PLAY_GAMES.has(entry.game) &&
          (entry.played > 0 || entry.xp > 0 || PLAY_GAMES.get(entry.game).playable)
      )
      .map((entry) => (
        <ProgressRow
          key={entry.game}
          label={PLAY_GAMES.has(entry.game) ? PLAY_GAMES.label(entry.game) : entry.game}
          totals={entry}
        />
      ))}
  </div>
)
