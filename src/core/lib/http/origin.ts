// Headers a proxy sets
const HOST_HEADERS = ['x-forwarded-host', 'host'] as const

// Hostname with optional port
const HOST_PATTERN = /^[a-z0-9.-]+(:\d+)?$/i

/**
 * Read first value of a header
 * @param {Headers} headers - Request headers
 * @param {string} name - Header name
 * @return {string} - First value
 */

const readFirst = (headers: Headers, name: string): string =>
  headers.get(name)?.split(',')[0]?.trim() ?? ''

/**
 * Read the origin members used
 * @param {Headers} headers - Request headers
 * @param {string} fallback - Internal origin
 * @return {string} - Public origin
 */

export const readPublicOrigin = (headers: Headers, fallback: string): string => {
  // Host the proxy forwarded
  const host = HOST_HEADERS.map((name) => readFirst(headers, name)).find((value) =>
    HOST_PATTERN.test(value)
  )
  if (!host) return fallback

  // Scheme the member used
  const protocol =
    readFirst(headers, 'x-forwarded-proto') || new URL(fallback).protocol.slice(0, -1)

  return `${protocol}://${host}`
}
