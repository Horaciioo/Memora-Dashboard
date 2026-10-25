import { Avatar } from '@/components/elements/display/Avatar'
import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { BAC_SESSION_COPY, fillPlayMessage } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, PLAY_FEED_VERBS } from '@/declarations/ui/variants'
import { cn } from '@/utils/classnames'
import { formatClock } from '@/utils/format/modview'

// Preposition left out of the coloured verb
const TRAILING_WORD = /\s+(sur|de|à)\s*$/

/**
 * One line of a game feed
 * @typedef {Object} PlayFeedLine
 */

export interface PlayFeedLine {
  id: string
  kind: string
  accountId: string | null
  at: Date | string
  values: Record<string, number | string>
}

/**
 * What happened in the game, newest first
 * @param {Object} props - Feed
 * @param {PlayFeedLine[]} props.feed - Lines
 * @param {Record<string, string>} props.copy - Template per kind
 * @param {PlayFace[]} props.players - Faces by account
 * @return {JSX.Element}
 */

export const PlaySessionFeed = ({
  feed,
  copy,
  players,
}: {
  feed: PlayFeedLine[]
  copy: Record<string, string>
  players: PlayFace[]
}) => {
  const MarkIcon = ICONS.playClock

  return (
    <section className={BAC_SESSION.feedBox}>
      <h2 className={BAC_SESSION.feedTitle}>{BAC_SESSION_COPY.feed}</h2>
      {feed.length === 0 && <p className={BAC_SESSION.empty}>{BAC_SESSION_COPY.feedEmpty}</p>}
      <ol className={BAC_SESSION.feed}>
        {feed.map((entry) => {
          const face = players.find((player) => player.id === entry.accountId)
          const line = fillPlayMessage(copy[entry.kind], entry.values)
          const head = copy[entry.kind].split('{')[0].replace(TRAILING_WORD, '')
          const verb = face && PLAY_FEED_VERBS[entry.kind] && line.startsWith(head)

          return (
            <li key={entry.id} className={BAC_SESSION.feedLine}>
              {face ? (
                <Avatar name={face.name} src={face.avatarUrl} size="xs" />
              ) : (
                <span className={BAC_SESSION.feedMark}>
                  <MarkIcon className={BAC_SESSION.feedMarkIcon} aria-hidden="true" />
                </span>
              )}
              <span className={BAC_SESSION.feedText}>
                {face && <span className={BAC_SESSION.feedName}>{face.name} </span>}
                {verb ? (
                  <>
                    <span className={cn('font-bold', PLAY_FEED_VERBS[entry.kind])}>{head}</span>
                    {line.slice(head.length)}
                  </>
                ) : (
                  line
                )}
              </span>
              <span className={BAC_SESSION.feedTime}>
                {formatClock(new Date(entry.at).toISOString())}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
