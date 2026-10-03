import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * One platform link of a member, as the settings show it
 * @typedef {Object} PlatformLinkView
 * @property {LivePlatformName} platform - Platform
 * @property {string} login - Account shown
 * @property {boolean} revoked - Must be reconnected
 */

export interface PlatformLinkView {
  platform: LivePlatformName
  login: string
  revoked: boolean
}

/**
 * Platform channel of a creator
 * @typedef {Object} CreatorChannelView
 * @property {string} login - Channel login
 * @property {string | null} displayName - Display name
 */

export interface CreatorChannelView {
  login: string
  displayName: string | null
}
