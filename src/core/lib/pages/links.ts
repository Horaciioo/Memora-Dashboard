/**
 * Protocols a link may open
 * @type {string[]}
 */

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:']

/**
 * Check a link address
 * @param {string} href - Raw address
 * @return {boolean} - Safe to open
 */

export const isSafeHref = (href: string): boolean => {
  const value = href.trim()
  if (!value) return false

  // Memora path, never protocol relative
  if (value.startsWith('/')) return !value.startsWith('//') && !value.startsWith('/\\')

  try {
    return SAFE_PROTOCOLS.includes(new URL(value).protocol)
  } catch {
    return false
  }
}

/**
 * Turn a typed address into a link
 * @param {string} input - Typed address
 * @return {string | null} - Usable address
 */

export const normalizeHref = (input: string): string | null => {
  const value = input.trim()
  if (!value) return null
  if (isSafeHref(value)) return value

  // Bare domain gets https
  const prefixed = `https://${value}`

  return /^[\w-]+(\.[\w-]+)+/.test(value) && isSafeHref(prefixed) ? prefixed : null
}
