/**
 * Append an unsigned varint
 * @param {number[]} bytes - Output
 * @param {number} value - Whole number
 * @return {void}
 */

export const writeVarint = (bytes: number[], value: number): void => {
  let rest = Math.max(0, Math.round(value))
  while (rest >= 128) {
    bytes.push((rest & 127) | 128)
    rest = Math.floor(rest / 128)
  }
  bytes.push(rest)
}

/**
 * Sequential reader of bytes
 * @typedef {Object} ByteReader
 */

export interface ByteReader {
  byte: () => number
  varint: () => number
  isDone: () => boolean
}

/**
 * Reader over bytes
 * @param {Uint8Array} bytes - Bytes
 * @param {number} [start] - First byte
 * @return {ByteReader} - Reader
 */

export const readerOf = (bytes: Uint8Array, start = 0): ByteReader => {
  let cursor = start

  return {
    byte: () => {
      if (cursor >= bytes.length) throw new Error('Truncated message')

      return bytes[cursor++]
    },
    varint: () => {
      let value = 0
      let factor = 1
      for (;;) {
        if (cursor >= bytes.length) throw new Error('Truncated message')
        const next = bytes[cursor++]
        value += (next & 127) * factor
        if (!(next & 128)) return value
        factor *= 128
      }
    },
    isDone: () => cursor >= bytes.length,
  }
}
