const HANDLE_PATTERN = /^[\w.-]{3,30}$/
const URL_PATTERN = /^https?:\/\/(?:www\.|m\.)?youtube\.com\/\S+$/i

/**
 * Canonical YouTube channel
 * @param {string} value - Handle or link
 * @return {{ url: string, login: string } | null} - Channel or nothing
 */

export const parseYoutubeChannel = (value: string): { url: string; login: string } | null => {
  const trimmed = value.trim().replace(/\/+$/, '')

  // Pasted link
  if (URL_PATTERN.test(trimmed)) {
    return { url: trimmed, login: trimmed.split('/').at(-1) ?? trimmed }
  }

  // Bare handle
  const handle = trimmed.replace(/^@/, '')
  if (!HANDLE_PATTERN.test(handle)) return null

  return { url: `https://www.youtube.com/@${handle}`, login: `@${handle}` }
}
