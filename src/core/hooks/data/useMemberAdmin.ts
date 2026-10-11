'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { apiDelete, apiGet, apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { MEMBER_ADMIN_COPY } from '@/declarations/members/admin'
import type { MemberAdminState, MemberDeparture } from '@/types/members'
import type { DepartureKindName } from '@/utils/constants/hierarchy'

/**
 * Heavy gestures of one moderator file
 * @typedef {Object} MemberAdmin
 * @property {MemberAdminState} state - What the tab shows
 * @property {boolean} isSaving - Gesture in flight
 * @property {() => Promise<void>} freeze - Shut the access
 * @property {() => Promise<void>} thaw - Give the access back
 * @property {(kind: DepartureKindName) => Promise<MemberDeparture | null>} depart - Let them go
 * @property {(until: string, reason: string) => Promise<boolean>} suspend - Pause the lives
 * @property {() => Promise<void>} lift - Lift the pause
 * @property {() => Promise<boolean>} remove - Erase the file
 */

export interface MemberAdmin {
  state: MemberAdminState
  isSaving: boolean
  freeze: () => Promise<void>
  thaw: () => Promise<void>
  depart: (kind: DepartureKindName) => Promise<MemberDeparture | null>
  suspend: (until: string, reason: string) => Promise<boolean>
  lift: () => Promise<void>
  remove: () => Promise<boolean>
}

/**
 * Drive the Admin tab of a moderator file
 * @param {string} memberId - Account identifier
 * @param {MemberAdminState} initial - State resolved server-side
 * @return {MemberAdmin} - State and gestures
 */

export const useMemberAdmin = (memberId: string, initial: MemberAdminState): MemberAdmin => {
  const router = useRouter()
  const [state, setState] = useState(initial)
  const { isSaving, run } = useMutation()

  // Read again once a gesture landed
  const reload = useCallback(async () => {
    setState(await apiGet<MemberAdminState>(API_ROUTES.memberAdmin(memberId)))
    router.refresh()
  }, [memberId, router])

  const freeze = useCallback(async () => {
    const done = await run(
      () => apiPost(API_ROUTES.memberFreeze(memberId), {}),
      MEMBER_ADMIN_COPY.frozenDone
    )
    if (done) await reload()
  }, [memberId, run, reload])

  const thaw = useCallback(async () => {
    const done = await run(
      () => apiDelete(API_ROUTES.memberFreeze(memberId)),
      MEMBER_ADMIN_COPY.unfrozenDone
    )
    if (done) await reload()
  }, [memberId, run, reload])

  const depart = useCallback(
    async (kind: DepartureKindName) => {
      const departure = await run(
        () => apiPost<MemberDeparture>(API_ROUTES.memberDeparture(memberId), { kind }),
        MEMBER_ADMIN_COPY.departedDone
      )
      if (departure) await reload()

      return departure
    },
    [memberId, run, reload]
  )

  const suspend = useCallback(
    async (until: string, reason: string) => {
      const done = await run(
        () => apiPost(API_ROUTES.memberSuspension(memberId), { until, reason }),
        MEMBER_ADMIN_COPY.suspendedDone
      )
      if (done) await reload()

      return done !== null
    },
    [memberId, run, reload]
  )

  const lift = useCallback(async () => {
    const done = await run(
      () => apiDelete(API_ROUTES.memberSuspension(memberId)),
      MEMBER_ADMIN_COPY.liftedDone
    )
    if (done) await reload()
  }, [memberId, run, reload])

  const remove = useCallback(async () => {
    const done = await run(
      () => apiDelete<{ id: string }>(API_ROUTES.member(memberId)),
      MEMBER_ADMIN_COPY.deletedDone
    )

    return done !== null
  }, [memberId, run])

  return { state, isSaving, freeze, thaw, depart, suspend, lift, remove }
}
