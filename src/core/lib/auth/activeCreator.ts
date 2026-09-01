import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'

import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { NavigationViews, isNavigationView } from '@/declarations/navigation'
import type { NavigationViewName } from '@/declarations/navigation'
import { cookieName } from '@/utils/constants/cookies'

/**
 * Creator cookie name
 * @type {string}
 */

export const ACTIVE_CREATOR_COOKIE = cookieName('activeYoutuber')

/**
 * View cookie name
 * @type {string}
 */

export const NAVIGATION_VIEW_COOKIE = cookieName('navigationView')

// Days in one session, both cookies dying with it
const DAY_SECONDS = 86_400

// Shared shape, neither cookie ever leaving the site or reaching a script
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
 * @param {string | null} youtuberId - Creator identifier, null clearing it
 * @return {Promise<void>} - Written
 */

export const writeActiveCreator = async (youtuberId: string | null): Promise<void> => {
  const store = await cookies()

  if (youtuberId === null) {
    store.delete(ACTIVE_CREATOR_COOKIE)

    return
  }

  store.set(ACTIVE_CREATOR_COOKIE, youtuberId, COOKIE_OPTIONS)
}

/**
 * Read the view
 * @return {Promise<NavigationViewName>} - Rail view
 */

export const readNavigationView = cache(async (): Promise<NavigationViewName> => {
  const store = await cookies()
  const stored = store.get(NAVIGATION_VIEW_COOKIE)?.value

  return isNavigationView(stored) ? stored : NavigationViews.Moderation
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
