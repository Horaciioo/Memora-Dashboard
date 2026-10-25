'use client'

import { useCallback, useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { entityFeedback } from '@/declarations/ui/copy'
import type { DiscordIdentifierView } from '@/types/discord'
import type { FormValues } from '@/types/forms'

/**
 * Identifiers a session announcement names
 * @typedef {Object} SessionIdentifiers
 * @property {DiscordIdentifierView[]} identifiers - Stored identifiers
 * @property {boolean} isSaving - Mutation in flight
 * @property {(values: FormValues) => Promise<DiscordIdentifierView | null>} store - Store a new one
 */

export interface SessionIdentifiers {
  identifiers: DiscordIdentifierView[]
  isSaving: boolean
  store: (values: FormValues) => Promise<DiscordIdentifierView | null>
}

/**
 * Drive the identifiers of one session
 * @param {string} sessionId - Session identifier
 * @param {DiscordIdentifierView[]} initial - Identifiers resolved server-side
 * @return {SessionIdentifiers} - State and mutation
 */

export const useDiscordIdentifiers = (
  sessionId: string,
  initial: DiscordIdentifierView[]
): SessionIdentifiers => {
  const [identifiers, setIdentifiers] = useState(initial)
  const { isSaving, run } = useMutation()

  const store = useCallback(
    async (values: FormValues) => {
      const saved = await run(
        () => apiPost<DiscordIdentifierView>(API_ROUTES.recruitmentIdentifiers(sessionId), values),
        entityFeedback('discordIdentifier', 'created')
      )

      if (saved) setIdentifiers((current) => [...current, saved])

      return saved
    },
    [run, sessionId]
  )

  return { identifiers, isSaving, store }
}
