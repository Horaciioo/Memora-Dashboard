'use client'

import { useEffect, useRef } from 'react'

import { playNaval, preloadNavalSounds, startSea } from '@/composites/play/naval/sound'
import type { NavalEvent } from '@/composites/play/naval/battle/useNavalPlayback'

/**
 * Sea bed, the bell when the turn comes round and when a captain goes down
 * @param {Object} input - Table
 * @param {boolean} input.isMyTurn - The viewer may fire
 * @param {NavalEvent | null} input.event - Last strike shown
 * @return {void}
 */

export const useNavalCues = ({
  isMyTurn,
  event,
}: {
  isMyTurn: boolean
  event: NavalEvent | null
}): void => {
  const wasMine = useRef(false)

  // Sea bed for the whole battle
  useEffect(() => {
    preloadNavalSounds()
    const sea = startSea()

    return () => sea.stop()
  }, [])

  // Bell once, when the turn comes round
  useEffect(() => {
    if (isMyTurn && !wasMine.current) playNaval('bell', 0.6)
    wasMine.current = isMyTurn
  }, [isMyTurn])

  // Bell for a captain out
  const eliminatedId = event?.isEliminated ? event.id : 0
  useEffect(() => {
    if (eliminatedId) playNaval('bell')
  }, [eliminatedId])
}
