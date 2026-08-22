'use client'

import { useCallback, useState } from 'react'

import { ApiClientError, messageOf } from '@/core/lib/api/client'
import { useNotifications } from '@/managers/infrastructure/Network/NotificationsManager'
import type { FieldIssue } from '@/types/forms'

/**
 * Shared mutation state of every domain hook
 * @typedef {Object} MutationState
 * @property {boolean} isSaving - Request in flight
 * @property {FieldIssue[]} issues - Field rejections of the last attempt
 * @property {() => void} clearIssues - Forget the rejections
 * @property {(action: () => Promise<T>, successTitle?: string) => Promise<T | null>} run - Run one mutation
 */

export interface MutationState {
  isSaving: boolean
  issues: FieldIssue[]
  clearIssues: () => void
  run: <T>(action: () => Promise<T>, successTitle?: string) => Promise<T | null>
}

/**
 * Wrap a mutation with its loading, rejection and toast handling
 * @return {MutationState} - Mutation state and runner
 */

export const useMutation = (): MutationState => {
  const [isSaving, setSaving] = useState(false)
  const [issues, setIssues] = useState<FieldIssue[]>([])
  const { notify, notifyError } = useNotifications()

  const clearIssues = useCallback(() => setIssues([]), [])

  const run = useCallback(
    async <T>(action: () => Promise<T>, successTitle?: string): Promise<T | null> => {
      setSaving(true)
      setIssues([])

      try {
        const result = await action()
        if (successTitle) notify({ tone: 'success', title: successTitle })

        return result
      } catch (error) {
        // Field rejections land on the form, anything else lands in a toast
        if (error instanceof ApiClientError && error.issues.length > 0) {
          setIssues(error.issues.filter((issue): issue is FieldIssue => Boolean(issue.field)))
        } else {
          notifyError(error, messageOf(error))
        }

        return null
      } finally {
        setSaving(false)
      }
    },
    [notify, notifyError]
  )

  return { isSaving, issues, clearIssues, run }
}
