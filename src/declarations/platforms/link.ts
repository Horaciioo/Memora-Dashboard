import { ROUTES } from '@/declarations/navigation'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Outcome of a platform link
 * @type {Record<string, string>}
 */

export const LINK_RESULT = {
  linked: 'lie',
  failed: 'erreur',
} as const

/**
 * Query keys of the outcome
 * @type {Record<string, string>}
 */

export const LINK_PARAMS = {
  platform: 'liaison',
  result: 'resultat',
} as const

/**
 * Settings page after a platform link
 * @param {LivePlatformName} platform - Platform linked
 * @param {string} result - Outcome
 * @return {string} - Destination
 */

export const linkDestination = (platform: LivePlatformName, result: string): string =>
  `${ROUTES.preferences}?${new URLSearchParams({
    [LINK_PARAMS.platform]: platform.toLowerCase(),
    [LINK_PARAMS.result]: result,
  })}`

/**
 * Public page of an account, by platform
 * @type {Record<string, { href: string, label: string }>}
 */

export const ACCOUNT_PAGES: Record<string, { href: string; label: string }> = {
  discord: { href: 'https://discord.com/users/{id}', label: 'discord.com/users/{id}' },
  twitch: { href: 'https://www.twitch.tv/{id}', label: 'twitch.tv/{id}' },
  youtube: { href: 'https://www.youtube.com/@{id}', label: 'youtube.com/@{id}' },
  youtubeChannel: {
    href: 'https://www.youtube.com/channel/{id}',
    label: 'youtube.com/channel/{id}',
  },
}

// A channel without handle shows its identifier
const YOUTUBE_CHANNEL_ID = /^UC[\w-]{22}$/

/**
 * Where an account lives on its platform
 * @param {string} platform - Logo key of the platform
 * @param {string} handle - Login or identifier
 * @return {{ href: string, label: string }} - Address and text shown
 */

export const accountPageOf = (
  platform: string,
  handle: string
): { href: string; label: string } => {
  const key =
    platform === 'youtube' && YOUTUBE_CHANNEL_ID.test(handle) ? 'youtubeChannel' : platform
  const page = ACCOUNT_PAGES[key]

  return {
    href: page.href.replace('{id}', encodeURIComponent(handle)),
    label: page.label.replace('{id}', handle),
  }
}
