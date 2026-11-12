'use client'

import { useEffect, useRef } from 'react'

import { playNaval, preloadNavalSounds } from '@/composites/play/naval/sound'
import type { NavalCallout } from '@/composites/play/naval/fx/useNavalDirector'

/**
 * The bell when the turn comes round and when a captain goes down
 * @param {Object} input - Table
 * @param {boolean} input.isMyTurn - The viewer may fire
 * @param {NavalCallout | null} input.callout - Last strike shown
 * @param {number} input.viewer - Seat of the viewer
 * @return {void}
 */

export const useNavalCues = ({
  isMyTurn,
  callout,
  viewer,
}: {
  isMyTurn: boolean
  callout: NavalCallout | null
  viewer: number
}): void => {
  const wasMine = useRef(false)

  // Files fetched ahead
  useEffect(() => preloadNavalSounds(), [])

  // Bell once, when the turn comes round
  useEffect(() => {
    if (isMyTurn && !wasMine.current) playNaval('bell', 0.6)
    wasMine.current = isMyTurn
  }, [isMyTurn])

  // Bell for the viewer out
  const eliminatedId = callout?.isEliminated && callout.strike.target === viewer ? callout.id : 0
  useEffect(() => {
    if (eliminatedId) playNaval('bell')
  }, [eliminatedId])
}
