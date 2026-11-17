'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PLAY_BOARD_ADMIN_COPY as COPY } from '@/declarations/play/admin'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Bulk gestures of the Play admin page
 * @typedef {Object} PlayAdminBoardActions
 * @property {boolean} isSaving - Gesture in flight
 * @property {FieldIssue[]} issues - Drawer failures
 */

export interface PlayAdminBoardActions {
  isSaving: boolean
  issues: FieldIssue[]
  giveXp: (accountIds: string[], values: FormValues) => Promise<boolean>
  resetPlay: (accountIds: string[], values: FormValues) => Promise<boolean>
}

/**
 * Drive the bulk gestures, the page refreshed after each
 * @return {PlayAdminBoardActions} - State and gestures
 */

export const usePlayAdminBoard = (): PlayAdminBoardActions => {
  const router = useRouter()
  const { isSaving, issues, run } = useMutation()

  const send = useCallback(
    async (path: string, body: FormValues, done: string) => {
      const result = await run(() => apiPost<unknown>(path, body), done)
      if (!result) return false

      router.refresh()

      return true
    },
    [run, router]
  )

  return {
    isSaving,
    issues,
    // An empty list reaches everyone
    giveXp: (accountIds, values) =>
      send(API_ROUTES.playAdminXp, { ...values, accountIds }, COPY.giveDone),
    resetPlay: (accountIds, values) =>
      send(API_ROUTES.playAdminReset, { ...values, accountIds }, COPY.resetDone),
  }
}
