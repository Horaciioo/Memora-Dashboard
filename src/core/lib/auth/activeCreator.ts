import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { isNavigationView } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import { cookieName } from '@/utils/constants/cookies'
import { DAY_SECONDS } from '@/utils/constants/time'

/**
 * Creator cookie name
 * @type {string}
 */

export const ACTIVE_CREATOR_COOKIE = cookieName('activeYoutuber')

// Creator picked for a lower view
const AUTO_CREATOR_COOKIE = cookieName('activeYoutuberAuto')

/**
 * View cookie name
 * @type {string}
 */

export const NAVIGATION_VIEW_COOKIE = cookieName('navigationView')

// Shared shape
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: AUTH_SETTINGS.sessionDays * DAY_SECONDS,
} as const

/**
 * Read the creator
 * @return {Promise<string | null>} - Creator identifier
 */

export const readActiveCreator = cache(async (): Promise<string | null> => {
  const store = await cookies()

  return store.get(ACTIVE_CREATOR_COOKIE)?.value ?? null
})

/**
 * Pin the creator
 * @param {string | null} youtuberId - Creator identifier
 * @param {boolean} [isAuto] - Picked by a view
 * @return {Promise<void>} - Written
 */

export const writeActiveCreator = async (
  youtuberId: string | null,
  isAuto = false
): Promise<void> => {
  const store = await cookies()

  // A hand pick is kept on return
  if (isAuto) store.set(AUTO_CREATOR_COOKIE, '1', COOKIE_OPTIONS)
  else store.delete(AUTO_CREATOR_COOKIE)

  if (youtuberId === null) {
    store.delete(ACTIVE_CREATOR_COOKIE)

    return
  }

  store.set(ACTIVE_CREATOR_COOKIE, youtuberId, COOKIE_OPTIONS)
}

/**
 * Drop a creator a view picked
 * @return {Promise<void>} - Dropped
 */

export const dropAutoCreator = async (): Promise<void> => {
  const store = await cookies()
  if (store.get(AUTO_CREATOR_COOKIE)) await writeActiveCreator(null)
}

/**
 * Read the view
 * @return {Promise<NavigationViewName | null>} - Null when none was picked
 */

export const readNavigationView = cache(async (): Promise<NavigationViewName | null> => {
  const store = await cookies()
  const stored = store.get(NAVIGATION_VIEW_COOKIE)?.value

  return isNavigationView(stored) ? stored : null
})

/**
 * Pin the view
 * @param {NavigationViewName} view - Rail view
 * @return {Promise<void>} - Written
 */

export const writeNavigationView = async (view: NavigationViewName): Promise<void> => {
  const store = await cookies()
  store.set(NAVIGATION_VIEW_COOKIE, view, COOKIE_OPTIONS)
}
