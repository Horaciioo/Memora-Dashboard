'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

import { usePresenceActivity } from '@/core/hooks/data/realtime/usePresenceActivity'
import { useAuthContext } from '@/managers/infrastructure/Security/AuthManager'
import {
  isRealtimeOpen,
  listenRealtime,
  requestRealtime,
  watchRealtime,
} from '@/core/lib/realtime/socket'
import { REALTIME_EVENTS, REALTIME_OPS, REALTIME_SETTINGS } from '@/declarations/system/realtime'
import type { PresenceMember } from '@/types/presence'
import { SECOND_MS } from '@/utils/constants/time'

/**
 * Who else stands in a room
 * @typedef {Object} PresenceView
 * @property {PresenceMember[]} members - Other members
 * @property {boolean} isLive - Socket open
 * @property {boolean} isDown - Socket lost for a while
 * @property {boolean} isReady - Room snapshot heard
 */

export interface PresenceView {
  members: PresenceMember[]
  isLive: boolean
  isDown: boolean
  isReady: boolean
}

// Server rendering never holds a socket
const isClosedOnServer = () => false

/**
 * Seat this tab in a room and read who else is there
 * @param {string} topic - Room
 * @param {string | null} place - Where this tab is
 * @return {PresenceView} - Room view
 */

export const usePresence = (topic: string, place: string | null): PresenceView => {
  const accountId = useAuthContext().session?.id
  const activity = usePresenceActivity()
  const isLive = useSyncExternalStore(watchRealtime, isRealtimeOpen, isClosedOnServer)
  // Snapshot of its own room, none before the first
  const [snapshot, setSnapshot] = useState<{ topic: string; members: PresenceMember[] } | null>(
    null
  )
  const [isDown, setDown] = useState(false)
  const reported = useRef({ activity, place })
  // First snapshot after an open reports again
  const isSeatPending = useRef(true)

  const send = useCallback(() => {
    void requestRealtime(REALTIME_OPS.presenceSet, { t: topic, ...reported.current }).catch(
      () => undefined
    )
  }, [topic])

  // Room snapshots
  useEffect(() => {
    isSeatPending.current = true

    return listenRealtime(topic, (event, data) => {
      if (event !== REALTIME_EVENTS.presence) return
      setSnapshot({
        topic,
        members: (data as { members?: PresenceMember[] } | null)?.members ?? [],
      })
      if (!isSeatPending.current) return
      isSeatPending.current = false
      send()
    })
  }, [topic, send])

  // Report changes, bursts merged
  useEffect(() => {
    reported.current = { activity, place }
    if (!isLive) return
    const timer = window.setTimeout(send, REALTIME_SETTINGS.presenceFlushMs)

    return () => window.clearTimeout(timer)
  }, [activity, place, isLive, send])

  // Beat, reopen, grace before down
  useEffect(() => {
    if (!isLive) {
      const timer = window.setTimeout(() => setDown(true), REALTIME_SETTINGS.reconnectMaxMs * 2)

      return () => {
        window.clearTimeout(timer)
        setDown(false)
      }
    }
    isSeatPending.current = true
    const beat = window.setInterval(send, REALTIME_SETTINGS.presenceBeatSeconds * SECOND_MS)

    return () => window.clearInterval(beat)
  }, [isLive, send])

  const members = snapshot?.topic === topic ? snapshot.members : null
  const others = useMemo(
    () => (members ?? []).filter((member) => member.accountId !== accountId),
    [members, accountId]
  )

  return { members: others, isLive, isDown, isReady: isLive && members !== null }
}
