// Bytes per String.fromCharCode call
const CHUNK = 0x8000

/**
 * Bytes as text for a JSON frame
 * @param {Uint8Array} bytes - Raw bytes
 * @return {string} - Base64
 */

export const toBase64 = (bytes: Uint8Array): string => {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64')
  }
  let binary = ''
  for (let start = 0; start < bytes.length; start += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(start, start + CHUNK))
  }

  return btoa(binary)
}

/**
 * Bytes back from a JSON frame
 * @param {string} text - Base64
 * @return {Uint8Array} - Raw bytes
 */

export const fromBase64 = (text: string): Uint8Array => {
  if (typeof Buffer !== 'undefined') return new Uint8Array(Buffer.from(text, 'base64'))

  return Uint8Array.from(atob(text), (char) => char.charCodeAt(0))
}
