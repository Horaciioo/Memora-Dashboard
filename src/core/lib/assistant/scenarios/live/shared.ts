import { apiGet } from '@/core/lib/api/client'
import { API_ROUTES } from '@/core/lib/api/routes'
import { LIVE_PLATFORM_REGISTRY } from '@/declarations/lives/registries'
import type { LivePlanning, LiveView } from '@/types/lives'
import type { LivePlatformName } from '@/utils/constants/lives'
import { LiveStatuses } from '@/utils/constants/lives'

/**
 * Platforms and creators a live can be planned on
 * @return {Promise<LivePlanning>} - Models and creators
 */

export const readPlanning = (): Promise<LivePlanning> =>
  apiGet<LivePlanning>(API_ROUTES.livePlanning)

/**
 * Lives announced and not started
 * @return {Promise<LiveView[]>} - Soonest first
 */

export const announcedLives = async (): Promise<LiveView[]> =>
  (await apiGet<LiveView[]>(API_ROUTES.lives)).filter(
    (live) => live.status === LiveStatuses.Announced && live.calendarEventId
  )

/**
 * Platform in a word
 * @param {LivePlatformName} platform - Platform
 * @return {string} - Name
 */

export const platformName = (platform: string): string =>
  LIVE_PLATFORM_REGISTRY.label(platform as LivePlatformName)

/**
 * Moment in words, read as written
 * @param {string} moment - Wall clock "YYYY-MM-DDTHH:mm" or ISO moment
 * @return {string} - Spoken moment
 */

export const whenOf = (moment: string): string =>
  new Date(moment.length === 16 ? `${moment}:00Z` : moment).toLocaleString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    ...(moment.length === 16 ? { timeZone: 'UTC' } : {}),
  })

/**
 * Length in words
 * @param {number} minutes - Minutes
 * @return {string} - Spoken length
 */

export const lengthOf = (minutes: number): string =>
  minutes % 60 === 0 ? `${minutes / 60} h` : `${Math.floor(minutes / 60)} h ${minutes % 60}`
