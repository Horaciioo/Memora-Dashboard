'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'

import type { PlayFace } from '@/composites/play/session/BacSessionCrowd'
import { PlayInviteAnchor } from '@/composites/play/session/PlayInviteAnchor'
import { PlayFeedRow } from '@/composites/play/session/PlaySessionFeed'
import { PlayFeedBridge } from '@/composites/play/session/chat/feedBridge'
import type { PlayFeedSource } from '@/composites/play/session/chat/feedBridge'
import { PlayChatLine } from '@/composites/play/session/chat/PlayChatLine'
import { PlayChatPeople } from '@/composites/play/session/chat/PlayChatPeople'
import { usePlayChatLines } from '@/core/hooks/data/play/usePlayChatLines'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { usePlayPeopleMenu } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import type { PlayPeopleTable } from '@/core/hooks/interaction/state/usePlayPeopleMenu'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { BAC_SESSION_COPY, PLAY_CHAT, PLAY_HUB_COPY } from '@/declarations/play'
import { ICONS } from '@/declarations/ui/icons'
import { BAC_SESSION, PLAY_CHAT_UI } from '@/declarations/ui/variants'
import type { PlayCandidate, PlayMessageView } from '@/types/play'
import { cn } from '@/utils/classnames'

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
  // Players and spectators drawn under the tabs
  crowd?: { players: PlayFace[]; spectators: PlayFace[] }
  // Game feed, mixed in by the tabs
  feed?: ReactNode
}

// Tabs of a box with a feed
const TABS = [
  { key: 'feed', label: PLAY_HUB_COPY.chatTabFeed },
  { key: 'chat', label: PLAY_HUB_COPY.chatTabChat },
  { key: 'all', label: PLAY_HUB_COPY.chatTabAll },
] as const

type PlayChatTab = (typeof TABS)[number]['key']

/**
 * Chat line or feed line, on one clock
 * @typedef {Object} PlayChatItem
 */

type PlayChatItem =
  | { id: string; at: number; message: PlayMessageView }
  | { id: string; at: number; entry: PlayFeedSource['feed'][number] }

/**
 * Discord-like chat of a game, its feed and its crowd in the same box
 * @param {PlayChatProps} props - Game, lines and invite rights
 * @return {JSX.Element}
 */

export const PlayChat = ({
  sessionId,
  messages: rendered,
  seats,
  table,
  isSide,
  invite,
  onFold,
  crowd,
  feed,
}: PlayChatProps) => {
  const { lines: messages, add } = usePlayChatLines(sessionId, rendered)
  const { run } = useMutation()
  const isSending = useRef(false)
  const [draft, setDraft] = useState('')
  const [tab, setTab] = useState<PlayChatTab>('all')
  const [source, setSource] = useState<PlayFeedSource | null>(null)
  const list = useRef<HTMLUListElement>(null)
  const FoldIcon = ICONS.playFold
  const AddIcon = ICONS.playAdd
  const menuOf = usePlayPeopleMenu({ ...table, sessionId })
  const hasFeed = Boolean(feed)
  const shown = hasFeed ? tab : 'chat'

  // Same lines twice keep the box still
  const publish = useCallback(
    (next: PlayFeedSource) =>
      setSource((current) =>
        current?.feed === next.feed && current.players === next.players ? current : next
      ),
    []
  )

  const items = useMemo<PlayChatItem[]>(() => {
    const said =
      shown === 'feed'
        ? []
        : messages.map((message) => ({
            id: message.id,
            at: Date.parse(message.createdAt),
            message,
          }))
    const told =
      shown === 'chat' || !source
        ? []
        : source.feed.map((entry) => ({ id: entry.id, at: new Date(entry.at).getTime(), entry }))

    return [...said, ...told].sort((left, right) => left.at - right.at)
  }, [shown, messages, source])

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
  }, [items.length])

  const send = async () => {
    const body = draft.trim()
    // One line in flight, a second Enter waits
    if (!body || isSending.current) return
    isSending.current = true
    setDraft('')
    const sent = await run(() =>
      apiPost<PlayMessageView>(API_ROUTES.playMessages(sessionId), { body })
    )
    isSending.current = false
    if (sent === null) return setDraft(body)
    add(sent)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter closing an accent or a suggestion is not a send
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    void send()
  }

  return (
    <aside className={isSide ? PLAY_CHAT_UI.panelSide : PLAY_CHAT_UI.panel}>
      <header className={PLAY_CHAT_UI.head}>
        {hasFeed ? (
          <div className={PLAY_CHAT_UI.tabs} role="tablist" aria-label={PLAY_HUB_COPY.chatTabs}>
            {TABS.map((entry) => (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={tab === entry.key}
                className={cn(PLAY_CHAT_UI.tab, tab === entry.key && PLAY_CHAT_UI.tabOn)}
                onClick={() => setTab(entry.key)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        ) : (
          <h2 className={PLAY_CHAT_UI.title}>{PLAY_HUB_COPY.chatTitle}</h2>
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
      </header>

      {crowd && <PlayChatPeople {...crowd} />}
      {/* Feeds hand their lines up and draw nothing */}
      {feed && <PlayFeedBridge.Provider value={publish}>{feed}</PlayFeedBridge.Provider>}

      <ul ref={list} className={PLAY_CHAT_UI.list}>
        {items.length === 0 && (
          <li className={PLAY_CHAT_UI.empty}>
            {shown === 'feed' ? BAC_SESSION_COPY.feedEmpty : PLAY_HUB_COPY.chatEmpty}
          </li>
        )}
        {items.map((item, index) => {
          if ('entry' in item) {
            return (
              <PlayFeedRow
                key={item.id}
                entry={item.entry}
                copy={source?.copy ?? {}}
                players={source?.players ?? []}
              />
            )
          }
          const before = items[index - 1]

          return (
            <li key={item.id}>
              <PlayChatLine
                message={item.message}
                previous={before && 'message' in before ? before.message : undefined}
                onMenu={menuOn(item.message.author)}
              />
            </li>
          )
        })}
      </ul>

      {shown !== 'feed' && (
        <div className={PLAY_CHAT_UI.composer}>
          {invite && (
            <PlayInviteAnchor
              sessionId={sessionId}
              {...invite}
              above
              trigger={(toggle, isOpen) => (
                <button
                  type="button"
                  className={cn(PLAY_CHAT_UI.invite, isOpen && PLAY_CHAT_UI.inviteOn)}
                  aria-label={PLAY_HUB_COPY.chatInvite}
                  title={PLAY_HUB_COPY.chatInvite}
                  aria-expanded={isOpen}
                  onClick={toggle}
                >
                  <AddIcon className={PLAY_CHAT_UI.inviteIcon} aria-hidden="true" />
                </button>
              )}
            />
          )}
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
      )}
    </aside>
  )
}
