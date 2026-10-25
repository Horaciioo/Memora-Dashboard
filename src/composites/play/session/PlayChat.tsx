'use client'

import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar } from '@/components/elements/display/Avatar'
import { Button } from '@/components/elements/actions/Button'
import { PlayInviteAnchor } from '@/composites/play/session/PlayInviteAnchor'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { usePlayPeopleMenu } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import type { PlayPeopleTable } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { BAC_SESSION_COPY, PLAY_CHAT, PLAY_CHAT_EVENTS, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, PLAY_CHAT_UI, PLAY_CHAT_VERBS } from '@/declarations/ui/variants'
import type { PlayCandidate, PlayMessageView } from '@/types/play'
import { PlayMessageKinds } from '@/utils/constants/play'
import { cn } from '@/utils/classnames'
import { MINUTE_MS } from '@/utils/constants/time'
import { formatClock } from '@/utils/format/modview'

// Lines from one author within this gap share a header
const GROUP_GAP_MS = 5 * MINUTE_MS

/**
 * Seat the right-click menu reads
 * @typedef {Object} PlayChatSeat
 */

export interface PlayChatSeat {
  accountId: string
  hasLeft: boolean
  isHost: boolean
}

export interface PlayChatProps {
  sessionId: string
  messages: PlayMessageView[]
  // Who sits at the table, for the menu on a name
  seats: PlayChatSeat[]
  table: Omit<PlayPeopleTable, 'sessionId'>
  // Sits in the session column instead of beside the lobby
  isSide?: boolean
  // Null when the reader cannot invite
  invite: { candidates: PlayCandidate[]; canSeat: boolean } | null
  // Session page folds it away
  onFold?: () => void
}

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
 * Discord-like chat of a game, plain text only
 * @param {PlayChatProps} props - Game, lines and invite rights
 * @return {JSX.Element}
 */

export const PlayChat = ({
  sessionId,
  messages,
  seats,
  table,
  isSide,
  invite,
  onFold,
}: PlayChatProps) => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const [draft, setDraft] = useState('')
  const list = useRef<HTMLDivElement>(null)
  const FoldIcon = ICONS.playFold
  const menuOf = usePlayPeopleMenu({ ...table, sessionId })

  // Menu of a name, from its seat
  const menuOn = (author: PlayMessageView['author']) => {
    const seat = seats.find((entry) => entry.accountId === author.id)

    return menuOf(
      {
        accountId: author.id,
        isSeated: Boolean(seat && !seat.hasLeft),
        hasSeat: Boolean(seat),
        isHost: Boolean(seat?.isHost),
      },
      author.name
    )
  }

  // Newest line stays in view
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight })
  }, [messages.length])

  const send = async () => {
    const body = draft.trim()
    if (!body || isSaving) return
    const done = await run(() => apiPost(API_ROUTES.playMessages(sessionId), { body }))
    if (done === null) return
    setDraft('')
    router.refresh()
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    void send()
  }

  return (
    <aside className={isSide ? PLAY_CHAT_UI.panelSide : PLAY_CHAT_UI.panel}>
      <header className={PLAY_CHAT_UI.head}>
        <h2 className={PLAY_CHAT_UI.title}>{PLAY_HUB_COPY.chatTitle}</h2>
        <div className={PLAY_CHAT_UI.headActions}>
          {invite && (
            <PlayInviteAnchor
              sessionId={sessionId}
              {...invite}
              alignEnd
              trigger={(toggle) => (
                <Button variant="arcade" onClick={toggle}>
                  {PLAY_HUB_COPY.chatInvite}
                </Button>
              )}
            />
          )}
          {onFold && (
            <button
              type="button"
              className={BAC_SESSION.fold}
              aria-label={BAC_SESSION_COPY.foldSide}
              onClick={onFold}
            >
              <FoldIcon className={BAC_SESSION.foldIcon} aria-hidden="true" />
            </button>
          )}
        </div>
      </header>

      <div ref={list} className={PLAY_CHAT_UI.list}>
        {messages.length === 0 && <p className={PLAY_CHAT_UI.empty}>{PLAY_HUB_COPY.chatEmpty}</p>}
        {messages.map((message, index) => {
          // Table event: who, and what happened
          if (message.kind !== PlayMessageKinds.Text) {
            return (
              <div
                key={message.id}
                className={PLAY_CHAT_UI.event}
                onContextMenu={menuOn(message.author)}
              >
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

          return follows(message, messages[index - 1]) ? (
            <p
              key={message.id}
              className={cn(PLAY_CHAT_UI.follow, PLAY_CHAT_UI.text)}
              onContextMenu={menuOn(message.author)}
            >
              {message.body}
            </p>
          ) : (
            <div
              key={message.id}
              className={PLAY_CHAT_UI.message}
              onContextMenu={menuOn(message.author)}
            >
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
        })}
      </div>

      <div className={PLAY_CHAT_UI.composer}>
        <textarea
          rows={1}
          value={draft}
          maxLength={PLAY_CHAT.maxLength}
          placeholder={PLAY_HUB_COPY.chatPlaceholder}
          aria-label={PLAY_HUB_COPY.chatPlaceholder}
          className={PLAY_CHAT_UI.input}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
        />
      </div>
    </aside>
  )
}
