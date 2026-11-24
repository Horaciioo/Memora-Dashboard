import { NOTIFICATION_SETTINGS } from '@/declarations/configurations/settings'
import { HOUR_MS } from '@/utils/constants/time'

/**
 * Date before which an unread notification no longer counts
 * @return {Date} - Expiry horizon
 */

export const expiryHorizon = (): Date =>
  new Date(Date.now() - NOTIFICATION_SETTINGS.unreadExpiryHours * HOUR_MS)

/**
 * Whether a notification outlived its unread window
 * @param {Date} createdAt - Creation date
 * @return {boolean} - Expired
 */

export const isExpired = (createdAt: Date): boolean => createdAt < expiryHorizon()

/**
 * Filter of the notifications still worth an unread mark
 * @return {{ readAt: null, createdAt: { gte: Date } }} - Prisma filter
 */

export const stillUnread = () => ({ readAt: null, createdAt: { gte: expiryHorizon() } })
