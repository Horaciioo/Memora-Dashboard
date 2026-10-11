import type { LivePlatformName } from '@/utils/constants/lives'

/**
 * One platform link of a member
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
 * @property {string} id - Channel identifier
 * @property {LivePlatformName} platform - Platform
 * @property {string} login - Channel login
 * @property {string | null} displayName - Display name
 * @property {string} url - Public channel link
 */

export interface CreatorChannelView {
  id: string
  platform: LivePlatformName
  url: string
  login: string
  displayName: string | null
}
