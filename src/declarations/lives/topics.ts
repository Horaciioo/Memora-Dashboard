/**
 * Topics of the live bus
 * @type {{ lives: string, channel: string, live: (id: string) => string, room: (id: string) => string, connection: (id: string) => string }}
 */

export const LIVE_TOPICS = {
  // Status of every live
  lives: 'lives',
  // Redis channel every instance shares
  channel: 'lives:bus',
  live: (id: string) => `live:${id}`,
  // Chat memory of a live
  room: (id: string) => `live:${id}:room`,
  // Platform connection of a live
  connection: (id: string) => `live:${id}:connection`,
}

/**
 * Event names written on the stream
 * @type {Record<string, string>}
 */

export const LIVE_STREAM_EVENTS = {
  status: 'status',
  // One flush of Mod View events
  batch: 'batch',
  // Platform connection of a live
  connection: 'connection',
} as const
