'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { entityFeedback } from '@/declarations/ui/copy'

/**
 * Live state and mutations
 * @typedef {Object} LiveRemoval
 * @property {string | null} target - Live awaiting confirmation
 * @property {boolean} isSaving - Erasure in flight
 * @property {(id: string) => void} ask - Opens the confirmation
 * @property {() => void} cancel - Closes it
 * @property {() => Promise<void>} confirm - Erases the live and all its data
 */

export interface LiveRemoval {
  target: string | null
  isSaving: boolean
  ask: (id: string) => void
  cancel: () => void
  confirm: () => Promise<void>
}

/**
 * Erasure of a finished live, shared by every list showing one
 * @return {LiveRemoval} - State and handlers
 */

export const useLiveRemoval = (): LiveRemoval => {
  const router = useRouter()
  const { isSaving, run } = useMutation()
  const [target, setTarget] = useState<string | null>(null)

  const confirm = async () => {
    if (!target) return

    const done = await run(
      () => apiDelete<{ id: string }>(API_ROUTES.live(target)),
      entityFeedback('live', 'deleted')
    )
    setTarget(null)
    if (done) router.refresh()
  }

  return { target, isSaving, ask: setTarget, cancel: () => setTarget(null), confirm }
}
