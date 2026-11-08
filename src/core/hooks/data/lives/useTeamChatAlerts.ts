'use client'

import { useEffect, useState } from 'react'

import { useTeamChat } from '@/core/hooks/data/lives/useTeamChat'
import type { TeamChatState } from '@/core/hooks/data/lives/useTeamChat'
import { isCalled } from '@/core/lib/lives/teamChat'
import type { MentionSeats } from '@/core/lib/lives/teamChat'
import { LIVE_SETTINGS } from '@/declarations/configurations/settings'
import type { LiveTeamMessage } from '@/types/lives'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Chat with what it raises while closed
 * @typedef {Object} TeamChatAlerts
 * @property {TeamChatState} chat - Chat state
 * @property {boolean} hasUnread - Message waiting
 * @property {LiveTeamMessage | null} bubble - Mention to show
 * @property {() => void} dismiss - Close the bubble
 */

export interface TeamChatAlerts {
  chat: TeamChatState
  hasUnread: boolean
  bubble: LiveTeamMessage | null
  dismiss: () => void
}

/**
 * Internal chat with unread point and mention bubble
 * @param {Object} input - Chat context
 * @param {string} input.liveId - Live
 * @param {string} input.viewerId - Signed-in member
 * @param {MentionSeats} input.seats - Team of the live
 * @param {boolean} input.isOpen - Panel open
 * @return {TeamChatAlerts} - Chat and alerts
 */

export const useTeamChatAlerts = ({
  liveId,
  viewerId,
  seats,
  isOpen,
}: {
  liveId: string
  viewerId: string
  seats: MentionSeats
  isOpen: boolean
}): TeamChatAlerts => {
  const [hasUnread, setHasUnread] = useState(false)
  const [bubble, setBubble] = useState<LiveTeamMessage | null>(null)
  const [wasOpen, setWasOpen] = useState(isOpen)

  // Opening reads everything
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) {
      setHasUnread(false)
      setBubble(null)
    }
  }

  // Messages heard while closed
  const chat = useTeamChat(liveId, (message) => {
    if (message.authorId === viewerId || isOpen) return
    // Plain messages only mark a point
    setHasUnread(true)
    if (isCalled(message.mentions, viewerId, seats)) setBubble(message)
  })

  // Bubble closes alone
  useEffect(() => {
    if (!bubble) return
    const timer = window.setTimeout(
      () => setBubble(null),
      LIVE_SETTINGS.teamChatBubbleSeconds * SECOND_MS
    )

    return () => window.clearTimeout(timer)
  }, [bubble])

  return { chat, hasUnread, bubble, dismiss: () => setBubble(null) }
}
