import { TWITCH_ENDPOINTS } from '@/declarations/platforms/twitch'

/**
 * Picture of a Twitch emote
 * @param {string} id - Emote identifier
 * @param {boolean} animated - Emote moves
 * @param {'1.0' | '2.0' | '3.0'} scale - Size
 * @return {string} - Image address
 */

export const twitchEmoteUrl = (
  id: string,
  animated: boolean,
  scale: '1.0' | '2.0' | '3.0' = '1.0'
): string =>
  `${TWITCH_ENDPOINTS.images}/emoticons/v2/${encodeURIComponent(id)}/${animated ? 'animated' : 'default'}/dark/${scale}`
