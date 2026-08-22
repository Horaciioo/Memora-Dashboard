import { MEDIA_HASH_PATTERN, MEDIA_PATTERNS, MediaAssets, type MediaAsset } from '@/utils/constants'

/**
 * Resolve image URL
 * @param {string | null | undefined} source - URL or hash
 * @param {Object} [options] - Resolution options
 * @param {MediaAsset} [options.asset] - Media pattern
 * @param {string} [options.ownerId] - Owner ID
 * @return {string | null} - Image URL or null
 */

export function getValidImageUrl(
  source: string | null | undefined,
  options: { asset?: MediaAsset; ownerId?: string } = {}
): string | null {
  if (!source) return null

  // Absolute URL or local path
  if (/^(https?:)?\/\//.test(source) || source.startsWith('/')) return source

  // Expand hash via pattern
  const { asset, ownerId } = options
  if (asset && ownerId && MEDIA_HASH_PATTERN.test(source)) {
    return MEDIA_PATTERNS[asset].replace('{ownerId}', ownerId).replace('{hash}', source)
  }

  return null
}

/**
 * Resolve avatar URL
 * @param {string | null | undefined} avatar - Avatar URL or hash
 * @param {string} [ownerId] - Owner ID
 * @return {string | null} - Avatar URL or null
 */

export function getAvatarUrl(avatar: string | null | undefined, ownerId?: string): string | null {
  return getValidImageUrl(avatar, { asset: MediaAssets.Avatar, ownerId })
}
