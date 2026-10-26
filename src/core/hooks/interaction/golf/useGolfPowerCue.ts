'use client'

import { useEffect, useRef, useState } from 'react'

import { useServerNow } from '@/core/hooks/interaction/state/useServerNow'
import { activePowers } from '@/core/lib/play/golf'
import type { GolfPlayerState } from '@/core/lib/play/golf'
import { GOLF_SCENE } from '@/declarations/play/golf/scene'
import type { GolfPowerName } from '@/utils/constants/play'

export type GolfCueKind = 'gained' | 'used' | 'ended'

export interface GolfCue {
  power: GolfPowerName
  kind: GolfCueKind
  // Changes with every cue, restarts the animation
  at: number
}

/**
 * Cue for the own power: picked up, played or worn out
 * @param {GolfPlayerState | undefined} me - Own ball
 * @param {number} serverTime - Server ms of the board
 * @return {GolfCue | null} - Cue on screen
 */

export const useGolfPowerCue = (
  me: GolfPlayerState | undefined,
  serverTime: number
): GolfCue | null => {
  const [cue, setCue] = useState<GolfCue | null>(null)
  const now = useServerNow(new Date(serverTime))
  const hand = me?.hand ?? []
  const worn = [...activePowers(me?.effects ?? [], now)]
  const before = useRef<{ hand: GolfPowerName[]; worn: GolfPowerName[] } | null>(null)

  // Compare with the last render
  useEffect(() => {
    const last = before.current
    before.current = { hand: hand as GolfPowerName[], worn }
    if (!last) return
    const gained = hand.find(
      (power) => hand.length > last.hand.length && !last.hand.includes(power as GolfPowerName)
    )
    const used = last.hand.find((power) => last.hand.length > hand.length && !hand.includes(power))
    const ended = last.worn.find((power) => !worn.includes(power))
    const next: [GolfCueKind, string | undefined][] = [
      ['gained', gained],
      ['used', used],
      ['ended', ended],
    ]
    const found = next.find(([, power]) => power)
    if (found) setCue({ kind: found[0], power: found[1] as GolfPowerName, at: performance.now() })
    // Compared once per change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hand.join(), worn.join()])

  // Gone after a moment
  useEffect(() => {
    if (!cue) return
    const timer = window.setTimeout(() => setCue(null), GOLF_SCENE.cueMs)

    return () => window.clearTimeout(timer)
  }, [cue])

  return cue
}
