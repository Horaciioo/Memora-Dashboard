'use client'

import { useCallback, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import type { JuniorView } from '@/types/academy'

/**
 * Academy state and mutations
 * @typedef {Object} AcademyCollection
 * @property {JuniorView[]} juniors - Juniors in training
 * @property {boolean} isSaving - Mutation in flight
 * @property {(accountId: string, trainingId: string, validated: boolean) => Promise<void>} setTraining - Validate a training
 * @property {(accountId: string) => Promise<void>} advance - Move a junior forward
 */

export interface AcademyCollection {
  juniors: JuniorView[]
  isSaving: boolean
  setTraining: (accountId: string, trainingId: string, validated: boolean) => Promise<void>
  advance: (accountId: string) => Promise<void>
}

/**
 * Drive the academy progression
 * @param {JuniorView[]} initialJuniors - Juniors resolved server-side
 * @return {AcademyCollection} - State and mutations
 */

export const useAcademy = (initialJuniors: JuniorView[]): AcademyCollection => {
  const [juniors, setJuniors] = useState(initialJuniors)
  const { isSaving, run } = useMutation()

  const setTraining = useCallback(
    async (accountId: string, trainingId: string, validated: boolean) => {
      const next = await run(
        () => apiPost<JuniorView[]>(API_ROUTES.academy, { accountId, trainingId, validated }),
        FEEDBACK_COPY.saved
      )

      if (next) setJuniors(next)
    },
    [run]
  )

  const advance = useCallback(
    async (accountId: string) => {
      const next = await run(
        () => apiPost<JuniorView[]>(API_ROUTES.academy, { accountId }),
        FEEDBACK_COPY.saved
      )

      if (next) setJuniors(next)
    },
    [run]
  )

  return { juniors, isSaving, setTraining, advance }
}
