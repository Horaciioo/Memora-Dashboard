/**
 * Topics of the live bus
 * @type {{ lives: string, channel: string, live: (id: string) => string }}
 */

export const LIVE_TOPICS = {
  // Status of every live, read by the rail and the home
  lives: 'lives',
  // Redis channel every instance shares
  channel: 'lives:bus',
  live: (id: string) => `live:${id}`,
}

/**
 * Event names written on the stream
 * @type {Record<string, string>}
 */

export const LIVE_STREAM_EVENTS = {
  status: 'status',
} as const
