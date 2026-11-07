import { Avatar } from '@/components/elements/display/Avatar'
import AppLink from '@/components/elements/navigation/AppLink'
import { ROUTES } from '@/declarations/navigation'
import { fillPlayMessage, PLAY_HISTORY_COPY } from '@/declarations/play'
import { PLAY_HISTORY } from '@/declarations/ui/variants'
import type { PlayHistoryEntry } from '@/types/play'
import { cn } from '@/utils/classnames'

/**
 * Final standing of a finished game, with a way to replay it
 * @param {Object} props - Table
 * @param {PlayHistoryEntry} props.entry - Game
 * @param {boolean} [props.isOwn] - Listed player is the viewer, else named
 * @return {JSX.Element}
 */

export const PlayHistoryTable = ({
  entry,
  isOwn = true,
}: {
  entry: PlayHistoryEntry
  isOwn?: boolean
}) => (
  <div className={PLAY_HISTORY.detail}>
    <ol className={PLAY_HISTORY.standing}>
      {entry.table.map((seat) => (
        <li
          key={seat.accountId}
          className={cn(PLAY_HISTORY.seat, seat.isMe && PLAY_HISTORY.seatMe)}
        >
          <span className={PLAY_HISTORY.place}>{seat.rank ?? '-'}</span>
          <Avatar name={seat.name} src={seat.avatarUrl} size="xs" />
          <span className={PLAY_HISTORY.seatName}>
            {seat.isMe && isOwn ? PLAY_HISTORY_COPY.you : seat.name}
            {seat.isBot && <span className={PLAY_HISTORY.botTag}>{PLAY_HISTORY_COPY.bot}</span>}
          </span>
          <span className={PLAY_HISTORY.seatScore}>
            {fillPlayMessage(PLAY_HISTORY_COPY.score, { score: seat.score })}
          </span>
        </li>
      ))}
    </ol>
    <AppLink href={ROUTES.playSession(entry.sessionId)} className={PLAY_HISTORY.replay}>
      {PLAY_HISTORY_COPY.replay}
    </AppLink>
  </div>
)
