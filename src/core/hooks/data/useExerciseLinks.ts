'use client'

import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/useMutation'
import { apiGet, apiPost, apiPut } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { EXERCISE_SETTINGS } from '@/declarations/configurations/settings'
import { EXERCISE_COPY } from '@/declarations/recruitment/exerciseCopy'
import type { ExerciseLinkView } from '@/types/recruitment'

/**
 * Written-context links of one candidate
 * @typedef {Object} ExerciseLinks
 * @property {ExerciseLinkView[]} links - Newest first
 * @property {boolean} isSaving - Mutation in flight
 * @property {(contextKeys: string[]) => Promise<boolean>} generate - Hand out two links
 * @property {(id: string) => Promise<void>} expire - Cut a link short
 */

export interface ExerciseLinks {
  links: ExerciseLinkView[]
  isSaving: boolean
  generate: (contextKeys: string[]) => Promise<boolean>
  expire: (id: string) => Promise<void>
}

/**
 * Drive the links of one candidate, status refreshed while the page is open
 * @param {string} candidateId - Candidate identifier
 * @return {ExerciseLinks} - State and mutations
 */

export const useExerciseLinks = (candidateId: string): ExerciseLinks => {
  const queryClient = useQueryClient()
  const queryKey = QUERY_KEYS.exerciseLinks(candidateId)
  const { isSaving, run } = useMutation()

  const { data: links = [] } = useQuery({
    queryKey,
    queryFn: () => apiGet<ExerciseLinkView[]>(API_ROUTES.candidateExercises(candidateId)),
    refetchInterval: EXERCISE_SETTINGS.pollSeconds * 1000,
  })

  const generate = useCallback(
    async (contextKeys: string[]) => {
      const created = await run(
        () =>
          apiPost<ExerciseLinkView[]>(API_ROUTES.candidateExercises(candidateId), { contextKeys }),
        EXERCISE_COPY.linkGenerated
      )
      if (created) await queryClient.invalidateQueries({ queryKey })

      return created !== null
    },
    [run, candidateId, queryClient, queryKey]
  )

  const expire = useCallback(
    async (id: string) => {
      const done = await run(
        () => apiPut<ExerciseLinkView>(API_ROUTES.exerciseExpiry(id), {}),
        EXERCISE_COPY.linkExpired
      )
      if (done) await queryClient.invalidateQueries({ queryKey })
    },
    [run, queryClient, queryKey]
  )

  return { links, isSaving, generate, expire }
}
