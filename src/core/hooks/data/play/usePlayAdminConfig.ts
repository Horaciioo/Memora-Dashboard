'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiPost } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { FieldIssue } from '@/types/forms'
import type { PlayConfigView } from '@/types/play'

/**
 * Gestures on the Play settings
 * @typedef {Object} PlayAdminConfig
 * @property {PlayConfigView} config - Settings now
 * @property {boolean} isSaving - Gesture in flight
 * @property {FieldIssue[]} issues - Drawer failures
 */

export interface PlayAdminConfig {
  config: PlayConfigView
  isSaving: boolean
  issues: FieldIssue[]
  save: (patch: Record<string, unknown>, done: string) => Promise<boolean>
  setGameOpen: (game: string, isOpen: boolean, done: string) => Promise<boolean>
}

/**
 * Drive the boosts, the banner and the settings pages
 * @param {PlayConfigView} initial - Settings resolved server-side
 * @return {PlayAdminConfig} - State and gestures
 */

export const usePlayAdminConfig = (initial: PlayConfigView): PlayAdminConfig => {
  const router = useRouter()
  const [config, setConfig] = useState(initial)
  const { isSaving, issues, run } = useMutation()

  const save = useCallback(
    async (patch: Record<string, unknown>, done: string) => {
      const next = await run(() => apiPost<PlayConfigView>(API_ROUTES.playAdminConfig, patch), done)
      if (!next) return false

      setConfig(next)
      router.refresh()

      return true
    },
    [run, router]
  )

  const setGameOpen = useCallback(
    async (game: string, isOpen: boolean, done: string) => {
      const result = await run(
        () => apiPost<{ ok: boolean }>(API_ROUTES.playAdminGames, { game, isOpen }),
        done
      )
      if (result) router.refresh()

      return Boolean(result)
    },
    [run, router]
  )

  return { config, isSaving, issues, save, setGameOpen }
}
