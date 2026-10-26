'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/core/lib/api/client'
import { QUERY_KEYS } from '@/core/lib/api/keys'
import { API_ROUTES } from '@/core/lib/api/routes'
import type { PlayProfileView } from '@/types/play'

// Profile check rate
const POLL_MS = 5000

// How long a reward stays on screen
const SHOWN_MS = 3200

export interface PlayReward {
  id: number
  gain: number
  // Level reached, null when none
  level: number | null
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

  // Compare with the last standing
  useEffect(() => {
    const { xp, level } = data.global
    const gain = xp - known.current.xp
    const climbed = level.level > known.current.level
    known.current = { xp, level: level.level }
    if (gain > 0) setReward({ id: performance.now(), gain, level: climbed ? level.level : null })
  }, [data])

  // Gone after a moment
  useEffect(() => {
    if (!reward) return
    const timer = window.setTimeout(() => setReward(null), SHOWN_MS)

    return () => window.clearTimeout(timer)
  }, [reward])

  return reward
}
