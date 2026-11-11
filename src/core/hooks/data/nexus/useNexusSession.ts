'use client'

import { useCallback, useEffect, useState } from 'react'

import { apiGet } from '@/core/lib/api/client'
import { NEXUS_PATHS } from '@/declarations/nexus/paths'
import { NEXUS_WINDOW } from '@/declarations/nexus/window'
import type { NexusSessionView, NexusStage } from '@/types/nexus'

/**
 * Stage of a session at a given time
 * @param {NexusSessionView | null} session - Session read
 * @param {number} now - Current time in ms
 * @return {NexusStage} - Stage
 */

export const stageOf = (session: NexusSessionView | null, now: number): NexusStage => {
  if (!session) return 'loading'
  if (!session.unlocked) return 'locked'
  if (session.dangerUntil && Date.parse(session.dangerUntil) > now) return 'danger'
  if (session.writeUntil && Date.parse(session.writeUntil) > now) return 'write'

  return 'read'
}

/**
 * Console session, read once open and then on a slow beat
 * @param {boolean} isOpen - Window is open
 * @return {{ session: NexusSessionView | null, stage: NexusStage, refresh: () => Promise<void> }} - Session and refresh
 */

export const useNexusSession = (isOpen: boolean) => {
  const [session, setSession] = useState<NexusSessionView | null>(null)
  const [now, setNow] = useState(() => Date.now())

  const refresh = useCallback(
    () =>
      apiGet<NexusSessionView>(NEXUS_PATHS.session)
        .catch((): NexusSessionView => ({ unlocked: false }))
        .then((view) => {
          setSession(view)
          setNow(Date.now())
        }),
    []
  )

  // Only while the window is open
  useEffect(() => {
    if (!isOpen) return
    void refresh()
    const timer = setInterval(() => void refresh(), NEXUS_WINDOW.pollSeconds * 1000)

    return () => clearInterval(timer)
  }, [isOpen, refresh])

  return { session, stage: stageOf(session, now), refresh }
}
