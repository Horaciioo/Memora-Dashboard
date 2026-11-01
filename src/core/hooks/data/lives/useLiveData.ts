'use client'

import { useRouter } from 'next/navigation'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { entityFeedback } from '@/declarations/ui/copy'

/**
 * Corrections of the data a finished live holds
 * @typedef {Object} LiveData
 * @property {(liveId: string, actionId: string, patch: Record<string, unknown>) => Promise<boolean>} editGesture - Corrects a gesture
 * @property {(liveId: string, actionId: string) => Promise<boolean>} removeGesture - Erases a gesture
 * @property {(liveId: string, accountId: string, activeSeconds: number) => Promise<boolean>} editTime - Corrects a member's time
 * @property {(liveId: string, title: string) => Promise<boolean>} rename - Renames the live
 */

export interface LiveData {
  editGesture: (
    liveId: string,
    actionId: string,
    patch: Record<string, unknown>
  ) => Promise<boolean>
  removeGesture: (liveId: string, actionId: string) => Promise<boolean>
  editTime: (liveId: string, accountId: string, activeSeconds: number) => Promise<boolean>
  rename: (liveId: string, title: string) => Promise<boolean>
}

/**
 * Edit the data of a finished live, then reload what the page shows
 * @return {LiveData} - Corrections
 */

export const useLiveData = (): LiveData => {
  const router = useRouter()
  const { run } = useMutation()

  const apply = async (call: () => Promise<unknown>) => {
    const done = await run(call, entityFeedback('live', 'saved'))
    if (done === null || done === undefined) return false
    router.refresh()

    return true
  }

  return {
    editGesture: (liveId, actionId, patch) =>
      apply(() => apiPatch(API_ROUTES.liveGesture(liveId, actionId), patch)),
    removeGesture: (liveId, actionId) =>
      apply(() => apiDelete(API_ROUTES.liveGesture(liveId, actionId))),
    editTime: (liveId, accountId, activeSeconds) =>
      apply(() => apiPatch(API_ROUTES.liveModTime(liveId, accountId), { activeSeconds })),
    rename: (liveId, title) => apply(() => apiPatch(API_ROUTES.live(liveId), { title })),
  }
}
