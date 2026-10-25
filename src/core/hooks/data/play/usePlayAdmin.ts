'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/system/useMutation'
import { PLAY_ADMIN_TARGETS, PLAY_MEMBER_COPY } from '@/declarations/play/admin'
import type { PlayAdminState } from '@/types/play'
import type { FieldIssue, FormValues } from '@/types/forms'

/**
 * Play gestures on one moderator
 * @typedef {Object} PlayAdmin
 * @property {PlayAdminState} state - Progression and current game
 * @property {boolean} isSaving - Gesture in flight
 * @property {FieldIssue[]} issues - Drawer failures
 */

export interface PlayAdmin {
  state: PlayAdminState
  isSaving: boolean
  issues: FieldIssue[]
  adjustXp: (values: FormValues) => Promise<boolean>
  setLevel: (values: FormValues) => Promise<boolean>
  correctStats: (values: FormValues) => Promise<boolean>
  reset: (values: FormValues) => Promise<boolean>
  wipe: () => Promise<boolean>
  ban: (values: FormValues) => Promise<boolean>
  unban: () => Promise<boolean>
  remove: () => Promise<boolean>
}

/**
 * Drive the Play view of the Admin tab
 * @param {string} memberId - Account identifier
 * @param {PlayAdminState} initial - State resolved server-side
 * @return {PlayAdmin} - State and gestures
 */

export const usePlayAdmin = (memberId: string, initial: PlayAdminState): PlayAdmin => {
  const router = useRouter()
  const [state, setState] = useState(initial)
  const { isSaving, issues, run } = useMutation()

  // Every gesture answers with the new state
  const send = useCallback(
    async (path: string, body: FormValues, done: string) => {
      const next = await run(() => apiPost<PlayAdminState>(path, body), done)
      if (!next) return false

      setState(next)
      router.refresh()

      return true
    },
    [run, router]
  )

  return {
    state,
    isSaving,
    issues,
    adjustXp: (values) => send(API_ROUTES.playMemberXp(memberId), values, PLAY_MEMBER_COPY.xpDone),
    setLevel: (values) =>
      send(API_ROUTES.playMemberLevel(memberId), values, PLAY_MEMBER_COPY.levelDone),
    correctStats: (values) =>
      send(API_ROUTES.playMemberStats(memberId), values, PLAY_MEMBER_COPY.statsDone),
    reset: (values) =>
      send(API_ROUTES.playMemberReset(memberId), values, PLAY_MEMBER_COPY.resetDone),
    wipe: () =>
      send(
        API_ROUTES.playMemberReset(memberId),
        { game: PLAY_ADMIN_TARGETS.all },
        PLAY_MEMBER_COPY.resetDone
      ),
    ban: (values) => send(API_ROUTES.playMemberBan(memberId), values, PLAY_MEMBER_COPY.banDone),
    unban: () => send(API_ROUTES.playMemberUnban(memberId), {}, PLAY_MEMBER_COPY.unbanDone),
    remove: () => send(API_ROUTES.playMemberRemove(memberId), {}, PLAY_MEMBER_COPY.removeDone),
  }
}
