import type { MouseEvent } from 'react'

import { Avatar } from '@/components/elements/display/Avatar'
import { PLAY_CHAT_EVENTS } from '@/declarations/play'
import { PLAY_CHAT_UI, PLAY_CHAT_VERBS } from '@/declarations/ui/variants'
import type { PlayMessageView } from '@/types/play'
import { cn } from '@/utils/classnames'
import { PlayMessageKinds } from '@/utils/constants/play'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatClock } from '@/utils/format/modview'

// Lines from one author within this gap share a header
const GROUP_GAP_MS = 5 * MINUTE_MS

/**
 * Same author shortly after, drawn without header
 * @param {PlayMessageView} message - Line
 * @param {PlayMessageView} [previous] - Line before
 * @return {boolean} - Follows
 */

const follows = (message: PlayMessageView, previous?: PlayMessageView): boolean =>
  Boolean(previous) &&
  previous?.kind === PlayMessageKinds.Text &&
  message.kind === PlayMessageKinds.Text &&
  previous?.author.id === message.author.id &&
  Date.parse(message.createdAt) - Date.parse(previous.createdAt) < GROUP_GAP_MS

/**
 * One chat line: a table event, a follow up, or a line with its author
 * @param {Object} props - Line
 * @param {PlayMessageView} props.message - Line
 * @param {PlayMessageView} [props.previous] - Chat line just above
 * @param {(event: MouseEvent) => void} props.onMenu - Right click on the author
 * @return {JSX.Element}
 */

export const PlayChatLine = ({
  message,
  previous,
  onMenu,
}: {
  message: PlayMessageView
  previous?: PlayMessageView
  onMenu: (event: MouseEvent) => void
}) => {
  // Table event: who, and what happened
  if (message.kind !== PlayMessageKinds.Text) {
    return (
      <div className={PLAY_CHAT_UI.event} onContextMenu={onMenu}>
        <Avatar name={message.author.name} src={message.author.avatarUrl} size="xs" />
        <span>
          <span className={PLAY_CHAT_UI.eventName}>{message.author.name}</span>{' '}
          <span className={cn(PLAY_CHAT_UI.eventVerb, PLAY_CHAT_VERBS[message.kind])}>
            {PLAY_CHAT_EVENTS[message.kind].verb}
          </span>{' '}
          {PLAY_CHAT_EVENTS[message.kind].rest}
        </span>
      </div>
    )
  }

  return follows(message, previous) ? (
    <p className={cn(PLAY_CHAT_UI.follow, PLAY_CHAT_UI.text)} onContextMenu={onMenu}>
      {message.body}
    </p>
  ) : (
    <div className={PLAY_CHAT_UI.message} onContextMenu={onMenu}>
      <Avatar name={message.author.name} src={message.author.avatarUrl} size="xs" />
      <div className={PLAY_CHAT_UI.body}>
        <span className={PLAY_CHAT_UI.meta}>
          <span className={PLAY_CHAT_UI.author}>{message.author.name}</span>
          <span className={PLAY_CHAT_UI.time}>{formatClock(message.createdAt)}</span>
        </span>
        <p className={PLAY_CHAT_UI.text}>{message.body}</p>
      </div>
    </div>
  )
}
