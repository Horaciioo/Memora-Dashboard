import 'server-only'

import { invalidInput } from '@/core/lib/errors'
import { membersOf } from '@/core/lib/realtime/members'
import { eventFrame } from '@/core/lib/realtime/server/frames'
import type { RealtimeConnection, RealtimeRequest } from '@/core/lib/realtime/server/types'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_EVENTS, REALTIME_OPS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { PresenceMember, PresenceSeat, PresenceState } from '@/types/presence'
import { SECOND_MS } from '@/utils/constants/time'

// Longest place accepted
const MAX_PLACE_LENGTH = 160

/**
 * Who stands in one topic, memory only
 * @typedef {Object} PresenceRoom
 */

interface PresenceRoom {
  seats: Map<RealtimeConnection, PresenceSeat>
  departed: Map<string, PresenceMember>
  flush: ReturnType<typeof setTimeout> | null
}

// Survives dev hot reloads
const globalForPresence = globalThis as unknown as {
  presenceRooms?: Map<string, PresenceRoom>
  presenceSweep?: ReturnType<typeof setInterval>
}

const rooms = (globalForPresence.presenceRooms ??= new Map())

/**
 * Send the room to every seat
 * @param {string} topic - Room
 * @return {void}
 */

const broadcast = (topic: string): void => {
  const room = rooms.get(topic)
  if (!room) return
  room.flush = null
  const members = membersOf([...room.seats.values()], [...room.departed.values()])
  const frame = eventFrame(topic, REALTIME_EVENTS.presence, { members })
  for (const connection of room.seats.keys()) connection.send(frame)
  if (!room.seats.size && !room.departed.size) rooms.delete(topic)
}

/**
 * Merge a burst into one broadcast
 * @param {string} topic - Room
 * @return {void}
 */

const schedule = (topic: string): void => {
  const room = rooms.get(topic)
  if (room && !room.flush)
    room.flush = setTimeout(() => broadcast(topic), REALTIME_SETTINGS.presenceFlushMs)
}

/**
 * Seat removal, faded once the last tab goes
 * @param {string} topic - Room
 * @param {RealtimeConnection} connection - Socket
 * @return {void}
 */

const leave = (topic: string, connection: RealtimeConnection): void => {
  const room = rooms.get(topic)
  const seat = room?.seats.get(connection)
  if (!room || !seat) return
  room.seats.delete(connection)

  // Other tabs of the member keep them in
  const isStill = [...room.seats.values()].some((other) => other.accountId === seat.accountId)
  if (!isStill) room.departed.set(seat.accountId, { ...seat, status: 'left', at: Date.now() })
  schedule(topic)
}

/**
 * Drop silent seats and old departures
 * @return {void}
 */

const sweep = (): void => {
  const now = Date.now()
  const staleBefore = now - REALTIME_SETTINGS.presenceStaleSeconds * SECOND_MS
  const lingerBefore = now - REALTIME_SETTINGS.presenceLingerSeconds * SECOND_MS

  for (const [topic, room] of rooms) {
    for (const [connection, seat] of room.seats) if (seat.at < staleBefore) leave(topic, connection)
    for (const [accountId, member] of room.departed) {
      if (member.at >= lingerBefore) continue
      room.departed.delete(accountId)
      schedule(topic)
    }
  }
}

/**
 * Seat a socket in a room, its access already checked
 * @param {string} topic - Room
 * @param {RealtimeConnection} connection - Socket
 * @return {() => void} - Leaves
 */

export const joinPresence = (topic: string, connection: RealtimeConnection): (() => void) => {
  globalForPresence.presenceSweep ??= setInterval(
    sweep,
    REALTIME_SETTINGS.presenceSweepSeconds * SECOND_MS
  )
  globalForPresence.presenceSweep.unref?.()

  const room: PresenceRoom = rooms.get(topic) ?? {
    seats: new Map(),
    departed: new Map(),
    flush: null,
  }
  rooms.set(topic, room)
  const { session } = connection
  room.seats.set(connection, {
    accountId: session.id,
    name: session.displayName,
    image: session.avatarUrl,
    activity: 'active',
    place: null,
    at: Date.now(),
  })
  room.departed.delete(session.id)
  schedule(topic)

  return () => leave(topic, connection)
}

/**
 * Read a reported state
 * @param {unknown} data - Raw body
 * @return {{ topic: string, state: PresenceState }} - Checked report
 */

const readReport = (data: unknown): { topic: string; state: PresenceState } => {
  const raw = (data ?? {}) as Record<string, unknown>
  const place = raw.place
  const isPlace = place === null || (typeof place === 'string' && place.length <= MAX_PLACE_LENGTH)
  if (
    typeof raw.t !== 'string' ||
    (raw.activity !== 'active' && raw.activity !== 'idle') ||
    !isPlace
  ) {
    throw invalidInput([{ field: 'presence', message: PRESENCE_COPY.invalid }])
  }

  return { topic: raw.t, state: { activity: raw.activity, place: place as string | null } }
}

/**
 * Presence requests, a seat is the authorisation
 * @type {Record<string, RealtimeRequest>}
 */

export const PRESENCE_REALTIME_REQUESTS: Record<string, RealtimeRequest> = {
  [REALTIME_OPS.presenceSet]: async (_session, data, connection) => {
    const { topic, state } = readReport(data)
    const seat = rooms.get(topic)?.seats.get(connection)
    // Not seated yet, the next beat retries
    if (!seat) return { isSeated: false }

    Object.assign(seat, state, { at: Date.now() })
    schedule(topic)

    return { isSeated: true }
  },
}

/**
 * Members of a room right now
 * @param {string} topic - Room
 * @return {PresenceMember[]} - Members
 */

export const presenceOf = (topic: string): PresenceMember[] => {
  const room = rooms.get(topic)

  return room ? membersOf([...room.seats.values()], [...room.departed.values()]) : []
}

/**
 * Seats open in this process
 * @return {number} - Seats
 */

export const presenceSeatCount = (): number =>
  [...rooms.values()].reduce((total, room) => total + room.seats.size, 0)
