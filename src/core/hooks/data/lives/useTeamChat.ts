'use client'

import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { listenRealtime, requestRealtime } from '@/core/lib/realtime/socket'
import { TEAM_CHAT_EVENTS, TEAM_CHAT_SCOPES } from '@/declarations/lives/teamChat'
import type { TeamChatScope, TeamMentionKind } from '@/declarations/lives/teamChat'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { REALTIME_EVENTS, REALTIME_OPS } from '@/declarations/system/realtime'
import type { LiveTeamMessage, LiveTeamPage, LiveTeamReaction } from '@/types/lives'
import { SECOND_MS } from '@/utils/constants/time'

// A writer fades this long after the last signal
const TYPING_TTL_MS = 4 * SECOND_MS

// Gap between two typing signals sent
const TYPING_SEND_MS = 2.5 * SECOND_MS

/**
 * Internal chat of a live and its gestures
 * @typedef {Object} TeamChatState
 * @property {LiveTeamMessage[]} messages - Every room, oldest first
 * @property {(scope: TeamChatScope) => boolean} hasOlder - Earlier messages remain in a room
 * @property {boolean} isSending - Message in flight
 * @property {Record<TeamChatScope, string[]>} typing - Members writing now, per room
 * @property {(body: string, mentions: TeamMentionKind[], scope: TeamChatScope) => Promise<boolean>} send - Write a message
 * @property {(scope: TeamChatScope) => Promise<void>} loadOlder - Fetch the page before
 * @property {(scope: TeamChatScope) => void} notifyTyping - Tell the room the member writes
 * @property {(messageId: string, emoji: string) => Promise<void>} react - Add or take back an emoji
 */

export interface TeamChatState {
  messages: LiveTeamMessage[]
  hasOlder: (scope: TeamChatScope) => boolean
  isSending: boolean
  typing: Record<TeamChatScope, string[]>
  send: (body: string, mentions: TeamMentionKind[], scope: TeamChatScope) => Promise<boolean>
  loadOlder: (scope: TeamChatScope) => Promise<void>
  notifyTyping: (scope: TeamChatScope) => void
  react: (messageId: string, emoji: string) => Promise<void>
}

type Cursors = Record<TeamChatScope, string | null>
type Writers = Record<TeamChatScope, Record<string, number>>

// Message list without doubles, oldest first
const merge = (known: LiveTeamMessage[], incoming: LiveTeamMessage[]): LiveTeamMessage[] => {
  const byId = new Map([...known, ...incoming].map((message) => [message.id, message]))

  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

const NO_CURSORS: Cursors = { all: null, referents: null, responsables: null }
const NO_WRITERS: Writers = { all: {}, referents: {}, responsables: {} }

/**
 * Drive the internal chat of one live
 * @param {string} liveId - Live
 * @param {TeamChatScope[]} scopes - Rooms the member reads
 * @param {string} viewerId - Signed-in member
 * @param {(message: LiveTeamMessage) => void} onHeard - Called per message heard live
 * @return {TeamChatState} - State and gestures
 */

export const useTeamChat = (
  liveId: string,
  scopes: TeamChatScope[],
  viewerId: string,
  onHeard: (message: LiveTeamMessage) => void
): TeamChatState => {
  const [messages, setMessages] = useState<LiveTeamMessage[]>([])
  const [cursors, setCursors] = useState<Cursors>(NO_CURSORS)
  const [writers, setWriters] = useState<Writers>(NO_WRITERS)
  const [now, setNow] = useState(0)
  const { isSaving, run } = useMutation()
  const heard = useEffectEvent(onHeard)
  const lastTypingAt = useRef(0)
  // Stable key of the rooms, the list itself is new on every render
  const scopesKey = scopes.join(',')

  // First page of a room
  const loadFirst = useCallback(
    (scope: TeamChatScope) =>
      apiGet<LiveTeamPage>(API_ROUTES.liveTeamChat(liveId, scope))
        .then((page) => {
          setMessages((known) => merge(known, page.messages))
          setCursors((known) => ({ ...known, [scope]: known[scope] ?? page.nextCursor }))
        })
        .catch(() => null),
    [liveId]
  )

  // One topic per room
  useEffect(() => {
    const rooms: [TeamChatScope, string][] = (scopesKey.split(',') as TeamChatScope[]).map(
      (scope) => [
        scope,
        scope === 'all' ? LIVE_TOPICS.team(liveId) : LIVE_TOPICS.privateRoom(liveId, scope),
      ]
    )

    const stops = rooms.map(([scope, topic]) => {
      void loadFirst(scope)

      return listenRealtime(topic, (event, data) => {
        if (event === REALTIME_EVENTS.resync) return void loadFirst(scope)
        const payload = (data ?? {}) as {
          type?: string
          message?: LiveTeamMessage
          authorId?: string
          messageId?: string
          reactions?: LiveTeamReaction[]
        }

        if (payload.type === TEAM_CHAT_EVENTS.typing && payload.authorId) {
          const author = payload.authorId
          if (author === viewerId) return
          setNow(Date.now())
          setWriters((known) => ({
            ...known,
            [scope]: { ...known[scope], [author]: Date.now() + TYPING_TTL_MS },
          }))
        } else if (payload.type === TEAM_CHAT_EVENTS.reactions && payload.messageId) {
          const { messageId, reactions = [] } = payload
          setMessages((known) =>
            known.map((message) => (message.id === messageId ? { ...message, reactions } : message))
          )
        } else if (payload.message) {
          const message = payload.message
          setMessages((known) => merge(known, [message]))
          // A sent message ends the writing
          setWriters((known) => {
            const rest = { ...known[scope] }
            delete rest[message.authorId]

            return { ...known, [scope]: rest }
          })
          heard(message)
        }
      })
    })

    return () => stops.forEach((stop) => stop())
  }, [liveId, scopesKey, viewerId, loadFirst])

  // Clock only while someone writes
  const isWriting = Object.values(writers).some((room) => Object.keys(room).length > 0)
  useEffect(() => {
    if (!isWriting) return
    const timer = window.setInterval(() => setNow(Date.now()), SECOND_MS)

    return () => window.clearInterval(timer)
  }, [isWriting])

  const typing = Object.fromEntries(
    TEAM_CHAT_SCOPES.map((scope) => [
      scope,
      Object.keys(writers[scope]).filter((id) => writers[scope][id] > now),
    ])
  ) as Record<TeamChatScope, string[]>

  const loadOlder = useCallback(
    async (scope: TeamChatScope) => {
      const cursor = cursors[scope]
      if (!cursor) return
      const page = await apiGet<LiveTeamPage>(API_ROUTES.liveTeamChat(liveId, scope, cursor)).catch(
        () => null
      )
      if (!page) return
      setMessages((known) => merge(known, page.messages))
      setCursors((known) => ({ ...known, [scope]: page.nextCursor }))
    },
    [cursors, liveId]
  )

  const send = useCallback(
    async (body: string, mentions: TeamMentionKind[], scope: TeamChatScope) => {
      const stored = await run(() =>
        requestRealtime<LiveTeamMessage>(REALTIME_OPS.teamChatSend, {
          liveId,
          body,
          mentions,
          scope,
        })
      )
      if (stored) setMessages((known) => merge(known, [stored]))
      lastTypingAt.current = 0

      return stored !== null
    },
    [liveId, run]
  )

  const notifyTyping = useCallback(
    (scope: TeamChatScope) => {
      const at = Date.now()
      if (at - lastTypingAt.current < TYPING_SEND_MS) return
      lastTypingAt.current = at
      void requestRealtime(REALTIME_OPS.teamChatTyping, { liveId, scope }).catch(() => null)
    },
    [liveId]
  )

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      await requestRealtime(REALTIME_OPS.teamChatReact, { liveId, messageId, emoji }).catch(
        () => null
      )
    },
    [liveId]
  )

  return {
    messages,
    hasOlder: (scope) => cursors[scope] !== null,
    isSending: isSaving,
    typing,
    send,
    loadOlder,
    notifyTyping,
    react,
  }
}
