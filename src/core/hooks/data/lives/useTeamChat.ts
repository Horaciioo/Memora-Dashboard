'use client'

import { useCallback, useEffect, useEffectEvent, useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { listenRealtime, requestRealtime } from '@/core/lib/realtime/socket'
import { TEAM_CHAT_EVENTS } from '@/declarations/lives/teamChat'
import type { TeamMentionKind } from '@/declarations/lives/teamChat'
import { LIVE_TOPICS } from '@/declarations/lives/topics'
import { REALTIME_EVENTS, REALTIME_OPS } from '@/declarations/system/realtime'
import type { LiveTeamMessage, LiveTeamPage } from '@/types/lives'

/**
 * Internal chat of a live and its gestures
 * @typedef {Object} TeamChatState
 * @property {LiveTeamMessage[]} messages - Oldest first
 * @property {boolean} hasOlder - Earlier messages remain
 * @property {boolean} isSending - Message in flight
 * @property {(body: string, mentions: TeamMentionKind[]) => Promise<boolean>} send - Write a message
 * @property {() => Promise<void>} loadOlder - Fetch the page before
 */

export interface TeamChatState {
  messages: LiveTeamMessage[]
  hasOlder: boolean
  isSending: boolean
  send: (body: string, mentions: TeamMentionKind[]) => Promise<boolean>
  loadOlder: () => Promise<void>
}

// Message list without doubles, oldest first
const merge = (known: LiveTeamMessage[], incoming: LiveTeamMessage[]): LiveTeamMessage[] => {
  const byId = new Map([...known, ...incoming].map((message) => [message.id, message]))

  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/**
 * Drive the internal chat of one live
 * @param {string} liveId - Live
 * @param {(message: LiveTeamMessage) => void} onHeard - Called per message heard live
 * @return {TeamChatState} - State and gestures
 */

export const useTeamChat = (
  liveId: string,
  onHeard: (message: LiveTeamMessage) => void
): TeamChatState => {
  const [messages, setMessages] = useState<LiveTeamMessage[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const { isSaving, run } = useMutation()
  const heard = useEffectEvent(onHeard)

  // First page
  const loadFirst = useCallback(
    () =>
      apiGet<LiveTeamPage>(API_ROUTES.liveTeamChat(liveId))
        .then((page) => {
          setMessages((known) => merge(known, page.messages))
          setCursor((known) => known ?? page.nextCursor)
        })
        .catch(() => null),
    [liveId]
  )

  // Live topic
  useEffect(() => {
    void loadFirst()

    return listenRealtime(LIVE_TOPICS.team(liveId), (event, data) => {
      if (event === REALTIME_EVENTS.resync) return void loadFirst()
      if (event !== TEAM_CHAT_EVENTS.message) return
      const message = (data as { message?: LiveTeamMessage } | null)?.message
      if (!message) return
      setMessages((known) => merge(known, [message]))
      heard(message)
    })
  }, [liveId, loadFirst])

  const loadOlder = useCallback(async () => {
    if (!cursor) return
    const page = await apiGet<LiveTeamPage>(API_ROUTES.liveTeamChat(liveId, cursor)).catch(
      () => null
    )
    if (!page) return
    setMessages((known) => merge(known, page.messages))
    setCursor(page.nextCursor)
  }, [cursor, liveId])

  const send = useCallback(
    async (body: string, mentions: TeamMentionKind[]) => {
      const stored = await run(() =>
        requestRealtime<LiveTeamMessage>(REALTIME_OPS.teamChatSend, { liveId, body, mentions })
      )
      if (stored) setMessages((known) => merge(known, [stored]))

      return stored !== null
    },
    [liveId, run]
  )

  return { messages, hasOlder: cursor !== null, isSending: isSaving, send, loadOlder }
}
