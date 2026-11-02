import 'server-only'

import * as Y from 'yjs'
import {
  Awareness,
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness'

import { forbidden, invalidInput } from '@/core/lib/errors'
import { logger } from '@/core/lib/logger'
import { fromBase64, toBase64 } from '@/core/lib/realtime/codec'
import { eventFrame } from '@/core/lib/realtime/server/frames'
import type { RealtimeConnection, RealtimeRequest } from '@/core/lib/realtime/server/types'
import { PRESENCE_COPY } from '@/declarations/system/presence'
import { REALTIME_EVENTS, REALTIME_OPS, REALTIME_SETTINGS } from '@/declarations/system/realtime'

/**
 * Where a shared document lives
 * @typedef {Object} DocStore
 * @property {() => Promise<Uint8Array>} load - Stored state
 * @property {(doc: Y.Doc, editorIds: string[]) => Promise<void>} save - Write it back
 */

export interface DocStore {
  load: () => Promise<Uint8Array>
  save: (doc: Y.Doc, editorIds: string[]) => Promise<void>
}

/**
 * One socket on a document
 * @typedef {Object} DocSeat
 */

interface DocSeat {
  canWrite: boolean
  // Awareness clients this socket speaks for
  clientIds: Set<number>
}

/**
 * Document open in memory while someone reads it
 * @typedef {Object} DocRoom
 */

interface DocRoom {
  doc: Y.Doc
  awareness: Awareness
  seats: Map<RealtimeConnection, DocSeat>
  store: DocStore
  editors: Set<string>
  dirtySince: number | null
  timer: ReturnType<typeof setTimeout> | null
  saving: Promise<void>
}

// Survives dev hot reloads
const globalForDocs = globalThis as unknown as {
  docRooms?: Map<string, DocRoom>
  docLoads?: Map<string, Promise<DocRoom>>
}

const rooms = (globalForDocs.docRooms ??= new Map())
const loads = (globalForDocs.docLoads ??= new Map())

/**
 * Same frame to every other seat
 * @param {DocRoom} room - Room
 * @param {string} frame - Ready frame
 * @param {unknown} except - Origin left out
 * @return {void}
 */

const broadcast = (room: DocRoom, frame: string, except: unknown): void => {
  for (const connection of room.seats.keys()) if (connection !== except) connection.send(frame)
}

/**
 * Write the document, one write at a time
 * @param {DocRoom} room - Room
 * @param {string} topic - Room topic
 * @return {Promise<void>} - Written
 */

const persist = (room: DocRoom, topic: string): Promise<void> => {
  if (room.timer) clearTimeout(room.timer)
  room.timer = null
  if (room.dirtySince === null) return room.saving

  room.dirtySince = null
  const editors = [...room.editors]
  room.editors.clear()
  room.saving = room.saving
    .then(async () => {
      const startedAt = performance.now()
      await room.store.save(room.doc, editors)
      const elapsed = Math.round(performance.now() - startedAt)
      if (elapsed > REALTIME_SETTINGS.slowSaveMs)
        logger.warn(`[realtime] ${topic} saved in ${elapsed}ms`)
    })
    .catch((error: unknown) => logger.error(`[realtime] ${topic} not saved`, error))

  return room.saving
}

/**
 * Debounced write, never later than the cap
 * @param {DocRoom} room - Room
 * @param {string} topic - Room topic
 * @return {void}
 */

const schedule = (room: DocRoom, topic: string): void => {
  const now = Date.now()
  room.dirtySince ??= now
  if (room.timer) clearTimeout(room.timer)
  const cap = room.dirtySince + REALTIME_SETTINGS.docPersistMaxMs - now
  room.timer = setTimeout(
    () => void persist(room, topic),
    Math.max(0, Math.min(REALTIME_SETTINGS.docPersistMs, cap))
  )
}

/**
 * Load a document once, however many open it together
 * @param {string} topic - Room topic
 * @param {DocStore} store - Storage
 * @return {Promise<DocRoom>} - Room
 */

const openRoom = (topic: string, store: DocStore): Promise<DocRoom> => {
  const known = rooms.get(topic)
  if (known) return Promise.resolve(known)

  const pending =
    loads.get(topic) ??
    store.load().then((state) => {
      const doc = new Y.Doc({ gc: true })
      Y.applyUpdate(doc, state)
      const awareness = new Awareness(doc)
      awareness.setLocalState(null)
      const room: DocRoom = {
        doc,
        awareness,
        seats: new Map(),
        store,
        editors: new Set(),
        dirtySince: null,
        timer: null,
        saving: Promise.resolve(),
      }

      // Changes go out at once, the database later
      doc.on('update', (update: Uint8Array, origin: unknown) => {
        broadcast(room, eventFrame(topic, REALTIME_EVENTS.doc, { u: toBase64(update) }), origin)
        const seat = room.seats.get(origin as RealtimeConnection)
        if (seat) room.editors.add((origin as RealtimeConnection).session.id)
        schedule(room, topic)
      })

      // Carets relayed, owners tracked
      awareness.on(
        'update',
        (changes: Record<'added' | 'updated' | 'removed', number[]>, origin: unknown) => {
          const seat = room.seats.get(origin as RealtimeConnection)
          for (const id of changes.added) seat?.clientIds.add(id)
          for (const id of changes.removed) seat?.clientIds.delete(id)
          const changed = [...changes.added, ...changes.updated, ...changes.removed]
          const a = toBase64(encodeAwarenessUpdate(awareness, changed))
          broadcast(room, eventFrame(topic, REALTIME_EVENTS.aware, { a }), origin)
        }
      )

      rooms.set(topic, room)
      loads.delete(topic)

      return room
    })
  loads.set(topic, pending)
  pending.catch(() => loads.delete(topic))

  return pending
}

/**
 * Free a document nobody reads
 * @param {DocRoom} room - Room
 * @param {string} topic - Room topic
 * @return {void}
 */

const unloadIfAlone = (room: DocRoom, topic: string): void => {
  if (room.seats.size || rooms.get(topic) !== room) return
  rooms.delete(topic)
  room.awareness.destroy()
  room.doc.destroy()
}

/**
 * Seat removal, document written and freed once alone
 * @param {string} topic - Room topic
 * @param {RealtimeConnection} connection - Socket
 * @return {Promise<void>} - Left
 */

const leaveDoc = async (topic: string, connection: RealtimeConnection): Promise<void> => {
  const room = rooms.get(topic)
  const seat = room?.seats.get(connection)
  if (!room || !seat) return

  // Its carets vanish for the others
  if (seat.clientIds.size) removeAwarenessStates(room.awareness, [...seat.clientIds], connection)
  room.seats.delete(connection)
  if (room.seats.size) return

  await persist(room, topic)
  unloadIfAlone(room, topic)
}

/**
 * Seat a socket on a shared document, its access already checked
 * @param {string} topic - Room topic
 * @param {RealtimeConnection} connection - Socket
 * @param {Object} options - Seat
 * @param {boolean} options.canWrite - May change it
 * @param {DocStore} options.store - Storage
 * @return {Promise<() => void>} - Leaves
 */

export const joinDoc = async (
  topic: string,
  connection: RealtimeConnection,
  { canWrite, store }: { canWrite: boolean; store: DocStore }
): Promise<() => void> => {
  const room = await openRoom(topic, store)
  room.seats.set(connection, { canWrite, clientIds: new Set() })
  // Seated, the tab may sync now
  connection.send(eventFrame(topic, REALTIME_EVENTS.docReady, null))

  return () => void leaveDoc(topic, connection)
}

/**
 * Change what a seated socket may do
 * @param {string} topic - Room topic
 * @param {RealtimeConnection} connection - Socket
 * @param {boolean} canWrite - May change it
 * @return {void}
 */

export const setDocWrite = (
  topic: string,
  connection: RealtimeConnection,
  canWrite: boolean
): void => {
  const seat = rooms.get(topic)?.seats.get(connection)
  if (seat) seat.canWrite = canWrite
}

/**
 * Seat of a socket on a document, refused when missing
 * @param {unknown} data - Raw body
 * @param {RealtimeConnection} connection - Socket
 * @return {{ room: DocRoom, seat: DocSeat, body: Record<string, unknown> }} - Seat
 */

const seatOf = (data: unknown, connection: RealtimeConnection) => {
  const body = (data ?? {}) as Record<string, unknown>
  const room = typeof body.t === 'string' ? rooms.get(body.t) : undefined
  const seat = room?.seats.get(connection)
  if (!room || !seat) throw forbidden()

  return { room, seat, body }
}

/**
 * Bytes of a body field, bounded
 * @param {unknown} value - Base64 field
 * @return {Uint8Array} - Bytes
 */

const bytesOf = (value: unknown): Uint8Array => {
  const limit = REALTIME_SETTINGS.docUpdateMaxKilobytes * 1024
  if (typeof value !== 'string' || value.length > (limit * 4) / 3) {
    throw invalidInput([{ field: 'doc', message: PRESENCE_COPY.invalidChange }])
  }

  return fromBase64(value)
}

/**
 * Shared document requests, a seat is the authorisation
 * @type {Record<string, RealtimeRequest>}
 */

export const DOC_REALTIME_REQUESTS: Record<string, RealtimeRequest> = {
  // What the tab misses, what the server holds
  [REALTIME_OPS.docSync]: async (_session, data, connection) => {
    const { room, body } = seatOf(data, connection)
    const vector = typeof body.sv === 'string' ? fromBase64(body.sv) : undefined
    const clients = [...room.awareness.getStates().keys()]

    return {
      u: toBase64(Y.encodeStateAsUpdate(room.doc, vector)),
      sv: toBase64(Y.encodeStateVector(room.doc)),
      a: clients.length ? toBase64(encodeAwarenessUpdate(room.awareness, clients)) : null,
    }
  },
  [REALTIME_OPS.docUpdate]: async (_session, data, connection) => {
    const { room, seat, body } = seatOf(data, connection)
    if (!seat.canWrite) throw forbidden()
    Y.applyUpdate(room.doc, bytesOf(body.u), connection)

    return null
  },
  [REALTIME_OPS.docAware]: async (_session, data, connection) => {
    const { room, body } = seatOf(data, connection)
    applyAwarenessUpdate(room.awareness, bytesOf(body.a), connection)

    return null
  },
}

/**
 * Change a document from the server, seats see it at once
 * @param {Object} input - Change
 * @param {string} input.topic - Room topic
 * @param {DocStore} input.store - Storage
 * @param {string} input.actorId - Member behind it
 * @param {(doc: Y.Doc) => void} input.change - Edit inside one transaction
 * @return {Promise<void>} - Written
 */

export const editDoc = async ({
  topic,
  store,
  actorId,
  change,
}: {
  topic: string
  store: DocStore
  actorId: string
  change: (doc: Y.Doc) => void
}): Promise<void> => {
  const room = await openRoom(topic, store)
  room.doc.transact(() => change(room.doc))
  room.editors.add(actorId)
  await persist(room, topic)
  unloadIfAlone(room, topic)
}

/**
 * Write every open document, on shutdown
 * @return {Promise<void>} - Written
 */

export const flushDocs = async (): Promise<void> => {
  await Promise.all([...rooms.entries()].map(([topic, room]) => persist(room, topic)))
}

/**
 * Documents open in this process
 * @return {number} - Open documents
 */

export const openDocCount = (): number => rooms.size
