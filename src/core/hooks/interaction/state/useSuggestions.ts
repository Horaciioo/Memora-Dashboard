'use client'

import { useMemo, useState } from 'react'

import type { PanelMemory } from '@/core/lib/modview/commands'
import { suggestFor } from '@/core/lib/modview/suggest'
import type { SuggestionSource } from '@/core/lib/modview/suggest'
import { CHAT_FLAG_CATEGORY } from '@/declarations/modview/suggestions'
import type { ModActKind, ModViewState } from '@/types/modview'
import type { SanctionPanelView } from '@/types/sanctions'

// Suggestions kept on screen
const MAX_SUGGESTIONS = 12

// Chatters whose lines are never suggested
const EXEMPT_BADGES = ['broadcaster', 'moderator', 'bot']

// Acts that settle a suggestion
const SETTLING_ACTS: ModActKind[] = ['delete', 'warn', 'timeout', 'ban']

/**
 * Commands ready to paste for what the AutoMod holds and the chat flags
 * @param {ModViewState} state - Mod View state
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {PanelMemory} memory - Rungs already applied
 * @param {Record<string, string>} acted - Viewers sanctioned from here, with the moment
 * @return {{ suggestions: Suggestion[], dismiss: (id: string) => void }} - Suggestions
 */

export const useSuggestions = (
  state: ModViewState,
  panel: SanctionPanelView | null,
  memory: PanelMemory,
  acted: Record<string, string> = {}
) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const suggestions = useMemo(() => {
    const held: SuggestionSource[] = state.held.map((entry) => ({
      id: entry.id,
      origin: 'automod',
      chatter: entry.author,
      text: entry.text,
      flagged: entry.flagged,
      categoryKey: entry.categoryKey ?? CHAT_FLAG_CATEGORY,
      category: entry.category,
      at: entry.at,
    }))
    const flagged: SuggestionSource[] = state.messages
      .filter(
        (message) =>
          (message.flagged?.length ?? 0) > 0 &&
          !message.deletedBy &&
          !message.author.badges.some((badge) => EXEMPT_BADGES.includes(badge))
      )
      .map((message) => ({
        id: message.id,
        origin: 'chat',
        chatter: message.author,
        text: message.text,
        flagged: message.flagged ?? [],
        categoryKey: CHAT_FLAG_CATEGORY,
        category: '',
        at: message.sentAt,
      }))

    // Latest sanction per identifier or name, as a timestamp
    const settledAt = new Map<string, number>()
    const settle = (key: string | null | undefined, at: number) => {
      if (key && Number.isFinite(at) && (settledAt.get(key) ?? 0) < at) settledAt.set(key, at)
    }
    for (const act of state.acts) {
      if (!SETTLING_ACTS.includes(act.kind)) continue
      const at = Date.parse(act.at)
      settle(act.targetId, at)
      settle(act.target?.toLowerCase(), at)
    }
    for (const [chatterId, at] of Object.entries(acted)) settle(chatterId, Date.parse(at))

    // Already sanctioned since
    const isSettled = (source: SuggestionSource): boolean => {
      const sentAt = Date.parse(source.at)
      const keys = [
        source.chatter.id,
        source.chatter.name.toLowerCase(),
        source.chatter.login.toLowerCase(),
      ]

      return keys.some((key) => (settledAt.get(key) ?? 0) >= sentAt)
    }

    return [...held, ...flagged]
      .filter((source) => !dismissed.has(source.id) && !isSettled(source))
      .sort((left, right) => right.at.localeCompare(left.at))
      .slice(0, MAX_SUGGESTIONS)
      .map((source) => suggestFor(source, panel, memory))
  }, [state.held, state.messages, state.acts, panel, memory, dismissed, acted])

  const dismiss = (id: string) => setDismissed((current) => new Set([...current, id]))

  return { suggestions, dismiss }
}
