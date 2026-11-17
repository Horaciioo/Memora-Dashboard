'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PLAY_BOARD_ADMIN_COPY, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * XP gestures of the Play admin page
 * @typedef {Object} PlayAdminBoardActions
 * @property {boolean} isSaving - Gesture in flight
 * @property {FieldIssue[]} issues - Drawer failures
 */

export interface PlayAdminBoardActions {
  isSaving: boolean
  issues: FieldIssue[]
  adjustOne: (accountId: string, values: FormValues) => Promise<boolean>
  adjustAll: (values: FormValues) => Promise<boolean>
}

/**
 * Drive the XP gestures of the Play admin page, the page refreshed after each
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
    adjustOne: (accountId, values) =>
      send(API_ROUTES.playMemberXp(accountId), values, PLAY_MEMBER_COPY.xpDone),
    adjustAll: (values) => send(API_ROUTES.playAdminXp, values, PLAY_BOARD_ADMIN_COPY.everyoneDone),
  }
}
