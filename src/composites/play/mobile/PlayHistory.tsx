import { Avatar } from '@/components/elements/display/Avatar'
import { PlayGameLogo } from '@/composites/play/brand/PlayGameLogo'
import { PlayHistoryTable } from '@/composites/play/mobile/PlayHistoryTable'
import { ICONS } from '@/declarations/ui/icons'
import {
  fillPlayMessage,
  historyFactLabel,
  PLAY_GAMES,
  PLAY_HISTORY_COPY,
  PLAY_MOBILE_COPY,
} from '@/declarations/play'
import { PLAY_HISTORY } from '@/declarations/ui/variants'
import type { PlayHistoryEntry } from '@/types/play'
import { formatDayTime } from '@/utils/format/time/dates'
import { formatPlayDuration } from '@/utils/format/time/playDuration'

// Avatars shown before the count
const AVATARS_SHOWN = 4

/**
 * Finished games, newest first, each one opens its table
 * @param {Object} props - History
 * @param {PlayHistoryEntry[]} props.entries - Games
 * @param {boolean} [props.isFiltered] - A game filter is on
 * @param {boolean} [props.isOwn] - Games of the viewer, else of another player
 * @return {JSX.Element}
 */

export const PlayHistory = ({
  entries,
  isFiltered = false,
  isOwn = true,
}: {
  entries: PlayHistoryEntry[]
  isFiltered?: boolean
  isOwn?: boolean
}) => {
  const Chevron = ICONS.discordChevron

  if (entries.length === 0)
    return (
      <p className={PLAY_HISTORY.empty}>
        {isFiltered ? PLAY_HISTORY_COPY.emptyGame : PLAY_MOBILE_COPY.historyEmpty}
      </p>
    )

  return (
    <ul className={PLAY_HISTORY.list}>
      {entries.map((entry) => {
        const others = entry.table.filter((seat) => !seat.isMe)
        const duration = formatPlayDuration(entry.durationSeconds)

        return (
          <li key={entry.sessionId}>
            <details className={PLAY_HISTORY.card}>
              <summary className={PLAY_HISTORY.row}>
                <PlayGameLogo game={entry.game} className={PLAY_HISTORY.logo} />
                <span className={PLAY_HISTORY.body}>
                  <span className={PLAY_HISTORY.game}>{PLAY_GAMES.label(entry.game)}</span>
                  <span className={PLAY_HISTORY.meta}>
                    {formatDayTime(entry.finishedAt)}
                    {duration && ` · ${duration}`}
                    {entry.rank !== null &&
                      ` · ${fillPlayMessage(PLAY_MOBILE_COPY.historyRank, { rank: entry.rank, players: entry.players })}`}
                  </span>
                  <span className={PLAY_HISTORY.faces}>
                    {others.slice(0, AVATARS_SHOWN).map((seat) => (
                      <Avatar
                        key={seat.accountId}
                        name={seat.name}
                        src={seat.avatarUrl}
                        size="xs"
                        title={seat.isBot ? `${seat.name} · ${PLAY_HISTORY_COPY.bot}` : seat.name}
                      />
                    ))}
                    {others.length > AVATARS_SHOWN && (
                      <span className={PLAY_HISTORY.more}>+{others.length - AVATARS_SHOWN}</span>
                    )}
                  </span>
                </span>
                <span className={PLAY_HISTORY.side}>
                  {entry.outcome && (
                    <span className={PLAY_HISTORY[entry.outcome]}>
                      {PLAY_MOBILE_COPY[`outcome${entry.outcome}`]}
                    </span>
                  )}
                  {entry.fact && (
                    <span className={PLAY_HISTORY.fact}>
                      {fillPlayMessage(PLAY_HISTORY_COPY.fact, {
                        label: historyFactLabel(entry.game, entry.fact.key),
                        value: entry.fact.value,
                      })}
                    </span>
                  )}
                  <span className={PLAY_HISTORY.xp}>
                    {fillPlayMessage(PLAY_MOBILE_COPY.historyXp, { xp: entry.xp })}
                  </span>
                </span>
                <Chevron className={PLAY_HISTORY.chevron} aria-hidden="true" />
              </summary>
              <PlayHistoryTable entry={entry} isOwn={isOwn} />
            </details>
          </li>
        )
      })}
    </ul>
  )
}
