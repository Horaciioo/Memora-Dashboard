'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'

import { apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { looksLikeCommand } from '@/core/lib/assistant/parse'
import { useDebouncedValue } from '@/core/hooks/interaction/state/useDebouncedValue'
import { useAssistantStore } from '@/core/store/assistant'
import { ASSISTANT_SETTINGS } from '@/declarations/assistant/settings'
import type { AssistantProposal } from '@/types/assistant'

/**
 * Preview state
 * @typedef {Object} AssistantPreview
 * @property {boolean} isCommand - Sentence reads as a command
 * @property {AssistantProposal | null} proposal - Settled answer
 * @property {boolean} isLoading - Typing or in flight
 */

interface AssistantPreview {
  isCommand: boolean
  proposal: AssistantProposal | null
  isLoading: boolean
}

/**
 * Read a typed command
 * @param {string} term - Typed sentence
 * @return {AssistantPreview} - Preview
 */

export const useAssistantPreview = (term: string): AssistantPreview => {
  const pathname = usePathname()
  const memory = useAssistantStore((state) => state.memory)
  const text = term.trim()
  const settled = useDebouncedValue(text, ASSISTANT_SETTINGS.debounceMs)

  // Parsed locally first, resolved by the server
  const isCommand = looksLikeCommand(text)
  const { data, isFetching } = useQuery({
    queryKey: QUERY_KEYS.assistant(settled, pathname),
    queryFn: () =>
      apiPost<AssistantProposal>(API_ROUTES.assistant, {
        text: settled,
        pathname,
        memory,
        filled: {},
      }),
    enabled: looksLikeCommand(settled),
    placeholderData: keepPreviousData,
    retry: false,
  })

  const isSettled = settled === text && !isFetching

  return {
    isCommand,
    proposal: isCommand && isSettled ? (data ?? null) : null,
    isLoading: isCommand && !isSettled,
  }
}
