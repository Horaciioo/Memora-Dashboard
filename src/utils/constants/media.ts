export const MediaAssets = {
  Avatar: 'Avatar',
  Division: 'Division',
  Youtuber: 'Youtuber',
} as const

export type MediaAsset = (typeof MediaAssets)[keyof typeof MediaAssets]

/**
 * Media path templates
 * @type {Record<MediaAsset, string>}
 */

export const MEDIA_PATTERNS: Record<MediaAsset, string> = {
  [MediaAssets.Avatar]: 'https://cdn.discordapp.com/avatars/{ownerId}/{hash}.png',
  [MediaAssets.Division]: '/divisions/{hash}.png',
  [MediaAssets.Youtuber]: '/youtubers/{hash}.png',
}

// Content hash pattern
export const MEDIA_HASH_PATTERN = /^[a-zA-Z0-9_-]+$/
