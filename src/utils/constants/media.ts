export const MediaAssets = {
  Avatar: 'Avatar',
  Icon: 'Icon',
} as const

export type MediaAsset = (typeof MediaAssets)[keyof typeof MediaAssets]

/**
 * Media path templates
 * @type {Record<MediaAsset, string>}
 */

export const MEDIA_PATTERNS: Record<MediaAsset, string> = {
  [MediaAssets.Avatar]: '/media/avatars/{ownerId}/{hash}.png',
  [MediaAssets.Icon]: '/media/icons/{ownerId}/{hash}.png',
}

// Content hash pattern
export const MEDIA_HASH_PATTERN = /^[a-zA-Z0-9_-]+$/
