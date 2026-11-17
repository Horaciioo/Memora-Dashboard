import 'server-only'

import { prisma } from '@/core/lib/db'
import { invalidInput } from '@/core/lib/errors'
import { membersOf } from '@/core/lib/realtime/members'
import { touchPlaySeen } from '@/core/services/play/SeenService'
import { eventFrame } from '@/core/lib/realtime/server/frames'
import type { RealtimeConnection, RealtimeRequest } from '@/core/lib/realtime/server/types'
import { PLAY_TOPICS } from '@/declarations/play/topics'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_EVENTS, REALTIME_OPS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { PresenceMember, PresenceSeat, PresenceState } from '@/types/presence'
import { Availabilities } from '@/utils/constants/availability'
import type { AvailabilityName } from '@/utils/constants/availability'
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
  presenceHidden?: Set<string>
  presenceKnown?: Set<string>
}

const rooms = (globalForPresence.presenceRooms ??= new Map())
// Members showing offline, and members already read
const hidden = (globalForPresence.presenceHidden ??= new Set())
const known = (globalForPresence.presenceKnown ??= new Set())

/**
 * Seats and departures a room shows
 * @param {string} topic - Room
 * @param {PresenceRoom} room - Room
 * @return {PresenceMember[]} - Members
 */

const shownMembers = (topic: string, room: PresenceRoom): PresenceMember[] => {
  // A game needs its seated players, shown or not
  const isShown = (accountId: string) =>
    PLAY_TOPICS.sessionIdOf(topic) !== null || !hidden.has(accountId)

  return membersOf(
    [...room.seats.values()].filter((seat) => isShown(seat.accountId)),
    [...room.departed.values()].filter((member) => isShown(member.accountId))
  )
}

/**
 * Send the room to every seat
 * @param {string} topic - Room
 * @return {void}
 */

const broadcast = (topic: string): void => {
  const room = rooms.get(topic)
  if (!room) return
  room.flush = null
  const members = shownMembers(topic, room)
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
  if (!isStill) {
    room.departed.set(seat.accountId, { ...seat, status: 'left', at: Date.now() })
    // Play remembers when a member left it
    if (topic === PLAY_TOPICS.lobbies) void touchPlaySeen(seat.accountId).catch(() => undefined)
  }
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
 * Show or hide a member in every room
 * @param {string} accountId - Member
 * @param {AvailabilityName} choice - Chosen availability
 * @return {void}
 */

export const applyAvailability = (accountId: string, choice: AvailabilityName): void => {
  known.add(accountId)
  if (choice === Availabilities.Online) hidden.delete(accountId)
  else hidden.add(accountId)

  for (const [topic, room] of rooms) {
    const isIn =
      room.departed.has(accountId) ||
      [...room.seats.values()].some((seat) => seat.accountId === accountId)
    if (isIn) schedule(topic)
  }
}

/**
 * Read a member's choice once
 * @param {string} accountId - Member
 * @return {void}
 */

const learnAvailability = (accountId: string): void => {
  if (known.has(accountId)) return
  known.add(accountId)
  void prisma.account
    .findUnique({ where: { id: accountId }, select: { availability: true } })
    .then((account) => {
      if (account) applyAvailability(accountId, account.availability)
    })
    .catch(() => known.delete(accountId))
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
  learnAvailability(session.id)
  room.seats.set(connection, {
    accountId: session.id,
    name: session.displayName,
    image: session.avatarUrl,
    activity: 'active',
    place: null,
    at: Date.now(),
    seenAt: Date.now(),
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

    // Idle reports keep the moment activity stopped
    const now = Date.now()
    if (seat.activity === 'active' || state.activity === 'active') seat.seenAt = now
    Object.assign(seat, state, { at: now })
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

  return room ? shownMembers(topic, room) : []
}

/**
 * Seats open in this process
 * @return {number} - Seats
 */

export const presenceSeatCount = (): number =>
  [...rooms.values()].reduce((total, room) => total + room.seats.size, 0)
