import * as Y from 'yjs'
import type { Awareness } from 'y-protocols/awareness'
import {
  applyAwarenessUpdate,
  encodeAwarenessUpdate,
  removeAwarenessStates,
} from 'y-protocols/awareness'

import { ApiClientError } from '@/core/lib/api/client'
import { fromBase64, toBase64 } from '@/core/lib/realtime/codec'
import {
  isRealtimeOpen,
  listenRealtime,
  requestRealtime,
  watchRealtime,
} from '@/core/lib/realtime/socket'
import { REALTIME_EVENTS, REALTIME_OPS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import { ErrorCodes } from '@/utils/constants/errors'

/**
 * Where local changes stand
 * @type {'saved' | 'pending' | 'saving' | 'offline' | 'failed'}
 */

export type DocLinkStatus = 'saved' | 'pending' | 'saving' | 'offline' | 'failed'

/**
 * Answer of a sync request
 * @typedef {Object} SyncAnswer
 */

interface SyncAnswer {
  u: string
  sv: string
  a: string | null
}

// Encoded update holding nothing
const EMPTY_UPDATE_BYTES = 2

/**
 * Bind a shared document to its socket topic
 * @param {Object} input - Link
 * @param {string} input.topic - Room topic
 * @param {Y.Doc} input.doc - Document
 * @param {Awareness} input.awareness - Carets
 * @param {boolean} input.canWrite - Sends its changes
 * @param {(status: DocLinkStatus) => void} input.onStatus - Status changes
 * @param {() => void} [input.onSynced] - Server state merged
 * @return {() => void} - Unlinks
 */

export const linkDoc = ({
  topic,
  doc,
  awareness,
  canWrite,
  onStatus,
  onSynced = () => undefined,
}: {
  topic: string
  doc: Y.Doc
  awareness: Awareness
  canWrite: boolean
  onStatus: (status: DocLinkStatus) => void
  onSynced?: () => void
}): (() => void) => {
  // Origin of what the server sent
  const remote = { topic }
  const state = { pending: [] as Uint8Array[], inFlight: 0, isSynced: false, isFailed: false }
  let batch: ReturnType<typeof setTimeout> | null = null
  let caret: ReturnType<typeof setTimeout> | null = null

  const report = () => {
    const hasWork = state.pending.length > 0 || state.inFlight > 0
    if (state.isFailed) return onStatus('failed')
    if (!isRealtimeOpen() && hasWork) return onStatus('offline')
    onStatus(state.inFlight ? 'saving' : state.pending.length ? 'pending' : 'saved')
  }

  // Keystrokes merged into one frame
  const flush = () => {
    batch = null
    if (!state.pending.length || !state.isSynced) return report()
    const update = Y.mergeUpdates(state.pending)
    state.pending = []
    state.inFlight += 1
    report()
    requestRealtime(REALTIME_OPS.docUpdate, { t: topic, u: toBase64(update) }).then(
      () => {
        state.inFlight -= 1
        report()
      },
      (error: unknown) => {
        state.inFlight -= 1
        state.pending.unshift(update)
        state.isFailed =
          error instanceof ApiClientError && error.code === ErrorCodes.InsufficientPermissions
        report()
      }
    )
  }

  const sendCaret = () => {
    caret = null
    if (!state.isSynced) return
    const a = toBase64(encodeAwarenessUpdate(awareness, [doc.clientID]))
    void requestRealtime(REALTIME_OPS.docAware, { t: topic, a }).catch(() => undefined)
  }

  // Server state in, local gap out
  const sync = async () => {
    const vector = toBase64(Y.encodeStateVector(doc))
    const answer = await requestRealtime<SyncAnswer>(REALTIME_OPS.docSync, { t: topic, sv: vector })
    Y.applyUpdate(doc, fromBase64(answer.u), remote)
    if (answer.a) applyAwarenessUpdate(awareness, fromBase64(answer.a), remote)
    state.isSynced = true
    state.isFailed = false
    onSynced()
    if (canWrite) {
      const gap = Y.encodeStateAsUpdate(doc, fromBase64(answer.sv))
      state.pending = gap.length > EMPTY_UPDATE_BYTES ? [gap] : []
      flush()
    }
    sendCaret()
  }
  const trySync = () => void sync().catch(report)

  const onUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === remote || !canWrite) return
    state.pending.push(update)
    batch ??= setTimeout(flush, REALTIME_SETTINGS.docBatchMs)
    report()
  }
  const onCaret = (_changes: unknown, origin: unknown) => {
    if (origin !== remote) caret ??= setTimeout(sendCaret, REALTIME_SETTINGS.docAwareMs)
  }
  doc.on('update', onUpdate)
  awareness.on('update', onCaret)

  const reactions: Record<string, (data: Record<string, string>) => void> = {
    [REALTIME_EVENTS.docReady]: trySync,
    [REALTIME_EVENTS.doc]: ({ u }) => u && Y.applyUpdate(doc, fromBase64(u), remote),
    [REALTIME_EVENTS.aware]: ({ a }) => a && applyAwarenessUpdate(awareness, fromBase64(a), remote),
  }
  const stopTopic = listenRealtime(topic, (event, data) =>
    reactions[event]?.((data ?? {}) as Record<string, string>)
  )
  // A drop waits for the next seat
  const stopWatch = watchRealtime(() => {
    if (!isRealtimeOpen()) state.isSynced = false
    report()
  })
  // Topic already open elsewhere
  if (isRealtimeOpen()) trySync()

  return () => {
    if (batch) clearTimeout(batch)
    flush()
    // Peers drop this caret, a relink keeps it
    const kept = awareness.getLocalState()
    removeAwarenessStates(awareness, [doc.clientID], 'local')
    if (caret) clearTimeout(caret)
    sendCaret()
    doc.off('update', onUpdate)
    awareness.off('update', onCaret)
    stopWatch()
    stopTopic()
    if (kept) awareness.setLocalState(kept)
  }
}
