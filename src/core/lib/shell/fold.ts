import { AUTH_SETTINGS } from '@/declarations/configurations/settings'
import { cookieName } from '@/utils/constants/cookies'

/**
 * Fold cookie name
 * @type {string}
 */

export const SIDEBAR_FOLD_COOKIE = cookieName('sidebarFold')

/**
 * Only value ever written, its absence meaning the rail is open
 * @type {string}
 */

export const SIDEBAR_FOLDED = 'folded'

// Seconds in one day, the cookie living as long as a session
const DAY_SECONDS = 86_400

/**
 * Remember the fold in the browser, so the server renders the right width on reload
 * @param {boolean} isCollapsed - Rail folded to glyphs
 * @return {void}
 */

export const rememberSidebarFold = (isCollapsed: boolean): void => {
  const maxAge = isCollapsed ? AUTH_SETTINGS.sessionDays * DAY_SECONDS : 0

  document.cookie = `${SIDEBAR_FOLD_COOKIE}=${SIDEBAR_FOLDED}; path=/; max-age=${maxAge}; samesite=lax`
}
