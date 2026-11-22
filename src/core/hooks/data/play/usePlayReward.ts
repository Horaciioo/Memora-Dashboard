'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { claimTrophyCheersAction } from '@/app/(dashboard)/play/actions'
import { apiGet } from '@/core/lib/api/client'
import { usePlayCelebrationStore } from '@/core/store/play/playCelebration'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayProfileView } from '@/types/play'

// Profile check rate
const POLL_MS = 5000

// How long a reward stays on screen
const SHOWN_MS = 5800

export interface PlayReward {
  id: number
  gain: number
}

/**
 * XP and levels won since the room opened
 * @param {PlayProfileView} profile - Profile at page load
 * @return {PlayReward | null} - Reward on screen
 */

export const usePlayReward = (profile: PlayProfileView): PlayReward | null => {
  const { data } = useQuery({
    queryKey: QUERY_KEYS.playProfile,
    queryFn: ({ signal }) => apiGet<PlayProfileView>(API_ROUTES.playProfile, signal),
    initialData: profile,
    refetchInterval: POLL_MS,
    staleTime: 0,
  })
  const known = useRef({ xp: profile.global.xp, level: profile.global.level.level })
  const [reward, setReward] = useState<PlayReward | null>(null)
  const fire = usePlayCelebrationStore((state) => state.fire)

  // Compare with the last standing
  useEffect(() => {
    const { xp, level } = data.global
    const gain = xp - known.current.xp
    const climbed = level.level > known.current.level
    known.current = { xp, level: level.level }
    if (gain > 0) setReward({ id: performance.now(), gain })
    if (climbed) fire({ kind: 'level', level: level.level })
  }, [data, fire])

  // Trophies not cheered yet, at the first visit then whenever XP moves
  const isClaiming = useRef(false)
  const xp = data.global.xp
  useEffect(() => {
    if (isClaiming.current) return
    isClaiming.current = true
    void claimTrophyCheersAction()
      .then((trophies) =>
        trophies.forEach(({ label, goal, icon, rarity }) =>
          fire({ kind: 'trophy', label, goal, icon, rarity })
        )
      )
      .finally(() => {
        isClaiming.current = false
      })
  }, [xp, fire])

  // Gone after a moment
  useEffect(() => {
    if (!reward) return
    const timer = window.setTimeout(() => setReward(null), SHOWN_MS)

    return () => window.clearTimeout(timer)
  }, [reward])

  return reward
}
