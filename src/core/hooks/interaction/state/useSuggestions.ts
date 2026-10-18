'use client'

import { useMemo, useState } from 'react'

import type { PanelMemory } from '@/core/lib/modview/commands'
import { suggestFor } from '@/core/lib/modview/suggest'
import type { SuggestionSource } from '@/core/lib/modview/suggest'
import { CHAT_FLAG_CATEGORY } from '@/declarations/modview/suggestions'
import type { ModViewState } from '@/types/modview'
import type { SanctionPanelView } from '@/types/sanctions'

// Suggestions kept on screen
const MAX_SUGGESTIONS = 12

// Chatters whose lines are never suggested
const EXEMPT_BADGES = ['broadcaster', 'moderator', 'bot']

/**
 * Commands ready to paste for what the AutoMod holds and the chat flags
 * @param {ModViewState} state - Mod View state
 * @param {SanctionPanelView | null} panel - Panel at the level in force
 * @param {PanelMemory} memory - Rungs already applied
 * @return {{ suggestions: Suggestion[], dismiss: (id: string) => void }} - Suggestions
 */

export const useSuggestions = (
  state: ModViewState,
  panel: SanctionPanelView | null,
  memory: PanelMemory
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

    return [...held, ...flagged]
      .filter((source) => !dismissed.has(source.id))
      .sort((left, right) => right.at.localeCompare(left.at))
      .slice(0, MAX_SUGGESTIONS)
      .map((source) => suggestFor(source, panel, memory))
  }, [state.held, state.messages, panel, memory, dismissed])

  const dismiss = (id: string) => setDismissed((current) => new Set([...current, id]))

  return { suggestions, dismiss }
}
