'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

import { apiDelete, apiPost, apiPut } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useMutation } from '@/core/hooks/data/useMutation'
import { useSyncedState } from '@/core/hooks/interaction/useSyncedState'
import { TWO_FACTOR_COPY } from '@/declarations/access/copy'
import type { SealState, TwoFactorEnrolment, TwoFactorState } from '@/types/security'

/**
 * Second factor collection
 * @typedef {Object} TwoFactorCollection
 * @property {TwoFactorState} state - Enrolment state
 * @property {SealState} seal - Unlock window
 * @property {TwoFactorEnrolment | null} enrolment - Secret handed over once
 * @property {boolean} isSaving - Request in flight
 * @property {FieldIssue[]} issues - Field rejections
 * @property {() => Promise<void>} enrol - Open an enrolment
 * @property {(code: string) => Promise<boolean>} confirm - Close an enrolment
 * @property {(code: string) => Promise<boolean>} unseal - Open the unlock window
 * @property {() => Promise<void>} seal - Close the unlock window
 * @property {(code: string) => Promise<boolean>} drop - Drop the factor
 * @property {() => void} dismiss - Forget the handed-over secret
 */

export interface TwoFactorCollection {
  state: TwoFactorState
  seal: SealState
  enrolment: TwoFactorEnrolment | null
  isSaving: boolean
  issues: ReturnType<typeof useMutation>['issues']
  enrol: () => Promise<void>
  confirm: (code: string) => Promise<boolean>
  unseal: (code: string) => Promise<boolean>
  reseal: () => Promise<void>
  drop: (code: string) => Promise<boolean>
  dismiss: () => void
}

// Shape both the enrolment and the drop routes answer with
type FactorPayload = TwoFactorState & { seal: SealState }

/**
 * Drive the second factor
 * @param {TwoFactorState} initialState - Enrolment state resolved server-side
 * @param {SealState} initialSeal - Unlock window resolved server-side
 * @return {TwoFactorCollection} - State and mutations
 */

export const useTwoFactor = (
  initialState: TwoFactorState,
  initialSeal: SealState
): TwoFactorCollection => {
  const router = useRouter()
  const { isSaving, issues, clearIssues, run } = useMutation()
  // The server owns both: a window that ran out is resealed on the next render, not on a timer
  const [state, setState] = useSyncedState(initialState)
  const [seal, setSeal] = useSyncedState(initialSeal)
  const [enrolment, setEnrolment] = useState<TwoFactorEnrolment | null>(null)

  // Every sealed value on screen was rendered on the server, so the page has to be replayed
  const replay = useCallback(() => router.refresh(), [router])

  const enrol = useCallback(async () => {
    clearIssues()
    const next = await run(() => apiPost<TwoFactorEnrolment>(API_ROUTES.twoFactor, {}))
    if (next) setEnrolment(next)
  }, [clearIssues, run])

  const confirm = useCallback(
    async (code: string) => {
      const next = await run(
        () => apiPut<FactorPayload>(API_ROUTES.twoFactor, { code }),
        TWO_FACTOR_COPY.confirmed
      )
      if (!next) return false

      setState(next)
      setSeal(next.seal)
      setEnrolment(null)

      return true
    },
    [run, setSeal, setState]
  )

  const unseal = useCallback(
    async (code: string) => {
      const next = await run(
        () => apiPost<SealState>(API_ROUTES.twoFactorSeal, { code }),
        TWO_FACTOR_COPY.unlocked
      )
      if (!next) return false

      setSeal(next)
      replay()

      return true
    },
    [replay, run, setSeal]
  )

  const reseal = useCallback(async () => {
    const next = await run(
      () => apiDelete<SealState>(API_ROUTES.twoFactorSeal),
      TWO_FACTOR_COPY.sealed
    )
    if (!next) return

    setSeal(next)
    replay()
  }, [replay, run, setSeal])

  const drop = useCallback(
    async (code: string) => {
      const next = await run(
        () => apiDelete<FactorPayload>(API_ROUTES.twoFactor, { code }),
        TWO_FACTOR_COPY.dropped
      )
      if (!next) return false

      setState(next)
      setSeal(next.seal)
      replay()

      return true
    },
    [replay, run, setSeal, setState]
  )

  return {
    state,
    seal,
    enrolment,
    isSaving,
    issues,
    enrol,
    confirm,
    unseal,
    reseal,
    drop,
    dismiss: () => setEnrolment(null),
  }
}
