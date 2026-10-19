import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * Link start of a channel on each platform
 * @type {Record<LivePlatformName, string>}
 */

export const CHANNEL_LINK_PREFIX: Record<LivePlatformName, string> = {
  [LivePlatforms.Twitch]: 'https://www.twitch.tv/',
  [LivePlatforms.YouTube]: 'https://www.youtube.com/@',
}
