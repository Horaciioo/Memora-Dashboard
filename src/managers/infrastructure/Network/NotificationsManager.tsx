'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

import { ApiClientError } from '@/core/lib/api/client'
import { FEEDBACK_COPY } from '@/declarations/ui/copy'
import { MOTION_TIMERS } from '@/declarations/ui/motion'
import type { Tone } from '@/declarations/ui/theme'

/**
 * Notification
 * @typedef {Object} Notification
 * @property {string} id - ID
 * @property {Tone} tone - Visual tone
 * @property {string} title - Title text
 * @property {string} [description] - Description
 * @property {number} durationMs - Lifetime
 */

export interface Notification {
  id: string
  tone: Tone
  title: string
  description?: string
  durationMs: number
}

/**
 * Notifications context
 * @typedef {Object} NotificationsContextValue
 * @property {Notification[]} notifications - Toast queue
 * @property {(notification: Omit<Notification, 'id' | 'durationMs'>) => string} notify - Add notification
 * @property {(error: unknown, fallback?: string) => string} notifyError - Error notification
 * @property {(id: string) => void} dismiss - Dismiss toast
 * @property {() => void} clear - Clear all
 * @property {(id: string) => void} pause - Pause dismiss
 * @property {(id: string) => void} resume - Resume dismiss
 */

interface NotificationsContextValue {
  notifications: Notification[]
  notify: (notification: Omit<Notification, 'id' | 'durationMs'>) => string
  notifyError: (error: unknown, fallback?: string) => string
  dismiss: (id: string) => void
  clear: () => void
  pause: (id: string) => void
  resume: (id: string) => void
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

/**
 * Notification provider
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - Tree children
 * @return {JSX.Element} - Provider
 */

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  // Timers outside state
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  /**
   * Dismiss notification
   * @param {string} id - Notification ID
   * @return {void} - Dismiss
   */

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)

    setNotifications((current) => current.filter((notification) => notification.id !== id))
  }, [])

  /**
   * Add notification
   * @param {Omit<Notification, 'id' | 'durationMs'>} notification - Notification
   * @return {string} - ID
   */

  const notify = useCallback(
    (notification: Omit<Notification, 'id' | 'durationMs'>) => {
      const id = crypto.randomUUID()
      const durationMs = MOTION_TIMERS.autoDismissMs

      setNotifications((current) => [...current, { ...notification, id, durationMs }])
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durationMs)
      )

      return id
    },
    [dismiss]
  )

  /**
   * Notify error
   * @param {unknown} error - Error
   * @param {string} [fallback] - Fallback
   * @return {string} - ID
   */

  const notifyError = useCallback(
    (error: unknown, fallback: string = FEEDBACK_COPY.retry) => {
      const message = error instanceof ApiClientError ? error.message : fallback
      const description =
        error instanceof ApiClientError && error.issues.length > 0
          ? error.issues.map((issue) => issue.message).join(', ')
          : undefined

      return notify({ tone: 'danger', title: message, description })
    },
    [notify]
  )

  /**
   * Pause dismiss
   * @param {string} id - Notification ID
   * @return {void} - Pause
   */

  const pause = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
  }, [])

  /**
   * Resume dismiss
   * @param {string} id - Notification ID
   * @return {void} - Resume
   */

  const resume = useCallback(
    (id: string) => {
      if (timers.current.has(id)) return

      const notification = notifications.find((entry) => entry.id === id)
      if (!notification) return

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), notification.durationMs)
      )
    },
    [dismiss, notifications]
  )

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      notify,
      notifyError,
      dismiss,
      clear: () => setNotifications([]),
      pause,
      resume,
    }),
    [notifications, notify, notifyError, dismiss, pause, resume]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

/**
 * Use notifications
 * @return {NotificationsContextValue} - Helpers
 */

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext)
  if (!context) throw new Error('useNotifications must be used within NotificationProvider')

  return context
}
