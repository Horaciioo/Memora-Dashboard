'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiGet, apiPost } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { matchBadwords } from '@/core/lib/modview/personal'
import { SHARED_TONE } from '@/declarations/modview/personal'
import type { ModBadword } from '@/types/modview'
import type { SharedWord } from '@/types/lives'
import { SECOND_MS } from '@/utils/constants/time'

// Gap between two reads, so a word added elsewhere shows up
const REFRESH_MS = 15 * SECOND_MS

/**
 * Shared words of a live and their gestures
 * @typedef {Object} SharedWords
 * @property {SharedWord[]} words - Words, oldest first
 * @property {boolean} canEdit - The member may add and remove
 * @property {boolean} isSaving - Change in flight
 * @property {(term: string) => Promise<boolean>} add - Share a word
 * @property {(wordId: string) => Promise<void>} remove - Take a word back
 * @property {(text: string) => ModBadword[]} find - Shared words a text holds
 */

export interface SharedWords {
  words: SharedWord[]
  canEdit: boolean
  isSaving: boolean
  add: (term: string) => Promise<boolean>
  remove: (wordId: string) => Promise<void>
  find: (text: string) => ModBadword[]
}

const NO_WORDS: SharedWords = {
  words: [],
  canEdit: false,
  isSaving: false,
  add: async () => false,
  remove: async () => undefined,
  find: () => [],
}

const SharedWordsContext = createContext<SharedWords>(NO_WORDS)

/**
 * Words the team shares on one live
 * @param {string} liveId - Live
 * @param {boolean} canEdit - The member may add and remove
 * @param {ReactNode} children - Mod View
 * @return {JSX.Element}
 */

export const SharedWordsProvider = ({
  liveId,
  canEdit,
  children,
}: {
  liveId: string
  canEdit: boolean
  children: ReactNode
}) => {
  const client = useQueryClient()
  const { run, isSaving } = useMutation()
  const key = QUERY_KEYS.liveSharedWords(liveId)

  const { data } = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => apiGet<SharedWord[]>(API_ROUTES.liveSharedWords(liveId), signal),
    refetchInterval: REFRESH_MS,
  })
  const words = useMemo(() => data ?? [], [data])

  const add = useCallback(
    async (term: string): Promise<boolean> => {
      const created = await run(() =>
        apiPost<SharedWord>(API_ROUTES.liveSharedWords(liveId), { term })
      )
      if (!created) return false

      client.setQueryData<SharedWord[]>(key, (current = []) =>
        current.some((word) => word.id === created.id) ? current : [...current, created]
      )

      return true
    },
    [liveId, run, client, key]
  )

  const remove = useCallback(
    async (wordId: string): Promise<void> => {
      const done = await run(() => apiDelete(API_ROUTES.liveSharedWords(liveId, wordId)))
      if (!done) return

      client.setQueryData<SharedWord[]>(key, (current = []) =>
        current.filter((word) => word.id !== wordId)
      )
    },
    [liveId, run, client, key]
  )

  const find = useMemo(
    () =>
      matchBadwords(
        words.map((word) => ({ term: word.term, colour: SHARED_TONE, isSuggested: false }))
      ),
    [words]
  )

  const value = useMemo(
    () => ({ words, canEdit, isSaving, add, remove, find }),
    [words, canEdit, isSaving, add, remove, find]
  )

  return <SharedWordsContext.Provider value={value}>{children}</SharedWordsContext.Provider>
}

/**
 * Shared words of the live in view, none off a real live
 * @return {SharedWords} - Words and gestures
 */

export const useSharedWords = (): SharedWords => useContext(SharedWordsContext)
