/**
 * Topics of the live bus
 * @type {{ lives: string, channel: string, live: (id: string) => string, recent: (id: string) => string, connection: (id: string) => string }}
 */

export const LIVE_TOPICS = {
  // Status of every live
  lives: 'lives',
  // Redis channel every instance shares
  channel: 'lives:bus',
  live: (id: string) => `live:${id}`,
  // Recent Mod View events of a live
  recent: (id: string) => `live:${id}:recent`,
  // Platform connection of a live
  connection: (id: string) => `live:${id}:connection`,
}

/**
 * Event names written on the stream
 * @type {Record<string, string>}
 */

export const LIVE_STREAM_EVENTS = {
  status: 'status',
  // One Mod View event of a live
  scene: 'scene',
  // Platform connection of a live
  connection: 'connection',
} as const
