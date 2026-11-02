// Prefix of one session's topic
const SESSION_PREFIX = 'recrutement:session:'

/**
 * Topics of the recruitment bus
 * @type {{ session: (id: string) => string, sessionIdOf: (topic: string) => string | null }}
 */

export const RECRUITMENT_TOPICS = {
  session: (id: string) => `${SESSION_PREFIX}${id}`,
  sessionIdOf: (topic: string): string | null =>
    topic.startsWith(SESSION_PREFIX) ? topic.slice(SESSION_PREFIX.length) || null : null,
}

/**
 * Event names written on the socket
 * @type {Record<string, string>}
 */

export const RECRUITMENT_STREAM_EVENTS = {
  // One candidate moved, read it again
  candidate: 'candidate',
  // One candidate dropped
  removed: 'removed',
  // One answer noted, carried whole
  answer: 'answer',
  // The session itself moved, read the page again
  session: 'session',
} as const
