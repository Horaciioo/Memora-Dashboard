// Prefix of one page's topic
const PAGE_PREFIX = 'page:'

/**
 * Topics of the page bus
 * @type {{ access: string, page: (id: string) => string, pageIdOf: (topic: string) => string | null }}
 */

export const PAGE_TOPICS = {
  // Any share or trash move, every open page checks again
  access: 'pages:access',
  page: (id: string) => `${PAGE_PREFIX}${id}`,
  pageIdOf: (topic: string): string | null =>
    topic.startsWith(PAGE_PREFIX) ? topic.slice(PAGE_PREFIX.length) || null : null,
}

/**
 * Event names written on the socket
 * @type {Record<string, string>}
 */

export const PAGE_STREAM_EVENTS = {
  // New content version saved
  saved: 'saved',
  // Title, icon or cover moved
  meta: 'meta',
  // Discussion moved
  comments: 'comments',
  // This member lost the page
  access: 'access',
} as const

export type PageStreamEvent = (typeof PAGE_STREAM_EVENTS)[keyof typeof PAGE_STREAM_EVENTS]
