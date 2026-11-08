'use client'

import { useEffect } from 'react'

import { apiPatch } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { useAssistantDock } from '@/core/store/assistantDock'
import type { NotificationEntry } from '@/types/notifications'

/**
 * Whether a notification is the call of Memora to a Responsable
 * @param {NotificationEntry | null} entry - Notification
 * @return {boolean} - Identifier to correct
 */

export const isIdentityAlert = (entry: NotificationEntry | null): boolean =>
  entry?.kind === 'IdentityAlert' && Boolean(entry.targetId)

/**
 * Memora opens by herself on an urgent identifier, nothing else shows it
 * @param {NotificationEntry | null} entry - Next notification waiting
 * @param {() => void} shift - Drops it from the queue
 * @return {void}
 */

export const useIdentityAlert = (entry: NotificationEntry | null, shift: () => void): void => {
  useEffect(() => {
    if (!entry || !isIdentityAlert(entry)) return

    useAssistantDock.getState().alert({ checkId: entry.targetId ?? '' })
    void apiPatch(API_ROUTES.notification(entry.id), {}).catch(() => undefined)
    shift()
  }, [entry, shift])
}
