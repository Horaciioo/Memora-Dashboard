import type { PlatformGrant, PlatformIdentity } from '@/core/lib/platforms/grant'
import {
  buildTwitchAuthorizeUrl,
  exchangeTwitchCode,
  readTwitchUser,
  revokeTwitchToken,
} from '@/core/lib/platforms/twitch/oauth'
import {
  buildYoutubeAuthorizeUrl,
  exchangeYoutubeCode,
  readYoutubeChannel,
  revokeYoutubeToken,
} from '@/core/lib/platforms/youtube/oauth'
import { isTwitchConfigured } from '@/declarations/platforms/twitch'
import { isYoutubeConfigured } from '@/declarations/platforms/youtube'
import { LivePlatforms } from '@/utils/constants/lives'
import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * What linking a member's account to one platform takes
 * @typedef {Object} PlatformLinker
 * @property {() => boolean} isConfigured - Application declared on this server
 * @property {(state: string) => string} authorizeUrl - Where the member grants access
 * @property {(code: string) => Promise<PlatformGrant>} exchange - Code traded for tokens
 * @property {(accessToken: string) => Promise<PlatformIdentity>} identify - Who the tokens belong to
 * @property {(token: string) => Promise<void>} revoke - Tokens given back
 */

export interface PlatformLinker {
  isConfigured: () => boolean
  authorizeUrl: (state: string) => string
  exchange: (code: string) => Promise<PlatformGrant>
  identify: (accessToken: string) => Promise<PlatformIdentity>
  revoke: (token: string) => Promise<void>
}

/**
 * Link steps of every platform
 * @type {Record<LivePlatformName, PlatformLinker>}
 */

export const PLATFORM_LINKERS: Record<LivePlatformName, PlatformLinker> = {
  [LivePlatforms.Twitch]: {
    isConfigured: isTwitchConfigured,
    authorizeUrl: buildTwitchAuthorizeUrl,
    exchange: exchangeTwitchCode,
    identify: readTwitchUser,
    revoke: revokeTwitchToken,
  },
  [LivePlatforms.YouTube]: {
    isConfigured: isYoutubeConfigured,
    authorizeUrl: buildYoutubeAuthorizeUrl,
    exchange: exchangeYoutubeCode,
    identify: readYoutubeChannel,
    revoke: revokeYoutubeToken,
  },
}
