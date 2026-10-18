/**
 * Magic bytes identifying one media type
 * @typedef {Object} FileSignature
 * @property {string} mime - Detected type
 * @property {number[]} bytes - Expected bytes
 * @property {number} offset - Where they start
 */

export interface FileSignature {
  mime: string
  bytes: number[]
  offset: number
}

/**
 * Signatures the application accepts
 * @type {FileSignature[]}
 */

export const FILE_SIGNATURES: FileSignature[] = [
  { mime: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  { mime: 'image/jpeg', bytes: [0xff, 0xd8, 0xff], offset: 0 },
  { mime: 'image/gif', bytes: [0x47, 0x49, 0x46], offset: 0 },
  { mime: 'image/webp', bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
  { mime: 'application/pdf', bytes: [0x25, 0x50, 0x44, 0x46], offset: 0 },
]

/**
 * Type of anything unrecognised
 * @type {string}
 */

export const BINARY_MIME_TYPE = 'application/octet-stream'

/**
 * Read the real type of some bytes
 * @param {Uint8Array<ArrayBufferLike>} data - Raw bytes
 * @return {string} - Detected type
 */

export const sniffMimeType = (data: Uint8Array<ArrayBufferLike>): string => {
  const found = FILE_SIGNATURES.find((signature) =>
    signature.bytes.every((byte, index) => data[signature.offset + index] === byte)
  )

  return found?.mime ?? BINARY_MIME_TYPE
}
