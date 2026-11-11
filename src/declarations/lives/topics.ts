/**
 * Topics of the live bus
 * @type {{ lives: string, channel: string, live: (id: string) => string, room: (id: string) => string, connection: (id: string) => string, team: (id: string) => string, teamLiveIdOf: (topic: string) => string | null, privateRoom: (id: string, scope: string) => string, scopedOf: (topic: string) => { liveId: string, scope: string } | null }}
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
  // Instance that watches the lives
  watchLease: 'lives:watcher',
  // Internal chat of a live
  team: (id: string) => `live:${id}:team`,
  teamLiveIdOf: (topic: string): string | null => /^live:([^:]+):team$/.exec(topic)?.[1] ?? null,
  // Private room of the internal chat, referents or responsables
  privateRoom: (id: string, scope: string) => `live:${id}:team:${scope}`,
  scopedOf: (topic: string): { liveId: string; scope: string } | null => {
    const found = /^live:([^:]+):team:([a-z]+)$/.exec(topic)

    return found ? { liveId: found[1], scope: found[2] } : null
  },
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
