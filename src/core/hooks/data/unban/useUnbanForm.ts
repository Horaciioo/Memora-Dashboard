'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { useMutation } from '@/core/hooks/data/system/useMutation'
import { apiDelete, apiGet, apiPost, apiPut, messageOf } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import { hasChanged } from '@/core/lib/unban/formDiff'
import { UNBAN_COPY } from '@/declarations/unban/copy'
import type { UnbanFormSnapshot } from '@/declarations/unban/form'
import type { UnbanFormVersionView } from '@/types/unban'
import { SECOND_MS } from '@/utils/constants/time'

// Quiet time before a change is saved
const SAVE_DELAY_MS = SECOND_MS

interface FormPair {
  active: UnbanFormVersionView
  draft: UnbanFormVersionView | null
}

export type UnbanSaveState = 'saved' | 'saving' | 'failed'

/**
 * Form being edited
 * @typedef {Object} UnbanFormEditor
 * @property {UnbanFormVersionView | undefined} active - Version served now
 * @property {UnbanFormVersionView[]} versions - Published versions, newest first
 * @property {UnbanFormSnapshot | null} snapshot - Questions as edited
 * @property {boolean} hasDraft - Edits differ from the version served
 * @property {UnbanSaveState} saveState - Where the autosave stands
 * @property {string | null} saveError - Words about a refused save
 * @property {boolean} isSaving - Publication or discard in flight
 * @property {(next: UnbanFormSnapshot) => void} edit - Change the questions
 * @property {() => Promise<boolean>} publish - Serve the draft
 * @property {() => Promise<void>} discard - Throw the draft away
 */

export interface UnbanFormEditor {
  active: UnbanFormVersionView | undefined
  versions: UnbanFormVersionView[]
  snapshot: UnbanFormSnapshot | null
  hasDraft: boolean
  saveState: UnbanSaveState
  saveError: string | null
  isSaving: boolean
  edit: (next: UnbanFormSnapshot) => void
  publish: () => Promise<boolean>
  discard: () => Promise<void>
}

/**
 * Drive the form tab, every change is saved as the draft after a quiet moment
 * @return {UnbanFormEditor} - State and writes
 */

export const useUnbanForm = (): UnbanFormEditor => {
  const queryClient = useQueryClient()
  const { isSaving, run } = useMutation()
  const [edited, setEdited] = useState<UnbanFormSnapshot | null>(null)
  const [saveState, setSaveState] = useState<UnbanSaveState>('saved')
  const [saveError, setSaveError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const { data: pair } = useQuery({
    queryKey: QUERY_KEYS.unbanForm,
    queryFn: () => apiGet<FormPair>(API_ROUTES.unbanForm),
  })
  const { data: versions = [] } = useQuery({
    queryKey: QUERY_KEYS.unbanVersions,
    queryFn: () => apiGet<UnbanFormVersionView[]>(API_ROUTES.unbanFormVersions),
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  // Edits win over what the server holds
  const snapshot = edited ?? pair?.draft?.snapshot ?? pair?.active.snapshot ?? null
  const hasDraft = Boolean(pair && snapshot && hasChanged(pair.active.snapshot, snapshot))

  const save = useCallback(
    async (next: UnbanFormSnapshot) => {
      setSaveState('saving')
      try {
        const draft = await apiPut<UnbanFormVersionView>(API_ROUTES.unbanForm, next)
        queryClient.setQueryData<FormPair>(QUERY_KEYS.unbanForm, (current) =>
          current ? { ...current, draft } : current
        )
        setSaveError(null)
        setSaveState('saved')
      } catch (error) {
        setSaveError(messageOf(error))
        setSaveState('failed')
      }
    },
    [queryClient]
  )

  const edit = useCallback(
    (next: UnbanFormSnapshot) => {
      setEdited(next)
      setSaveState('saving')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => void save(next), SAVE_DELAY_MS)
    },
    [save]
  )

  const publish = useCallback(async () => {
    clearTimeout(timer.current)
    // Last edits reach the draft first
    if (edited) await save(edited)

    const published = await run(
      () => apiPost<UnbanFormVersionView>(API_ROUTES.unbanFormPublish, {}),
      UNBAN_COPY.formPublished
    )
    if (!published) return false

    setEdited(null)
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unban })

    return true
  }, [edited, run, save, queryClient])

  const discard = useCallback(async () => {
    clearTimeout(timer.current)
    const done = await run(
      () => apiDelete<{ discarded: boolean }>(API_ROUTES.unbanForm),
      UNBAN_COPY.formDiscarded
    )
    if (!done) return

    setEdited(null)
    setSaveState('saved')
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.unban })
  }, [run, queryClient])

  return {
    active: pair?.active,
    versions,
    snapshot,
    hasDraft,
    saveState,
    saveError,
    isSaving,
    edit,
    publish,
    discard,
  }
}
