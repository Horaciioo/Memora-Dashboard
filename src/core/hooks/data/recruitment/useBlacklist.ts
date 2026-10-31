'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiDelete, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { HISTORY_COPY } from '@/declarations/recruitment/historyCopy'
import type { FieldIssue, FormValues } from '@/types/forms'
import type { BanView } from '@/types/recruitment'

/**
 * Blacklist mutations
 * @typedef {Object} Blacklist
 * @property {boolean} isSaving - Mutation in flight
 * @property {FieldIssue[]} issues - Rejections of the last attempt
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(target: { discordId: string, sessionId: string | null, candidateId?: string }, values: FormValues) => Promise<boolean>} ban - Bar an identifier
 * @property {(discordId: string) => Promise<boolean>} lift - Free an identifier
 */

export interface Blacklist {
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  ban: (
    target: { discordId: string; sessionId: string | null; candidateId?: string },
    values: FormValues
  ) => Promise<boolean>
  lift: (discordId: string) => Promise<boolean>
}

/**
 * Drive the blacklist, the history and the open file follow
 * @return {Blacklist} - State and mutations
 */

export const useBlacklist = (): Blacklist => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isSaving, issues, clearIssues, run } = useMutation()

  // Everything showing the ban reads again
  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['recruitment', 'history'] })
    router.refresh()
  }, [queryClient, router])

  const ban = useCallback<Blacklist['ban']>(
    async (target, values) => {
      const done = await run(
        () => apiPost<BanView>(API_ROUTES.recruitmentBlacklist, { ...values, ...target }),
        HISTORY_COPY.bannedDone
      )
      if (done) await refresh()

      return done !== null
    },
    [run, refresh]
  )

  const lift = useCallback(
    async (discordId: string) => {
      const done = await run(
        () => apiDelete(`${API_ROUTES.recruitmentBlacklist}?${new URLSearchParams({ discordId })}`),
        HISTORY_COPY.unbannedDone
      )
      if (done) await refresh()

      return done !== null
    },
    [run, refresh]
  )

  return { isSaving, issues, clearIssues, ban, lift }
}
