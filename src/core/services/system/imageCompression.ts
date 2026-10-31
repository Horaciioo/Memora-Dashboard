import 'server-only'

import sharp from 'sharp'

import { IMAGE_QUALITY } from '@/declarations/system/storage'

// Raster types worth re-encoding, a GIF may be animated
const COMPRESSIBLE = ['image/png', 'image/jpeg', 'image/webp']

/**
 * Compressed picture
 * @typedef {Object} PackedImage
 * @property {Buffer} data - Bytes to store
 * @property {string} mimeType - Type of those bytes
 */

export interface PackedImage {
  data: Buffer
  mimeType: string
}

/**
 * Shrink a picture to WebP within a longest side, the original kept when it is already lighter
 * @param {Buffer} data - Uploaded bytes
 * @param {string} mimeType - Sniffed type
 * @param {number} [maxEdge] - Longest side to keep
 * @return {Promise<PackedImage>} - Bytes to store
 */

export const compressImage = async (
  data: Buffer,
  mimeType: string,
  maxEdge?: number
): Promise<PackedImage> => {
  if (!maxEdge || !COMPRESSIBLE.includes(mimeType)) return { data, mimeType }

  try {
    const packed = await sharp(data)
      .rotate()
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: IMAGE_QUALITY })
      .toBuffer()

    return packed.byteLength < data.byteLength
      ? { data: packed, mimeType: 'image/webp' }
      : { data, mimeType }
  } catch {
    return { data, mimeType }
  }
}
