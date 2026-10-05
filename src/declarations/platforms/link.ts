import { ROUTES } from '@/declarations/navigation'

/**
 * Outcome of a Twitch link
 * @type {Record<string, string>}
 */

export const TWITCH_LINK_RESULT = {
  linked: 'lie',
  failed: 'erreur',
} as const

// Query key of the outcome
export const TWITCH_LINK_PARAM = 'twitch'

/**
 * Settings page after a Twitch link
 * @param {string} result - Outcome
 * @return {string} - Destination
 */

export const twitchLinkDestination = (result: string): string =>
  `${ROUTES.preferences}?${TWITCH_LINK_PARAM}=${result}`
